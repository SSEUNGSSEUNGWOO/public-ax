"""
분석 리포트 검수 에이전트 (Claude CLI)

평가가 통과한 본문을 마지막으로 다듬는다:
- 사실 정확성 미세 보정
- 상투어 1차 제거
- 차트 placeholder 위치 자연스러운지 확인
- 문장 polish (문법·흐름)
"""
import json
import os
import subprocess


REVIEWER_PROMPT_TEMPLATE = """당신은 공공 AI 발주 분석 리포트의 마지막 검수자입니다.
다음 본문을 받아 검수·polish하여 최종본을 출력하세요.

## 원본 분석 데이터 (사실 검증용)
{analysis_summary}

## 본문
{body}

## 검수 지침
1. 데이터에 없는 수치·이름·날짜 발견 시 제거 또는 정정
2. 상투어 제거: "주목할 만합니다", "살펴보겠습니다", "핵심은", "...할 시점이다"
3. 차트 placeholder `{{{{chart:type:dataKey}}}}`는 그대로 유지 (위치만 자연스러운지 확인)
4. H1·H2·H3 구조 유지
5. 마크다운 형식 유지
6. 본문 길이 1,000~1,500자 안에 들도록 미세 조정
7. 글의 톤·구조는 가급적 유지 (큰 재작성 금지)

## 출력
- 최종본 마크다운만 출력. 다른 설명 없음.
- 첫 줄은 `#` h1.
"""


def run_claude(prompt: str, timeout: int = 240) -> str:
    env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}
    result = subprocess.run(
        ["claude", "-p", prompt],
        capture_output=True,
        text=True,
        timeout=timeout,
        env=env,
    )
    if result.returncode != 0:
        raise RuntimeError(f"claude CLI 실패: {result.stderr}")
    return result.stdout


def review(body: str, analysis: dict) -> str:
    summary_keys = ["period", "summary", "hot_categories", "cold_categories", "top_agencies", "large_bids"]
    summary = {k: analysis.get(k) for k in summary_keys}
    prompt = REVIEWER_PROMPT_TEMPLATE.format(
        analysis_summary=json.dumps(summary, ensure_ascii=False, indent=2)[:5000],
        body=body,
    )
    return run_claude(prompt)
