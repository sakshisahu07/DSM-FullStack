'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { ProfileSidebar, MobileProfileLayout } from '@/components/profile';

export default function ProMembershipCheckoutPage() {
  const [selectedPayment, setSelectedPayment] = useState('upi');

  const tableData = [
    { feature: "Membership Duration", details: "1 Year" },
    { feature: "Product Discount", details: "10% on all orders" },
    { feature: "Project Access", details: "Premium guides & codes" },
    { feature: "New Product Access", details: "Early access" },
    { feature: "Support", details: "Priority support" },
    { feature: "Renewal", details: "Optional after 1 year" },
  ];

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
            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-3">
              <ProfileSidebar activeItem="Membership" />
            </div>

            <div className="col-span-12 lg:col-span-9">
              {/* Dashboard Container */}
              <div className="bg-[#FAFAFA] rounded-[40px] p-4 sm:p-6 lg:p-10 shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
                {/* Page Heading */}
                <div className="mb-8 px-2 group cursor-default">
                  <h2 className="text-2xl font-medium text-[#000000] mb-1.5 tracking-tight flex items-center gap-3">
                    Membership
                  </h2>
                  <div className="relative w-[150px] h-1">
                    <div className="absolute inset-0 bg-[#EE9C24] rounded-full w-full" />
                  </div>
                </div>

                {/* Top Intro Snippet */}
                <div className="bg-white rounded-[24px] p-6 lg:p-8 border border-gray-50 shadow-sm mb-6 flex justify-between items-start">
                  <div>
                    <h3 className="text-[1.5rem] font-bold text-[#1A1A1A] leading-tight mb-1">
                      Pro Membership
                    </h3>
                    <p className="text-[#999999] text-[12px] font-medium">
                      Best for Regular Buyers & Tech Enthusiasts
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white text-[10px] sm:text-[11px] font-bold px-4 py-1.5 rounded-md shadow-sm shrink-0">
                    Most Popular
                  </div>
                </div>

                {/* Table & Pricing Card Section */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mb-8">
                  {/* Feature Table */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm self-start">
                    <div className="grid grid-cols-[1fr_1.5fr] bg-[#FEF6EA] border-b border-gray-200">
                      <div className="px-6 py-4 text-[14px] font-bold text-[#333333]">Feature</div>
                      <div className="px-6 py-4 text-[14px] font-bold text-[#333333]">Details</div>
                    </div>
                    {tableData.map((row, index) => (
                      <div key={index} className={`grid grid-cols-[1fr_1.5fr] ${index !== tableData.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
                        <div className="px-6 py-4 text-[13px] font-medium text-[#555555]">{row.feature}</div>
                        <div className="px-6 py-4 text-[13px] text-[#333333]">{row.details}</div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing / CTA Card */}
                  <div className="bg-gradient-to-b from-[#EE9C24] to-[#B8420E] rounded-[24px] p-6 sm:p-8 border border-[#EE9C24]/20 flex flex-col relative overflow-hidden shadow-md transform h-full">
                    <div className="absolute top-[16px] -right-[32px] bg-white text-[#B8420E] text-[9px] font-bold py-1 px-10 rotate-45 shadow-sm uppercase tracking-wider">
                      Most Popular
                    </div>
                    <div className="inline-block border border-white rounded-[20px] px-4 py-1.5 text-[13px] font-semibold text-white w-max mb-5">
                      Pro Membership
                    </div>
                    <h4 className="text-[1rem] font-bold text-white leading-snug mb-4">
                      Best for Regular Buyers & Tech Enthusiasts
                    </h4>
                    <p className="text-[1rem] font-bold text-white mb-6">
                      Starting at ₹499/year
                    </p>
                    <ul className="space-y-2.5 mb-8 flex-grow">
                      {[
                        "Get 10% discount on all products",
                        "Access to premium project guides & codes",
                        "Early access to new products",
                        "Priority customer support"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="w-1 h-1 rounded-full bg-white mt-2 shrink-0"></span>
                          <span className="text-white text-[12px]">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="border border-white text-center rounded-full px-5 py-2.5 text-[13px] font-bold text-white w-max mt-auto hover:bg-white/10 transition-colors">
                      Subscribe Now
                    </button>
                  </div>
                </div>

                {/* Payment Option Header */}
                <div className="flex items-center gap-2 mb-4 px-2">
                  <h3 className="font-bold text-[14px] text-[#333333]">Payment Option</h3>
                </div>

                {/* Payment Options List */}
                <div className="space-y-4 mb-6 relative w-full">
                  {[
                    { id: 'upi', title: 'UPI | Wallets | EMI', offer: 'Extra 10% off', icon: '/upi.png', logos: '/payment.png' },
                    { id: 'cards', title: 'Net Banking | Cards', offer: 'Extra 10% off', icon: '/wallet2.png', fee: '₹150' },
                    { id: 'dsm', title: 'DSM Wallet', offer: 'Extra 15% off', icon: '/wallet.png', logos: '/logo.png' }
                  ].map((pay) => (
                    <label key={pay.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${selectedPayment === pay.id ? 'border-gray-200 bg-white shadow-sm ring-1 ring-gray-100' : 'border-gray-100 bg-white hover:border-[#EE9C24]/50'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPayment === pay.id ? 'border-[#333333]' : 'border-gray-300'}`}>
                          {selectedPayment === pay.id && <div className="w-2.5 h-2.5 bg-[#333333] rounded-full" />}
                        </div>
                        <input type="radio" name="payment" value={pay.id} checked={selectedPayment === pay.id} onChange={() => setSelectedPayment(pay.id)} className="hidden" />
                        <div className="bg-[#EE7B30] p-1.5 rounded-lg shrink-0 w-8 h-8 flex items-center justify-center">
                          <Image src={pay.icon} alt="" width={20} height={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#333333]">{pay.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Offer : Get {pay.offer}</p>
                        </div>
                      </div>
                      {pay.logos && <Image src={pay.logos} alt="" width={80} height={24} className="object-contain" />}
                      {pay.fee && <div className="text-right"><p className="text-[9px] font-bold text-gray-400 lowercase">Fee</p><p className="text-xs font-bold text-gray-800">{pay.fee}</p></div>}
                    </label>
                  ))}
                </div>

                {/* Bottom Sticky-like Action Bar */}
                <div className="mt-auto pt-6 border-t border-gray-200 flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="text-[#666666] text-[10px] font-semibold mb-0.5 uppercase tracking-wide">Pro Membership</span>
                      <p className="text-[#333333] text-[15px] font-bold leading-none">499 <span className="text-xs font-normal opacity-60">/ yr</span></p>
                    </div>
                    <button className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white text-[13px] font-bold px-10 py-2.5 rounded-lg shadow-xl">
                      Pay now
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileProfileLayout title="My Account">
        <div className="mb-6 pt-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#000000]">
            Pro Membership Checkout
          </h2>
          <div className="w-40 sm:w-56 h-1 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] rounded-full mt-4" />
        </div>
        <div className="space-y-6 pb-20">
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EE9C24]">
              <h2 className="text-lg font-black text-gray-900 mb-6">Payment Options</h2>
              <div className="space-y-4">
                 {[
                   { id: 'upi', t: 'UPI / Google Pay', d: 'Get Extra 10% Off', i: '/upi.png' },
                   { id: 'cards', t: 'Cards / Net Banking', d: 'Fast & Secure', i: '/wallet2.png' },
                   { id: 'dsm', t: 'DSM Wallet', d: 'Earn 15% Cashback', i: '/wallet.png' },
                 ].map((p, i) => (
                   <label key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedPayment === p.id ? 'border-[#EE9C24] bg-[#EE9C24]/30' : 'border-gray-100'}`}>
                      <input type="radio" name="pay_mob" checked={selectedPayment === p.id} onChange={() => setSelectedPayment(p.id)} className="hidden" />
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                         <Image src={p.i} alt="" width={24} height={24} />
                      </div>
                      <div className="flex-1">
                         <p className="text-sm font-bold text-gray-800">{p.t}</p>
                         <p className="text-[10px] text-[#EE9C24] font-bold">{p.d}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === p.id ? 'border-[#EE9C24]' : 'border-gray-300'}`}>
                         {selectedPayment === p.id && <div className="w-2.5 h-2.5 bg-[#EE9C24] rounded-full" />}
                      </div>
                   </label>
                 ))}
              </div>
           </div>

           <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Plan Summary</h3>
              <div className="flex justify-between items-center mb-2">
                 <span className="text-xs text-gray-500">Pro Membership (1 Year)</span>
                 <span className="text-xs font-bold text-gray-800">₹499.00</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                 <span className="text-xs text-gray-500">GST (Includes)</span>
                 <span className="text-xs font-bold text-gray-800">₹0.00</span>
              </div>
              <div className="h-px bg-gray-100 mb-4" />
              <div className="flex justify-between items-center">
                 <span className="text-sm font-black text-gray-900">Total Payable</span>
                 <span className="text-sm font-black text-orange-600">₹499.00</span>
              </div>
           </div>

           <button className="w-full bg-[#333333] text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">
             Pay Now
           </button>
        </div>
      </MobileProfileLayout>
    </>
  );
}
