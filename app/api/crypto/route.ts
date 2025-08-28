import { NextResponse } from 'next/server';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET() {
  // Ensure the API key is present
  if (!API_KEY) {
    console.error("FMP API key is missing from environment variables.");
    return NextResponse.json({ message: 'API key is missing' }, { status: 500 });
  }
  
  // A fixed list of major crypto symbols for the dashboard
  const symbols = 'BTCUSD,ETHUSD,BNBUSD,SOLUSD,XRPUSD,DOGEUSD';
  const url = `${FMP_API_URL}/quote/${symbols}?apikey=${API_KEY}`;

  try {
    // Fetch the data and cache it for 1 minute
    const response = await fetch(url, { next: { revalidate: 60 } });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`FMP API Error: Status ${response.status}`, errorBody);
      throw new Error('Failed to fetch crypto data from FMP API.');
    }

    const data = await response.json();
    
    // Safety check to filter out any incomplete data from the API response
    const safeData = Array.isArray(data) ? data.filter(crypto => crypto && typeof crypto.price === 'number') : [];
    
    return NextResponse.json(safeData);

  } catch (error: any) {
    console.error('Crypto Dashboard API Error:', error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}