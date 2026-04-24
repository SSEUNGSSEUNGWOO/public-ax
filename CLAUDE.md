# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
# 프론트엔드 (포트 3100)
cd frontend
npm run dev       # http://localhost:3100
npm run build
npm run lint

# AI 파이프라인
cd ai-service
python insights/run.py                  # 인사이트 생성 (일일 자동화)
python guides/run.py "RAG"              # 가이드 생성 (주제 입력)
python guides/publish.py list           # 가이드 목록 (draft/published)
python guides/publish.py <slug>         # draft → published
python guides/publish.py unpublish <slug>
python shared/upload_to_supabase.py     # 로컬 JSON → Supabase 업로드
```

## 모노레포 구조

```
public-ax/
├── frontend/        Next.js 16 + Tailwind CSS 4 + shadcn/ui
│   ├── app/         App Router 페이지
│   ├── components/  UI 컴포넌트 (champion/, insights/, shared/, ui/)
│   └── lib/         데이터 레이어 (guides.ts, insights.ts, supabase/)
├── ai-service/      Python AI 파이프라인
│   ├── insights/    일일 인사이트 자동 생성
│   │   ├── crawlers/   6개 크롤러 (arxiv, github_trending, ai_news, ai_blogs, huggingface, kr_ai_policy)
│   │   ├── writer/     Claude CLI로 클러스터링 → 리포트 작성
│   │   ├── image_agent/ Unsplash 커버 이미지 선택
│   │   ├── proofreader/ 오탈자·문체 교정
│   │   ├── evaluator/  rubric.yaml 기준 품질 평가
│   │   ├── newsletter/ Resend로 이메일 발송
│   │   └── run.py     전체 파이프라인 진입점
│   ├── guides/      주제별 가이드 생성
│   │   ├── writer.py   DuckDuckGo 검색 → 아티클 수집 → 가이드 초안 작성
│   │   ├── editor/     템플릿 구조 교정
│   │   ├── evaluator/  rubric.yaml 품질 평가
│   │   ├── publish.py  draft/published 상태 관리
│   │   ├── data/       수집 캐시 ({topic}.json)
│   │   └── run.py     진입점
│   └── shared/      공통 모듈
│       ├── models.py       RawItem, Insight 데이터 모델
│       ├── storage.py      로컬 JSON 저장소 추상화
│       ├── supabase_client.py
│       └── upload_to_supabase.py
├── .env            루트에 위치, frontend/next.config.ts에서 로드
└── frontend/content/guides.json  가이드 로컬 저장소
```

## 핵심 아키텍처

### Claude CLI vs API 규칙 (중요)
- **insights + guides 파이프라인**: `claude` CLI 서브프로세스 사용 (Anthropic Max 구독 소비, API 크레딧 사용 금지)
- subprocess 실행 시 반드시 `ANTHROPIC_API_KEY`를 env에서 제거:
  ```python
  env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}
  result = subprocess.run(["claude", "-p", prompt], env=env, ...)
  ```
- `ANTHROPIC_API_KEY`는 인사이트 파이프라인에서도 쓰지 않는다. `os.environ.pop("ANTHROPIC_API_KEY", None)`을 `run.py` 상단에 배치.

### 인사이트 파이프라인 흐름
```
크롤러 6개 (병렬) → Writer (클러스터링 + 리포트) → Image Agent → Proofreader → Evaluator → 저장/발송
```
- 평가 통과 기준: 4.0/5.0 (`insights/evaluator/rubric.yaml`)
- 평가 미달 시 최대 3회 Writer 재실행 (피드백 반영)
- 발행된 인사이트는 `ai-service/insights/data/insights.json` → Supabase `insights` 테이블

### 가이드 파이프라인 흐름
```
주제 입력 → DuckDuckGo 검색 (영문 AI 사이트) + YouTube 검색 (한국어 우선) → 캐시 저장 → Writer → Evaluator → Editor → guides.json (draft)
```
- 평가 통과 기준: 4.0/5.0 (`guides/evaluator/rubric.yaml`)
- 가이드 body에 `{{image:id}}` 플레이스홀더 삽입, 이미지는 별도 수동 생성
- 이미지 URL은 `/guides/{slug}-{id}.png` 형식으로 자동 세팅
- 프론트엔드는 Supabase `guides` 테이블에서 `status = "published"`인 것만 표시

### 데이터 레이어
- `frontend/lib/guides.ts`, `frontend/lib/insights.ts`: Supabase에서 데이터 읽는 유일한 접점
- `lib/supabase/server.ts`: 서버 컴포넌트용 (SSR), `anon key` 사용
- `lib/guides.ts`, `lib/insights.ts`: `SUPABASE_SERVICE_ROLE_KEY` 사용 (서버 전용)
- `.env`는 루트에 하나만. `frontend/next.config.ts`가 `loadEnvConfig("../")` 로 읽음

### 프론트엔드 패턴
- 모든 데이터 페이지는 `export const dynamic = "force-dynamic"` 사용 (ISR 미적용)
- 가이드 body는 `{{image:id}}` 기준으로 파싱 후 ReactMarkdown과 `<img>` 혼합 렌더링
- 폰트: 한글 Pretendard 없음, Inter(`--font-sans`) + Playfair Display(`--font-display`)
- shadcn/ui 컴포넌트는 `components/ui/`에 위치, `cn()` 유틸은 `lib/utils.ts`

## 폴더 구조 설계 원칙

코드 작성 전 폴더 구조를 먼저 설계하고 사용자와 합의한다.

## 크롤러 원칙

- 크롤러는 수집만 한다. Claude 호출 금지.
- 수집 결과는 `RawItem` 모델로 통일.
- 중복 방지는 `shared/storage.py`의 seen_hashes 사용.

## 환경변수 (.env 루트)

```
ANTHROPIC_API_KEY=        # insights/guides 파이프라인에서 직접 사용하지 않음
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
UNSPLASH_ACCESS_KEY=
RESEND_API_KEY=
NEWSLETTER_FROM=
NEXT_PUBLIC_SITE_URL=https://public-ax.kr
```
