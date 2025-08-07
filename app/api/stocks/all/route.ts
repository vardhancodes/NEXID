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

    if (query) {
      // --- Direct, Powerful Search Logic ---
      // This single API call searches by name AND symbol and includes price data.
      // It's limited to 50 results and major exchanges for relevance.
      const searchUrl = `${FMP_API_URL}/search?query=${query}&limit=50&exchange=NASDAQ,NYSE&apikey=${API_KEY}`;
      const searchRes = await fetch(searchUrl);

      if (!searchRes.ok) {
        throw new Error(`Search API failed. Status: ${searchRes.status}`);
      }
      stocks = await searchRes.json();

    } else {
      // --- Default View Logic (when search bar is empty) ---
      const listType = searchParams.get('listType') || 'actives';
      const listUrl = `${FMP_API_URL}/stock_market/${listType}?limit=50&apikey=${API_KEY}`;
      const listRes = await fetch(listUrl);
      if (!listRes.ok) {
        throw new Error(`List API failed. Status: ${listRes.status}`);
      }
      stocks = await listRes.json();
    }
    
    // Safety filter to remove incomplete data and format the response
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
    console.error("API Route Error:", error.message);
    return NextResponse.json({ message: 'An error occurred on the server.' }, { status: 500 });
  }
}
