from pathlib import Path

import requests
import yaml

from shared.models import RawItem
from shared.storage import append_raw_items, load_seen_hashes, save_seen_hashes
from shared.utils import today_str


def load_config() -> dict:
    with open(Path(__file__).parent / "config.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)


def fetch_trending(category: str, limit: int, token: str | None) -> list[dict]:
    url = f"https://huggingface.co/api/{category}"
    params = {"sort": "trendingScore", "direction": -1, "limit": limit}
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=15)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"[huggingface] {category} fetch 실패: {e}")
        return []


def run() -> int:
    import os
    config = load_config()
    token = os.getenv("HF_TOKEN")
    seen = load_seen_hashes("huggingface")
    items = []

    for category in config.get("categories", ["models"]):
        limit = config.get("limits", {}).get(category, 20)
        results = fetch_trending(category, limit, token)

        for item in results:
            item_id = item.get("id") or item.get("modelId") or item.get("repoName", "")
            if not item_id:
                continue
            url = f"https://huggingface.co/{item_id}"
            if url in seen:
                continue

            title = item_id
            desc = item.get("description") or item.get("cardData", {}).get("description") or ""
            items.append(RawItem(
                source_id="huggingface",
                source_name="Hugging Face Trending",
                title=title,
                url=url,
                content=str(desc)[:500],
                published_at=today_str(),
                extra={"category": category, "likes": item.get("likes", 0)},
            ))
            seen.add(url)

    save_seen_hashes("huggingface", seen)
    count = append_raw_items(items)
    print(f"[huggingface] {count}개 신규 트렌딩")
    return count
