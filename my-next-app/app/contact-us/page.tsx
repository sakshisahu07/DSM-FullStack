"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Twitter, Linkedin, Instagram, Facebook, Youtube } from 'lucide-react';

export default function ContactUsPage() {
  const router = useRouter();

  return (
    <main className="bg-white min-h-screen font-sans">
      
      {/* MOBILE VIEW */}
      <div className="md:hidden flex flex-col pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#DE7420] to-[#B3520A] px-4 py-4 flex items-center gap-4 sticky top-0 z-[100] shadow-sm">
          <button 
            onClick={() => router.back()}
            className="text-white p-1 rounded-full active:bg-white/10 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-white tracking-wide">Contact us</h1>
        </div>

        {/* Content Section */}
        <div className="px-5 py-8 flex flex-col items-center">
          
          <p className="text-[12px] text-gray-600 text-center font-medium leading-relaxed mb-6 px-2">
            Whether you have a question, feedback, or just want to say hello — we&apos;re always happy to hear from you
          </p>

          <div className="w-full max-w-[280px] aspect-[4/3] relative mb-8">
            {/* Fallback image in case the specific contact illustration is missing */}
            <Image 
              src="/contact.png" 
              alt="Contact Support" 
              fill 
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/atl_inquiry_girl.png';
              }}
            />
          </div>

          {/* Contact Cards */}
          <div className="w-full flex flex-col gap-4 mb-10">
            {/* Email Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className="w-1.5 h-8 bg-[#E47B25] rounded-full shrink-0"></div>
              <div className=" flex items-center justify-center shrink-0 relative">
                <Image src="/mail.png" alt="Contact Support" width={24} height={24} />
                 <div className="absolute top-2 right-2 w-2 h-2 bg-[#E47B25] rounded-full border border-white"></div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-[#E47B25] font-bold text-[15px] mb-0.5">Email us</h3>
                <p className="text-gray-800 font-bold text-[12px]">Mail Id: Info@dsmonline.in</p>
                <p className="text-gray-400 text-[10px] font-medium mt-0.5">Available 24/7</p>
              </div>
            </div>

            {/* Call Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className="w-1.5 h-8 bg-[#E47B25] rounded-full shrink-0"></div>
              <div className=" flex items-center justify-center shrink-0">
                <Image src="/phone.png" alt="Contact Support" width={24} height={24} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[#E47B25] font-bold text-[15px] mb-0.5">Call us</h3>
                <p className="text-gray-800 font-bold text-[12px]">Contact No: 9713330108, 9752438811</p>
                <p className="text-gray-400 text-[10px] font-medium mt-0.5">Mon - Sat : 9 AM - 6 PM</p>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <h3 className="text-[15px] font-bold text-gray-900 mb-6 text-center">
            Find Us On Social Media
          </h3>
          
          <div className="flex items-center justify-center gap-3">
            <a href="#" className="w-12 h-12 bg-[#DE7420] rounded-xl flex items-center justify-center text-white shadow-sm hover:opacity-90 active:scale-95 transition-all">
              <Twitter size={20} strokeWidth={2.5} />
            </a>
            <a href="#" className="w-12 h-12 bg-[#DE7420] rounded-xl flex items-center justify-center text-white shadow-sm hover:opacity-90 active:scale-95 transition-all">
              <Linkedin size={20} strokeWidth={2.5} />
            </a>
            <a href="#" className="w-12 h-12 bg-[#DE7420] rounded-xl flex items-center justify-center text-white shadow-sm hover:opacity-90 active:scale-95 transition-all">
              <Instagram size={20} strokeWidth={2.5} />
            </a>
            <a href="#" className="w-12 h-12 bg-[#DE7420] rounded-xl flex items-center justify-center text-white shadow-sm hover:opacity-90 active:scale-95 transition-all">
              <Facebook size={20} strokeWidth={2.5} />
            </a>
            <a href="#" className="w-12 h-12 bg-[#DE7420] rounded-xl flex items-center justify-center text-white shadow-sm hover:opacity-90 active:scale-95 transition-all">
              <Youtube size={20} strokeWidth={2.5} />
            </a>
          </div>

        </div>
      </div>

      {/* DESKTOP VIEW - As per instructions, "do not change anything in desktop view" */}
      {/* Providing an empty/hidden block for desktop to satisfy "only mobile" */}
      <div className="hidden md:flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-500 mb-8">Desktop view for Contact Us</p>
        <div className="flex flex-col gap-2 border border-gray-200 rounded-xl p-8 max-w-md w-full">
            <h3 className="font-bold text-xl mb-4 text-[#DE7420]">Get in Touch</h3>
            <p><strong>Email:</strong> Info@dsmonline.in</p>
            <p><strong>Phone:</strong> 9713330108, 9752438811</p>
        </div>
      </div>

    </main>
  );
}
