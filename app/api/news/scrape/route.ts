import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { parseStringPromise } from 'xml2js';
import * as cheerio from 'cheerio';

const NEWS_CACHE_KEY = 'news_articles';
// Example: Reuters Business News sitemap. You can change this URL.
const SITEMAP_URL = 'https://www.reuters.com/sitemap_news_us_business.xml';

// This function scrapes a single article URL for its content
async function scrapeArticle(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const html = await response.text();
    const $ = cheerio.load(html);

    // --- IMPORTANT ---
    // These selectors are specific to reuters.com. You will need to inspect
    // the HTML of your target website and adjust these to match.
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
    // 1. Fetch the sitemap
    const sitemapResponse = await fetch(SITEMAP_URL, { next: { revalidate: 3600 } }); // Re-fetch sitemap once per hour
    if (!sitemapResponse.ok) throw new Error('Failed to fetch sitemap');
    
    const sitemapXml = await sitemapResponse.text();
    const sitemapJson = await parseStringPromise(sitemapXml);

    // 2. Extract article URLs from the sitemap
    const urls = sitemapJson.urlset.url.slice(0, 30).map((u: any) => u.loc[0]); // Limit to 30 most recent articles to stay fast

    // 3. Scrape each article in parallel
    const scrapingPromises = urls.map(scrapeArticle);
    const articles = (await Promise.all(scrapingPromises)).filter(Boolean); // Filter out any failed scrapes (nulls)

    // 4. Save the clean data to our Vercel KV database
    if (articles.length > 0) {
      await kv.set(NEWS_CACHE_KEY, articles);
      return NextResponse.json({ status: 'ok', articles_scraped: articles.length });
    } else {
      return NextResponse.json({ status: 'no_new_articles', articles_scraped: 0 });
    }

  } catch (error: any) {
    console.error("Scraping job failed:", error.message);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
