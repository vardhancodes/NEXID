// app/stocks/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';
import StockCard, { StockCardProps } from "@/components/StockCard";
import StockDetailModal from '@/components/StockDetailModal';

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

export default function AllStocksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [stocks, setStocks] = useState<StockCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockCardProps | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/stocks/all?search=${debouncedSearchTerm}`);
        if (!response.ok) throw new Error('Network response was not ok.');
        
        const data = await response.json();
        setStocks(data);
      } catch (err: any) {
        setError(err.message);
        setStocks([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStocks();
  }, [debouncedSearchTerm]);

  const handleCardClick = (stock: StockCardProps) => setSelectedStock(stock);
  const handleCloseModal = () => setSelectedStock(null);

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div className="mb-8" variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white mb-2">Browse Stocks</h1>
        <p className="text-gray-400">Search for a specific stock or explore the complete market list.</p>
      </motion.div>

      <motion.div className="relative mb-8" variants={itemVariants}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or symbol (e.g., Microsoft or MSFT)"
          className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-border-color bg-hover-bg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        />
      </motion.div>

      {isLoading && <p className="text-center text-gray-400 mt-10">Loading stocks...</p>}
      {error && <p className="text-center text-red-500 mt-10">Error: Could not load data.</p>}
      {!isLoading && !error && (
        stocks.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
          >
            {stocks.map(stock => (
              <motion.div key={stock.symbol} variants={itemVariants}>
                <StockCard {...stock} onClick={() => handleCardClick(stock)} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-white">No Stocks Found</h3>
            <p className="text-gray-400 mt-2">Try adjusting your search term.</p>
          </div>
        )
      )}

      <AnimatePresence>
        {selectedStock && <StockDetailModal stock={selectedStock} onClose={handleCloseModal} />}
      </AnimatePresence>
    </motion.div>
  );
}
