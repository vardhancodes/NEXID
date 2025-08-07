import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export type StockCardProps = {
  symbol: string;
  name?: string;      // Make props optional
  price?: number;
  change?: number;
  changePercent?: number;
};

type CardComponentProps = StockCardProps & {
  onClick: () => void; 
};

const StockCard = ({ symbol, name, price, change, changePercent, onClick }: CardComponentProps) => {
  // Use a logical OR (||) to provide 0 as a fallback if a value is missing
  const isPositive = (change || 0) >= 0;
  
  const changeColorClass = isPositive ? 'text-green-500' : 'text-red-500';
  const glowClass = isPositive 
    ? 'hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'
    : 'hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]';

  return (
    <div
      onClick={onClick}
      className={`
        bg-hover-bg p-6 rounded-lg border border-border-color
        cursor-pointer transition-all duration-300
        hover:scale-105 hover:border-primary ${glowClass}
      `}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-2xl font-bold text-white">{symbol}</div>
          <div className="text-sm text-gray-400 truncate w-48">{name || 'Name not available'}</div>
        </div>
        {isPositive ? <ArrowUpRight className="w-8 h-8 text-green-500" /> : <ArrowDownRight className="w-8 h-8 text-red-500" />}
      </div>

      <div className="mt-6">
        {/* The fallback (|| 0) ensures .toFixed() is always called on a valid number */}
        <div className="text-3xl font-semibold text-white">${(price || 0).toFixed(2)}</div>
        <div className={`mt-1 text-lg font-medium ${changeColorClass}`}>
          {isPositive ? '+' : ''}{(change || 0).toFixed(2)} ({isPositive ? '+' : ''}{(changePercent || 0).toFixed(2)}%)
        </div>
      </div>
    </div>
  );
};

export default StockCard;
