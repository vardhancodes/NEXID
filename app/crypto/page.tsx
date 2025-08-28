"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import CryptoCard, { CryptoCardProps } from "@/components/CryptoCard";
// Note: Your StockDetailModal would need to be adapted for crypto.
// For now, we will disable it to prevent errors.
// import StockDetailModal from "@/components/StockDetailModal"; 

export default function CryptoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cryptos, setCryptos] = useState<CryptoCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [selectedCrypto, setSelectedCrypto] = useState<CryptoCardProps | null>(null);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    searchTimeout.current = setTimeout(() => {
      const fetchCryptos = async () => {
        setIsLoading(true); 
        setError(null);
        try {
          const response = await fetch(`/api/crypto/all?search=${searchTerm.trim()}`);
          if (!response.ok) throw new Error('Could not fetch data. Please try again later.');
          const data = await response.json();
          setCryptos(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCryptos();
    }, 300);

  }, [searchTerm]);

  return (
    <motion.div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cryptocurrency Market</h1>
        <p className="text-gray-400">Explore the crypto market or search for a specific asset.</p>
      </div>
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search all cryptocurrencies (e.g., Bitcoin, ETH)..."
          className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-border-color bg-hover-bg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        />
      </div>
      <div>
        {isLoading && <p className="text-center text-gray-400 mt-10">Loading Cryptocurrencies...</p>}
        {error && <p className="text-center text-red-500 mt-10">{error}</p>}
        {!isLoading && !error && cryptos.length > 0 && (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cryptos.map(crypto => (
              <CryptoCard key={crypto.symbol} {...crypto} onClick={() => alert(`${crypto.name} modal not implemented yet.`)} />
            ))}
          </motion.div>
        )}
        {!isLoading && !error && cryptos.length === 0 && (
           <div className="text-center py-20">
             <h3 className="text-xl font-semibold text-white">No Results Found</h3>
             <p className="text-gray-400 mt-2">Try adjusting your search term.</p>
           </div>
        )}
      </div>
      {/*
      <AnimatePresence>
        {selectedCrypto && <StockDetailModal stock={selectedCrypto} onClose={() => setSelectedCrypto(null)} />}
      </AnimatePresence>
      */}
    </motion.div>
  );
}