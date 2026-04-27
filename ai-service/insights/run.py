import concurrent.futures
import os
import re
import sys
from datetime import date
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")
load_dotenv(Path(__file__).parent.parent / ".env", override=False)
os.environ.pop("ANTHROPIC_API_KEY", None)  # Claude CLI는 구독 사용, API 크레딧 금지
sys.path.insert(0, str(Path(__file__).parent))   # ai-service/insights/ (crawlers, writer, evaluator)
sys.path.insert(0, str(Path(__file__).parent.parent))  # ai-service/ (shared)

from crawlers.arxiv import crawler as arxiv
from crawlers.github_trending import crawler as github
from crawlers.ai_news import crawler as ai_news
from crawlers.ai_blogs import crawler as ai_blogs
from crawlers.huggingface import crawler as huggingface
from crawlers.kr_ai_policy import crawler as kr_ai_policy
from writer.writer import run as writer_run
from image_agent.image_agent import run as image_agent_run
from proofreader.proofreader import run as proofreader_run
from evaluator.evaluator import run as evaluator_run
from shared.storage import load_draft_meta, load_raw_items, save_draft, save_insight
from shared.models import Insight
from newsletter.sender import send_newsletter
from shared.supabase_client import get_client as get_supabase
from shared.indexer import chunk_insight, chunk_raw_items, upsert_chunks


CRAWLERS = [arxiv, github, ai_news, ai_blogs, huggingface, kr_ai_policy]


def run_crawlers():
    print("\n=== [1/3] 크롤러 실행 ===")
    total = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        futures = {executor.submit(crawler.run): crawler.__name__ for crawler in CRAWLERS}
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            try:
                count = future.result()
                total += count
            except Exception as e:
                print(f"[run] {name} 오류: {e}")
    print(f"=== 크롤러 완료: 총 {total}개 수집 ===\n")
    return total


def run_writer():
    print("=== [2/5] Writer 실행 ===")
    draft = writer_run()
    if not draft:
        print("[run] Writer 결과 없음. 종료.")
        sys.exit(1)
    print("=== Writer 완료 ===\n")
    return draft


def run_image_agent():
    print("=== [3/5] Image Agent 실행 ===")
    meta = load_draft_meta()
    draft = meta.get("draft", "")
    items = load_raw_items(today_only=True)
    draft, cover_image = image_agent_run(draft, items)
    save_draft(draft, cover_image=cover_image)
    print("=== Image Agent 완료 ===\n")


def run_proofreader():
    print("=== [4/5] Proofreader 실행 ===")
    meta = load_draft_meta()
    draft = meta.get("draft", "")
    corrected = proofreader_run(draft)
    if corrected != draft:
        from shared.storage import save_draft
        save_draft(corrected, cover_image=meta.get("cover_image"))
    print("=== Proofreader 완료 ===\n")


def run_evaluator():
    print("=== [5/5] Evaluator 실행 ===")
    passed, result = evaluator_run()
    if not passed:
        print("[run] 평가 통과 실패. insights.json에 저장하지 않음.")
        return False, result
    print("=== Evaluator 통과 ===\n")
    return True, result


def extract_sources(draft: str, items: list[dict]) -> list[dict]:
    url_to_item = {item["url"]: item for item in items}
    cited_urls = re.findall(r"https?://[^\s\)\"'\]]+", draft)
    seen = set()
    sources = []
    for url in cited_urls:
        url = url.rstrip(".,;)")
        if url in seen or url not in url_to_item:
            continue
        seen.add(url)
        item = url_to_item[url]
        sources.append({
            "title": item.get("title", url),
            "url": url,
            "source_id": item.get("source_id", ""),
        })
    return sources


def extract_title(draft: str) -> str:
    for line in draft.splitlines():
        line = line.strip()
        if line.startswith("# "):
            title = line.lstrip("# ").strip()
            # "오늘의 헤드라인: " 등 접두어 제거
            for prefix in ["오늘의 헤드라인: ", "오늘의 헤드라인:", "헤드라인: ", "헤드라인:"]:
                if title.startswith(prefix):
                    title = title[len(prefix):].strip()
            return title
    return f"AI 동향 리포트 — {date.today().isoformat()}"


def save_to_insights(result: dict):
    from shared.storage import load_raw_items
    meta = load_draft_meta()
    draft = meta.get("draft", "")
    items = load_raw_items(today_only=False)
    today_items = load_raw_items(today_only=True)
    sources = extract_sources(draft, items)
    insight = Insight(
        title=extract_title(draft),
        body=draft,
        sources=sources,
        published_at=date.today().isoformat(),
        category="daily_report",
        image_url=meta.get("cover_image"),
        evaluation_score=result.get("weighted_score"),
        crawled_count=len(today_items),
    )
    save_insight(insight)
    print(f"[run] insights.json 저장 완료: {insight.slug} ({len(sources)}개 출처)")

    try:
        sb = get_supabase()
        row = {
            "slug": insight.slug,
            "title": insight.title,
            "body": insight.body,
            "sources": insight.sources,
            "published_at": insight.published_at,
            "category": insight.category,
            "image_url": insight.image_url,
            "evaluation_score": insight.evaluation_score,
            "crawled_count": insight.crawled_count,
        }
        sb.table("insights").upsert(row).execute()
        print(f"[run] Supabase 업로드 완료: {insight.slug}")
    except Exception as e:
        print(f"[run] Supabase 업로드 실패 (로컬엔 저장됨): {e}")

    return insight


def run_embedding(insight):
    print("\n=== [6] 임베딩 ===")
    try:
        today_items = load_raw_items(today_only=True)
        raw_chunks = chunk_raw_items(today_items)
        insight_chunks = chunk_insight(
            title=insight.title,
            body=insight.body,
            slug=insight.slug,
            published_at=insight.published_at,
        )
        upsert_chunks(raw_chunks + insight_chunks)
        print(f"=== 임베딩 완료: raw {len(raw_chunks)}개 + insight {len(insight_chunks)}개 ===\n")
    except Exception as e:
        print(f"[run] 임베딩 실패: {e}")


if __name__ == "__main__":
    run_crawlers()
    run_writer()
    run_image_agent()
    run_proofreader()
    passed, result = run_evaluator()
    if passed:
        insight = save_to_insights(result)
        run_embedding(insight)
        send_newsletter(vars(insight))
    else:
        print("[run] 최종 인사이트 저장 생략")
