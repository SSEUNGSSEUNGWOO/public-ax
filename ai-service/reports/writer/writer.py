"""
공공 AI 발주 분석 리포트 Writer (Claude CLI)
"""
import json
import os
import subprocess
from datetime import date

from reports.writer.prompts import FEEDBACK_SECTION_TEMPLATE, SYSTEM_PROMPT, WRITER_PROMPT_TEMPLATE


def run_claude(prompt: str, timeout: int = 300) -> str:
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


def write(analyst_output: dict, analysis: dict, report_date: str | None = None, feedback: str = "") -> str:
    feedback_section = FEEDBACK_SECTION_TEMPLATE.format(feedback=feedback) if feedback else ""
    prompt = SYSTEM_PROMPT + "\n\n" + WRITER_PROMPT_TEMPLATE.format(
        analyst_output=json.dumps(analyst_output, ensure_ascii=False, indent=2),
        analysis_json=json.dumps(analysis, ensure_ascii=False, indent=2)[:5000],
        report_date=report_date or date.today().isoformat(),
        feedback_section=feedback_section,
    )
    return run_claude(prompt)
