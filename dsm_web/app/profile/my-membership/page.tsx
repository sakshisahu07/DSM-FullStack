'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { ProfileSidebar, MobileProfileLayout } from '@/components/profile';
import { fetchMyMembership, cancelMembership } from '@/redux/slices/membershipSlice';
import { CheckCircle, AlertCircle, Calendar, Gift, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MyMembershipPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { myMembership, loading, actionLoading } = useSelector((state: RootState) => state.membership);

  useEffect(() => {
    dispatch(fetchMyMembership());
  }, [dispatch]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your membership? You will lose access to premium perks immediately.')) return;
    const res = await dispatch(cancelMembership());
    if (cancelMembership.fulfilled.match(res)) {
      toast.success('Membership cancelled successfully');
    } else {
      toast.error(res.payload as string || 'Failed to cancel membership');
    }
  };

  const getTierDetails = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum':
        return { color: 'bg-gradient-to-br from-[#EE9C24] via-[#D36B15] to-[#B8420E] text-white shadow-[0_8px_30px_rgba(238,156,36,0.3)]', icon: '👑' };
      case 'gold':
        return { color: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-[#EE9C24] text-white shadow-[0_8px_30px_rgba(251,191,36,0.3)]', icon: '✨' };
      case 'silver':
      default:
        return { color: 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700 text-white shadow-[0_8px_30px_rgba(148,163,184,0.3)]', icon: '⭐' };
    }
  };

  const plan: any = myMembership?.planId || myMembership?.plan_id || ({} as any);
  const tierName = plan?.tier || 'silver';
  const tierDetails = myMembership ? getTierDetails(tierName) : getTierDetails('silver');
  const expiryDate = myMembership?.expiry_date || myMembership?.endDate;

  return (
    <>
      <main className="hidden lg:block bg-[#FAFAFA] lg:bg-white py-4 sm:py-6 md:py-8 min-h-screen">
        <div className="container-main px-0 lg:px-4">
          <p className="text-xs sm:text-sm text-gray-400 mb-4 uppercase">
            HOME &gt; MY ACCOUNT &gt; <span className="text-[#EE9C24]">MY MEMBERSHIP</span>
          </p>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-3">
              <ProfileSidebar activeItem="Membership" />
            </div>

            <div className="col-span-12 lg:col-span-9">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 min-h-[600px]">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#000000]">My Membership</h2>
                    <div className="w-32 sm:w-44 h-1 bg-gradient-to-r from-[#EE9C24] to-[#B3520A] rounded-full mt-3" />
                  </div>
                  {myMembership && myMembership.status === 'active' && (
                    <Link href="/membership" className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
                      Upgrade Plan
                    </Link>
                  )}
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <span className="w-10 h-10 border-4 border-orange-100 border-t-[#EE9C24] rounded-full animate-spin"></span>
                  </div>
                ) : myMembership && myMembership.status === 'active' ? (
                  <div className="space-y-8">
                    {/* Active Plan Card */}
                    <div className={`rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-2xl ${tierDetails.color} transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1`}>
                      <div className="absolute right-0 top-0 opacity-20 w-80 h-80 -mr-16 -mt-16 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
                      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
                        <div className="flex items-center gap-6">
                           <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center p-4 shadow-inner border border-white/30 rotate-3 hover:rotate-0 transition-transform">
                              <span className="text-5xl drop-shadow-md">{tierDetails.icon}</span>
                           </div>
                           <div>
                              <p className="text-white/80 font-bold uppercase tracking-widest text-xs mb-1.5 drop-shadow-sm">Current Plan - {plan?.name || 'DSM Membership'}</p>
                              <h3 className="text-5xl font-black capitalize mb-3 drop-shadow-md tracking-tight">{tierName}</h3>
                              <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                <Calendar size={18} className="text-white/90" />
                                <span className="text-white/90 text-sm font-semibold tracking-wide">Valid until: {expiryDate ? new Date(expiryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Lifetime'}</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-center md:text-right">
                           <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-bold tracking-wide uppercase shadow-sm border border-white/30">
                             Active
                           </span>
                        </div>
                      </div>
                    </div>

                    {/* Perks Section */}
                    <div className="mt-12 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow">
                      <h4 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                        <div className="p-3 bg-orange-50 rounded-2xl">
                          <Gift className="text-[#EE9C24] w-6 h-6" />
                        </div>
                        Premium Benefits
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {plan?.perks?.length > 0 ? (
                            plan.perks.map((perk: string, idx: number) => (
                               <div key={idx} className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/20 p-5 rounded-2xl border border-orange-100/50 hover:border-orange-200 transition-colors group">
                                 <CheckCircle className="text-[#EE9C24] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" size={22} />
                                 <span className="text-gray-800 font-bold text-sm leading-relaxed">{perk}</span>
                               </div>
                            ))
                        ) : (
                          <>
                            <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/20 p-5 rounded-2xl border border-orange-100/50 hover:border-orange-200 transition-colors group">
                              <CheckCircle className="text-[#EE9C24] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" size={22} />
                              <span className="text-gray-800 font-bold text-sm leading-relaxed">Extra 10% Discount on Every Order</span>
                            </div>
                            <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/20 p-5 rounded-2xl border border-orange-100/50 hover:border-orange-200 transition-colors group">
                              <CheckCircle className="text-[#EE9C24] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" size={22} />
                              <span className="text-gray-800 font-bold text-sm leading-relaxed">Free & Express Delivery on All Items</span>
                            </div>
                            <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/20 p-5 rounded-2xl border border-orange-100/50 hover:border-orange-200 transition-colors group">
                              <CheckCircle className="text-[#EE9C24] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" size={22} />
                              <span className="text-gray-800 font-bold text-sm leading-relaxed">Priority 24/7 Customer Support</span>
                            </div>
                            <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/20 p-5 rounded-2xl border border-orange-100/50 hover:border-orange-200 transition-colors group">
                              <CheckCircle className="text-[#EE9C24] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" size={22} />
                              <span className="text-gray-800 font-bold text-sm leading-relaxed">Exclusive Access to Upcoming Sales</span>
                            </div>
                            <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/20 p-5 rounded-2xl border border-orange-100/50 hover:border-orange-200 transition-colors group">
                              <CheckCircle className="text-[#EE9C24] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" size={22} />
                              <span className="text-gray-800 font-bold text-sm leading-relaxed">30-Day Easy Returns Policy</span>
                            </div>
                            <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/20 p-5 rounded-2xl border border-orange-100/50 hover:border-orange-200 transition-colors group">
                              <CheckCircle className="text-[#EE9C24] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" size={22} />
                              <span className="text-gray-800 font-bold text-sm leading-relaxed">Free Installation on Large Appliances</span>
                            </div>
                          </>
                        )}
                        
                        {plan?.points_multiplier && (
                           <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/20 p-5 rounded-2xl border border-orange-100/50 hover:border-orange-200 transition-colors group">
                             <Star className="text-[#EE9C24] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" size={22} fill="#EE9C24" />
                             <span className="text-gray-800 font-bold text-sm leading-relaxed">{plan.points_multiplier}x Reward Points Multiplier</span>
                           </div>
                        )}
                        {plan?.shipping_type && (
                           <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/20 p-5 rounded-2xl border border-orange-100/50 hover:border-orange-200 transition-colors group">
                             <Clock className="text-[#EE9C24] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" size={22} />
                             <span className="text-gray-800 font-bold text-sm leading-relaxed capitalize">{plan.shipping_type} Shipping Included</span>
                           </div>
                        )}
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-8 border-t border-gray-100 mt-8">
                       <h4 className="text-lg font-bold text-gray-900 mb-2">Manage Membership</h4>
                       <p className="text-gray-500 text-sm mb-4">Canceling your membership will revoke access to all premium benefits immediately.</p>
                       <button 
                         onClick={handleCancel} 
                         disabled={actionLoading}
                         className="px-6 py-2.5 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-lg font-semibold transition flex items-center gap-2"
                       >
                         {actionLoading ? <Clock size={18} className="animate-spin" /> : <AlertCircle size={18} />}
                         Cancel Membership
                       </button>
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Star className="text-gray-300 w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Membership</h3>
                    <p className="text-gray-500 mb-8 max-w-md">Upgrade your account to unlock premium perks, exclusive discounts, and priority support.</p>
                    <Link href="/membership" className="px-8 py-3 bg-gradient-to-r from-[#EE9C24] to-[#B3520A] text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all">
                      Explore Plans
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileProfileLayout title="My Membership">
        <div className="flex flex-col gap-6 -mt-2">
          {loading ? (
             <div className="flex justify-center py-20">
               <span className="w-8 h-8 border-4 border-orange-100 border-t-[#EE9C24] rounded-full animate-spin"></span>
             </div>
          ) : myMembership && myMembership.status === 'active' ? (
              <div className="space-y-6">
                <div className={`rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl ${tierDetails.color} transform transition-all active:scale-[0.98]`}>
                   <div className="absolute right-0 top-0 opacity-20 w-64 h-64 -mr-20 -mt-20 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
                   <div className="relative z-10">
                     <div className="flex justify-between items-start mb-8">
                       <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center shadow-inner border border-white/20 rotate-3">
                         <span className="text-3xl drop-shadow-md">{tierDetails.icon}</span>
                       </div>
                       <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-sm">
                         Active
                       </span>
                     </div>
                     <p className="text-white/80 text-[11px] font-black uppercase tracking-widest mb-1.5 drop-shadow-sm">Current Plan - {plan?.name || 'DSM Membership'}</p>
                     <h2 className="text-4xl font-black capitalize mb-6 tracking-tight drop-shadow-md">{tierName}</h2>
                     <div className="bg-black/20 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-md border border-white/10">
                       <Calendar size={20} className="text-white/90" />
                       <div>
                         <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-0.5">Valid Until</p>
                         <p className="text-white font-bold text-sm">{expiryDate ? new Date(expiryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Lifetime'}</p>
                       </div>
                     </div>
                   </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-xl">
                      <Gift size={20} className="text-[#EE9C24]" /> 
                    </div>
                    Premium Benefits
                  </h3>
                  <div className="space-y-3">
                     {plan?.perks?.length > 0 ? (
                        plan.perks.map((perk: string, idx: number) => (
                           <div key={idx} className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/10 p-4 rounded-2xl border border-orange-100/50">
                             <CheckCircle className="text-[#EE9C24] shrink-0 mt-0.5" size={20} />
                             <span className="text-gray-800 text-sm font-bold leading-relaxed">{perk}</span>
                           </div>
                        ))
                     ) : (
                       <>
                          <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/10 p-4 rounded-2xl border border-orange-100/50">
                            <CheckCircle className="text-[#EE9C24] shrink-0 mt-0.5" size={20} />
                            <span className="text-gray-800 text-sm font-bold leading-relaxed">Extra 10% Discount on Every Order</span>
                          </div>
                          <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/10 p-4 rounded-2xl border border-orange-100/50">
                            <CheckCircle className="text-[#EE9C24] shrink-0 mt-0.5" size={20} />
                            <span className="text-gray-800 text-sm font-bold leading-relaxed">Free & Express Delivery on All Items</span>
                          </div>
                          <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/10 p-4 rounded-2xl border border-orange-100/50">
                            <CheckCircle className="text-[#EE9C24] shrink-0 mt-0.5" size={20} />
                            <span className="text-gray-800 text-sm font-bold leading-relaxed">Priority 24/7 Customer Support</span>
                          </div>
                          <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/10 p-4 rounded-2xl border border-orange-100/50">
                            <CheckCircle className="text-[#EE9C24] shrink-0 mt-0.5" size={20} />
                            <span className="text-gray-800 text-sm font-bold leading-relaxed">Exclusive Access to Upcoming Sales</span>
                          </div>
                          <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/10 p-4 rounded-2xl border border-orange-100/50">
                            <CheckCircle className="text-[#EE9C24] shrink-0 mt-0.5" size={20} />
                            <span className="text-gray-800 text-sm font-bold leading-relaxed">30-Day Easy Returns Policy</span>
                          </div>
                            <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/10 p-4 rounded-2xl border border-orange-100/50">
                            <CheckCircle className="text-[#EE9C24] shrink-0 mt-0.5" size={20} />
                            <span className="text-gray-800 text-sm font-bold leading-relaxed">Free Installation on Large Appliances</span>
                          </div>
                       </>
                     )}
                     
                     {plan?.points_multiplier && (
                        <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/10 p-4 rounded-2xl border border-orange-100/50">
                          <Star className="text-[#EE9C24] shrink-0 mt-0.5" size={20} fill="#EE9C24" />
                          <span className="text-gray-800 text-sm font-bold leading-relaxed">{plan.points_multiplier}x Reward Points Multiplier</span>
                        </div>
                     )}
                     {plan?.shipping_type && (
                        <div className="flex items-start gap-4 bg-gradient-to-br from-orange-50/50 to-orange-50/10 p-4 rounded-2xl border border-orange-100/50">
                          <Clock className="text-[#EE9C24] shrink-0 mt-0.5" size={20} />
                          <span className="text-gray-800 text-sm font-bold leading-relaxed capitalize">{plan.shipping_type} Shipping Included</span>
                        </div>
                     )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link href="/membership" className="py-3.5 bg-gray-900 text-white rounded-2xl font-black text-xs text-center shadow-md active:scale-95 transition">
                    Upgrade
                  </Link>
                  <button 
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="py-3.5 border-2 border-red-50 text-red-500 bg-white rounded-2xl font-black text-xs text-center active:scale-95 transition"
                  >
                    Cancel
                  </button>
                </div>
             </div>
          ) : (
             <div className="bg-white rounded-[32px] p-8 text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Star className="text-[#EE9C24] w-10 h-10" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Become a Member</h2>
                <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8">
                  Unlock exclusive discounts, priority support, and premium resources today.
                </p>
                <Link href="/membership" className="block w-full py-4 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-100 active:scale-95 transition-all">
                  View Plans
                </Link>
             </div>
          )}
        </div>
      </MobileProfileLayout>
    </>
  );
}
