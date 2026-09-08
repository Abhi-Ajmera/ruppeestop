import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { TrendingUp, Layers, History, RefreshCw, Trash2, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function Navbar({ onReset, onClear, isResetting }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-lg text-emerald-400 font-mono">₹</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">RupeeStop</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  FIFO Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Indian Capital Gains Tax</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-800/80 text-emerald-400 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`
              }
            >
              <TrendingUp className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/redemption"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-800/80 text-emerald-400 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`
              }
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Redemption Studio</span>
            </NavLink>

            <NavLink
              to="/ledger"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-800/80 text-emerald-400 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`
              }
            >
              <History className="w-4 h-4" />
              <span>Tax Ledger</span>
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              disabled={isResetting}
              title="Reset to realistic demo mutual fund lots"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Demo Lots</span>
            </button>

            <button
              onClick={onClear}
              disabled={isResetting}
              title="Clear all portfolio records for blank slate testing"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
