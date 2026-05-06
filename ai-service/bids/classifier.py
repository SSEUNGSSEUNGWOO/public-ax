"""
공공 AI 입찰공고 카테고리 분류기

지원 백엔드:
- anthropic (Haiku 4.5)         : 신규 적재·소량 일괄 분류 (정합성)
- openai    (gpt-4o-mini)       : 대량 일괄 분류 (비용·속도)
- cli       (claude CLI Sonnet) : 일치율 검증용 (Max 구독 사용)
"""
import json
import os
import random
import subprocess
import time
from typing import Optional

CATEGORIES = [
    "LLM/생성형 AI",
    "RAG/지식 검색",
    "컴퓨터 비전",
    "음성/STT",
    "빅데이터 분석",
    "AI 인프라/MLOps",
    "AI 자율주행/로봇",
    "AI 의료/헬스케어",
    "AI 보안",
    "AI 정책/연구용역",
    "AI 교육/컨설팅",
    "디지털 전환",
    "기타 AI",
    "무관",
]

PROMPT_TEMPLATE = """다음 공공 입찰공고를 아래 카테고리 중 정확히 하나로 분류하세요.

## 카테고리 (정확히 이 목록 중 하나)
{categories}

## 카테고리 가이드
- LLM/생성형 AI: 챗봇, 문서 생성·요약, 글쓰기, 생성형 AI 활용 (단, 검색·QA가 핵심이면 RAG로)
- RAG/지식 검색: 사내 지식관리, AI 검색, 문서·법령 기반 질의응답 (생성형 AI여도 검색·QA가 핵심이면 여기)
- 컴퓨터 비전: CCTV·영상 분석, 객체 감지, OCR, 이미지 인식, 위성·항공 영상 AI 분석
- 음성/STT: 음성인식, AI 콜센터, 자막 자동화, TTS, 통번역
- 빅데이터 분석: 데이터 플랫폼, BI, 통계분석, 예측 모델, AI 학습용 데이터셋 구축·제공
- AI 인프라/MLOps: GPU 서버, AI 학습환경, 모델 운영 인프라, 클라우드 컴퓨팅 인프라, AI 데이터센터
- AI 자율주행/로봇: 자율주행, 협동·서비스·산업 로봇, 자율 운영 시스템, 무인 차량/선박/UAV
- AI 의료/헬스케어: 의료 영상 진단, 헬스케어 AI, 병리 분석, 임상 의사결정 지원, AI 신약 개발
- AI 보안: AI 기반 보안·이상 탐지, 침해 대응, AI 보안 정책·기준 수립
- AI 정책/연구용역: AI 윤리·정책 연구, 자문, 동향 조사, 정책 보고서 작성 (예측 모델 개발 연구는 빅데이터 분석)
- AI 교육/컨설팅: 공무원·시민 AI 교육, AI 인재 양성, DX 컨설팅, 전시·홍보
- 디지털 전환: 일반 행정/업무 시스템 디지털화, 홈페이지 클라우드 전환 (AI 명시 약함)
- 기타 AI: AI 사업이 명확하지만 위 12개 어느 하나에도 부합하지 않는 정말 예외적 경우만
- 무관: AI 사업이 아닌 것 (시설공사, 약어 false positive, 단순 비품 구매)

## 분류 결정 규칙 (중요)

1. **"기타 AI"는 마지막 옵션**: 위 12개 카테고리 중 하나라도 부분적으로라도 해당된다면 반드시 그 카테고리를 선택. "AI 통합 솔루션", "AI 시범사업" 같이 추상적이어도 본질적으로 어떤 작업을 하는지(챗봇? 영상분석? 데이터분석?) 추론해 가장 가까운 구체 카테고리로 분류.
2. **"무관" 사용 조건**: 다음 중 하나에만 해당:
   - AI 시설·건물의 건축/인테리어/전기/기계/감리/조경 공사 (예: "AI 데이터센터 신축공사")
   - 약어 false positive: "AIP"(항공정보간행물), "AIS"(선박자동식별), "AI"가 작품·전시·예술 약자, "AIDC"가 자동인식·데이터수집(RFID/바코드)일 때
   - AI와 무관한 단순 비품·소모품 구매, 청소·경비·식자재 용역
   - 단순 번역·교정 용역 (AI 사용 명시 없음)
3. **사업구분이 "용역"이고 제목에 AI 키워드 있으면**: 거의 항상 위 12개 중 하나에 해당. "기타/무관"으로 도피 금지.
4. **불확실하면**: 사업의 핵심 산출물(검색 시스템? 영상 인식? 정책 보고서? 데이터셋? 교육?)을 추론해 가장 가까운 카테고리. 추론이 60% 이상 확신이면 그 카테고리, confidence는 낮게(0.5–0.7) 표시.
5. **자주 헷갈리는 경우**:
   - "AI 활용 OO 연구" → 연구가 정책·자문이면 AI 정책/연구용역, 모델 개발이면 빅데이터 분석
   - "AI 학습용 데이터" → 빅데이터 분석
   - "지능형 CCTV" → 컴퓨터 비전
   - "지능형 업무지원" / "스마트 행정" → LLM/생성형 AI 또는 RAG/지식 검색 (검색이 핵심이면 RAG)
   - "디지털 전환 컨설팅" → AI 교육/컨설팅
   - "AI 도입 가이드라인 수립" → AI 정책/연구용역

## 공고 정보
제목: {title}
발주기관: {agency}
사업구분: {biz_div}
예산: {budget}

## 응답 형식 (JSON만, 다른 텍스트 금지)
{{"category": "정확한 카테고리명", "confidence": 0.0~1.0}}
"""


def _build_prompt(bid: dict) -> str:
    return PROMPT_TEMPLATE.format(
        categories="\n".join(f"- {c}" for c in CATEGORIES),
        title=(bid.get("bid_ntce_nm") or "").strip(),
        agency=(bid.get("ntce_instt_nm") or "-").strip(),
        biz_div=(bid.get("bsns_div_nm") or "-").strip(),
        budget=_format_budget(bid.get("assign_bdgt_amt") or bid.get("presmpt_prce") or ""),
    )


def _parse_response(output: str) -> Optional[dict]:
    start = output.find("{")
    end = output.rfind("}") + 1
    if start == -1:
        return None
    try:
        parsed = json.loads(output[start:end])
    except json.JSONDecodeError:
        return None
    category = (parsed.get("category") or "").strip()
    if category not in CATEGORIES:
        return None
    return {
        "category": category,
        "confidence": float(parsed.get("confidence", 0.0)),
    }


def _backoff(attempt: int, base: float = 2.0, cap: float = 60.0) -> float:
    return min(base ** attempt + random.uniform(0, 1), cap)


def classify_anthropic(bid: dict, model: str = "claude-haiku-4-5", max_retries: int = 6) -> Optional[dict]:
    from anthropic import Anthropic, RateLimitError, APIStatusError
    client = Anthropic()
    title = (bid.get("bid_ntce_nm") or "").strip()
    if not title:
        return None

    for attempt in range(max_retries):
        try:
            response = client.messages.create(
                model=model,
                max_tokens=120,
                messages=[{"role": "user", "content": _build_prompt(bid)}],
            )
            output = response.content[0].text
            return _parse_response(output)
        except RateLimitError:
            time.sleep(_backoff(attempt))
        except APIStatusError as e:
            if e.status_code in (429, 500, 502, 503, 504):
                time.sleep(_backoff(attempt))
            else:
                print(f"[classifier:anthropic] 실패 ({title[:40]}): {e}")
                return None
        except Exception as e:
            print(f"[classifier:anthropic] 실패 ({title[:40]}): {e}")
            return None

    print(f"[classifier:anthropic] 재시도 한도 초과 ({title[:40]})")
    return None


def classify_openai(bid: dict, model: str = "gpt-4o-mini", max_retries: int = 6) -> Optional[dict]:
    from openai import OpenAI, RateLimitError, APIStatusError
    client = OpenAI()
    title = (bid.get("bid_ntce_nm") or "").strip()
    if not title:
        return None

    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model=model,
                max_tokens=120,
                response_format={"type": "json_object"},
                messages=[{"role": "user", "content": _build_prompt(bid)}],
            )
            output = response.choices[0].message.content or ""
            return _parse_response(output)
        except RateLimitError:
            time.sleep(_backoff(attempt))
        except APIStatusError as e:
            if e.status_code in (429, 500, 502, 503, 504):
                time.sleep(_backoff(attempt))
            else:
                print(f"[classifier:openai] 실패 ({title[:40]}): {e}")
                return None
        except Exception as e:
            print(f"[classifier:openai] 실패 ({title[:40]}): {e}")
            return None

    print(f"[classifier:openai] 재시도 한도 초과 ({title[:40]})")
    return None


def classify_cli(bid: dict, model: str = "sonnet") -> Optional[dict]:
    title = (bid.get("bid_ntce_nm") or "").strip()
    if not title:
        return None
    env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}
    try:
        result = subprocess.run(
            ["claude", "-p", "-", "--model", model],
            input=_build_prompt(bid),
            capture_output=True,
            text=True,
            timeout=60,
            env=env,
            encoding="utf-8",
        )
        if result.returncode != 0:
            return None
        return _parse_response(result.stdout)
    except Exception as e:
        print(f"[classifier:cli] 실패 ({title[:40]}): {e}")
        return None


def _format_budget(amt: str) -> str:
    try:
        n = int(amt)
    except (ValueError, TypeError):
        return "-"
    if n >= 100_000_000:
        return f"{n / 100_000_000:.1f}억원"
    if n >= 10_000:
        return f"{n / 10_000:.0f}만원"
    return f"{n:,}원"
