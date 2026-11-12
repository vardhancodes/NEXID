<div align="center">

# 📈 NEXID — Institutional-Grade Cryptocurrency Analytics Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.12-22c55e?style=flat-square&logo=chart.js&logoColor=white)](https://recharts.org/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24-purple?style=flat-square&logo=auth0&logoColor=white)](https://next-auth.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

<p align="center">
  <em>A high-performance crypto analytics platform delivering real-time spot prices, interactive 100-day historical trend visualizers, dynamic search, and crypto news intelligence.</em>
</p>

---

</div>

## ✨ Key Capabilities & Enhancements

- **⚡ Real-Time Market Overview:** Instant tracking of top global cryptocurrencies (BTC, ETH, SOL, BNB, XRP, DOGE, ADA, AVAX, etc.) with 24h percentage shifts and sample market breadth.
- **📊 Interactive Price Action Charts:** Smooth, responsive historical price curves (powered by Recharts and Framer Motion) across dynamic 100-day rolling horizons.
- **🔍 Instant Asset Search & Filtering:** Debounced search queries across all major tokens and spot pairs.
- **📰 Curated News Intelligence:** Aggregated cryptocurrency news stream with publication timestamps, sources, and external links.
- **🛡️ Resilient Dual-Layer Architecture:**
  - Fully compatible with **Financial Modeling Prep (FMP)** API.
  - Automatically activates built-in resilient market fallback streams when external API keys or rate-limits are reached, ensuring **zero downtime** in demo/standalone environments.
- **🔐 Google OAuth & Analytics Integration:** NextAuth.js authentication pipeline with lazy Google BigQuery session event ingestion.
- **📱 Responsive Minimal UI:** Dark-mode dashboard layout adhering to clean developer aesthetic principles.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│             Next.js 14 Client Layer (App Router)       │
│  (Market Overview · Asset Explorer · Detail Modal)     │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
            ▼                                ▼
┌───────────────────────┐        ┌───────────────────────┐
│     NextAuth.js       │        │   Next.js API Routes  │
│  (Google OAuth Gate)  │        │ (/api/crypto, /news)  │
└───────────┬───────────┘        └───────────┬───────────┘
            │                                │
            ▼                                ▼
┌───────────────────────┐        ┌───────────────────────┐
│ Google Cloud BigQuery │        │ FMP API + Local Engine│
│   (Session Telemetry) │        │ (Realtime / Fallback) │
└───────────────────────┘        └───────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- npm, pnpm, or bun

### 1. Clone the repository
```bash
git clone https://github.com/vardhancodes/NEXID.git
cd NEXID
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables (Optional)
Create a `.env.local` file in the root directory:
```env
# Optional: Financial Modeling Prep API Key (falls back to local data if omitted)
FMP_API_KEY=your_fmp_api_key

# Optional: NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_token
NEXTAUTH_URL=http://localhost:3000

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: BigQuery User Activity Tracking
GOOGLE_PROJECT_ID=your_gcp_project_id
GOOGLE_CREDENTIALS={"type":"service_account",...}
BIGQUERY_DATASET_ID=your_dataset
BIGQUERY_TABLE_ID=your_table
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```text
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # Authentication endpoint
│   │   ├── crypto/              # Top quotes, search, historical, detail
│   │   └── news/                # Crypto news feed & sitemap scraper
│   ├── crypto/
│   │   ├── page.tsx             # Full asset search and catalog
│   │   └── [symbol]/page.tsx    # Dedicated deep-dive token page
│   ├── help/page.tsx            # Documentation & setup FAQ
│   ├── news/page.tsx            # Full-page news stream
│   ├── settings/page.tsx        # Profile & configuration view
│   ├── layout.tsx               # Root layout with sidebar & header
│   └── page.tsx                 # Primary market dashboard
├── components/
│   ├── CryptoCard.tsx           # Individual coin quote card with hover states
│   ├── Header.tsx               # Global top navigation & notifications
│   ├── Sidebar.tsx              # Sidebar navigation bar
│   ├── StockChart.tsx           # Recharts historical line visualizer
│   └── StockDetailModal.tsx     # Multifunctional interactive detail modal
├── lib/
│   └── crypto-data.ts           # Shared data models & resilient fallback dataset
└── tailwind.config.ts           # Custom dark theme configuration
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
