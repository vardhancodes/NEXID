"use client";

import { useState, useEffect, useRef } from 'react';
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

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Show loading spinner immediately when user starts typing
    if (searchTerm.trim()) {
      setIsLoading(true);
    }

    // Debounce: Wait for 500ms after user stops typing
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    searchTimeout.current = setTimeout(() => {
      const fetchNews = async () => {
        // Set loading to true only before the actual fetch
        setIsLoading(true); 
        setError(null);
        try {
          const response = await fetch(`/api/news?search=${searchTerm.trim()}`);
          if (!response.ok) throw new Error('Could not fetch news. Please try again later.');
          const data = await response.json();
          setArticles(Array.isArray(data) ? data : []);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchNews();
    }, 500);

  }, [searchTerm]);

  return (
    <motion.div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Financial News</h1>
        <p className="text-gray-400">Top headlines, or search for news on a specific stock.</p>
      </div>
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search news for a company or ticker (e.g., Apple, TSLA)..."
          className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-border-color bg-hover-bg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        />
      </div>
      <div>
        {isLoading && <p className="text-center text-gray-400 mt-10">Loading News...</p>}
        {error && <p className="text-center text-red-500 mt-10">{error}</p>}
        {!isLoading && !error && articles.map((article, index) => (
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
             <h3 className="text-xl font-semibold text-white">
               {searchTerm ? `No news found for "${searchTerm}"` : "Top Headlines"}
             </h3>
             <p className="text-gray-400 mt-2">
               {searchTerm ? "Try another search." : "Search for a company to see specific news."}
             </p>
           </div>
        )}
      </div>
    </motion.div>
  );
}
