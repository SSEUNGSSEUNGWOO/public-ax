# PUBLIC-AX

대한민국 공공부문 AI 전환(AX)을 지원하는 통합 플랫폼.
케이브레인 AI퍼블릭센터가 운영합니다.

---

## 구조

```
public-ax/
├── frontend/        Next.js 웹 앱
├── ai-service/      AI 파이프라인
│   ├── insights/    일일 인사이트 자동 생성
│   └── guides/      가이드 자동 생성
└── .env             API 키 설정
```

---

## 환경 설정

`.env` 파일 (루트):

```env
ANTHROPIC_API_KEY=        # 인사이트 writer에서 사용 (guides는 claude CLI 사용)
UNSPLASH_ACCESS_KEY=
RESEND_API_KEY=           # 뉴스레터 발송
NEWSLETTER_FROM=PUBLIC-AX <newsletter@public-ax.kr>
NEXT_PUBLIC_SITE_URL=https://public-ax.kr
```

의존성 설치:

```bash
# Python
pip install anthropic yt-dlp youtube-transcript-api pyyaml python-dotenv resend

# Node (프론트엔드)
cd frontend && npm install
```

---

## 인사이트 파이프라인

매일 공공 AI 동향을 수집·분석·작성하는 자동화 파이프라인.

### 흐름

```
크롤러 6개 (병렬)
  arxiv / github_trending / ai_news / ai_blogs / huggingface / kr_ai_policy
    ↓
Writer        Claude API로 클러스터링 → 리포트 초안 작성
    ↓
Image Agent   Unsplash에서 커버 이미지 선택
    ↓
Proofreader   오탈자·문체 교정
    ↓
Evaluator     rubric.yaml 기준 품질 평가 (미달 시 Writer 재실행, 최대 3회)
    ↓
저장 + 뉴스레터 발송
```

### 실행

```bash
cd ai-service
python insights/run.py
```

### 출력

- `ai-service/insights/data/insights.json` — 발행된 인사이트 목록
- `frontend`에서 `/insights` 페이지로 자동 노출

### 평가 기준 (`insights/evaluator/rubric.yaml`)

| 항목 | 설명 |
|------|------|
| factual_accuracy | 출처 명확, 과장 없음 |
| relevance | 한국 공공 AI 맥락에서 유용 |
| insight_quality | 단순 요약 이상, 시사점 포함 |
| source_linkage | 실제 존재하는 URL만 사용 |
| seo_quality | 키워드 포함, 구조 최적화 |
| human_voice | AI 상투어 없는 자연스러운 문체 |

통과 기준: 가중 평균 **4.0 / 5.0** 이상

---

## 가이드 파이프라인

주제를 입력하면 해외 YouTube 영상 3개를 기반으로 공공기관 실무자용 한국어 가이드를 자동 생성.

### 흐름

```
주제 입력 (예: "RAG")
    ↓
YouTube 검색 → 상위 3개 영상 선택 (yt-dlp)
    ↓
자막 추출 → 캐시 저장 (guides/data/{topic}.json)
    ↓
Writer        claude CLI로 한국어 가이드 초안 작성
    ↓
Evaluator     rubric.yaml 기준 품질 평가 (미달 시 Writer 재실행, 최대 3회)
    ↓
Editor        템플릿 구조 맞춤 + 오탈자 교정
    ↓
draft 상태로 저장 → 검토 후 발행
```

### 실행

```bash
cd ai-service

# 가이드 생성 (draft로 저장)
python guides/run.py "RAG"
python guides/run.py "프롬프트 엔지니어링"
python guides/run.py "vector database"

# 목록 확인 (draft / published 구분)
python guides/publish.py list

# 검토 후 발행
python guides/publish.py what-is-rag

# 발행 취소
python guides/publish.py unpublish what-is-rag
```

### 출력

- `frontend/content/guides.json` — 가이드 목록 (status: draft | published)
- `published` 상태만 `/guide` 페이지에 노출
- 실행 완료 시 claude.design용 이미지 프롬프트 3개 출력 (커버 / 다이어그램 / 활용 예시)

### 이미지 추가

가이드 생성 후 출력되는 프롬프트로 claude.design에서 이미지 제작 후:

1. `frontend/public/guides/{slug}-cover.png` 등으로 저장
2. `guides.json`의 해당 항목에 `image_cover`, `image_diagram`, `image_example` 필드 추가

### 자막 캐시

동일 주제 재실행 시 YouTube 재요청 없이 캐시 사용:
- 저장 위치: `ai-service/guides/data/{topic}.json`
- YouTube rate limit(429) 발생 시 잠시 후 재시도

### 평가 기준 (`guides/evaluator/rubric.yaml`)

| 항목 | 설명 |
|------|------|
| accuracy | YouTube 영상 내용 정확 반영 |
| public_sector_relevance | 공공기관 맥락·활용 예시 포함 |
| user_friendliness | 비전문가도 이해 가능한 설명 |
| structure | 섹션 구조·TL;DR 포함 여부 |
| korean_naturalness | 자연스러운 한국어, AI 상투어 없음 |

통과 기준: 가중 평균 **4.0 / 5.0** 이상

---

## 프론트엔드

```bash
cd frontend
npm run dev      # http://localhost:3100
npm run build
npm run start
```

### 주요 페이지

| 경로 | 설명 |
|------|------|
| `/` | 홈 |
| `/insights` | 일일 인사이트 목록 |
| `/insights/[slug]` | 인사이트 상세 |
| `/guide` | 가이드 목록 |
| `/guide/[slug]` | 가이드 상세 |
| `/champions` | AI 챔피언 |
| `/portfolio` | AX 포트폴리오 |
| `/proc` | 정부 AI 공고 |
| `/join` | 커뮤니티 |
| `/about` | 소개 |
