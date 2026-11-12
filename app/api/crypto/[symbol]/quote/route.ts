import { NextResponse } from 'next/server';
import { FALLBACK_CRYPTOS } from '@/lib/crypto-data';

type Params = {
  symbol: string;
};

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  const symbol = params.symbol;
  const apiKey = process.env.FMP_API_KEY;

  if (apiKey) {
    try {
      const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
      const response = await fetch(url, { next: { revalidate: 300 } });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data[0]) {
          return NextResponse.json(data[0]);
        }
      }
    } catch (error) {
      console.warn(`FMP Quote API error for ${symbol}, using fallback:`, error);
    }
  }

  const clean = symbol.toUpperCase().replace(/[^A-Z]/g, '');
  const quote = FALLBACK_CRYPTOS[clean] || FALLBACK_CRYPTOS[`${clean}USD`] || {
    symbol: symbol.toUpperCase(),
    name: symbol.toUpperCase(),
    price: 100.0,
    change: 2.5,
    changesPercentage: 2.5,
    marketCap: 1000000000,
    priceAvg50: 95.0,
    priceAvg200: 90.0,
  };

  return NextResponse.json(quote);
}
