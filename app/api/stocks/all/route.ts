import { NextResponse } from 'next/server';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET(request: Request) {
  if (!API_KEY) {
    console.error("FMP_API_KEY is not set in environment variables.");
    return NextResponse.json({ message: 'API key is missing' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search')?.trim().toLowerCase();
    
    let stocks: any[] = [];
    let fetchUrl = '';

    if (query) {
      // Use the powerful '/search' endpoint for company name AND symbol matching
      fetchUrl = `${FMP_API_URL}/search?query=${query}&limit=40&exchange=NASDAQ,NYSE,AMEX&apikey=${API_KEY}`;
    } else {
      // Fetch curated lists when the search bar is empty
      const listType = searchParams.get('listType') || 'actives';
      fetchUrl = `${FMP_API_URL}/stock_market/${listType}?limit=40&apikey=${API_KEY}`;
    }
    
    const response = await fetch(fetchUrl);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`FMP API Error: Status ${response.status}`, errorBody);
      throw new Error(`Failed to fetch data from FMP API. Status: ${response.status}`);
    }

    stocks = await response.json();

    const formattedStocks = (Array.isArray(stocks) ? stocks : [])
      .filter(stock => stock && typeof stock.price === 'number' && stock.symbol)
      .map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changesPercentage,
      }));

    return NextResponse.json(formattedStocks);

  } catch (error: any) {
    console.error("API Route Catch Error:", error.message);
    return NextResponse.json({ message: 'An error occurred on the server.' }, { status: 500 });
  }
}
