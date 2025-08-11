import { NextResponse } from 'next/server';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET(request: Request) {
  if (!API_KEY) {
    return NextResponse.json({ message: 'API key is missing' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search')?.trim();
    
    let fetchUrl = '';
    let isSearch = false;

    if (query) {
      isSearch = true;
      // --- New, More Powerful Search Logic ---
      // 1. Find up to 5 potential matching companies for the search term.
      const searchResponse = await fetch(`${FMP_API_URL}/search?query=${query}&limit=5&exchange=NASDAQ,NYSE&apikey=${API_KEY}`);
      const searchData = await searchResponse.json();

      if (Array.isArray(searchData) && searchData.length > 0) {
        // 2. Extract all found symbols (e.g., 'MSFT,MU,GOOGL').
        const symbols = searchData.map((s: any) => s.symbol).join(',');
        // 3. Fetch a combined news feed for all those symbols.
        fetchUrl = `${FMP_API_URL}/stock_news?tickers=${symbols}&limit=40&apikey=${API_KEY}`;
      } else {
        // If no companies match the search, return an empty list immediately.
        return NextResponse.json([]);
      }
    } else {
      // --- Default View Logic (when search bar is empty) ---
      fetchUrl = `${FMP_API_URL}/fmp/articles?page=0&size=12&apikey=${API_KEY}`;
    }

    const response = await fetch(fetchUrl, { next: { revalidate: 1800 } }); // Cache for 30 minutes
    if (!response.ok) {
      throw new Error(`Failed to fetch news from FMP API. Status: ${response.status}`);
    }

    let articles = await response.json();
    
    // The general news is nested in a 'content' key, the stock news is not.
    if (!isSearch) {
      articles = articles.content || [];
    }

    // Format the data to a consistent structure for our frontend.
    const formattedArticles = (Array.isArray(articles) ? articles : [])
      .map((article: any) => ({
        url: article.link || article.url,
        title: article.title,
        description: article.text || article.description,
        imageUrl: article.image,
        publishedTime: article.date || article.publishedDate,
        site: article.site,
    }));
    
    // For search results, sort by date to ensure relevance
    if (isSearch) {
        formattedArticles.sort((a, b) => new Date(b.publishedTime).getTime() - new Date(a.publishedTime).getTime());
    }

    return NextResponse.json(formattedArticles);

  } catch (error: any) {
    console.error("News API Error:", error.message);
    return NextResponse.json({ message: "Failed to fetch news articles." }, { status: 500 });
  }
}
