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


def fetch_month(year: int, month: int) -> list[dict]:
    bgn, end, label = get_month_range(year, month)

    # 1) 총 건수 파악
    url = (
        f"{BASE}/getDataSetOpnStdBidPblancInfo"
        f"?serviceKey={G2B_KEY}&pageNo=1&numOfRows=1&type=json"
        f"&bidNtceBgnDt={bgn}&bidNtceEndDt={end}"
    )
    try:
        res = requests.get(url, timeout=30)
        total = res.json().get("response", {}).get("body", {}).get("totalCount", 0)
    except Exception:
        total = 5000
    max_pages = (int(total) // 100) + 1
    print(f"  {label}: 총 {total}건 → {max_pages}페이지 스캔 예정")

    # 2) 전체 페이지 스캔
    seen: dict[str, dict] = {}
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
            items = res.json().get("response", {}).get("body", {}).get("items") or []
            if not isinstance(items, list) or not items:
                break
            for item in items:
                if is_ai_bid(item.get("bidNtceNm", "")):
                    key = f"{item.get('bidNtceNo','')}-{item.get('bidNtceOrd','0')}"
                    seen[key] = item
            print(f"  {label} p{page}/{max_pages} | AI {len(seen)}건", end="\r")
            time.sleep(0.15)
        except Exception as e:
            print(f"\n  p{page} 오류: {e}")
            time.sleep(1)

    print(f"\n  {label} 완료: AI 공고 {len(seen)}건")
    return list(seen.values())


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
    # id 기준 중복 제거
    seen = {}
    for b in bids:
        row = to_row(b)
        seen[row["id"]] = row
    rows = list(seen.values())
    # 500건씩 배치 upsert
    batch = 500
    for i in range(0, len(rows), batch):
        client.table("bids").upsert(rows[i:i+batch], on_conflict="id").execute()
    print(f"  → Supabase upsert {len(rows)}건 완료")


def get_collected_months() -> set[str]:
    """Supabase에서 이미 수집된 월 목록 반환"""
    try:
        client = get_client()
        r = client.table("bids").select("bid_ntce_date").execute()
        from collections import Counter
        months = Counter(d["bid_ntce_date"][:7] for d in r.data if d.get("bid_ntce_date"))
        # 100건 이상인 월만 완료로 간주
        return {m for m, cnt in months.items() if cnt >= 100}
    except Exception:
        return set()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--months", type=int, default=1, help="수집할 개월 수 (기본 1)")
    parser.add_argument("--resume", action="store_true", help="이미 수집된 월 스킵")
    args = parser.parse_args()

    now = datetime.now()
    print(f"G2B AI 공고 수집 시작 ({args.months}개월)")

    done = get_collected_months() if args.resume else set()
    if done:
        print(f"  이미 완료된 월 스킵: {sorted(done)}")

    for i in range(args.months - 1, -1, -1):
        year = now.year
        month = now.month - i
        while month <= 0:
            month += 12
            year -= 1
        label = f"{year}-{str(month).zfill(2)}"
        if label in done:
            print(f"  {label}: 스킵 (이미 수집됨)")
            continue
        bids = fetch_month(year, month)
        upsert_bids(bids)

    print("완료")


if __name__ == "__main__":
    main()
