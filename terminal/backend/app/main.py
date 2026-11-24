from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from app.core.cache import init_cache_db
from app.data.stock_provider import get_price_history, get_ticker_quote
from app.data.financials_service import get_financial_statements, compute_ratios_and_scores
from app.data.stats_service import compute_quant_stats, compute_correlation_matrix, calculate_everyday_calc
from app.data.liveboard_service import get_macro_strip, get_market_mood_gauge, get_market_treemap_and_movers
from app.data.crypto_provider import get_crypto_spot_quotes
from app.data.news_provider import get_live_news
from app.data.newschain_service import build_causal_news_chain
from app.ml.model_engine import run_custom_ml_experiment

app = FastAPI(title="Tessera Financial Terminal API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_cache_db()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Tessera Terminal", "version": "1.0.0"}

# Module 1: Data & Stock Quotes
@app.get("/api/stock/quote")
def stock_quote(ticker: str = Query("RELIANCE"), market: str = Query("NSE")):
    return get_ticker_quote(ticker, market)

@app.get("/api/stock/history")
def stock_history(ticker: str = Query("RELIANCE"), timeframe: str = Query("1Y"), market: str = Query("NSE")):
    return get_price_history(ticker, timeframe, market)

# Module 2: Financials & Quantitative Stats
@app.get("/api/financials/statements")
def financial_statements(ticker: str = Query("RELIANCE"), market: str = Query("NSE"), freq: str = Query("annual")):
    return get_financial_statements(ticker, market, freq)

@app.get("/api/financials/ratios")
def financial_ratios(ticker: str = Query("RELIANCE"), market: str = Query("NSE")):
    return compute_ratios_and_scores(ticker, market)

@app.get("/api/stats/quant")
def quant_stats(ticker: str = Query("RELIANCE"), market: str = Query("NSE")):
    return compute_quant_stats(ticker, market)

@app.get("/api/stats/correlation")
def correlation_matrix(
    tickers: str = Query("TCS,INFY,WIPRO,HCLTECH"),
    market: str = Query("NSE"),
    window_days: int = Query(30)
):
    ticker_list = [t.strip().upper() for t in tickers.split(",") if t.strip()]
    return compute_correlation_matrix(ticker_list, market, window_days)

@app.post("/api/stats/calculator")
def run_calculator(payload: Dict[str, Any] = Body(...)):
    calc_type = payload.get("type", "sip")
    params = payload.get("params", {})
    return calculate_everyday_calc(calc_type, params)

# Module 3: Live Board
@app.get("/api/liveboard/macro")
def liveboard_macro():
    return get_macro_strip()

@app.get("/api/liveboard/mood")
def liveboard_mood():
    return get_market_mood_gauge()

@app.get("/api/liveboard/treemap-movers")
def liveboard_treemap_movers():
    return get_market_treemap_and_movers()

# Module 4: Model Lab (ML Playground)
@app.post("/api/ml/experiment")
def run_model_experiment(payload: Dict[str, Any] = Body(...)):
    ticker = payload.get("ticker", "TCS")
    timeframe = payload.get("timeframe", "1Y")
    target_type = payload.get("target", "price_5d")
    model_name = payload.get("model", "random_forest")
    train_split_pct = float(payload.get("train_split_pct", 0.75))
    hyperparams = payload.get("hyperparameters", {})
    feature_config = payload.get("feature_config", {})
    market = payload.get("market", "NSE")
    return run_custom_ml_experiment(ticker, timeframe, target_type, model_name, train_split_pct, hyperparams, feature_config, market)

# Module 5: News & News Chain
@app.get("/api/news/live")
def live_news(feed_type: Optional[str] = Query(None), keyword: Optional[str] = Query(None)):
    return get_live_news(feed_type, keyword)

@app.get("/api/news/chain")
def news_chain(ticker: str = Query("RELIANCE"), market: str = Query("NSE")):
    return build_causal_news_chain(ticker, market)

# Crypto Interface (v1.1 adapter)
@app.get("/api/crypto/spot")
def crypto_spot():
    return get_crypto_spot_quotes()
