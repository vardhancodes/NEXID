"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

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
          // New: Tries to read the specific error message from the backend
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to load news feed. Please try again later.');
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
    return articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, articles]);

  return (
    <motion.div>
      <div className="mb-8">
        {/* New: Updated title and description */}
        <h1 className="text-3xl font-bold text-white mb-2">Cryptocurrency News</h1>
        <p className="text-gray-400">The latest headlines from the world of crypto.</p>
      </div>
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {/* New: Updated placeholder text */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search crypto news articles..."
          className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-border-color bg-hover-bg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        />
      </div>
      <div>
        {isLoading && <p className="text-center text-gray-400 mt-10">Loading Latest News...</p>}
        {/* The error message displayed here will now be more specific */}
        {error && <p className="text-center text-red-500 mt-10">Error: {error}</p>}
        {!isLoading && !error && filteredArticles.map((article, index) => (
          <a key={index} href={article.url} target="_blank" rel="noopener noreferrer" className="block bg-hover-bg border border-border-color rounded-lg p-4 mb-4 hover:border-primary transition-colors">
            <div className="flex flex-col md:flex-row gap-4">
              <img src={article.imageUrl} alt={article.title} className="w-full md:w-48 h-32 object-cover rounded-md" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{article.title}</h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{article.description}</p>
                 <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500 uppercase font-semibold">{article.site}</p>
                    <p className="text-xs text-gray-500">{new Date(article.publishedTime).toLocaleString()}</p>
                 </div>
              </div>
            </div>
          </a>
        ))}
         {!isLoading && !error && articles.length === 0 && (
          <div className="text-center py-20">
             <h3 className="text-xl font-semibold text-white">Could Not Load News</h3>
             <p className="text-gray-400 mt-2">There may be a temporary issue with the news API.</p>
           </div>
        )}
      </div>
    </motion.div>
  );
}