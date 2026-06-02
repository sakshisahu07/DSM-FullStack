import React, { useEffect, useState } from 'react';
import { useMembership } from '../../hooks/useMembership';
import { usePoints } from '../../hooks/usePoints';
import { useCoupons } from '../../hooks/useCoupons';
import { CouponValidation } from './CouponValidation';
import { PointsBalance } from './PointsBalance';
import { MembershipCancel } from './MembershipCancel';
import { PlansListing } from './PlansListing';
import { MembershipUpgrade } from './MembershipUpgrade';
import { MembershipPlan } from '../../types/membership';

export const MembershipDashboard: React.FC = () => {
  const { myMembership, loading, error, getMembership, purchase } = useMembership();
  const { getBalance } = usePoints();
  const { activeCoupon, getActive } = useCoupons();

  const [showPlans, setShowPlans] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    getMembership();
    getBalance();
    getActive();
  }, []);

  const handleSelectPlan = async (plan: MembershipPlan) => {
    const mockPaymentId = `pay_purchase_${Math.random().toString(36).substr(2, 9)}`;
    try {
      await purchase(plan._id, mockPaymentId);
      setShowPlans(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="animate-pulse h-48 bg-white rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="animate-pulse h-36 bg-white rounded-3xl" />
          <div className="animate-pulse h-36 bg-white rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-red-50 border border-red-100 rounded-3xl">
        <p className="text-red-600 font-bold">{error}</p>
        <button onClick={getMembership} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full">
          Retry
        </button>
      </div>
    );
  }

  if (!myMembership) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {!showPlans ? (
          <div className="max-w-md mx-auto my-12 text-center p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
            <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">No Active Membership</h3>
            <p className="text-gray-500 mt-2 mb-6">Unlock early perks and rewards by purchasing a customized membership subscription plan.</p>
            <button
              onClick={() => setShowPlans(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-bold shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Browse Active Plans
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-start mb-6 px-4">
              <button onClick={() => setShowPlans(false)} className="text-sm font-bold text-gray-500 hover:text-gray-800 flex items-center gap-2">
                ← Back to Dashboard
              </button>
            </div>
            <PlansListing onSelectPlan={handleSelectPlan} />
          </div>
        )}
      </div>
    );
  }

  const { plan_id: plan, start_date, expiry_date, status } = myMembership;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {showUpgrade && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-xl w-full">
            <button
              onClick={() => setShowUpgrade(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold z-10"
            >
              ×
            </button>
            <MembershipUpgrade />
          </div>
        </div>
      )}

      {/* Overview Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-12 text-white shadow-xl">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4">
          <svg className="w-96 h-96 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full">
              {plan?.tier} Club Tier
            </span>
            <h1 className="text-3xl md:text-5xl font-black mt-4 tracking-tight">{plan?.name}</h1>
            <p className="text-slate-400 mt-2">
              Member since: {new Date(start_date).toLocaleDateString()} &middot; Expiry: {new Date(expiry_date).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-sm text-slate-400 uppercase tracking-widest">Pricing Model</span>
            <span className="text-3xl font-extrabold text-orange-400 mt-1">₹{plan?.price}/{plan?.billing_cycle}</span>
            <span className="mt-2 text-xs px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-semibold uppercase">
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Loyalty Points, Coupon Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PointsBalance />
        
        {/* Coupon Info */}
        <div className="bg-white rounded-[2rem] p-8 border border-gray-150 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Your Exclusive Active Coupon</h3>
            <p className="text-gray-500 text-sm mt-1">Automatically applied during checkout matching your membership plan tier.</p>
            
            {activeCoupon?.coupon_code ? (
              <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-dashed border-orange-200 flex justify-between items-center">
                <div>
                  <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">Coupon Code</span>
                  <p className="text-xl font-mono font-black text-slate-800 tracking-wider mt-1">{activeCoupon.coupon_code}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">Discount Percentage</span>
                  <p className="text-2xl font-black text-orange-600 mt-1">{activeCoupon.discount_percent}% OFF</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic mt-6">No active promo coupons found on your membership tier.</p>
            )}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <CouponValidation />
          </div>
        </div>
      </div>

      {/* Actions (Upgrade / Cancel) */}
      <div className="bg-white rounded-[2rem] p-8 border border-gray-150 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Subscription Upgrades & Cancellations</h3>
          <p className="text-gray-500 text-sm mt-1">Want to switch plans to increase points multiplier? Or manage cancellation policies?</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowUpgrade(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold shadow-md hover:bg-slate-800 transition-all text-sm"
          >
            Upgrade Tier
          </button>
          <MembershipCancel />
        </div>
      </div>
    </div>
  );
};
