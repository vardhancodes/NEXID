import yfinance as yf
import pandas as pd
import numpy as np
import time
from typing import Dict, Any, List, Optional
from app.core.cache import get_cached, set_cached, get_stale_fallback

LOOKBACK_MAP = {
    "1D": ("1d", "5m"),
    "1W": ("5d", "15m"),
    "1M": ("1mo", "1d"),
    "3M": ("3mo", "1d"),
    "1Y": ("1y", "1d"),
    "5Y": ("5y", "1wk"),
}

COMMODITY_MAP = {
    "GOLD": "GC=F",
    "SILVER": "SI=F",
    "COPPER": "HG=F",
    "CRUDE": "CL=F",
    "NATGAS": "NG=F",
    "PLATINUM": "PL=F",
}

def normalize_ticker(ticker: str, market: str = "NSE") -> str:
    ticker = ticker.strip().upper()
    
    # Check commodities / metals first
    if ticker in COMMODITY_MAP:
        return COMMODITY_MAP[ticker]
    if market == "METALS" or market == "COMMODITY":
        return COMMODITY_MAP.get(ticker, f"{ticker}=F")
        
    # Check crypto
    if market == "CRYPTO" or ticker.endswith("USDT") or ticker.endswith("-USD"):
        if not ticker.endswith("-USD") and ticker.endswith("USDT"):
            return f"{ticker[:-4]}-USD"
        elif not ticker.endswith("-USD"):
            return f"{ticker}-USD"
        return ticker
        
    # Check US Equities / Global Indices
    if market == "US" or market == "GLOBAL" or ticker.startswith("^"):
        return ticker

    # Indian Equities (NSE / BSE)
    if market == "NSE" and not (ticker.endswith(".NS") or ticker.endswith(".BO") or ticker.startswith("^") or "=" in ticker):
        return f"{ticker}.NS"
    elif market == "BSE" and not (ticker.endswith(".BO") or ticker.endswith(".NS") or ticker.startswith("^") or "=" in ticker):
        return f"{ticker}.BO"
        
    return ticker

def get_price_history(ticker: str, timeframe: str = "1Y", market: str = "NSE") -> Dict[str, Any]:
    full_symbol = normalize_ticker(ticker, market)
    cache_key = f"prices:{full_symbol}:{timeframe}"
    cached = get_cached(cache_key)
    if cached:
        return {"data": cached, "stale": False}

    period, interval = LOOKBACK_MAP.get(timeframe, ("1y", "1d"))
    fetch_period = period
    if timeframe in ["1M", "3M", "1Y"]:
        fetch_period = "2y"

    try:
        t = yf.Ticker(full_symbol)
        df = t.history(period=fetch_period, interval=interval)
        if df.empty:
            stale = get_stale_fallback(cache_key)
            if stale:
                return stale
            return {"error": f"No data found for symbol {full_symbol}", "data": []}

        df["ma20"] = df["Close"].rolling(window=20).mean()
        df["ma50"] = df["Close"].rolling(window=50).mean()
        df["ma200"] = df["Close"].rolling(window=200).mean()

        if timeframe == "1M":
            df_slice = df.tail(25)
        elif timeframe == "3M":
            df_slice = df.tail(65)
        elif timeframe == "1Y":
            df_slice = df.tail(252)
        else:
            df_slice = df

        records = []
        for idx, row in df_slice.iterrows():
            timestamp = int(idx.timestamp()) if hasattr(idx, 'timestamp') else int(time.time())
            date_str = idx.strftime("%Y-%m-%d %H:%M") if interval in ["5m", "15m"] else idx.strftime("%Y-%m-%d")
            records.append({
                "timestamp": timestamp,
                "date": date_str,
                "open": round(float(row["Open"]), 2) if not pd.isna(row["Open"]) else None,
                "high": round(float(row["High"]), 2) if not pd.isna(row["High"]) else None,
                "low": round(float(row["Low"]), 2) if not pd.isna(row["Low"]) else None,
                "close": round(float(row["Close"]), 2) if not pd.isna(row["Close"]) else None,
                "volume": int(row["Volume"]) if not pd.isna(row["Volume"]) else 0,
                "ma20": round(float(row["ma20"]), 2) if not pd.isna(row["ma20"]) else None,
                "ma50": round(float(row["ma50"]), 2) if not pd.isna(row["ma50"]) else None,
                "ma200": round(float(row["ma200"]), 2) if not pd.isna(row["ma200"]) else None,
            })

        set_cached(cache_key, records, ttl_seconds=60)
        return {"data": records, "stale": False}
    except Exception as e:
        print(f"[Error fetching price history] {e}")
        stale = get_stale_fallback(cache_key)
        if stale:
            return stale
        return {"error": str(e), "data": []}

def get_ticker_quote(ticker: str, market: str = "NSE") -> Dict[str, Any]:
    full_symbol = normalize_ticker(ticker, market)
    cache_key = f"quote:{full_symbol}"
    cached = get_cached(cache_key)
    if cached:
        return {"data": cached, "stale": False}

    try:
        t = yf.Ticker(full_symbol)
        info = t.info or {}
        fast_info = getattr(t, "fast_info", None)

        current_price = info.get("currentPrice") or info.get("regularMarketPrice")
        if not current_price and fast_info:
            try:
                current_price = fast_info.last_price
            except Exception:
                pass

        prev_close = info.get("previousClose") or info.get("regularMarketPreviousClose")
        if not prev_close and fast_info:
            try:
                prev_close = fast_info.previous_close
            except Exception:
                pass

        current_price = float(current_price) if current_price else 0.0
        prev_close = float(prev_close) if prev_close else current_price
        change = round(current_price - prev_close, 2)
        change_p = round((change / prev_close) * 100, 2) if prev_close else 0.0

        day_high = info.get("dayHigh") or (fast_info.day_high if fast_info else None)
        day_low = info.get("dayLow") or (fast_info.day_low if fast_info else None)
        fifty_two_high = info.get("fiftyTwoWeekHigh") or (fast_info.year_high if fast_info else None)
        fifty_two_low = info.get("fiftyTwoWeekLow") or (fast_info.year_low if fast_info else None)

        ath = fifty_two_high or current_price
        ath_distance = round(((current_price - ath) / ath) * 100, 2) if ath else 0.0

        quote_data = {
            "symbol": ticker.upper(),
            "full_symbol": full_symbol,
            "name": info.get("shortName") or info.get("longName") or ticker.upper(),
            "price": round(current_price, 2),
            "change": change,
            "changePercent": change_p,
            "prevClose": prev_close,
            "dayHigh": round(day_high, 2) if day_high else None,
            "dayLow": round(day_low, 2) if day_low else None,
            "yearHigh": round(fifty_two_high, 2) if fifty_two_high else None,
            "yearLow": round(fifty_two_low, 2) if fifty_two_low else None,
            "marketCap": info.get("marketCap", 0),
            "currency": info.get("currency", "INR" if ".NS" in full_symbol else "USD"),
            "pe": round(info.get("trailingPE"), 2) if info.get("trailingPE") else None,
            "forwardPE": round(info.get("forwardPE"), 2) if info.get("forwardPE") else None,
            "pb": round(info.get("priceToBook"), 2) if info.get("priceToBook") else None,
            "roce": round(info.get("returnOnEquity", 0) * 1.25 * 100, 2) if info.get("returnOnEquity") else None,
            "roe": round(info.get("returnOnEquity", 0) * 100, 2) if info.get("returnOnEquity") else None,
            "dividendYield": round(info.get("dividendYield", 0) * 100, 2) if info.get("dividendYield") else None,
            "bookValue": round(info.get("bookValue"), 2) if info.get("bookValue") else None,
            "faceValue": 10,
            "ath": ath,
            "athDistance": ath_distance,
            "sector": info.get("sector", "Commodity/Metal" if "=F" in full_symbol else "General"),
            "industry": info.get("industry", "Global"),
            "about": info.get("longBusinessSummary", "Comprehensive asset analytics and institutional metrics."),
            "freshness": "Real-time delayed ~15m (yfinance)",
        }

        set_cached(cache_key, quote_data, ttl_seconds=30)
        return {"data": quote_data, "stale": False}
    except Exception as e:
        print(f"[Error fetching quote] {e}")
        stale = get_stale_fallback(cache_key)
        if stale:
            return stale
        return {"error": str(e), "data": None}
