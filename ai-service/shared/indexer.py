"""
문서를 청킹 → 임베딩 → Supabase documents 테이블에 저장
"""
import hashlib
import re
from shared.embedder import clean_markdown, embed_texts
from shared.supabase_client import get_client as get_supabase

CHUNK_SIZE = 800
CHUNK_OVERLAP = 200
MIN_CHUNK_SIZE = 50


def _hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:32]


def _split_by_size(text: str) -> list[str]:
    if len(text) <= CHUNK_SIZE:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunks.append(text[start:end])
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


def chunk_insight(title: str, body: str, slug: str, published_at: str) -> list[dict]:
    sections = re.split(r"\n(?=##\s)", body)
    chunks = []
    for section in sections:
        clean = clean_markdown(section)
        if len(clean) < MIN_CHUNK_SIZE:
            continue
        heading_match = re.match(r"^#{1,3}\s+(.+)", section)
        heading = heading_match.group(1) if heading_match else ""
        prefix = f"{title}" + (f" — {heading}" if heading else "")
        for piece in _split_by_size(clean):
            content = f"{prefix}\n{piece}"
            chunks.append({
                "content": content,
                "content_hash": _hash(content),
                "type": "insight",
                "metadata": {"slug": slug, "published_at": published_at, "heading": heading},
            })
    return chunks


def chunk_raw_items(items: list[dict]) -> list[dict]:
    chunks = []
    for item in items:
        title = item.get("title", "")
        body = item.get("body") or item.get("content", "")
        content = f"{title}\n{body}".strip()
        if len(content) < MIN_CHUNK_SIZE:
            continue
        chunks.append({
            "content": content,
            "content_hash": _hash(content),
            "type": "raw",
            "metadata": {
                "source_id": item.get("source_id", ""),
                "url": item.get("url", ""),
                "title": title,
            },
        })
    return chunks


def chunk_site_info() -> list[dict]:
    sections = [
        {
            "content": "PUBLIC-AX는 케이브레인 AI퍼블릭센터가 운영하는 공공 AI 전환(AX) 플랫폼입니다. 매일 AI 동향을 수집하고 분석해 공공기관 실무자에게 인사이트를 제공합니다.",
            "heading": "서비스 소개",
        },
        {
            "content": "매일 아침 공공 AI 인사이트 리포트를 발행합니다. 국내외 AI 뉴스, 논문, 정책, GitHub 트렌드를 수집해 공공 맥락에서 해석합니다.",
            "heading": "일일 인사이트",
        },
        {
            "content": "RAG, LLM, 프롬프트 엔지니어링 등 AI 실무 가이드를 제공합니다. 공공기관 실무자를 위한 AI 도입 가이드입니다.",
            "heading": "가이드",
        },
        {
            "content": "공공 AI 전환을 이끄는 챔피언을 소개합니다. 실무자, 정책가, 기업 등 다양한 분야의 AI 전환 리더들입니다.",
            "heading": "챔피언",
        },
        {
            "content": "카카오톡 오픈채팅 커뮤니티에서 매일 AI 동향을 공유하고 소통합니다. 뉴스레터 구독으로 매일 아침 이메일로 받아볼 수 있습니다.",
            "heading": "커뮤니티",
        },
    ]
    chunks = []
    for s in sections:
        content = f"PUBLIC-AX {s['heading']}\n{s['content']}"
        chunks.append({
            "content": content,
            "content_hash": _hash(content),
            "type": "site_info",
            "metadata": {"heading": s["heading"]},
        })
    return chunks


def upsert_chunks(chunks: list[dict]):
    if not chunks:
        return

    sb = get_supabase()
    existing_hashes = set()

    hashes = [c["content_hash"] for c in chunks]
    result = sb.table("documents").select("content_hash").in_("content_hash", hashes).execute()
    existing_hashes = {r["content_hash"] for r in (result.data or [])}

    new_chunks = [c for c in chunks if c["content_hash"] not in existing_hashes]
    if not new_chunks:
        print(f"  → 전부 기존 데이터, 스킵")
        return

    texts = [c["content"] for c in new_chunks]
    embeddings = embed_texts(texts)

    rows = [
        {
            "content": c["content"],
            "content_hash": c["content_hash"],
            "type": c["type"],
            "metadata": c["metadata"],
            "embedding": emb,
        }
        for c, emb in zip(new_chunks, embeddings)
    ]

    batch_size = 50
    for i in range(0, len(rows), batch_size):
        sb.table("documents").upsert(rows[i:i+batch_size], on_conflict="content_hash").execute()

    print(f"  → {len(new_chunks)}개 임베딩 완료 (스킵: {len(chunks) - len(new_chunks)}개)")
