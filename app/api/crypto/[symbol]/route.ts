import { NextResponse } from 'next/server';
import { getHistoricalData } from '@/lib/crypto-data';

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
      const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?timeseries=100&apikey=${apiKey}`;
      const response = await fetch(url, { next: { revalidate: 3600 } });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.historical) && data.historical.length > 0) {
          return NextResponse.json(data.historical);
        }
      }
    } catch (error) {
      console.warn(`FMP Historical API error for ${symbol}, using generated trend data:`, error);
    }
  }

  // Resilient historical data fallback
  const historical = getHistoricalData(symbol);
  return NextResponse.json(historical);
}
