import React, { useState, useEffect } from 'react';
import {
  fetchQuote,
  fetchPriceHistory,
  fetchCryptoSpot,
  StockQuote,
  PricePoint,
} from './services/api';
import { SharedChart } from './components/SharedChart';
import { RangeWidgets } from './components/RangeWidgets';
import { CommandPalette } from './components/CommandPalette';
import { FinancialsModule } from './modules/FinancialsModule';
import { LiveBoardModule } from './modules/LiveBoardModule';
import { ModelLabModule } from './modules/ModelLabModule';
import { NewsChainModule } from './modules/NewsChainModule';
import {
  TrendingUp,
  BarChart2,
  Sparkles,
  Newspaper,
  Search,
  Coins,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<'liveboard' | 'financials' | 'modellab' | 'newschain'>('liveboard');
  const [selectedTicker, setSelectedTicker] = useState('RELIANCE');
  const [market, setMarket] = useState<'NSE' | 'US' | 'METALS' | 'CRYPTO'>('NSE');
  const [timeframe, setTimeframe] = useState('1Y');
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [cryptoSpot, setCryptoSpot] = useState<any[]>([]);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load active ticker data
  const loadAssetData = async (sym: string, mkt = market) => {
    setLoading(true);
    try {
      const [q, h] = await Promise.all([
        fetchQuote(sym, mkt),
        fetchPriceHistory(sym, timeframe, mkt),
      ]);
      setQuote(q);
      setHistory(h);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssetData(selectedTicker, market);
  }, [selectedTicker, timeframe, market]);

  useEffect(() => {
    fetchCryptoSpot().then(setCryptoSpot).catch(console.error);
  }, []);

  const handleSelectTicker = (sym: string) => {
    let detectedMarket: 'NSE' | 'US' | 'METALS' | 'CRYPTO' = 'NSE';
    const s = sym.toUpperCase();
    if (s.includes('USDT') || s === 'BTC' || s === 'ETH') {
      detectedMarket = 'CRYPTO';
    } else if (['GOLD', 'SILVER', 'COPPER', 'CRUDE'].includes(s)) {
      detectedMarket = 'METALS';
    } else if (['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'TSLA'].includes(s)) {
      detectedMarket = 'US';
    }
    setMarket(detectedMarket);
    setSelectedTicker(sym);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 font-sans flex flex-col selection:bg-zinc-700">
      {/* 1. Minimal Top Marquee */}
      <div className="bg-[#161b22] border-b border-gray-800 px-4 py-2 flex items-center justify-between text-xs overflow-x-auto whitespace-nowrap gap-6">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-white tracking-wide">TESSERA</span>
            <span className="text-[10px] text-gray-500 font-mono">v1.2</span>
          </div>

          {/* Quick market indicators */}
          <div className="flex items-center space-x-5 font-mono text-[11px]">
            {cryptoSpot.slice(0, 5).map((c) => {
              const isPos = c.changePercent >= 0;
              return (
                <div
                  key={c.symbol}
                  onClick={() => handleSelectTicker(c.symbol)}
                  className="flex items-center space-x-1.5 cursor-pointer hover:text-white transition-colors"
                >
                  <span className="text-gray-400 font-medium">{c.coin}</span>
                  <span className="text-white">${c.price > 10 ? c.price.toLocaleString() : c.price}</span>
                  <span className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
                    {isPos ? '+' : ''}{c.changePercent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Search & Market Toggles */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#0d1117] border border-gray-800 rounded-lg p-0.5 text-[11px] font-mono">
            {(['NSE', 'US', 'METALS', 'CRYPTO'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMarket(m);
                  if (m === 'NSE') setSelectedTicker('RELIANCE');
                  if (m === 'US') setSelectedTicker('AAPL');
                  if (m === 'METALS') setSelectedTicker('GOLD');
                  if (m === 'CRYPTO') setSelectedTicker('BTCUSDT');
                }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  market === m ? 'bg-zinc-800 text-white font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center space-x-2 bg-[#0d1117] hover:bg-gray-800 px-3 py-1.5 rounded-lg text-xs text-gray-300 border border-gray-800 transition-colors"
          >
            <Search size={13} className="text-gray-400" />
            <span>Search all assets</span>
            <kbd className="text-[10px] bg-zinc-800 px-1 rounded font-mono text-gray-400">⌘K</kbd>
          </button>
        </div>
      </div>

      {/* 2. Clean Header & Navigation */}
      <header className="bg-[#161b22] border-b border-gray-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setActiveModule('liveboard')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeModule === 'liveboard' ? 'bg-zinc-800 text-white font-semibold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp size={14} />
            <span>Live Board</span>
          </button>
          <button
            onClick={() => setActiveModule('financials')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeModule === 'financials' ? 'bg-zinc-800 text-white font-semibold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart2 size={14} />
            <span>Financials & Ratios</span>
          </button>
          <button
            onClick={() => setActiveModule('modellab')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeModule === 'modellab' ? 'bg-zinc-800 text-white font-semibold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Model Lab (ML)</span>
          </button>
          <button
            onClick={() => setActiveModule('newschain')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeModule === 'newschain' ? 'bg-zinc-800 text-white font-semibold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Newspaper size={14} />
            <span>News Chain</span>
          </button>
        </div>

        {/* Active Asset Strip */}
        {quote && (
          <div className="flex items-center space-x-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-white text-base">{quote.symbol}</span>
                <span className="text-xs text-gray-400">{quote.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0d1117] border border-gray-800 text-gray-400">
                  {quote.sector}
                </span>
              </div>
            </div>
            <div className="flex items-baseline space-x-2 font-mono">
              <span className="text-lg font-extrabold text-white">
                {quote.currency === 'INR' ? '₹' : '$'}{quote.price?.toLocaleString()}
              </span>
              <span className={`text-xs font-semibold ${quote.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {quote.change >= 0 ? '+' : ''}{quote.changePercent}%
              </span>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Visualizer Strip */}
      {quote && (
        <div className="px-6 pt-6 pb-2 space-y-4 max-w-7xl mx-auto w-full">
          <SharedChart
            data={history}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            currencySymbol={quote.currency === 'INR' ? '₹' : '$'}
          />
          <RangeWidgets
            price={quote.price}
            dayLow={quote.dayLow}
            dayHigh={quote.dayHigh}
            yearLow={quote.yearLow}
            yearHigh={quote.yearHigh}
            ath={quote.ath}
            athDistance={quote.athDistance}
            currency={quote.currency === 'INR' ? '₹' : '$'}
          />
        </div>
      )}

      {/* 4. Active Plugin Module Content */}
      <main className="flex-1 px-6 py-4 max-w-7xl mx-auto w-full">
        {activeModule === 'liveboard' && (
          <LiveBoardModule onSelectTicker={handleSelectTicker} />
        )}
        {activeModule === 'financials' && (
          <FinancialsModule ticker={selectedTicker} />
        )}
        {activeModule === 'modellab' && (
          <ModelLabModule ticker={selectedTicker} />
        )}
        {activeModule === 'newschain' && (
          <NewsChainModule ticker={selectedTicker} />
        )}
      </main>

      {/* 5. Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectTicker={handleSelectTicker}
        onSwitchModule={(m: any) => setActiveModule(m)}
      />

      {/* 6. Minimal Footer */}
      <footer className="border-t border-gray-800 px-6 py-4 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span>Tessera Terminal</span>
          <span>•</span>
          <span>Real Quantitative Analytics Engine</span>
          <span>•</span>
          <span className="text-emerald-400">Zero Paid APIs</span>
        </div>
        <div className="font-mono text-[11px] text-gray-500">
          NSE/BSE • US Markets • Global Commodities & Metals • Crypto Vision
        </div>
      </footer>
    </div>
  );
}
