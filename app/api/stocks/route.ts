// app/api/stocks/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // A list of popular stocks we want to display
  const symbols = 'AAPL,GOOGL,TSLA,AMZN,MSFT,NVDA,META,JPM';
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'FMP API key is not configured' },
      { status: 500 }
    );
  }

  const url = `https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=${apiKey}`;

  try {
    const response = await fetch(url, {
        // This Next.js feature caches the data and re-fetches it at most once every 60 seconds.
        next: {
            revalidate: 60 
        }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stock data: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('FMP API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data from FMP API.' },
      { status: 500 }
    );
  }
}