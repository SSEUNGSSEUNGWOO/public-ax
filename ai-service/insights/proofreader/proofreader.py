import subprocess


PROMPT_TEMPLATE = """다음은 AI 동향 리포트 마크다운 초안입니다. 아래 항목만 수정하고 수정된 전체 텍스트를 그대로 반환하세요.

수정 항목:
- 오타 교정
- 갑자기 삽입된 한자(漢字)를 자연스러운 한국어로 교체
- 문장 부호 오류 (예: 마침표 누락, 따옴표 불일치)
- 어색한 띄어쓰기

절대 하지 말 것:
- 내용 변경, 요약, 재작성
- 마크다운 구조(제목, 링크, 이미지, 볼드 등) 수정
- 문장 추가 또는 삭제
- 수정 내역 설명, 변경 사항 목록, 안내 문구 출력 — 오직 수정된 텍스트만 출력

---

{draft}
"""


def run(draft: str) -> str:
    prompt = PROMPT_TEMPLATE.format(draft=draft)
    result = subprocess.run(
        ["claude", "-p", prompt],
        capture_output=True,
        text=True,
        timeout=180,
    )
    if result.returncode != 0:
        print(f"[proofreader] CLI 실패, 원본 유지: {result.stderr[:100]}")
        return draft
    corrected = result.stdout.strip()
    if not corrected:
        return draft
    # 설명 텍스트가 앞에 붙은 경우 # 이전 내용 제거
    if "#" in corrected:
        corrected = corrected[corrected.index("#"):]
    print("[proofreader] 교정 완료")
    return corrected
