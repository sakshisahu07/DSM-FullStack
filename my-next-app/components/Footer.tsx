"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail, Send, ChevronRight, Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchCompanyData } from '@/redux/slices/companySlice';

const Footer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: companyData } = useSelector((state: RootState) => state.company);

  React.useEffect(() => {
    if (!companyData) {
      dispatch(fetchCompanyData());
    }
  }, [dispatch, companyData]);

  const quickLinks = [
    { label: 'Blogs', href: '/blog' },
    { label: 'Projects', href: '/project' },
    { label: 'ATL Kits', href: '/atl-kits' },
    { label: 'About us', href: '/about-us' },
    { label: 'Career page', href: '/career' },
    { label: 'Video gallery', href: '/video-gallery' }
  ];

  const helpLinks = [
    { label: 'About us', href: '/about-us' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Return Policy', href: '/return-policy' },
    { label: 'Refund Policy', href: '/refund-policy' },
    { label: 'Shipping & delivery', href: '/shipping-delivery' },
  ];

  const accountLinks = [
    { label: 'Login /Signup', href: '/login' },
    { label: 'Order History', href: '/my-orders' },
    { label: 'My Wishlist', href: '/my-wishlist' },
    { label: 'My Order', href: '/my-orders' },
    { label: 'Track My Order', href: '/track-order' },
  ];

  return (
    <footer className="hidden md:block w-full bg-black text-gray-400 py-6 md:py-8 px-4 md:px-14 font-sans">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">


        {/* Top Section - Brand and App Stores */}
        <div className="bg-[#111111] rounded-2xl md:rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5">

          <div className="flex flex-col items-center md:items-start text-center md:text-left shrink-0">
            <div className="flex flex-col shrink-0">
              <Image src={companyData?.footer_logo || "/logo.png"} alt="Logo" width={120} height={36} className="h-auto w-auto md:w-[140px]" />
            </div>
          </div>

          <div className="max-w-2xl text-sm leading-relaxed text-gray-400 text-center md:text-left px-4">
            {companyData?.footer_description || "DSM Online is one of the fastest growing Company of Electronic Components in Bhopal. Our focus on customer satisfaction and expert technical support make us the ideal single-point source for all your requirements."}
          </div>

          <div className="flex flex-row md:flex-col gap-3 min-w-[160px]">
            <a href={companyData?.playstoreLink || "#"} className="hover:opacity-80 transition-opacity">
              <Image src="/playstore.png" alt="Get it on Google Play" width={120} height={36} className="h-auto w-auto md:w-[140px]" />
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity">
              <Image src="/appstore.png" alt="Download on the App Store" width={120} height={36} className="h-auto w-auto md:w-[140px]" />
            </a>
          </div>

        </div>

        {/* Main Content Sections */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 w-full items-start">

          {/* Left Side - Links Column */}
          <div className="bg-[#111111] w-full lg:w-[60%] rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/5 h-auto lg:h-[550px]">
            <div className=" relative">
              <h2 className="text-xl md:text-3xl font-bold text-white mb-2 leading-tight">
                Before you go,<br />check out these links
              </h2>
              <div className="absolute -bottom-8 md:-bottom-6 right-0 md:right-10 scale-75 md:scale-100">
                <div className="relative group">
                  <div className="absolute top-4 -left-30 text-[#E47B25]  group-hover:rotate-0 transition-transform hidden md:block">
                    <Image src="/arrow.png" alt="Logo" width={30} height={30} />
                  </div>
                  <button className=" bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white px-6 md:px-14 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
                    Important Links
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10 pt-6">
              <div className="space-y-4 mt-12">

                <h3 className="text-white font-bold text-lg ">Quick Links</h3>
                <ul className="space-y-3 text-sm">
                  {quickLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link href={link.href} className="hover:text-primary-500 transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">

                <h3 className="text-white font-bold text-lg mt-12">Help Section</h3>
                <ul className="space-y-3 text-sm text-[#929292]">
                  {helpLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link href={link.href} className="hover:text-primary-500 transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">

                <h3 className="text-white font-bold text-lg mt-12">My Account</h3>
                <ul className="space-y-3 text-sm">
                  {accountLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link href={link.href} className="hover:text-[#EE9C24] transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Side Container (Contact + Socials) */}
          <div className="w-full lg:w-[40%] flex flex-col gap-4">
            <div className="bg-[#111111] rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/5 relative flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl md:text-[2rem] font-bold text-white">Contact Us</h2>

                <div className="absolute top-6 md:top-20 right-10  group scale-90 md:scale-100">
                  <button className="bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white px-3 md:px-8 py-1.5 md:py-2 rounded-full text-[10px] md:text-[1rem] font-medium hover:opacity-90 transition-opacity">
                    Collaborate With us
                  </button>
                  <div className="absolute -left-4 -top-4 text-[#E47B25] -rotate-12 hidden md:block">
                    <Image src="/arrow.png" alt="Logo" width={30} height={30} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-1 mt-10">
                <div className="space-y-1">
                  <div className="text-[#929292] font-medium text-xs flex items-center gap-2 uppercase tracking-wide">
                    Address:
                  </div>
                  <p className="text-[#FFFFFF] text-sm mt-4 leading-relaxed ">
                    {companyData?.address || "Plot no 3 -113 R3 ground floor, C-sector, Indrapuri, Bhopal, Madhya Pradesh 462022"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="text-[#929292] font-medium text-xs flex items-center gap-2 uppercase tracking-wide">
                    Phone:
                  </div>
                  <div className="text-[#FFFFFF] mt-4 text-sm leading-relaxed ">
                    {companyData?.phone}{companyData?.phone1 ? ` , ${companyData.phone1}` : ""}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[#929292] font-medium text-xs flex items-center gap-2 uppercase tracking-wide">
                    Email:
                  </div>
                  <div className="mt-4 text-[#FFFFFF] text-sm ">
                    {companyData?.email || "info@dsmonline.in"}
                  </div>
                </div>
              </div>


              {/* Newsletter */}
              <div className="mt-4 pt-4">
                <div className="flex flex-col lg:flex-row bg-transparent lg:bg-[#EFEFEF] lg:rounded-full lg:p-1 shadow-none lg:shadow-inner gap-3 lg:gap-0">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-[#EFEFEF] lg:bg-transparent text-gray-800 text-sm px-6 py-3 lg:py-2 rounded-full lg:rounded-none outline-none flex-1 placeholder:text-gray-400 shadow-inner lg:shadow-none"
                  />
                  <button className="bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white px-6 py-3 lg:py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg whitespace-nowrap flex-shrink-0 w-full lg:w-auto">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
              {[
                { src: '/twitter.png', name: 'twitter', url: companyData?.twitter },
                { src: '/linkedin.png', name: 'linkedin', url: companyData?.linkedin },
                { src: '/insta.png', name: 'instagram', url: companyData?.instagram },
                { src: '/facebook.png', name: 'facebook', url: companyData?.facebook },
                { src: '/youtube.png', name: 'youtube', url: companyData?.youtube }
              ].map(({ src, name, url }, idx) => (
                <a 
                  key={idx} 
                  href={url || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#111111] p-2 md:p-2.5 rounded-lg border border-white/5 cursor-pointer hover:bg-orange-600 hover:border-[#EE9C24] transition-all group w-10 h-10 md:w-12 md:h-12 flex items-center justify-center"
                >
                  <Image src={src} alt={name} width={24} height={24} className="object-contain" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
