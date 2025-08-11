import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { parseStringPromise } from 'xml2js';
import * as cheerio from 'cheerio';

const NEWS_CACHE_KEY = 'aggregated_news_articles';
const CACHE_TTL_SECONDS = 3600; // Cache for 1 hour

// --- NEWS SOURCES CONFIGURATION ---
const sources = [
  {
    name: 'Reuters Business',
    sitemapUrl: 'https://www.reuters.com/sitemap_news_us_business.xml',
    scraper: scrapeReutersArticle,
  },
  // You can add more sources here with their own custom scraper functions
];

// --- CUSTOM SCRAPER FOR REUTERS ---
// ⚠️ You must customize this function if you change the news source
async function scrapeReutersArticle(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('h1').first().text();
    const description = $('meta[name="description"]').attr('content');
    const imageUrl = $('meta[property="og:image"]').attr('content');
    const publishedTime = $('meta[property="article:published_time"]').attr('content');

    if (title && description && imageUrl) {
      return { url, title, description, imageUrl, publishedTime };
    }
    return null;
  } catch (error) { return null; }
}


// --- MAIN "ALL-IN-ONE" API LOGIC ---
export async function GET() {
  try {
    // 1. Check the cache first. If we have fresh data, return it instantly.
    const cachedArticles = await kv.get<any[]>(NEWS_CACHE_KEY);
    if (cachedArticles) {
      return NextResponse.json(cachedArticles);
    }

    // 2. If cache is empty, run the scrape. This happens only once per hour.
    let allArticles = [];
    for (const source of sources) {
        const sitemapResponse = await fetch(source.sitemapUrl);
        const sitemapXml = await sitemapResponse.text();
        const sitemapJson = await parseStringPromise(sitemapXml);
        
        // Scrape the top 20 most recent articles from the sitemap
        const urls = sitemapJson.urlset.url.slice(0, 20).map((u: any) => u.loc[0]);
        const scrapingPromises = urls.map(source.scraper);
        const articles = (await Promise.all(scrapingPromises)).filter(Boolean);
        allArticles.push(...articles);
    }

    // 3. Save the newly scraped articles to the cache for the next hour.
    if (allArticles.length > 0) {
      await kv.set(NEWS_CACHE_KEY, allArticles, { ex: CACHE_TTL_SECONDS });
    }
    
    return NextResponse.json(allArticles);

  } catch (error: any) {
    console.error("News API Error:", error.message);
    return NextResponse.json({ message: "Failed to fetch news articles." }, { status: 500 });
  }
}
