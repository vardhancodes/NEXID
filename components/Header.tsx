// components/Header.tsx
import React from 'react';
import { Bell } from 'lucide-react';
import AuthButtons from './AuthButtons';

const Header = () => {
  return (
    <header className="bg-background border-b border-border-color p-4">
      <div className="flex items-center justify-between">
        {/* The NEXID logo/title can go here if you want */}
        <div className="text-white text-xl font-bold">
          NEXID
        </div>

        {/* Right-side Icons & Profile */}
        <div className="flex items-center space-x-6">
          <button className="relative text-gray-400 hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
          </button>
          
          <AuthButtons />
        </div>
      </div>
    </header>
  );
};

export default Header;