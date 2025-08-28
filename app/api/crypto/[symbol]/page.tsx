// app/stock/[symbol]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import StockChart from '@/components/StockChart'; // We'll reuse our chart component

// --- Define data types ---
type QuoteData = {
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  marketCap: number;
  pe: number;
  eps: number;
};

type NewsArticle = {
  image: string;
  title: string;
  url: string;
  site: string;
  publishedDate: string;
};

export default function StockDetailPage() {
  const params = useParams();
  const symbol = params.symbol as string;

  // States for all our data
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [chartData, setChartData] = useState([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all data in parallel for better performance
        const [quoteRes, chartRes, newsRes] = await Promise.all([
          fetch(`/api/stocks/${symbol}/quote`),
          fetch(`/api/stocks/${symbol}`),
          fetch(`/api/stocks/${symbol}/news`)
        ]);

        if (!quoteRes.ok || !chartRes.ok || !newsRes.ok) {
          throw new Error('Failed to fetch all stock data.');
        }

        const quoteData = await quoteRes.json();
        const chartData = await chartRes.json();
        const newsData = await newsRes.json();

        setQuote(quoteData);
        setChartData(chartData);
        if (Array.isArray(newsData)) {
          setNews(newsData);
        } else {
          setNews([]); // Ensure news is always an array
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (isLoading) {
    return <div className="text-center text-xl text-gray-400 mt-20">Loading Stock Details for {symbol.toUpperCase()}...</div>;
  }

  if (error || !quote) {
    return <div className="text-center text-xl text-red-500 mt-20">Error: Could not load data for {symbol.toUpperCase()}.</div>;
  }
  
  const isPositive = quote.change >= 0;
  const changeColorClass = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-white">{quote.name} ({symbol.toUpperCase()})</h1>
          <div className="mt-2">
            <span className="text-3xl font-semibold text-white">${quote.price.toFixed(2)}</span>
            <span className={`ml-4 text-xl font-medium ${changeColorClass}`}>
              {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.changesPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-white mb-4">Price Chart (100 days)</h2>
        <div className="bg-hover-bg p-4 rounded-lg border border-border-color">
          <StockChart data={chartData} />
        </div>
      </div>

      {/* News Section */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4">Recent News</h2>
        <div className="space-y-4">
          {news.length > 0 ? (
            news.map((article, index) => (
              <a key={index} href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start space-x-4 group bg-hover-bg p-4 rounded-lg border border-border-color hover:border-primary transition-colors">
                <img src={article.image} alt={article.title} className="w-24 h-24 object-cover rounded-md" />
                <div className="flex-1">
                  <p className="font-semibold text-white group-hover:text-primary transition-colors">{article.title}</p>
                  <p className="text-sm text-gray-400 mt-1">{article.site}</p>
                </div>
              </a>
            ))
          ) : (
            <p className="text-gray-500">No recent news found for this stock.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}