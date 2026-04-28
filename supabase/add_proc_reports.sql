-- 공공 AI 발주 동향 월간 분석 리포트 테이블
CREATE TABLE IF NOT EXISTS proc_reports (
  id              text PRIMARY KEY,            -- slug와 동일 (예: 2026-04)
  slug            text UNIQUE NOT NULL,
  title           text NOT NULL,
  body            text NOT NULL,                -- 마크다운 본문 ({{chart:...}} placeholder 포함)
  data            jsonb NOT NULL,                -- 차트 렌더링용 분석 데이터
  period_start    text,                          -- YYYY-MM-DD (분석 기간 시작 — 최근 30일)
  period_end      text,
  baseline_start  text,                          -- 베이스라인 기간 (직전 90일)
  baseline_end    text,
  evaluation_score numeric,                      -- 0~5
  status          text DEFAULT 'draft',          -- draft / published
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS proc_reports_status_idx ON proc_reports (status);
CREATE INDEX IF NOT EXISTS proc_reports_created_at_idx ON proc_reports (created_at DESC);

ALTER TABLE proc_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published" ON proc_reports FOR SELECT USING (status = 'published');
