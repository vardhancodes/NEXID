// components/StockChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

type StockChartProps = {
  data: any[]; // The historical price data
};

const StockChart = ({ data }: StockChartProps) => {
  // Format data for the chart
  const formattedData = data.map(item => ({
    date: item.date,
    price: item.close,
  })).reverse(); // Reverse to show oldest to newest

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#9ca3af' }}
          tickLine={{ stroke: '#9ca3af' }}
          axisLine={{ stroke: '#9ca3af' }}
        />
        <YAxis
          domain={['dataMin', 'dataMax']}
          tick={{ fill: '#9ca3af' }}
          tickLine={{ stroke: '#9ca3af' }}
          axisLine={{ stroke: '#9ca3af' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
          labelStyle={{ color: '#d1d5db' }}
        />
        <Line
          type="monotone"
          dataKey="price"
          // Changed the stroke color to white as requested
          stroke="#FFFFFF"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StockChart;
