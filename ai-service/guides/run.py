import sys
import time
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")
sys.path.insert(0, str(Path(__file__).parent.parent))  # ai-service/

from guides.writer import search_videos, get_transcript, write, save, load_cache, save_cache
from guides.evaluator.evaluator import evaluate, load_rubric
from guides.editor.editor import edit


def print_image_prompts(guide: dict) -> None:
    title = guide["title"]
    category = guide["category"]
    slug = guide["slug"]
    print("\n" + "─" * 50)
    print("📸 claude.design 이미지 프롬프트")
    print("─" * 50)
    print(f"\n[1] 커버 이미지 → public/guides/{slug}-cover.png")
    print(f"    공공기관 AI 가이드 커버. 주제: {title}. 미니멀하고 신뢰감 있는 16:9 커버 디자인.")
    print(f"\n[2] 개념 다이어그램 → public/guides/{slug}-diagram.png")
    print(f"    {title}의 핵심 개념을 시각화한 다이어그램. 흐름도 또는 구조도 형태. 16:9.")
    print(f"\n[3] 활용 예시 → public/guides/{slug}-example.png")
    print(f"    한국 공공기관에서 {title}를 활용하는 장면. 실무적인 UI/인포그래픽. 16:9.")
    print(f"\nguides.json의 '{slug}' 항목에 image_cover, image_diagram, image_example 필드 추가")
    print("─" * 50)


def run(topic: str) -> None:
    rubric = load_rubric()
    max_retries = rubric.get("max_retries", 3)

    # ── 1. 영상 수집 (캐시 우선) ──────────────────
    cached = load_cache(topic)
    if cached:
        print(f"\n[캐시] '{topic}' 자막 캐시 발견 → YouTube 요청 생략")
        videos_ok = cached["videos"]
        transcripts = cached["transcripts"]
        for v, t in zip(videos_ok, transcripts):
            print(f"  ✓ {v['title'][:55]} ({len(t):,}자)")
    else:
        print(f"\n[1/3] YouTube 검색: '{topic}'")
        videos = search_videos(topic)
        if not videos:
            print("  ✗ 영상을 찾지 못했습니다.")
            return

        print(f"[2/3] 자막 추출 ({len(videos)}개 영상)")
        transcripts, videos_ok = [], []
        for i, v in enumerate(videos):
            if i > 0:
                time.sleep(3)
            t = get_transcript(v["id"])
            if t:
                print(f"  ✓ {v['title'][:55]} ({len(t):,}자)")
                transcripts.append(t)
                videos_ok.append(v)
            else:
                print(f"  ✗ 자막 없음: {v['title'][:55]}")

        if not transcripts:
            print("  ✗ 자막을 가져올 수 있는 영상이 없습니다.")
            return

        save_cache(topic, videos_ok, transcripts)

    # ── 2. Writer + Evaluator 루프 ────────────────
    print(f"\n[3/3] 파이프라인 시작")
    feedback = ""
    guide = None

    for attempt in range(1, max_retries + 1):
        print(f"\n  [Writer] 초안 작성 중... (시도 {attempt}/{max_retries})")
        guide = write(topic, videos_ok, transcripts, feedback)
        print(f"  [Writer] 완료: {guide['title']}")

        print(f"  [Evaluator] 평가 중...")
        score, passed, feedback = evaluate(guide)
        print(f"  [Evaluator] 점수: {score:.2f} / 통과: {'✓' if passed else '✗'}")

        if passed:
            break
        if attempt < max_retries:
            print(f"  [Evaluator] 피드백: {feedback}")
            print(f"  → 재작성 요청")
        else:
            print(f"  [Evaluator] 최대 재시도 도달, 현재 버전으로 진행")

    # ── 3. Editor ────────────────────────────────
    print(f"\n  [Editor] 템플릿 정리 + 오탈자 교정 중...")
    guide = edit(guide)
    print(f"  [Editor] 완료")

    guide["evaluation_score"] = round(score, 2)
    save(guide)

    print(f"\n✅ 저장 완료: [{guide['category']}] {guide['title']} (평가 {score:.2f}점)")
    print(f"   참고 영상 {len(guide['videos'])}개 포함")

    print_image_prompts(guide)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python guides/run.py <주제>")
        print("예시:   python guides/run.py 'RAG'")
        sys.exit(1)

    run(" ".join(sys.argv[1:]))
