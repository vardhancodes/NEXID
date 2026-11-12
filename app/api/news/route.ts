import { NextResponse } from 'next/server';
import { FALLBACK_NEWS } from '@/lib/crypto-data';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET() {
  if (API_KEY) {
    try {
      const url = `${FMP_API_URL}/fmp/articles?page=0&size=40&apikey=${API_KEY}`;
      const response = await fetch(url, { next: { revalidate: 3600 } });

      if (response.ok) {
        const data = await response.json();
        const articles = data.content || [];

        if (Array.isArray(articles) && articles.length > 0) {
          const formattedArticles = articles.map((article: any) => ({
            url: article.link || '#',
            title: article.title || 'Market Update',
            description: article.text || '',
            imageUrl: article.image || 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=60',
            publishedTime: article.date || new Date().toISOString(),
            site: article.site || 'Financial Modeling Prep',
          }));

          return NextResponse.json(formattedArticles);
        }
      }
    } catch (error: any) {
      console.warn("FMP News API Warning:", error.message);
    }
  }

  // Fallback high-quality curated crypto news
  return NextResponse.json(FALLBACK_NEWS);
}
