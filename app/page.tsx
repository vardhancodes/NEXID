"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CryptoCard, { CryptoCardProps } from "@/components/CryptoCard";

export default function DashboardPage() {
  const [cryptos, setCryptos] = useState<CryptoCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Note: The detail modal is disabled for simplicity until it's refactored for crypto
  // const [selectedCrypto, setSelectedCrypto] = useState<CryptoCardProps | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/crypto');
        if (!response.ok) {
          throw new Error('Failed to fetch data from the server.');
        }
        const data = await response.json();

        // Format the data to match what our CryptoCard component expects
        const formattedData = data.map((crypto: any) => ({
          symbol: crypto.symbol,
          name: crypto.name,
          price: crypto.price,
          change: crypto.change,
          changePercent: crypto.changesPercentage,
        }));
        setCryptos(formattedData);
      } catch (err: any) {
        setError(err.message);
        setCryptos([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []); // Runs once when the component loads

  return (
    <motion.div>
      <h1 className="text-3xl font-bold text-white mb-6">Market Overview</h1>
      
      {isLoading && <p className="text-gray-400">Loading market data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cryptos.map((crypto) => (
            <CryptoCard
              key={crypto.symbol}
              {...crypto}
              onClick={() => alert(`Detail modal for ${crypto.name} is not yet implemented.`)}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}