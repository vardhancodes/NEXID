// app/api/stocks/all/route.ts
import { NextResponse } from 'next/server';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

type StockData = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
};

export async function GET(request: Request) {
  if (!API_KEY) {
    return new NextResponse('API key is missing', { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search')?.toLowerCase();

    let stocks: StockData[] = [];

    if (query) {
      const searchRes = await fetch(`${FMP_API_URL}/search-ticker?query=${query}&limit=20&apikey=${API_KEY}`);
      if (!searchRes.ok) throw new Error('Failed to search stocks');
      const searchData = await searchRes.json();
      
      if (searchData.length > 0) {
        const symbols = searchData.map((stock: any) => stock.symbol).join(',');
        const quoteRes = await fetch(`${FMP_API_URL}/quote/${symbols}?apikey=${API_KEY}`);
        if (!quoteRes.ok) throw new Error('Failed to fetch quotes for search results');
        stocks = await quoteRes.json();
      }
    } else {
      const activesRes = await fetch(`${FMP_API_URL}/stock_market/actives?limit=50&apikey=${API_KEY}`);
      if (!activesRes.ok) throw new Error('Failed to fetch active stocks');
      stocks = await activesRes.json();
    }
    
    // Ensure all returned data has the correct format for the frontend
    const formattedStocks = stocks.map((stock: any) => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      changesPercentage: stock.changesPercentage,
    }));

    return NextResponse.json(formattedStocks);

  } catch (error: any) {
    console.error("FMP_API_ERROR:", error.message);
    return new NextResponse('Internal Server Error while fetching from FMP', { status: 500 });
  }
}
