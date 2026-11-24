import { NextResponse } from 'next/server';
import { getHistoricalData } from '@/lib/crypto-data';

type Params = {
  symbol: string;
};

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  let symbol = params.symbol.toUpperCase();
  if (symbol.endsWith('USD') && !symbol.endsWith('USDT')) {
    symbol = `${symbol}T`;
  }
  if (!symbol.includes('USDT') && !symbol.includes('USD')) {
    symbol = `${symbol}USDT`;
  }

  // 1. Try Binance Vision / Binance Public Klines (Zero Key)
  const binanceHosts = ['https://data-api.binance.vision', 'https://api.binance.com'];
  for (const host of binanceHosts) {
    try {
      const url = `${host}/api/v3/klines?symbol=${symbol}&interval=1d&limit=100`;
      const response = await fetch(url, { next: { revalidate: 300 } });
      if (response.ok) {
        const klines = await response.json();
        if (Array.isArray(klines) && klines.length > 0) {
          const formatted = klines.map((k: any) => {
            const date = new Date(k[0]).toISOString().split('T')[0];
            return {
              date,
              open: parseFloat(k[1]),
              high: parseFloat(k[2]),
              low: parseFloat(k[3]),
              close: parseFloat(k[4]),
              volume: parseFloat(k[5]),
            };
          });
          return NextResponse.json(formatted);
        }
      }
    } catch (err) {
      console.warn(`[Binance Kline Error on ${host}]:`, err);
    }
  }

  // Fallback to local generator
  const historical = getHistoricalData(params.symbol);
  return NextResponse.json(historical);
}
