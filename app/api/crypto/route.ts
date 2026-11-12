import { NextResponse } from 'next/server';
import { FALLBACK_CRYPTOS } from '@/lib/crypto-data';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET() {
  const defaultSymbols = ['BTCUSD', 'ETHUSD', 'SOLUSD', 'BNBUSD', 'XRPUSD', 'DOGEUSD'];

  // If API key is available, try fetching live data from FMP
  if (API_KEY) {
    try {
      const symbolsParam = defaultSymbols.join(',');
      const url = `${FMP_API_URL}/quote/${symbolsParam}?apikey=${API_KEY}`;
      const response = await fetch(url, { next: { revalidate: 60 } });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const safeData = data.filter(c => c && typeof c.price === 'number');
          if (safeData.length > 0) {
            return NextResponse.json(safeData);
          }
        }
      }
    } catch (error) {
      console.warn('FMP API unavailable, falling back to local dataset:', error);
    }
  }

  // Resilient fallback dataset
  const fallbackList = defaultSymbols.map(sym => {
    const item = FALLBACK_CRYPTOS[sym] || FALLBACK_CRYPTOS['BTCUSD'];
    return {
      symbol: item.symbol,
      name: item.name,
      price: item.price,
      change: item.change,
      changesPercentage: item.changesPercentage,
    };
  });

  return NextResponse.json(fallbackList);
}
