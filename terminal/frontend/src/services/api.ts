const API_BASE = 'http://localhost:8000/api';

export interface StockQuote {
  symbol: string;
  full_symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  prevClose: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  currency: string;
  pe?: number;
  forwardPE?: number;
  pb?: number;
  ath: number;
  athDistance: number;
  sector: string;
  industry: string;
  freshness: string;
}

export interface PricePoint {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20?: number;
  ma50?: number;
  ma200?: number;
}

export const fetchQuote = async (ticker: string, market = 'NSE'): Promise<StockQuote> => {
  const res = await fetch(`${API_BASE}/stock/quote?ticker=${ticker}&market=${market}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data;
};

export const fetchPriceHistory = async (ticker: string, timeframe = '1Y', market = 'NSE'): Promise<PricePoint[]> => {
  const res = await fetch(`${API_BASE}/stock/history?ticker=${ticker}&timeframe=${timeframe}&market=${market}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data || [];
};

export const fetchFinancialStatements = async (ticker: string, market = 'NSE', freq = 'annual') => {
  const res = await fetch(`${API_BASE}/financials/statements?ticker=${ticker}&market=${market}&freq=${freq}`);
  const json = await res.json();
  return json.data;
};

export const fetchFinancialRatios = async (ticker: string, market = 'NSE') => {
  const res = await fetch(`${API_BASE}/financials/ratios?ticker=${ticker}&market=${market}`);
  const json = await res.json();
  return json.data;
};

export const fetchQuantStats = async (ticker: string, market = 'NSE') => {
  const res = await fetch(`${API_BASE}/stats/quant?ticker=${ticker}&market=${market}`);
  const json = await res.json();
  return json.data;
};

export const fetchCorrelationMatrix = async (tickers: string[], market = 'NSE', windowDays = 30) => {
  const res = await fetch(`${API_BASE}/stats/correlation?tickers=${tickers.join(',')}&market=${market}&window_days=${windowDays}`);
  const json = await res.json();
  return json.data;
};

export const runEverydayCalculator = async (type: string, params: any) => {
  const res = await fetch(`${API_BASE}/stats/calculator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, params }),
  });
  return res.json();
};

export const fetchLiveBoardMacro = async () => {
  const res = await fetch(`${API_BASE}/liveboard/macro`);
  const json = await res.json();
  return json.data || [];
};

export const fetchMarketMood = async () => {
  const res = await fetch(`${API_BASE}/liveboard/mood`);
  const json = await res.json();
  return json.data;
};

export const fetchTreemapAndMovers = async () => {
  const res = await fetch(`${API_BASE}/liveboard/treemap-movers`);
  const json = await res.json();
  return json.data;
};

export const runMLExperiment = async (payload: any) => {
  const res = await fetch(`${API_BASE}/ml/experiment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const fetchLiveNews = async (feedType?: string, keyword?: string) => {
  const params = new URLSearchParams();
  if (feedType) params.append('feed_type', feedType);
  if (keyword) params.append('keyword', keyword);
  const res = await fetch(`${API_BASE}/news/live?${params.toString()}`);
  const json = await res.json();
  return json.data || [];
};

export const fetchNewsChain = async (ticker: string, market = 'NSE') => {
  const res = await fetch(`${API_BASE}/news/chain?ticker=${ticker}&market=${market}`);
  const json = await res.json();
  return json;
};

export const fetchCryptoSpot = async () => {
  const res = await fetch(`${API_BASE}/crypto/spot`);
  const json = await res.json();
  return json.data || [];
};
