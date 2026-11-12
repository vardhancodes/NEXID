"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import CryptoCard, { CryptoCardProps } from "@/components/CryptoCard";
import StockDetailModal from "@/components/StockDetailModal";

export default function CryptoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cryptos, setCryptos] = useState<CryptoCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCardProps | null>(null);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      const fetchCryptos = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/crypto/all?search=${encodeURIComponent(searchTerm.trim())}`);
          if (!response.ok) throw new Error('Could not fetch data. Please try again later.');
          const data = await response.json();
          setCryptos(Array.isArray(data) ? data : []);
        } catch (err: any) {
          setError(err.message);
          setCryptos([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCryptos();
    }, 250);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Cryptocurrency Market</h1>
          <p className="text-gray-400 text-sm mt-1">Explore all major cryptocurrency pairs, spot rates, and momentum.</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search all cryptocurrencies (e.g. Bitcoin, Solana, ETH, DOGE)..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-color bg-hover-bg/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-hover-bg"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid or Status */}
      <div>
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-36 rounded-xl bg-hover-bg/30 border border-border-color animate-pulse p-4 flex flex-col justify-between"
              >
                <div className="h-4 bg-gray-800 rounded w-1/3" />
                <div className="h-6 bg-gray-800 rounded w-1/2" />
                <div className="h-4 bg-gray-800 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-6 rounded-xl bg-red-950/30 border border-red-500/30 text-center">
            <p className="text-rose-400 font-semibold text-sm">Error: {error}</p>
          </div>
        )}

        {!isLoading && !error && cryptos.length > 0 && (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cryptos.map((crypto) => (
              <CryptoCard
                key={crypto.symbol}
                {...crypto}
                onClick={() => setSelectedCrypto(crypto)}
              />
            ))}
          </motion.div>
        )}

        {!isLoading && !error && cryptos.length === 0 && (
          <div className="text-center py-20 bg-hover-bg/20 rounded-2xl border border-border-color">
            <h3 className="text-lg font-semibold text-white">No Assets Found</h3>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria or keyword.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCrypto && (
          <StockDetailModal
            stock={selectedCrypto}
            onClose={() => setSelectedCrypto(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
