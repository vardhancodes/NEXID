import { NextResponse } from 'next/server';
import { getStockIndex } from '@/lib/stock-service'; // Import our new function

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET(request: Request) {
  if (!API_KEY) {
    return new NextResponse('API key is missing', { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search')?.toLowerCase();
    
    if (query) {
      // --- Powerful Search Logic ---
      const stockIndex = await getStockIndex();

      // Filter the master list in memory based on company name OR symbol
      const searchResults = stockIndex
        .filter(stock => 
          stock.name.toLowerCase().includes(query) || 
          stock.symbol.toLowerCase().startsWith(query)
        )
        .slice(0, 50); // Get the top 50 matches

      if (searchResults.length === 0) {
        return NextResponse.json([]);
      }

      // Fetch live quotes for only the top 50 matches
      const symbols = searchResults.map(stock => stock.symbol).join(',');
      const quoteRes = await fetch(`${FMP_API_URL}/quote/${symbols}?apikey=${API_KEY}`);
      const quoteData = await quoteRes.json();
      
      const formattedStocks = (Array.isArray(quoteData) ? quoteData : [quoteData])
        .filter(stock => stock && typeof stock.price === 'number')
        .map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changesPercentage,
        }));

      return NextResponse.json(formattedStocks);

    } else {
      // --- Default View Logic (when search bar is empty) ---
      const listType = searchParams.get('listType') || 'actives';
      const listRes = await fetch(`${FMP_API_URL}/stock_market/${listType}?limit=50&apikey=${API_KEY}`);
      const listData = await listRes.json();

      const formattedStocks = (Array.isArray(listData) ? listData : [])
        .filter(stock => stock && typeof stock.price === 'number')
        .map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changesPercentage,
        }));
      
      return NextResponse.json(formattedStocks);
    }
  } catch (error: any) {
    console.error("API Error:", error.message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
