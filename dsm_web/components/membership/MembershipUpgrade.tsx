import React, { useState, useEffect } from 'react';
import { usePlans } from '../../hooks/usePlans';
import { useMembership } from '../../hooks/useMembership';

export const MembershipUpgrade: React.FC = () => {
  const { list: plans, getPlans } = usePlans();
  const { myMembership, actionLoading, upgrade } = useMembership();

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [proRatedCharge, setProRatedCharge] = useState<number>(0);

  useEffect(() => {
    getPlans();
  }, []);

  useEffect(() => {
    if (!selectedPlanId || !myMembership || !plans.length) return;
    
    const currentPlan = myMembership.plan_id;
    const newPlan = plans.find((p) => p._id === selectedPlanId);
    
    if (!newPlan) return;
    
    // Pro-rated difference billing math simulator
    const now = new Date();
    const start = new Date(myMembership.start_date);
    const expiry = new Date(myMembership.expiry_date);
    
    const totalDays = Math.ceil((expiry.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 30;
    const remainingDays = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    const valueRemaining = (remainingDays / totalDays) * currentPlan.price;
    const diff = Math.max(0, parseFloat((newPlan.price - valueRemaining).toFixed(2)));
    setProRatedCharge(diff);
  }, [selectedPlanId, myMembership, plans]);

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;
    
    const mockPaymentId = `pay_upgrade_${Math.random().toString(36).substr(2, 9)}`;
    try {
      await upgrade(selectedPlanId, mockPaymentId);
    } catch (err) {
      console.error(err);
    }
  };

  if (!myMembership) return null;

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-gray-150 shadow-sm max-w-xl mx-auto my-12">
      <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Upgrade Subscription Tier</h3>
      <p className="text-gray-500 text-sm mb-6">Switch dynamically. Current active pro-rated value balance will automatically subtract from the new plan cost.</p>
      
      <form onSubmit={handleUpgradeSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Target Plan</label>
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-orange-400"
            required
          >
            <option value="">-- Choose New Tier --</option>
            {plans
              .filter((p) => p._id !== myMembership.plan_id?._id)
              .map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (₹{p.price}/{p.billing_cycle})
                </option>
              ))}
          </select>
        </div>

        {selectedPlanId && (
          <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between text-sm text-slate-700">
              <span>Pro-rated Remaining Balance Value:</span>
              <span className="font-semibold text-emerald-600">- simulated calculation</span>
            </div>
            <div className="flex justify-between text-slate-800 font-bold border-t border-gray-100 pt-3">
              <span>Estimated Billing Charge Today:</span>
              <span className="text-lg font-black text-orange-600">₹{proRatedCharge}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedPlanId || actionLoading}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-bold shadow-lg disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {actionLoading ? 'Verifying payment...' : 'Confirm Upgrade'}
        </button>
      </form>
    </div>
  );
};
