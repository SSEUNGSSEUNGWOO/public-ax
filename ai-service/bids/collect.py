"""
G2B AI 공고 수집 스크립트

초기 적재:  python collect.py --months 12
일일 업데이트: python collect.py --months 1
"""
import argparse
import os
import sys
import time
from datetime import datetime

import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from shared.supabase_client import get_client

G2B_KEY = os.environ.get("G2B_API_KEY", "3393eec4c01364de879d496e848da7a9a067555abbff33f38f6293502956fc71")
BASE = "https://apis.data.go.kr/1230000/ao/PubDataOpnStdService"

AI_KEYWORDS = ["AI", "인공지능", "빅데이터", "머신러닝", "딥러닝", "자연어처리", "LLM", "챗봇", "지능형", "디지털전환", "클라우드"]


def is_ai_bid(name: str) -> bool:
    return any(kw in (name or "") for kw in AI_KEYWORDS)


def get_month_range(year: int, month: int):
    import calendar
    last_day = calendar.monthrange(year, month)[1]
    mm = str(month).zfill(2)
    return f"{year}{mm}010000", f"{year}{mm}{last_day}2359", f"{year}-{mm}"


def fetch_month(year: int, month: int, max_pages: int = 20) -> list[dict]:
    bgn, end, label = get_month_range(year, month)
    all_items = []

    for page in range(1, max_pages + 1):
        url = (
            f"{BASE}/getDataSetOpnStdBidPblancInfo"
            f"?serviceKey={G2B_KEY}&pageNo={page}&numOfRows=100&type=json"
            f"&bidNtceBgnDt={bgn}&bidNtceEndDt={end}"
        )
        try:
            res = requests.get(url, timeout=30)
            text = res.text
            if not text.startswith("{"):
                break
            data = res.json()
            items = data.get("response", {}).get("body", {}).get("items") or []
            if not isinstance(items, list):
                break
            all_items.extend(items)
            print(f"  {label} p{page}: {len(items)}건", end="\r")
            if len(items) < 100:
                break
            time.sleep(0.3)
        except Exception as e:
            print(f"\n  오류: {e}")
            break

    filtered = [item for item in all_items if is_ai_bid(item.get("bidNtceNm", ""))]
    print(f"  {label}: 전체 {len(all_items)}건 → AI 필터 {len(filtered)}건")
    return filtered


def to_row(item: dict) -> dict:
    return {
        "id": f"{item.get('bidNtceNo', '')}-{item.get('bidNtceOrd', '0')}",
        "bid_ntce_no": item.get("bidNtceNo", ""),
        "bid_ntce_ord": item.get("bidNtceOrd", ""),
        "bid_ntce_nm": item.get("bidNtceNm", ""),
        "bid_ntce_sttus": item.get("bidNtceSttusNm", ""),
        "bid_ntce_date": item.get("bidNtceDate", ""),
        "bsns_div_nm": item.get("bsnsDivNm", ""),
        "ntce_instt_nm": item.get("ntceInsttNm", ""),
        "assign_bdgt_amt": item.get("asignBdgtAmt", ""),
        "presmpt_prce": item.get("presmptPrce", ""),
        "bid_clse_date": item.get("bidClseDate", ""),
        "bid_clse_tm": item.get("bidClseTm", ""),
        "bid_ntce_url": item.get("bidNtceUrl", ""),
    }


def upsert_bids(bids: list[dict]):
    if not bids:
        return
    client = get_client()
    rows = [to_row(b) for b in bids]
    # 500건씩 배치 upsert
    batch = 500
    for i in range(0, len(rows), batch):
        client.table("bids").upsert(rows[i:i+batch], on_conflict="id").execute()
    print(f"  → Supabase upsert {len(rows)}건 완료")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--months", type=int, default=1, help="수집할 개월 수 (기본 1)")
    args = parser.parse_args()

    now = datetime.now()
    print(f"G2B AI 공고 수집 시작 ({args.months}개월)")

    for i in range(args.months - 1, -1, -1):
        year = now.year
        month = now.month - i
        while month <= 0:
            month += 12
            year -= 1
        bids = fetch_month(year, month)
        upsert_bids(bids)

    print("완료")


if __name__ == "__main__":
    main()
