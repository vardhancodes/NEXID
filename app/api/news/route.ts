import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const NEWS_CACHE_KEY = 'news_articles';

export async function GET() {
  try {
    const articles = await kv.get(NEWS_CACHE_KEY);
    return NextResponse.json(articles || []);
  } catch (error) {
    console.error("Failed to fetch news from KV:", error);
    return NextResponse.json([], { status: 500 });
  }
}
