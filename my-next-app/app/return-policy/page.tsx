"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchCompanyData } from '@/redux/slices/companySlice';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2 } from 'lucide-react';

const ReturnPolicyPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: companyData } = useSelector((state: RootState) => state.company);

  useEffect(() => {
    if (!companyData) {
      dispatch(fetchCompanyData());
    }
  }, [dispatch, companyData]);

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
              <span className="font-semibold text-[18px]">Return Policy</span>
            </div>
            <button className="p-2">
              <Share2 size={20} className="text-white" />
            </button>
         </div>

         <div className="bg-white pb-20 px-5 pt-8">
            <div className="flex flex-col items-center justify-center gap-2 mb-10">
               <h1 className="text-[24px] font-black text-[#333] text-center tracking-tighter uppercase mb-2">
                  Return Policy
               </h1>
               <div className="h-1 w-24 bg-[#EE9C24] rounded-full"></div>
            </div>

            <div className="max-w-full">
               {companyData?.return_policy ? (
                  <div className="space-y-12">
                     <div 
                        className="prose prose-orange max-w-none text-[#333333] text-[13px] font-bold leading-relaxed italic pr-2"
                        dangerouslySetInnerHTML={{ __html: companyData.return_policy }}
                     />
                     
                     {companyData.shippingAndDelivery && (
                        <div className="pt-10 border-t border-gray-100">
                           <div 
                              className="prose prose-orange max-w-none text-[#333333] text-[13px] font-bold leading-relaxed italic pr-2"
                              dangerouslySetInnerHTML={{ __html: companyData.shippingAndDelivery }}
                           />
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="flex justify-center py-20">
                     <div className="w-8 h-8 border-4 border-orange-100 border-t-[#EE9C24] rounded-full animate-spin" />
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* ───── DESKTOP VIEW ───── */}
      <div className="hidden lg:block">
        {/* Breadcrumb Section */}
        <div className="px-16 py-8 flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Home
          </Link>
          <span className="text-gray-200 font-medium">&gt;</span>
          <span className="text-[#EE9C24]">Return Policy</span>
        </div>

        {/* Main Title Section */}
        <div className="px-16 pb-24">
          <div className="flex items-center justify-center gap-10 mb-16">
            <div className="h-[4px] w-32 bg-[#EE9C24] rounded-full"></div>
            <h1 className="text-4xl font-medium text-[#333] text-center">
              Return Policy
            </h1>
            <div className="h-[4px] w-32 bg-[#EE9C24] rounded-full"></div>
          </div>

          <div className="max-w-5xl mx-auto">
            {companyData?.return_policy ? (
              <div className="space-y-12">
                <div 
                  className="prose prose-orange max-w-none text-[#333333] text-[1.2rem] font-bold leading-[1.8] opacity-90"
                  dangerouslySetInnerHTML={{ __html: companyData.return_policy }}
                />
                
                {companyData.shippingAndDelivery && (
                  <div className="pt-12 border-t border-gray-100">
                     <div 
                      className="prose prose-orange max-w-none text-[#333333] text-[1.2rem] font-bold leading-[1.8] opacity-90"
                      dangerouslySetInnerHTML={{ __html: companyData.shippingAndDelivery }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                Loading return policy...
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ReturnPolicyPage;
