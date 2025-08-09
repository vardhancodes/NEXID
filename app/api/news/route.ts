import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { parseStringPromise } from 'xml2js';
import * as cheerio from 'cheerio';

const NEWS_CACHE_KEY = 'live_scraped_news';
const SITEMAP_URL = 'https://www.reuters.com/sitemap_news_us_business.xml';
const CACHE_TTL_SECONDS = 600; // Cache for 10 minutes to avoid re-scraping on every visit

async function scrapeArticle(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const html = await response.text();
    const $ = cheerio.load(html);

    // IMPORTANT: These selectors are specific to reuters.com.
    // You may need to change them for a different news source.
    const title = $('h1').first().text();
    const description = $('meta[name="description"]').attr('content');
    const imageUrl = $('meta[property="og:image"]').attr('content');
    const publishedTime = $('meta[property="article:published_time"]').attr('content');

    if (title && description && imageUrl) {
      return { url, title, description, imageUrl, publishedTime };
    }
    return null;
  } catch (error) {
    console.error(`Failed to scrape ${url}`, error);
    return null;
  }
}

export async function GET() {
  try {
    // 1. Check if we have recently scraped data in the cache to avoid being slow
    const cachedArticles = await kv.get<any[]>(NEWS_CACHE_KEY);
    if (cachedArticles) {
      return NextResponse.json(cachedArticles);
    }

    // 2. If no cache, fetch the sitemap
    const sitemapResponse = await fetch(SITEMAP_URL);
    if (!sitemapResponse.ok) throw new Error('Failed to fetch sitemap');
    
    const sitemapXml = await sitemapResponse.text();
    const sitemapJson = await parseStringPromise(sitemapXml);

    // 3. Get the 5 most recent article URLs
    // We only scrape a few to ensure the request is fast and doesn't time out.
    const urls = sitemapJson.urlset.url.slice(0, 5).map((u: any) => u.loc[0]);

    // 4. Scrape the 5 articles
    const scrapingPromises = urls.map(scrapeArticle);
    const articles = (await Promise.all(scrapingPromises)).filter(Boolean);

    // 5. Save the fresh articles to the cache for 10 minutes
    await kv.set(NEWS_CACHE_KEY, articles, { ex: CACHE_TTL_SECONDS });
    
    return NextResponse.json(articles);

  } catch (error: any) {
    console.error("News API Error:", error.message);
    return NextResponse.json({ message: "Failed to fetch news articles." }, { status: 500 });
  }
}
