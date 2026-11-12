"use client";

import { motion } from 'framer-motion';
import { HelpCircle, Key, Activity, RefreshCw, Shield, Terminal, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const faqs = [
    {
      q: "Where does the market data come from?",
      a: "NEXID integrates with Financial Modeling Prep (FMP) APIs when configured via `FMP_API_KEY`. When running in standalone/demo mode without API credentials, NEXID automatically activates its high-precision local crypto dataset to ensure uninterrupted operation.",
    },
    {
      q: "How often is data refreshed?",
      a: "Quotes are revalidated every 60 seconds. You can trigger an instant cache refresh at any time using the 'Refresh Data' button on the Market Overview page.",
    },
    {
      q: "How does Google authentication work?",
      a: "NEXID uses NextAuth.js. When `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are configured, users can log in via Google. Session data can optionally stream to BigQuery for user analytics.",
    },
    {
      q: "Can I inspect historical price charts?",
      a: "Yes! Click any cryptocurrency card on the Dashboard or Crypto page to open the interactive 100-day price trend modal, or click 'Full View' for the dedicated analytics route.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-4xl"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Help & Documentation</h1>
        <p className="text-gray-400 text-sm mt-1">Platform architecture, environment setup, and feature guide for NEXID.</p>
      </div>

      {/* Quick Setup Card */}
      <div className="p-6 rounded-2xl bg-hover-bg/30 border border-border-color space-y-4">
        <div className="flex items-center space-x-2 text-primary font-bold text-sm">
          <Terminal size={18} />
          <span>Quick Environment Setup</span>
        </div>
        <p className="text-gray-300 text-sm">
          To connect live external feeds and authentication services, configure the following keys in your <code className="text-emerald-400 bg-black/40 px-1.5 py-0.5 rounded text-xs">.env.local</code> file:
        </p>
        <div className="bg-black/50 p-4 rounded-xl border border-border-color font-mono text-xs text-gray-300 space-y-1">
          <p><span className="text-purple-400">FMP_API_KEY</span>=your_fmp_financial_key</p>
          <p><span className="text-purple-400">NEXTAUTH_SECRET</span>=generate_with_openssl_rand_base64_32</p>
          <p><span className="text-purple-400">GOOGLE_CLIENT_ID</span>=your_google_oauth_client_id</p>
          <p><span className="text-purple-400">GOOGLE_CLIENT_SECRET</span>=your_google_oauth_client_secret</p>
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 gap-4">
          {faqs.map((item, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-hover-bg/20 border border-border-color">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <HelpCircle size={16} className="text-primary flex-shrink-0" />
                <span>{item.q}</span>
              </h3>
              <p className="text-sm text-gray-400 mt-2 pl-6 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub Repo Reference */}
      <div className="p-6 rounded-2xl bg-hover-bg/30 border border-border-color flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Source Code & Contributions</h3>
          <p className="text-xs text-gray-400 mt-1">Found a bug or want to contribute new analytics widgets?</p>
        </div>
        <a
          href="https://github.com/vardhancodes/NEXID"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 px-4 py-2 rounded-lg bg-primary text-black font-bold text-xs hover:bg-primary-hover transition-colors"
        >
          <span>GitHub Repo</span>
          <ArrowUpRight size={14} />
        </a>
      </div>
    </motion.div>
  );
}
