import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PricePoint } from '../services/api';

interface SharedChartProps {
  data: PricePoint[];
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  currencySymbol?: string;
}

export const SharedChart: React.FC<SharedChartProps> = ({
  data,
  timeframe,
  onTimeframeChange,
  currencySymbol = '₹',
}) => {
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(false);
  const [showMA200, setShowMA200] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  const timeframes = ['1D', '1W', '1M', '3M', '1Y', '5Y'];

  const minPrice = Math.min(...data.map((d) => d.low || d.close).filter(Boolean));
  const maxPrice = Math.max(...data.map((d) => d.high || d.close).filter(Boolean));
  const padding = (maxPrice - minPrice) * 0.05 || 1;

  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4 flex flex-col space-y-4">
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Timeframe buttons */}
        <div className="flex items-center space-x-1 bg-[#0d1117] p-1 rounded-lg border border-gray-800">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Moving Average Toggles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowMA20(!showMA20)}
            className={`px-2 py-1 rounded border text-[11px] font-mono ${
              showMA20
                ? 'bg-amber-950/40 text-amber-300 border-amber-600/40'
                : 'bg-[#0d1117] text-gray-500 border-gray-800'
            }`}
          >
            MA 20
          </button>

          <button
            onClick={() => setShowMA50(!showMA50)}
            className={`px-2 py-1 rounded border text-[11px] font-mono ${
              showMA50
                ? 'bg-sky-950/40 text-sky-300 border-sky-600/40'
                : 'bg-[#0d1117] text-gray-500 border-gray-800'
            }`}
          >
            MA 50
          </button>

          <button
            onClick={() => setShowMA200(!showMA200)}
            className={`px-2 py-1 rounded border text-[11px] font-mono ${
              showMA200
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40'
                : 'bg-[#0d1117] text-gray-500 border-gray-800'
            }`}
          >
            MA 200
          </button>

          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-1 rounded border text-[11px] ${
              showVolume
                ? 'bg-zinc-800 text-gray-200 border-gray-700'
                : 'bg-[#0d1117] text-gray-500 border-gray-800'
            }`}
          >
            Vol
          </button>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="minimalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => (v.length > 10 ? v.slice(5, 10) : v.slice(5))}
            />
            <YAxis
              domain={[minPrice - padding, maxPrice + padding]}
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              orientation="right"
              tickFormatter={(v) => `${currencySymbol}${v.toFixed(0)}`}
            />
            {showVolume && (
              <YAxis
                yAxisId="vol"
                orientation="left"
                domain={[0, 'dataMax * 3']}
                hide
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: '#161b22',
                borderColor: '#30363d',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#f3f4f6',
              }}
              labelStyle={{ color: '#9ca3af' }}
            />
            {showVolume && (
              <Bar
                dataKey="volume"
                yAxisId="vol"
                fill="#30363d"
                opacity={0.4}
                radius={[2, 2, 0, 0]}
              />
            )}
            <Area
              type="monotone"
              dataKey="close"
              stroke="#10b981"
              strokeWidth={1.75}
              fillOpacity={1}
              fill="url(#minimalGrad)"
            />
            {showMA20 && (
              <Line
                type="monotone"
                dataKey="ma20"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="2 2"
              />
            )}
            {showMA50 && (
              <Line
                type="monotone"
                dataKey="ma50"
                stroke="#38bdf8"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="3 3"
              />
            )}
            {showMA200 && (
              <Line
                type="monotone"
                dataKey="ma200"
                stroke="#10b981"
                strokeWidth={1.5}
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
