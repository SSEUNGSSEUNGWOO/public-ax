-- bids 테이블
CREATE TABLE IF NOT EXISTS bids (
  id              text PRIMARY KEY,          -- bidNtceNo-bidNtceOrd
  bid_ntce_no     text NOT NULL,
  bid_ntce_ord    text NOT NULL,
  bid_ntce_nm     text,
  bid_ntce_sttus  text,
  bid_ntce_date   text,
  bsns_div_nm     text,
  ntce_instt_nm   text,
  assign_bdgt_amt text,
  presmpt_prce    text,
  bid_clse_date   text,
  bid_clse_tm     text,
  bid_ntce_url    text,
  created_at      timestamptz DEFAULT now()
);

-- 조회 최적화 인덱스
CREATE INDEX IF NOT EXISTS bids_bid_ntce_date_idx ON bids (bid_ntce_date DESC);
CREATE INDEX IF NOT EXISTS bids_bid_clse_date_idx ON bids (bid_clse_date);
CREATE INDEX IF NOT EXISTS bids_ntce_instt_nm_idx ON bids (ntce_instt_nm);

-- anon 읽기 허용
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON bids FOR SELECT USING (true);
