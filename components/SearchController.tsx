// components/SearchController.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';

type SearchResult = {
  symbol: string;
  name: string;
};

export default function SearchController() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setIsOpen(true);
      const response = await fetch(`/api/search?query=${query}`);
      const data = await response.json();
      
      // --- LOG 3: See what data the component receives ---
      console.log("Data received in Search Component:", data);

      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults([]); // Safety net
      }
      setIsLoading(false);
    };

    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/stock/${symbol}`);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length > 1 && setIsOpen(true)}
        placeholder="Search all stocks (e.g., Microsoft, MSFT)..."
        className="bg-hover-bg text-white placeholder-gray-400 w-full pl-12 pr-4 py-3 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {isLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />}

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border border-border-color rounded-lg shadow-lg z-20">
          <ul>
            {results.map((stock) => (
              <li
                key={stock.symbol}
                onClick={() => handleSelect(stock.symbol)}
                className="px-4 py-3 cursor-pointer hover:bg-hover-bg border-b border-border-color last:border-b-0"
              >
                <p className="font-bold text-white">{stock.symbol}</p>
                <p className="text-sm text-gray-400 truncate">{stock.name}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {isOpen && results.length === 0 && !isLoading && query.length > 1 && (
        <div className="absolute top-full mt-2 w-full bg-background border border-border-color rounded-lg shadow-lg z-20">
            <p className="px-4 py-3 text-gray-400">No results found for "{query}".</p>
        </div>
      )}
    </div>
  );
}