"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import StockCard, { StockCardProps } from "@/components/StockCard";
import StockDetailModal from '@/components/StockDetailModal';

type ListType = 'actives' | 'gainers' | 'losers';

export default function AllStocksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [listType, setListType] = useState<ListType>('actives');
  const [stocks, setStocks] = useState<StockCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockCardProps | null>(null);

  // Use a timer to delay the search API call
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      setIsLoading(true);
      setError(null);
      
      const url = searchTerm 
        ? `/api/stocks/all?search=${searchTerm}`
        : `/api/stocks/all?listType=${listType}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Could not fetch stock data. Please try again later.');
        }
        const data = await response.json();
        setStocks(data);
      } catch (err: any) {
        setError(err.message);
        setStocks([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Clear the previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Set a new timeout to fetch data after 300ms of inactivity
    searchTimeout.current = setTimeout(() => {
      fetchStocks();
    }, 300);

    // Cleanup function to clear timeout on unmount
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm, listType]);

  return (
    <motion.div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Market Movers</h1>
        <p className="text-gray-400">Explore market trends or search for any stock by name or symbol.</p>
      </div>
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search all stocks (e.g., Apple, AAPL)..."
          className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-border-color bg-hover-bg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        />
      </div>
      {!searchTerm && (
        <div className="flex space-x-2 mb-8">
          <TabButton name="Most Active" list="actives" activeList={listType} setList={setListType} />
          <TabButton name="Top Gainers" list="gainers" activeList={listType} setList={setListType} />
          <TabButton name="Top Losers" list="losers" activeList={listType} setList={setListType} />
        </div>
      )}
      <div>
        {isLoading && <p className="text-center text-gray-400 mt-10">Loading...</p>}
        {error && <p className="text-center text-red-500 mt-10">{error}</p>}
        {!isLoading && !error && stocks.length > 0 && (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stocks.map(stock => (
              <StockCard key={stock.symbol} {...stock} onClick={() => setSelectedStock(stock)} />
            ))}
          </motion.div>
        )}
        {!isLoading && !error && stocks.length === 0 && searchTerm && (
           <div className="text-center py-20">
             <h3 className="text-xl font-semibold text-white">No Stocks Found for "{searchTerm}"</h3>
             <p className="text-gray-400 mt-2">Try adjusting your search term.</p>
           </div>
        )}
      </div>
      <AnimatePresence>
        {selectedStock && <StockDetailModal stock={selectedStock} onClose={() => setSelectedStock(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}

const TabButton = ({ name, list, activeList, setList }: { name: string; list: ListType; activeList: ListType; setList: (list: ListType) => void; }) => {
  const isActive = list === activeList;
  return (<button onClick={() => setList(list)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isActive ? 'bg-primary text-white' : 'bg-hover-bg text-gray-300 hover:bg-border-color'}`}>{name}</button>);
};
