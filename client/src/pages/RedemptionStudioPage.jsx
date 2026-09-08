import React from 'react';
import ActiveLotsTable from '../components/ActiveLotsTable';
import FifoRuleBanner from '../components/FifoRuleBanner';
import { ArrowUpRight, Sparkles, Layers, ShieldCheck } from 'lucide-react';

export default function RedemptionStudioPage({ portfolio, onOpenSell, onOpenBuy }) {
  const { activeLots = [], sellHistory = [] } = portfolio || {};

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-rose-400" />
            <span>Redemption Studio & FIFO Simulator</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Plan your redemption strategy, simulate multi-lot FIFO consumption, and preview capital gains tax liability before executing.
          </p>
        </div>

        <button
          onClick={onOpenSell}
          disabled={activeLots.length === 0}
          className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-40"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Launch Redemption Simulator</span>
        </button>
      </div>

      <FifoRuleBanner />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5">
          <div className="text-xs text-slate-400 uppercase font-semibold">1. Queue Inspection</div>
          <div className="text-base font-bold text-white mt-2">Oldest Lot First</div>
          <p className="text-xs text-slate-400 mt-1">
            Lots at top of the queue are consumed first. Check holding periods to see which units qualify for LTCG (&gt;365 days).
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5">
          <div className="text-xs text-slate-400 uppercase font-semibold">2. Live Simulation</div>
          <div className="text-base font-bold text-white mt-2">Multi-Lot Spanning</div>
          <p className="text-xs text-slate-400 mt-1">
            If your sale exceeds the oldest lot, the engine automatically draws the remaining units from the next lot in line.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5">
          <div className="text-xs text-slate-400 uppercase font-semibold">3. Capital Gains Split</div>
          <div className="text-base font-bold text-white mt-2">LTCG vs STCG</div>
          <p className="text-xs text-slate-400 mt-1">
            Get instant breakdown of short-term gains (held ≤365d) vs long-term gains (held &gt;365d) for complete tax clarity.
          </p>
        </div>
      </div>

      <ActiveLotsTable activeLots={activeLots} />
    </div>
  );
}
