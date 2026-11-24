import sqlite3
import json
import time
import os
from typing import Optional, Any

DB_PATH = os.getenv("CACHE_DB_PATH", os.path.join(os.path.dirname(__file__), "cache.db"))

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS api_cache (
                cache_key TEXT PRIMARY KEY,
                data_json TEXT NOT NULL,
                updated_at REAL NOT NULL,
                ttl_seconds REAL NOT NULL
            )
        """)
    return conn

def init_cache_db():
    conn = get_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS api_cache (
                cache_key TEXT PRIMARY KEY,
                data_json TEXT NOT NULL,
                updated_at REAL NOT NULL,
                ttl_seconds REAL NOT NULL
            )
        """)
    conn.close()

def get_cached(key: str) -> Optional[Any]:
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT data_json, updated_at, ttl_seconds FROM api_cache WHERE cache_key = ?", (key,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return None
        data_json, updated_at, ttl_seconds = row["data_json"], row["updated_at"], row["ttl_seconds"]
        if time.time() - updated_at > ttl_seconds:
            # expired, but can be used as stale fallback if requested
            return None
        return json.loads(data_json)
    except Exception as e:
        print(f"[Cache Error] Read failed for {key}: {e}")
        return None

def get_stale_fallback(key: str) -> Optional[dict]:
    """Returns last-known-good data with updated_at timestamp when live fetch fails."""
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT data_json, updated_at FROM api_cache WHERE cache_key = ?", (key,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return None
        data = json.loads(row["data_json"])
        age_seconds = int(time.time() - row["updated_at"])
        return {
            "data": data,
            "stale": True,
            "age_seconds": age_seconds,
            "updated_at": row["updated_at"]
        }
    except Exception as e:
        print(f"[Cache Error] Stale fallback read failed: {e}")
        return None

def set_cached(key: str, data: Any, ttl_seconds: float = 60.0):
    try:
        conn = get_connection()
        data_json = json.dumps(data)
        now = time.time()
        with conn:
            conn.execute("""
                INSERT INTO api_cache (cache_key, data_json, updated_at, ttl_seconds)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(cache_key) DO UPDATE SET
                    data_json=excluded.data_json,
                    updated_at=excluded.updated_at,
                    ttl_seconds=excluded.ttl_seconds
            """, (key, data_json, now, ttl_seconds))
        conn.close()
    except Exception as e:
        print(f"[Cache Error] Write failed for {key}: {e}")
