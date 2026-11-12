"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Calendar, Newspaper } from 'lucide-react';

type Article = {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  publishedTime: string;
  site: string;
};

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Failed to load news feed.');
        }
        const data = await response.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return articles;
    const term = searchTerm.toLowerCase();
    return articles.filter(
      article =>
        (article.title && article.title.toLowerCase().includes(term)) ||
        (article.description && article.description.toLowerCase().includes(term)) ||
        (article.site && article.site.toLowerCase().includes(term))
    );
  }, [searchTerm, articles]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Cryptocurrency News</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time headlines, regulatory developments, and market intelligence.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter news by keyword, protocol, or publisher..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-color bg-hover-bg/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-hover-bg"
          >
            Clear
          </button>
        )}
      </div>

      <div>
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 rounded-xl bg-hover-bg/30 border border-border-color animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="p-6 rounded-xl bg-red-950/30 border border-red-500/30 text-center">
            <p className="text-rose-400 font-semibold text-sm">Error: {error}</p>
          </div>
        )}

        {!isLoading && !error && filteredArticles.length > 0 && (
          <div className="space-y-4">
            {filteredArticles.map((article, index) => (
              <a
                key={index}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-hover-bg/30 border border-border-color rounded-xl p-5 hover:border-primary/50 transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-5 items-start">
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full md:w-56 h-36 object-cover rounded-lg flex-shrink-0 bg-gray-800"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        {article.site || 'Crypto Feed'}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{new Date(article.publishedTime).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-primary transition-colors mt-1.5 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1.5 line-clamp-2">
                      {article.description}
                    </p>

                    <div className="mt-3 flex items-center text-xs text-gray-400 group-hover:text-primary transition-colors">
                      <span>Read article</span>
                      <ExternalLink size={12} className="ml-1" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {!isLoading && !error && filteredArticles.length === 0 && (
          <div className="text-center py-20 bg-hover-bg/20 rounded-2xl border border-border-color">
            <Newspaper className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">No News Stories Found</h3>
            <p className="text-gray-400 text-sm mt-1">Try searching for other digital asset topics.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
