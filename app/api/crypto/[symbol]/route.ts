// app/api/stocks/[symbol]/route.ts
import { NextResponse } from 'next/server';

type Params = {
  symbol: string;
};

// The context parameter gives us access to the dynamic route segment (e.g., 'AAPL')
export async function GET(request: Request, context: { params: Params }) {
  const symbol = context.params.symbol;
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'FMP API key not configured' }, { status: 500 });
  }
  
  // FMP endpoint for daily historical prices (we'll get the last 100 days)
  const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?timeseries=100&apikey=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.statusText}`);
    }

    const data = await response.json();

    // The data we need is inside the 'historical' array
    return NextResponse.json(data.historical || []);

  } catch (error) {
    console.error('FMP Historical API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch historical data.' }, { status: 500 });
  }
}