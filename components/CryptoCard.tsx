import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export type CryptoCardProps = {
  symbol: string;
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  high24h?: number;
  low24h?: number;
  volume?: number;
};

export type StockCardProps = CryptoCardProps;

type CardComponentProps = CryptoCardProps & {
  onClick: () => void;
};

const CryptoCard = ({ symbol, name, price, change, changePercent, high24h, low24h, volume, onClick }: CardComponentProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isPositive = (change ?? 0) >= 0;
  const changeColorClass = isPositive ? 'text-emerald-400' : 'text-rose-400';
  const displaySymbol = symbol.replace(/USD|USDT/gi, '');

  const formatPrice = (p?: number) => {
    if (typeof p !== 'number') return '0.00';
    if (p < 0.0001) return p.toPrecision(3);
    if (p < 0.01) return p.toPrecision(4);
    if (p < 10) return p.toFixed(4);
    return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const safeChange = typeof change === 'number' ? change : 0;
  const safePercent = typeof changePercent === 'number' ? changePercent : 0;

  // Generate lightweight mini sparkline
  const sparklineData = [
    { p: (price || 100) * (1 - (safePercent / 100) * 0.8) },
    { p: (price || 100) * (1 - (safePercent / 100) * 0.4) },
    { p: (price || 100) * (1 + (safePercent / 100) * 0.2) },
    { p: (price || 100) * (1 + (safePercent / 100) * 0.6) },
    { p: price || 100 },
  ];

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative bg-[#0D1117] hover:bg-hover-bg/70 p-5 rounded-2xl border border-border-color hover:border-primary/50 cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-lg flex flex-col justify-between"
    >
      <div className="flex justify-between items-start">
        <div className="min-w-0 pr-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-extrabold text-white tracking-tight">{displaySymbol}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-hover-bg text-gray-400 border border-border-color">
              USDT
            </span>
          </div>
          <div className="text-xs text-gray-400 truncate mt-1 font-medium">
            {name || displaySymbol}
          </div>
        </div>
        <div className={`p-2 rounded-xl ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} flex-shrink-0`}>
          {isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
        </div>
      </div>

      {/* Mini Sparkline graph on card */}
      <div className="h-10 w-full my-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparklineData}>
            <Line
              type="monotone"
              dataKey="p"
              stroke={isPositive ? '#22c55e' : '#f43f5e'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-border-color/40 flex items-baseline justify-between">
        <div>
          <div className="text-2xl font-black text-white tracking-tight">
            ${formatPrice(price)}
          </div>
          <div className={`mt-0.5 text-xs font-semibold flex items-center ${changeColorClass}`}>
            <span>
              {isPositive ? '+' : ''}{safeChange.toFixed(2)} ({isPositive ? '+' : ''}{safePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Hover mini-stats */}
        {isHovered && volume && (
          <div className="text-right text-[10px] font-mono text-gray-400 animate-fadeIn">
            <div>Vol: ${(volume / 1000000).toFixed(1)}M</div>
            {high24h && <div>High: ${high24h.toFixed(2)}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoCard;
