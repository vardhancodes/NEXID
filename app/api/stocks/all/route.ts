import { NextResponse } from 'next/server';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET(request: Request) {
  // 1. Check for the API key
  if (!API_KEY) {
    console.error("FMP_API_KEY is not set.");
    return NextResponse.json({ message: 'API key is missing' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search')?.trim().toLowerCase();

    // 2. If there's no search query, return an empty list.
    if (!query) {
      return NextResponse.json([]);
    }

    // 3. Use the single, reliable search endpoint to get data.
    const searchUrl = `${FMP_API_URL}/search?query=${query}&limit=50&exchange=NASDAQ,NYSE&apikey=${API_KEY}`;
    const response = await fetch(searchUrl);

    if (!response.ok) {
      console.error(`FMP API Error: Status ${response.status}`);
      return NextResponse.json({ message: 'Failed to fetch data from FMP.' }, { status: response.status });
    }

    const stocks = await response.json();

    // 4. Clean up the data and send it back.
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
