import pytest
from app.data.financials_service import get_financial_statements, compute_ratios_and_scores
from app.data.stats_service import compute_quant_stats, compute_correlation_matrix, calculate_everyday_calc

def test_financial_statements_annual():
    res = get_financial_statements("INFY", market="NSE", freq="annual")
    assert "data" in res
    if res["data"]:
        data = res["data"]
        assert data["symbol"] == "INFY"
        assert "incomeStatement" in data
        assert "balanceSheet" in data

def test_ratios_and_institutional_models():
    res = compute_ratios_and_scores("RELIANCE", market="NSE")
    assert "data" in res
    if res["data"]:
        data = res["data"]
        assert "valuation" in data
        assert "institutionalModels" in data
        assert "dupont" in data["institutionalModels"]
        assert "altmanZ" in data["institutionalModels"]
        assert "piotroskiF" in data["institutionalModels"]

def test_quant_stats():
    res = compute_quant_stats("TCS", market="NSE")
    assert "data" in res
    if res["data"]:
        data = res["data"]
        assert "annualizedVolatility" in data
        assert "beta" in data
        assert "sharpeRatio" in data
        assert "var95" in data
        assert "returnsDistribution" in data

def test_correlation_matrix():
    res = compute_correlation_matrix(["TCS", "INFY", "WIPRO"], market="NSE", window_days=20)
    assert "data" in res
    if res["data"]:
        data = res["data"]
        assert len(data["tickers"]) >= 2
        assert len(data["matrix"]) >= 2

def test_everyday_calculators():
    sip = calculate_everyday_calc("sip", {"monthlyInvestment": 10000, "annualRate": 12, "years": 10})
    assert sip["totalInvested"] == 1200000
    assert sip["maturityValue"] > sip["totalInvested"]

    emi = calculate_everyday_calc("emi", {"principal": 5000000, "annualRate": 8.5, "years": 20})
    assert emi["monthlyEmi"] > 0
    assert emi["totalPayment"] > 5000000
