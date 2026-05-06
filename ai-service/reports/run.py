"""
공공 AI 발주 월간 분석 리포트 파이프라인

흐름:
1. analyzer: 최근 30일 vs 직전 90일 평균 통계
2. writer: Claude CLI로 마크다운 본문 (차트 placeholder 포함)
3. evaluator: 6기준(factual·insight·readability·seo·geo·human_voice) 점수
   - 미달 시 writer 재실행 (max 3)
4. reviewer: 최종 검수·polish
5. DB upsert (proc_reports)

사용:
    python reports/run.py            # 자동 발행 (today 기준)
    python reports/run.py --dry-run  # 저장 없이 출력만
"""
import argparse
import os
import sys
from datetime import date
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")
load_dotenv(Path(__file__).parent.parent / ".env", override=False)
os.environ.pop("ANTHROPIC_API_KEY", None)  # Claude CLI는 Max 구독 사용

sys.path.insert(0, str(Path(__file__).parent.parent))  # ai-service/

from reports.analyzer import analyze
from reports.analyst.analyst import analyze_signals
from reports.writer.writer import write
from reports.evaluator.evaluator import evaluate, load_rubric
from reports.reviewer.reviewer import review
from shared.db import get_conn


def slugify(s: str) -> str:
    import re
    s = s.strip().lower()
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[^\w가-힣\-]", "", s)
    return s[:120]


def extract_title(body: str) -> str:
    for line in body.split("\n"):
        m = line.strip()
        if m.startswith("# "):
            return m[2:].strip()
    return ""


def run(dry_run: bool = False) -> dict:
    today = date.today()

    print("=== [1/5] Analyzer (통계) ===", flush=True)
    analysis = analyze(today=today)
    print(
        f"  최근 30일: {analysis['summary']['recent_total']}건 / "
        f"직전 90일 월평균: {analysis['summary']['baseline_monthly_avg']}건",
        flush=True,
    )
    print(f"  Hot: {len(analysis['hot_categories'])}개 / Cold: {len(analysis['cold_categories'])}개", flush=True)

    print("\n=== [2/5] Data Analyst (Claude CLI) ===", flush=True)
    analyst_output = analyze_signals(analysis)
    print(f"  헤드라인: {analyst_output.get('headline', '')[:80]}", flush=True)
    print(f"  핵심 신호: {len(analyst_output.get('key_signals', []))}개", flush=True)

    print("\n=== [3/5] Writer ===", flush=True)
    body = write(analyst_output, analysis, report_date=today.isoformat())
    print(f"  본문 길이: {len(body)}자", flush=True)

    print("\n=== [4/5] Evaluator ===", flush=True)
    rubric = load_rubric()
    max_retries = rubric.get("max_retries", 3)
    threshold = rubric.get("pass_threshold", 4.0)

    eval_result = None
    for attempt in range(1, max_retries + 1):
        print(f"  평가 시도 {attempt}/{max_retries}", flush=True)
        eval_result = evaluate(body, analysis, rubric)
        score = eval_result.get("weighted_score", 0)
        passed = eval_result.get("pass", False) and score >= threshold
        print(f"  점수: {score:.2f} / 통과: {passed}", flush=True)
        print(f"  피드백: {eval_result.get('feedback', '')[:200]}...", flush=True)
        if passed:
            break
        if attempt < max_retries:
            print("  피드백 반영하여 재작성...", flush=True)
            body = write(analyst_output, analysis, report_date=today.isoformat(), feedback=eval_result.get("feedback", ""))

    if not eval_result or not (eval_result.get("pass", False) and eval_result.get("weighted_score", 0) >= threshold):
        print("  ⚠️ 평가 통과 못 함. 마지막 본문으로 진행.", flush=True)

    print("\n=== [5/5] Reviewer ===", flush=True)
    final_body = review(body, analysis)
    print(f"  최종 본문 길이: {len(final_body)}자", flush=True)

    title = extract_title(final_body) or f"{today.year}년 {today.month}월 공공 AI 발주 동향"
    slug = f"{today.year}-{today.month:02d}-" + slugify(title)[:80]

    record = {
        "id": slug,
        "slug": slug,
        "title": title,
        "body": final_body,
        "data": analysis,
        "period_start": analysis["period"]["start"],
        "period_end": analysis["period"]["end"],
        "baseline_start": analysis["period"]["baseline_start"],
        "baseline_end": analysis["period"]["baseline_end"],
        "evaluation_score": eval_result.get("weighted_score") if eval_result else None,
        "status": "draft",
    }

    if dry_run:
        print("\n=== DRY RUN -- DB 저장 생략 ===", flush=True)
        print(f"제목: {title}")
        print(f"슬러그: {slug}")
        print("\n--- 본문 미리보기 (앞 500자) ---")
        print(final_body[:500])
        return record

    print("\n=== DB upsert ===", flush=True)
    from psycopg2.extras import Json
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO proc_reports (id, slug, title, body, data,
                                          period_start, period_end,
                                          baseline_start, baseline_end,
                                          evaluation_score, status)
                VALUES (%(id)s, %(slug)s, %(title)s, %(body)s, %(data)s,
                        %(period_start)s, %(period_end)s,
                        %(baseline_start)s, %(baseline_end)s,
                        %(evaluation_score)s, %(status)s)
                ON CONFLICT (id) DO UPDATE SET
                    slug = EXCLUDED.slug,
                    title = EXCLUDED.title,
                    body = EXCLUDED.body,
                    data = EXCLUDED.data,
                    period_start = EXCLUDED.period_start,
                    period_end = EXCLUDED.period_end,
                    baseline_start = EXCLUDED.baseline_start,
                    baseline_end = EXCLUDED.baseline_end,
                    evaluation_score = EXCLUDED.evaluation_score,
                    status = EXCLUDED.status
                """,
                {
                    "id": record["id"],
                    "slug": record["slug"],
                    "title": record["title"],
                    "body": record["body"],
                    "data": Json(record["data"]),
                    "period_start": record["period_start"],
                    "period_end": record["period_end"],
                    "baseline_start": record["baseline_start"],
                    "baseline_end": record["baseline_end"],
                    "evaluation_score": record["evaluation_score"],
                    "status": record["status"],
                },
            )
        conn.commit()
    print(f"  저장 완료: {slug}", flush=True)

    return record


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="저장 없이 본문만 출력")
    args = parser.parse_args()

    try:
        record = run(dry_run=args.dry_run)
        print(f"\n✅ 완료: {record['title']}")
    except Exception as e:
        print(f"\n❌ 실패: {e}", file=sys.stderr)
        raise


if __name__ == "__main__":
    main()
