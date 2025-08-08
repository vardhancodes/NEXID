"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import StockCard, { StockCardProps } from "@/components/StockCard";
import StockDetailModal from "@/components/StockDetailModal";

export default function AllStocksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stocks, setStocks] = useState<StockCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockCardProps | null>(null);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. If the search box is empty, do nothing.
    if (!searchTerm.trim()) {
      setStocks([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 2. Wait for 300ms after the user stops typing.
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        // 3. Call our simple backend API to get search results.
        const response = await fetch(`/api/stocks/all?search=${searchTerm}`);
        if (!response.ok) {
          throw new Error('Could not fetch stock data. The server may be having issues.');
        }
        const data = await response.json();
        setStocks(data);
      } catch (err: any) {
        setError(err.message);
        setStocks([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchTerm]);

  return (
    <motion.div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Search Stocks</h1>
        <p className="text-gray-400">Search for any stock by its company name or ticker symbol.</p>
      </div>
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search (e.g., Apple, AAPL)..."
          className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-border-color bg-hover-bg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        />
      </div>
      <div>
        {isLoading && <p className="text-center text-gray-400 mt-10">Searching...</p>}
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
             <h3 className="text-xl font-semibold text-white">No results for "{searchTerm}"</h3>
             <p className="text-gray-400 mt-2">Try a different search term.</p>
           </div>
        )}
      </div>
      <AnimatePresence>
        {selectedStock && <StockDetailModal stock={selectedStock} onClose={() => setSelectedStock(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}
