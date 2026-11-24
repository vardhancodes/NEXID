// components/StockChart.tsx
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

type StockChartProps = {
  data: any[];
};

const StockChart = ({ data }: StockChartProps) => {
  // Sort oldest to newest
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const formattedData = sortedData.map(item => ({
    date: item.date,
    price: item.close,
  }));

  const minPrice = Math.min(...formattedData.map(d => d.price).filter(Boolean));
  const maxPrice = Math.max(...formattedData.map(d => d.price).filter(Boolean));
  const padding = (maxPrice - minPrice) * 0.05 || 1;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
          tickFormatter={(v) => (v.length > 5 ? v.slice(5) : v)}
        />
        <YAxis
          domain={[minPrice - padding, maxPrice + padding]}
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
          orientation="right"
          tickFormatter={(v) => `$${v > 100 ? v.toFixed(0) : v.toFixed(2)}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0D1117',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#fff',
          }}
          labelStyle={{ color: '#9ca3af' }}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#chartGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default StockChart;
