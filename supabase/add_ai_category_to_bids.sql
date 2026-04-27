-- bids 테이블에 AI 카테고리 분류 컬럼 추가
ALTER TABLE bids ADD COLUMN IF NOT EXISTS ai_category text;

CREATE INDEX IF NOT EXISTS bids_ai_category_idx ON bids (ai_category);
