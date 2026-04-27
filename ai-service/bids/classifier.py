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
    "AI 정책/연구용역",
    "AI 교육/컨설팅",
    "디지털 전환",
    "기타 AI",
]

PROMPT_TEMPLATE = """다음 공공 입찰공고를 아래 카테고리 중 정확히 하나로 분류하세요.

## 카테고리 (정확히 이 목록 중 하나)
{categories}

## 카테고리 가이드
- LLM/생성형 AI: 챗봇, 문서 생성·요약, 글쓰기, 생성형 AI 활용 (단, 검색·QA가 핵심이면 RAG로)
- RAG/지식 검색: 사내 지식관리, AI 검색, 문서·법령 기반 질의응답 (생성형 AI여도 검색·QA가 핵심이면 여기)
- 컴퓨터 비전: CCTV·영상 분석, 객체 감지, OCR, 이미지 인식
- 음성/STT: 음성인식, AI 콜센터, 자막 자동화, TTS, 통번역
- 빅데이터 분석: 데이터 플랫폼, BI, 통계분석, 예측 모델, AI 학습용 데이터셋 구축·제공
- AI 인프라/MLOps: GPU 서버, AI 학습환경, 모델 운영 인프라, 클라우드 컴퓨팅 인프라
- AI 정책/연구용역: AI 윤리·정책 연구, 자문, 동향 조사 (예측 모델 개발 연구는 빅데이터 분석)
- AI 교육/컨설팅: 공무원·시민 AI 교육, AI 인재 양성, DX 컨설팅, 전시·홍보
- 디지털 전환: 일반 행정/업무 시스템 디지털화, 홈페이지 클라우드 전환 (AI 명시 약함)
- 기타 AI: AI 라이선스·소프트웨어 단순 구매, AI 명시 없거나 본질이 비-AI인 사업

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
            ["claude", "-p", _build_prompt(bid), "--model", model],
            capture_output=True,
            text=True,
            timeout=60,
            env=env,
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
