// app/api/stocks/[symbol]/news/route.ts
import { NextResponse } from 'next/server';

type Params = {
  symbol: string;
};

export async function GET(request: Request, context: { params: Params }) {
  const symbol = context.params.symbol;
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'FMP API key is not configured' },
      { status: 500 }
    );
  }
  
  const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=5&apikey=${apiKey}`;

  try {
    const response = await fetch(url, { 
      next: { 
        revalidate: 3600 
      } 
    }); 

    if (!response.ok) {
      throw new Error(`Failed to fetch news data: ${response.statusText}`);
    }

    const data = await response.json();

    // ** THIS IS THE IMPORTANT CHECK **
    // If the data from FMP is an array, we return it.
    // Otherwise (if it's an error object), we return an empty array.
    if (Array.isArray(data)) {
        return NextResponse.json(data);
    } else {
        return NextResponse.json([]);
    }

  } catch (error) {
    console.error('FMP News API Error:', error);
    return NextResponse.json(
        { error: 'Failed to fetch news data.' }, 
        { status: 500 }
    );
  }
}