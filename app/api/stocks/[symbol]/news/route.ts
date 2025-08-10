// app/api/stocks/[symbol]/news/route.ts

import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    symbol: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { symbol } = params; // Extract symbol from params

  // Your logic to fetch news for the given stock symbol would go here.
  // For this example, we'll just return the symbol.
  const newsData = {
    symbol: symbol,
    articles: [
      { title: `News about ${symbol}`, url: '#' },
      { title: `More news about ${symbol}`, url: '#' },
    ],
  };

  return NextResponse.json(newsData);
}