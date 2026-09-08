import React from 'react';
import MetricCards from '../components/MetricCards';
import ActiveLotsTable from '../components/ActiveLotsTable';
import SellHistoryTable from '../components/SellHistoryTable';
import FifoRuleBanner from '../components/FifoRuleBanner';
import { PlusCircle, ArrowUpRight, RefreshCw } from 'lucide-react';

export default function Dashboard({ 
  portfolio, 
  loading, 
  onRefresh, 
  onOpenBuy, 
  onOpenSell 
}) {
  const { metrics, activeLots = [], sellHistory = [] } = portfolio || {};

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Mutual Fund Portfolio & FIFO Tax Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track purchase lots, FIFO redemption allocation, and Indian Capital Gains (&gt;365 days = LTCG).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Portfolio"
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={onOpenBuy}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buy Units</span>
          </button>

          <button
            onClick={onOpenSell}
            disabled={activeLots.length === 0}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Redeem (FIFO)</span>
          </button>
        </div>
      </div>

      <FifoRuleBanner />

      <MetricCards metrics={metrics} />

      <ActiveLotsTable activeLots={activeLots} />

      <SellHistoryTable sellHistory={sellHistory} />
    </div>
  );
}
