"""
Data Analyst Agent (Claude CLI)

analyzer.py의 raw 통계를 받아:
1. 의미 있는 신호 5~7개 추출 (단순 outlier가 아닌 "왜 의미 있는지" 해석)
2. 각 신호에 적합한 차트 타입 제안
3. 입찰 참여자 시사점
4. 리포트 narrative 구조 제안
5. 헤드라인 후보

JSON으로 구조화된 분석 결과를 Writer에게 전달.
"""
import json
import os
import subprocess


SYSTEM_PROMPT = """당신은 대한민국 공공 AI 발주 시장 데이터 애널리스트입니다.
입찰 참여자(IT 업체·SI·컨설팅사) 1순위 관점에서 데이터를 해석합니다.

원칙:
- 단순 outlier 나열이 아닌 "왜 이런 변화가 의미 있는지" 시장 맥락에서 해석
- 입찰 참여자가 다음 행동에 옮길 시사점 도출
- 사실 기반: 데이터에 없는 추측은 명시적으로 "...로 보인다" 표시
- 한국 공공 조달 사이클(회계연도, 예산 절벽, 봄철 발주 폭증) 같은 맥락 반영"""


ANALYST_PROMPT = """다음은 최근 30일 vs 직전 90일 평균을 비교한 공공 AI 발주 통계입니다.
이 데이터에서 의미 있는 신호를 추출하고 분석 결과를 JSON으로 응답하세요.

## Raw 통계 데이터

{analysis_json}

## 카테고리 가이드 (분류 의미)

- LLM/생성형 AI: 챗봇·문서요약·생성형 AI 활용
- RAG/지식 검색: AI 기반 문서·법령 검색·QA
- 컴퓨터 비전: CCTV·영상·이미지 인식
- 음성/STT: 음성인식·콜센터·통번역
- 빅데이터 분석: 데이터 플랫폼·통계·예측 모델
- AI 인프라/MLOps: GPU 서버·학습환경·운영 인프라
- AI 자율주행/로봇: 자율주행·로봇·자율 운영
- AI 의료/헬스케어: 의료 영상·헬스케어 AI
- AI 보안: 보안·이상 탐지
- AI 정책/연구용역: 정책 연구·자문·동향 조사
- AI 교육/컨설팅: 시민·공무원 교육·DX 컨설팅
- 디지털 전환: 일반 행정·시스템 디지털화
- 기타 AI: 명확히 분류 안 되는 AI 사업

## 응답 형식 (JSON만 출력)

{{
  "headline": "헤드라인 1줄 (가장 큰 변화 + 시사점)",
  "summary": "전체 흐름 1~2문단 (200~400자, prose)",
  "key_signals": [
    {{
      "title": "신호 제목 (예: 'AI 정책/연구용역 폭증')",
      "evidence": "수치 근거 (예: '최근 30일 702건 vs 직전 90일 평균 64건')",
      "interpretation": "왜 이 변화가 생겼는지 시장 맥락에서 해석",
      "implication": "입찰 참여자가 어떻게 행동해야 할지 시사점",
      "chart": {{ "type": "bar|hbar|donut|line|bigbids", "dataKey": "hot_categories|cold_categories|top_agencies|large_bids|monthly_trend|biz_distribution|new_categories|disappeared_categories" }}
    }}
    // 5~7개
  ],
  "narrative_sections": [
    {{ "heading": "## 🔥 Hot 카테고리", "focus": "이 섹션에서 강조할 신호의 인덱스 [0,1]" }},
    {{ "heading": "## ❄️ Cold 카테고리", "focus": "[2]" }},
    {{ "heading": "## 🎯 주목할 발주처", "focus": "[3]" }},
    {{ "heading": "## 💰 큰 사업 Top", "focus": "[4]" }},
    {{ "heading": "## 📊 시장 시그널 (종합)", "focus": "[]" }}
  ],
  "tone": "사실 기반 + 입찰 참여자 행동 가이드"
}}

## 주의
- key_signals는 5~7개 (너무 많으면 산만)
- chart.dataKey는 위 분석 데이터의 실제 키 이름과 일치해야 함
- 추측 시 "...로 보인다", "...일 가능성"으로 명시
- 데이터에 없는 사실 만들지 말 것"""


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


def analyze_signals(analysis: dict) -> dict:
    """raw 통계 → 구조화된 분석 결과 (key_signals, narrative_sections, headline)"""
    prompt = SYSTEM_PROMPT + "\n\n" + ANALYST_PROMPT.format(
        analysis_json=json.dumps(analysis, ensure_ascii=False, indent=2),
    )
    output = run_claude(prompt)
    start = output.find("{")
    end = output.rfind("}") + 1
    if start == -1:
        raise ValueError("Analyst 응답에서 JSON 못 찾음")
    return json.loads(output[start:end])
