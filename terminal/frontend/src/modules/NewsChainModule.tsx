import React, { useState, useEffect } from 'react';
import { fetchNewsChain, fetchLiveNews } from '../services/api';
import { ExternalLink, Tag } from 'lucide-react';

interface NewsChainModuleProps {
  ticker: string;
}

export const NewsChainModule: React.FC<NewsChainModuleProps> = ({ ticker }) => {
  const [chainData, setChainData] = useState<any>(null);
  const [liveArticles, setLiveArticles] = useState<any[]>([]);
  const [filterTag, setFilterTag] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchNewsChain(ticker),
      fetchLiveNews('all', ticker),
    ])
      .then(([chain, news]) => {
        setChainData(chain);
        setLiveArticles(news);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ticker]);

  const filteredNews = liveArticles.filter(
    (a) => filterTag === 'all' || a.tags?.includes(filterTag)
  );

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <span>Causal News Event Sequence & Impact Study</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-gray-300">
              Verified Links
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Chronologically validated event propagation linking real news to the observed market move on {ticker}.
          </p>
        </div>

        {chainData?.eventStudy && (
          <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-3 text-right font-mono text-xs">
            <p className="text-gray-400 uppercase text-[10px]">5-Day Event Alpha</p>
            <p className="text-base font-bold text-emerald-400 mt-0.5">
              {chainData.eventStudy.alphaExcessPct > 0 ? `+${chainData.eventStudy.alphaExcessPct}%` : `${chainData.eventStudy.alphaExcessPct}%`}
            </p>
            <p className="text-[11px] text-gray-400 font-sans mt-0.5">{chainData.eventStudy.conclusion}</p>
          </div>
        )}
      </div>

      {/* Causal Chain Timeline */}
      <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">
          Propagated Causal Event Sequence
        </h3>

        {chainData?.chain && (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
            {chainData.chain.map((item: any) => (
              <div key={item.step} className="relative group">
                <span className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-[#161b22]" />
                <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white uppercase text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800">
                        Step {item.step}: {item.relationType}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        item.confidence === 'Supported' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-gray-400'
                      }`}>
                        {item.confidence}
                      </span>
                    </div>
                    <span className="text-gray-500 text-[11px] font-mono">{item.timestamp}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-gray-200 mt-1">{item.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{item.summary}</p>

                  <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 text-gray-400">
                      <Tag size={12} className="text-gray-500" />
                      <span>{item.tags?.join(', ')}</span>
                    </div>
                    <a
                      href={item.citation.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      <span>{item.citation.source}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Filterable Feed */}
      <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Targeted News Feed</h3>
          <div className="flex items-center space-x-1 text-[11px]">
            {['all', 'Bullish', 'Bearish', 'Regulatory', 'Macro', 'Earnings'].map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filterTag === tag ? 'bg-zinc-800 text-white font-semibold' : 'text-gray-400 hover:text-white bg-[#0d1117]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-800">
          {filteredNews.map((art, idx) => (
            <div key={idx} className="py-3 flex items-start justify-between gap-4">
              <div>
                <a
                  href={art.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-gray-200 hover:text-emerald-400 transition-colors"
                >
                  {art.title}
                </a>
                <div className="flex items-center space-x-3 text-[10px] text-gray-500 mt-1">
                  <span>{art.source}</span>
                  <span>•</span>
                  <span>{art.pubDate}</span>
                </div>
              </div>
              <div className="flex space-x-1 shrink-0">
                {art.tags?.map((t: string) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
