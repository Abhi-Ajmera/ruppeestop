import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SellFormSchema } from '../schemas/transactionSchemas';
import { previewSellTransaction } from '../services/api';
import { X, ArrowUpRight, AlertCircle, Clock, CheckCircle2, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function SellModal({ isOpen, onClose, onSellSuccess, activeLots = [] }) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [previewData, setPreviewData] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const fundsAvailable = Array.from(new Set(activeLots.map((l) => l.fundName)));
  const defaultFund = fundsAvailable[0] || 'Parag Parikh Flexi Cap Fund';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(SellFormSchema),
    defaultValues: {
      fundName: defaultFund,
      sellDate: todayStr,
      unitsToSell: '',
      sellPrice: ''
    }
  });

  const watchedFund = watch('fundName');
  const watchedDate = watch('sellDate');
  const watchedUnits = watch('unitsToSell');
  const watchedPrice = watch('sellPrice');

  const availableUnitsForFund = activeLots
    .filter((l) => l.fundName.trim().toLowerCase() === (watchedFund || '').trim().toLowerCase())
    .reduce((acc, l) => acc + l.remainingUnits, 0);

  useEffect(() => {
    if (!isOpen) return;

    const numUnits = Number(watchedUnits);
    const numPrice = Number(watchedPrice);

    if (
      watchedFund &&
      watchedDate &&
      !isNaN(numUnits) &&
      numUnits > 0 &&
      !isNaN(numPrice) &&
      numPrice > 0
    ) {
      const timer = setTimeout(async () => {
        setIsPreviewLoading(true);
        setPreviewError(null);
        try {
          const preview = await previewSellTransaction({
            fundName: watchedFund,
            sellDate: watchedDate,
            unitsToSell: numUnits,
            sellPrice: numPrice
          });
          setPreviewData(preview);
        } catch (err) {
          setPreviewError(err.message);
          setPreviewData(null);
        } finally {
          setIsPreviewLoading(false);
        }
      }, 250);

      return () => clearTimeout(timer);
    } else {
      setPreviewData(null);
      setPreviewError(null);
    }
  }, [watchedFund, watchedDate, watchedUnits, watchedPrice, isOpen]);

  const onSubmit = async (data) => {
    try {
      await onSellSuccess(data);
      reset();
      setPreviewData(null);
      onClose();
    } catch (err) {
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Redeem Mutual Fund Units</h3>
              <p className="text-xs text-slate-400">Indian FIFO Allocation & Capital Gains Simulation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Fund
              </label>
              <span className="text-xs text-slate-400">
                Available: <span className="font-mono text-emerald-400 font-semibold">{availableUnitsForFund.toFixed(4)}</span> units
              </span>
            </div>

            {fundsAvailable.length > 0 ? (
              <select
                {...register('fundName')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
              >
                {fundsAvailable.map((fund) => (
                  <option key={fund} value={fund}>
                    {fund}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                {...register('fundName')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
                placeholder="Enter mutual fund name"
              />
            )}
            {errors.fundName && (
              <p className="text-xs text-rose-400 mt-1">{errors.fundName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Redemption / Sell Date
            </label>
            <input
              type="date"
              {...register('sellDate')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
            />
            {errors.sellDate && (
              <p className="text-xs text-rose-400 mt-1">{errors.sellDate.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Units to Sell
                </label>
                {availableUnitsForFund > 0 && (
                  <button
                    type="button"
                    onClick={() => setValue('unitsToSell', availableUnitsForFund, { shouldValidate: true })}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Sell All ({availableUnitsForFund.toFixed(2)})
                  </button>
                )}
              </div>
              <input
                type="number"
                step="0.0001"
                {...register('unitsToSell')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 font-mono transition-colors"
                placeholder="e.g. 100.00"
              />
              {errors.unitsToSell && (
                <p className="text-xs text-rose-400 mt-1">{errors.unitsToSell.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Redemption NAV (₹ per unit)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('sellPrice')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 font-mono transition-colors"
                placeholder="e.g. 75.00"
              />
              {errors.sellPrice && (
                <p className="text-xs text-rose-400 mt-1">{errors.sellPrice.message}</p>
              )}
            </div>
          </div>

          {previewError && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{previewError}</span>
            </div>
          )}

          {previewData && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Live FIFO Lot Consumption Preview
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  Consumes <span className="text-white font-semibold font-mono">{previewData.consumedLots?.length || 0}</span> lot{previewData.consumedLots?.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {previewData.consumedLots?.map((item, idx) => {
                  const isLtcg = item.taxType === 'LTCG';
                  const isGain = item.realizedGainOrLoss >= 0;

                  return (
                    <div
                      key={item.lotId + idx}
                      className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-slate-200 font-medium">
                            {item.unitsRedeemed.toFixed(4)} units from Lot ({item.buyDate})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            @ ₹{item.buyPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 pl-6">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {item.holdingDays} days held
                          </span>
                          <span>•</span>
                          <span className={isLtcg ? 'text-purple-400 font-semibold' : 'text-cyan-400 font-semibold'}>
                            {item.taxType} ({isLtcg ? '>365d' : '≤365d'})
                          </span>
                        </div>
                      </div>

                      <div className="text-right pl-6 sm:pl-0">
                        <div className={`font-mono font-bold ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isGain ? '+' : ''}₹{item.realizedGainOrLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Basis: ₹{item.costBasis.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Gross Proceeds:</span>
                  <span className="font-mono font-bold text-white">
                    ₹{previewData.totalProceeds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Cost Basis:</span>
                  <span className="font-mono font-bold text-slate-300">
                    ₹{previewData.totalCostBasis.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-purple-400 block text-[10px]">LTCG Portion:</span>
                  <span className="font-mono font-bold text-purple-300">
                    ₹{previewData.ltcgAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-cyan-400 block text-[10px]">STCG Portion:</span>
                  <span className="font-mono font-bold text-cyan-300">
                    ₹{previewData.stcgAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg p-3 flex items-center justify-between border border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Net Realized Gain:</span>
                <span className={`text-base font-bold font-mono ${
                  previewData.netRealizedGain >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {previewData.netRealizedGain >= 0 ? '+' : ''}₹{previewData.netRealizedGain.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isPreviewLoading || !previewData}
              className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{isSubmitting ? 'Redeeming...' : 'Confirm Redemption'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
