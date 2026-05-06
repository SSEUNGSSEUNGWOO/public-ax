@echo off
REM 나라장터 AI 공고 로컬 수집 (Windows 작업 스케줄러용)
REM 한국 IP 필요 → 로컬에서만 실행

cd /d "%~dp0.."

REM .env에서 환경변수 로드
for /f "usebackq tokens=1,* delims==" %%a in ("%~dp0..\..\..\.env") do (
    if not "%%a"=="" if not "%%a:~0,1%"=="#" set "%%a=%%b"
)

call .venv\Scripts\activate
python bids\collect.py --months 1
