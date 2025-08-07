// components/Sidebar.tsx
"use client"; // <-- Add this to use client-side hooks

import React from 'react';
import Link from 'next/link'; // Import the Link component
import { usePathname } from 'next/navigation'; // Import hook to get current path
import {
  LayoutDashboard,
  CandlestickChart,
  Newspaper,
  ShieldCheck,
  Settings,
  HelpCircle,
} from 'lucide-react';

type NavLinkData = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const navLinks: NavLinkData[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/stocks', label: 'Stocks', icon: CandlestickChart },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/predictions', label: 'Predictions', icon: ShieldCheck },
];

const bottomLinks: NavLinkData[] = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

const Sidebar = () => {
  const pathname = usePathname(); // Get the current URL path

  const NavLink = ({ href, label, icon: Icon }: NavLinkData) => {
    const isActive = pathname === href;
    return (
      <li className="mb-2">
        <Link
          href={href}
          className={`flex items-center p-3 text-base font-normal rounded-lg transition-colors duration-200 
            ${isActive 
              ? 'bg-primary text-white' 
              : 'text-gray-300 hover:bg-hover-bg hover:text-white'
            }`}
        >
          <Icon className="w-5 h-5" />
          <span className="ml-4">{label}</span>
        </Link>
      </li>
    );
  };

  return (
    <aside className="w-64 flex flex-col bg-background border-r border-border-color p-4">
      <div className="text-white text-2xl font-bold mb-10">
        <Link href="/">NEXID</Link>
      </div>
      
      <nav className="flex-grow">
        <ul>
          {navLinks.map((link) => (
            <NavLink key={link.label} {...link} />
          ))}
        </ul>
      </nav>

      <div>
        <ul>
          {bottomLinks.map((link) => (
            <NavLink key={link.label} {...link} />
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;