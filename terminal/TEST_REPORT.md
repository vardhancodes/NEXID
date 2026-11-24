# Tessera Test & Verification Report (Gate 7)

**Date:** November 24, 2026  
**System Under Test:** Tessera Financial Terminal (v1.1)  
**Test Suite Status:** 16 Passed, 0 Failed, 0 Skipped (100% Pass Rate)

---

## 1. Automated Test Execution Matrix

| Test Module | Test Case | Status | Verified Capability |
| :--- | :--- | :---: | :--- |
| `test_gate1_data.py` | `test_cache_db` | **PASSED** | SQLite caching engine with TTL & atomic upsert |
| `test_gate1_data.py` | `test_crypto_spot_quotes` | **PASSED** | Binance Vision & CoinGecko zero-key multi-tier fallbacks |
| `test_gate1_data.py` | `test_stock_quote_live` | **PASSED** | Live NSE ticker quote fetching via yfinance |
| `test_gate1_data.py` | `test_price_history_with_lookback_buffer` | **PASSED** | Buffer lookback ensures MA-200 is computed correctly even on 1M/3M slices |
| `test_gate1_data.py` | `test_news_provider` | **PASSED** | Real RSS parsing from Cointelegraph, Decrypt, Economic Times & GNews |
| `test_gate2_financials.py` | `test_financial_statements_annual` | **PASSED** | Balance Sheet, Income Statement, Cash Flow extraction |
| `test_gate2_financials.py` | `test_ratios_and_institutional_models` | **PASSED** | DuPont 3-Way, Altman Z-Score & Piotroski F-Score |
| `test_gate2_financials.py` | `test_quant_stats` | **PASSED** | Annual Volatility, Sharpe Ratio, Max Drawdown, Beta, Historical VaR 95% |
| `test_gate2_financials.py` | `test_correlation_matrix` | **PASSED** | $N \times N$ returns correlation matrix calculation |
| `test_gate2_financials.py` | `test_everyday_calculators` | **PASSED** | SIP, Lumpsum, EMI, and Fixed Deposit mathematical formulations |
| `test_gate3_liveboard.py` | `test_macro_strip` | **PASSED** | Nifty 50, Sensex, USD/INR, Crude, Gold, India VIX |
| `test_gate3_liveboard.py` | `test_market_mood_gauge` | **PASSED** | Transparent composite formula (40% VIX + 35% DMA + 25% Breadth) |
| `test_gate3_liveboard.py` | `test_market_treemap_and_movers` | **PASSED** | Sector heatmap, Gainers, Losers, and Volume rankings |
| `test_gate4_modellab.py` | `test_no_lookahead_leakage` | **PASSED** | **Zero Look-Ahead Bias:** Future perturbation at $t$ does not alter $t-1$ features |
| `test_gate4_modellab.py` | `test_model_lab_end_to_end` | **PASSED** | Chronological walk-forward split (75% train / 25% test) vs Naive baseline |
| `test_gate5_newschain.py` | `test_causal_news_chain_validation` | **PASSED** | Causal event ordering (cause strictly precedes effect) with 5-day event alpha |

---

## 2. Frontend Build & Static Analysis
- **Build tool:** Vite + TypeScript (React 18)
- **Result:** `tsc -b && vite build` completed in **1.14s** with 0 errors.
- **Bundle output:** Clean production bundle with CSS/JS split.

---

## 3. Data Integrity & Safeguards
- **Zero Paid APIs:** Free resilient tiers (yfinance, Binance Vision API, CoinGecko, RSS).
- **Zero Mock Numbers:** If a network source is unreachable, the system serves the last-known-good cache tagged as stale or displays transparent error messaging.
- **Educational Framing:** Model Lab prominently features the "Educational, not financial advice" notice.
