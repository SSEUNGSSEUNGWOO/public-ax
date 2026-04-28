import os
import re
from urllib.parse import urljoin, urlparse

from shared.utils import fetch_og_image, fetch_unsplash_image

# og:image가 항상 로고/플레이스홀더인 도메인 (의미 있는 이미지 추출 불가)
EXCLUDE_DOMAINS = {"arxiv.org"}


def _resolve_image(page_url: str, img_url: str | None) -> str | None:
    """og:image가 상대 경로면 절대 URL로 변환. 절대 URL이면 그대로."""
    if not img_url:
        return None
    if img_url.startswith(("http://", "https://")):
        return img_url
    return urljoin(page_url, img_url)


def insert_section_images(draft: str, item_urls: set[str]) -> str:
    """--- 구분선 기준으로 섹션 분리 후 각 섹션 앞에 og:image 삽입.
    arxiv 등 의미 없는 og:image 도메인은 제외, 상대 경로는 절대로 변환."""
    parts = re.split(r'\n---\n', draft)

    url_pattern = re.compile(r'\[([^\]]+)\]\((https?://[^\)]+)\)')
    seen_urls: set[str] = set()

    new_parts = []
    for part in parts:
        if not re.search(r'^\d+\.', part.strip()):
            new_parts.append(part)
            continue

        for m in url_pattern.finditer(part):
            url = m.group(2)
            if url not in item_urls or url in seen_urls or len(seen_urls) >= 3:
                continue
            if urlparse(url).hostname in EXCLUDE_DOMAINS:
                continue
            img = _resolve_image(url, fetch_og_image(url))
            if img:
                seen_urls.add(url)
                part = f"![source-image]({img})\n\n" + part.lstrip()
            break

        new_parts.append(part)

    return "\n---\n".join(new_parts)


def run(draft: str, items: list[dict]) -> tuple[str, str | None]:
    """draft에 섹션 og:image 삽입 + Unsplash 커버 이미지 반환."""
    item_urls = {item["url"] for item in items}

    print("[image_agent] 섹션 이미지 수집 중...")
    draft = insert_section_images(draft, item_urls)

    cover_image = None
    unsplash_key = os.getenv("UNSPLASH_ACCESS_KEY")
    if unsplash_key:
        cover_image = fetch_unsplash_image("artificial intelligence technology", unsplash_key)
        if cover_image:
            print(f"[image_agent] 커버 이미지 획득: {cover_image[:60]}...")

    return draft, cover_image
