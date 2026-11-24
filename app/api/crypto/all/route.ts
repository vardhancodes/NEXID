import { NextResponse } from 'next/server';
import { FALLBACK_CRYPTOS } from '@/lib/crypto-data';

const BINANCE_HOSTS = ['https://data-api.binance.vision', 'https://api.binance.com'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('search')?.trim().toLowerCase();

  for (const host of BINANCE_HOSTS) {
    try {
      const res = await fetch(`${host}/api/v3/ticker/24hr`, { next: { revalidate: 60 } });
      if (res.ok) {
        const tickers = await res.json();
        if (Array.isArray(tickers) && tickers.length > 0) {
          const usdtPairs = tickers
            .filter(t => t.symbol.endsWith('USDT'))
            .map(t => ({
              symbol: t.symbol,
              name: t.symbol.replace('USDT', ''),
              price: parseFloat(t.lastPrice),
              change: parseFloat(t.priceChange),
              changePercent: parseFloat(t.priceChangePercent),
              volume: parseFloat(t.quoteVolume),
            }))
            .sort((a, b) => b.volume - a.volume);

          if (query) {
            const filtered = usdtPairs.filter(
              c => c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query)
            );
            return NextResponse.json(filtered.slice(0, 40));
          }

          return NextResponse.json(usdtPairs.slice(0, 40));
        }
      }
    } catch (err) {
      console.warn(`[Binance Vision All Error on ${host}]:`, err);
    }
  }

  // Fallback
  const allList = Object.values(FALLBACK_CRYPTOS).map(c => ({
    symbol: c.symbol,
    name: c.name,
    price: c.price,
    change: c.change,
    changePercent: c.changesPercentage,
  }));

  if (query) {
    return NextResponse.json(
      allList.filter(c => c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query))
    );
  }

  return NextResponse.json(allList);
}
