import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { parseStringPromise } from 'xml2js';
import * as cheerio from 'cheerio';

const NEWS_CACHE_KEY = 'aggregated_news_articles';

export const dynamic = 'force-dynamic';

async function scrapeReutersArticle(url: string) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const imageUrl = $('meta[property="og:image"]').attr('content') || '';
    const publishedTime = $('meta[property="article:published_time"]').attr('content') || new Date().toISOString();

    if (title) {
      return { url, title, description, imageUrl, publishedTime, site: 'Reuters' };
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  let allArticles: any[] = [];

  try {
    const sitemapUrl = 'https://www.reuters.com/sitemap_news_us_business.xml';
    const sitemapResponse = await fetch(sitemapUrl, { signal: AbortSignal.timeout(5000) });
    if (sitemapResponse.ok) {
      const sitemapXml = await sitemapResponse.text();
      const sitemapJson = await parseStringPromise(sitemapXml);

      const urls = sitemapJson?.urlset?.url
        ? sitemapJson.urlset.url.slice(0, 10).map((u: any) => u.loc?.[0]).filter(Boolean)
        : [];

      if (urls.length > 0) {
        const scrapingPromises = urls.map(scrapeReutersArticle);
        const articles = (await Promise.all(scrapingPromises)).filter(Boolean);
        allArticles.push(...articles);
      }
    }
  } catch (e) {
    console.warn('Scraping sitemap warning:', e);
  }

  // Attempt to store in KV if KV credentials exist
  if (allArticles.length > 0 && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await kv.set(NEWS_CACHE_KEY, allArticles);
    } catch (err) {
      console.warn('KV caching skipped:', err);
    }
  }

  return NextResponse.json({
    status: allArticles.length > 0 ? 'ok' : 'no_new_articles',
    articles_scraped: allArticles.length,
  });
}
