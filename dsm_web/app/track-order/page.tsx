'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { ProfileSidebar, MobileProfileLayout } from '@/components/profile';

import {
  Pencil,
  ShoppingBag,
  ShoppingCart,
  PackageCheck,
  Package,
  Truck,
  CheckCircle2,
  SquareCheckBig,
  ChevronLeft
} from 'lucide-react';

const trackingSteps = [
  { id: 1, label: 'Order Placed', date: '30 July 2026', status: 'completed', icon: ShoppingCart },
  { id: 2, label: 'Confirm', date: '30 July 2026', status: 'completed', icon: PackageCheck },
  { id: 3, label: 'On Processing', date: '30 July 2026', status: 'current', icon: Package },
  { id: 4, label: 'On Shipping', date: '30 July 2026', status: 'pending', icon: Truck },
  { id: 5, label: 'Delivered', date: '30 July 2026', status: 'pending', icon: CheckCircle2 },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [activeStep, setActiveStep] = useState(3); // Default to 'On Processing'

  const handleTrackOrder = () => {
    if (orderId.trim() || true) { // Allow for demo purposes
      setShowResult(true);
    }
  };

  const handleBack = () => {
    setShowResult(false);
  };

  const currentStepIndex = activeStep;

  return (
    <>
      <main className="hidden lg:block bg-white py-4 sm:py-6 md:py-8 min-h-screen">
        <div className="container-main py-4 sm:py-6 md:py-8">
          {/* Breadcrumb */}
          <p className="text-xs sm:text-sm text-gray-400 mb-4 uppercase">
            HOME &gt; MY ACCOUNT &gt;{" "}
            <span className="text-primary-500 uppercase">MY ORDERS</span>
          </p>

          <div className="mb-5 md:mb-7">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
              My Account
            </h1>
            <div className="w-40 sm:w-48 h-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-3">
              <ProfileSidebar activeItem="Track My Order" />
            </div>

            <div className="col-span-12 lg:col-span-9">
              <div className="bg-[#FAFAFA] rounded-2xl p-6 sm:p-8 md:p-6 shadow-sm border border-gray-100 min-h-[600px]">
                {/* Internal Header Section */}
                <div className="mb-8 md:mb-10 flex items-center justify-between">
                  <div>
                    <h2 className="pl-4 md:pt-4 text-2xl sm:text-3xl  text-[#000000]">
                      {showResult ? "Track My Order" : "My Order"}
                    </h2>
                    <div className=" w-32 sm:w-40 h-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] rounded-full ml-4" />
                  </div>
                </div>

                {!showResult ? (
                  <div className="space-y-8">
                    <div className="bg-white rounded-[32px] p-8 md:px-6 md:py-8 shadow-sm border border-gray-50 max-w-4xl">
                      <h3 className="text-lg font-bold text-[#333333] mb-1">Track Your Order</h3>
                      <p className="text-[#A0A0A0] text-sm font-medium">
                        Enter Order ID And Press "Track Order" Button to Track your Order
                      </p>
                    </div>
                    <div className="max-w-4xl pt-4">
                      <div className="relative">
                        <div className="absolute -top-[14px] left-8 z-10 rounded-full bg-white px-4 py-0.5 border border-[#E47B25]/20 shadow-sm">
                          <span className="text-sm text-[#333333]">Order ID</span>
                        </div>
                        <div className="relative group">
                          <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Enter Your Order ID"
                            className="w-full h-[72px] px-8 rounded-2xl border border-[#E47B25]/30 bg-white text-gray-800 placeholder-[#D0D0D0] focus:outline-none focus:ring-1 focus:ring-[#E47B25]/50 transition-all text-lg"
                          />
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[#D0D0D0]">
                            <Pencil size={24} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-10">
                        <button
                          onClick={handleTrackOrder}
                          className="bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white px-14 py-4 rounded-[20px] font-bold text-lg shadow-[0_10px_20px_-5px_rgba(228,123,37,0.3)] hover:opacity-90 transition-all"
                        >
                          Track Order
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-[32px] p-8 md:p-2 shadow-sm border border-gray-50 max-w-5xl">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#333333] border border-gray-100">
                          <ShoppingBag size={20} />
                        </div>
                        <span className="text-2xl  text-[#333333]">ORDR-12345</span>
                      </div>
                      <div className="bg-[#FFF8F1] px-4 py-2 rounded-full border border-[#E47B25]/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#E47B25]" />
                        <span className="text-[#E47B25] font-bold text-sm">Order {trackingSteps.find(s => s.id === activeStep)?.label}</span>
                      </div>
                    </div>
                    <div className="relative py-10 mt-4 overflow-x-auto no-scrollbar">
                      <div className="relative min-w-[700px] px-8">
                        <div className="absolute top-[85px] left-[12%] right-[12%] h-[2px] bg-[#E8E8E8] rounded-full" />
                        <div
                          className="absolute top-[85px] left-[12%] h-[2px] bg-[#E47B25] rounded-full z-10 transition-all duration-500"
                          style={{ width: `${Math.max(0, (activeStep - 1) * 19)}%` }}
                        />
                        <div className="flex justify-between relative z-20">
                          {trackingSteps.map((step, index) => {
                            const stepIndex = index + 1;
                            const isCompleted = stepIndex < activeStep;
                            const isCurrent = stepIndex === activeStep;
                            const isPending = stepIndex > activeStep;
                            return (
                              <button
                                key={step.id}
                                onClick={() => setActiveStep(stepIndex)}
                                className="flex flex-col items-center flex-1 group focus:outline-none"
                              >
                                <div className={` flex items-center justify-center mb-8 transition-all duration-300 group-hover:scale-110`}>
                                  <Image
                                    src="/track1.png"
                                    alt={step.label}
                                    width={60}
                                    height={60}
                                    className={`transition-all duration-300 ${isPending ? 'grayscale opacity-30 shadow-none' : 'grayscale-0 opacity-100 drop-shadow-md'}`}
                                  />
                                </div>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${isCompleted ? 'bg-[#E47B25] text-white shadow-md' : isCurrent ? 'bg-white border-[6px] border-[#E47B25] shadow-md' : 'bg-[#E8E8E8] border-[3px] border-white'}`}>
                                  {isCompleted && (
                                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                                      <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                                <div className="text-center">
                                  <p className={`text-base font-bold mb-6 transition-all duration-300 ${isCompleted || isCurrent ? 'text-[#E47B25]' : 'text-[#A0A0A0]'}`}>
                                    {step.label}
                                  </p>
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      {isCompleted || isCurrent ? (
                                        <SquareCheckBig size={14} className="text-[#E47B25]" />
                                      ) : null}
                                      <span className="text-[12px] font-medium text-[#A0A0A0]">Estimate Date</span>
                                    </div>
                                    <span className="text-base text-[#333333]">{step.date}</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileProfileLayout title="Track My order" onBack={showResult ? handleBack : undefined}>
        {!showResult ? (
          <div className="space-y-6 pt-4 pb-20">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#0D0C0D]">Track Order</h2>
              <div className="w-40 h-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] rounded-full mt-2" />
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-[#333333] mb-1">Track Your Order</h3>
              <p className="text-[#A0A0A0] text-xs font-medium">
                Enter Order ID And Press "Track Order" Button to Track your Order
              </p>
            </div>
            
            <div className="relative pt-2">
              <div className="absolute -top-[10px] left-6 z-10 rounded-full bg-white px-3 py-0.5 border border-[#E47B25]/20 shadow-sm">
                <span className="text-[10px] font-bold text-[#333333]">Order ID</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter Your Order ID"
                  className="w-full h-14 px-6 rounded-2xl border border-[#E47B25]/30 bg-white text-gray-800 focus:outline-none text-sm placeholder:text-gray-300"
                />
                <Pencil size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
            </div>
            
            <button
              onClick={handleTrackOrder}
              className="w-full bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-orange-100 active:scale-95 transition-all"
            >
              Track Order
            </button>
          </div>
        ) : (
          <div className="space-y-6 pt-2 pb-24">
            {/* Order Header Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  <ShoppingBag size={20} className="text-[#0D0C0D]" />
                </div>
                <span className="font-bold text-lg text-[#0D0C0D]">ORDR-12345</span>
              </div>
              <div className="flex items-center gap-2 bg-[#FFF8F1] px-4 py-2 rounded-full border border-[#E47B25]/10">
                <div className="w-2 h-2 rounded-full bg-[#E47B25] animate-pulse" />
                <span className="text-[#E47B25] font-bold text-[11px] whitespace-nowrap">On Deliver</span>
              </div>
            </div>
            
            {/* Stepper Container */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="relative flex flex-col gap-12">
                {/* Background Line */}
                <div className="absolute left-[13px] top-4 bottom-4 w-[3px] bg-gray-100 rounded-full" />
                
                {trackingSteps.map((step, index) => {
                  const stepIndex = index + 1;
                  const isCompleted = stepIndex < activeStep;
                  const isCurrent = stepIndex === activeStep;
                  const isPending = stepIndex > activeStep;
                  
                  return (
                    <div key={step.id} className="flex items-start gap-6 relative z-10">
                      {/* Connector Line */}
                      {index !== trackingSteps.length - 1 && (
                        <div 
                          className={`absolute left-[13px] top-6 w-[3px] h-12 transition-colors duration-500 ${isCompleted ? 'bg-[#E47B25]' : 'bg-gray-100'}`} 
                        />
                      )}
                      
                      {/* Circle Indicator */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm border-4 border-white transition-all duration-500 ${
                        isCompleted ? 'bg-[#E47B25] text-white' : 
                        isCurrent ? 'bg-white border-[#E47B25]' : 'bg-gray-100'
                      }`}>
                        {isCompleted && (
                          <CheckCircle2 size={14} strokeWidth={3} />
                        )}
                        {isCurrent && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#E47B25] animate-pulse" />
                        )}
                      </div>
                      
                      {/* Content Row */}
                      <div className="flex-1 flex items-center gap-4">
                        {/* Icon Container */}
                        <div className="flex flex-col items-center min-w-[70px]">
                          <div className={`w-14 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                            isPending ? 'border-gray-200 text-gray-300' : 'border-[#E47B25] text-[#E47B25] bg-[#FFF8F1]/50'
                          }`}>
                            <step.icon size={22} strokeWidth={isPending ? 1.5 : 2.5} />
                          </div>
                          <span className={`text-[10px] font-bold mt-2 whitespace-nowrap transition-colors duration-300 ${
                            isPending ? 'text-gray-400' : 'text-[#E47B25]'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                        
                        {/* Date Info */}
                        <div className="flex flex-col ml-auto text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <span className={`text-[10px] font-bold ${isPending ? 'text-gray-300' : 'text-gray-400'}`}>Estimate Date</span>
                          </div>
                          <span className={`text-[12px] font-black tracking-tight ${isPending ? 'text-gray-300' : 'text-[#333333]'}`}>
                            {step.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </MobileProfileLayout>
    </>
  );
}
