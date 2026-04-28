-- 진짜 발주처(수요기관) 컬럼 추가
-- ntce_instt_nm은 공고 처리 기관(조달청 등 위탁 거점)이라 진짜 발주처가 아닐 수 있음
ALTER TABLE bids ADD COLUMN IF NOT EXISTS dmnd_instt_nm text;

CREATE INDEX IF NOT EXISTS bids_dmnd_instt_nm_idx ON bids (dmnd_instt_nm);
