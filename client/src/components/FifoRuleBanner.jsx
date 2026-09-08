import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Clock, Scale, Layers } from 'lucide-react';

export default function FifoRuleBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Indian Capital Gains Taxation & FIFO Engine
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Rule 112A / 111A
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Under Indian Income Tax rules, mutual fund redemptions strictly follow <strong>FIFO (First-In, First-Out)</strong>: units bought earliest are redeemed first. Holding period &gt;365 days qualifies as LTCG; ≤365 days is STCG.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="self-end sm:self-center text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
        >
          <span>{expanded ? 'Hide Details' : 'Learn How It Works'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>FIFO Lot Consumption</span>
            </div>
            <p className="text-slate-400">
              When you sell, the engine chronologically sorts all open purchase lots. It consumes units from the oldest lot first until exhausted, then seamlessly transitions to subsequent lots.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-2 text-purple-300 font-semibold mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>LTCG (&gt; 365 Days)</span>
            </div>
            <p className="text-slate-400">
              Units held for strictly <strong>more than 365 calendar days</strong> between purchase and redemption date qualify as Long-Term Capital Gains, receiving favorable equity tax treatment under Section 112A.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold mb-1">
              <Scale className="w-3.5 h-3.5" />
              <span>STCG (≤ 365 Days)</span>
            </div>
            <p className="text-slate-400">
              Units held for <strong>365 days or fewer</strong> are classified as Short-Term Capital Gains (Section 111A). The engine computes exact gain/loss for each tranche consumed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
