# PUBLIC-AX 개발 원칙

## 폴더 구조 우선

코드 작성 전에 반드시 폴더 구조를 먼저 설계하고 사용자와 합의한다. 구조 없이 파일부터 만들지 않는다.

### 전체 모노레포 구조
```
public-ax/
├── frontend/           ← Next.js 앱
├── backend/            ← FastAPI
├── ai-service/         ← AI 파이프라인 (feature별 분리)
│   ├── {feature}/      ← insights, proc, champions, ...
│   │   ├── crawlers/
│   │   ├── writer/
│   │   ├── evaluator/
│   │   ├── data/
│   │   └── run.py
│   └── shared/         ← 공통 모듈
└── shared/             ← 전체 공통 타입/스키마
```

## 크롤러 원칙

- 크롤러는 수집만 한다. Claude API 호출 금지.
- 수집 결과는 `RawItem` 모델로 통일.
- 중복 방지는 `shared/storage.py`의 seen_hashes 사용.

## Writer / Evaluator 원칙

- Writer: Claude API로 클러스터링 → 리포트 작성 2단계
- Evaluator: `claude` CLI 서브프로세스로 평가 (API 키 불필요)
- 평가 기준은 `evaluator/rubric.yaml`에서 관리
- 통과 점수 미달 시 최대 3회 재작성 루프

## 데이터 저장

- Supabase 연결 전까지는 로컬 JSON (`data/`)에 저장
- `shared/storage.py`가 저장소 추상화 담당 → Supabase 연결 시 이 파일만 수정

## 실행

```bash
cd ai-service
python insights/run.py
```
