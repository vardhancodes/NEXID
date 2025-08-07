import { NextResponse } from 'next/server';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET(request: Request) {
  if (!API_KEY) {
    return new NextResponse('API key is missing', { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search')?.toLowerCase();
    const listType = searchParams.get('listType') || 'actives';

    let stocks: any[] = [];

    if (query) {
      // This part handles the powerful COMPANY NAME search when you type.
      const searchRes = await fetch(`${FMP_API_URL}/search-name?query=${query}&limit=20&apikey=${API_KEY}`);
      const searchData = await searchRes.json();

      if (searchData && searchData.length > 0) {
        const symbols = searchData.map((stock: any) => stock.symbol).join(',');
        const quoteRes = await fetch(`${FMP_API_URL}/quote/${symbols}?apikey=${API_KEY}`);
        stocks = await quoteRes.json();
      }
    } else {
      // This part handles the DEFAULT list when the search bar is empty.
      // You can change "limit=50" to a higher number like "limit=200" if you want.
      const listRes = await fetch(`${FMP_API_URL}/stock_market/${listType}?limit=50&apikey=${API_KEY}`);
      stocks = await listRes.json();
    }
    
    // This safety filter ensures no bad data crashes your app.
    const formattedStocks = stocks
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
    console.error("FMP_API_ERROR:", error.message);
    return new NextResponse('Internal Server Error while fetching from FMP', { status: 500 });
  }
}
