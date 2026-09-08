import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BuyFormSchema } from '../schemas/transactionSchemas';
import { X, PlusCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const POPULAR_FUNDS = [
  'Parag Parikh Flexi Cap Fund',
  'Mirae Asset Large Cap Fund',
  'Quant Small Cap Fund',
  'HDFC Balanced Advantage Fund'
];

export default function BuyModal({ isOpen, onClose, onBuySuccess }) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(BuyFormSchema),
    defaultValues: {
      fundName: 'Parag Parikh Flexi Cap Fund',
      buyDate: todayStr,
      units: '',
      pricePerUnit: ''
    }
  });

  const watchedUnits = watch('units');
  const watchedPrice = watch('pricePerUnit');

  const computedTotal = 
    !isNaN(Number(watchedUnits)) && !isNaN(Number(watchedPrice)) && Number(watchedUnits) > 0 && Number(watchedPrice) > 0
      ? (Number(watchedUnits) * Number(watchedPrice)).toFixed(2)
      : '0.00';

  const onSubmit = async (data) => {
    try {
      await onBuySuccess(data);
      reset();
      onClose();
    } catch (err) {
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Buy Transaction</h3>
              <p className="text-xs text-slate-400">Add a new mutual fund purchase lot to the FIFO queue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Mutual Fund Name
            </label>
            <input
              type="text"
              {...register('fundName')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="e.g. Parag Parikh Flexi Cap Fund"
            />
            {errors.fundName && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.fundName.message}
              </p>
            )}

            <div className="mt-2 flex flex-wrap gap-1.5">
              {POPULAR_FUNDS.map((fund) => (
                <button
                  type="button"
                  key={fund}
                  onClick={() => setValue('fundName', fund, { shouldValidate: true })}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {fund}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Purchase Date
            </label>
            <input
              type="date"
              {...register('buyDate')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {errors.buyDate && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.buyDate.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Units Purchased
              </label>
              <input
                type="number"
                step="0.0001"
                {...register('units')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                placeholder="e.g. 50.00"
              />
              {errors.units && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.units.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Price per Unit (NAV ₹)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('pricePerUnit')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                placeholder="e.g. 62.50"
              />
              {errors.pricePerUnit && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.pricePerUnit.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Capital Outlay:</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              ₹{Number(computedTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

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
              disabled={isSubmitting}
              className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Add Buy Lot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
