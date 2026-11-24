import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, BarChart2, TrendingUp, Sparkles, Newspaper } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicker: (ticker: string) => void;
  onSwitchModule: (module: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTicker,
  onSwitchModule,
}) => {
  const [search, setSearch] = useState('');

  const catalog = [
    // Indian Equities
    { symbol: 'RELIANCE', name: 'Reliance Industries', market: 'NSE' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', market: 'NSE' },
    { symbol: 'INFY', name: 'Infosys Ltd', market: 'NSE' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', market: 'NSE' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', market: 'NSE' },
    { symbol: 'ITC', name: 'ITC Ltd', market: 'NSE' },
    { symbol: 'LT', name: 'Larsen & Toubro', market: 'NSE' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', market: 'NSE' },
    { symbol: 'SBIN', name: 'State Bank of India', market: 'NSE' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors', market: 'NSE' },
    // US Equities
    { symbol: 'AAPL', name: 'Apple Inc.', market: 'US' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', market: 'US' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', market: 'US' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'US' },
    { symbol: 'TSLA', name: 'Tesla Inc.', market: 'US' },
    // Commodities & Metals
    { symbol: 'GOLD', name: 'Gold Futures (COMEX)', market: 'METALS' },
    { symbol: 'SILVER', name: 'Silver Futures (COMEX)', market: 'METALS' },
    { symbol: 'COPPER', name: 'Copper Futures', market: 'METALS' },
    { symbol: 'CRUDE', name: 'Crude Oil WTI', market: 'COMMODITY' },
    // Crypto
    { symbol: 'BTCUSDT', name: 'Bitcoin Spot', market: 'CRYPTO' },
    { symbol: 'ETHUSDT', name: 'Ethereum Spot', market: 'CRYPTO' },
    { symbol: 'SOLUSDT', name: 'Solana Spot', market: 'CRYPTO' },
  ];

  const modules = [
    { id: 'liveboard', name: 'Live Board (Heatmap & Movers)', icon: TrendingUp },
    { id: 'financials', name: 'Financials & Screener Ratios', icon: BarChart2 },
    { id: 'modellab', name: 'Model Lab (Custom ML Sandbox)', icon: Sparkles },
    { id: 'newschain', name: 'News Chain (Causal Event Graph)', icon: Newspaper },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredAssets = catalog.filter(
    (c) =>
      c.symbol.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.market.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#161b22] border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-800">
          <Search className="w-4 h-4 text-gray-400 mr-3" />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && search.trim()) {
                onSelectTicker(search.trim().toUpperCase());
                onClose();
              }
            }}
            placeholder="Search Indian, US, Crypto, Metals (e.g. RELIANCE, AAPL, GOLD, BTC)..."
            className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-500 focus:outline-none font-sans"
          />
          <kbd className="text-[10px] bg-zinc-800 text-gray-400 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Modules navigation */}
          {!search && (
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-3 py-1">Terminal Modules</p>
              {modules.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSwitchModule(m.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <span>{m.name}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-600" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Asset search matches */}
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-3 py-1">
              {search ? 'Search Results' : 'Featured Cross-Market Assets'}
            </p>
            {filteredAssets.map((t) => (
              <button
                key={t.symbol}
                onClick={() => {
                  onSelectTicker(t.symbol);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-emerald-400">{t.symbol}</span>
                  <span className="text-gray-400 text-[11px]">{t.name}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-gray-400 font-mono">{t.market}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
