"""
로컬 raw 데이터를 Supabase raw_items 테이블에 업로드
Usage: python ai-service/shared/upload_raw_to_supabase.py
"""
import json
import sys
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")
sys.path.insert(0, str(Path(__file__).parent.parent))

from shared.supabase_client import get_client

RAW_DIR = ROOT / "ai-service" / "insights" / "data" / "raw"


def upload_raw_items():
    sb = get_client()
    total = 0
    skipped = 0

    for date_dir in sorted(RAW_DIR.iterdir()):
        if not date_dir.is_dir():
            continue
        date_str = date_dir.name
        for json_file in date_dir.glob("*.json"):
            items = json.loads(json_file.read_text(encoding="utf-8"))
            if not isinstance(items, list):
                continue

            rows = [
                {
                    "item_hash": item["item_hash"],
                    "source_id": item["source_id"],
                    "title": item.get("title", ""),
                    "url": item.get("url", ""),
                    "body": item.get("content") or item.get("body", ""),
                    "collected_at": date_str,
                }
                for item in items
                if item.get("item_hash")
            ]

            if not rows:
                continue

            result = sb.table("raw_items").upsert(rows, on_conflict="item_hash").execute()
            count = len(rows)
            total += count
            print(f"✓ {date_str}/{json_file.stem}: {count}개")

    print(f"\n→ 총 {total}개 업로드 완료")


if __name__ == "__main__":
    upload_raw_items()
