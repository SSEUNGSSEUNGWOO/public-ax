import os
import re

from shared.utils import fetch_og_image, fetch_unsplash_image


def insert_section_images(draft: str, item_urls: set[str]) -> str:
    """--- 구분선 기준으로 섹션 분리 후 각 섹션 앞에 og:image 삽입."""
    parts = re.split(r'\n---\n', draft)

    url_pattern = re.compile(r'\[([^\]]+)\]\((https?://[^\)]+)\)')
    seen_urls: set[str] = set()

    new_parts = []
    for part in parts:
        # 번호 항목 섹션인지 확인 (N. 또는 N. ### 로 시작)
        if not re.search(r'^\d+\.', part.strip()):
            new_parts.append(part)
            continue

        for m in url_pattern.finditer(part):
            url = m.group(2)
            if url not in item_urls or url in seen_urls or len(seen_urls) >= 3:
                continue
            img = fetch_og_image(url)
            if img:
                seen_urls.add(url)
                part = f"![source-image]({img})\n\n" + part.lstrip()
            break

        new_parts.append(part)

    return "\n---\n".join(new_parts)


def run(draft: str, items: list[dict]) -> tuple[str, str | None]:
    """draft에 섹션 이미지 삽입 + Unsplash 커버 이미지 반환."""
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
