// lib/crypto-data.ts

export type CryptoQuote = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  marketCap: number;
  volume?: number;
  pe?: number;
  eps?: number;
  sharesOutstanding?: number;
  priceAvg50?: number;
  priceAvg200?: number;
  yearHigh?: number;
  yearLow?: number;
};

export type HistoricalPrice = {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
};

export type NewsItem = {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  publishedTime: string;
  site: string;
  image?: string;
  date?: string;
};

export const FALLBACK_CRYPTOS: Record<string, CryptoQuote> = {
  BTCUSD: {
    symbol: 'BTCUSD',
    name: 'Bitcoin',
    price: 91450.00,
    change: 2840.50,
    changesPercentage: 3.21,
    marketCap: 1805000000000,
    volume: 48500000000,
    priceAvg50: 84200.00,
    priceAvg200: 67500.00,
    yearHigh: 99800.00,
    yearLow: 38500.00,
  },
  ETHUSD: {
    symbol: 'ETHUSD',
    name: 'Ethereum',
    price: 3340.25,
    change: 112.40,
    changesPercentage: 3.48,
    marketCap: 402000000000,
    volume: 24200000000,
    priceAvg50: 2950.00,
    priceAvg200: 2600.00,
    yearHigh: 4090.00,
    yearLow: 2150.00,
  },
  SOLUSD: {
    symbol: 'SOLUSD',
    name: 'Solana',
    price: 218.75,
    change: 14.20,
    changesPercentage: 6.94,
    marketCap: 103000000000,
    volume: 8900000000,
    priceAvg50: 175.50,
    priceAvg200: 142.00,
    yearHigh: 260.00,
    yearLow: 55.00,
  },
  BNBUSD: {
    symbol: 'BNBUSD',
    name: 'BNB',
    price: 645.80,
    change: 9.60,
    changesPercentage: 1.51,
    marketCap: 94000000000,
    volume: 1800000000,
    priceAvg50: 590.00,
    priceAvg200: 540.00,
    yearHigh: 720.00,
    yearLow: 310.00,
  },
  XRPUSD: {
    symbol: 'XRPUSD',
    name: 'XRP',
    price: 1.48,
    change: 0.12,
    changesPercentage: 8.82,
    marketCap: 84000000000,
    volume: 6200000000,
    priceAvg50: 0.72,
    priceAvg200: 0.58,
    yearHigh: 1.95,
    yearLow: 0.42,
  },
  DOGEUSD: {
    symbol: 'DOGEUSD',
    name: 'Dogecoin',
    price: 0.385,
    change: -0.012,
    changesPercentage: -3.02,
    marketCap: 56000000000,
    volume: 4100000000,
    priceAvg50: 0.22,
    priceAvg200: 0.14,
    yearHigh: 0.48,
    yearLow: 0.07,
  },
  ADAUSD: {
    symbol: 'ADAUSD',
    name: 'Cardano',
    price: 0.86,
    change: 0.04,
    changesPercentage: 4.88,
    marketCap: 30500000000,
    volume: 1750000000,
    priceAvg50: 0.52,
    priceAvg200: 0.45,
    yearHigh: 1.15,
    yearLow: 0.31,
  },
  AVAXUSD: {
    symbol: 'AVAXUSD',
    name: 'Avalanche',
    price: 36.80,
    change: 1.25,
    changesPercentage: 3.52,
    marketCap: 14800000000,
    volume: 820000000,
    priceAvg50: 28.50,
    priceAvg200: 25.10,
    yearHigh: 65.00,
    yearLow: 17.50,
  },
  LINKUSD: {
    symbol: 'LINKUSD',
    name: 'Chainlink',
    price: 18.60,
    change: 1.15,
    changesPercentage: 6.59,
    marketCap: 11200000000,
    volume: 910000000,
    priceAvg50: 13.20,
    priceAvg200: 14.50,
    yearHigh: 22.80,
    yearLow: 9.80,
  },
  DOTUSD: {
    symbol: 'DOTUSD',
    name: 'Polkadot',
    price: 8.95,
    change: 0.22,
    changesPercentage: 2.52,
    marketCap: 12800000000,
    volume: 640000000,
    priceAvg50: 6.40,
    priceAvg200: 6.90,
    yearHigh: 11.80,
    yearLow: 3.90,
  },
  SHIBUSD: {
    symbol: 'SHIBUSD',
    name: 'Shiba Inu',
    price: 0.000026,
    change: 0.000001,
    changesPercentage: 4.00,
    marketCap: 15300000000,
    volume: 1200000000,
    priceAvg50: 0.000018,
    priceAvg200: 0.000016,
    yearHigh: 0.000045,
    yearLow: 0.000008,
  },
  LTCUSD: {
    symbol: 'LTCUSD',
    name: 'Litecoin',
    price: 96.50,
    change: 2.10,
    changesPercentage: 2.22,
    marketCap: 7200000000,
    volume: 530000000,
    priceAvg50: 74.00,
    priceAvg200: 78.00,
    yearHigh: 112.00,
    yearLow: 56.00,
  },
};

export const FALLBACK_NEWS: NewsItem[] = [
  {
    url: 'https://coindesk.com',
    title: 'Bitcoin Crosses Key Resistance as Institutional Inflows Surge Past $2 Billion',
    description: 'Exchange-traded funds recorded another record week of positive net flow driven by institutional portfolio allocations.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
    publishedTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    site: 'CoinDesk',
  },
  {
    url: 'https://cointelegraph.com',
    title: 'Ethereum Layer-2 Network Activity Climbs to New All-Time Highs',
    description: 'Transaction volume across rollup ecosystems demonstrates explosive growth, lowering gas fees for decentralized finance.',
    imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=60',
    publishedTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    site: 'CoinTelegraph',
  },
  {
    url: 'https://decrypt.co',
    title: 'Solana Ecosystem Expands as Decentralized Exchange Volumes Rival Centralized Platforms',
    description: 'Low transaction latency and negligible slippage continue driving retail liquidity towards high-throughput blockchains.',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60',
    publishedTime: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    site: 'Decrypt',
  },
  {
    url: 'https://bloomberg.com',
    title: 'Global Regulators Provide Clarity on Staking and Digital Asset Custody Frameworks',
    description: 'New guidelines clarify compliance rules for financial institutions integrating crypto custody and yield services.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60',
    publishedTime: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    site: 'Bloomberg Crypto',
  },
];

export function getHistoricalData(symbol: string): HistoricalPrice[] {
  const normSymbol = symbol.toUpperCase().replace(/[^A-Z]/g, '');
  const quote = FALLBACK_CRYPTOS[normSymbol] || FALLBACK_CRYPTOS[`${normSymbol}USD`] || FALLBACK_CRYPTOS['BTCUSD'];
  const basePrice = quote.price;

  const result: HistoricalPrice[] = [];
  const now = new Date();

  let currentPrice = basePrice * 0.72; // Start from 100 days ago at ~72%
  for (let i = 100; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Pseudo-random walk with positive drift toward current price
    const progress = (100 - i) / 100;
    const targetPrice = basePrice * 0.72 + (basePrice * 0.28) * progress;
    const noise = (Math.sin(i * 0.45) * 0.04 + (Math.random() - 0.48) * 0.05) * basePrice;
    currentPrice = Math.max(basePrice * 0.2, targetPrice + noise);

    const high = currentPrice * (1 + Math.random() * 0.025);
    const low = currentPrice * (1 - Math.random() * 0.025);
    const open = low + Math.random() * (high - low);

    result.push({
      date: dateStr,
      close: Number(currentPrice.toFixed(2)),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      volume: Math.round(quote.volume ? quote.volume * (0.8 + Math.random() * 0.4) : 10000000),
    });
  }

  // Ensure the latest point equals the exact current price
  if (result.length > 0) {
    result[result.length - 1].close = quote.price;
  }

  return result;
}
