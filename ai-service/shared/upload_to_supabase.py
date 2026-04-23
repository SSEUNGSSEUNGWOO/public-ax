"""
기존 JSON 데이터를 Supabase로 업로드하는 스크립트
Usage: python ai-service/shared/upload_to_supabase.py
"""
import json
import os
import sys
from pathlib import Path

try:
    from supabase import create_client
except ImportError:
    print("pip install supabase 먼저 실행하세요")
    sys.exit(1)

SUPABASE_URL = "https://dpmxietmqojcdjkvipms.supabase.co"
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwbXhpZXRtcW9qY2Rqa3ZpcG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MjI5MDgsImV4cCI6MjA5MjQ5ODkwOH0.1G9egGVgKWJZ0LXNhYXS9b6CjkprQlYkQG4lCUz_N_I")

ROOT = Path(__file__).parent.parent.parent

def upload_insights():
    path = ROOT / "ai-service" / "insights" / "data" / "insights.json"
    if not path.exists():
        print("insights.json 없음, 건너뜀")
        return

    data = json.loads(path.read_text())
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    for item in data:
        row = {
            "slug": item["slug"],
            "title": item["title"],
            "body": item["body"],
            "sources": item.get("sources", []),
            "published_at": item["published_at"],
            "category": item.get("category", ""),
            "image_url": item.get("image_url"),
            "evaluation_score": item.get("evaluation_score"),
            "crawled_count": item.get("crawled_count", 0),
        }
        client.table("insights").upsert(row).execute()
        print(f"✓ insight: {item['slug']}")

    print(f"→ insights {len(data)}개 업로드 완료")

def upload_guides():
    path = ROOT / "frontend" / "content" / "guides.json"
    if not path.exists():
        print("guides.json 없음, 건너뜀")
        return

    data = json.loads(path.read_text())
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    for item in data:
        if item.get("status") != "published":
            continue
        row = {
            "slug": item["slug"],
            "title": item["title"],
            "summary": item.get("summary", ""),
            "category": item.get("category", ""),
            "tags": item.get("tags", []),
            "published_at": item["published_at"],
            "body": item["body"],
            "videos": item.get("videos", []),
            "evaluation_score": item.get("evaluation_score"),
            "status": item.get("status", "published"),
        }
        client.table("guides").upsert(row).execute()
        print(f"✓ guide: {item['slug']}")

    print(f"→ guides {len(data)}개 업로드 완료")

if __name__ == "__main__":
    upload_insights()
    upload_guides()
