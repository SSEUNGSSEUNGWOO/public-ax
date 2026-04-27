-- 회사·공고 시맨틱 매칭을 위한 pgvector 셋업

-- 1. pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. bids 테이블에 임베딩 컬럼 추가 (OpenAI text-embedding-3-small = 1536차원)
ALTER TABLE bids ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. 코사인 유사도 검색용 HNSW 인덱스
CREATE INDEX IF NOT EXISTS bids_embedding_hnsw_idx
  ON bids USING hnsw (embedding vector_cosine_ops);
