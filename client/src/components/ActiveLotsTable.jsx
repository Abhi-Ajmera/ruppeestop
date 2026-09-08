import React from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Layers, Calendar, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function ActiveLotsTable({ activeLots = [], onSellLot }) {
  const today = new Date();

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Active Purchase Lots (FIFO Queue)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ordered by purchase date (oldest lots at top will be redeemed first upon sale)
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 self-start sm:self-auto">
          {activeLots.length} Active Tranche{activeLots.length === 1 ? '' : 's'}
        </span>
      </div>

      {activeLots.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800/60 text-slate-500 mx-auto flex items-center justify-center mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-300">No active purchase lots</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You do not currently hold any units. Click "Buy More Units" or reset demo data to add purchase lots.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="py-3.5 px-4">FIFO Order / Fund</th>
                <th className="py-3.5 px-4">Buy Date</th>
                <th className="py-3.5 px-4">Buy NAV</th>
                <th className="py-3.5 px-4">Units (Remaining / Total)</th>
                <th className="py-3.5 px-4">Holding Period</th>
                <th className="py-3.5 px-4">Tax Status Today</th>
                <th className="py-3.5 px-4 text-right">Active Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {activeLots.map((lot, index) => {
                const parsedDate = parseISO(lot.buyDate);
                const holdingDays = Math.max(0, differenceInDays(today, parsedDate));
                const isLtcg = holdingDays > 365;
                const percentRemaining = Math.max(0, Math.min(100, (lot.remainingUnits / lot.initialUnits) * 100));
                const activeBasis = lot.remainingUnits * lot.pricePerUnit;

                return (
                  <tr
                    key={lot.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono font-bold flex items-center justify-center border border-slate-700">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {lot.fundName}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {lot.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5 font-sans">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{format(parsedDate, 'dd MMM yyyy')}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-white font-semibold">
                      ₹{lot.pricePerUnit.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="text-white font-semibold flex items-center gap-1">
                          <span>{lot.remainingUnits.toFixed(4)}</span>
                          <span className="text-slate-400 text-[10px] font-normal font-sans">
                            / {lot.initialUnits.toFixed(4)}
                          </span>
                        </div>
                        <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percentRemaining > 60
                                ? 'bg-emerald-500'
                                : percentRemaining > 20
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${percentRemaining}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{holdingDays} days</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(holdingDays / 365).toFixed(1)} yrs
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      {isLtcg ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          <CheckCircle2 className="w-3 h-3 text-purple-400" />
                          LTCG (&gt;365d)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          STCG (≤365d)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-white font-semibold">
                      ₹{activeBasis.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
