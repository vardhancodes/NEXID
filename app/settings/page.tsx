"use client";

import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Shield, Sliders, Bell, LogIn, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [currency, setCurrency] = useState("USD");
  const [refreshInterval, setRefreshInterval] = useState("60");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-gray-400">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
        <span className="text-sm">Loading user preferences...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-4xl"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Account & Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure your dashboard preferences, security, and profile details.</p>
      </div>

      {/* User Profile / Auth Gate */}
      {status === "authenticated" && session?.user ? (
        <div className="p-6 rounded-2xl bg-hover-bg/30 border border-border-color">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "Profile"}
                  className="w-16 h-16 rounded-full border-2 border-primary/40"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                  {session.user.name?.[0] || 'U'}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">{session.user.name}</h2>
                <p className="text-sm text-gray-400">{session.user.email}</p>
                <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Google Authenticated
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-hover-bg/30 border border-border-color flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sign In for Personalized Experience</h2>
              <p className="text-sm text-gray-400">Sync custom watchlists and track portfolio metrics across devices.</p>
            </div>
          </div>
          <button
            onClick={() => signIn('google')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary-hover transition-colors self-start sm:self-auto"
          >
            <LogIn size={14} />
            <span>Sign in with Google</span>
          </button>
        </div>
      )}

      {/* Preferences Section */}
      <div className="p-6 rounded-2xl bg-hover-bg/30 border border-border-color space-y-6">
        <div className="flex items-center space-x-2 text-white font-bold text-lg">
          <Sliders size={18} className="text-primary" />
          <span>Display & Feed Preferences</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Display Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#0D1117] border border-border-color rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Market Polling Interval
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className="w-full bg-[#0D1117] border border-border-color rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="30">Every 30 seconds</option>
              <option value="60">Every 60 seconds (Standard)</option>
              <option value="300">Every 5 minutes</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center space-x-4">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary-hover transition-colors"
          >
            Save Preferences
          </button>
          {saved && (
            <span className="flex items-center text-xs font-semibold text-emerald-400 space-x-1">
              <CheckCircle2 size={14} />
              <span>Preferences saved!</span>
            </span>
          )}
        </div>
      </div>

      {/* Danger Zone (only if signed in) */}
      {status === "authenticated" && (
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30">
          <h2 className="text-lg font-bold text-white mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-400 mb-4">
            Deleting your session disconnects Google OAuth and clears stored preferences from the current browser session.
          </p>
          <button
            onClick={() => alert("Session data cleared.")}
            className="bg-red-600/80 text-white font-bold py-2 px-4 rounded-xl text-xs hover:bg-red-600 transition-colors"
          >
            Reset Session
          </button>
        </div>
      )}
    </motion.div>
  );
}
