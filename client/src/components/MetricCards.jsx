import React from 'react';
import { Wallet, PieChart, ArrowUpRight, ArrowDownRight, Award, Clock } from 'lucide-react';

export default function MetricCards({ metrics }) {
  const {
    totalUnitsHeld = 0,
    totalInvestedActiveBasis = 0,
    currentPortfolioValue = 0,
    unrealizedGain = 0,
    totalRealizedGains = 0,
    totalSTCG = 0,
    totalLTCG = 0,
    activeLotsCount = 0
  } = metrics || {};

  const isRealizedPositive = totalRealizedGains >= 0;
  const isUnrealizedPositive = unrealizedGain >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Holding Balance</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {totalUnitsHeld.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">units</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{activeLotsCount} active purchase lot{activeLotsCount === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Cost Basis</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            ₹{totalInvestedActiveBasis.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Current Est. Value: <span className="text-slate-200 font-mono">₹{currentPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Realized P&L (Sold)</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isRealizedPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {isRealizedPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-2xl font-bold font-mono tracking-tight flex items-baseline gap-1 ${
            isRealizedPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            <span>{isRealizedPositive ? '+' : ''}₹{totalRealizedGains.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Booked via FIFO redemptions
          </div>
        </div>
      </div>

      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tax Split (Section 112A/111A)</span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-purple-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              LTCG (&gt;365d):
            </span>
            <span className="font-mono font-semibold text-white">
              ₹{totalLTCG.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              STCG (≤365d):
            </span>
            <span className="font-mono font-semibold text-white">
              ₹{totalSTCG.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
