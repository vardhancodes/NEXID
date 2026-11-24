import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.core.cache import get_cached, set_cached, get_stale_fallback
from app.data.stock_provider import normalize_ticker

def compute_quant_stats(ticker: str, market: str = "NSE", benchmark: str = "^NSEI") -> Dict[str, Any]:
    full_symbol = normalize_ticker(ticker, market)
    cache_key = f"quant_stats:{full_symbol}"
    cached = get_cached(cache_key)
    if cached:
        return {"data": cached, "stale": False}

    try:
        # Fetch 2 years daily
        df_stock = yf.Ticker(full_symbol).history(period="2y", interval="1d")
        df_bench = yf.Ticker(benchmark).history(period="2y", interval="1d")

        if df_stock.empty:
            return {"error": f"Insufficient price history for {full_symbol}", "data": None}

        # Daily percentage returns
        stock_ret = df_stock["Close"].pct_change().dropna()
        bench_ret = df_bench["Close"].pct_change().dropna() if not df_bench.empty else stock_ret

        # Align series
        aligned = pd.concat([stock_ret, bench_ret], axis=1, join="inner").dropna()
        aligned.columns = ["stock", "benchmark"]

        s_ret = aligned["stock"]
        b_ret = aligned["benchmark"]

        # Annualized Volatility (252 trading days)
        ann_vol = float(s_ret.std() * np.sqrt(252))

        # CAGR
        start_p = float(df_stock["Close"].iloc[0])
        end_p = float(df_stock["Close"].iloc[-1])
        n_years = len(df_stock) / 252.0
        cagr = float((end_p / start_p) ** (1.0 / n_years) - 1.0) if n_years > 0 and start_p > 0 else 0.0

        # Max Drawdown
        cum_ret = (1 + s_ret).cumprod()
        peak = cum_ret.cummax()
        drawdown = (cum_ret - peak) / peak
        max_drawdown = float(drawdown.min())

        # Beta & Alpha
        cov = np.cov(s_ret, b_ret)[0][1]
        var_b = np.var(b_ret)
        beta = float(cov / var_b) if var_b > 0 else 1.0

        # Sharpe Ratio (Assuming 6.5% risk free rate for INR)
        rf_daily = 0.065 / 252
        excess_ret = s_ret - rf_daily
        sharpe = float(excess_ret.mean() / s_ret.std() * np.sqrt(252)) if s_ret.std() > 0 else 0.0

        # Historical Value at Risk (VaR 95% 1-day)
        var_95 = float(np.percentile(s_ret, 5))

        # Returns distribution histogram bins
        counts, bin_edges = np.histogram(s_ret * 100, bins=20)
        dist_bins = []
        for i in range(len(counts)):
            dist_bins.append({
                "range": f"{round(bin_edges[i], 1)}% to {round(bin_edges[i+1], 1)}%",
                "count": int(counts[i]),
                "mid": round((bin_edges[i] + bin_edges[i+1]) / 2, 2)
            })

        stats = {
            "symbol": ticker.upper(),
            "annualizedVolatility": round(ann_vol * 100, 2),
            "cagr": round(cagr * 100, 2),
            "maxDrawdown": round(max_drawdown * 100, 2),
            "beta": round(beta, 2),
            "sharpeRatio": round(sharpe, 2),
            "var95": round(abs(var_95) * 100, 2),
            "returnsDistribution": dist_bins,
            "observations": len(s_ret)
        }

        set_cached(cache_key, stats, ttl_seconds=3600)
        return {"data": stats, "stale": False}
    except Exception as e:
        print(f"[Error in quant stats] {e}")
        stale = get_stale_fallback(cache_key)
        if stale:
            return stale
        return {"error": str(e), "data": None}

def compute_correlation_matrix(tickers: List[str], market: str = "NSE", window_days: int = 30) -> Dict[str, Any]:
    """
    Computes NxN correlation matrix over selectable lookback window.
    """
    cache_key = f"corr:{':'.join(sorted(tickers))}:{window_days}"
    cached = get_cached(cache_key)
    if cached:
        return {"data": cached, "stale": False}

    try:
        returns_dict = {}
        for sym in tickers:
            full_sym = normalize_ticker(sym, market)
            df = yf.Ticker(full_sym).history(period=f"{max(window_days + 40, 60)}d", interval="1d")
            if not df.empty:
                returns_dict[sym.upper()] = df["Close"].pct_change().dropna().tail(window_days)

        df_returns = pd.DataFrame(returns_dict).dropna()
        corr_matrix = df_returns.corr().round(2)

        result = {
            "tickers": list(corr_matrix.columns),
            "matrix": corr_matrix.values.tolist(),
            "windowDays": window_days
        }

        set_cached(cache_key, result, ttl_seconds=1800)
        return {"data": result, "stale": False}
    except Exception as e:
        print(f"[Error in correlation matrix] {e}")
        stale = get_stale_fallback(cache_key)
        if stale:
            return stale
        return {"error": str(e), "data": None}

def calculate_everyday_calc(calc_type: str, params: Dict[str, float]) -> Dict[str, Any]:
    """
    Calculators: SIP, Lumpsum, EMI, Fixed Deposit (FD)
    """
    if calc_type == "sip":
        # params: monthly_investment, annual_rate, years
        p = params.get("monthlyInvestment", 5000)
        r = (params.get("annualRate", 12) / 100) / 12
        n = params.get("years", 10) * 12
        # M = P * ({[1 + i]^n - 1} / i) * (1 + i)
        total_invested = p * n
        maturity_value = p * (((1 + r) ** n - 1) / r) * (1 + r)
        wealth_gain = maturity_value - total_invested
        return {
            "type": "sip",
            "totalInvested": round(total_invested, 2),
            "wealthGain": round(wealth_gain, 2),
            "maturityValue": round(maturity_value, 2)
        }
    elif calc_type == "lumpsum":
        # A = P * (1 + r/100)^t
        p = params.get("investment", 100000)
        r = params.get("annualRate", 12) / 100
        t = params.get("years", 10)
        maturity_value = p * ((1 + r) ** t)
        return {
            "type": "lumpsum",
            "totalInvested": round(p, 2),
            "wealthGain": round(maturity_value - p, 2),
            "maturityValue": round(maturity_value, 2)
        }
    elif calc_type == "emi":
        # E = P * r * (1 + r)^n / ((1 + r)^n - 1)
        p = params.get("principal", 1000000)
        r = (params.get("annualRate", 8.5) / 100) / 12
        n = params.get("years", 20) * 12
        emi = (p * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1)
        total_payment = emi * n
        total_interest = total_payment - p
        return {
            "type": "emi",
            "monthlyEmi": round(emi, 2),
            "totalInterest": round(total_interest, 2),
            "totalPayment": round(total_payment, 2)
        }
    elif calc_type == "fd":
        # A = P * (1 + r/n)^(n*t) compounded quarterly (n=4)
        p = params.get("principal", 100000)
        r = params.get("annualRate", 7.0) / 100
        t = params.get("years", 5)
        n = 4
        maturity = p * ((1 + r/n) ** (n*t))
        return {
            "type": "fd",
            "principal": round(p, 2),
            "interestEarned": round(maturity - p, 2),
            "maturityValue": round(maturity, 2)
        }
    return {"error": "Unknown calculator type"}
