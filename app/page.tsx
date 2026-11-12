"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Activity, DollarSign, BarChart3, RefreshCw } from 'lucide-react';
import CryptoCard, { CryptoCardProps } from "@/components/CryptoCard";
import StockDetailModal from "@/components/StockDetailModal";

export default function DashboardPage() {
  const [cryptos, setCryptos] = useState<CryptoCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCardProps | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/crypto');
      if (!response.ok) {
        throw new Error('Failed to fetch data from the server.');
      }
      const data = await response.json();

      const formattedData: CryptoCardProps[] = (Array.isArray(data) ? data : []).map((crypto: any) => ({
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.price,
        change: crypto.change,
        changePercent: crypto.changesPercentage ?? crypto.changePercent,
      }));
      setCryptos(formattedData);
    } catch (err: any) {
      setError(err.message);
      setCryptos([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  // Quick stats derived from loaded cryptos
  const totalMarketSample = cryptos.reduce((sum, c) => sum + (c.price || 0), 0);
  const gainersCount = cryptos.filter(c => (c.change || 0) > 0).length;
  const topGainer = cryptos.reduce<CryptoCardProps | null>((prev, current) => {
    if (!prev) return current;
    return (current.changePercent || 0) > (prev.changePercent || 0) ? current : prev;
  }, null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Market Overview</h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time cryptocurrency analytics, trends, and liquidity metrics.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="inline-flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-hover-bg hover:bg-hover-bg/80 text-gray-300 hover:text-white border border-border-color transition-all self-start sm:self-auto"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metric Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-hover-bg/40 border border-border-color flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Active Assets</p>
            <p className="text-xl font-bold text-white mt-0.5">{cryptos.length || 6}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-hover-bg/40 border border-border-color flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">24h Gainers</p>
            <p className="text-xl font-bold text-white mt-0.5">{gainersCount} Assets</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-hover-bg/40 border border-border-color flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Top Performer</p>
            <p className="text-xl font-bold text-white mt-0.5">
              {topGainer ? `${topGainer.name} (+${(topGainer.changePercent || 0).toFixed(2)}%)` : 'BTC (+3.2%)'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div>
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
            <p className="text-rose-400 font-semibold text-sm">Failed to load market assets: {error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-white border border-red-500/40"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !error && (
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
      </div>

      {/* Interactive Detail Modal */}
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
