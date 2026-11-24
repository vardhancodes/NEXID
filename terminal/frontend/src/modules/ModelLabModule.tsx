import React, { useState } from 'react';
import { runMLExperiment } from '../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Play } from 'lucide-react';

interface ModelLabModuleProps {
  ticker: string;
}

export const ModelLabModule: React.FC<ModelLabModuleProps> = ({ ticker }) => {
  const [model, setModel] = useState<'random_forest' | 'gradient_boosting' | 'extra_trees' | 'ridge' | 'elastic_net' | 'knn' | 'svr'>('random_forest');
  const [target, setTarget] = useState<'price_1d' | 'price_5d' | 'price_10d' | 'direction_1d'>('price_5d');
  const [timeframe, setTimeframe] = useState<'1Y' | '2Y' | '5Y'>('2Y');
  const [trainSplit, setTrainSplit] = useState(75);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Custom Hyperparameters
  const [nEstimators, setNEstimators] = useState(100);
  const [maxDepth, setMaxDepth] = useState(6);
  const [learningRate, setLearningRate] = useState(0.1);
  const [alpha, setAlpha] = useState(1.0);
  const [kNeighbors, setKNeighbors] = useState(5);

  // Editable Feature Configurations
  const [featureConfig, setFeatureConfig] = useState({
    lags: [1, 3, 5],
    smaWindows: [10, 50],
    useRsi: true,
    rsiPeriod: 14,
    useVolatility: true,
    volWindow: 10,
    useVolume: true,
    useSpread: true,
  });

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await runMLExperiment({
        ticker,
        timeframe,
        target,
        model,
        train_split_pct: trainSplit / 100,
        hyperparameters: {
          n_estimators: nEstimators,
          max_depth: maxDepth,
          learning_rate: learningRate,
          alpha,
          n_neighbors: kNeighbors,
        },
        feature_config: featureConfig,
        market: 'NSE',
      });
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Quantitative ML Playground & Model Customizer</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Live scikit-learn models trained strictly on chronological data (zero forward look-ahead bias).
            </p>
          </div>
          <button
            onClick={handleRun}
            disabled={loading}
            className="flex items-center space-x-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all disabled:opacity-50"
          >
            <Play size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Fitting & Evaluating Model...' : `Train & Backtest on ${ticker}`}</span>
          </button>
        </div>

        {/* Primary Model & Data Split Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-gray-400 block mb-1">Architecture</label>
            <select
              value={model}
              onChange={(e: any) => setModel(e.target.value)}
              className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2 text-white"
            >
              <option value="random_forest">Random Forest Regressor</option>
              <option value="gradient_boosting">Gradient Boosting (GBM)</option>
              <option value="extra_trees">Extra Trees Ensemble</option>
              <option value="ridge">Ridge Regression (L2 Regularized)</option>
              <option value="elastic_net">ElasticNet (L1 + L2)</option>
              <option value="knn">k-Nearest Neighbors (k-NN)</option>
              <option value="svr">Support Vector Regressor (SVR)</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Target Formulation</label>
            <select
              value={target}
              onChange={(e: any) => setTarget(e.target.value)}
              className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2 text-white"
            >
              <option value="price_5d">Price 5-Days Ahead (Continuous)</option>
              <option value="price_1d">Next-Day Close Price</option>
              <option value="price_10d">Price 10-Days Ahead</option>
              <option value="direction_1d">Next-Day Direction (Binary Up/Down)</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Historical Window</label>
            <select
              value={timeframe}
              onChange={(e: any) => setTimeframe(e.target.value)}
              className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2 text-white"
            >
              <option value="1Y">1 Year Lookback (~252 bars)</option>
              <option value="2Y">2 Years Lookback (~504 bars)</option>
              <option value="5Y">5 Years Lookback (~1260 bars)</option>
            </select>
          </div>

          {/* Train/Test Data Split Slider */}
          <div>
            <div className="flex justify-between items-center text-gray-400 mb-1">
              <span>Train/Test Ratio</span>
              <span className="font-mono text-emerald-400">{trainSplit}% Train / {100 - trainSplit}% Test</span>
            </div>
            <input
              type="range"
              min={50}
              max={90}
              step={5}
              value={trainSplit}
              onChange={(e) => setTrainSplit(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Hyperparameter Sliders */}
        <div className="pt-3 border-t border-gray-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          {(model === 'random_forest' || model === 'gradient_boosting' || model === 'extra_trees') && (
            <>
              <div>
                <label className="text-gray-400 block mb-1 text-[11px] font-sans">N Estimators ({nEstimators})</label>
                <input
                  type="range"
                  min={20}
                  max={300}
                  step={20}
                  value={nEstimators}
                  onChange={(e) => setNEstimators(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1 text-[11px] font-sans">Max Depth ({maxDepth})</label>
                <input
                  type="range"
                  min={2}
                  max={15}
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </>
          )}

          {model === 'gradient_boosting' && (
            <div>
              <label className="text-gray-400 block mb-1 text-[11px] font-sans">Learning Rate ({learningRate})</label>
              <input
                type="range"
                min={0.01}
                max={0.5}
                step={0.02}
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          )}

          {(model === 'ridge' || model === 'elastic_net') && (
            <div>
              <label className="text-gray-400 block mb-1 text-[11px] font-sans">Regularization Alpha ({alpha})</label>
              <input
                type="range"
                min={0.1}
                max={10}
                step={0.5}
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          )}

          {model === 'knn' && (
            <div>
              <label className="text-gray-400 block mb-1 text-[11px] font-sans">Neighbors k ({kNeighbors})</label>
              <input
                type="range"
                min={2}
                max={25}
                value={kNeighbors}
                onChange={(e) => setKNeighbors(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Feature Toggles & Custom Windows */}
        <div className="pt-3 border-t border-gray-800/80 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-gray-400 text-[11px]">Feature Engineering:</span>
          <button
            onClick={() => setFeatureConfig({ ...featureConfig, useRsi: !featureConfig.useRsi })}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono ${
              featureConfig.useRsi ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' : 'bg-gray-800 text-gray-500 border-gray-700'
            }`}
          >
            RSI ({featureConfig.rsiPeriod}d) {featureConfig.useRsi ? '✓' : '✗'}
          </button>
          <button
            onClick={() => setFeatureConfig({ ...featureConfig, useVolatility: !featureConfig.useVolatility })}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono ${
              featureConfig.useVolatility ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' : 'bg-gray-800 text-gray-500 border-gray-700'
            }`}
          >
            Rolling Volatility ({featureConfig.volWindow}d) {featureConfig.useVolatility ? '✓' : '✗'}
          </button>
          <button
            onClick={() => setFeatureConfig({ ...featureConfig, useVolume: !featureConfig.useVolume })}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono ${
              featureConfig.useVolume ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' : 'bg-gray-800 text-gray-500 border-gray-700'
            }`}
          >
            Volume Shift {featureConfig.useVolume ? '✓' : '✗'}
          </button>
          <button
            onClick={() => setFeatureConfig({ ...featureConfig, useSpread: !featureConfig.useSpread })}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono ${
              featureConfig.useSpread ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' : 'bg-gray-800 text-gray-500 border-gray-700'
            }`}
          >
            High/Low Spread {featureConfig.useSpread ? '✓' : '✗'}
          </button>
        </div>
      </div>

      {/* Model Output & Walk-Forward Charts */}
      {results && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
              <p className="text-[11px] text-gray-400">Directional Accuracy</p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {results.metrics.directionalAccuracy}%
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Held-out test window</p>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
              <p className="text-[11px] text-gray-400">Model MAE</p>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                ₹{results.metrics.mae}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Mean absolute error</p>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
              <p className="text-[11px] text-gray-400">Naive Baseline MAE</p>
              <p className="text-2xl font-bold font-mono text-gray-400 mt-1">
                ₹{results.metrics.baselineMae}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Zero-change assumption</p>
            </div>
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
              <p className="text-[11px] text-gray-400">Delta vs Baseline</p>
              <p className={`text-2xl font-bold font-mono mt-1 ${results.metrics.deltaVsBaselinePct > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {results.metrics.deltaVsBaselinePct > 0 ? `+${results.metrics.deltaVsBaselinePct}%` : `${results.metrics.deltaVsBaselinePct}%`}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Outperformance margin</p>
            </div>
          </div>

          {/* Held-Out Predicted vs Actual Chart */}
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3 text-xs">
              <span className="font-semibold text-white">Held-Out Test Window (Predicted vs Actual vs Baseline)</span>
              <span className="text-gray-400 font-mono text-[11px]">
                {results.split.testCount} Test Samples ({results.split.testPct}%)
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.chartSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#6b7280" fontSize={10} orientation="right" domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', fontSize: '11px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={false} name="Actual Price" />
                  <Line type="monotone" dataKey="predicted" stroke="#38bdf8" strokeWidth={2} dot={false} name="Model Prediction" />
                  <Line type="monotone" dataKey="baseline" stroke="#6b7280" strokeWidth={1} strokeDasharray="3 3" dot={false} name="Naive Baseline" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feature Importances */}
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-300 mb-3">Feature Importance & Weight Distribution</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.featureImportance.map((fi: any) => (
                <div key={fi.feature} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-300">{fi.feature}</span>
                    <span className="text-emerald-400">{fi.importance}%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(fi.importance, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
