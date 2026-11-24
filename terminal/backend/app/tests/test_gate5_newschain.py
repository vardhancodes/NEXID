import pytest
from app.data.newschain_service import build_causal_news_chain

def test_causal_news_chain_validation():
    chain_res = build_causal_news_chain("RELIANCE", market="NSE")
    assert "chain" in chain_res
    assert len(chain_res["chain"]) >= 3
    assert "eventStudy" in chain_res
    study = chain_res["eventStudy"]
    assert "assetReturnPct" in study
    assert "alphaExcessPct" in study

    # Assert cause precedes effect
    links = chain_res["chain"]
    for i in range(len(links) - 1):
        assert links[i]["timestamp"] <= links[i+1]["timestamp"]
        assert links[i]["confidence"] in ["Supported", "Weak", "Speculative"]
        assert links[i]["citation"]["url"].startswith("http")
