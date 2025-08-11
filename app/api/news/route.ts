import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { parseStringPromise } from 'xml2js';
import * as cheerio from 'cheerio';

const NEWS_CACHE_KEY = 'aggregated_news_articles';

// --- NEWS SOURCES CONFIGURATION ---
// Add any website you want to scrape here, but you MUST provide a custom scraper for each.
const sources = [
  {
    name: 'Reuters Business',
    sitemapUrl: 'https://www.reuters.com/sitemap_news_us_business.xml',
    scraper: scrapeReutersArticle,
  },
  // Add another source example. NOTE: This will need custom selectors.
  // {
  //   name: 'Moneycontrol',
  //   sitemapUrl: 'https://www.moneycontrol.com/news_sitemap_index.xml', // Example URL
  //   scraper: scrapeMoneycontrolArticle,
  // }
];

// --- CUSTOM SCRAPER FUNCTIONS ---
// Each website has a different HTML structure, so each needs its own function.

async function scrapeReutersArticle(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const html = await response.text();
    const $ = cheerio.load(html);

    // Selectors specific to reuters.com
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

// Example for another site - this is a template and WILL NOT WORK without correct selectors
async function scrapeMoneycontrolArticle(url: string) {
  // ⚠️ YOU MUST CUSTOMIZE THESE SELECTORS FOR EACH NEW WEBSITE
  // To do this: visit an article on the site, right-click -> "Inspect", and find the correct HTML tags.
  // This is just a placeholder to show the concept.
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('.article_title_h1').text(); // Example selector
    const description = $('.article_desc').text(); // Example selector
    const imageUrl = $('.article_image img').attr('src'); // Example selector
    const publishedTime = $('.article_pub_date').text(); // Example selector

    if (title && description && imageUrl) {
      return { url, title, description, imageUrl, publishedTime };
    }
    return null;
  } catch (error) { return null; }
}


// --- MAIN SCRAPING JOB ---
export async function GET() {
  console.log('Starting hourly news scraping job...');
  let allArticles = [];

  for (const source of sources) {
    try {
      console.log(`Fetching sitemap for ${source.name}...`);
      const sitemapResponse = await fetch(source.sitemapUrl);
      const sitemapXml = await sitemapResponse.text();
      const sitemapJson = await parseStringPromise(sitemapXml);

      // Limit to the 20 most recent articles from each source
      const urls = sitemapJson.urlset.url.slice(0, 20).map((u: any) => u.loc[0]);
      
      const scrapingPromises = urls.map(source.scraper);
      const articles = (await Promise.all(scrapingPromises)).filter(Boolean);
      allArticles.push(...articles);
      console.log(`Scraped ${articles.length} articles from ${source.name}.`);
    } catch (e) {
      console.error(`Failed to process source ${source.name}`, e);
    }
  }

  if (allArticles.length > 0) {
    await kv.set(NEWS_CACHE_KEY, allArticles);
    console.log(`Scraping job finished. Total articles saved: ${allArticles.length}`);
    return NextResponse.json({ status: 'ok', articles_scraped: allArticles.length });
  } else {
    console.log('Scraping job finished. No new articles found.');
    return NextResponse.json({ status: 'no_new_articles', articles_scraped: 0 });
  }
}
