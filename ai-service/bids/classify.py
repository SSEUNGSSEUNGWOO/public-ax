"""
공고 일괄 분류 → Supabase bids.ai_category 업데이트

사용:
    # 마감 미경과 + ai_category NULL인 것만 (기본 Haiku)
    python classify.py

    # 모델 선택
    python classify.py --provider anthropic        # Claude Haiku 4.5
    python classify.py --provider openai           # gpt-4o-mini
    python classify.py --provider cli              # Claude CLI Sonnet (검증용)

    # 범위
    python classify.py --scope active              # 마감 미경과만 (기본)
    python classify.py --scope all                 # 전체 NULL인 것

    # 옵션
    python classify.py --limit 10                  # 테스트용
    python classify.py --workers 20                # 병렬 워커 수 (기본 10)
    python classify.py --reclassify                # 이미 분류된 것도 재분류
"""
import argparse
import os
import sys
import time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")
load_dotenv(Path(__file__).parent.parent / ".env", override=False)

sys.path.insert(0, str(Path(__file__).parent.parent))
from bids.classifier import classify_anthropic, classify_openai, classify_cli, CATEGORIES
from shared.supabase_client import get_client


CLASSIFIERS = {
    "anthropic": classify_anthropic,
    "openai": classify_openai,
    "cli": classify_cli,
}


def fetch_targets(client, scope: str, reclassify: bool, limit: int | None, from_date: str | None) -> list[dict]:
    today = date.today().isoformat()
    query = (
        client.table("bids")
        .select("id, bid_ntce_nm, ntce_instt_nm, bsns_div_nm, assign_bdgt_amt, presmpt_prce, ai_category")
    )
    if scope == "active":
        query = query.gte("bid_clse_date", today).order("bid_clse_date", desc=False)
    else:
        query = query.order("bid_ntce_date", desc=True)

    if from_date:
        query = query.gte("bid_ntce_date", from_date)

    if not reclassify:
        query = query.is_("ai_category", "null")

    page_size = 1000
    offset = 0
    rows = []
    while True:
        res = query.range(offset, offset + page_size - 1).execute()
        rows.extend(res.data or [])
        if len(res.data or []) < page_size:
            break
        offset += page_size
        if limit and len(rows) >= limit:
            break

    if limit:
        rows = rows[:limit]
    return rows


def classify_one(classify_fn, bid):
    return bid, classify_fn(bid)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--provider", choices=list(CLASSIFIERS.keys()), default="anthropic")
    parser.add_argument("--scope", choices=["active", "all"], default="active")
    parser.add_argument("--reclassify", action="store_true")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--workers", type=int, default=5)
    parser.add_argument("--from-date", type=str, default=None, help="bid_ntce_date 하한 (YYYY-MM-DD)")
    args = parser.parse_args()

    client = get_client()
    targets = fetch_targets(client, args.scope, args.reclassify, args.limit, args.from_date)

    if not targets:
        print("분류 대상 없음")
        return

    classify_fn = CLASSIFIERS[args.provider]
    print(f"분류 대상: {len(targets)}건  |  provider={args.provider}  |  workers={args.workers}")
    print()

    results = Counter()
    failed = 0
    started = time.time()
    done = 0

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(classify_one, classify_fn, bid) for bid in targets]
        for future in as_completed(futures):
            done += 1
            bid, result = future.result()
            title = (bid.get("bid_ntce_nm") or "")[:50]
            if not result:
                failed += 1
                client.table("bids").update({"ai_category": "분류실패"}).eq("id", bid["id"]).execute()
                results["분류실패"] += 1
                print(f"  [{done}/{len(targets)}] ⚠️ 분류실패: {title}")
                continue
            client.table("bids").update({"ai_category": result["category"]}).eq("id", bid["id"]).execute()
            results[result["category"]] += 1
            if done % 20 == 0 or done == len(targets):
                elapsed = time.time() - started
                rate = done / elapsed if elapsed else 0
                print(f"  [{done}/{len(targets)}] {rate:.1f}건/초  |  {result['category']:18s}")

    elapsed = time.time() - started
    print()
    print(f"=== 완료: {len(targets) - failed}/{len(targets)}건 ({elapsed:.0f}초) ===")
    if failed:
        print(f"실패: {failed}건")
    print()
    print("=== 카테고리 분포 ===")
    total = sum(results.values())
    for category, count in results.most_common():
        bar = "█" * min(count // 2, 50)
        pct = count / total * 100 if total else 0
        print(f"  {category:18s} {count:5d}  ({pct:4.1f}%)  {bar}")


if __name__ == "__main__":
    main()
