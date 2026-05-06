"""
공고 일괄 분류 -> bids.ai_category 업데이트

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
from shared.db import get_conn


CLASSIFIERS = {
    "anthropic": classify_anthropic,
    "openai": classify_openai,
    "cli": classify_cli,
}


def fetch_targets(scope: str, reclassify: bool, limit: int | None, from_date: str | None) -> list[dict]:
    today = date.today().isoformat()

    conditions = []
    params: list = []

    if scope == "active":
        conditions.append("bid_clse_date >= %s")
        params.append(today)
        order_col = "bid_clse_date"
        order_dir = "ASC"
    else:
        order_col = "bid_ntce_date"
        order_dir = "DESC"

    if from_date:
        conditions.append("bid_ntce_date >= %s")
        params.append(from_date)

    if not reclassify:
        conditions.append("ai_category IS NULL")

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    sql = f"""
        SELECT id, bid_ntce_nm, ntce_instt_nm, bsns_div_nm,
               assign_bdgt_amt, presmpt_prce, ai_category
        FROM bids
        {where}
        ORDER BY {order_col} {order_dir}
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            rows = [dict(r) for r in cur.fetchall()]

    if limit:
        rows = rows[:limit]
    return rows


def classify_one(classify_fn, bid):
    return bid, classify_fn(bid)


def _update_category(bid_id: str, category: str):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE bids SET ai_category = %s WHERE id = %s",
                (category, bid_id),
            )
        conn.commit()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--provider", choices=list(CLASSIFIERS.keys()), default="anthropic")
    parser.add_argument("--scope", choices=["active", "all"], default="active")
    parser.add_argument("--reclassify", action="store_true")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--workers", type=int, default=5)
    parser.add_argument("--from-date", type=str, default=None, help="bid_ntce_date 하한 (YYYY-MM-DD)")
    args = parser.parse_args()

    targets = fetch_targets(args.scope, args.reclassify, args.limit, args.from_date)

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
                _update_category(bid["id"], "무관")
                results["무관"] += 1
                print(f"  [{done}/{len(targets)}] 무관(파싱실패): {title}")
                continue
            _update_category(bid["id"], result["category"])
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
