// app/page.tsx
"use client"; 

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StockCard, { StockCardProps } from "@/components/StockCard";
import StockDetailModal from '@/components/StockDetailModal';
import SearchController from '@/components/SearchController'; // Import the search component

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockCardProps | null>(null);
  const [stocks, setStocks] = useState<StockCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/stocks');
        if (!response.ok) {
          throw new Error('Failed to fetch data from the server.');
        }
        const data = await response.json();
        
        const formattedData = data.map((stock: any) => ({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changesPercentage,
        }));

        setStocks(formattedData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setStocks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, []);

  const handleCardClick = (stock: StockCardProps) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading) {
    return <div className="text-center text-xl text-gray-400 mt-20">Loading Market Data...</div>
  }

  if (error) {
    return <div className="text-center text-xl text-red-500 mt-20">Error: {error}</div>
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      {/* Search Section */}
      <motion.div variants={itemVariants} className="mb-10">
        <h1 className="text-3xl font-bold text-white">Market Movers</h1>
        <p className="text-gray-400 mt-1">Explore market trends or search for any stock.</p>
        <div className="mt-6">
          <SearchController />
        </div>
      </motion.div>
      
      {/* Tabs and Stock Cards can go here */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {stocks.map((stock) => (
          <motion.div key={stock.symbol} variants={itemVariants}>
            <StockCard
              {...stock}
              onClick={() => handleCardClick(stock)}
            />
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && selectedStock && (
          <StockDetailModal stock={selectedStock} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}