import { NextRequest, NextResponse } from 'next/server';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  // Get the stock symbol (e.g., "AAPL") from the URL
  const symbol = params.symbol;

  if (!API_KEY) {
    return NextResponse.json({ message: 'API key is missing' }, { status: 500 });
  }

  try {
    // Fetch the latest 10 news articles for that specific symbol
    const url = `${FMP_API_URL}/stock_news?tickers=${symbol}&limit=10&apikey=${API_KEY}`;
    
    // Cache the result for 1 hour
    const response = await fetch(url, { next: { revalidate: 3600 } }); 

    if (!response.ok) {
      throw new Error(`Failed to fetch news for ${symbol}. Status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error(`Error fetching news for ${symbol}:`, error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}