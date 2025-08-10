import { NextRequest, NextResponse } from 'next/server';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  // 1. Get the stock symbol from the URL (e.g., "AAPL")
  const symbol = params.symbol;

  if (!API_KEY) {
    return NextResponse.json({ message: 'API key is missing' }, { status: 500 });
  }

  try {
    // 2. Fetch the latest 10 news articles for that specific symbol
    const url = `${FMP_API_URL}/stock_news?tickers=${symbol}&limit=10&apikey=${API_KEY}`;
    
    // Cache the result for 1 hour to avoid hitting the API limit too often
    const response = await fetch(url, { next: { revalidate: 3600 } }); 

    if (!response.ok) {
      throw new Error(`Failed to fetch news for ${symbol}. Status: ${response.status}`);
    }

    const data = await response.json();

    // 3. Return the news data
    return NextResponse.json(data);

  } catch (error: any) {
    console.error(`Error fetching news for ${symbol}:`, error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}