// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const apiKey = process.env.FMP_API_KEY;

  // --- LOG 1: Check if the API route is being hit ---
  console.log(`API Route Hit! Search Query: "${query}"`);

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  if (!apiKey) {
    console.error("FMP API Key is missing from .env.local");
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const url = `https://financialmodelingprep.com/api/v3/search?query=${query}&limit=5&exchange=NASDAQ,NYSE&apikey=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const data = await response.json();

    // --- LOG 2: See what data we get back from FMP ---
    console.log("Data received from FMP API:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch search results.' }, { status: 500 });
  }
}