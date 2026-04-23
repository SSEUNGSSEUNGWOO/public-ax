import glob
import json
import re
import subprocess
import tempfile
import time
from datetime import date
from pathlib import Path

import yt_dlp

GUIDES_PATH = Path(__file__).resolve().parents[2] / "frontend" / "content" / "guides.json"
CACHE_DIR = Path(__file__).parent / "data"
MAX_TRANSCRIPT_CHARS = 15000


def _cache_path(topic: str) -> Path:
    safe = re.sub(r"[^\w가-힣]", "_", topic.lower().strip())
    return CACHE_DIR / f"{safe}.json"


def load_cache(topic: str) -> dict | None:
    path = _cache_path(topic)
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return None


def save_cache(topic: str, videos: list[dict], transcripts: list[str]) -> None:
    CACHE_DIR.mkdir(exist_ok=True)
    data = {"topic": topic, "videos": videos, "transcripts": transcripts}
    _cache_path(topic).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  → 캐시 저장: {_cache_path(topic).name}")


def search_videos(topic: str, n: int = 3) -> list[dict]:
    query = f"{topic} explained tutorial"
    opts = {"quiet": True, "no_warnings": True, "extract_flat": True}
    with yt_dlp.YoutubeDL(opts) as ydl:
        results = ydl.extract_info(f"ytsearch{n}:{query}", download=False)

    videos = []
    for entry in (results.get("entries") or []):
        vid_id = entry.get("id") or entry.get("url", "").split("v=")[-1]
        if not vid_id:
            continue
        videos.append({
            "id": vid_id,
            "title": entry.get("title", ""),
            "url": f"https://www.youtube.com/watch?v={vid_id}",
            "channel": entry.get("uploader") or entry.get("channel") or "",
        })
    return videos[:n]


def _parse_vtt(vtt: str) -> str:
    lines = []
    for line in vtt.splitlines():
        if "-->" in line or line.startswith("WEBVTT") or line.startswith("Kind:") or line.startswith("Language:"):
            continue
        clean = re.sub(r"<[^>]+>", "", line).strip()
        if clean:
            lines.append(clean)
    return " ".join(dict.fromkeys(lines))  # 중복 제거


def get_transcript(video_id: str) -> str | None:
    url = f"https://www.youtube.com/watch?v={video_id}"
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            opts = {
                "quiet": True,
                "no_warnings": True,
                "skip_download": True,
                "writeautomaticsub": True,
                "writesubtitles": True,
                "subtitleslangs": ["en"],
                "subtitlesformat": "vtt",
                "outtmpl": f"{tmpdir}/%(id)s",
                "cookiesfrombrowser": ("chrome",),
            }
            with yt_dlp.YoutubeDL(opts) as ydl:
                ydl.download([url])

            files = glob.glob(f"{tmpdir}/*.vtt")
            if not files:
                return None

            raw = open(files[0], encoding="utf-8").read()
            text = _parse_vtt(raw)
            return text[:MAX_TRANSCRIPT_CHARS] if text else None
    except Exception:
        return None


def write(topic: str, videos: list[dict], transcripts: list[str], feedback: str = "") -> dict:
    transcript_block = ""
    for i, (v, t) in enumerate(zip(videos, transcripts), 1):
        transcript_block += f"\n\n[영상 {i}: {v['title']} — {v['channel']}]\n{t}"

    feedback_block = f"\n\n## 이전 평가 피드백 (반드시 반영)\n{feedback}" if feedback else ""

    prompt = f"""다음은 "{topic}"에 관한 해외 YouTube 영상 {len(videos)}개의 자막입니다.
이 내용을 바탕으로 대한민국 공공기관 실무자를 위한 한국어 가이드 초안을 작성하세요.
{feedback_block}

{transcript_block}

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
- 영상 내용 재구성 (원문 번역 금지)
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
    match = re.search(r"\{[\s\S]+\}", raw)
    if not match:
        raise ValueError(f"JSON 파싱 실패:\n{raw}")

    guide = json.loads(match.group())
    guide["published_at"] = date.today().isoformat()
    guide["status"] = "draft"
    guide["videos"] = [
        {"title": v["title"], "url": v["url"], "channel": v["channel"]}
        for v in videos
    ]
    return guide


def save(guide: dict) -> None:
    guides = []
    if GUIDES_PATH.exists():
        guides = json.loads(GUIDES_PATH.read_text(encoding="utf-8"))

    guides = [g for g in guides if g.get("slug") != guide["slug"]]
    guides.insert(0, guide)
    GUIDES_PATH.write_text(json.dumps(guides, ensure_ascii=False, indent=2), encoding="utf-8")
