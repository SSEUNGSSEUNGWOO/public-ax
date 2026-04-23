# 공공 AX 커뮤니티 허브 — 프로젝트 계획서

> 대한민국 공공 AI 전환(AX)을 이끄는 **사람과 작품**을 아카이빙하고, 조달 동향·인사이트를 함께 제공하는 커뮤니티형 포털.
> 기존 `public-ax.kr`(노코드 플랫폼 기반)을 재구축하는 프로젝트.

---

## 0. 이 문서의 사용법 (AI 에이전트용)

이 문서는 **Claude Code 또는 유사 CLI 에이전트**가 바로 작업에 착수할 수 있도록 작성되었다. 섹션 순서대로 진행하면 Phase 0 MVP까지 도달한다.

- **반드시 지킬 원칙은 §1**에 있다. 구현 중 의사결정이 필요할 땐 여기로 돌아올 것.
- **작업 순서는 §9의 체크리스트**를 따를 것. 건너뛰지 말 것.
- **기술 스택은 §4에 고정**되어 있다. 임의로 변경하지 말 것.
- 모호한 결정이 필요하면 **"단순한 쪽 / 운영 부담이 적은 쪽"** 을 택할 것.

---

## 1. 프로젝트 원칙 (Non-negotiables)

1. **운영 부담 최소화.** 제작자는 인수인계 후 손을 뗄 수 있어야 한다. 매일 손대야 살아나는 기능은 만들지 않는다.
2. **주연은 "사람(챔피언) + 작품(포트폴리오)"**. 나머지는 조연.
3. **커뮤니티 기능은 사이트 내부에 만들지 않는다.** 카카오 오픈채팅 등 외부 플랫폼으로 링크만 건다.
4. **뉴스레터는 "인사이트"로 리네이밍**. 주기·분량 압박 최소화.
5. **K-AI PROC은 Phase 0부터 Beta 뱃지와 함께 공개**. 완벽 구현 후 공개가 아니다.
6. **모든 섹션은 독립적으로 업데이트 가능**해야 한다. 한 섹션이 멈춰도 다른 섹션이 죽지 않는다.
7. **SEO 기본기(메타태그, OG, sitemap, robots.txt)는 Phase 0부터 필수.**
8. **접근성(a11y) 기본 수준 준수**: 시맨틱 HTML, alt 텍스트, 키보드 네비게이션.

---

## 2. 대상 사용자 (Persona)

| 페르소나 | 니즈 | 주로 쓰는 기능 |
|---|---|---|
| **공공기관 실무자** | 다른 기관 사례 벤치마킹 | 포트폴리오, 인사이트 |
| **AI 수주 희망 기업/프리랜서** | 발주 동향, 낙찰 히스토리 | K-AI PROC, 발주기관 프로필 |
| **정책 연구자·기자** | 통계·트렌드 인용 | 대시보드, 인사이트 |
| **AI 업계 관계자** | 네트워킹, 채용 정보 | 챔피언 프로필, 참여하기 |
| **학생·예비 종사자** | 커리어 롤모델 탐색 | 챔피언 스토리, 포트폴리오 |

**1차 타겟**: 공공기관 실무자 + AI 수주 희망 기업. 이 둘의 동선을 우선 최적화한다.

---

## 3. 정보구조 (IA)

### 3.1 사이트맵

```
/ (메인)
│
├── /champions                  ⭐ 주연: 챔피언 (명예의 전당)
│   ├── /champions              목록 (필터: 연도/분야/기관)
│   └── /champions/[slug]       개인 프로필
│
├── /portfolio                  ⭐ 주연: 포트폴리오
│   ├── /portfolio              목록 (필터: 기술/도메인/연도)
│   └── /portfolio/[slug]       프로젝트 상세
│
├── /insights                   🔸 조연: 인사이트 (구 뉴스레터)
│   ├── /insights               아카이브 목록
│   ├── /insights/[slug]        개별 기사
│   └── /insights/subscribe     구독 (Stibee 임베드)
│
├── /proc                       🔸 조연: K-AI PROC
│   ├── /proc                   대시보드
│   ├── /proc/tenders           입찰공고 리스트
│   ├── /proc/tenders/[id]      공고 상세
│   └── /proc/agencies/[id]     발주기관 프로필 (Phase 2)
│
└── /join                       🔗 참여하기 (커뮤니티 대체)
    └── 카카오 오픈채팅 + 챔피언 지원 + 문의 폼
```

### 3.2 글로벌 내비게이션 (GNB)

```
[로고] 챔피언 | 포트폴리오 | 인사이트 | 조달 | 참여하기     [뉴스레터 구독]
```

- "챔피언"과 "포트폴리오"가 맨 앞 = 사이트의 주연임을 내비게이션으로 선언.
- "뉴스레터 구독"은 GNB 우측 고정 버튼 (모든 페이지에서 접근 가능).

### 3.3 푸터

```
[About] 사이트 소개 / 운영 주체 / 후원·파트너
[Resources] 공공데이터포털 / 나라장터 / 관련 기관
[Legal] 이용약관 / 개인정보처리방침 / 문의
[Social] 카카오 오픈채팅 / GitHub / Email
[© 2026 공공 AX 커뮤니티]
```

---

## 4. 기술 스택 (고정)

| 레이어 | 선택 | 이유 |
|---|---|---|
| **프레임워크** | Next.js 15 (App Router) | SSR/SSG 혼용, SEO 강함 |
| **언어** | TypeScript | 타입 안정성 |
| **스타일** | Tailwind CSS + shadcn/ui | 빠른 개발 + 일관성 |
| **DB** | Supabase (PostgreSQL + pgvector) | Bapmap과 동일 스택 재사용 |
| **인증** | Supabase Auth (Phase 2부터) | Phase 0엔 불필요 |
| **호스팅** | Vercel | Next.js 최적 호스트 |
| **크론** | Vercel Cron 또는 Supabase Edge Function | 크롤러 스케줄링 |
| **뉴스레터** | Stibee 임베드 (무료티어) | 자체 메일 발송 인프라 불필요 |
| **문의 폼** | Google Form 임베드 또는 Formspree | 백엔드 불필요 |
| **분석** | Google Analytics 4 + Vercel Analytics | 이중 수집으로 크로스체크 |
| **차트** | Recharts | shadcn 계열과 잘 맞음 |
| **지도** | (Phase 2) Mapbox 또는 Kakao Maps | 지역현황 시각화 |
| **AI API** | Anthropic Claude API (분류/요약), OpenAI Embedding (유사도) | 기존 경험 있음 |

### 4.1 프로젝트 구조

```
/
├── app/
│   ├── (marketing)/           # 랜딩·소개 페이지 그룹
│   │   ├── page.tsx           # 메인 (/)
│   │   └── about/page.tsx
│   ├── champions/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── portfolio/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── insights/
│   │   ├── page.tsx
│   │   ├── [slug]/page.tsx
│   │   └── subscribe/page.tsx
│   ├── proc/
│   │   ├── page.tsx
│   │   ├── tenders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── agencies/[id]/page.tsx
│   ├── join/page.tsx
│   ├── api/
│   │   ├── cron/
│   │   │   ├── crawl-tenders/route.ts
│   │   │   └── classify-tenders/route.ts
│   │   └── proc/route.ts
│   ├── layout.tsx
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                    # shadcn/ui 컴포넌트
│   ├── marketing/             # 히어로, 피처 섹션 등
│   ├── champion/              # 챔피언 카드, 프로필
│   ├── portfolio/             # 포트폴리오 카드, 상세
│   ├── insights/              # 기사 카드, 구독 폼
│   ├── proc/                  # 대시보드, 테이블, 차트
│   └── shared/                # Nav, Footer, SEO
├── lib/
│   ├── supabase/              # 클라이언트 세팅
│   ├── claude/                # Claude API 래퍼
│   ├── embeddings/            # OpenAI 임베딩
│   ├── narajangto/            # 나라장터 API 클라이언트
│   └── utils.ts
├── scripts/
│   ├── seed-champions.ts      # 초기 데이터 시드
│   └── classify-tenders.ts    # 수동 분류 트리거
├── public/
└── types/
    └── database.ts            # Supabase 자동 생성 타입
```

---

## 5. 데이터베이스 스키마 (Supabase / PostgreSQL)

```sql
-- =====================================================
-- 5.1 챔피언
-- =====================================================
CREATE TABLE champions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,              -- URL용 (ex: "hong-gildong")
  name         TEXT NOT NULL,
  title        TEXT,                              -- 직함
  affiliation  TEXT,                              -- 소속 기관
  bio          TEXT,                              -- 한 줄 소개 (카드용)
  description  TEXT,                              -- 상세 소개 (Markdown)
  photo_url    TEXT,
  year_awarded INT,                               -- 챔피언 선정 연도
  award_type   TEXT,                              -- "정부 챔피언", "민간 챔피언" 등
  domain       TEXT[],                            -- ["교육", "의료", ...]
  links        JSONB,                             -- { "linkedin": "...", "github": "..." }
  featured     BOOLEAN DEFAULT FALSE,             -- 메인 노출용
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_champions_year ON champions(year_awarded DESC);
CREATE INDEX idx_champions_featured ON champions(featured) WHERE featured = TRUE;

-- =====================================================
-- 5.2 포트폴리오 (프로젝트)
-- =====================================================
CREATE TABLE portfolios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  summary       TEXT,                             -- 1-2줄 요약
  description   TEXT,                             -- 상세 (Markdown)
  cover_image   TEXT,
  images        TEXT[],                           -- 추가 이미지
  tech_stack    TEXT[],                           -- ["RAG", "LLM", "FastAPI"]
  domain        TEXT,                             -- "교육" / "의료" / "행정"
  year          INT,
  agency        TEXT,                             -- 발주/수행 기관
  external_url  TEXT,                             -- 외부 링크 (GitHub, 실제 서비스)
  metrics       JSONB,                            -- { "users": 1000, "mrr": 0.79 }
  featured      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portfolios_year ON portfolios(year DESC);
CREATE INDEX idx_portfolios_domain ON portfolios(domain);

-- 챔피언 ↔ 포트폴리오 N:M 관계
CREATE TABLE champion_portfolios (
  champion_id  UUID REFERENCES champions(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  PRIMARY KEY (champion_id, portfolio_id)
);
-- role 컬럼은 Phase 1 이후 필요 시 추가

-- =====================================================
-- 5.3 인사이트 (뉴스레터 / 블로그)
-- =====================================================
CREATE TABLE insights (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  summary      TEXT,
  content      TEXT,                              -- Markdown
  cover_image  TEXT,
  tags         TEXT[],
  author       TEXT,
  published_at TIMESTAMPTZ,
  status       TEXT DEFAULT 'draft',              -- 'draft' | 'published'
  source_type  TEXT,                              -- 'original' | 'curated' (외부 기사 큐레이션)
  source_url   TEXT,                              -- 큐레이션일 경우 원문 링크
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insights_published ON insights(published_at DESC) WHERE status = 'published';

-- =====================================================
-- 5.4 발주기관 프로필 (tenders보다 먼저 생성 — FK 참조)
-- =====================================================
CREATE TABLE agencies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT UNIQUE NOT NULL,
  type          TEXT,                             -- '중앙부처' / '지자체' / '공공기관' / '대학·연구기관'
  region        TEXT,
  total_tenders INT DEFAULT 0,                    -- 집계 캐시
  total_budget  BIGINT DEFAULT 0,                 -- 집계 캐시
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5.5 K-AI PROC: 입찰공고
-- =====================================================
CREATE TABLE tenders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id      TEXT UNIQUE NOT NULL,            -- 나라장터 공고번호
  title          TEXT NOT NULL,
  description    TEXT,
  agency_name    TEXT,                            -- 발주기관명 (정규화 전 원문)
  agency_id      UUID REFERENCES agencies(id),    -- 정규화 후 FK
  budget         BIGINT,                          -- 예산 (원)
  announced_at   TIMESTAMPTZ,
  deadline       TIMESTAMPTZ,
  region         TEXT,
  status         TEXT,                            -- '공고중' / '마감' / '낙찰'
  source_url     TEXT,                            -- 나라장터 원문 링크
  raw_data       JSONB,                           -- 원본 API 응답 전체 보관
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenders_deadline ON tenders(deadline);
CREATE INDEX idx_tenders_agency ON tenders(agency_id);
CREATE INDEX idx_tenders_announced ON tenders(announced_at DESC);

-- AI 분류 결과 (공고와 1:1)
CREATE TABLE tender_classifications (
  tender_id          UUID PRIMARY KEY REFERENCES tenders(id) ON DELETE CASCADE,
  ai_category        TEXT,                        -- 'RAG' | 'LLM' | '문서AI' | 'SI' | '컨설팅'
  tech_keywords      TEXT[],
  domain             TEXT,                        -- '교육' / '의료' / '행정'
  scale              TEXT,                        -- '소' / '중' / '대'
  confidence         FLOAT,
  classifier_version TEXT,                        -- 프롬프트 버전 트래킹
  classified_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 임베딩 (유사 공고 검색용, Phase 2)
CREATE TABLE tender_embeddings (
  tender_id  UUID PRIMARY KEY REFERENCES tenders(id) ON DELETE CASCADE,
  embedding  vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tender_embeddings ON tender_embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =====================================================
-- 5.6 RLS (Row Level Security)
-- =====================================================
-- Phase 0에서는 모든 테이블 public read, service_role만 write
ALTER TABLE champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON champions FOR SELECT USING (true);
CREATE POLICY "public read" ON portfolios FOR SELECT USING (true);
CREATE POLICY "public read published" ON insights FOR SELECT USING (status = 'published');
CREATE POLICY "public read" ON tenders FOR SELECT USING (true);
-- write는 service_role 키를 통해서만 (서버 사이드에서만)
```

---

## 6. 페이지별 상세 명세

### 6.1 메인 페이지 (`/`)

**목적**: 생태계 전체를 30초 안에 조망.

**구성 (위에서 아래 순서)**

1. **Hero Section**
   - 카피: "대한민국 공공 AI를 이끄는 사람들"
   - 서브카피: "챔피언들이 만든 작품과 공공 AX의 현재를 기록합니다"
   - CTA 2개: `[챔피언 보기]` `[뉴스레터 구독]`
   - 배경: 그라데이션 또는 추상적 이미지 (기업 로고 같은 느낌 피하기)

2. **이번 달의 챔피언 (3명 슬라이더 또는 그리드)**
   - `champions` 테이블에서 `featured = true` 우선, 없으면 최신 연도 3명
   - 각 카드: 얼굴 사진(원형) + 이름 + 직함·소속 + 한 줄 소개
   - 클릭 시 `/champions/[slug]`

3. **최근 포트폴리오 (6개 카드 그리드)**
   - `portfolios` 최신순 6개
   - 카드: 커버 이미지 + 제목 + 기술 태그 + 참여 챔피언 이름
   - `/portfolio` 링크

4. **이번 주 인사이트 (2개)**
   - `insights` 최신 2개
   - 카드: 커버 + 제목 + 요약 + 발행일

5. **K-AI PROC 미니 위젯**
   - 3개 숫자만 노출: "이번 달 AI 조달 N건 / NN억 / Top 기관: XX"
   - 우측 `[자세히 보기 →]` 버튼으로 `/proc` 유도

6. **Join CTA**
   - "공공 AI 생태계에 참여하세요"
   - 카카오 오픈채팅 배너 + 챔피언 지원 안내

**성능 목표**
- LCP < 2.5s
- 이미지 Next/Image 최적화 필수
- 위 데이터는 ISR (revalidate 1시간)

---

### 6.2 챔피언 목록 (`/champions`)

**쿼리 파라미터**: `?year=2025&domain=education&agency=...`

**UI**
- 상단 필터 바: 연도 드롭다운 / 분야 칩 / 기관 검색
- 카드 그리드 (3열 데스크탑 / 1열 모바일)
- 무한 스크롤 또는 페이지네이션 (12개씩)

**카드 구성**
```
[얼굴 사진]
이름
직함 @ 소속
━━━━━━━━━━
한 줄 소개
[도메인 태그] [연도 배지]
```

---

### 6.3 챔피언 상세 (`/champions/[slug]`)

**섹션**
1. 히어로: 큰 사진 + 이름 + 직함 + 외부 링크 아이콘 (LinkedIn/GitHub)
2. 소개 (Markdown 렌더링)
3. "이 챔피언의 작품" (연결된 포트폴리오 카드 그리드)
4. "관련 인사이트" (이 챔피언이 태그된 인사이트)
5. 공유 버튼 (링크 복사, 카카오톡 공유)

**SEO**
- `<title>`: `{이름} - {직함} | 공공 AX 챔피언`
- OG 이미지: 얼굴 사진 + 이름 조합 동적 생성 (`opengraph-image.tsx`)
- JSON-LD `Person` 스키마

---

### 6.4 포트폴리오 목록 (`/portfolio`)

**필터**: 기술 / 도메인 / 연도  
**정렬**: 최신순 / 인기순 (추후)  
**UI**: 카드 그리드 (2열 데스크탑)

**카드 구성**
```
[커버 이미지 16:9]
[기술 태그들]
프로젝트 제목
━━━━━━━━━━
한 줄 요약
by [챔피언 이름]
```

---

### 6.5 포트폴리오 상세 (`/portfolio/[slug]`)

**섹션**
1. 커버 이미지 + 제목 + 메타 (연도, 기관, 도메인)
2. 만든 사람 (챔피언 프로필 카드 연결)
3. 요약 (1-2줄)
4. 상세 설명 (Markdown)
5. 기술 스택 태그
6. 성과 지표 (있는 경우 숫자 카드)
7. 외부 링크 버튼
8. 관련 포트폴리오 (같은 도메인 3개)

---

### 6.6 인사이트 목록 (`/insights`)

**UI**: 블로그형 카드 리스트 (가로 레이아웃 가능)  
**필터**: 태그 칩  
**상단**: "뉴스레터 구독" 큰 배너 (Stibee 폼)

**큐레이션형 vs 오리지널 구분**
- `source_type = 'curated'` → 카드에 "🔗 외부 기사 큐레이션" 뱃지
- `source_type = 'original'` → "📝 원본 기사" 뱃지

---

### 6.7 인사이트 상세 (`/insights/[slug]`)

- Markdown 렌더링 (`react-markdown` + `remark-gfm`)
- 목차 (TOC) 자동 생성
- 하단 구독 CTA
- 관련 글 3개

---

### 6.8 K-AI PROC 대시보드 (`/proc`)

§7에서 상세.

---

### 6.9 참여하기 (`/join`)

**3개 카드 레이아웃**

1. **💬 실시간 대화 참여하기**
   - 카카오 오픈채팅 바로가기 큰 버튼
   - 입장 안내 3줄

2. **🏆 챔피언 지원하기**
   - 선정 과정·기준 간단 설명
   - 지원 폼 링크 (Google Form)

3. **📮 제보·문의**
   - "이런 챔피언을 소개하고 싶어요"
   - "이런 포트폴리오를 등록하고 싶어요"
   - 간단 폼 임베드 또는 이메일 링크

---

## 7. K-AI PROC 상세 명세

### 7.1 전체 구조

```
/proc                     # 대시보드 (숫자 + 차트)
/proc/tenders             # 입찰공고 리스트 (검색/필터/정렬)
/proc/tenders/[id]        # 공고 상세 (AI 요약 + 원문 링크)
/proc/agencies/[id]       # 발주기관 프로필 (Phase 2)
```

### 7.2 대시보드 구성

1. **상단 KPI 카드 4개**
   - 전체 공고 수 (전월 대비 증감)
   - 총 발주 금액 (전월 대비 증감)
   - 활성 공고 수 (현재 마감 안 된)
   - 평균 예산

2. **메인 차트**: 월별 공고 건수 + 발주액 (듀얼 축 라인/바 차트)

3. **분포 차트 2개 (2단 컬럼)**
   - 기관 유형별 파이차트 (중앙부처/지자체/공공기관/대학·연구기관)
   - 기술 카테고리별 막대차트 (RAG/LLM/문서AI/SI/컨설팅)

4. **트렌드 키워드 클라우드** (상위 20개 키워드)

5. **Top 10 발주기관 테이블** (기관명 / 건수 / 총액)

6. **마감 임박 공고 리스트** (D-7 이내 공고 5개)

**데이터 소스**: 모든 위젯은 서버 컴포넌트에서 Supabase 직접 조회. ISR 1시간.

### 7.3 입찰공고 리스트 (`/proc/tenders`)

**테이블 컬럼**
| 공고명 | 발주기관 | 예산 | 공고일 | 마감일 | AI 카테고리 | D-day |

**기능**
- 키워드 검색 (제목 + 설명 full-text)
- 필터: 기관 유형 / 예산대 / 기술 카테고리 / 상태
- 정렬: 마감 임박 / 최신 / 금액 큰 순
- D-7 이내 행 배경색 강조 (빨강 계열)
- 페이지네이션 (20개씩)

**URL 상태 동기화**: 모든 필터는 쿼리 스트링에 반영 (공유 가능).

### 7.4 공고 상세 (`/proc/tenders/[id]`)

**섹션**
1. 공고명 + 메타 (기관, 예산, 마감일, D-day)
2. **AI 요약 (3줄)** — Claude 생성
3. **AI 태그** — 카테고리, 기술 키워드, 규모
4. 원문 전문 (접었다 펴기)
5. 나라장터 원문 링크 큰 버튼
6. 유사 공고 (Phase 2, pgvector)

### 7.5 크롤링 파이프라인

```
Vercel Cron (매 1시간)
  ↓
/api/cron/crawl-tenders (CRON_SECRET 헤더 검증 필수)
  ↓
나라장터 OpenAPI 호출
  - 검색어: ["AI", "인공지능", "머신러닝", "딥러닝", "LLM", "생성형", "챗봇", "RAG", "자연어처리"]
  - 최근 24시간 공고만 (중복 방지)
  ↓
신규 공고를 tenders 테이블에 INSERT (source_id로 dedupe)
  ↓
분류 대기열에 추가
  ↓
/api/cron/classify-tenders (매 30분)
  ↓
미분류 공고 10건씩 Claude API로 분류
  ↓
tender_classifications INSERT
  ↓
(Phase 2) 임베딩 생성 → tender_embeddings INSERT
```

### 7.6 Claude 분류 프롬프트 (초안)

```
당신은 공공기관 AI 조달 공고를 분류하는 전문가입니다.

주어진 공고를 아래 기준으로 분류해 JSON으로 응답하세요.

## 카테고리 (택 1)
- RAG: 검색 증강 생성, 지식 검색, QA 시스템
- LLM: 대규모 언어모델 직접 활용, 챗봇, 생성형 AI
- 문서AI: OCR, 문서 분류, 계약서 분석 등
- 컨설팅: 전략 수립, 로드맵, 타당성 조사
- SI: 시스템 구축·통합, 플랫폼 개발

## 도메인 (택 1)
교육 / 의료 / 행정 / 복지 / 환경 / 문화 / 과학기술 / 기타

## 규모 (택 1, 예산 기준)
소(1억 미만) / 중(1억~10억) / 대(10억 초과)

## 기술 키워드 (최대 5개)
구체적 기술명 (예: "GPT-4", "Whisper", "BERT", "Python", "클라우드")

## 출력 형식 (JSON만, 다른 텍스트 금지)
{
  "category": "...",
  "domain": "...",
  "scale": "...",
  "keywords": ["...", "..."],
  "confidence": 0.0~1.0
}

## 공고 정보
제목: {title}
설명: {description}
예산: {budget}
```

---

## 8. 운영·콘텐츠 파이프라인

### 8.1 챔피언 등록 (연 1~2회)

1. 운영자가 Supabase Studio에서 직접 입력 (Phase 0)
2. Phase 2: 어드민 페이지 (Retool 또는 자체 구현)
3. 필수 필드: name, slug, title, affiliation, bio, year_awarded
4. 사진은 Supabase Storage `champions/` 버킷에 업로드

### 8.2 포트폴리오 등록

1. 챔피언 등록 시 함께 수집 권장
2. 한 챔피언이 여러 포트폴리오 연결 가능 (`champion_portfolios`)
3. 이미지는 Supabase Storage `portfolios/` 버킷

### 8.3 인사이트 발행 플로우 (AI 보조, Phase 1부터 자동화)

```
[자동] 크롤러가 공공 AI 뉴스 수집 (일 1회)
  ↓
[자동] Claude가 주간 브리핑 초안 생성 (매주 월요일)
  ↓
[수동] 운영자가 검토·편집·발행 (30분 이내)
  ↓
[자동] Stibee로 발송 (구독자에게)
```

**중요**: 뉴스레터는 "주 1회"로 약속하지 말 것. "비정기"로 공지하고 실제로는 주 1회 시도. 약속하면 부담, 약속 안 하면 자유.

### 8.4 인수인계 체크리스트 (제작자 → 운영자)

- [ ] 운영 매뉴얼 문서 (`OPERATIONS.md`) 작성
- [ ] Supabase 계정 인수인계 (Owner 권한 이전)
- [ ] Vercel 프로젝트 이전
- [ ] 도메인 소유권 이전
- [ ] Stibee / GA 계정 이전
- [ ] API 키 교체 (Anthropic, OpenAI)
- [ ] 크론잡 정상 동작 확인 스크린샷
- [ ] 장애 대응 연락처 정리

---

## 9. 구현 체크리스트 (Phase 0 → Phase 2)

### Phase 0-A — "주연 세우기" (3일)

> 핵심 콘텐츠(챔피언 + 포트폴리오)가 동작하는 상태를 먼저 확보한다.
> 모든 데이터는 처음부터 Supabase DB + 시드 스크립트로 관리한다 (하드코딩 금지).

**세팅**
- [ ] Next.js 15 프로젝트 생성 (`create-next-app`, TypeScript, Tailwind, App Router)
- [ ] shadcn/ui 초기화 (`npx shadcn@latest init`)
- [ ] Supabase 프로젝트 생성 + 스키마 마이그레이션
- [ ] Vercel 프로젝트 연결 + 환경변수 설정
- [ ] 도메인 연결 (또는 `*.vercel.app`으로 시작)
- [ ] **나라장터 OpenAPI 활용신청** (승인까지 1~3일 소요 — 0-B 블로커이므로 즉시 신청)

**공통**
- [ ] 글로벌 레이아웃 (GNB + Footer)
- [ ] SEO 기본기 (`sitemap.ts`, `robots.ts`, 메타태그)
- [ ] 다크모드 토글 (선택)
- [ ] 로고 디자인 또는 임시 텍스트 로고

**메인 페이지 (`/`)**
- [ ] Hero 섹션
- [ ] 이번 달 챔피언 (시드 데이터 3명)
- [ ] 최근 포트폴리오 (시드 데이터 6개)
- [ ] 이번 주 인사이트 (시드 데이터 2개)
- [ ] K-AI PROC 미니 위젯 (숫자 3개, 시드 데이터)
- [ ] Join CTA

**챔피언 (`/champions`, `/champions/[slug]`)**
- [ ] 목록 페이지 (필터 없이 전체 표시부터)
- [ ] 상세 페이지 (기본 레이아웃)
- [ ] 초기 데이터 시드 스크립트 (최소 5명)

**포트폴리오 (`/portfolio`, `/portfolio/[slug]`)**
- [ ] 목록 페이지
- [ ] 상세 페이지
- [ ] 초기 데이터 시드 스크립트 (최소 6개)

### Phase 0-B — "조연 붙이기" (4일)

> API 키 승인 후 크롤러 구현. 미승인 시 목업 데이터로 UI 먼저 구현.

**인사이트 (`/insights`)**
- [ ] 목록 페이지
- [ ] 상세 페이지 (Markdown 렌더링)
- [ ] Stibee 구독 폼 임베드
- [ ] 초기 글 3개 작성

**K-AI PROC (`/proc`)**
- [ ] 크롤러 구현 (Vercel Cron) — API 키 미승인 시 목업 JSON으로 대체
- [ ] Cron API route에 `CRON_SECRET` 헤더 검증 로직 포함
- [ ] 공고 리스트 페이지 (분류 없이 리스트만)
- [ ] 공고 상세 페이지 (원문 링크만)
- [ ] "Beta" 뱃지 + 로드맵 안내

**참여하기 (`/join`)**
- [ ] 카카오 오픈채팅 링크
- [ ] 챔피언 지원 안내 (Google Form 링크)
- [ ] 문의 폼 (Formspree)

**배포 전**
- [ ] 모바일 반응형 전체 체크
- [ ] Lighthouse 점수 확인 (Performance 80+, SEO 100)
- [ ] 404 / 500 커스텀 페이지
- [ ] `/about`, `/privacy`, `/terms` 기본 문서

### Phase 1 — "보여주기" (Phase 0 + 2주)

- [ ] 챔피언 필터 기능 (연도/분야/기관)
- [ ] 포트폴리오 필터 기능
- [ ] K-AI PROC AI 분류 배치 (Claude API)
- [ ] K-AI PROC 대시보드 차트 (Recharts)
- [ ] K-AI PROC 공고 AI 요약
- [ ] 인사이트 태그 필터
- [ ] 인사이트 자동 큐레이션 파이프라인 (뉴스 크롤링 → Claude 브리핑 초안 → 운영자 검토)
- [ ] 챔피언 ↔ 포트폴리오 양방향 연결
- [ ] champion_portfolios에 role 컬럼 추가 (lead/contributor)
- [ ] 검색 기능 (글로벌 검색창)

### Phase 2 — "차별화" (Phase 1 + 1개월)

- [ ] K-AI PROC 유사 공고 추천 (pgvector)
- [ ] K-AI PROC 발주기관 프로필 페이지
- [ ] 이메일 알림 구독 (키워드/기관)
- [ ] 어드민 페이지 (콘텐츠 관리)
- [ ] 지역 현황 지도 (Kakao Maps)
- [ ] OG 이미지 동적 생성

### Phase 3 — "성숙" (후순위)

- [ ] 챔피언 프로필 본인 편집 권한 (인증)
- [ ] 포트폴리오 사용자 제보 플로우
- [ ] 개인화 대시보드 (관심 키워드 구독)
- [ ] API 공개 (외부 개발자용)
- [ ] 연간 리포트 PDF 자동 생성

---

## 10. 디자인 가이드라인

### 10.1 톤앤매너
- **전문적이되 딱딱하지 않게.** 정부 사이트 같은 느낌 피하기.
- **사람 중심**: 얼굴·이름·스토리가 잘 드러나게.
- **데이터는 신뢰감 있게**: 숫자·차트는 명확하고 절제된 스타일.

### 10.2 컬러 팔레트 (제안)
- Primary: 딥블루 계열 (`#1E3A8A` 정도) — 공공/신뢰
- Accent: 따뜻한 오렌지 (`#F97316`) — 커뮤니티/활기
- Neutral: Slate 계열 (shadcn 기본)
- 다크모드 지원

### 10.3 타이포그래피
- 한글: Pretendard
- 영문: Inter
- 제목은 볼드하게, 본문은 편안한 행간 (leading-7 정도)

### 10.4 컴포넌트 일관성
- 모든 카드는 `rounded-2xl`, `shadow-sm`, `hover:shadow-md` 통일
- 버튼은 shadcn 기본 변형 사용
- 로딩 상태는 skeleton UI (스피너보다)

---

## 11. 위험 요소 및 대응

| 위험 | 영향 | 대응 |
|---|---|---|
| 나라장터 API 장애/변경 | K-AI PROC 마비 | 크롤러 실패 시 알림 + 마지막 성공 데이터 유지 |
| Claude API 비용 초과 | 분류 중단 | 일일 쿼터 설정, 배치 사이즈 제한 |
| 챔피언 동의 이슈 | 법적 문제 | 등록 전 서면 동의 필수, 삭제 요청 플로우 |
| 뉴스레터 큐레이션 저작권 | 법적 문제 | 요약만, 원문 링크 필수, 이미지 무단 사용 금지 |
| 운영자 공백 | 사이트 방치 | 자동화 최대화, Phase 2까지 어드민 구축 |
| 트래픽 급증 시 비용 | 운영비 증가 | Vercel 무료 티어 한계 모니터링, Supabase 쿼리 최적화 |

---

## 12. 환경 변수 (.env.local)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic (AI 분류)
ANTHROPIC_API_KEY=

# OpenAI (임베딩, Phase 2)
OPENAI_API_KEY=

# 나라장터 공공데이터포털
NARAJANGTO_API_KEY=

# Stibee (뉴스레터)
NEXT_PUBLIC_STIBEE_LIST_URL=

# 분석
NEXT_PUBLIC_GA_ID=

# Cron 보호
CRON_SECRET=
```

---

## 13. 참고 자료

- 나라장터 입찰공고정보 서비스: https://www.data.go.kr (활용신청)
- Next.js App Router 문서: https://nextjs.org/docs/app
- Supabase Next.js 가이드: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- shadcn/ui: https://ui.shadcn.com
- Stibee 임베드 가이드: https://help.stibee.com

---

## 14. 이 문서의 범위 밖

다음은 **이 문서에서 결정하지 않았다**. 구현 중 별도 논의 필요:

- 구체적인 로고 디자인
- 도메인 이름 (현재 `public-ax.kr`을 계속 쓸지)
- 운영 주체의 법인/단체 명시
- 챔피언 선정 기준·절차의 공식화
- 유료화·후원 모델 (Phase 3 이후 논의)

---

**작성**: 2026년 4월  
**버전**: 0.1 (초안)  
**다음 갱신**: Phase 0 완료 후 회고를 반영하여 0.2
