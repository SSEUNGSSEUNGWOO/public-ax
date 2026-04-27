"""
공고 임베딩 일괄 적재 → Supabase bids.embedding 업데이트

사용:
    python embed.py                       # embedding NULL인 것만 (기본)
    python embed.py --scope active        # 마감 미경과만
    python embed.py --from-date 2025-10-29  # 특정 날짜 이후만
    python embed.py --reembed             # 기존 임베딩도 재생성
    python embed.py --limit 10            # 테스트
"""
import argparse
import os
import random
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")
load_dotenv(Path(__file__).parent.parent / ".env", override=False)

sys.path.insert(0, str(Path(__file__).parent.parent))
from shared.supabase_client import get_client

EMBED_MODEL = "text-embedding-3-small"  # 1536 dim


def build_embed_text(bid: dict) -> str:
    parts = [
        bid.get("bid_ntce_nm") or "",
        bid.get("ntce_instt_nm") or "",
        bid.get("bsns_div_nm") or "",
        bid.get("ai_category") or "",
    ]
    return " | ".join(p.strip() for p in parts if p.strip())


def embed_text(text: str, max_retries: int = 5) -> list[float] | None:
    from openai import OpenAI, RateLimitError, APIStatusError
    client = OpenAI()
    for attempt in range(max_retries):
        try:
            res = client.embeddings.create(model=EMBED_MODEL, input=text)
            return res.data[0].embedding
        except RateLimitError:
            time.sleep(min(2 ** attempt + random.uniform(0, 1), 60))
        except APIStatusError as e:
            if e.status_code in (429, 500, 502, 503, 504):
                time.sleep(min(2 ** attempt + random.uniform(0, 1), 60))
            else:
                print(f"[embed] APIStatusError: {e}")
                return None
        except Exception as e:
            print(f"[embed] 실패: {e}")
            return None
    return None


def fetch_targets(client, scope: str, reembed: bool, from_date: str | None, limit: int | None) -> list[dict]:
    today = date.today().isoformat()
    query = client.table("bids").select(
        "id, bid_ntce_nm, ntce_instt_nm, bsns_div_nm, ai_category, embedding"
    )
    if scope == "active":
        query = query.gte("bid_clse_date", today).order("bid_clse_date", desc=False)
    else:
        query = query.order("bid_ntce_date", desc=True)
    if from_date:
        query = query.gte("bid_ntce_date", from_date)
    if not reembed:
        query = query.is_("embedding", "null")

    rows: list[dict] = []
    page = 1000
    offset = 0
    while True:
        res = query.range(offset, offset + page - 1).execute()
        rows.extend(res.data or [])
        if len(res.data or []) < page:
            break
        offset += page
        if limit and len(rows) >= limit:
            break
    return rows[:limit] if limit else rows


def embed_one(bid: dict) -> tuple[dict, list[float] | None]:
    text = build_embed_text(bid)
    if not text:
        return bid, None
    return bid, embed_text(text)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--scope", choices=["active", "all"], default="all")
    parser.add_argument("--from-date", type=str, default=None)
    parser.add_argument("--reembed", action="store_true")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--workers", type=int, default=10)
    args = parser.parse_args()

    client = get_client()
    targets = fetch_targets(client, args.scope, args.reembed, args.from_date, args.limit)

    if not targets:
        print("임베딩 대상 없음")
        return

    print(f"임베딩 대상: {len(targets)}건  |  model={EMBED_MODEL}  |  workers={args.workers}")
    started = time.time()
    done = 0
    failed = 0

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(embed_one, bid) for bid in targets]
        for future in as_completed(futures):
            done += 1
            bid, vec = future.result()
            if vec is None:
                failed += 1
                continue
            client.table("bids").update({"embedding": vec}).eq("id", bid["id"]).execute()
            if done % 50 == 0 or done == len(targets):
                elapsed = time.time() - started
                rate = done / elapsed if elapsed else 0
                print(f"  [{done}/{len(targets)}] {rate:.1f}건/초")

    elapsed = time.time() - started
    print()
    print(f"=== 완료: {len(targets) - failed}/{len(targets)}건 ({elapsed:.0f}초) ===")
    if failed:
        print(f"실패: {failed}건")


if __name__ == "__main__":
    main()
