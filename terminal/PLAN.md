# Tessera — Architecture & Implementation Plan (Gate 0)

## 1. Overview
**Tessera** is a minimal, aesthetic, all-in-one financial analytics terminal combining classical quantitative equity analysis, machine learning forecasting, causal event-chain intelligence, customizable workspace layouts, and live macro boards with zero paid API dependencies.

Default Market: **India (NSE/BSE)** with US market & Crypto mode (v1.1 adapter interface).

---

## 2. Five Core Modules
1. **Financials + Stats (Gate 2)**
   - Fundamentals: Income Statement, Balance Sheet, Cash Flow (Annual & Quarterly toggles via yfinance / cached SQLite).
   - Ratios: Liquidity, Profitability, Leverage, Efficiency, Valuation, DuPont decomposition, Altman Z-Score, Piotroski F-Score with formulas and plain-English explanations.
   - Quantitative Stats: Returns distribution, volatility, max drawdown, beta, correlation matrix ($N \times N$), Sharpe ratio, Historical VaR (95%), CAGR.
   - Everyday Calculators: SIP, Lumpsum, EMI, Fixed Deposit (FD).

2. **Live Board (Gate 3)**
   - Macro Strip: Nifty 50, Sensex, USD/INR, Crude Oil, Gold, India 10Y Yield.
   - Market Mood Gauge: Composite score (India VIX + market breadth + % above 200-DMA with full transparent formula).
   - Treemap Heatmap: Sector & Market-Cap weighted tile visualization with 24h percentage coloring.
   - Movers: Top Gainers, Losers, and Volume leaders.
   - Market Status: Real-time NSE/BSE open/closed indicator with delay disclaimer (~15 min delayed unless live adapter configured).

3. **Model Lab (Gate 4)**
   - ML Playground for next-day direction or N-day price prediction.
   - Models: Ridge/Linear Regression, Random Forest, Gradient Boosting (XGBoost/GB), k-NN, ARIMA.
   - Features: Lagged returns, SMA/EMA ratios, RSI, MACD, Volatility, Volume change.
   - Strict Walk-Forward validation with zero look-ahead bias (unit tested).
   - Comparison against naive baseline (last value / zero-change) with MAE, RMSE, Directional Accuracy, and Run Leaderboard.
   - Clear educational disclaimer.

4. **News Chain (Gate 5)**
   - Causal event-graph linking news events to measurable stock moves.
   - Real retrieved RSS/GNews feeds (Cointelegraph/Google News/financial RSS).
   - Event links with relation type (policy, supply chain, macro, competitor, earnings), citations, timestamps (cause precedes effect), and confidence classification (Supported/Weak/Speculative).
   - Event-study validation: stock return vs index over window.

5. **My Space (Gate 6)**
   - Drag-and-drop customizable dashboard with `react-grid-layout`.
   - Widgets: Watchlist (localStorage), Price Chart, Ratio Card, News Feed, Movers, Calculator, Notes, Model Summary, Paper Portfolio (simulated holdings, net worth, unrealized PnL, allocation donut, JSON export/import).
   - Strict `minW` / `minH` constraints preventing illegal widget collapse.
   - Density toggles: Comfortable, Compact, Dense.
   - Multiple named workspaces persisted to localStorage.

---

## 3. Shared Components & Global UX
- **Shared Chart Component:** Area/Line and Candlestick modes, Volume bars, Timeframes (1D, 1W, 1M, 3M, 1Y, 5Y), Moving Average overlays (MA 20, 50, 200 with extra lookback buffer), crosshair tooltip.
- **Range Widgets:** 52-week & day-range progress indicators, distance from All-Time High (ATH).
- **Command Palette (`Cmd+K` / `Ctrl+K`):** Instant ticker search, module navigation, theme toggle, density switch.
- **Compare & Correlation:** Multi-asset normalized percentage comparison and $N \times N$ correlation matrix.
- **Crypto Mode Interface (v1.1):** Abstract provider engine (Binance vision API $\rightarrow$ CoinGecko $\rightarrow$ CoinDCX $\rightarrow$ Stale cache).

---

## 4. Stack & Directory Layout
```
tessera/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (data, stats, models, news, macro, crypto)
│   │   ├── core/            # Config, cache (SQLite), rate limiters
│   │   ├── data/            # Data providers (yfinance, RSS feeds, Binance vision, CoinGecko)
│   │   ├── ml/              # Model registry, feature engineering, walk-forward validation
│   │   └── tests/           # Unit tests (look-ahead leakage prevention, ratio math, etc.)
│   ├── requirements.txt
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/      # SharedChart, Header, Sidebar, CommandPalette, RangeWidget
│   │   ├── modules/         # Financials, LiveBoard, ModelLab, NewsChain, MySpace
│   │   ├── hooks/           # useWatchlist, usePortfolio, useLocalStorage
│   │   ├── services/        # API client
│   │   └── types/           # Shared TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── Makefile
├── PLAN.md
└── TEST_REPORT.md
```

---

## 5. Risk Assessment & Mitigations
| Risk | Mitigation |
| :--- | :--- |
| **API Rate Limits / Outages** | SQLite caching with 30-60s TTL; cascading provider fallbacks; clear "stale data" indicator instead of synthetic mock data. |
| **Data Leakage in ML** | Strict walk-forward time-series split (`TimeSeriesSplit`) without forward-looking features. Dedicated test asserting test timestamps > train timestamps. |
| **Widget Layout Collision** | `react-grid-layout` with explicit bounds and min-dimension enforcement. Add button disabled when space is exhausted. |
