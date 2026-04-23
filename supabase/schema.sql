-- ============================================================
-- PUBLIC-AX Supabase Schema
-- ============================================================

-- 1. INSIGHTS — AI 일일 리포트
-- ============================================================
create table if not exists insights (
  slug            text primary key,
  title           text not null,
  body            text not null,
  sources         jsonb not null default '[]',   -- [{title, url, source_id}]
  published_at    text not null,                 -- YYYY-MM-DD
  category        text not null default 'general',
  image_url       text,
  evaluation_score float,
  crawled_count   int not null default 0,
  created_at      timestamptz not null default now()
);

-- 2. GUIDES — 실무자용 가이드
-- ============================================================
create table if not exists guides (
  slug            text primary key,
  title           text not null,
  summary         text not null default '',
  category        text not null default '',
  tags            text[] not null default '{}',
  published_at    text not null,
  body            text not null,
  videos          jsonb not null default '[]',   -- [{title, url, channel}]
  evaluation_score float,
  status          text not null default 'draft', -- draft | published
  created_at      timestamptz not null default now()
);

-- 3. CHAMPIONS — AX 챔피언 Hall of Fame
-- ============================================================
create table if not exists champions (
  slug            text primary key,
  name            text not null,
  title           text not null,
  affiliation     text not null,
  bio             text not null default '',
  year_awarded    int,
  domain          text[] not null default '{}',
  grade           text not null default 'green', -- green | gold | platinum
  avatar_url      text,
  featured        boolean not null default false,
  created_at      timestamptz not null default now()
);

-- 4. PORTFOLIOS — 공공 AX 도입 사례
-- ============================================================
create table if not exists portfolios (
  slug            text primary key,
  title           text not null,
  summary         text not null default '',
  tech_stack      text[] not null default '{}',
  champion_name   text,
  agency          text not null default '',
  domain          text not null default '',
  cover_image     text,
  body            text not null default '',
  published_at    text not null,
  featured        boolean not null default false,
  created_at      timestamptz not null default now()
);

-- 5. SUBSCRIBERS — 뉴스레터 구독자
-- ============================================================
create table if not exists subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  created_at      timestamptz not null default now()
);

-- 6. SEEN_HASHES — 크롤러 중복 방지
-- ============================================================
create table if not exists seen_hashes (
  hash            text primary key,
  source_id       text not null default '',
  created_at      timestamptz not null default now()
);

-- 7. PROCUREMENT — 정부 AI 공고 (준비중)
-- ============================================================
create table if not exists procurement (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  agency          text not null default '',
  budget_krw      bigint,                        -- 원 단위
  deadline        text,                          -- YYYY-MM-DD
  url             text not null,
  category        text not null default '',      -- AI | 데이터 | 디지털전환
  published_at    text not null,
  status          text not null default 'open',  -- open | closed
  created_at      timestamptz not null default now()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

-- 공개 읽기 허용
alter table insights      enable row level security;
alter table guides        enable row level security;
alter table champions     enable row level security;
alter table portfolios    enable row level security;
alter table procurement   enable row level security;

create policy "public_read" on insights    for select using (true);
create policy "public_read" on guides      for select using (status = 'published');
create policy "public_read" on champions   for select using (true);
create policy "public_read" on portfolios  for select using (true);
create policy "public_read" on procurement for select using (true);

-- 구독자/해시는 service role만 접근
alter table subscribers   enable row level security;
alter table seen_hashes   enable row level security;

-- ============================================================
-- 인덱스
-- ============================================================
create index if not exists insights_published_at_idx  on insights(published_at desc);
create index if not exists guides_status_idx          on guides(status);
create index if not exists champions_grade_idx         on champions(grade);
create index if not exists procurement_published_at_idx on procurement(published_at desc);
