-- bids 테이블에 수동 검수 완료 표시 컬럼 추가
ALTER TABLE bids ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS bids_reviewed_at_idx ON bids (reviewed_at)
  WHERE reviewed_at IS NULL;
