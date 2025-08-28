// app/api/stocks/[symbol]/quote/route.ts
import { NextResponse } from 'next/server';

type Params = {
  symbol: string;
};

export async function GET(request: Request, context: { params: Params }) {
  const symbol = context.params.symbol;
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'FMP API key not configured' }, { status: 500 });
  }
  
  const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 300 } }); // Cache for 5 minutes

    if (!response.ok) {
      throw new Error(`Failed to fetch quote data: ${response.statusText}`);
    }

    const data = await response.json();
    // The API returns an array, we just need the first element
    return NextResponse.json(data[0] || null);

  } catch (error) {
    console.error('FMP Quote API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch quote data.' }, { status: 500 });
  }
}