import { NextResponse } from 'next/server';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET(request: Request) {
  if (!API_KEY) {
    return NextResponse.json({ message: 'API key is missing' }, { status: 500 });
  }

  try {
    // Switched to the more modern and accessible '/fmp/articles' endpoint
    const url = `${FMP_API_URL}/fmp/articles?page=0&size=40&apikey=${API_KEY}`;
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData['Error Message'] || `FMP API failed with status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const articles = data.content || [];

    // Format the data to match what our frontend page expects
    const formattedArticles = (Array.isArray(articles) ? articles : []).map((article: any) => ({
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
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}