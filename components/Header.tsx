// components/Header.tsx
import React from 'react';
import { Search, Bell } from 'lucide-react';
import AuthButtons from './AuthButtons'; // Import the new component

const Header = () => {
  return (
    <header className="bg-background border-b border-border-color p-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stocks, news..."
            className="bg-hover-bg text-white placeholder-gray-400 w-64 pl-10 pr-4 py-2 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Right-side Icons & Profile */}
        <div className="flex items-center space-x-6">
          <button className="relative text-gray-400 hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
          </button>
          
          {/* Replace the static user profile with our dynamic AuthButtons component */}
          <AuthButtons />
        </div>
      </div>
    </header>
  );
};

export default Header;