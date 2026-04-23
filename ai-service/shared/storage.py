import json
from dataclasses import asdict
from datetime import date
from pathlib import Path
from typing import Any

# ai-service/insights/data/
DATA_DIR = Path(__file__).parent.parent / "insights" / "data"


def _ensure_data_dir():
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_json(filename: str) -> Any:
    _ensure_data_dir()
    path = DATA_DIR / filename
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(filename: str, data: Any):
    _ensure_data_dir()
    path = DATA_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)


def load_seen_hashes(source_id: str) -> set[str]:
    state = load_json("state.json")
    if isinstance(state, dict):
        return set(state.get(source_id, []))
    return set()


def save_seen_hashes(source_id: str, hashes: set[str]):
    state = load_json("state.json")
    if not isinstance(state, dict):
        state = {}
    state[source_id] = list(hashes)
    save_json("state.json", state)


def append_raw_items(items: list) -> int:
    if not items:
        return 0
    source_id = items[0].source_id
    filename = f"{source_id}.json"
    existing = load_json(filename)
    if not isinstance(existing, list):
        existing = []
    existing_hashes = {i["item_hash"] for i in existing}
    new_items = [asdict(item) for item in items if item.item_hash not in existing_hashes]
    save_json(filename, existing + new_items)
    return len(new_items)


def load_raw_items(today_only: bool = True) -> list[dict]:
    _ensure_data_dir()
    source_files = [
        f for f in DATA_DIR.glob("*.json")
        if f.stem not in ("state", "draft", "insights")
    ]
    items = []
    for f in source_files:
        with open(f, encoding="utf-8") as fp:
            data = json.load(fp)
        if isinstance(data, list):
            items.extend(data)

    if today_only:
        from datetime import datetime, timedelta
        from zoneinfo import ZoneInfo
        kst = ZoneInfo("Asia/Seoul")
        yesterday = (datetime.now(kst) - timedelta(days=1)).strftime("%Y-%m-%d")
        today = datetime.now(kst).strftime("%Y-%m-%d")
        items = [i for i in items if (i.get("published_at") or "")[:10] in (yesterday, today)]
    return items


def save_draft(draft: str, cover_image: str | None = None):
    save_json("draft.json", {
        "draft": draft,
        "cover_image": cover_image,
        "date": date.today().isoformat(),
    })


def load_draft() -> str:
    data = load_json("draft.json")
    if isinstance(data, dict):
        return data.get("draft", "")
    return ""


def load_draft_meta() -> dict:
    data = load_json("draft.json")
    return data if isinstance(data, dict) else {}


def save_insight(insight):
    existing = load_json("insights.json")
    if not isinstance(existing, list):
        existing = []
    existing.append(asdict(insight))
    save_json("insights.json", existing)
