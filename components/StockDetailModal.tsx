// components/StockDetailModal.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { X, ExternalLink, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { CryptoCardProps } from './CryptoCard';
import StockChart from './StockChart';

// --- Define data types ---
export type StockDetailModalProps = {
  stock: CryptoCardProps;
  onClose: () => void;
};

type MetricData = {
  marketCap?: number;
  volume?: number;
  pe?: number;
  eps?: number;
  sharesOutstanding?: number;
  priceAvg50?: number;
  priceAvg200?: number;
  yearHigh?: number;
  yearLow?: number;
  price?: number;
  change?: number;
  changesPercentage?: number;
};

type NewsArticle = {
  image?: string;
  imageUrl?: string;
  title: string;
  url: string;
  site?: string;
  publishedDate?: string;
  publishedTime?: string;
};

type TabName = 'chart' | 'metrics' | 'news';

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.96 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 24 } },
  exit: { y: 20, opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
} as const;

export default function StockDetailModal({ stock, onClose }: StockDetailModalProps) {
  const isPositive = (stock.change ?? 0) >= 0;
  const changeColorClass = isPositive ? 'text-emerald-400' : 'text-rose-400';

  const [activeTab, setActiveTab] = useState<TabName>('chart');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [metricData, setMetricData] = useState<MetricData | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  useEffect(() => {
    if (!stock.symbol) return;

    // Load Chart
    setIsLoadingChart(true);
    fetch(`/api/crypto/${stock.symbol}`)
      .then(res => (res.ok ? res.json() : []))
      .then(data => setChartData(Array.isArray(data) ? data : []))
      .catch(() => setChartData([]))
      .finally(() => setIsLoadingChart(false));

    // Load Metrics / Quote
    setIsLoadingMetrics(true);
    fetch(`/api/crypto/${stock.symbol}/quote`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => setMetricData(data))
      .catch(() => setMetricData(null))
      .finally(() => setIsLoadingMetrics(false));

    // Load News
    setIsLoadingNews(true);
    fetch(`/api/crypto/${stock.symbol}/news`)
      .then(res => (res.ok ? res.json() : []))
      .then(data => setNewsData(Array.isArray(data) ? data : []))
      .catch(() => setNewsData([]))
      .finally(() => setIsLoadingNews(false));
  }, [stock.symbol]);

  const formatPrice = (p?: number) => {
    if (typeof p !== 'number') return '0.00';
    if (p < 0.01) return p.toPrecision(4);
    return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chart':
        return isLoadingChart ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            Loading price chart...
          </div>
        ) : (
          <div className="w-full h-full pt-2">
            <StockChart data={chartData} />
          </div>
        );
      case 'metrics':
        return isLoadingMetrics ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            Loading metrics...
          </div>
        ) : (
          <CryptoMetrics data={metricData} currentPrice={stock.price} />
        );
      case 'news':
        return isLoadingNews ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            Loading news...
          </div>
        ) : (
          <NewsList articles={newsData} />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#0D1117] border border-border-color rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-hover-bg z-10"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="p-6 border-b border-border-color bg-hover-bg/30">
          <div className="flex items-start justify-between pr-10">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  CRYPTO
                </span>
                <h2 className="text-2xl font-bold text-white">{stock.symbol}</h2>
              </div>
              <p className="text-gray-400 text-sm mt-0.5">{stock.name || stock.symbol}</p>
            </div>
            <Link
              href={`/crypto/${stock.symbol}`}
              className="flex items-center space-x-1 text-xs text-primary hover:text-primary-hover transition-colors font-medium px-3 py-1.5 rounded-lg border border-primary/30 hover:bg-primary/10"
            >
              <span>Full View</span>
              <ExternalLink size={13} />
            </Link>
          </div>

          <div className="mt-4 flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold text-white">
              ${formatPrice(stock.price)}
            </span>
            <span className={`flex items-center text-sm font-semibold ${changeColorClass}`}>
              {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
              {isPositive ? '+' : ''}{(stock.change ?? 0).toFixed(2)} ({isPositive ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border-color px-6 bg-[#0D1117]">
          <TabButton name="chart" activeTab={activeTab} setActiveTab={setActiveTab}>
            Price Trend
          </TabButton>
          <TabButton name="metrics" activeTab={activeTab} setActiveTab={setActiveTab}>
            Key Metrics
          </TabButton>
          <TabButton name="news" activeTab={activeTab} setActiveTab={setActiveTab}>
            Recent News
          </TabButton>
        </div>

        {/* Tab Body */}
        <div className="p-6 h-80 flex items-center justify-center overflow-y-auto">
          {renderTabContent()}
        </div>
      </motion.div>
    </motion.div>
  );
}

const TabButton = ({
  name,
  activeTab,
  setActiveTab,
  children,
}: {
  name: TabName;
  activeTab: TabName;
  setActiveTab: (name: TabName) => void;
  children: React.ReactNode;
}) => {
  const isActive = activeTab === name;
  return (
    <button
      onClick={() => setActiveTab(name)}
      className={`py-3 px-4 font-medium text-xs tracking-wide uppercase transition-colors relative ${
        isActive ? 'text-primary font-bold' : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
      )}
    </button>
  );
};

const CryptoMetrics = ({ data, currentPrice }: { data: MetricData | null; currentPrice?: number }) => {
  if (!data) {
    return <p className="text-gray-400 text-sm">Key metrics unavailable for this asset.</p>;
  }

  const formatLarge = (num?: number) => {
    if (typeof num !== 'number' || isNaN(num) || num === 0) return 'N/A';
    if (num >= 1_000_000_000_000) return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
      <div className="bg-hover-bg/50 p-3 rounded-lg border border-border-color">
        <p className="text-xs text-gray-400">Market Cap</p>
        <p className="text-white font-semibold text-base mt-1">{formatLarge(data.marketCap)}</p>
      </div>
      <div className="bg-hover-bg/50 p-3 rounded-lg border border-border-color">
        <p className="text-xs text-gray-400">24h Volume</p>
        <p className="text-white font-semibold text-base mt-1">{formatLarge(data.volume)}</p>
      </div>
      <div className="bg-hover-bg/50 p-3 rounded-lg border border-border-color">
        <p className="text-xs text-gray-400">50-Day Avg</p>
        <p className="text-white font-semibold text-base mt-1">
          {data.priceAvg50 ? `$${data.priceAvg50.toFixed(2)}` : 'N/A'}
        </p>
      </div>
      <div className="bg-hover-bg/50 p-3 rounded-lg border border-border-color">
        <p className="text-xs text-gray-400">200-Day Avg</p>
        <p className="text-white font-semibold text-base mt-1">
          {data.priceAvg200 ? `$${data.priceAvg200.toFixed(2)}` : 'N/A'}
        </p>
      </div>
      <div className="bg-hover-bg/50 p-3 rounded-lg border border-border-color">
        <p className="text-xs text-gray-400">52-Week High</p>
        <p className="text-white font-semibold text-base mt-1">
          {data.yearHigh ? `$${data.yearHigh.toFixed(2)}` : 'N/A'}
        </p>
      </div>
      <div className="bg-hover-bg/50 p-3 rounded-lg border border-border-color">
        <p className="text-xs text-gray-400">52-Week Low</p>
        <p className="text-white font-semibold text-base mt-1">
          {data.yearLow ? `$${data.yearLow.toFixed(2)}` : 'N/A'}
        </p>
      </div>
    </div>
  );
};

const NewsList = ({ articles }: { articles: NewsArticle[] }) => {
  if (!Array.isArray(articles) || articles.length === 0) {
    return <p className="text-gray-400 text-sm">No recent news found for this asset.</p>;
  }

  return (
    <div className="w-full h-full overflow-y-auto pr-1">
      <ul className="space-y-3">
        {articles.slice(0, 6).map((article, index) => {
          const img = article.image || article.imageUrl;
          return (
            <li key={index} className="border-b border-border-color/60 pb-3 last:border-b-0 last:pb-0">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-3 group hover:opacity-90 transition-opacity"
              >
                {img && (
                  <img
                    src={img}
                    alt={article.title}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-800"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">{article.site || 'Crypto News'}</span>
                  </div>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
