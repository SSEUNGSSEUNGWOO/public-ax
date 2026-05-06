@echo off
REM G2B 통합 수집 (Windows 작업 스케줄러용)
REM 1. g2b-monitor: raw 테이블에 전체 공고 수집 (한국 IP 필요)
REM 2. public-ax: raw에서 AI 키워드 매칭 건 sync

REM === Step 1: g2b-monitor 수집 ===
echo [%date% %time%] g2b-monitor collector 시작
cd /d "C:\project\g2b-monitor\ai-service"

for /f "usebackq tokens=1,* delims==" %%a in ("C:\project\g2b-monitor\ai-service\.env") do (
    if not "%%a"=="" set "%%a=%%b"
)

call .venv\Scripts\activate 2>nul || (echo g2b-monitor venv 없음 & goto step2)
python -m collector --daily
echo [%date% %time%] g2b-monitor collector 완료

REM === Step 2: public-ax sync ===
:step2
echo [%date% %time%] public-ax sync 시작
cd /d "C:\project\public-ax\ai-service"

for /f "usebackq tokens=1,* delims==" %%a in ("C:\project\public-ax\.env") do (
    if not "%%a"=="" set "%%a=%%b"
)

call .venv\Scripts\activate 2>nul || (echo public-ax venv 없음 & exit /b 1)
python bids\sync_from_raw.py --days 7
echo [%date% %time%] public-ax sync 완료
