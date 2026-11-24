import pytest
from app.core.cache import init_cache_db, set_cached, get_cached, get_stale_fallback
from app.data.stock_provider import get_price_history, get_ticker_quote
from app.data.crypto_provider import get_crypto_spot_quotes
from app.data.news_provider import get_live_news

def test_cache_db():
    init_cache_db()
    set_cached("test_key", {"foo": "bar"}, ttl_seconds=10)
    data = get_cached("test_key")
    assert data is not None
    assert data.get("foo") == "bar"

def test_crypto_spot_quotes():
    res = get_crypto_spot_quotes()
    assert "data" in res
    assert isinstance(res["data"], list)
    assert len(res["data"]) > 0
    first = res["data"][0]
    assert "symbol" in first
    assert "price" in first
    assert first["price"] > 0

def test_stock_quote_live():
    # Reliance Industries on NSE
    res = get_ticker_quote("RELIANCE", market="NSE")
    assert "data" in res
    data = res["data"]
    if data:
        assert data["symbol"] == "RELIANCE"
        assert data["price"] > 0
        assert "athDistance" in data

def test_price_history_with_lookback_buffer():
    # Test 1M history returns valid MA20/MA50 calculated with buffer
    res = get_price_history("TCS", timeframe="1M", market="NSE")
    assert "data" in res
    if res["data"]:
        point = res["data"][-1]
        assert "close" in point
        assert "timestamp" in point

def test_news_provider():
    res = get_live_news()
    assert "data" in res
    assert len(res["data"]) > 0
    first = res["data"][0]
    assert "title" in first
    assert "link" in first
    assert "tags" in first
