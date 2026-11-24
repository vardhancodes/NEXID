import React, { useState, useEffect } from 'react';
import { fetchLiveBoardMacro, fetchMarketMood, fetchTreemapAndMovers } from '../services/api';
import { TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';

interface LiveBoardModuleProps {
  onSelectTicker: (t: string) => void;
}

export const LiveBoardModule: React.FC<LiveBoardModuleProps> = ({ onSelectTicker }) => {
  const [macro, setMacro] = useState<any[]>([]);
  const [mood, setMood] = useState<any>(null);
  const [boardData, setBoardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'treemap' | 'gainers' | 'losers' | 'volume'>('treemap');
  const [hoveredCard, setHoveredCard] = useState<any | null>(null);

  useEffect(() => {
    fetchLiveBoardMacro().then(setMacro).catch(console.error);
    fetchMarketMood().then(setMood).catch(console.error);
    fetchTreemapAndMovers().then(setBoardData).catch(console.error);

    const interval = setInterval(() => {
      fetchLiveBoardMacro().then(setMacro).catch(console.error);
      fetchMarketMood().then(setMood).catch(console.error);
      fetchTreemapAndMovers().then(setBoardData).catch(console.error);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Macro Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {macro.map((item) => {
          const isPos = item.change >= 0;
          return (
            <div key={item.symbol} className="bg-[#161b22] border border-gray-800 rounded-xl p-3">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">{item.label}</span>
              <p className="text-base font-bold font-mono text-white mt-1">
                {item.price?.toLocaleString()}
              </p>
              <div className={`flex items-center text-[11px] font-mono mt-0.5 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPos ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                {isPos ? '+' : ''}{item.changePercent}%
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Market Mood Gauge & Exchange Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mood && (
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Market Mood Index</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono" style={{ backgroundColor: `${mood.color}20`, color: mood.color }}>
                  {mood.sentiment}
                </span>
              </div>
              <div className="flex items-baseline space-x-3 mt-4">
                <span className="text-4xl font-extrabold font-mono" style={{ color: mood.color }}>
                  {mood.score}
                </span>
                <span className="text-xs text-gray-400 font-mono">/ 100</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${mood.score}%`, backgroundColor: mood.color }} />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-800 text-[10px] text-gray-400 space-y-1">
              <p className="font-mono text-gray-300">Formula: {mood.formula}</p>
              <p>India VIX: {mood.components.indiaVix} | Nifty 200-DMA: ₹{mood.components.nifty200DMA}</p>
            </div>
          </div>
        )}

        {boardData?.marketStatus && (
          <div className="md:col-span-2 bg-[#161b22] border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${boardData.marketStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    {boardData.marketStatus.exchange} {boardData.marketStatus.isOpen ? '• Market Open' : '• Market Closed'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Trading hours: 09:15 to 15:30 IST (Mon - Fri)</p>
              </div>
              <span className="text-[11px] font-mono text-gray-400 bg-[#0d1117] border border-gray-800 px-2 py-1 rounded">
                IST: {boardData.marketStatus.currentTimeIST.slice(11, 19)}
              </span>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>{boardData.marketStatus.dataFreshness}</span>
              </span>
              <span className="text-[11px] text-gray-500 font-mono">45s auto-refresh</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Heatmap & Tabbed Movers with Fast Hover Quick-Stats */}
      <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5 relative">
        <div className="flex flex-wrap items-center justify-between border-b border-gray-800 pb-3 gap-2">
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setActiveTab('treemap')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'treemap' ? 'bg-zinc-800 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sector Heatmap
            </button>
            <button
              onClick={() => setActiveTab('gainers')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'gainers' ? 'bg-zinc-800 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Top Gainers
            </button>
            <button
              onClick={() => setActiveTab('losers')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'losers' ? 'bg-zinc-800 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Top Losers
            </button>
            <button
              onClick={() => setActiveTab('volume')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'volume' ? 'bg-zinc-800 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Volume Leaders
            </button>
          </div>

          {hoveredCard && (
            <div className="text-xs font-mono text-gray-300 bg-[#0d1117] px-3 py-1 rounded border border-gray-800 flex items-center space-x-3">
              <span className="font-bold text-white">{hoveredCard.symbol}</span>
              <span>₹{hoveredCard.price}</span>
              <span className={hoveredCard.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {hoveredCard.changePercent >= 0 ? '+' : ''}{hoveredCard.changePercent}%
              </span>
              <span className="text-gray-500">Vol: {(hoveredCard.volume / 1000).toFixed(0)}k</span>
            </div>
          )}
        </div>

        {/* Tab 1: Treemap Heatmap with fast hover preview */}
        {activeTab === 'treemap' && boardData?.treemap && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
            {boardData.treemap.map((item: any) => {
              const isPos = item.changePercent >= 0;
              const bgIntensity = isPos
                ? item.changePercent > 2 ? 'bg-emerald-950/70 border-emerald-600/40 text-emerald-300' : 'bg-emerald-950/30 border-emerald-600/20 text-emerald-400'
                : item.changePercent < -2 ? 'bg-rose-950/70 border-rose-600/40 text-rose-300' : 'bg-rose-950/30 border-rose-600/20 text-rose-400';
              return (
                <div
                  key={item.symbol}
                  onClick={() => onSelectTicker(item.symbol)}
                  onMouseEnter={() => setHoveredCard(item)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`p-3 rounded-xl border cursor-pointer hover:border-gray-500 transition-all ${bgIntensity}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-xs text-white">{item.symbol}</span>
                    <span className="text-[10px] text-gray-400">{item.sector}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between font-mono">
                    <span className="text-xs text-gray-200">₹{item.price}</span>
                    <span className="text-xs font-bold">
                      {isPos ? '+' : ''}{item.changePercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Gainers / Losers / Volume */}
        {activeTab !== 'treemap' && boardData && (
          <div className="divide-y divide-gray-800 mt-2">
            {(activeTab === 'gainers' ? boardData.gainers : activeTab === 'losers' ? boardData.losers : boardData.topVolume).map((item: any) => {
              const isPos = item.changePercent >= 0;
              return (
                <div
                  key={item.symbol}
                  onClick={() => onSelectTicker(item.symbol)}
                  onMouseEnter={() => setHoveredCard(item)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-gray-800/30 rounded-lg cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-mono font-bold text-sm text-white">{item.symbol}</span>
                    <span className="text-xs text-gray-400 ml-2">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-6 font-mono text-xs">
                    <span className="text-gray-200">₹{item.price}</span>
                    <span className={`font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPos ? '+' : ''}{item.changePercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
