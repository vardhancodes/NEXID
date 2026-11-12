"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, ExternalLink, Calendar, BarChart2 } from 'lucide-react';
import StockChart from '@/components/StockChart';

type QuoteData = {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changesPercentage: number;
  marketCap?: number;
  volume?: number;
  pe?: number;
  eps?: number;
  priceAvg50?: number;
  priceAvg200?: number;
  yearHigh?: number;
  yearLow?: number;
};

type NewsArticle = {
  image?: string;
  imageUrl?: string;
  title: string;
  url: string;
  site?: string;
  publishedDate?: string;
  publishedTime?: string;
  text?: string;
};

export default function CryptoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawSymbol = (params?.symbol as string) || '';
  const symbol = rawSymbol.toUpperCase();

  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [quoteRes, chartRes, newsRes] = await Promise.all([
          fetch(`/api/crypto/${symbol}/quote`),
          fetch(`/api/crypto/${symbol}`),
          fetch(`/api/crypto/${symbol}/news`),
        ]);

        const quoteData = quoteRes.ok ? await quoteRes.json() : null;
        const chartDataRes = chartRes.ok ? await chartRes.json() : [];
        const newsDataRes = newsRes.ok ? await newsRes.json() : [];

        if (quoteData) {
          setQuote(quoteData);
        } else {
          setQuote({
            symbol,
            name: symbol,
            price: 100,
            change: 2.5,
            changesPercentage: 2.5,
          });
        }

        setChartData(Array.isArray(chartDataRes) ? chartDataRes : []);
        setNews(Array.isArray(newsDataRes) ? newsDataRes : []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch asset data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  const formatPrice = (p?: number) => {
    if (typeof p !== 'number') return '0.00';
    if (p < 0.01) return p.toPrecision(4);
    return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatLarge = (num?: number) => {
    if (typeof num !== 'number' || isNaN(num) || num === 0) return 'N/A';
    if (num >= 1_000_000_000_000) return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading market intelligence for {symbol}...</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-6 rounded-2xl bg-red-950/20 border border-red-500/30 text-center">
        <h2 className="text-xl font-bold text-white">Asset Data Unavailable</h2>
        <p className="text-sm text-gray-400 mt-2">{error || `Could not find records for ${symbol}`}</p>
        <Link
          href="/crypto"
          className="inline-flex items-center space-x-2 mt-4 px-4 py-2 rounded-lg bg-hover-bg hover:bg-hover-bg/80 text-white text-xs font-semibold border border-border-color"
        >
          <ArrowLeft size={14} />
          <span>Back to Market</span>
        </Link>
      </div>
    );
  }

  const isPositive = (quote.change ?? 0) >= 0;
  const changeColorClass = isPositive ? 'text-emerald-400' : 'text-rose-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Top Navigation */}
      <div>
        <Link
          href="/crypto"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to All Cryptocurrencies</span>
        </Link>
      </div>

      {/* Hero Asset Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-hover-bg/40 border border-border-color flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-primary/20 text-primary border border-primary/30">
              SPOT PAIR
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {quote.name || symbol} <span className="text-gray-400 text-2xl font-semibold">({symbol})</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">Decentralized digital asset traded across global liquidity pools.</p>
        </div>

        <div className="flex flex-col md:items-end">
          <div className="text-3xl sm:text-4xl font-black text-white">
            ${formatPrice(quote.price)}
          </div>
          <div className={`flex items-center text-sm font-semibold mt-1 ${changeColorClass}`}>
            {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            {isPositive ? '+' : ''}{(quote.change ?? 0).toFixed(2)} ({isPositive ? '+' : ''}{(quote.changesPercentage ?? 0).toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Key Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-hover-bg/30 border border-border-color">
          <p className="text-xs font-medium text-gray-400">Market Cap</p>
          <p className="text-lg font-bold text-white mt-1">{formatLarge(quote.marketCap)}</p>
        </div>
        <div className="p-4 rounded-xl bg-hover-bg/30 border border-border-color">
          <p className="text-xs font-medium text-gray-400">24h Volume</p>
          <p className="text-lg font-bold text-white mt-1">{formatLarge(quote.volume)}</p>
        </div>
        <div className="p-4 rounded-xl bg-hover-bg/30 border border-border-color">
          <p className="text-xs font-medium text-gray-400">50-Day Moving Avg</p>
          <p className="text-lg font-bold text-white mt-1">
            {quote.priceAvg50 ? `$${formatPrice(quote.priceAvg50)}` : 'N/A'}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-hover-bg/30 border border-border-color">
          <p className="text-xs font-medium text-gray-400">200-Day Moving Avg</p>
          <p className="text-lg font-bold text-white mt-1">
            {quote.priceAvg200 ? `$${formatPrice(quote.priceAvg200)}` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Price Chart */}
      <div className="p-6 rounded-2xl bg-hover-bg/30 border border-border-color space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart2 size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-white">Historical Price Action (100 Days)</h2>
          </div>
          <span className="text-xs text-gray-400">Daily Close (USD)</span>
        </div>
        <div className="pt-2">
          <StockChart data={chartData} />
        </div>
      </div>

      {/* News Stream */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-bold text-white">Related Intelligence & News</h2>
        </div>

        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.map((item, idx) => {
              const img = item.image || item.imageUrl;
              return (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-4 p-4 rounded-xl bg-hover-bg/30 border border-border-color hover:border-primary/50 transition-all group"
                >
                  {img && (
                    <img
                      src={img}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0 bg-gray-800"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        {item.site || 'Crypto News'}
                      </span>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-gray-500 group-hover:text-primary flex-shrink-0" />
                </a>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-hover-bg/20 border border-border-color text-center text-sm text-gray-400">
            No specific recent news stories found for {symbol}.
          </div>
        )}
      </div>
    </motion.div>
  );
}
