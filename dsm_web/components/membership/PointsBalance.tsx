import React, { useState } from 'react';
import { usePoints } from '../../hooks/usePoints';

export const PointsBalance: React.FC = () => {
  const { pointsBalance, actionLoading, error, getBalance, earn, redeem } = usePoints();

  const [simAmount, setSimAmount] = useState<number | ''>('');
  const [redeemAmt, setRedeemAmt] = useState<number | ''>('');
  const [redeemPoints, setRedeemPoints] = useState<number | ''>('');

  const handleEarnSimulate = async () => {
    if (!simAmount) return;
    try {
      await earn(Number(simAmount));
      setSimAmount('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRedeemSimulate = async () => {
    if (!redeemPoints || !redeemAmt) return;
    try {
      await redeem(Number(redeemPoints), Number(redeemAmt));
      setRedeemPoints('');
      setRedeemAmt('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-gray-150 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Your Rewards & Loyalty Points</h3>
          <button onClick={getBalance} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
            </svg>
          </button>
        </div>
        
        <div className="mt-6 flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
            ⭐
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">Current Active Balance</span>
            <p className="text-4xl font-black text-slate-800 mt-1">{pointsBalance} Points</p>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 font-semibold mt-3">{error}</p>}
      </div>

      <div className="mt-8 space-y-4 border-t border-gray-100 pt-6">
        <div>
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Simulate Transaction Earnings</h4>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Transaction Price (₹)"
              value={simAmount}
              onChange={(e) => setSimAmount(e.target.value ? Number(e.target.value) : '')}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
            />
            <button
              onClick={handleEarnSimulate}
              disabled={actionLoading}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              Add points
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Redeem Points Simulator</h4>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Points to Use"
              value={redeemPoints}
              onChange={(e) => setRedeemPoints(e.target.value ? Number(e.target.value) : '')}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
            />
            <input
              type="number"
              placeholder="Order Price (₹)"
              value={redeemAmt}
              onChange={(e) => setRedeemAmt(e.target.value ? Number(e.target.value) : '')}
              className="w-28 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
            />
            <button
              onClick={handleRedeemSimulate}
              disabled={actionLoading}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
            >
              Redeem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
