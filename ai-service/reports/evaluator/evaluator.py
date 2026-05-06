"""
분석 리포트 평가 (Claude CLI)
6개 기준 점수 + 통과 여부 + 피드백
"""
import json
import os
import subprocess
from pathlib import Path

import yaml


def load_rubric() -> dict:
    with open(Path(__file__).parent / "rubric.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)


def evaluate(body: str, analysis: dict, rubric: dict) -> dict:
    criteria_text = "\n".join(
        f"- **{c['name']}** (가중치 {c['weight']}, 최대 {c['max_score']}점): {c['description']}"
        for c in rubric["criteria"]
    )

    prompt = f"""다음 공공 AI 발주 분석 리포트를 아래 루브릭으로 평가해주세요.

## 평가 루브릭
{criteria_text}

## 원본 분석 데이터 (사실성 검증용)
{json.dumps(analysis, ensure_ascii=False, indent=2)[:6000]}

## 리포트 본문
{body}

## 응답 형식 (JSON만 출력)
{{
  "scores": {{
    "factual_accuracy": 0~5,
    "insight_quality": 0~5,
    "readability": 0~5,
    "seo_quality": 0~5,
    "geo_quality": 0~5,
    "human_voice": 0~5
  }},
  "weighted_score": 0~5,
  "pass": true/false,
  "feedback": "개선 피드백 (구체 문장 지목)",
  "strengths": "잘 된 부분"
}}"""

    env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}
    result = subprocess.run(
        ["claude", "-p", "-"],
        input=prompt,
        capture_output=True,
        text=True,
        timeout=180,
        env=env,
        encoding="utf-8",
    )
    if result.returncode != 0:
        raise RuntimeError(f"claude CLI 실패: {result.stderr}")

    output = result.stdout
    start = output.find("{")
    end = output.rfind("}") + 1
    if start == -1:
        raise ValueError("평가 응답에서 JSON 못 찾음")
    return json.loads(output[start:end])
