import json
import re
import subprocess
import urllib.error
import urllib.request
import yaml
from pathlib import Path

from shared.storage import load_draft, save_draft


def load_rubric() -> dict:
    with open(Path(__file__).parent / "rubric.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)


def check_urls(draft: str) -> list[str]:
    urls = re.findall(r'\[([^\]]+)\]\((https?://[^\)]+)\)', draft)
    invalid = []
    for _, url in urls:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=8) as resp:
                if resp.status == 404:
                    invalid.append(url)
        except urllib.error.HTTPError as e:
            if e.code in (401, 404):
                invalid.append(url)
        except Exception:
            pass
    return invalid


def evaluate_with_claude_cli(draft: str, rubric: dict) -> dict:
    criteria_text = "\n".join(
        f"- **{c['name']}** (가중치 {c['weight']}, 최대 {c['max_score']}점): {c['description']}"
        for c in rubric["criteria"]
    )

    prompt = f"""다음 AI 인사이트 리포트를 아래 루브릭 기준으로 평가해주세요.

## 평가 루브릭
{criteria_text}

## 리포트
{draft}

## 응답 형식 (JSON만 출력)
{{
  "scores": {{
    "factual_accuracy": 0~5,
    "relevance": 0~5,
    "insight_quality": 0~5,
    "source_linkage": 0~5,
    "seo_quality": 0~5,
    "human_voice": 0~5
  }},
  "weighted_score": 0~5,
  "pass": true/false,
  "feedback": "개선이 필요한 부분 설명 (AI 상투어 발견 시 구체적 문장 지목)",
  "strengths": "잘 된 부분"
}}"""

    result = subprocess.run(
        ["claude", "-p", prompt],
        capture_output=True,
        text=True,
        timeout=120,
    )

    if result.returncode != 0:
        raise RuntimeError(f"claude CLI 실패: {result.stderr}")

    output = result.stdout
    start = output.find("{")
    end = output.rfind("}") + 1
    if start == -1:
        raise ValueError("claude CLI 응답에서 JSON을 찾을 수 없음")

    return json.loads(output[start:end])


def run() -> tuple[bool, dict]:
    rubric = load_rubric()
    draft = load_draft()

    if not draft:
        print("[evaluator] draft 없음")
        return False, {}

    max_retries = rubric.get("max_retries", 3)
    threshold = rubric.get("pass_threshold", 3.5)

    for attempt in range(1, max_retries + 1):
        print(f"[evaluator] 평가 시도 {attempt}/{max_retries}")

        invalid_urls = check_urls(draft)
        if invalid_urls:
            print(f"[evaluator] 유효하지 않은 URL {len(invalid_urls)}개: {invalid_urls}")

        try:
            result = evaluate_with_claude_cli(draft, rubric)
        except Exception as e:
            print(f"[evaluator] 평가 실패: {e}")
            return False, {}

        score = result.get("weighted_score", 0)
        passed = result.get("pass", False) and score >= threshold and not invalid_urls

        print(f"[evaluator] 점수: {score:.2f} / 통과: {passed}")
        print(f"[evaluator] 피드백: {result.get('feedback', '')}")

        if passed:
            return True, result

        if attempt < max_retries:
            feedback = result.get("feedback", "")
            if invalid_urls:
                feedback += f"\n\n다음 URL은 실제로 접근 불가능하므로 반드시 수집 데이터에 있는 실제 URL로 교체하세요: {', '.join(invalid_urls)}"
            print(f"[evaluator] 피드백과 함께 재작성 요청...")
            from writer.writer import run as writer_run
            from image_agent.image_agent import run as image_agent_run
            from shared.storage import load_raw_items, load_draft_meta, save_draft as _save_draft
            draft = writer_run(feedback=feedback)
            if not draft:
                return False, result
            items = load_raw_items(today_only=True)
            meta = load_draft_meta()
            draft, cover_image = image_agent_run(draft, items)
            _save_draft(draft, cover_image=cover_image)

    return False, result
