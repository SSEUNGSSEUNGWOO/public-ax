"""
입찰 분류 수동 검수 도구

사용:
    # 검수 대상 N건 JSON 출력 (reviewed_at IS NULL + 마감 임박순)
    python bids/review.py list-pending --limit 10

    # 단일 건 카테고리 변경 + 검수 완료 표시
    python bids/review.py update <bid_id> "LLM/생성형 AI"

    # 카테고리 유지하되 검수 완료 표시 (다음 세션에 다시 안 나옴)
    python bids/review.py keep <bid_id>

기준:
- 검수 대상: ai_category IN ('기타 AI', '무관') AND bid_clse_date >= today AND reviewed_at IS NULL
- 단가계약·각수요기관 행은 자동 제외
- 마감 임박순으로 우선 표시
"""
import argparse
import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")
load_dotenv(Path(__file__).parent.parent / ".env", override=False)

sys.path.insert(0, str(Path(__file__).parent.parent))
from shared.supabase_client import get_client

CATEGORIES = [
    "LLM/생성형 AI",
    "RAG/지식 검색",
    "컴퓨터 비전",
    "음성/STT",
    "빅데이터 분석",
    "AI 인프라/MLOps",
    "AI 자율주행/로봇",
    "AI 의료/헬스케어",
    "AI 보안",
    "AI 정책/연구용역",
    "AI 교육/컨설팅",
    "디지털 전환",
    "기타 AI",
    "무관",
]

REVIEW_TARGETS = ("기타 AI", "무관")


def is_unit_contract(row: dict) -> bool:
    name = row.get("bid_ntce_nm") or ""
    dmnd = row.get("dmnd_instt_nm") or ""
    if any(s in name for s in ("_제3자단가", "단가계약", "단가입찰")):
        return True
    return dmnd == "각 수요기관"


def list_pending(limit: int) -> list[dict]:
    client = get_client()
    today = date.today().isoformat()
    res = (
        client.table("bids")
        .select(
            "id, bid_ntce_nm, ntce_instt_nm, dmnd_instt_nm, "
            "bsns_div_nm, ai_category, bid_clse_date, "
            "assign_bdgt_amt, presmpt_prce, bidprc_psbl_indstrty_nm"
        )
        .in_("ai_category", list(REVIEW_TARGETS))
        .gte("bid_clse_date", today)
        .is_("reviewed_at", "null")
        .order("bid_clse_date", desc=False)
        .limit(limit * 2)  # 단가계약 제외 후 limit 채우기 위해 여유
        .execute()
    )
    rows = [r for r in (res.data or []) if not is_unit_contract(r)]
    return rows[:limit]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def update_category(bid_id: str, category: str) -> None:
    if category not in CATEGORIES:
        raise ValueError(f"알 수 없는 카테고리: {category}")
    client = get_client()
    client.table("bids").update({
        "ai_category": category,
        "reviewed_at": _now_iso(),
    }).eq("id", bid_id).execute()


def keep(bid_id: str) -> None:
    """카테고리 유지 + 검수 완료 표시."""
    client = get_client()
    client.table("bids").update({"reviewed_at": _now_iso()}).eq("id", bid_id).execute()


def count_pending() -> int:
    client = get_client()
    today = date.today().isoformat()
    res = (
        client.table("bids")
        .select("id", count="exact")
        .in_("ai_category", list(REVIEW_TARGETS))
        .gte("bid_clse_date", today)
        .is_("reviewed_at", "null")
        .limit(1)
        .execute()
    )
    return res.count or 0


def main() -> None:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_list = sub.add_parser("list-pending", help="검수 대상 목록 JSON 출력")
    p_list.add_argument("--limit", type=int, default=10)

    p_update = sub.add_parser("update", help="카테고리 변경 + 검수 완료 표시")
    p_update.add_argument("bid_id")
    p_update.add_argument("category")

    p_keep = sub.add_parser("keep", help="카테고리 유지 + 검수 완료 표시")
    p_keep.add_argument("bid_id")

    sub.add_parser("count", help="미검수 대상 건수 출력")

    args = parser.parse_args()

    if args.cmd == "list-pending":
        items = list_pending(args.limit)
        print(json.dumps(items, ensure_ascii=False, indent=2))
    elif args.cmd == "update":
        update_category(args.bid_id, args.category)
        print(f"✅ {args.bid_id} → {args.category}")
    elif args.cmd == "keep":
        keep(args.bid_id)
        print(f"✅ {args.bid_id} (카테고리 유지)")
    elif args.cmd == "count":
        n = count_pending()
        print(f"미검수 대상: {n}건")


if __name__ == "__main__":
    main()
