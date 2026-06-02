"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SupportPolicyPage = () => {
  const router = useRouter();

  return (
    <main className="bg-white min-h-screen font-sans">
      
      {/* ───── MOBILE VIEW ───── */}
      <div className="lg:hidden">
         {/* Custom Header */}
         <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] px-4 py-4 flex items-center justify-between text-white sticky top-0 z-50">
            <div className="flex items-center">
              <button onClick={() => router.back()} className="mr-3">
                <ArrowLeft size={22} className="text-white" />
              </button>
              <span className="font-semibold text-[18px]">Support Policy</span>
            </div>
            <button className="p-2">
              <Share2 size={20} className="text-white" />
            </button>
         </div>

         <div className="bg-white pb-20 px-5 pt-8">
            <div className="flex flex-col items-center justify-center gap-2 mb-12">
               <h1 className="text-[24px] font-black text-[#333] text-center tracking-tighter uppercase mb-2">
                  Support Policy
               </h1>
               <div className="h-1 w-24 bg-[#EE9C24] rounded-full"></div>
            </div>

            <div className="space-y-12">
               {/* Section 1 */}
               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <h2 className="text-[18px] font-black text-[#333]">Hey There!!</h2>
                     <div className="h-0.5 w-16 bg-[#EE9C24] opacity-50"></div>
                  </div>
                  <p className="text-[13px] font-bold text-gray-500 leading-relaxed italic pr-2">
                     Welcome To The Bright Side Of DSM Online. We Specialize In Electronics Technology And Offer A Wide Range Of Goods And Services In This Field. Having Been Founded In 2018, DSM Online Is One Of Bhopal&apos;s Fastest-Growing Electronic Component Companies.
                  </p>
               </div>

               {/* Section 2 */}
               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <h2 className="text-[18px] font-black text-[#333] leading-tight pr-4">DSM Online Support System: Quick solutions to all of your shopping queries</h2>
                     <div className="h-0.5 w-16 bg-[#EE9C24] opacity-50"></div>
                  </div>
                  <p className="text-[13px] font-bold text-gray-500 leading-relaxed italic pr-2">
                     After you&apos;ve placed your order with any service provider, the next important task is to queue up for your purchase to arrive. The entire buying experience has changed dramatically thanks to services like Dsm Online. You may now shop whenever you want, from wherever, and for whatever you want.
                  </p>
               </div>

               {/* Section 3 */}
               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <h2 className="text-[18px] font-black text-[#333]">24x7 Customer Care Assistance</h2>
                     <div className="h-0.5 w-16 bg-[#EE9C24] opacity-50"></div>
                  </div>
                  <p className="text-[13px] font-bold text-gray-500 leading-relaxed italic pr-2">
                     Any question or issue you may have when buying on DSM Online will be addressed here. This page is effortless to operate, and support is available nearly instantly. You may obtain help at any time and get a good answer to your questions and problems in a matter of minutes.
                  </p>
               </div>

               {/* Section 4 */}
               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <h2 className="text-[18px] font-black text-[#333]">Kinds Of Assistance Within DSM Support Policy</h2>
                     <div className="h-0.5 w-16 bg-[#EE9C24] opacity-50"></div>
                  </div>
                  <p className="text-[13px] font-bold text-gray-500 leading-relaxed italic pr-2">
                     In addition to assisting you with your orders and/or difficulties with delivered products, the DSM Help Centre offers a variety of other services. Specific support issues, such as cancellations and returns, wallet, insurance, Gift Card, and so on, are also covered here.
                  </p>
                  <p className="text-[13px] font-bold text-gray-500 leading-relaxed italic pr-2">
                     So, go into your DSM account and shop with total ease and assistance. The DSM Help Centre is located on the DSM website and is accessible to assist any DSM client with any issues they may have.
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* ───── DESKTOP VIEW ───── */}
      <div className="hidden lg:block">
        {/* Breadcrumb Section */}
        <div className="px-16 py-8 flex items-center gap-2 text-xs font-black tracking-widest uppercase text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Home
          </Link>
          <span className="text-gray-200 font-bold">&gt;</span>
          <span className="text-[#EE9C24]">Support Policy</span>
        </div>

        {/* Main Title Section */}
        <div className="px-16 pb-24">
          <div className="flex items-center justify-center gap-10 mb-16">
            <div className="h-[4px] w-32 bg-[#EE9C24] rounded-full"></div>
            <h1 className="text-4xl font-black text-[#333] text-center tracking-tighter uppercase">
              Support Policy
            </h1>
            <div className="h-[4px] w-32 bg-[#EE9C24] rounded-full"></div>
          </div>

          <div className="max-w-5xl mx-auto space-y-16 text-[#333333] text-[1.1rem]">
            {/* Section 1 */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tight">Hey There!!</h2>
                <div className="h-[3px] w-32 bg-[#EE9C24]"></div>
              </div>
              <p className="leading-relaxed font-bold text-gray-500 opacity-90 italic">
                Welcome To The Bright Side Of DSM Online. We Specialize In Electronics Technology And Offer A Wide Range Of Goods And Services In This Field. Having Been Founded In 2018, DSM Online Is One Of Bhopal&apos;s Fastest-Growing Electronic Component Companies. We Are A Great One Point Supplier For All Of Your Requirements Because Of Our Focus On Customer Satisfaction And Professional Technical Assistance.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tight">DSM Online Support System: Quick solutions to all of your shopping queries</h2>
                <div className="h-[3px] w-32 bg-[#EE9C24]"></div>
              </div>
              <p className="leading-relaxed font-bold text-gray-500 opacity-90 italic">
                After you&apos;ve placed your order with any service provider, the next important task is to queue up for your purchase to arrive. If you do not receive updates regarding your order or do not receive help after it is delivered, this period can be extremely stressful. However, owing to all of the help regarding your order, the DSM Online Support Policy makes your wait thrilling and your shopping experience enjoyable.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tight">24x7 Customer Care Assistance</h2>
                <div className="h-[3px] w-32 bg-[#EE9C24]"></div>
              </div>
              <p className="leading-relaxed font-bold text-gray-500 opacity-90 italic">
                Any question or issue you may have when buying on DSM Online will be addressed here. This page is effortless to operate, and support is available nearly instantly. This page appears when you enter into your DSM Online account and displays your latest orders as well as allowing you to report any issues. You may obtain help at any time and get a good answer to your questions and problems in a matter of minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SupportPolicyPage;
