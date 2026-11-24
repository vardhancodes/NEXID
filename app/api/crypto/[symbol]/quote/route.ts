import { NextResponse } from 'next/server';
import { FALLBACK_CRYPTOS } from '@/lib/crypto-data';

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

  const binanceHosts = ['https://data-api.binance.vision', 'https://api.binance.com'];
  for (const host of binanceHosts) {
    try {
      const url = `${host}/api/v3/ticker/24hr?symbol=${symbol}`;
      const response = await fetch(url, { next: { revalidate: 30 } });
      if (response.ok) {
        const item = await response.json();
        if (item && item.lastPrice) {
          return NextResponse.json({
            symbol: item.symbol,
            name: item.symbol.replace('USDT', ''),
            price: parseFloat(item.lastPrice),
            change: parseFloat(item.priceChange),
            changesPercentage: parseFloat(item.priceChangePercent),
            volume: parseFloat(item.quoteVolume),
            high24h: parseFloat(item.highPrice),
            low24h: parseFloat(item.lowPrice),
            marketCap: parseFloat(item.quoteVolume) * 20, // conservative estimate
            yearHigh: parseFloat(item.highPrice) * 1.25,
            yearLow: parseFloat(item.lowPrice) * 0.75,
            priceAvg50: parseFloat(item.weightedAvgPrice),
            priceAvg200: parseFloat(item.weightedAvgPrice) * 0.95,
          });
        }
      }
    } catch (err) {
      console.warn(`[Binance Quote Error on ${host}]:`, err);
    }
  }

  const clean = symbol.replace(/[^A-Z]/g, '');
  const quote = FALLBACK_CRYPTOS[clean] || FALLBACK_CRYPTOS['BTCUSD'];
  return NextResponse.json(quote);
}
