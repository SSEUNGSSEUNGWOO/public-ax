import io
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

import feedparser
import yaml

from shared.models import RawItem
from shared.storage import append_raw_items, load_seen_hashes, save_seen_hashes


def load_config() -> dict:
    with open(Path(__file__).parent / "config.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)


def fetch_entries(config: dict) -> list:
    keywords = config["keywords"]
    fields = config.get("search_fields", ["ti", "abs"])
    max_results = config.get("max_results", 20)
    groups = ["(" + " OR ".join(f'{field}:"{kw}"' for field in fields) + ")" for kw in keywords]
    query = " OR ".join(groups)

    target = datetime.now(timezone.utc) - timedelta(days=1)
    date_str = target.strftime("%Y%m%d")
    full_query = f"({query}) AND submittedDate:[{date_str}000000 TO {date_str}235959]"

    url = (
        f"https://export.arxiv.org/api/query"
        f"?search_query={urllib.parse.quote(full_query, safe='')}"
        f"&max_results={max_results}&sortBy=submittedDate&sortOrder=descending"
    )
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            return feedparser.parse(io.BytesIO(resp.read())).entries
    except Exception as e:
        print(f"[arxiv] fetch 실패: {e}")
        return []


def run() -> int:
    from shared.storage import RAW_DIR
    from datetime import datetime
    from zoneinfo import ZoneInfo

    config = load_config()
    entries = fetch_entries(config)

    # 오늘 날짜 디렉토리에 이미 저장된 arxiv ID 확인 (seen_hashes 대신 파일 기준)
    today = datetime.now(ZoneInfo("Asia/Seoul")).strftime("%Y-%m-%d")
    today_path = RAW_DIR / today / "arxiv.json"
    existing_ids: set[str] = set()
    if today_path.exists():
        import json
        existing = json.loads(today_path.read_text(encoding="utf-8"))
        existing_ids = {i.get("url", "").split("/abs/")[-1] for i in existing}

    items = []
    for entry in entries:
        raw_id = entry.id.split("/abs/")[-1].split("v")[0]
        if raw_id in existing_ids:
            continue
        items.append(RawItem(
            source_id="arxiv",
            source_name="arXiv",
            title=" ".join(entry.title.split()),
            url=f"https://arxiv.org/abs/{raw_id}",
            content=(getattr(entry, "summary", "") or "").strip(),
            published_at=(getattr(entry, "published", "") or "")[:10],
            extra={"authors": [a.name for a in getattr(entry, "authors", [])][:5]},
        ))

    count = append_raw_items(items)
    print(f"[arxiv] {count}개 신규 논문")
    return count
