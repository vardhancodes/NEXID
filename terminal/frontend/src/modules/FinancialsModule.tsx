import React, { useState, useEffect } from 'react';
import {
  fetchFinancialStatements,
  fetchFinancialRatios,
  fetchQuantStats,
  fetchCorrelationMatrix,
  runEverydayCalculator,
} from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface FinancialsModuleProps {
  ticker: string;
}

export const FinancialsModule: React.FC<FinancialsModuleProps> = ({ ticker }) => {
  const [activeTab, setActiveTab] = useState<'screener' | 'financials' | 'stats' | 'calculator'>('screener');
  const [freq, setFreq] = useState<'annual' | 'quarterly'>('annual');
  const [ratios, setRatios] = useState<any>(null);
  const [financials, setFinancials] = useState<any>(null);
  const [quantStats, setQuantStats] = useState<any>(null);
  const [corrMatrix, setCorrMatrix] = useState<any>(null);

  // Calculator state
  const [calcType, setCalcType] = useState<'sip' | 'lumpsum' | 'emi' | 'fd'>('sip');
  const [calcParams, setCalcParams] = useState({
    monthlyInvestment: 10000,
    investment: 100000,
    principal: 2000000,
    annualRate: 12,
    years: 10,
  });
  const [calcResult, setCalcResult] = useState<any>(null);

  useEffect(() => {
    fetchFinancialRatios(ticker).then(setRatios).catch(console.error);
    fetchFinancialStatements(ticker, 'NSE', freq).then(setFinancials).catch(console.error);
    fetchQuantStats(ticker).then(setQuantStats).catch(console.error);
    fetchCorrelationMatrix([ticker, 'TCS', 'INFY', 'HDFCBANK']).then(setCorrMatrix).catch(console.error);
  }, [ticker, freq]);

  useEffect(() => {
    runEverydayCalculator(calcType, calcParams).then(setCalcResult).catch(console.error);
  }, [calcType, calcParams]);

  return (
    <div className="space-y-6">
      {/* Module Navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-800 pb-3 gap-2">
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setActiveTab('screener')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'screener' ? 'bg-zinc-800 text-white font-semibold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Screener Overview & Peers
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'financials' ? 'bg-zinc-800 text-white font-semibold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Financial Statements ({freq})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'stats' ? 'bg-zinc-800 text-white font-semibold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Quant Stats & Returns
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'calculator' ? 'bg-zinc-800 text-white font-semibold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Calculators (SIP/EMI)
          </button>
        </div>

        {activeTab === 'financials' && (
          <div className="flex items-center bg-[#161b22] p-0.5 rounded-lg border border-gray-800 text-xs">
            <button
              onClick={() => setFreq('annual')}
              className={`px-2.5 py-1 rounded ${freq === 'annual' ? 'bg-zinc-800 text-white' : 'text-gray-400'}`}
            >
              Annual
            </button>
            <button
              onClick={() => setFreq('quarterly')}
              className={`px-2.5 py-1 rounded ${freq === 'quarterly' ? 'bg-zinc-800 text-white' : 'text-gray-400'}`}
            >
              Quarterly
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: Screener.in Grade Overview */}
      {activeTab === 'screener' && ratios && (
        <div className="space-y-6">
          {/* Top Screener Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5">
              <span className="text-[11px] text-gray-400 block">Market Cap</span>
              <span className="text-base font-bold font-mono text-white mt-1 block">
                ₹{(ratios.screenerMetrics?.marketCap / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr.
              </span>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5">
              <span className="text-[11px] text-gray-400 block">Current Price</span>
              <span className="text-base font-bold font-mono text-white mt-1 block">
                ₹{ratios.screenerMetrics?.currentPrice}
              </span>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5">
              <span className="text-[11px] text-gray-400 block">High / Low</span>
              <span className="text-base font-bold font-mono text-white mt-1 block">
                ₹{ratios.screenerMetrics?.high52w} / {ratios.screenerMetrics?.low52w}
              </span>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5">
              <span className="text-[11px] text-gray-400 block">Stock P/E</span>
              <span className="text-base font-bold font-mono text-white mt-1 block">
                {ratios.screenerMetrics?.stockPE || 'N/A'}
              </span>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5">
              <span className="text-[11px] text-gray-400 block">Book Value</span>
              <span className="text-base font-bold font-mono text-white mt-1 block">
                ₹{ratios.screenerMetrics?.bookValue || 'N/A'}
              </span>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5">
              <span className="text-[11px] text-gray-400 block">Dividend Yield</span>
              <span className="text-base font-bold font-mono text-white mt-1 block">
                {ratios.screenerMetrics?.dividendYield !== null ? `${ratios.screenerMetrics.dividendYield}%` : 'N/A'}
              </span>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5">
              <span className="text-[11px] text-gray-400 block">ROCE</span>
              <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                {ratios.screenerMetrics?.roce ? `${ratios.screenerMetrics.roce}%` : 'N/A'}
              </span>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5">
              <span className="text-[11px] text-gray-400 block">ROE</span>
              <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                {ratios.screenerMetrics?.roe ? `${ratios.screenerMetrics.roe}%` : 'N/A'}
              </span>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5">
              <span className="text-[11px] text-gray-400 block">Face Value</span>
              <span className="text-base font-bold font-mono text-white mt-1 block">
                ₹{ratios.screenerMetrics?.faceValue}
              </span>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5">
              <span className="text-[11px] text-gray-400 block">Piotroski Score</span>
              <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                {ratios.institutionalModels?.piotroskiF?.score} / 9
              </span>
            </div>
          </div>

          {/* Compounded Growth Rates (CAGR Table) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 border-b border-gray-800 pb-2 mb-2">Compounded Sales Growth</p>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between"><span>10 Years:</span><span className="text-white font-semibold">15%</span></div>
                <div className="flex justify-between"><span>5 Years:</span><span className="text-white font-semibold">18%</span></div>
                <div className="flex justify-between"><span>3 Years:</span><span className="text-white font-semibold">6%</span></div>
                <div className="flex justify-between"><span>TTM:</span><span className="text-emerald-400 font-semibold">20%</span></div>
              </div>
            </div>

            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 border-b border-gray-800 pb-2 mb-2">Compounded Profit Growth</p>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between"><span>10 Years:</span><span className="text-white font-semibold">10%</span></div>
                <div className="flex justify-between"><span>5 Years:</span><span className="text-white font-semibold">12%</span></div>
                <div className="flex justify-between"><span>3 Years:</span><span className="text-white font-semibold">5%</span></div>
                <div className="flex justify-between"><span>TTM:</span><span className="text-emerald-400 font-semibold">7%</span></div>
              </div>
            </div>

            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 border-b border-gray-800 pb-2 mb-2">Stock Price CAGR</p>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between"><span>10 Years:</span><span className="text-white font-semibold">20%</span></div>
                <div className="flex justify-between"><span>5 Years:</span><span className="text-white font-semibold">5%</span></div>
                <div className="flex justify-between"><span>3 Years:</span><span className="text-white font-semibold">5%</span></div>
                <div className="flex justify-between"><span>1 Year:</span><span className="text-rose-400 font-semibold">-11%</span></div>
              </div>
            </div>

            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 border-b border-gray-800 pb-2 mb-2">Return on Equity</p>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between"><span>10 Years:</span><span className="text-white font-semibold">9%</span></div>
                <div className="flex justify-between"><span>5 Years:</span><span className="text-white font-semibold">9%</span></div>
                <div className="flex justify-between"><span>3 Years:</span><span className="text-white font-semibold">9%</span></div>
                <div className="flex justify-between"><span>Last Year:</span><span className="text-white font-semibold">9%</span></div>
              </div>
            </div>
          </div>

          {/* Peer Comparison Table */}
          {ratios.peers && (
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4 overflow-x-auto">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Peer Comparison (Sector Leaders)</h3>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="py-2 pr-4">Company</th>
                    <th className="py-2 px-3 text-right">CMP (₹)</th>
                    <th className="py-2 px-3 text-right">P/E</th>
                    <th className="py-2 px-3 text-right">Mar Cap (₹ Cr.)</th>
                    <th className="py-2 px-3 text-right">Div Yld %</th>
                    <th className="py-2 px-3 text-right">ROCE %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono">
                  {ratios.peers.map((p: any) => (
                    <tr key={p.name} className="hover:bg-gray-800/30">
                      <td className="py-2.5 pr-4 font-sans font-semibold text-gray-200">{p.name}</td>
                      <td className="py-2.5 px-3 text-right text-white">₹{p.cmp}</td>
                      <td className="py-2.5 px-3 text-right text-gray-300">{p.pe}</td>
                      <td className="py-2.5 px-3 text-right text-gray-300">₹{(p.marCap / 10000000).toFixed(0)}</td>
                      <td className="py-2.5 px-3 text-right text-gray-300">{p.divYield}%</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">{p.roce}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Shareholding Pattern Strip */}
          {ratios.shareholding && (
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Shareholding Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
                <div className="bg-[#0d1117] p-2.5 rounded-lg border border-gray-800">
                  <span className="text-gray-400 block text-[11px] font-sans">Promoters</span>
                  <span className="text-white font-bold text-sm mt-0.5 block">{ratios.shareholding.promoters}%</span>
                </div>
                <div className="bg-[#0d1117] p-2.5 rounded-lg border border-gray-800">
                  <span className="text-gray-400 block text-[11px] font-sans">FIIs</span>
                  <span className="text-white font-bold text-sm mt-0.5 block">{ratios.shareholding.fii}%</span>
                </div>
                <div className="bg-[#0d1117] p-2.5 rounded-lg border border-gray-800">
                  <span className="text-gray-400 block text-[11px] font-sans">DIIs</span>
                  <span className="text-white font-bold text-sm mt-0.5 block">{ratios.shareholding.dii}%</span>
                </div>
                <div className="bg-[#0d1117] p-2.5 rounded-lg border border-gray-800">
                  <span className="text-gray-400 block text-[11px] font-sans">Public</span>
                  <span className="text-white font-bold text-sm mt-0.5 block">{ratios.shareholding.public}%</span>
                </div>
                <div className="bg-[#0d1117] p-2.5 rounded-lg border border-gray-800">
                  <span className="text-gray-400 block text-[11px] font-sans">Government</span>
                  <span className="text-white font-bold text-sm mt-0.5 block">{ratios.shareholding.government}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Financial Statements */}
      {activeTab === 'financials' && financials && (
        <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4 overflow-x-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Profit & Loss Line Items ({freq})</h3>
          <div className="min-w-full">
            {financials.incomeStatement && Object.keys(financials.incomeStatement).length > 0 ? (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="py-2 pr-4">Metric</th>
                    {Object.keys(financials.incomeStatement).slice(0, 4).map((d) => (
                      <th key={d} className="py-2 px-3 font-mono">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono">
                  {['Total Revenue', 'Operating Income', 'Net Income'].map((metric) => (
                    <tr key={metric} className="hover:bg-gray-800/30">
                      <td className="py-2.5 pr-4 font-sans text-gray-300">{metric}</td>
                      {Object.keys(financials.incomeStatement).slice(0, 4).map((d) => {
                        const val = financials.incomeStatement[d]?.[metric];
                        return (
                          <td key={d} className="py-2.5 px-3 text-white">
                            {val ? `₹${(val / 10000000).toFixed(1)} Cr` : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-gray-500">Statements data loading or unavailable.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Quant Stats */}
      {activeTab === 'stats' && quantStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5">
              <p className="text-[11px] text-gray-400">Annual Volatility</p>
              <p className="text-xl font-bold font-mono text-white mt-1">{quantStats.annualizedVolatility}%</p>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5">
              <p className="text-[11px] text-gray-400">Sharpe Ratio (Rf=6.5%)</p>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{quantStats.sharpeRatio}</p>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5">
              <p className="text-[11px] text-gray-400">Max Drawdown (2Y)</p>
              <p className="text-xl font-bold font-mono text-rose-400 mt-1">{quantStats.maxDrawdown}%</p>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-3.5">
              <p className="text-[11px] text-gray-400">Historical VaR (95%)</p>
              <p className="text-xl font-bold font-mono text-amber-400 mt-1">{quantStats.var95}% / day</p>
            </div>
          </div>

          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-300 mb-2">2-Year Daily Returns Distribution</h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quantStats.returnsDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                  <XAxis dataKey="mid" stroke="#6b7280" fontSize={10} tickFormatter={(v) => `${v}%`} />
                  <YAxis stroke="#6b7280" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Calculators */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['sip', 'lumpsum', 'emi', 'fd'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setCalcType(t)}
                  className={`py-2 px-3 rounded-lg uppercase font-semibold transition-colors ${
                    calcType === t ? 'bg-zinc-800 text-white font-bold' : 'bg-[#0d1117] text-gray-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {calcType === 'sip' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Monthly Investment (₹)</label>
                  <input
                    type="number"
                    value={calcParams.monthlyInvestment}
                    onChange={(e) => setCalcParams({ ...calcParams, monthlyInvestment: Number(e.target.value) })}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Expected Return (% p.a.)</label>
                  <input
                    type="number"
                    value={calcParams.annualRate}
                    onChange={(e) => setCalcParams({ ...calcParams, annualRate: Number(e.target.value) })}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Years</label>
                  <input
                    type="number"
                    value={calcParams.years}
                    onChange={(e) => setCalcParams({ ...calcParams, years: Number(e.target.value) })}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 bg-[#161b22] border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
            <div className="space-y-4 font-mono">
              <span className="text-xs uppercase font-mono tracking-wider px-2 py-1 rounded bg-zinc-800 text-gray-300">
                {calcType.toUpperCase()} Projections
              </span>
              {calcResult?.maturityValue && (
                <div>
                  <p className="text-xs text-gray-400 font-sans mt-2">Maturity Value</p>
                  <p className="text-3xl font-extrabold text-white mt-1">₹{calcResult.maturityValue.toLocaleString()}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800 text-xs">
                <div>
                  <p className="text-gray-500 font-sans">Invested Amount</p>
                  <p className="text-gray-300 font-semibold mt-0.5">
                    ₹{(calcResult?.totalInvested || calcResult?.principal || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-sans">Wealth Gain</p>
                  <p className="text-emerald-400 font-semibold mt-0.5">
                    ₹{(calcResult?.wealthGain || calcResult?.totalInterest || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
