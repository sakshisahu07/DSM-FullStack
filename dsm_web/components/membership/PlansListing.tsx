import React, { useEffect } from 'react';
import { usePlans } from '../../hooks/usePlans';
import { MembershipPlan } from '../../types/membership';

interface PlansListingProps {
  onSelectPlan: (plan: MembershipPlan) => void;
}

export const PlansListing: React.FC<PlansListingProps> = ({ onSelectPlan }) => {
  const { list: plans, loading, error, getPlans } = usePlans();

  useEffect(() => {
    getPlans();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 py-12">
        {[1, 2, 3].map((n) => (
          <div key={n} className="animate-pulse bg-white border border-gray-100 rounded-[2rem] p-8 h-96 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-6 w-1/3 bg-gray-200 rounded-full" />
              <div className="h-10 w-2/3 bg-gray-200 rounded-full" />
              <div className="h-4 w-5/6 bg-gray-200 rounded-full" />
            </div>
            <div className="h-12 w-full bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-semibold">{error}</p>
        <button onClick={getPlans} className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full font-bold shadow-md">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Select Your Member Club Plan</h2>
        <p className="mt-4 text-xl text-gray-500">Unlocks early access, extra discount codes, and premium kit resources.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const isPlatinum = plan.tier === 'platinum';
          return (
            <div
              key={plan._id}
              className={`relative flex flex-col justify-between rounded-[2rem] p-8 shadow-sm transition-all duration-300 hover:shadow-xl border ${
                isPlatinum
                  ? 'bg-gradient-to-b from-slate-900 to-slate-800 text-white border-transparent scale-105 z-10'
                  : 'bg-white text-gray-800 border-gray-200'
              }`}
            >
              {isPlatinum && (
                <span className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs uppercase font-extrabold tracking-wider py-1.5 px-4 rounded-full shadow-lg">
                  Most Popular
                </span>
              )}
              
              <div>
                <h3 className={`text-2xl font-bold uppercase tracking-wide ${isPlatinum ? 'text-orange-400' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold tracking-tight">₹{plan.price}</span>
                  <span className={`ml-1 text-xl font-semibold ${isPlatinum ? 'text-slate-400' : 'text-gray-400'}`}>
                    /{plan.billing_cycle}
                  </span>
                </div>
                
                <ul className="mt-8 space-y-4">
                  {plan.perks?.map((perk, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className={`h-6 w-6 shrink-0 ${isPlatinum ? 'text-orange-400' : 'text-green-500'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-sm">{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full py-3.5 px-6 rounded-full text-center text-sm font-bold shadow-lg transition-transform active:scale-[0.98] ${
                    isPlatinum
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:brightness-110'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Select Plan
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
