"""
g2b-monitor DB의 bids_raw에서 AI 키워드 매칭 건을 public-ax DB의 bids 테이블로 sync.

Usage: python bids/sync_from_raw.py [--days 30]

환경변수:
  RAW_DATABASE_URL  - g2b-monitor Neon DB (읽기 전용)
  DATABASE_URL      - public-ax Neon DB
"""
import argparse
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")
load_dotenv(Path(__file__).parent.parent / ".env", override=False)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from shared.db import get_conn

AI_KEYWORDS = [
    "AI", "인공지능", "머신러닝", "딥러닝", "자연어처리", "LLM", "챗봇",
    "생성형", "에이전트",
    "빅데이터", "데이터", "데이터셋", "학습데이터", "데이터플랫폼",
    "클라우드", "AI플랫폼", "MLOps", "AIOps",
    "컴퓨터비전", "객체감지", "영상분석", "영상인식", "음성인식",
    "RAG", "NLP",
    "지능형", "지능화", "지능정보", "디지털전환", "디지털", "스마트",
    "정보화", "자동화", "전자정부",
    "AX", "DX", "ML", "GenAI",
]


def is_ai_bid(name: str) -> bool:
    return any(kw in (name or "") for kw in AI_KEYWORDS)


def _to_text(val) -> str:
    """raw DB의 timestamptz/numeric 값을 public-ax bids의 text 타입으로 변환."""
    if val is None:
        return ""
    if isinstance(val, datetime):
        return val.strftime("%Y/%m/%d %H:%M")
    return str(val).strip()


def fetch_raw_bids(raw_dsn: str, days: int) -> list[dict]:
    """g2b-monitor DB의 bids_raw에서 최근 N일 데이터를 가져온다."""
    since = (datetime.now() - timedelta(days=days)).isoformat()
    conn = psycopg2.connect(raw_dsn, cursor_factory=RealDictCursor)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM bids_raw WHERE collected_at >= %s OR bid_clse_date >= NOW()",
                (since,),
            )
            return cur.fetchall()
    finally:
        conn.close()


def sync(raw_rows: list[dict]):
    """AI 키워드 매칭 후 public-ax DB의 bids 테이블에 upsert."""
    matched = [r for r in raw_rows if is_ai_bid(r.get("bid_ntce_nm", ""))]
    if not matched:
        print("  AI 매칭 건수: 0건", flush=True)
        return

    # public-ax bids 컬럼 (전부 text)
    columns = [
        "id", "bid_ntce_no", "bid_ntce_ord", "bid_ntce_nm", "bid_ntce_sttus",
        "bid_ntce_date", "bsns_div_nm", "ntce_instt_nm", "dmnd_instt_nm",
        "assign_bdgt_amt", "presmpt_prce", "bid_clse_date", "bid_clse_tm",
        "bid_ntce_url", "bidprc_psbl_indstrty_nm", "rgn_lmt_yn",
        "prtcpt_psbl_rgn_nm", "cntrct_cncls_mthd_nm", "bidwinr_dcsn_mthd_nm",
        "openg_date", "dmnd_instt_ofcl_dept_nm", "dmnd_instt_ofcl_nm",
        "dmnd_instt_ofcl_tel", "dmnd_instt_ofcl_email_adrs",
    ]

    # raw → public-ax 컬럼 매핑 (일부 컬럼명이 다름: asign vs assign)
    col_map = {
        "assign_bdgt_amt": "asign_bdgt_amt",  # raw는 asign, public-ax는 assign
    }

    # 중복 제거
    seen = {}
    for r in matched:
        row = {}
        for col in columns:
            raw_col = col_map.get(col, col)
            row[col] = _to_text(r.get(raw_col, ""))
        if row["id"]:
            seen[row["id"]] = row
    rows = list(seen.values())

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
                for row in rows[i : i + batch]:
                    cur.execute(sql, row)
        conn.commit()

    print(f"  -> bids sync 완료: {len(rows)}건 upsert", flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--days", type=int, default=30, help="raw에서 가져올 기간 (기본 30일)")
    args = parser.parse_args()

    raw_dsn = os.environ.get("RAW_DATABASE_URL")
    if not raw_dsn:
        print("RAW_DATABASE_URL 환경변수가 필요합니다.", flush=True)
        sys.exit(1)

    print(f"bids_raw → bids sync 시작 (최근 {args.days}일)", flush=True)
    raw_rows = fetch_raw_bids(raw_dsn, args.days)
    print(f"  raw 건수: {len(raw_rows)}건", flush=True)
    sync(raw_rows)
    print("완료", flush=True)


if __name__ == "__main__":
    main()
