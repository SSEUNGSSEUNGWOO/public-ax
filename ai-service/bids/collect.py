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
from pathlib import Path

import requests
from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")
load_dotenv(Path(__file__).parent.parent / ".env", override=False)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from shared.db import get_conn

G2B_KEY = os.environ.get("G2B_API_KEY", "3393eec4c01364de879d496e848da7a9a067555abbff33f38f6293502956fc71")
BASE = "https://apis.data.go.kr/1230000/ao/PubDataOpnStdService"

AI_KEYWORDS = [
    # 핵심 AI 용어
    "AI", "인공지능", "머신러닝", "딥러닝", "자연어처리", "LLM", "챗봇",
    "생성형", "에이전트",
    # 데이터/빅데이터
    "빅데이터", "데이터", "데이터셋", "학습데이터", "데이터플랫폼",
    # 인프라/플랫폼
    "클라우드", "AI플랫폼", "MLOps", "AIOps",
    # 분야
    "컴퓨터비전", "객체감지", "영상분석", "영상인식", "음성인식",
    "RAG", "NLP",
    # 정책/디지털
    "지능형", "지능화", "지능정보", "디지털전환", "디지털", "스마트",
    "정보화", "자동화", "전자정부",
    # 약어
    "AX", "DX", "ML", "GenAI",
]


def is_ai_bid(name: str) -> bool:
    return any(kw in (name or "") for kw in AI_KEYWORDS)


def get_month_range(year: int, month: int):
    import calendar
    last_day = calendar.monthrange(year, month)[1]
    mm = str(month).zfill(2)
    return f"{year}{mm}010000", f"{year}{mm}{last_day}2359", f"{year}-{mm}"


def fetch_page(bgn: str, end: str, page: int) -> list[dict]:
    url = (
        f"{BASE}/getDataSetOpnStdBidPblancInfo"
        f"?serviceKey={G2B_KEY}&pageNo={page}&numOfRows=100&type=json"
        f"&bidNtceBgnDt={bgn}&bidNtceEndDt={end}"
    )
    try:
        res = requests.get(url, timeout=30)
        text = res.text
        if not text.startswith("{"):
            return []
        items = res.json().get("response", {}).get("body", {}).get("items") or []
        if not isinstance(items, list):
            return []
        return [item for item in items if is_ai_bid(item.get("bidNtceNm", ""))]
    except Exception as e:
        print(f"\n  p{page} 오류: {e}")
        return []


def fetch_month(year: int, month: int, workers: int = 5) -> list[dict]:
    from concurrent.futures import ThreadPoolExecutor, as_completed
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
    print(f"  {label}: 총 {total}건 → {max_pages}페이지 / 워커 {workers}", flush=True)

    # 2) 페이지 병렬 스캔
    seen: dict[str, dict] = {}
    completed = 0
    started = time.time()
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(fetch_page, bgn, end, p): p for p in range(1, max_pages + 1)}
        for future in as_completed(futures):
            completed += 1
            for item in future.result():
                key = f"{item.get('bidNtceNo','')}-{item.get('bidNtceOrd','0')}"
                seen[key] = item
            if completed % 50 == 0 or completed == max_pages:
                elapsed = time.time() - started
                rate = completed / elapsed if elapsed else 0
                print(f"  {label} {completed}/{max_pages} ({rate:.1f}p/s) | AI {len(seen)}건", flush=True)

    print(f"  {label} 완료: AI 공고 {len(seen)}건 ({time.time()-started:.0f}초)", flush=True)
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
        "dmnd_instt_nm": item.get("dmndInsttNm", ""),
        "assign_bdgt_amt": item.get("asignBdgtAmt", ""),
        "presmpt_prce": item.get("presmptPrce", ""),
        "bid_clse_date": item.get("bidClseDate", ""),
        "bid_clse_tm": item.get("bidClseTm", ""),
        "bid_ntce_url": item.get("bidNtceUrl", ""),
        # 참여 자격
        "bidprc_psbl_indstrty_nm": item.get("bidprcPsblIndstrytyNm", ""),
        "rgn_lmt_yn": item.get("rgnLmtYn", ""),
        "prtcpt_psbl_rgn_nm": item.get("prtcptPsblRgnNm", ""),
        # 계약·낙찰 방식
        "cntrct_cncls_mthd_nm": item.get("cntrctCnclsMthdNm", ""),
        "bidwinr_dcsn_mthd_nm": item.get("bidwinrDcsnMthdNm", ""),
        # 일정
        "openg_date": item.get("opengDate", ""),
        # 수요기관 담당자
        "dmnd_instt_ofcl_dept_nm": item.get("dmndInsttOfclDeptNm", ""),
        "dmnd_instt_ofcl_nm": item.get("dmndInsttOfclNm", ""),
        "dmnd_instt_ofcl_tel": item.get("dmndInsttOfclTel", ""),
        "dmnd_instt_ofcl_email_adrs": item.get("dmndInsttOfclEmailAdrs", ""),
    }


def upsert_bids(bids: list[dict]):
    if not bids:
        return
    # id 기준 중복 제거
    seen = {}
    for b in bids:
        row = to_row(b)
        seen[row["id"]] = row
    rows = list(seen.values())

    columns = list(rows[0].keys())
    placeholders = ", ".join(f"%({c})s" for c in columns)
    col_list = ", ".join(columns)
    update_set = ", ".join(f"{c} = EXCLUDED.{c}" for c in columns if c != "id")

    sql = f"""
        INSERT INTO bids ({col_list})
        VALUES ({placeholders})
        ON CONFLICT (id) DO UPDATE SET {update_set}
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            batch = 500
            for i in range(0, len(rows), batch):
                for row in rows[i:i+batch]:
                    cur.execute(sql, row)
        conn.commit()
    print(f"  -> DB upsert {len(rows)}건 완료")


def get_collected_months(field: str = "bid_ntce_date") -> set[str]:
    """field가 채워진 row가 100건 이상인 월 목록 반환"""
    try:
        condition = "" if field == "bid_ntce_date" else f" AND {field} IS NOT NULL"
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT LEFT(bid_ntce_date, 7) AS month, COUNT(*) AS cnt
                    FROM bids
                    WHERE bid_ntce_date IS NOT NULL{condition}
                    GROUP BY LEFT(bid_ntce_date, 7)
                    HAVING COUNT(*) >= 100
                    """,
                )
                return {r["month"] for r in cur.fetchall()}
    except Exception:
        return set()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--months", type=int, default=1, help="수집할 개월 수 (기본 1)")
    parser.add_argument("--resume", action="store_true", help="이미 수집된 월 스킵 (bid_ntce_date 기준)")
    parser.add_argument("--skip-filled", action="store_true", help="dmnd_instt_nm 채워진 월 스킵")
    parser.add_argument("--workers", type=int, default=5, help="페이지 병렬 워커 (기본 5)")
    args = parser.parse_args()

    now = datetime.now()
    print(f"G2B AI 공고 수집 시작 ({args.months}개월, 워커 {args.workers})", flush=True)

    if args.skip_filled:
        done = get_collected_months("dmnd_instt_nm")
    elif args.resume:
        done = get_collected_months()
    else:
        done = set()
    if done:
        print(f"  이미 완료된 월 스킵: {sorted(done)}", flush=True)

    for i in range(args.months - 1, -1, -1):
        year = now.year
        month = now.month - i
        while month <= 0:
            month += 12
            year -= 1
        label = f"{year}-{str(month).zfill(2)}"
        if label in done:
            print(f"  {label}: 스킵 (이미 수집됨)", flush=True)
            continue
        bids = fetch_month(year, month, workers=args.workers)
        upsert_bids(bids)

    print("완료")


if __name__ == "__main__":
    main()
