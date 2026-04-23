import hashlib
import re
import time
import requests
from datetime import datetime, timezone


def compute_hash(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()[:16]


def fetch_og_image(url: str, timeout: int = 5) -> str | None:
    try:
        resp = requests.get(url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        match = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', resp.text)
        if not match:
            match = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', resp.text)
        return match.group(1) if match else None
    except Exception:
        return None


def now_kst() -> str:
    from zoneinfo import ZoneInfo
    return datetime.now(ZoneInfo("Asia/Seoul")).isoformat()


def today_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def yesterday_kst() -> str:
    from datetime import timedelta
    from zoneinfo import ZoneInfo
    return (datetime.now(ZoneInfo("Asia/Seoul")) - timedelta(days=1)).strftime("%Y-%m-%d")


def fetch_unsplash_image(keyword: str, access_key: str) -> str | None:
    try:
        resp = requests.get(
            "https://api.unsplash.com/photos/random",
            params={"query": keyword, "orientation": "landscape"},
            headers={"Authorization": f"Client-ID {access_key}"},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json().get("urls", {}).get("regular")
    except Exception:
        return None


def safe_get(url: str, timeout: int = 10, retries: int = 3, delay: int = 2) -> requests.Response | None:
    for attempt in range(retries):
        try:
            resp = requests.get(url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0"})
            resp.raise_for_status()
            return resp
        except Exception:
            if attempt < retries - 1:
                time.sleep(delay)
    return None
