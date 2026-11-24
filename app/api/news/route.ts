import { NextResponse } from 'next/server';
import { FALLBACK_NEWS } from '@/lib/crypto-data';
import { parseStringPromise } from 'xml2js';

export async function GET() {
  const feeds = [
    { url: 'https://cointelegraph.com/rss', site: 'Cointelegraph' },
    { url: 'https://decrypt.co/feed', site: 'Decrypt' }
  ];

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, { next: { revalidate: 600 } });
      if (res.ok) {
        const xml = await res.text();
        const parsed = await parseStringPromise(xml);
        const items = parsed?.rss?.channel?.[0]?.item || [];
        if (Array.isArray(items) && items.length > 0) {
          const articles = items.slice(0, 20).map((item: any) => {
            const title = item.title?.[0] || 'Market Update';
            const link = item.link?.[0] || '#';
            const pubDate = item.pubDate?.[0] || new Date().toISOString();
            const desc = item.description?.[0] || '';
            const cleanDesc = desc.replace(/<[^>]*>?/gm, '').slice(0, 180);
            return {
              url: link,
              title,
              description: cleanDesc,
              imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=60',
              publishedTime: pubDate,
              site: feed.site
            };
          });
          return NextResponse.json(articles);
        }
      }
    } catch (e) {
      console.warn(`[News RSS Feed Error for ${feed.site}]:`, e);
    }
  }

  return NextResponse.json(FALLBACK_NEWS);
}
