import React from 'react';

interface RangeWidgetsProps {
  price: number;
  dayLow?: number;
  dayHigh?: number;
  yearLow?: number;
  yearHigh?: number;
  ath?: number;
  athDistance?: number;
  currency?: string;
}

export const RangeWidgets: React.FC<RangeWidgetsProps> = ({
  price,
  dayLow = 0,
  dayHigh = 0,
  yearLow = 0,
  yearHigh = 0,
  ath = 0,
  athDistance = 0,
  currency = '₹',
}) => {
  const daySpan = dayHigh - dayLow || 1;
  const dayProgress = Math.min(Math.max(((price - dayLow) / daySpan) * 100, 0), 100);

  const yearSpan = yearHigh - yearLow || 1;
  const yearProgress = Math.min(Math.max(((price - yearLow) / yearSpan) * 100, 0), 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Day Range */}
      <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
          <span className="font-medium text-gray-300">Day's Range</span>
          <span className="font-mono text-gray-400">{currency}{price.toFixed(2)}</span>
        </div>
        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden relative">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${dayProgress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] font-mono text-gray-500 mt-2">
          <span>L: {currency}{dayLow?.toFixed(2) || '0.00'}</span>
          <span>H: {currency}{dayHigh?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      {/* 52-Week Range */}
      <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
          <span className="font-medium text-gray-300">52-Week Range</span>
          <span className="font-mono text-gray-400">{yearProgress.toFixed(0)}% to peak</span>
        </div>
        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden relative">
          <div
            className="bg-zinc-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${yearProgress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] font-mono text-gray-500 mt-2">
          <span>52W L: {currency}{yearLow?.toFixed(2) || '0.00'}</span>
          <span>52W H: {currency}{yearHigh?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      {/* Distance from ATH */}
      <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
          <span className="font-medium text-gray-300">All-Time Peak</span>
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">High</span>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <div className="text-xl font-bold font-mono text-white">
            {currency}{ath?.toFixed(2) || price.toFixed(2)}
          </div>
          <div className={`text-xs font-mono font-semibold ${athDistance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {athDistance > 0 ? `+${athDistance}%` : `${athDistance}%`}
          </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          Drawdown relative to 52-week cycle record peak.
        </p>
      </div>
    </div>
  );
};
