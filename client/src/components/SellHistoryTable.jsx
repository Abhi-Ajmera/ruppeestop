import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { History, ChevronDown, ChevronUp, Clock, Calendar, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';

export default function SellHistoryTable({ sellHistory = [] }) {
  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-rose-400" />
            <span>Realized Capital Gains & Redemption Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete audit trail showing which buy lots were consumed under Indian FIFO rules
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 self-start sm:self-auto">
          {sellHistory.length} Redemption{sellHistory.length === 1 ? '' : 's'}
        </span>
      </div>

      {sellHistory.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800/60 text-slate-500 mx-auto flex items-center justify-center mb-3">
            <History className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-300">No redemptions executed yet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Once you execute a sell order, the detailed lot-by-lot FIFO consumption audit trail and tax classification will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60">
          {sellHistory.map((tx) => {
            const isExpanded = !!expandedOrders[tx.id];
            const parsedSellDate = parseISO(tx.sellDate);
            const isNetGain = tx.netRealizedGain >= 0;

            return (
              <div key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                <div
                  onClick={() => toggleOrder(tx.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isNetGain ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {isNetGain ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {tx.fundName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                          {tx.id}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {format(parsedSellDate, 'dd MMM yyyy')}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-200">
                          {tx.unitsSold.toFixed(4)} units @ ₹{tx.sellPrice.toFixed(2)}
                        </span>
                        <span>•</span>
                        <span>
                          Proceeds: <span className="font-mono text-slate-200 font-semibold">₹{tx.totalProceeds.toLocaleString('en-IN')}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pl-11 md:pl-0">
                    <div className="text-right">
                      <div className={`text-base font-bold font-mono ${
                        isNetGain ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isNetGain ? '+' : ''}₹{tx.netRealizedGain.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 justify-end">
                        <span className="text-purple-400">LTCG: ₹{(tx.ltcgAmount || 0).toLocaleString('en-IN')}</span>
                        <span>|</span>
                        <span className="text-cyan-400">STCG: ₹{(tx.stcgAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="text-slate-400 hover:text-white p-1 rounded-md bg-slate-800/60">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-slate-950/80 px-4 py-4 sm:px-6 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-indigo-400" />
                        FIFO Lots Consumed for this Redemption ({tx.consumedLots?.length || 0})
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Total Cost Basis: ₹{tx.totalCostBasis.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="pb-2">Tranche</th>
                            <th className="pb-2">Original Buy Date</th>
                            <th className="pb-2">Buy NAV</th>
                            <th className="pb-2">Units Redeemed</th>
                            <th className="pb-2">Holding Period</th>
                            <th className="pb-2">Tax Classification</th>
                            <th className="pb-2">Cost Basis</th>
                            <th className="pb-2 text-right">Realized Gain/Loss</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {tx.consumedLots?.map((lot, idx) => {
                            const isLtcg = lot.taxType === 'LTCG';
                            const isTrancheGain = lot.realizedGainOrLoss >= 0;

                            return (
                              <tr key={lot.lotId + idx} className="hover:bg-slate-900/50">
                                <td className="py-2.5 text-slate-400 font-sans">
                                  #{idx + 1} ({lot.lotId})
                                </td>
                                <td className="py-2.5 text-slate-300 font-sans">
                                  {lot.buyDate}
                                </td>
                                <td className="py-2.5 text-white">
                                  ₹{lot.buyPrice.toFixed(2)}
                                </td>
                                <td className="py-2.5 text-white font-semibold">
                                  {lot.unitsRedeemed.toFixed(4)}
                                </td>
                                <td className="py-2.5 text-slate-300 font-sans">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    {lot.holdingDays} days
                                  </span>
                                </td>
                                <td className="py-2.5 font-sans">
                                  {isLtcg ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                      LTCG (&gt;365d)
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                      STCG (≤365d)
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 text-slate-400">
                                  ₹{lot.costBasis.toLocaleString('en-IN')}
                                </td>
                                <td className={`py-2.5 text-right font-bold ${
                                  isTrancheGain ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                  {isTrancheGain ? '+' : ''}₹{lot.realizedGainOrLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
