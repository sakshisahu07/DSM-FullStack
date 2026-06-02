import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProfileSidebar, MobileProfileLayout } from '@/components/profile';

export default function ProMembershipPage() {
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

                {/* Main White Block (Intro + Benefits) */}
                <div className="bg-white rounded-[32px] p-6 sm:p-8 lg:p-10 border border-gray-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-[1.75rem] font-bold text-[#1A1A1A] leading-tight mb-1">
                        Pro Membership
                      </h3>
                      <p className="text-[#999999] text-[13px] font-medium">
                        Best for Regular Buyers & Tech Enthusiasts
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white text-[11px] font-bold px-4 py-1.5 rounded-md shadow-sm xl:-space-x-1 shrink-0 mt-1">
                      Most Popular
                    </div>
                  </div>

                  <p className="text-[#333333] text-[14px] leading-relaxed mb-10 max-w-[90%] mt-6 font-medium">
                    Upgrade your learning and shopping experience with the DSM Pro Membership. This plan is designed for students, hobbyists, and frequent buyers who want bigger savings, premium resources, and early access to the latest electronics projects and kits.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8 items-center">
                    {/* Left Column: Benefits List */}
                    <div>
                      <h4 className="text-xl font-bold text-[#1A1A1A] mb-6">
                        Key Benefits
                      </h4>
                      <ul className="space-y-4">
                        {[
                          "10% discount on all products",
                          "Access to premium project guides and source codes",
                          "Early access to newly launched products",
                          "Priority customer support",
                          "Exclusive member-only offers",
                          "Faster checkout with saved details"
                        ].map((benefit, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <span className="w-1 h-1 rounded-full bg-black shrink-0"></span>
                            <span className="text-[#333333] text-[14px]">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right Column: Image */}
                    <div className="relative w-full aspect-[4/3] max-w-sm mx-auto md:mr-0 flex justify-end">
                      <div className="relative w-[110%] h-[110%] -mt-[5%] mr-[-5%] overflow-visible">
                        <Image
                          src="/member.png"
                          alt="DSM Pro Membership Benefits"
                          fill
                          className="object-contain object-right"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table & Pricing Card Section */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
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

                {/* Bottom Sticky-like Action Bar */}
                <div className="mt-10 pt-8 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[#666666] text-[12px] font-semibold mb-0.5">Pro Membership</span>
                      <div className="text-[#333333] text-lg font-bold flex items-center gap-1">
                        <span>499</span>
                        <span className="text-[#666666] text-sm font-medium">/ year</span>
                      </div>
                    </div>
                    
                    <Link href="/membership/pro/checkout" className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white text-[14px] font-bold px-10 py-3 rounded-xl shadow-[0_8px_20px_rgba(238,156,36,0.25)] hover:scale-105 transition-all">
                      Buy Now
                    </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileProfileLayout title="My Account">
        <div className="mb-6 pt-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#000000]">
            Pro Membership
          </h2>
          <div className="w-32 sm:w-40 h-1 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] rounded-full mt-4" />
        </div>
        <div className="space-y-6 pb-20">
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EE9C24]/20">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="text-2xl font-black text-gray-900">Pro Membership</h2>
                    <p className="text-[10px] font-bold text-[#EE9C24] uppercase tracking-widest">Most Popular Choice</p>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-[#EE9C24]/10 flex items-center justify-center">
                    <Image src="/member.png" alt="" width={32} height={32} />
                 </div>
              </div>
              
              <p className="text-xs text-gray-500 leading-relaxed mb-8">
                Designed for students and hobbyists who want bigger savings and premium resources.
              </p>

              <div className="space-y-4 mb-8">
                 {[
                   '10% Automatic Discount',
                   'Premium Project Codes',
                   'Early Product Access',
                   'Priority Live Support'
                 ].map((b, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                         <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-[13px] font-bold text-gray-700">{b}</span>
                   </div>
                 ))}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between mb-8">
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Yearly Plan</p>
                    <p className="text-xl font-black text-gray-900">₹499<span className="text-[10px] font-medium opacity-60">/yr</span></p>
                 </div>
                 <div className="px-3 py-1 bg-[#EE9C24] text-white rounded-lg text-[10px] font-black uppercase">Active</div>
              </div>

              <Link href="/membership/pro/checkout" className="block w-full bg-[#333333] text-white text-center py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">
                Upgrade Now
              </Link>
           </div>
        </div>
      </MobileProfileLayout>
    </>
  );
}
