import { NextResponse } from 'next/server';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET(request: Request) {
  // Check for the API key first
  if (!API_KEY) {
    console.error("FMP_API_KEY is not set in environment variables.");
    return NextResponse.json({ message: 'API key is missing' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search')?.trim().toLowerCase();
    
    let stocks: any[] = [];

    // Only perform a search if the query is not empty
    if (query) {
      // Use the 'search-name' endpoint for better company name matching
      const searchUrl = `${FMP_API_URL}/search-name?query=${query}&limit=50&exchange=NASDAQ,NYSE,AMEX&apikey=${API_KEY}`;
      const searchRes = await fetch(searchUrl);

      if (!searchRes.ok) throw new Error(`Search API failed with status: ${searchRes.status}`);
      const searchData = await searchRes.json();

      // If search returns results, get their live price quotes
      if (Array.isArray(searchData) && searchData.length > 0) {
        const symbols = searchData.map((s: any) => s.symbol).join(',');
        const quoteUrl = `${FMP_API_URL}/quote/${symbols}?apikey=${API_KEY}`;
        const quoteRes = await fetch(quoteUrl);
        if (!quoteRes.ok) throw new Error(`Quote API failed with status: ${quoteRes.status}`);
        stocks = await quoteRes.json();
      }
    } else {
      // If no search query, fetch a default list of active stocks
      const listType = searchParams.get('listType') || 'actives';
      const listUrl = `${FMP_API_URL}/stock_market/${listType}?limit=50&apikey=${API_KEY}`;
      const listRes = await fetch(listUrl);
      if (!listRes.ok) throw new Error(`List API failed with status: ${listRes.status}`);
      stocks = await listRes.json();
    }
    
    // Final safety filter to remove any bad data before sending to the client
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
