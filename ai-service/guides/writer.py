import json
import re
import subprocess
import time
from datetime import date
from pathlib import Path

import requests
import yt_dlp
from bs4 import BeautifulSoup

GUIDES_PATH = Path(__file__).resolve().parents[2] / "frontend" / "content" / "guides.json"
CACHE_DIR = Path(__file__).parent / "data"
MAX_ARTICLE_CHARS = 5000
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}


def _cache_path(topic: str) -> Path:
    safe = re.sub(r"[^\w가-힣]", "_", topic.lower().strip())
    return CACHE_DIR / f"{safe}.json"


def load_cache(topic: str) -> dict | None:
    path = _cache_path(topic)
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return None


def save_cache(topic: str, articles: list[dict], texts: list[str], youtube: list[dict]) -> None:
    CACHE_DIR.mkdir(exist_ok=True)
    data = {"topic": topic, "articles": articles, "texts": texts, "youtube": youtube}
    _cache_path(topic).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  → 캐시 저장: {_cache_path(topic).name}")


def search_articles(topic: str, n: int = 6) -> list[dict]:
    """DuckDuckGo HTML 검색으로 관련 아티클 URL 수집."""
    query = f"{topic} explained guide tutorial"
    try:
        resp = requests.get(
            "https://html.duckduckgo.com/html/",
            params={"q": query},
            headers=HEADERS,
            timeout=10,
        )
        soup = BeautifulSoup(resp.text, "html.parser")
        results = []
        for a in soup.select(".result__a"):
            href = a.get("href", "")
            # DuckDuckGo redirect URL 파싱
            if "uddg=" in href:
                from urllib.parse import unquote, urlparse, parse_qs
                qs = parse_qs(urlparse(href).query)
                url = unquote(qs.get("uddg", [""])[0])
            else:
                url = href
            if not url.startswith("http"):
                continue
            # YouTube, Reddit 제외
            if any(x in url for x in ["youtube.com", "reddit.com", "youtu.be"]):
                continue
            title = a.get_text(strip=True)
            results.append({"title": title, "url": url})
            if len(results) >= n:
                break
        return results
    except Exception as e:
        print(f"  [검색 오류] {e}")
        return []


def fetch_article(url: str) -> str | None:
    """URL에서 본문 텍스트 추출."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # 불필요한 태그 제거
        for tag in soup(["script", "style", "nav", "header", "footer", "aside", "form"]):
            tag.decompose()

        # 본문 우선순위: article > main > body
        content = soup.find("article") or soup.find("main") or soup.find("body")
        if not content:
            return None

        text = content.get_text(separator="\n", strip=True)
        # 연속 빈줄 정리
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text[:MAX_ARTICLE_CHARS] if text.strip() else None
    except Exception:
        return None


def search_youtube(topic: str, n: int = 3) -> list[dict]:
    """YouTube 영상 검색 (추천용, 자막 없이 제목/URL만)."""
    query = f"{topic} tutorial"
    opts = {"quiet": True, "no_warnings": True, "extract_flat": True}
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            results = ydl.extract_info(f"ytsearch{n}:{query}", download=False)
        videos = []
        for entry in (results.get("entries") or []):
            vid_id = entry.get("id") or ""
            if not vid_id:
                continue
            videos.append({
                "id": vid_id,
                "title": entry.get("title", ""),
                "url": f"https://www.youtube.com/watch?v={vid_id}",
                "channel": entry.get("uploader") or entry.get("channel") or "",
            })
        return videos[:n]
    except Exception:
        return []


def write(topic: str, articles: list[dict], texts: list[str], youtube: list[dict], feedback: str = "") -> dict:
    article_block = ""
    for i, (a, t) in enumerate(zip(articles, texts), 1):
        article_block += f"\n\n[아티클 {i}: {a['title']}]\n출처: {a['url']}\n\n{t}"

    youtube_block = "\n".join(
        f"- {v['title']} ({v['channel']}) — {v['url']}" for v in youtube
    )

    feedback_block = f"\n\n## 이전 평가 피드백 (반드시 반영)\n{feedback}" if feedback else ""

    prompt = f"""다음은 "{topic}"에 관한 웹 아티클 {len(articles)}개입니다.
이 내용을 바탕으로 대한민국 공공기관 실무자를 위한 한국어 가이드 초안을 작성하세요.
{feedback_block}

{article_block}

---

참고 YouTube 영상 (본문에 추천 링크로 포함 가능):
{youtube_block}

---

아래 JSON 형식으로만 응답하세요.

{{
  "slug": "영문 소문자와 하이픈 (예: what-is-rag)",
  "title": "한국어 제목",
  "summary": "한 문장 요약 (50자 이내)",
  "category": "AI 기초 | 실무 활용 | 기술 심화 중 하나",
  "difficulty": "입문 | 기초 | 심화 중 하나",
  "tags": ["태그1", "태그2", "태그3"],
  "tldr": ["핵심 요약 1", "핵심 요약 2", "핵심 요약 3"],
  "body": "마크다운 본문. ## 섹션 구분. 2000자 이상."
}}

작성 원칙:
- 기술 용어는 처음 등장 시 한국어로 풀어 설명
- 공공기관 실무 활용 예시 최소 2개
- 아티클 내용 재구성 (원문 번역 금지)
- YouTube 영상은 본문 내 관련 섹션에 자연스럽게 추천
- AI 상투어 금지: '살펴보겠습니다', '알아보겠습니다', '중요한 시사점' 등"""

    result = subprocess.run(
        ["claude", "-p", prompt],
        capture_output=True,
        text=True,
        timeout=180,
    )

    if result.returncode != 0:
        raise RuntimeError(f"claude CLI 실패: {result.stderr}")

    raw = result.stdout

    # ```json ... ``` 블록 우선 추출
    code_match = re.search(r"```(?:json)?\s*(\{[\s\S]+?\})\s*```", raw)
    json_str = code_match.group(1) if code_match else None

    if not json_str:
        match = re.search(r"\{[\s\S]+\}", raw)
        if not match:
            raise ValueError(f"JSON 파싱 실패:\n{raw}")
        json_str = match.group()

    try:
        guide = json.loads(json_str)
    except json.JSONDecodeError:
        # body 필드 내 줄바꿈/따옴표 문제 완화 후 재시도
        json_str = re.sub(r'(?<!\\)\n', '\\n', json_str)
        guide = json.loads(json_str)
    guide["published_at"] = date.today().isoformat()
    guide["status"] = "draft"
    guide["videos"] = [
        {"title": v["title"], "url": v["url"], "channel": v["channel"]}
        for v in youtube
    ]
    return guide


def save(guide: dict) -> None:
    guides = []
    if GUIDES_PATH.exists():
        guides = json.loads(GUIDES_PATH.read_text(encoding="utf-8"))

    guides = [g for g in guides if g.get("slug") != guide["slug"]]
    guides.insert(0, guide)
    GUIDES_PATH.write_text(json.dumps(guides, ensure_ascii=False, indent=2), encoding="utf-8")
