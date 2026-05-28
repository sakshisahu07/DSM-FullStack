'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProfileSidebar, MobileProfileLayout } from '@/components/profile';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchMembershipPlans } from '@/redux/slices/membershipSlice';

export default function MembershipPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { plans: apiPlans, loading } = useSelector((state: RootState) => state.membership);
  const [mobileView, setMobileView] = useState<'plans' | 'details' | 'payment'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => {
    console.log("MembershipPage: Dispatching fetchMembershipPlans");
    dispatch(fetchMembershipPlans());
  }, [dispatch]);

  const benefits = [
    "Extra discounts on every order",
    "Access to premium project files & codes",
    "Early access to new products and kits",
    "Special member-only deals",
    "Priority customer support",
    "Free or discounted shipping (selected plans)",
  ];

  const getTierDetails = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum':
        return {
          sub: "Ideal for Schools, Colleges & Bulk Buyers",
          color: "bg-gradient-to-b from-[#EE9C24] to-[#B8420E] text-white border-0 shadow-lg",
          pro: true
        };
      case 'gold':
        return {
          sub: "Best for Regular Buyers & Tech Enthusiasts",
          color: "bg-white text-gray-800 border-gray-100",
          pro: false
        };
      case 'silver':
      default:
        return {
          sub: "Perfect for Students & Beginners",
          color: "bg-white text-gray-800 border-gray-100",
          pro: false
        };
    }
  };

  const formattedPlans = (apiPlans || []).map((plan: any) => ({
    ...plan,
    title: plan.name,
    sub: getTierDetails(plan.tier).sub,
    price: `₹${plan.price}/${plan.billing_cycle}`,
    priceVal: plan.price?.toString() || "0",
    items: plan.perks || [],
    color: getTierDetails(plan.tier).color,
    pro: getTierDetails(plan.tier).pro
  }));

  console.log("MembershipPage: Render", { loading, apiPlansCount: apiPlans?.length, formattedPlansCount: formattedPlans.length });

  const handleViewDetails = (plan: any) => {
    setSelectedPlan(plan);
    setMobileView('details');
  };

  const handleBuyNow = () => {
    setMobileView('payment');
  };

  const handleBack = () => {
    if (mobileView === 'payment') setMobileView('details');
    else if (mobileView === 'details') setMobileView('plans');
  };

  return (
    <>
      <main className="hidden lg:block bg-white py-4 sm:py-6 md:py-8 min-h-screen font-sans">
        <div className="container-main py-4 sm:py-6 md:py-8">
          {/* Breadcrumb */}
          <p className="text-xs sm:text-sm text-gray-400 mb-4 uppercase">
            HOME &gt; MY ACCOUNT &gt;{" "}
            <span className="text-[#EE9C24] uppercase">MEMBERSHIP</span>
          </p>

          <div className="mb-5 md:mb-7">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
              My Account
            </h1>
            <div className="w-40 sm:w-48 h-1 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="hidden lg:block lg:col-span-3">
              <ProfileSidebar activeItem="Membership" />
            </div>

            <div className="col-span-12 lg:col-span-9">
              <div className="bg-[#FAFAFA] rounded-2xl p-4 sm:p-6 lg:p-10 shadow-sm border border-gray-100 min-h-[600px]">
                <div className="mb-8 px-2 group cursor-default">
                  <h2 className="text-2xl font-medium text-[#000000] mb-1.5 tracking-tight flex items-center gap-3">
                    Membership
                  </h2>
                  <div className="relative w-[150px] h-1">
                    <div className="absolute inset-0 bg-[#EE9C24] rounded-full w-full" />
                  </div>
                </div>

                <div className="bg-white rounded-[32px] p-6 sm:p-8 lg:p-10 border border-gray-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <h3 className="text-[1.75rem] font-bold text-[#1A1A1A] leading-tight mb-2">
                    Become a DSM Member & Save on Every Purchase
                  </h3>
                  <p className="text-[#999999] text-sm md:text-base mb-6 font-medium">
                    Get exclusive Benefits with our membership
                  </p>
                  <p className="text-[#333333] text-[15px] leading-relaxed mb-10 max-w-4xl">
                    Join the DSM Membership Program and unlock exclusive benefits on electronics kits, projects, and learning resources. Whether you're a student, hobbyist, or institution, our membership helps you save more and learn better.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div>
                      <h4 className="text-2xl font-bold text-[#1A1A1A] mb-6">
                        Why Join DSM Membership?
                      </h4>
                      <ul className="space-y-4">
                        {benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0"></span>
                            <span className="text-[#333333] text-[15px]">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="relative w-full aspect-square md:aspect-[4/3] max-w-md mx-auto md:ml-auto md:mr-0 flex justify-end">
                      <div className="relative w-full h-full max-h-[350px]">
                        <Image
                          src="/member.png"
                          alt="DSM Membership Benefits"
                          fill
                          className="object-contain object-right"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
                  {loading ? (
                    <div className="col-span-3 py-20 flex justify-center items-center">
                       <div className="w-8 h-8 border-4 border-[#EE9C24] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : formattedPlans.length === 0 ? (
                    <div className="col-span-3 py-20 text-center text-gray-400">No active plans available.</div>
                  ) : (
                    formattedPlans.map((p: any, idx: number) => (
                      <div key={idx} className={`${p.pro ? 'bg-gradient-to-b from-[#EE9C24] to-[#B8420E] text-white border-[#EE9C24]/20' : 'bg-white text-[#333333] border-gray-200'} rounded-[24px] p-6 border flex flex-col hover:shadow-lg transition-all relative overflow-hidden`}>
                        {p.pro && <div className="absolute top-[16px] -right-[32px] bg-white text-[#B8420E] text-[9px] font-bold py-1 px-10 rotate-45 shadow-sm uppercase tracking-wider">Most Popular</div>}
                        <div className={`inline-block border rounded-[20px] px-4 py-1.5 text-[13px] font-semibold w-max mb-5 ${p.pro ? 'border-white text-white' : 'border-black text-[#333333]'}`}>{p.title}</div>
                        <h4 className="text-[1rem] font-bold leading-snug mb-2 min-h-[45px]">{p.sub}</h4>
                        <p className="text-[1rem] font-bold mb-5">Starting at {p.price}</p>
                        <ul className="space-y-2.5 mb-6 flex-grow">
                          {p.items.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className={`w-1 h-1 rounded-full mt-2 shrink-0 ${p.pro ? 'bg-white' : 'bg-[#333333]'}`}></span>
                              <span className={`text-[12px] ${p.pro ? 'text-white' : 'text-gray-600'}`}>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <button 
                          onClick={() => handleViewDetails(p)}
                          className={`border rounded-full px-5 py-2 text-[13px] font-bold w-max transition-colors ${p.pro ? 'border-white text-white hover:bg-white/10' : 'border-black text-[#333333] hover:bg-gray-50'}`}>View Details</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileProfileLayout title="Membership" onBack={handleBack}>
        {mobileView === 'plans' && (
          <div className="flex flex-col gap-6 px-1">
            <div className="space-y-2 mt-2">
              <h2 className="text-[17px] font-black text-gray-800 leading-tight">
                Become a DSM Member & Save on Every Purchase
              </h2>
              <p className="text-gray-400 text-[11px] font-medium leading-relaxed">
                Get exclusive Benefits with our membership
              </p>
            </div>

            <p className="text-gray-700 text-[11px] font-medium leading-relaxed">
              Join the DSM Membership Program and unlock exclusive benefits on electronics kits, projects, and learning resources. Whether you're a student, hobbyist, or institution, our membership helps you save more and learn better.
            </p>

            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden -mx-1">
              <Image 
                src="/member.png" 
                alt="Membership Promo" 
                fill 
                className="object-contain scale-110"
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black text-gray-800">Choose Membership</h3>
              <div className="space-y-4">
                <h4 className="text-base font-black text-gray-800">Why Join DSM Membership?</h4>
                <ul className="space-y-3 px-2">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-1.5 shrink-0"></span>
                      <span className="text-gray-600 text-[11px] font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-nowrap gap-4 overflow-x-auto no-scrollbar pb-6 px-1">
                {loading ? (
                   <div className="flex-shrink-0 w-full py-10 flex justify-center items-center">
                      <div className="w-6 h-6 border-2 border-[#EE9C24] border-t-transparent rounded-full animate-spin"></div>
                   </div>
                ) : formattedPlans.length === 0 ? (
                  <div className="flex-shrink-0 w-full py-10 text-center text-gray-400 text-xs">No active plans available.</div>
                ) : (
                  formattedPlans.map((p: any, idx: number) => (
                    <div key={idx} className={`flex-shrink-0 w-[240px] rounded-3xl p-5 border flex flex-col ${p.color} transition-all`}>
                      <div className={`inline-block border rounded-full px-4 py-1 text-[10px] font-bold w-max mb-4 ${p.pro ? 'border-white text-white' : 'border-[#333333] text-[#333333]'}`}>{p.title}</div>
                      <h4 className="text-xs font-bold leading-snug mb-2 min-h-[30px]">{p.sub}</h4>
                      <p className="text-sm font-black mb-5">{p.price}</p>
                      <ul className="space-y-2 mb-6 flex-grow">
                        {p.items.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${p.pro ? 'bg-white' : 'bg-[#EE9C24]'}`}></span>
                            <span className="text-[9px] font-medium opacity-90">{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetails(p)}
                          className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${p.pro ? 'border border-white text-white' : 'border border-gray-300 text-gray-800'}`}>
                          View Details
                        </button>
                        <button 
                          onClick={() => { setSelectedPlan(p); handleBuyNow(); }}
                          className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${p.pro ? 'bg-white text-[#B3520A]' : 'bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white shadow-sm'}`}>
                          Buy Now
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {mobileView === 'details' && selectedPlan && (
          <div className="flex flex-col gap-6 px-1 animate-in fade-in slide-in-from-right-4 duration-300 pb-40">
            <div className="flex items-center justify-between mt-2">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-gray-800">{selectedPlan.title}</h2>
                <p className="text-gray-400 text-[10px] font-medium">{selectedPlan.sub}</p>
              </div>
              <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white text-[8px] font-black px-4 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">Most Popular</div>
            </div>

            <p className="text-gray-700 text-[11px] font-medium leading-relaxed">
              Upgrade your learning and shopping experience with the DSM {selectedPlan.title}. This plan is designed for students, hobbyists, and frequent buyers who want bigger savings, premium resources, and early access to the latest electronics projects and kits.
            </p>

            <table className="w-full border border-[#FFF8F1] rounded-2xl overflow-hidden border-collapse">
              <thead>
                <tr className="bg-[#FFF8F1]">
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-800">Feature</th>
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-800">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {[
                  ["Membership Duration", "1 Year"],
                  ["Product Discount", selectedPlan.pro ? "10% on all orders" : "5% on every purchase"],
                  ["Project Access", "Premium guides & codes"],
                  ["New Product Access", "Early access"],
                  ["Support", selectedPlan.pro ? "Priority support" : "Email support"],
                  ["Renewal", "Optional after 1 year"],
                ].map(([f, d], i) => (
                  <tr key={i} className="border-b border-[#FFF8F1] last:border-0 text-gray-600">
                    <td className="py-2.5 px-4 text-[9px] font-medium">{f}</td>
                    <td className="py-2.5 px-4 text-[9px] font-semibold">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="text-lg font-black text-gray-800">Choose Membership</h3>
            <div className={`w-full rounded-3xl p-8 border flex flex-col relative overflow-hidden ${selectedPlan.color} shadow-xl shadow-[#EE9C24]/20`}>
              <div className="absolute top-[16px] -right-[32px] bg-white text-[#B3520A] text-[7px] font-black py-1 px-10 rotate-45 shadow-sm uppercase tracking-wider">Most Popular</div>
              <div className={`inline-block border rounded-full px-6 py-2 text-[12px] font-bold w-max mb-6 ${selectedPlan.pro ? 'border-white text-white' : 'border-[#333333] text-[#333333]'}`}>{selectedPlan.title}</div>
              <h4 className="text-sm font-bold leading-tight mb-2 pr-8">{selectedPlan.sub}</h4>
              <p className="text-lg font-black mb-6">{selectedPlan.price}</p>
              <ul className="space-y-3 mb-2">
                {selectedPlan.items.map((item: any, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${selectedPlan.pro ? 'bg-white' : 'bg-[#EE9C24]'}`}></span>
                    <span className="text-[10px] font-medium opacity-90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-black text-gray-800">Key Benefits</h4>
              <ul className="space-y-3 px-2">
                {[
                  selectedPlan.pro ? "10% discount on all products" : "5% discount on all products",
                  "Access to premium project guides and source codes",
                  "Early access to newly launched products",
                  "Priority customer support",
                  "Exclusive member-only offers",
                  "Faster checkout with saved details",
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-1.5 shrink-0"></span>
                    <span className="text-gray-600 text-[11px] font-medium">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="fixed bottom-[65px] left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between z-[90]">
              <div>
                <p className="text-[10px] text-gray-400 font-bold">{selectedPlan.title}</p>
                <p className="text-lg font-black text-gray-800">₹{selectedPlan.priceVal} <span className="text-xs text-gray-400 font-medium">/ year</span></p>
              </div>
              <button 
                onClick={handleBuyNow}
                className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white px-10 py-3 rounded-full font-black text-xs shadow-lg shadow-[#EE9C24] active:scale-95 transition-all">
                Buy Now
              </button>
            </div>
          </div>
        )}

        {mobileView === 'payment' && selectedPlan && (
          <div className="flex flex-col gap-6 px-1 animate-in fade-in slide-in-from-right-4 duration-300 pb-40">
            <div className="flex items-center justify-between mt-2">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-gray-800">{selectedPlan.title}</h2>
                <p className="text-gray-400 text-[10px] font-medium">{selectedPlan.sub}</p>
              </div>
              <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white text-[8px] font-black px-4 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">Most Popular</div>
            </div>

            <div className={`w-full rounded-3xl p-8 border flex flex-col relative overflow-hidden ${selectedPlan.color} shadow-lg mt-2`}>
              <div className="absolute top-[16px] -right-[32px] bg-white text-[#B3520A] text-[7px] font-black py-1 px-10 rotate-45 shadow-sm uppercase tracking-wider">Most Popular</div>
              <div className={`inline-block border rounded-full px-6 py-2 text-[12px] font-bold w-max mb-6 ${selectedPlan.pro ? 'border-white text-white' : 'border-[#333333] text-[#333333]'}`}>{selectedPlan.title}</div>
              <h4 className="text-sm font-bold leading-tight mb-2 pr-8">{selectedPlan.sub}</h4>
              <p className="text-lg font-black mb-6">{selectedPlan.price}</p>
              <ul className="space-y-3">
                {selectedPlan.items.slice(0, 4).map((item: any, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${selectedPlan.pro ? 'bg-white' : 'bg-[#EE9C24]'}`}></span>
                    <span className="text-[10px] font-medium opacity-90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-gray-800">Payment Option</h3>
                <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-400">i</div>
              </div>
              
              <div className="space-y-3">
                {[
                  { id: 'upi', label: 'UPI | Wallets | EMI | Amazon Pay', icon: '/pay2.png', desc: 'Offer - Get Extra 10% discount on UPI Payment' },
                  { id: 'card', label: 'Net Banking | Credit | Debit Card', icon: '/pay3.png', desc: 'Offer - Get Extra 10% discount on Cards Payment', fee: '150' },
                  { id: 'cod', label: 'Cash On Delivery', icon: '/pay1.png', desc: 'Offer - Get 5% discount on Pre-paid', fee: '150' },
                  { id: 'wallet', label: 'DSM Wallet', icon: '/wallet.png', desc: 'Offer - Use your DSM wallet balance' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-4 bg-white border border-gray-50 rounded-2xl p-4 shadow-sm active:bg-orange-50/30 transition-colors cursor-pointer">
                    <input type="radio" name="payment" className="w-5 h-5 accent-[#EE9C24] shrink-0" defaultChecked={opt.id === 'upi'} />
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden p-2">
                       <Image src={opt.icon} alt={opt.label} width={40} height={40} className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="text-[11px] font-black text-gray-800 truncate">{opt.label}</p>
                        {opt.id === 'upi' && <Image src="/upi.png" alt="UPI" width={30} height={10} />}
                        {opt.id === 'wallet' && <Image src="/logo.png" alt="Wallet" width={25} height={10} />}
                      </div>
                      <p className="text-[8px] text-gray-400 font-medium">{opt.desc}</p>
                    </div>
                    {opt.fee && (
                      <div className="text-right shrink-0">
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Fee</p>
                        <p className="text-[11px] font-black text-gray-800">₹{opt.fee}</p>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="fixed bottom-[65px] left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between z-[90]">
              <div>
                <p className="text-[10px] text-gray-400 font-bold">{selectedPlan.title}</p>
                <p className="text-lg font-black text-gray-800">₹{selectedPlan.priceVal} <span className="text-xs text-gray-400 font-medium">/ year</span></p>
              </div>
              <button 
                onClick={() => alert("Redirecting to payment...")}
                className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white px-10 py-3 rounded-xl font-black text-xs shadow-lg shadow-[#EE9C24] active:scale-95 transition-all">
                Pay Now
              </button>
            </div>
          </div>
        )}
      </MobileProfileLayout>
    </>
  );
}
