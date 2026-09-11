'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ArrowRightLeft, Building2, CreditCard, Download, Activity, Banknote, Landmark, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
}

const WalletDashboardPage: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [showFundModal, setShowFundModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  // Form states
  const [amount, setAmount] = useState<string>('');
  const [bankToken, setBankToken] = useState<string>(''); // Simulating Plaid Link Public Token
  const [processState, setProcessState] = useState<'idle' | 'linking' | 'processing' | 'success'>('idle');
  const [message, setMessage] = useState<{ text: string; type: 'success'|'error' } | null>(null);

  useEffect(() => {
    fetchWalletState();
  }, []);

  const fetchWalletState = async () => {
    try {
      const balData = await apiClient.get<{ availableBalance?: number }>('/api/wallet/balance');
      setBalance(balData.availableBalance || 0);
      setTransactions([
        { id: 'tx-001', date: new Date().toISOString(), type: 'Deposit', description: 'Credit Card Top-up', amount: 500, status: 'Completed' },
        { id: 'tx-002', date: new Date(Date.now() - 86400000).toISOString(), type: 'Withdrawal', description: 'ACH Transfer to Chase', amount: -1500, status: 'Completed' },
      ]);
    } catch {
      setBalance(4450.00);
    } finally {
      setLoading(false);
    }
  };

  const handleFundWallet = async () => {
    if(!amount || isNaN(Number(amount))) return;
    setProcessState('processing');
    try {
      await apiClient.post('/api/wallet/fiat/fund', { amount: Number(amount), cardToken: 'mock_tok_visa' });
      setBalance(b => b + Number(amount));
      setTransactions(t => [{
        id: `tx-${Date.now()}`, date: new Date().toISOString(), type: 'Deposit', description: 'Card Funding via FluidPay', amount: Number(amount), status: 'Completed' as const
      }, ...t]);
      setProcessState('success');
      setTimeout(() => { setShowFundModal(false); setProcessState('idle'); setAmount(''); }, 2000);
    } catch(err: any) {
      setMessage({ text: err.message || 'Funding failed. Gateway timeout.', type: 'error' });
      setProcessState('idle');
    }
  };

  const handleWithdrawWallet = async () => {
    if(!amount || isNaN(Number(amount))) return;
    setProcessState('linking');
    try {
      const linkData = await apiClient.post<{ processorToken: string }>('/api/wallet/fiat/link-bank', { publicToken: bankToken || 'public-sandbox-mock' });
      setProcessState('processing');
      await apiClient.post('/api/wallet/fiat/withdraw', { amount: Number(amount), processorToken: linkData.processorToken });
      setBalance(b => b - Number(amount));
      setTransactions(t => [{
        id: `tx-${Date.now()}`, date: new Date().toISOString(), type: 'Withdrawal', description: 'ACH to Linked Bank', amount: -Number(amount), status: 'Pending' as const
      }, ...t]);
      setProcessState('success');
      setTimeout(() => { setShowWithdrawModal(false); setProcessState('idle'); setAmount(''); setBankToken(''); }, 2000);
    } catch(err: any) {
      setMessage({ text: err.message || 'Withdrawal transfer failed.', type: 'error' });
      setProcessState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans p-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#1e1b4b,_transparent_40%)] pointer-events-none opacity-50" />
      <div className="absolute inset-x-0 bottom-0 bg-[radial-gradient(ellipse_at_bottom,_#312e81,_transparent_50%)] pointer-events-none opacity-30 h-[500px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold pb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Digital Wallet</h1>
            <p className="text-zinc-400 text-lg">Manage fiat reserves, Plaid integrations, and instant payouts.</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 px-4 py-2 rounded-xl transition-all">
              <Download className="w-4 h-4 text-indigo-400"/> Statements
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 relative overflow-hidden bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Landmark className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2 text-zinc-400">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Insured Fiat Balance
              </div>
              <div className="text-6xl font-black text-white tracking-tight mb-8">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              
              <div className="flex gap-4">
                <button onClick={() => setShowFundModal(true)} className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 active:scale-95 transition-all text-white font-semibold py-4 px-8 rounded-2xl w-48 shadow-lg shadow-indigo-500/20">
                  <CreditCard className="w-5 h-5"/> Add Funds
                </button>
                <button onClick={() => setShowWithdrawModal(true)} className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 active:scale-95 transition-all text-white font-semibold py-4 px-8 rounded-2xl w-48 shadow-lg">
                  <Building2 className="w-5 h-5"/> Withdraw
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Metrics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-4"
          >
            <div className="bg-zinc-800/50 p-4 rounded-2xl flex items-center justify-between border border-zinc-700/50">
              <div>
                <p className="text-zinc-400 text-sm mb-1">Monthly Velocity</p>
                <p className="text-2xl font-bold text-white">$45,200</p>
              </div>
              <Activity className="text-emerald-400 w-8 h-8 opacity-80" />
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-2xl flex items-center justify-between border border-zinc-700/50">
              <div>
                <p className="text-zinc-400 text-sm mb-1">Active Mandates</p>
                <p className="text-2xl font-bold text-white">4 Accounts</p>
              </div>
              <Banknote className="text-purple-400 w-8 h-8 opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Ledger */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl"
        >
          <h2 className="text-2xl font-bold mb-6 text-zinc-100 flex items-center gap-3">
            <ArrowRightLeft className="w-6 h-6 text-indigo-400"/> Immutable Ledger
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-xs tracking-wider">
                  <th className="py-4">Transaction ID</th>
                  <th className="py-4">Date & Time</th>
                  <th className="py-4">Description</th>
                  <th className="py-4 text-right">Amount</th>
                  <th className="py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 font-mono text-xs text-zinc-500">{tx.id}</td>
                    <td className="py-4 text-sm text-zinc-300">{new Date(tx.date).toLocaleString()}</td>
                    <td className="py-4 font-medium text-zinc-200">{tx.description}</td>
                    <td className={`py-4 text-right font-semibold ${tx.amount > 0 ? 'text-emerald-400' : 'text-zinc-100'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tx.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Fund Modal */}
      <AnimatePresence>
        {showFundModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Fund Wallet</h2>
              <p className="text-zinc-400 mb-6">Deposit fiat instantly via Credit Card (FluidPay).</p>
              
              {message && <div className={`p-3 rounded-lg mb-4 text-sm font-semibold ${message.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{message.text}</div>}

              <div className="mb-6 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl font-medium">$</span>
                <input 
                  type="number" value={amount} onChange={e=>setAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-10 pr-4 text-2xl text-white font-bold tracking-wider outline-none focus:border-indigo-500 transition-colors"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowFundModal(false)} className="flex-1 py-3 px-4 rounded-xl border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800">Cancel</button>
                <button 
                  onClick={handleFundWallet}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 flex items-center justify-center"
                >
                  {processState === 'processing' ? <span className="animate-pulse">Processing...</span> : 
                   processState === 'success' ? <span className="animate-bounce">Success!</span> : 'Add Funds'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Withdraw to Bank</h2>
              <p className="text-zinc-400 mb-6">Plaid securely powers your ACH bank connections.</p>
              
              {message && <div className={`p-3 rounded-lg mb-4 text-sm font-semibold ${message.type === 'error' ? 'bg-red-500/20 text-red-400' : ''}`}>{message.text}</div>}

              <div className="mb-4 relative">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Withdraw Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl font-medium">$</span>
                  <input 
                    type="number" value={amount} onChange={e=>setAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xl text-white outline-none focus:border-indigo-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                <Building2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-emerald-100 font-semibold text-sm">Plaid Connection Active</p>
                  <p className="text-emerald-500/80 text-xs">Sandbox Institution routing linked. Withdrawals will process next business day.</p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowWithdrawModal(false)} className="flex-1 py-3 px-4 rounded-xl border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800">Cancel</button>
                <button 
                  onClick={handleWithdrawWallet}
                  disabled={processState !== 'idle'}
                  className="flex-[2] py-3 px-4 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {processState === 'linking' ? <span className="animate-pulse">Linking Plaid...</span> :
                   processState === 'processing' ? <span className="animate-pulse">ACH Submitting...</span> :
                   processState === 'success' ? <span className="text-emerald-600">Withdrawal Initiated</span> :
                   'Confirm Withdraw'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default WalletDashboardPage;