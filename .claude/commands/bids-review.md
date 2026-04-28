기타 AI / 무관으로 분류된 활성 입찰을 한 건씩 수동 검수한다.

## 동작 흐름

1. **누적 건수 먼저 확인**:
   ```
   cd ai-service && .venv/bin/python bids/review.py count
   ```
2. **검수 대상 가져오기 (기본 10건, 마감 임박순)**:
   ```
   .venv/bin/python bids/review.py list-pending --limit 10
   ```
   - 각 항목: `id, bid_ntce_nm, ntce_instt_nm, dmnd_instt_nm, bsns_div_nm, ai_category, bid_clse_date, assign_bdgt_amt, presmpt_prce, bidprc_psbl_indstrty_nm`
   - `reviewed_at IS NULL`인 것만 가져옴 (이미 검수한 건은 다시 안 나옴)
   - 단가계약·각수요기관은 자동 제외
3. **한 건씩 사용자에게 표시**:
   - 공고명, 발주기관(수요기관 우선), 사업구분, 예산(억원 환산), 마감일(D-day), 참여업종, 현재 분류
4. **카테고리 14개 옵션을 번호와 함께 보여주고 응답 요청**.
5. **사용자 응답 처리**:
   - 숫자(1–14) 또는 카테고리명 → `bids/review.py update <bid_id> "<카테고리>"`
   - `keep` / `k` → `bids/review.py keep <bid_id>` (카테고리 그대로 + 검수 완료)
   - `skip` / `s` → 아무것도 안 함 (다음 세션에 다시 등장)
   - `quit` / `q` → 종료
6. **모든 건 처리 후 요약**: 변경 N건 / 유지(keep) M건 / skip K건. 남은 미검수 건수도 함께.

## 카테고리 (번호 → 이름)

```
1. LLM/생성형 AI
2. RAG/지식 검색
3. 컴퓨터 비전
4. 음성/STT
5. 빅데이터 분석
6. AI 인프라/MLOps
7. AI 자율주행/로봇
8. AI 의료/헬스케어
9. AI 보안
10. AI 정책/연구용역
11. AI 교육/컨설팅
12. 디지털 전환
13. 기타 AI
14. 무관
```

## 주의

- 한 번에 너무 많이 표시하지 말 것 (사용자가 한 건씩 결정 가능하게).
- 사용자가 명확히 답하지 못한 건은 `skip`으로 처리. `keep`은 "현재 분류가 맞다"고 확정한 경우에만.
- "무관"으로 잘못 분류된 게 가장 많을 수 있음 (false positive). 정확한 AI 카테고리로 변경하도록 유도.
- 검수한 건은 `reviewed_at`이 세팅되어 다음 세션에 다시 안 나옴.

## 인자

- `--limit <N>`: 한 번에 가져올 검수 대상 갯수 (기본 10). 사용자가 더/덜 요청하면 조정.
