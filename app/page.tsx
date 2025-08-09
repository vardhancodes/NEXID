// app/page.tsx
"use client"; 

import { useState, useEffect } from 'react'; // Import useState and useEffec
import { motion, AnimatePresence } from 'framer-motion';
import StockCard, { StockCardProps } from "@/components/StockCard";
import StockDetailModal from '@/components/StockDetailModal';

// Animation variants remain the same
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
  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockCardProps | null>(null);

  // New states for API data, loading, and errors
  const [stocks, setStocks] = useState<StockCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This hook fetches data when the component loads
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/stocks');
        if (!response.ok) {
          throw new Error('Failed to fetch data from the server.');
        }
        const data = await response.json();
        
        // Transform the API data into the format our StockCard component expects
        const formattedData = data.map((stock: any) => ({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changesPercentage, // Note the name difference
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
  }, []); // The empty array [] means this effect runs only once

  const handleCardClick = (stock: StockCardProps) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Show a loading message while fetching data
  if (isLoading) {
    return <div className="text-center text-xl text-gray-400 mt-20">Loading Market Data...</div>
  }

  // Show an error message if the fetch fails
  if (error) {
    return <div className="text-center text-xl text-red-500 mt-20">Error: {error}</div>
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <motion.h1 
        className="text-3xl font-bold text-white mb-6"
        variants={itemVariants}
      >
        Market Overview
      </motion.h1>
      
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
