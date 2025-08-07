import { NextResponse } from 'next/server';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

// This helper function formats the data consistently
const formatStockData = (stock: any) => ({
  symbol: stock.symbol,
  name: stock.name,
  price: stock.price,
  change: stock.change,
  changePercent: stock.changesPercentage,
});

export async function GET(request: Request) {
  if (!API_KEY) {
    return new NextResponse('API key is missing', { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search')?.toLowerCase();
    
    let stocks: any[] = [];

    if (query) {
      // --- Direct Live Search Logic ---
      // We directly search FMP by company name and get live quotes.
      const searchRes = await fetch(`${FMP_API_URL}/search-name?query=${query}&limit=50&exchange=NASDAQ,NYSE,AMEX&apikey=${API_KEY}`);
      
      if (!searchRes.ok) throw new Error('Search API failed');
      const searchData = await searchRes.json();

      if (searchData && searchData.length > 0) {
        const symbols = searchData.map((s: any) => s.symbol).join(',');
        const quoteRes = await fetch(`${FMP_API_URL}/quote/${symbols}?apikey=${API_KEY}`);
        if (!quoteRes.ok) throw new Error('Quote API failed');
        stocks = await quoteRes.json();
      }
    } else {
      // --- Default View Logic ---
      // Fetches a default list when the search bar is empty.
      const listType = searchParams.get('listType') || 'actives';
      const listRes = await fetch(`${FMP_API_URL}/stock_market/${listType}?limit=50&apikey=${API_KEY}`);
      if (!listRes.ok) throw new Error('List API failed');
      stocks = await listRes.json();
    }
    
    // Final safety filter remains to prevent any crashes
    const formattedStocks = (Array.isArray(stocks) ? stocks : [])
      .filter(stock => stock && typeof stock.price === 'number' && stock.symbol)
      .map(formatStockData);

    return NextResponse.json(formattedStocks);

  } catch (error: any) {
    console.error("
