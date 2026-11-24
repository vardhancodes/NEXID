import React, { useState, useEffect } from 'react';
import { Star, Plus, Download, Upload, Trash2, PieChart as PieIcon, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MySpaceModuleProps {
  onSelectTicker: (t: string) => void;
}

interface PortfolioItem {
  id: string;
  ticker: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
}

const COLORS = ['#c084fc', '#38bdf8', '#34d399', '#f59e0b', '#f43f5e', '#a855f7'];

export const MySpaceModule: React.FC<MySpaceModuleProps> = ({ onSelectTicker }) => {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('tessera_watchlist');
    return saved ? JSON.parse(saved) : ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'BTCUSDT'];
  });

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('tessera_portfolio');
    return saved
      ? JSON.parse(saved)
      : [
          { id: '1', ticker: 'RELIANCE', quantity: 50, buyPrice: 1250, currentPrice: 1351 },
          { id: '2', ticker: 'TCS', quantity: 20, buyPrice: 3800, currentPrice: 4120 },
          { id: '3', ticker: 'INFY', quantity: 100, buyPrice: 1600, currentPrice: 1840 },
        ];
  });

  const [newTicker, setNewTicker] = useState('RELIANCE');
  const [newQty, setNewQty] = useState(10);
  const [newBuyPrice, setNewBuyPrice] = useState(1300);

  useEffect(() => {
    localStorage.setItem('tessera_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('tessera_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const handleAddHolding = () => {
    const item: PortfolioItem = {
      id: Date.now().toString(),
      ticker: newTicker.toUpperCase(),
      quantity: Number(newQty),
      buyPrice: Number(newBuyPrice),
      currentPrice: Number(newBuyPrice) * 1.05, // simulated current
    };
    setPortfolio([...portfolio, item]);
  };

  const handleRemoveHolding = (id: string) => {
    setPortfolio(portfolio.filter((p) => p.id !== id));
  };

  const totalInvested = portfolio.reduce((acc, p) => acc + p.quantity * p.buyPrice, 0);
  const currentNetWorth = portfolio.reduce((acc, p) => acc + p.quantity * p.currentPrice, 0);
  const totalPnL = currentNetWorth - totalInvested;
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const donutData = portfolio.map((p) => ({
    name: p.ticker,
    value: p.quantity * p.currentPrice,
  }));

  const exportPortfolioJSON = () => {
    const blob = new Blob([JSON.stringify(portfolio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tessera_portfolio_${Date.now()}.json`;
    a.click();
  };

  const importPortfolioJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) setPortfolio(parsed);
        } catch (err) {
          alert('Invalid JSON file format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Disclaimer */}
      <div className="flex items-center justify-between bg-[#121721] border border-gray-800 rounded-xl p-3.5 text-xs">
        <span className="font-semibold text-gray-300">
          Personal Workstation (My Space)
        </span>
        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
          Paper Portfolio (Simulated - No Real Trades Executed)
        </span>
      </div>

      {/* Portfolio Metrics Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#121721] border border-gray-800 rounded-xl p-4">
          <p className="text-[11px] text-gray-400">Total Net Worth</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">₹{currentNetWorth.toLocaleString()}</p>
        </div>
        <div className="bg-[#121721] border border-gray-800 rounded-xl p-4">
          <p className="text-[11px] text-gray-400">Total Capital Invested</p>
          <p className="text-2xl font-bold font-mono text-gray-300 mt-1">₹{totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-[#121721] border border-gray-800 rounded-xl p-4">
          <p className="text-[11px] text-gray-400">Unrealized P&L (₹)</p>
          <p className={`text-2xl font-bold font-mono mt-1 ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#121721] border border-gray-800 rounded-xl p-4">
          <p className="text-[11px] text-gray-400">Return on Capital</p>
          <p className={`text-2xl font-bold font-mono mt-1 ${totalPnLPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnLPct >= 0 ? '+' : ''}{totalPnLPct.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Holdings & Allocation Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Table */}
        <div className="lg:col-span-2 bg-[#121721] border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Paper Holdings</h3>
            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={exportPortfolioJSON}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#1a2130] text-gray-300 hover:text-white border border-gray-800"
              >
                <Download size={12} />
                <span>Export</span>
              </button>
              <label className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#1a2130] text-gray-300 hover:text-white border border-gray-800 cursor-pointer">
                <Upload size={12} />
                <span>Import</span>
                <input type="file" accept=".json" onChange={importPortfolioJSON} className="hidden" />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-2 pr-3">Asset</th>
                  <th className="py-2 px-3 text-right">Qty</th>
                  <th className="py-2 px-3 text-right">Buy Price</th>
                  <th className="py-2 px-3 text-right">Current</th>
                  <th className="py-2 px-3 text-right">Unrealized P&L</th>
                  <th className="py-2 pl-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {portfolio.map((item) => {
                  const pnl = (item.currentPrice - item.buyPrice) * item.quantity;
                  const pnlPct = ((item.currentPrice - item.buyPrice) / item.buyPrice) * 100;
                  return (
                    <tr key={item.id} className="hover:bg-gray-800/30">
                      <td className="py-2.5 pr-3 font-sans font-bold text-white cursor-pointer hover:text-purple-400" onClick={() => onSelectTicker(item.ticker)}>
                        {item.ticker}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-300">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-gray-400">₹{item.buyPrice}</td>
                      <td className="py-2.5 px-3 text-right text-gray-200">₹{item.currentPrice}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(0)} ({pnlPct.toFixed(1)}%)
                      </td>
                      <td className="py-2.5 pl-3 text-center">
                        <button
                          onClick={() => handleRemoveHolding(item.id)}
                          className="text-gray-500 hover:text-rose-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add holding form */}
          <div className="pt-4 border-t border-gray-800 flex flex-wrap items-center gap-3 text-xs">
            <input
              type="text"
              placeholder="Ticker (e.g. RELIANCE)"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              className="bg-[#1a2130] border border-gray-800 rounded px-2.5 py-1.5 text-white font-mono"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newQty}
              onChange={(e) => setNewQty(Number(e.target.value))}
              className="bg-[#1a2130] border border-gray-800 rounded px-2.5 py-1.5 text-white font-mono w-24"
            />
            <input
              type="number"
              placeholder="Buy Price (₹)"
              value={newBuyPrice}
              onChange={(e) => setNewBuyPrice(Number(e.target.value))}
              className="bg-[#1a2130] border border-gray-800 rounded px-2.5 py-1.5 text-white font-mono w-28"
            />
            <button
              onClick={handleAddHolding}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
            >
              <Plus size={14} />
              <span>Add Holding</span>
            </button>
          </div>
        </div>

        {/* Allocation Donut */}
        <div className="bg-[#121721] border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-3">
            Asset Allocation
          </h3>
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {donutData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#121721', borderColor: '#374151', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-1 text-xs font-mono">
            {portfolio.map((p, i) => (
              <div key={p.id} className="flex justify-between items-center text-gray-300">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span>{p.ticker}</span>
                </span>
                <span>₹{(p.quantity * p.currentPrice).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Watchlist Widget */}
      <div className="bg-[#121721] border border-gray-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-3">
          Persistent Watchlist (Star Anywhere)
        </h3>
        <div className="flex flex-wrap gap-2">
          {watchlist.map((sym) => (
            <div
              key={sym}
              className="flex items-center space-x-2 bg-[#1a2130] border border-gray-800 px-3 py-1.5 rounded-lg text-xs"
            >
              <Star size={13} className="text-amber-400 fill-amber-400 cursor-pointer" onClick={() => setWatchlist(watchlist.filter((w) => w !== sym))} />
              <span className="font-mono font-bold text-white cursor-pointer hover:text-purple-300" onClick={() => onSelectTicker(sym)}>
                {sym}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
