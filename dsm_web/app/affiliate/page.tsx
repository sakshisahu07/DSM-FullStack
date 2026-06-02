"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import AffiliateRegistrationForm from '@/components/affiliate/AffiliateRegistrationForm';

export default function AffiliatePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white font-sans text-gray-800 pb-20">
      
      {/* ───── MOBILE HEADER ───── */}
      <div className="md:hidden bg-gradient-to-r from-[#EE9C24] to-[#B8420E] px-4 py-4 flex items-center gap-4 shadow-md sticky top-0 z-[100]">
        <button onClick={() => router.back()} className="text-white">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-bold text-white tracking-wide">Be an Affiliate</h1>
      </div>

      {/* ───── BREADCRUMB (Desktop) ───── */}
      <div className="hidden md:block max-w-[1400px] mx-auto px-6 pt-10">
        <div className="text-[13px] text-gray-400 flex items-center gap-2 ">
          HOME <span className="text-gray-300 mx-1">&gt;</span> 
          <span className="text-[#EE9C24]">BECOME A DSM AFFILIATE</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12">
        <AffiliateRegistrationForm />
      </div>

    </main>
  );
}
