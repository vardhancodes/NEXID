import requests
import json
import time
from typing import Dict, Any, List
from app.core.cache import get_cached, set_cached, get_stale_fallback

# Cascading crypto sources:
# 1. Binance Vision Market-data (data-api.binance.vision / api.binance.com)
# 2. CoinGecko Public (keyless or demo key)
# 3. CoinDCX Public
# 4. Stale snapshot fallback

BINANCE_HOSTS = [
    "https://data-api.binance.vision",
    "https://api.binance.com"
]

def get_crypto_spot_quotes() -> Dict[str, Any]:
    cache_key = "crypto:spot_quotes"
    cached = get_cached(cache_key)
    if cached:
        return {"data": cached, "stale": False, "provider": "cache"}

    target_pairs = {
        "BTCUSDT": ("Bitcoin", "BTC"),
        "ETHUSDT": ("Ethereum", "ETH"),
        "SOLUSDT": ("Solana", "SOL"),
        "BNBUSDT": ("BNB", "BNB"),
        "XRPUSDT": ("XRP", "XRP"),
        "DOGEUSDT": ("Dogecoin", "DOGE"),
        "ADAUSDT": ("Cardano", "ADA"),
        "AVAXUSDT": ("Avalanche", "AVAX"),
        "SUIUSDT": ("Sui", "SUI"),
        "LINKUSDT": ("Chainlink", "LINK"),
    }

    # Try Binance Vision / Binance REST API
    for host in BINANCE_HOSTS:
        try:
            url = f"{host}/api/v3/ticker/24hr"
            res = requests.get(url, timeout=4)
            if res.status_code == 200:
                tickers = res.json()
                results = []
                ticker_map = {t["symbol"]: t for t in tickers if t["symbol"] in target_pairs}
                for sym, (name, coin) in target_pairs.items():
                    if sym in ticker_map:
                        item = ticker_map[sym]
                        last_p = float(item["lastPrice"])
                        change_p = float(item["priceChangePercent"])
                        high_p = float(item["highPrice"])
                        low_p = float(item["lowPrice"])
                        vol = float(item["quoteVolume"])
                        results.append({
                            "symbol": sym,
                            "coin": coin,
                            "name": name,
                            "price": last_p,
                            "changePercent": round(change_p, 2),
                            "high24h": high_p,
                            "low24h": low_p,
                            "volume24h": vol,
                            "marketCap": None,
                        })
                if results:
                    set_cached(cache_key, results, ttl_seconds=30)
                    return {"data": results, "stale": False, "provider": f"Binance ({host})"}
        except Exception as e:
            print(f"[Crypto Provider] Error hitting {host}: {e}")

    # Fallback 2: CoinGecko Public Markets
    try:
        cg_url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false"
        res = requests.get(cg_url, timeout=5)
        if res.status_code == 200:
            coins = res.json()
            results = []
            for c in coins:
                sym = f"{c['symbol'].upper()}USDT"
                results.append({
                    "symbol": sym,
                    "coin": c['symbol'].upper(),
                    "name": c['name'],
                    "price": float(c['current_price']),
                    "changePercent": round(float(c.get('price_change_percentage_24h') or 0), 2),
                    "high24h": float(c.get('high_24h') or c['current_price']),
                    "low24h": float(c.get('low_24h') or c['current_price']),
                    "volume24h": float(c.get('total_volume') or 0),
                    "marketCap": float(c.get('market_cap') or 0),
                })
            set_cached(cache_key, results, ttl_seconds=60)
            return {"data": results, "stale": False, "provider": "CoinGecko"}
    except Exception as e:
        print(f"[Crypto Provider] CoinGecko fallback failed: {e}")

    # Fallback 3: Stale cache
    stale = get_stale_fallback(cache_key)
    if stale:
        return {**stale, "provider": "stale_cache"}

    return {"error": "Crypto market providers temporarily unreachable.", "data": []}
