import { NextResponse } from 'next/server';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET() {
  if (!API_KEY) {
    console.error("FMP_API_KEY is not set.");
    return NextResponse.json({ message: 'API key is missing' }, { status: 500 });
  }

  try {
    // Fetching directly from the FMP general news/articles endpoint.
    const url = `${FMP_API_URL}/fmp/articles?page=0&size=40&apikey=${API_KEY}`;
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!response.ok) {
      throw new Error(`Failed to fetch news from FMP API. Status: ${response.status}`);
    }

    const data = await response.json();

    // The API response is nested under a "content" key
    const articles = data.content || [];

    // Format the data to match what our frontend page expects.
    const formattedArticles = articles.map((article: any) => ({
      url: article.link,
      title: article.title,
      description: article.text,
      imageUrl: article.image,
      publishedTime: article.date,
      site: article.site,
    }));
    
    return NextResponse.json(formattedArticles);

  } catch (error: any) {
    console.error("News API Error:", error.message);
    return NextResponse.json({ message: "Failed to fetch news articles." }, { status: 500 });
  }
}
