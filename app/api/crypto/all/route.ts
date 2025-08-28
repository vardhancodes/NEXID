import { NextResponse } from 'next/server';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET(request: Request) {
  if (!API_KEY) {
    return NextResponse.json({ message: 'API key is missing' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search')?.trim().toLowerCase();
    
    let fetchUrl = '';

    if (query) {
      // Search logic remains the same: uses the reliable /search endpoint
      fetchUrl = `${FMP_API_URL}/search?query=${query}&limit=40&exchange=CRYPTO&apikey=${API_KEY}`;
    } else {
      // New Default Logic: Fetch a curated list of popular cryptos using the reliable /quote endpoint
      const defaultSymbols = 'BTCUSD,ETHUSD,BNBUSD,SOLUSD,XRPUSD,DOGEUSD,ADAUSD,AVAXUSD,SHIBUSD,DOTUSD,TRXUSD,LINKUSD,MATICUSD,LTCUSD,BCHUSD';
      fetchUrl = `${FMP_API_URL}/quote/${defaultSymbols}?apikey=${API_KEY}`;
    }
    
    const response = await fetch(fetchUrl, { next: { revalidate: 300 } }); // Cache for 5 minutes
    
    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData['Error Message'] || `FMP API failed with status: ${response.status}`;
        throw new Error(errorMessage);
    }
    
    const cryptos = await response.json();

    const formattedCryptos = (Array.isArray(cryptos) ? cryptos : [])
      .filter(crypto => crypto && typeof crypto.price === 'number' && crypto.symbol)
      .map(crypto => ({
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.price,
        change: crypto.change,
        changePercent: crypto.changesPercentage,
      }));

    return NextResponse.json(formattedCryptos);

  } catch (error: any) {
    console.error("All Crypto API Error:", error.message);
    // Pass the specific error message back to the frontend
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}