"""
분류 일치율 검증 — 카테고리별 N건 샘플링 → CLI(Sonnet)로 재분류 → 일치율 출력

사용:
    python verify.py                    # 카테고리별 5건씩 (총 ~50건)
    python verify.py --per-category 10  # 카테고리별 10건씩
"""
import argparse
import os
import random
import sys
import time
from collections import defaultdict
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")
load_dotenv(Path(__file__).parent.parent / ".env", override=False)

sys.path.insert(0, str(Path(__file__).parent.parent))
from bids.classifier import classify_cli, CATEGORIES
from shared.supabase_client import get_client


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--per-category", type=int, default=5)
    args = parser.parse_args()

    client = get_client()

    # 카테고리별 랜덤 샘플
    samples = []
    for cat in CATEGORIES:
        res = (
            client.table("bids")
            .select("id, bid_ntce_nm, ntce_instt_nm, bsns_div_nm, assign_bdgt_amt, presmpt_prce, ai_category")
            .eq("ai_category", cat)
            .limit(100)
            .execute()
        )
        rows = res.data or []
        random.shuffle(rows)
        samples.extend(rows[:args.per_category])

    if not samples:
        print("샘플 없음 (분류된 데이터가 없거나 샘플 추출 실패)")
        return

    print(f"검증 대상: {len(samples)}건 (카테고리당 최대 {args.per_category}건)")
    print(f"검증자: Claude CLI (Sonnet)")
    print()

    matched = 0
    mismatches = []
    by_category = defaultdict(lambda: {"matched": 0, "total": 0})
    started = time.time()

    for i, bid in enumerate(samples, 1):
        original = bid["ai_category"]
        result = classify_cli(bid, model="sonnet")
        new_category = result["category"] if result else None
        is_match = (new_category == original)
        title = (bid.get("bid_ntce_nm") or "")[:45]

        by_category[original]["total"] += 1
        if is_match:
            matched += 1
            by_category[original]["matched"] += 1
            print(f"  [{i}/{len(samples)}] ✅ {original:18s}  {title}")
        else:
            mismatches.append((bid, original, new_category))
            print(f"  [{i}/{len(samples)}] ❌ {original:18s} → {new_category or 'None':18s}  {title}")

    elapsed = time.time() - started
    print()
    print(f"=== 일치율: {matched}/{len(samples)} = {matched/len(samples)*100:.1f}% ({elapsed:.0f}초) ===")
    print()
    print("=== 카테고리별 일치율 ===")
    for cat in CATEGORIES:
        st = by_category[cat]
        if st["total"] == 0:
            continue
        rate = st["matched"] / st["total"] * 100
        print(f"  {cat:18s} {st['matched']}/{st['total']}  ({rate:.0f}%)")

    if mismatches:
        print()
        print(f"=== 불일치 케이스 {len(mismatches)}건 ===")
        for bid, orig, new in mismatches[:20]:
            title = (bid.get("bid_ntce_nm") or "")[:60]
            print(f"  {orig:18s} → {new or 'None':18s}  {title}")

    # 분류실패 케이스 검토
    print()
    print("=== 분류실패 케이스 ===")
    failed_res = (
        client.table("bids")
        .select("id, bid_ntce_nm, ntce_instt_nm, bsns_div_nm, assign_bdgt_amt, presmpt_prce")
        .eq("ai_category", "분류실패")
        .limit(50)
        .execute()
    )
    failed_bids = failed_res.data or []
    if not failed_bids:
        print("  분류실패 케이스 없음")
        return

    print(f"  분류실패: {len(failed_bids)}건 — CLI(Sonnet)로 재시도")
    rescued = 0
    truly_unmatched = []
    for i, bid in enumerate(failed_bids, 1):
        title = (bid.get("bid_ntce_nm") or "")[:60]
        result = classify_cli(bid, model="sonnet")
        if result:
            rescued += 1
            print(f"  [{i}/{len(failed_bids)}] 🔄 {result['category']:18s}  {title}")
        else:
            truly_unmatched.append(bid)
            print(f"  [{i}/{len(failed_bids)}] ❌ AI 무관 추정      {title}")

    print()
    print(f"  → 재분류 성공: {rescued}건 (가이드 보강 후보)")
    print(f"  → 진짜 AI 무관 추정: {len(truly_unmatched)}건 (collect.py 키워드 검토 후보)")


if __name__ == "__main__":
    main()
