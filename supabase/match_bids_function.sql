-- 회사 임베딩으로 공고 매칭하는 RPC 함수
-- categories가 비어 있으면 카테고리 필터 미적용
-- active_only=true 면 마감 미경과 공고만 후보

CREATE OR REPLACE FUNCTION match_bids(
  query_embedding vector(1536),
  categories text[] DEFAULT NULL,
  budget_min bigint DEFAULT 0,
  budget_max bigint DEFAULT 100000000000,
  match_count int DEFAULT 20,
  active_only boolean DEFAULT true
)
RETURNS TABLE (
  id text,
  bid_ntce_no text,
  bid_ntce_ord text,
  bid_ntce_nm text,
  bid_ntce_sttus text,
  bid_ntce_date text,
  bsns_div_nm text,
  ntce_instt_nm text,
  assign_bdgt_amt text,
  presmpt_prce text,
  bid_clse_date text,
  bid_clse_tm text,
  bid_ntce_url text,
  ai_category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id, b.bid_ntce_no, b.bid_ntce_ord, b.bid_ntce_nm, b.bid_ntce_sttus,
    b.bid_ntce_date, b.bsns_div_nm, b.ntce_instt_nm,
    b.assign_bdgt_amt, b.presmpt_prce, b.bid_clse_date, b.bid_clse_tm,
    b.bid_ntce_url, b.ai_category,
    (1 - (b.embedding <=> query_embedding))::float AS similarity
  FROM bids b
  WHERE
    b.embedding IS NOT NULL
    AND (categories IS NULL OR cardinality(categories) = 0 OR b.ai_category = ANY(categories))
    AND (NOT active_only OR b.bid_clse_date >= to_char(current_date, 'YYYY-MM-DD'))
    AND (
      COALESCE(NULLIF(NULLIF(b.assign_bdgt_amt, ''), '0'), NULLIF(b.presmpt_prce, ''), '0')::bigint
      BETWEEN budget_min AND budget_max
    )
  ORDER BY b.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
