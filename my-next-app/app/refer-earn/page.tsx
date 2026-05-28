'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { ProfileSidebar, MobileProfileLayout } from '@/components/profile';
import { Copy, Share2 } from 'lucide-react';

export default function ReferEarnPage() {
  const [referralLink] = useState('https://dsmelectro/refer&earn/234501');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <main className="hidden lg:block bg-white py-4 sm:py-6 md:py-8 min-h-screen">
        <div className="container-main py-4 sm:py-6 md:py-8">
          {/* Breadcrumb */}
          <p className="text-xs sm:text-sm text-gray-400 mb-4 uppercase">
            HOME &gt; MY ACCOUNT &gt;{" "}
            <span className="text-[#EE9C24] uppercase">REFER & EARN</span>
          </p>

          <div className="mb-5 md:mb-7">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
              My Account
            </h1>
            <div className="w-40 sm:w-48 h-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-3">
              <ProfileSidebar activeItem="Refer & Earn" />
            </div>

            <div className="col-span-12 lg:col-span-9">
              <div className="bg-[#FAFAFA] rounded-xl p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100 min-h-[600px]">
                {/* Internal Header Section */}
                <div className="mb-8 md:mb-10">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                    Refer & Earn
                  </h2>
                  <div className="w-32 sm:w-40 h-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] rounded-full mt-4" />
                </div>

                {/* Top Section: Parallel Cards */}
                <div className="flex flex-col lg:flex-row gap-2 items-stretch">
                  {/* Left Card: Text and Referral Link */}
                  <div className="flex bg-white rounded-[32px] p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center ">
                    <div className="space-y-4">
                      <h3 className="text-[1rem]  font-bold text-[#333333] ">
                        Save ₹250 for every business you refer
                      </h3>
                      <p className="text-[#A0A0A0] text-[0.8rem] leading-relaxed max-w-lg line-clamp-3">
                        Invite businesses to Part Of DSM Electro and get a ₹2,000 coupon for every Business that becomes a paying member. As a welcome gift, they’ll also get ₹2,000 off.
                      </p>
                    </div>

                    {/* Referral Link Box with Floating Label */}
                    <div className="relative mt-8 group">
                      {/* Floating Label on Border */}
                      <div className="absolute -top-[14px] left-8 z-10 bg-white px-2 flex items-center gap-2">
                         <span className="text-sm font-bold text-[#666666]">Share your unique invite link</span>
                      </div>
                      
                      {/* Link Container */}
                      <div className=" w-full bg-white border border-[#F39237] rounded-lg px-6 py-4 flex items-center justify-between shadow-sm transition-all">
                        <span className="text-[#333333] font-medium text-sm sm:text-lg overflow-hidden text-ellipsis whitespace-nowrap">
                          {referralLink}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                      <button 
                        onClick={handleCopy}
                        className="flex-1 sm:flex-initial bg-white border border-[#E47B25] text-[#E47B25] font-bold py-3 px-10 rounded-full hover:bg-primary-50 transition-all text-center"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button className="flex-1 sm:flex-initial bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white font-bold py-3 px-10 rounded-full shadow-[0_10px_20px_-5px_rgba(228,123,37,0.3)] hover:opacity-90 transition-all flex items-center justify-center gap-2">
                        Share Invite
                      </button>
                    </div>
                  </div>

                  {/* Right Card: Illustration */}
                  <div className="  bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center">
                    <Image 
                      src="/refer.png" 
                      alt="Refer and Earn Illustration" 
                      width={500} 
                      height={500}
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* How Invites Work Section */}
                <div className="mt-12 bg-white rounded-[32px] p-4  border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <h3 className="text-[1rem] font-bold text-[#333333] mb-4">How invites work</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <div className="bg-white rounded-[24px]  border border-gray-50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center transition-all hover:shadow-lg group">
                      <div className="w-full aspect-square relative mb-6 rounded-[20px] overflow-hidden bg-[#F9F9F9]">
                        <Image 
                          src="/media1.png" 
                          alt="Send invites" 
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <h4 className="text-[1rem] font-medium text-[#333333] mb-3 text-center">Send invites</h4>
                      <p className="text-[#686868] text-[0.7rem] text-center leading-relaxed px-2">
                        Invite businesses who don't have an Acadium account yet to sign up through your link.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white rounded-[24px]  border border-gray-50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center transition-all hover:shadow-lg group">
                      <div className="w-full aspect-square relative mb-6 rounded-[20px] overflow-hidden bg-[#F9F9F9]">
                        <Image 
                          src="/media3.png" 
                          alt="They get a discount" 
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <h4 className="text-[1rem] font-medium text-[#333333] mb-3 text-center">They get a discount</h4>
                      <p className="text-[#686868] text-[0.7rem] text-center leading-relaxed px-2">
                        Businesses who sign up with your link will get ₹2,000 off their first payment.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white rounded-[24px]  border border-gray-50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center transition-all hover:shadow-lg group">
                      <div className="w-full aspect-square relative mb-6 rounded-[20px] overflow-hidden bg-[#F9F9F9]">
                        <Image 
                          src="/media2.png" 
                          alt="You save" 
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <h4 className="text-[1rem] font-medium text-[#333333] mb-3 text-center">You save</h4>
                      <p className="text-[#686868] text-[0.7rem] text-center leading-relaxed px-2">
                        You'll get a ₹2,000 coupon for every business that becomes a paying member.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile view */}
      <MobileProfileLayout title="Refer & earn">
        <div className="bg-white rounded-[32px] overflow-hidden flex items-center justify-center -mx-4 mt-2">
          <Image 
            src="/refer.png" 
            alt="Refer and Earn Illustration" 
            width={400} 
            height={400}
            className="object-cover w-full scale-110"
          />
        </div>
        
        <div className="px-2 mt-4 flex flex-col items-center">
          <h3 className="text-lg font-black text-gray-800 text-center mb-3">
            Save $250 for every business you refer
          </h3>
          <p className="text-[#A0A0A0] text-[11px] font-medium text-center leading-relaxed max-w-sm mb-8 px-2">
            Invite businesses to Part Of DSM Electra and get a ₹2,000 coupon for every Business that becomes a paying member. As a welcome gift, they'll also get ₹2,000 off.
          </p>

          {/* Referral Link Box with Floating Label */}
          <div className="relative group w-full mb-8">
            {/* Floating Label on Border */}
            <div className="absolute -top-[10px] left-6 z-10 bg-[#FAFAFA] px-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500">Share your unique invite link</span>
            </div>
            
            {/* Link Container */}
            <div className="w-full bg-white border border-[#F39237] rounded-xl px-4 py-4 flex items-center justify-start shadow-sm">
              <span className="text-[#333333] font-medium text-[13px] overflow-hidden text-ellipsis whitespace-nowrap">
                {referralLink}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-4 w-full justify-center">
            <button 
              onClick={handleCopy}
              className="flex-1 bg-white border border-[#E47B25] text-[#E47B25] text-sm font-bold py-3.5 rounded-full hover:bg-orange-50 transition-all text-center tracking-wide shadow-sm"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button className="flex-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white text-sm font-bold py-3.5 rounded-full shadow-[0_10px_20px_-5px_rgba(228,123,37,0.3)] hover:opacity-90 transition-all text-center tracking-wide active:scale-95">
              Share Invite
            </button>
          </div>
        </div>
      </MobileProfileLayout>
    </>
  );
}
