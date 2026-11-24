import pytest
from app.data.liveboard_service import get_macro_strip, get_market_mood_gauge, get_market_treemap_and_movers

def test_macro_strip():
    res = get_macro_strip()
    assert "data" in res
    assert len(res["data"]) >= 3
    first = res["data"][0]
    assert "label" in first
    assert "price" in first
    assert first["price"] > 0

def test_market_mood_gauge():
    res = get_market_mood_gauge()
    assert "data" in res
    data = res["data"]
    assert 0 <= data["score"] <= 100
    assert "sentiment" in data
    assert "formula" in data
    assert "components" in data

def test_market_treemap_and_movers():
    res = get_market_treemap_and_movers()
    assert "data" in res
    data = res["data"]
    assert "treemap" in data
    assert "gainers" in data
    assert "losers" in data
    assert "topVolume" in data
    assert "marketStatus" in data
    assert "isOpen" in data["marketStatus"]
