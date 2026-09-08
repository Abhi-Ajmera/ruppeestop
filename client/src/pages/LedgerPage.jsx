import React from 'react';
import SellHistoryTable from '../components/SellHistoryTable';
import { History, Award, Scale, FileText } from 'lucide-react';

export default function LedgerPage({ portfolio }) {
  const { metrics, sellHistory = [] } = portfolio || {};
  const { totalRealizedGains = 0, totalSTCG = 0, totalLTCG = 0, totalUnitsSold = 0 } = metrics || {};

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-purple-400" />
            <span>Capital Gains Tax Ledger & Audit Trail</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical record of all mutual fund redemptions, FIFO lot consumptions, holding days, and tax liabilities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Realized Gain</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-emerald-400">
              ₹{totalRealizedGains.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Total Units Sold: <span className="font-mono text-white">{totalUnitsSold.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">LTCG (&gt;365 Days)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-purple-300">
              ₹{totalLTCG.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Taxed under Section 112A
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">STCG (≤365 Days)</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-cyan-300">
              ₹{totalSTCG.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Taxed under Section 111A
            </div>
          </div>
        </div>
      </div>

      <SellHistoryTable sellHistory={sellHistory} />
    </div>
  );
}
