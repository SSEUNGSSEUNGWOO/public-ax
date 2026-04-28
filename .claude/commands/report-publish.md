---
description: 공공 AI 발주 월간 분석 리포트 생성 → Supabase 업로드
---

공공 AI 발주 월간 분석 리포트 발행 워크플로우.

1. `cd ai-service && .venv/bin/python reports/run.py` 실행
2. 완료 후 결과(제목, 평가 점수) 출력
3. Supabase `proc_reports` 테이블 업로드 확인

흐름:
1. **Analyzer** — 최근 30일 vs 직전 90일 평균 통계 (Hot/Cold/신규/사라짐 카테고리, 발주처 이상치, 큰 사업 Top, 카테고리별 예산)
2. **Writer (Claude CLI)** — 마크다운 본문 작성. 차트 자리에 `{{chart:type:dataKey}}` placeholder 삽입
3. **Evaluator (Claude CLI)** — 6기준 평가 (factual_accuracy, insight_quality, readability, seo_quality, geo_quality, human_voice)
   - 4.0/5.0 미달 시 Writer 재실행 (max 3)
4. **Reviewer (Claude CLI)** — 최종 검수·polish (사실 보정, 상투어 제거)
5. Supabase `proc_reports` 테이블에 status='draft'로 저장

주의:
- `ANTHROPIC_API_KEY`는 사용하지 않는다. 모든 에이전트는 `claude` CLI 서브프로세스로 동작하며 Anthropic Max 구독을 소비한다.
- `--dry-run` 플래그로 저장 없이 본문만 출력 가능.
- status='draft'로 저장된 후, 별도 단계에서 published로 승격해야 사용자에게 노출된다.
