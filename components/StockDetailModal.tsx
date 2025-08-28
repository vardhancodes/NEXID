// components/StockDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { StockCardProps } from './CryptoCard';
import StockChart from './StockChart';

// --- Define data types ---
type StockDetailModalProps = {
  stock: StockCardProps;
  onClose: () => void;
};

type RatioData = {
  marketCap: number;
  pe: number;
  eps: number;
  sharesOutstanding: number;
  priceAvg50: number;
  priceAvg200: number;
};

type NewsArticle = {
  image: string;
  title: string;
  url: string;
  site: string;
  publishedDate: string;
};

type TabName = 'chart' | 'ratios' | 'news';

// --- Animation Variants ---
const backdropVariants = { visible: { opacity: 1 }, hidden: { opacity: 0 }};
const modalVariants = {
  hidden: { y: "50px", opacity: 0, scale: 0.95 },
  visible: { y: "0", opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
  exit: { y: "50px", opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
} as const;


const StockDetailModal = ({ stock, onClose }: StockDetailModalProps) => {
  const isPositive = stock.change >= 0;
  const changeColorClass = isPositive ? 'text-green-500' : 'text-red-500';

  const [activeTab, setActiveTab] = useState<TabName>('chart');

  // States for all data sources
  const [chartData, setChartData] = useState([]);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [ratiosData, setRatiosData] = useState<RatioData | null>(null);
  const [isLoadingRatios, setIsLoadingRatios] = useState(true);
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  useEffect(() => {
    if (!stock.symbol) return;
    setIsLoadingChart(true);
    fetch(`/api/stocks/${stock.symbol}`).then(res => res.json()).then(data => setChartData(data)).finally(() => setIsLoadingChart(false));
    setIsLoadingRatios(true);
    fetch(`/api/stocks/${stock.symbol}/quote`).then(res => res.json()).then(data => setRatiosData(data)).finally(() => setIsLoadingRatios(false));
    setIsLoadingNews(true);
    fetch(`/api/stocks/${stock.symbol}/news`)
      .then(res => res.json())
      // ** SAFETY CHECK 1: Only set state if the data is an array **
      .then(data => {
        if (Array.isArray(data)) {
          setNewsData(data);
        } else {
          // If not an array, set it to an empty array to prevent errors
          setNewsData([]); 
        }
      })
      .finally(() => setIsLoadingNews(false));
  }, [stock.symbol]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chart':
        return isLoadingChart ? <p className="text-gray-500">Loading chart...</p> : <StockChart data={chartData} />;
      case 'ratios':
        return isLoadingRatios ? <p className="text-gray-500">Loading ratios...</p> : <KeyRatios data={ratiosData} />;
      case 'news':
        return isLoadingNews ? <p className="text-gray-500">Loading news...</p> : <NewsList articles={newsData} />;
      default:
        return null;
    }
  };

  return (
    <motion.div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" variants={backdropVariants} initial="hidden" animate="visible" exit="hidden">
      <motion.div onClick={(e) => e.stopPropagation()} className="relative bg-background border border-border-color rounded-xl shadow-lg w-full max-w-2xl m-4 flex flex-col" variants={modalVariants} initial="hidden" animate="visible" exit="exit">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"><X size={24} /></button>
        <div className="p-6 border-b border-border-color">
          <h2 className="text-2xl font-bold text-white">{stock.symbol}</h2>
          <p className="text-gray-400">{stock.name}</p>
          <div className="mt-4">
            <span className="text-4xl font-bold text-white">${stock.price.toFixed(2)}</span>
            <span className={`ml-4 text-xl font-medium ${changeColorClass}`}>{isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
        
        <div className="flex border-b border-border-color">
          <TabButton name="chart" activeTab={activeTab} setActiveTab={setActiveTab}>Chart</TabButton>
          <TabButton name="ratios" activeTab={activeTab} setActiveTab={setActiveTab}>Key Ratios</TabButton>
          <TabButton name="news" activeTab={activeTab} setActiveTab={setActiveTab}>News</TabButton>
        </div>

        <div className="p-6 h-72 flex items-center justify-center overflow-y-auto">{renderTabContent()}</div>
      </motion.div>
    </motion.div>
  );
};

// --- Helper Components ---

const TabButton = ({ name, activeTab, setActiveTab, children }: { name: TabName; activeTab: TabName; setActiveTab: (name: TabName) => void; children: React.ReactNode; }) => {
  const isActive = activeTab === name;
  return (
    <button onClick={() => setActiveTab(name)} className={`py-3 px-6 font-medium text-sm transition-colors ${isActive ? 'text-white border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}>
      {children}
    </button>
  );
};

const KeyRatios = ({ data }: { data: RatioData | null }) => {
  if (!data) return <p className="text-red-500">Could not load ratio data.</p>;

  const formatNumber = (num: number) => {
    if (!num) return 'N/A';
    if (num > 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(2)}T`;
    if (num > 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num > 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    return num.toFixed(2);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 w-full text-sm">
      <RatioItem label="Market Cap" value={formatNumber(data.marketCap)} />
      <RatioItem label="P/E Ratio" value={data.pe?.toFixed(2)} />
      <RatioItem label="EPS" value={data.eps?.toFixed(2)} />
      <RatioItem label="Shares Outstanding" value={formatNumber(data.sharesOutstanding)} />
      <RatioItem label="50-Day Avg" value={`$${data.priceAvg50?.toFixed(2)}`} />
      <RatioItem label="200-Day Avg" value={`$${data.priceAvg200?.toFixed(2)}`} />
    </div>
  );
};

const RatioItem = ({ label, value }: { label: string; value: string | undefined }) => (
  <div>
    <p className="text-gray-400">{label}</p>
    <p className="text-white font-semibold text-base">{value || 'N/A'}</p>
  </div>
);

const NewsList = ({ articles }: { articles: NewsArticle[] }) => {
  // ** SAFETY CHECK 2: Double-check if articles is an array before mapping **
  if (!Array.isArray(articles) || articles.length === 0) {
    return <p className="text-gray-500">No recent news found for this stock.</p>;
  }

  return (
    <div className="w-full h-full">
      <ul className="space-y-4">
        {articles.map((article, index) => (
          <li key={index} className="border-b border-border-color pb-4 last:border-b-0 last:pb-0">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start space-x-4 group">
              <img src={article.image} alt={article.title} className="w-20 h-20 object-cover rounded-md" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{article.title}</p>
                <p className="text-xs text-gray-400 mt-1">{article.site}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StockDetailModal;