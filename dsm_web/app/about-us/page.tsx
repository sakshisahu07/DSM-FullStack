"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchCompanyData } from '@/redux/slices/companySlice';
import { ChevronLeft, Rocket, Users, Zap, Package } from 'lucide-react';

export default function AboutUsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: companyData } = useSelector((state: RootState) => state.company);

  useEffect(() => {
    if (!companyData) {
      dispatch(fetchCompanyData());
    }
  }, [dispatch, companyData]);

  return (
    <main className="bg-white min-h-screen font-sans text-gray-800">
      
      {/* MOBILE VIEW - Exact match to screenshot */}
      <div className="md:hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#E47B25] to-[#B3520A] px-4 py-8 flex items-center gap-4 sticky top-0 z-[100] shadow-md">
          <button 
            onClick={() => router.back()}
            className="text-white hover:bg-white/10 p-1 rounded-full transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-xl font-bold text-white tracking-wide">About us</h1>
        </div>

        {/* Hero Section */}
        <section className="px-6 py-10 relative overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-extrabold text-black leading-tight mb-8">
            We&apos;re <span className="text-[#E47B25]">Changing</span> the whole game
          </h2>

          <div className="relative w-full aspect-square mb-10">
            {/* Background Decorative Shapes */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border-2 border-[#E7F1FF] rounded-[40px] rotate-12" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border-2 border-[#E7F1FF] rounded-[40px] -rotate-6" />
            
            {/* Main Hero Image - Using original desktop image as requested */}
            <div className="relative z-10 w-full h-full flex justify-center items-center">
              <Image 
                src="/abouthero.png" 
                alt="Changing the game" 
                fill 
                className="object-contain"
              />
            </div>
          </div>

          <div 
            className="text-[14px] text-gray-500 font-medium leading-[1.8] text-center mb-10 px-4"
            dangerouslySetInnerHTML={{ __html: companyData?.about_us || "Be part of the creative revolution! We are here to empower young talent to express themselves and redefine what culture means for the next generation" }}
          />

          <div className="flex flex-col gap-4 px-6 mb-20">
            <button className="w-full py-3.5 rounded-xl border-2 border-[#EE9C24] bg-white text-gray-800 font-bold text-[14px] shadow-sm active:scale-95 transition-transform">
              Get Started
            </button>
            <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E47B25] to-[#B15109] text-white font-bold text-[14px] shadow-lg active:scale-95 transition-transform">
              Get Membership
            </button>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="px-6 pb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Our Values</h2>
            <div className="flex justify-center h-4 w-32 mx-auto">
              <Image src="/teamline.png" alt="underline" width={128} height={16} className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Our Mission */}
          <div className="flex flex-col mb-16 px-2">
            <h3 className="text-lg font-bold text-gray-900 border-b-2 border-[#EE9C24] inline-block w-fit pb-1 mb-4">Our Mission</h3>
            <div className="flex flex-row items-center gap-6">
              <p className="flex-1 text-[13px] text-gray-500 font-medium leading-[1.8]">
                {companyData?.description || "To provide high-quality electronic components, development boards, and innovative tech solutions that empower students, hobbyists, and professionals to build, learn, and innovate with confidence."}
              </p>
              <div className="w-32 h-32 shrink-0 relative">
                <Image src="/mission.png" alt="Mission" fill className="object-contain scale-125 -rotate-12" />
              </div>
            </div>
          </div>

          {/* Our Vision */}
          <div className="flex flex-col mb-20 px-2">
            <h3 className="text-lg font-bold text-gray-900 border-b-2 border-[#EE9C24] inline-block w-fit pb-1 mb-4">Our Vision</h3>
            <div className="flex flex-row-reverse items-center gap-6 text-right">
              <p className="flex-1 text-[13px] text-gray-500 font-medium leading-[1.8]">
                To become a trusted and leading electronics platform that inspires creativity, supports technical education, and drives innovation across schools, colleges, and industries.
              </p>
              <div className="w-32 h-32 shrink-0 relative">
                <Image src="/vission.png" alt="Vision" fill className="object-contain" />
              </div>
            </div>
          </div>

          {/* 4 Points Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-12">
            {/* Item 1 */}
            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 relative">
                <Image src="/about1.png" alt="Quality" fill className="object-contain"  />
              </div>
              <h4 className="font-bold text-[#E47B25] text-[15px]">1. Quality</h4>
              <p className="text-[12px] text-gray-400 font-medium leading-relaxed">
                Providing our customers with the highest quality electronic components.
              </p>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 relative">
                <Image src="/about2.png" alt="Customer Focus" fill className="object-contain" />
              </div>
              <h4 className="font-bold text-[#D0650C] text-[15px]">2. Customer Focus</h4>
              <p className="text-[12px] text-gray-400 font-medium leading-relaxed">
                Prioritizing customer satisfaction and resolving issues efficiently.
              </p>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 relative">
                <Image src="/about3.png" alt="Innovation" fill className="object-contain" />
              </div>
              <h4 className="font-bold text-[#E47B25] text-[15px]">3. Innovation</h4>
              <p className="text-[12px] text-gray-400 font-medium leading-relaxed">
                Staying at the forefront of the latest technologies and offering cutting-edge solutions.
              </p>
            </div>

            {/* Item 4 */}
            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 relative">
                <Image src="/about4.png" alt="Building Trust" fill className="object-contain" />
              </div>
              <h4 className="font-bold text-[#D0650C] text-[15px]">4. Building Trust</h4>
              <p className="text-[12px] text-gray-400 font-medium leading-relaxed">
                We believe that a fair & reliable refund policy is essential for building trust with our customers.
              </p>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="px-6 mb-20">
          <div className="bg-white rounded-3xl p-4 border-2 border-[#EE9C24] shadow-sm overflow-hidden">
            <div className="rounded-2xl overflow-hidden mb-6 h-48 relative">
              <Image src="/philosphy.png" alt="Philosophy" fill className="object-cover" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Our Philosophy:</h3>
              <p className="text-[13px] text-gray-500 font-medium leading-relaxed px-2">
                Website visitors today demand a frictionless user experience especAt DSM Electro, we believe technology should be simple, accessible, and empowering for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="px-4 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Meet Our Team</h2>
            <div className="flex justify-center h-4 w-32 mx-auto">
              <Image src="/teamline.png" alt="underline" width={128} height={16} className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="flex justify-center items-end gap-2 px-2 pb-10">
             {/* Vishal */}
             <div className="w-[30%] flex flex-col items-center">
                <div className="w-full relative aspect-[3/4]">
                  <Image src="/team2.png" alt="Vishal" fill className="object-contain object-bottom" />
                  <div className="absolute bottom-[10%] left-0 w-full z-20 flex justify-center items-center">
                    <h4 className="font-semibold text-white text-[10px] -rotate-3">Vishal</h4>
                  </div>
                </div>
             </div>

             {/* Shubham */}
             <div className="w-[35%] flex flex-col items-center">
                <div className="w-full relative aspect-[3/4] scale-110">
                  <Image src="/team2.png" alt="Shubham" fill className="object-contain object-bottom" />
                  <div className="absolute bottom-[10%] left-0 w-full z-20 flex justify-center items-center">
                    <h4 className="font-bold text-white text-[11px] -rotate-3">Shubham Pandey</h4>
                  </div>
                </div>
             </div>

             {/* Hariom */}
             <div className="w-[30%] flex flex-col items-center">
                <div className="w-full relative aspect-[3/4]">
                  <Image src="/team2.png" alt="Hariom" fill className="object-contain object-bottom" />
                  <div className="absolute bottom-[10%] left-0 w-full z-20 flex justify-center items-center">
                    <h4 className="font-semibold text-white text-[10px] rotate-3">Hariom Saran</h4>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* Project Based Learning Section (Flyer) */}
        <section className="px-2 mb-20">
          <div className="bg-gradient-to-br from-[#E47B25] to-[#B3520A] rounded-3xl p-6 relative overflow-hidden">
             {/* Flyer Decorative Background */}
             <div className="absolute bottom-0 right-0 w-48 h-48 opacity-20 transform translate-x-10 translate-y-10">
                <div className="w-full h-full bg-white rounded-full blur-[80px]" />
             </div>
             
             <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-4 leading-tight">
                  Project Based Learning<br/>on DSM Electro
                </h3>
                <p className="text-[12px] text-white/90 leading-relaxed max-w-[180px] mb-6 font-medium">
                  Get ready-to-build electronics, robotics, and IoT projects designed for students of all levels, ideal for science fairs, practical exams, competitions, and final-year submissions.
                </p>
                <button className="bg-white text-[#E47B25] px-6 py-2 rounded-full text-[12px] font-bold shadow-md active:scale-95 transition-all">
                  Explore more
                </button>
             </div>

             {/* Flyer Banner Image */}
             <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-48 h-full">
                <div className="relative w-full h-full">
                   <Image src="/banner.png" alt="Banner" fill className="object-contain transform rotate-6 scale-110" />
                </div>
             </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="px-6 mb-20 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Be the first to see the news</h2>
          <p className="text-[12px] text-gray-400 mb-6 leading-relaxed">
            Your company may not be in the software business, but eventually, a software company will be in your business.
          </p>
          <div className="flex border border-[#EE9C24] rounded-full overflow-hidden bg-white shadow-sm pr-1 py-1 pl-4">
            <input 
              type="text" 
              placeholder="Email here..." 
              className="flex-1 outline-none text-[13px] text-gray-700 placeholder:text-gray-300 bg-transparent"
            />
            <button className="bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white px-6 py-2 rounded-full text-[13px] font-bold">
              Subscribe
            </button>
          </div>
        </section>

        {/* Why DSM Electro Section */}
        <section className="px-6 pb-32">
          <div className="flex items-center gap-4 mb-20">
             <div className="h-[1.5px] flex-1 bg-[#EE9C24]" />
             <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap">Why DSM Electro</h2>
             <div className="h-[1.5px] flex-1 bg-[#EE9C24]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Feature 1 */}
             <div className="bg-white rounded-2xl border border-gray-50 shadow-sm p-3 text-center flex flex-col items-center">
                <div className="w-full bg-gradient-to-r from-[#E47B25] to-[#B3520A] py-1.5 rounded-t-xl mb-3 flex justify-center">
                   <div className="bg-white p-1 rounded-full"><Zap size={14} className="text-[#E47B25]" /></div>
                </div>
                <h4 className="text-[13px] font-bold text-[#EE9C24] mb-1">Genuine Components</h4>
                <p className="text-[10px] text-gray-400">100% Original Products</p>
             </div>
             {/* Feature 2 */}
             <div className="bg-white rounded-2xl border border-gray-50 shadow-sm p-3 text-center flex flex-col items-center">
                <div className="w-full bg-gradient-to-r from-[#E47B25] to-[#B3520A] py-1.5 rounded-t-xl mb-3 flex justify-center">
                   <div className="bg-white p-1 rounded-full"><Users size={14} className="text-[#E47B25]" /></div>
                </div>
                <h4 className="text-[13px] font-bold text-[#EE9C24] mb-1">Technical Assistance</h4>
                <p className="text-[10px] text-gray-400">Expert help for Projects</p>
             </div>
             {/* Feature 3 */}
             <div className="bg-white rounded-2xl border border-gray-50 shadow-sm p-3 text-center flex flex-col items-center">
                <div className="w-full bg-gradient-to-r from-[#E47B25] to-[#B3520A] py-1.5 rounded-t-xl mb-3 flex justify-center">
                   <div className="bg-white p-1 rounded-full"><Rocket size={14} className="text-[#E47B25]" /></div>
                </div>
                <h4 className="text-[13px] font-bold text-[#EE9C24] mb-1">Secure Payments</h4>
                <p className="text-[10px] text-gray-400">Trusted Transaction Platform</p>
             </div>
             {/* Feature 4 */}
             <div className="bg-white rounded-2xl border border-gray-50 shadow-sm p-3 text-center flex flex-col items-center">
                <div className="w-full bg-gradient-to-r from-[#E47B25] to-[#B3520A] py-1.5 rounded-t-xl mb-3 flex justify-center">
                   <div className="bg-white p-1 rounded-full"><Package size={14} className="text-[#E47B25]" /></div>
                </div>
                <h4 className="text-[13px] font-bold text-[#EE9C24] mb-1">Bulk Order Support</h4>
                <p className="text-[10px] text-gray-400">Special Pricing for Bulk</p>
             </div>
          </div>
        </section>
      </div>


      {/* DESKTOP VIEW - Kept original */}
      <div className="hidden md:block container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-8 uppercase tracking-wider font-semibold">
          Home &gt; <span className="text-[#E47B25]">About Us</span>
        </div>

        {/* Top Heading */}
        <div className="text-center mb-16 relative">
          <div className="flex items-center justify-center gap-4">
            <div className="h-0.5 w-16 bg-[#E47B25]"></div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-black">About Us</h1>
            <div className="h-0.5 w-16 bg-[#E47B25]"></div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-center gap-12 mb-12 relative">
          
          <div className="w-full md:w-1/2 relative z-10">
            <h2 className="text-4xl sm:text-xl md:text-[64px] font-extrabold text-[#333] leading-[1.15] mb-6 tracking-tight">
              We&apos;re <span className="text-[#E47B25]">Changing</span><br/>
              the whole game
            </h2>
            <div 
              className="text-sm sm:text-base md:text-[15px] text-[#555555] font-medium max-w-[480px] leading-relaxed mb-8"
              dangerouslySetInnerHTML={{ __html: companyData?.about_us || "Be part of the creative revolution! We are here to empower young talent to express themselves and redefine what culture means for the next generation" }}
            />
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button className="w-full sm:w-auto px-8 py-3 rounded-lg border border-[#E47B25] bg-white text-[#333] font-bold text-sm shadow-sm hover:bg-primary-50 transition">
                Get Started
              </button>
              <button className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-[#E8813B] to-[#C9661B] text-white font-bold text-sm shadow-md hover:shadow-lg transition">
                Get Membership
              </button>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 relative flex justify-end mt-10 md:mt-0">
            <Image 
              src="/abouthero.png" 
              alt="Changing the whole game" 
              width={600} 
              height={600} 
              className="w-full max-w-[550px] h-auto object-contain"
              priority
            />
          </div>
        </section>

        {/* Our Values Section */}
        <section className="mb-12">
          <div className="text-center mb-20 relative">
            <h2 className="text-4xl font-bold font-serif text-black mb-2 relative inline-block z-10">Our Values</h2>
             {/* Messy underline effect */}
             <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 w-48 h-6">
                 <div className="flex justify-center w-56 h-6 mx-auto">
               <Image src="/teamline.png" alt='underline' height={200} width={200} className='w-full h-full object-cover'/>
             </div>
             </div>
          </div>

          {/* Mission */}
          <div className="px-20 flex flex-col-reverse md:flex-row items-center justify-between mb-24 relative">
             <div className="w-full md:w-5/12">
               <h3 className="text-3xl font-bold font-serif mb-2 text-black">Our Mission</h3>
               <div className="h-0.5 w-full bg-[#E47B25] mb-6"></div>
               <p className="text-gray-500 text-[15px] leading-relaxed mb-8">
                 To provide high-quality electronic components, development boards, 
                 and innovative tech solutions that empower students, hobbyists, and professionals 
                 to build, learn, and innovate with confidence.
               </p>
               <button className="bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white px-8 py-3 rounded-md font-semibold text-sm shadow-md hover:shadow-lg transition">
                 View More
               </button>
             </div>
             <div className="w-full md:w-7/12 relative flex justify-end">
               <div className="">
                 <Image src="/mission.png" alt="Mission growth graph" height={350} width={350} className="w-full h-full object-cover -rotate-12 scale-125" />
               </div>
             </div>
          </div>

          {/* Vision */}
          <div className="px-20 flex flex-col md:flex-row items-center justify-between">
             <div className="w-full md:w-7/12 relative flex justify-start">
               <div className="">
                  <img src="/vission.png" alt="Vision woman with laptop" className="relative z-10 h-[90%] w-auto object-cover object-bottom self-end" />
               </div>
             </div>

             <div className="w-full md:w-5/12">
               <h3 className="text-3xl font-bold font-serif mb-2 text-black">Our Vision</h3>
               <div className="h-0.5 w-full bg-[#E47B25] mb-6"></div>
               <p className="text-gray-500 text-[15px] leading-relaxed mb-8">
                 To become a trusted and leading electronics platform that inspires creativity, 
                 supports technical education, and drives innovation across schools, colleges, 
                 and industries.
               </p>
               <button className="bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white px-8 py-3 rounded-md font-semibold text-sm shadow-md hover:shadow-lg transition">
                 View More
               </button>
             </div>
          </div>
        </section>

        {/* Info Grid & Philosophy */}
        <section className="mb-32 px-10">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            
            <div className="w-full md:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-10">
              {/* Item 1 */}
              <div>
                <div className="mb-2 text-[#E47B25]">
                  <Image src="/about1.png" alt="Quality" width={24} height={24} className="h-6 w-auto object-contain"  />
                </div>
                <h4 className="text-lg font-bold text-[#D0650C] mb-3">1. Quality:</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Providing our customers with the highest quality electronic components.
                </p>
              </div>

              {/* Item 2 */}
              <div>
                <div className="mb-2 text-[#E47B25]">
                  <Image src="/about2.png" alt="Customer Focus" width={24} height={24} className="h-6 w-auto object-contain" />
                </div>
                <h4 className="text-lg font-bold text-[#D0650C] mb-3">2. Customer Focus:</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Prioritizing customer satisfaction and resolving issues efficiently.
                </p>
              </div>

              {/* Item 3 */}
              <div>
                <div className="mb-2 text-[#E47B25]">
                  <Image src="/about3.png" alt="Innovation" width={24} height={24} className="h-6 w-auto object-contain" />
                </div>
                <h4 className="text-lg font-bold text-[#D0650C] mb-3">3. Innovation</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Staying at the forefront of the latest technologies and offering cutting-edge solutions.
                </p>
              </div>

              {/* Item 4 */}
              <div>
                <div className="mb-2 text-[#E47B25]">
                  <Image src="/about4.png" alt="Building Trust" width={24} height={24} className="h-6 w-auto object-contain" />
                </div>
                <h4 className="text-lg font-bold text-[#D0650C] mb-3">4. Building Trust:</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We believe that a fair & reliable refund policy is essential for building trust with our customers.
                </p>
              </div>
            </div>

            {/* Philosophy Card */}
            <div className="w-full md:w-5/12">
              <div className="border border-gray-100 bg-white rounded-3xl p-6 shadow-sm">
                <div className="rounded-2xl overflow-hidden mb-6 h-64 bg-gray-100">
                <Image src="/philosphy.png" alt='philosphy' height={200} width={200} className='w-full h-full object-cover'/>
                </div>
                <h3 className="text-xl font-bold text-[#333] mb-3">Our Philosophy:</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Website visitors today demand a frictionless user experience especAt DSM Electro, 
                  we believe technology should be simple, accessible, and empowering for everyone.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="text-center mb-24 relative">
            <h2 className="text-4xl font-bold font-serif text-black mb-2 relative inline-block z-10">Meet Our Team</h2>
             {/* Messy underline effect */}
             <div className="flex justify-center w-56 h-6 mx-auto">
               <Image src="/teamline.png" alt='underline' height={200} width={200} className='w-full h-full object-cover'/>
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-end justify-center gap-6">
            <div className="w-full md:w-1/3 flex flex-col items-center relative pb-[10px]">
               <div className="w-3/4 aspect-[3/4] relative z-10 -mb-8">
                  <img src="/team2.png" alt="Vishal" className="w-full h-full object-cover object-bottom" />
                  <div className="absolute bottom-[10%] left-0 w-full z-20 flex justify-center items-center">
                    <h4 className="font-semibold text-white text-base md:text-lg -rotate-3">Vishal</h4>
                  </div>
               </div>
            </div>

            <div className="w-full md:w-2/5 flex flex-col items-center relative z-30 pb-0">
               <div className="w-[75%] relative z-10 -mb-10 lg:scale-110">
                  <img src="/team2.png" alt="Shubham Pandey" className="w-full h-full object-cover object-bottom" />
                  <div className="absolute bottom-[10%] left-0 w-full z-20 flex justify-center items-center">
                    <h4 className="font-bold text-white text-lg md:text-xl -rotate-3">Shubham Pandey</h4>
                  </div>
               </div>
            </div>

            <div className="w-full md:w-1/3 flex flex-col items-center relative pb-[10px]">
               <div className="w-3/4 aspect-[3/4] relative z-10 -mb-8">
                  <img src="/team2.png" alt="Hariom Saran" className="w-full h-full object-cover object-bottom" />
                  <div className="absolute bottom-[10%] left-0 w-full z-20 flex justify-center items-center">
                    <h4 className="font-semibold text-white text-base md:text-lg -rotate-3">Hariom Saran</h4>
                  </div>
               </div>
            </div>
          </div>

          <div className="mt-24 w-full rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-[#FAFAFA]">
            <img 
              src="/banner.png" 
              alt="banner" 
              className="w-full h-full block object-cover" 
            />
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="mb-20 mt-10 w-[100%]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            
            <div className="w-full md:w-[60%]">
               <h2 className="text-3xl font-bold text-[#2A2A35] mb-4">
                 Be the first to see the news
               </h2>
               <p className="text-[#848B9B] text-sm md:text-base leading-relaxed mb-8 max-w-lg">
                 Your company may not be in the software business, but eventually, a software company will be in your business.
               </p>
               
               <div className="flex flex-col sm:flex-row gap-4">
                 <input 
                   type="email" 
                   placeholder="Email Here..." 
                   className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E47B25]/50 bg-white placeholder-gray-400 text-sm"
                 />
                 <button className="bg-gradient-to-r from-[#E8813B] to-[#C9661B] text-white px-8 py-3 rounded-lg font-bold text-xs tracking-wider shadow-md hover:shadow-lg transition shrink-0 uppercase">
                   Subscribe
                 </button>
               </div>
            </div>

            <div className="w-full md:w-[40%] flex justify-end">
               <div className="w-full max-w-lg rounded-xl overflow-hidden shadow-md">
                 <Image src="/newsletter.png" alt='newsletter' height={200} width={200} className='w-full h-full object-contain'/>
               </div>
            </div>
          </div>
        </section>
      </div>

    </main>
  );
}
