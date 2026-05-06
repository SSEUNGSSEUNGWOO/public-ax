"""
Deprecated: Supabase SDK 클라이언트 → psycopg2로 마이그레이션 완료.
하위 호환을 위해 get_client()는 get_conn()을 반환합니다.
"""
from shared.db import get_conn


def get_client():
    """하위 호환용. shared.db.get_conn()을 사용하세요."""
    return get_conn()
