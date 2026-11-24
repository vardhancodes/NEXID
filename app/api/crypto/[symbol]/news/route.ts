import { NextResponse } from 'next/server';
import { FALLBACK_NEWS } from '@/lib/crypto-data';
import { parseStringPromise } from 'xml2js';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol.replace(/USDT|USD/gi, '').toLowerCase();

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
          const matched = items
            .filter((item: any) => {
              const text = (item.title?.[0] || '') + ' ' + (item.description?.[0] || '');
              return text.toLowerCase().includes(symbol);
            })
            .slice(0, 10)
            .map((item: any) => ({
              title: item.title?.[0] || 'Market Update',
              url: item.link?.[0] || '#',
              site: feed.site,
              image: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=60',
              imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=60',
              publishedDate: item.pubDate?.[0] || new Date().toISOString(),
              text: (item.description?.[0] || '').replace(/<[^>]*>?/gm, '').slice(0, 180),
            }));

          if (matched.length > 0) {
            return NextResponse.json(matched);
          }
        }
      }
    } catch (e) {
      console.warn(`[News RSS Feed Error for ${symbol}]:`, e);
    }
  }

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
