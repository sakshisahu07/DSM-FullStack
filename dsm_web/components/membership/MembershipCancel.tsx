import React, { useState } from 'react';
import { useMembership } from '../../hooks/useMembership';

export const MembershipCancel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const { cancel, actionLoading, error } = useMembership();

  const handleCancelClick = async () => {
    if (confirmText !== 'CANCEL') return;
    try {
      await cancel();
      setIsOpen(false);
      setConfirmText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)} className="px-6 py-3 border-2 border-red-100 text-red-500 rounded-full font-bold text-sm hover:bg-red-50 transition-colors">
        Cancel Subscription
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6 transform animate-fade-in">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Wait! Are you sure?</h3>
              <p className="text-gray-500 text-sm mt-2">Cancelling your membership loses early access discount rates and points multipliers immediately.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-xs text-gray-500 leading-relaxed border border-slate-100">
              📌 Points earned will be preserved but active billing renewals will immediately stop.
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Type &apos;CANCEL&apos; to confirm</label>
              <input
                type="text"
                placeholder="CANCEL"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-250 rounded-xl text-center font-bold text-sm focus:outline-none focus:border-red-400 uppercase"
              />
            </div>

            {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}

            <div className="flex gap-4">
              <button onClick={() => setIsOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-full text-sm">
                Go back
              </button>
              <button
                onClick={handleCancelClick}
                disabled={confirmText !== 'CANCEL' || actionLoading}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full text-sm disabled:opacity-50"
              >
                {actionLoading ? 'Cancelling...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
