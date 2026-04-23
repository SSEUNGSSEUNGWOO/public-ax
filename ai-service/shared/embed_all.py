"""
기존 데이터 전체 임베딩 → Supabase documents 저장
Usage: python ai-service/shared/embed_all.py
"""
import json
import sys
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")
sys.path.insert(0, str(Path(__file__).parent.parent))

from shared.indexer import chunk_insight, chunk_raw_items, chunk_site_info, upsert_chunks

RAW_DIR = ROOT / "ai-service" / "insights" / "data" / "raw"
INSIGHTS_JSON = ROOT / "ai-service" / "insights" / "data" / "insights.json"


def embed_site_info():
    print("\n[1/3] site_info 임베딩...")
    chunks = chunk_site_info()
    upsert_chunks(chunks)
    print(f"  site_info {len(chunks)}개 처리")


def embed_insights():
    print("\n[2/3] insights 임베딩...")
    if not INSIGHTS_JSON.exists():
        print("  insights.json 없음, 스킵")
        return
    insights = json.loads(INSIGHTS_JSON.read_text(encoding="utf-8"))
    for insight in insights:
        chunks = chunk_insight(
            title=insight["title"],
            body=insight["body"],
            slug=insight["slug"],
            published_at=insight["published_at"],
        )
        print(f"  {insight['slug']}: {len(chunks)}청크")
        upsert_chunks(chunks)


def embed_raw():
    print("\n[3/3] raw items 임베딩...")
    all_items = []
    for date_dir in sorted(RAW_DIR.iterdir()):
        if not date_dir.is_dir():
            continue
        for json_file in date_dir.glob("*.json"):
            items = json.loads(json_file.read_text(encoding="utf-8"))
            if isinstance(items, list):
                all_items.extend(items)

    chunks = chunk_raw_items(all_items)
    print(f"  raw {len(chunks)}청크 처리 중...")
    upsert_chunks(chunks)


if __name__ == "__main__":
    embed_site_info()
    embed_insights()
    embed_raw()
    print("\n✓ 전체 임베딩 완료")
