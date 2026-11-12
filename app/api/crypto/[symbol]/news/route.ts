import { NextResponse } from 'next/server';
import { FALLBACK_NEWS } from '@/lib/crypto-data';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol;
  const apiKey = process.env.FMP_API_KEY;

  if (apiKey) {
    try {
      const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=10&apikey=${apiKey}`;
      const response = await fetch(url, { next: { revalidate: 3600 } });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return NextResponse.json(data);
        }
      }
    } catch (error) {
      console.warn(`FMP news error for ${symbol}, using fallback news:`, error);
    }
  }

  // Format fallback news with image and publishedDate properties
  const formatted = FALLBACK_NEWS.map(n => ({
    title: n.title,
    url: n.url,
    site: n.site,
    image: n.imageUrl,
    imageUrl: n.imageUrl,
    publishedDate: n.publishedTime,
    text: n.description,
  }));

  return NextResponse.json(formatted);
}
