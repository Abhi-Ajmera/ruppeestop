import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RedemptionStudioPage from './pages/RedemptionStudioPage';
import LedgerPage from './pages/LedgerPage';
import BuyModal from './components/BuyModal';
import SellModal from './components/SellModal';
import {
  getPortfolio,
  recordBuyTransaction,
  executeSellTransaction,
  resetDemoPortfolio,
  clearPortfolio
} from './services/api';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getPortfolio();
      setPortfolio(data);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
      showToast('Could not reach backend, loaded cached data if available', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBuySuccess = async (buyData) => {
    try {
      const res = await recordBuyTransaction(buyData);
      if (res.portfolio) {
        setPortfolio(res.portfolio);
      } else {
        await loadData();
      }
      showToast(`Added ${buyData.units} units of ${buyData.fundName} at ₹${buyData.pricePerUnit}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to record purchase', 'error');
      throw err;
    }
  };

  const handleSellSuccess = async (sellData) => {
    try {
      const res = await executeSellTransaction(sellData);
      if (res.portfolio) {
        setPortfolio(res.portfolio);
      } else {
        await loadData();
      }
      const gain = res.sellTransaction?.netRealizedGain;
      showToast(
        `Redeemed ${sellData.unitsToSell} units! Realized P/L: ${gain >= 0 ? '+' : ''}₹${gain?.toLocaleString('en-IN') || 0}`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to execute redemption', 'error');
      throw err;
    }
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      const data = await resetDemoPortfolio();
      setPortfolio(data);
      showToast('Portfolio reset to realistic demo mutual fund lots', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to reset demo data', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all mutual fund lots and history?')) return;
    try {
      setIsResetting(true);
      const data = await clearPortfolio();
      setPortfolio(data);
      showToast('Cleared all lots. Portfolio is now empty.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to clear data', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
        <Navbar 
          onReset={handleReset} 
          onClear={handleClear} 
          isResetting={isResetting} 
        />

        {toast && (
          <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-4 duration-300">
            <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-sm ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/90 border-rose-800 text-rose-200'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  portfolio={portfolio}
                  loading={loading}
                  onRefresh={loadData}
                  onOpenBuy={() => setIsBuyModalOpen(true)}
                  onOpenSell={() => setIsSellModalOpen(true)}
                />
              }
            />
            <Route
              path="/redemption"
              element={
                <RedemptionStudioPage
                  portfolio={portfolio}
                  onOpenBuy={() => setIsBuyModalOpen(true)}
                  onOpenSell={() => setIsSellModalOpen(true)}
                />
              }
            />
            <Route
              path="/ledger"
              element={<LedgerPage portfolio={portfolio} />}
            />
          </Routes>
        </main>

        <BuyModal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          onBuySuccess={handleBuySuccess}
        />

        <SellModal
          isOpen={isSellModalOpen}
          onClose={() => setIsSellModalOpen(false)}
          onSellSuccess={handleSellSuccess}
          activeLots={portfolio?.activeLots || []}
        />

        <footer className="border-t border-slate-900 bg-slate-950/50 py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              RupeeStop &copy; {new Date().getFullYear()} • Indian Mutual Fund FIFO Capital Gains & Tax Engine
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>FIFO Algorithm (Oldest Units Sold First)</span>
              <span>•</span>
              <span>LTCG (&gt;365 Days)</span>
              <span>•</span>
              <span>STCG (≤365 Days)</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
