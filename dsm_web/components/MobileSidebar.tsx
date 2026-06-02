"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { 
  Smile, 
  Tag, 
  LayoutGrid, 
  Gift, 
  MonitorPlay, 
  Box, 
  ShieldCheck, 
  User, 
  CircleHelp, 
  Star, 
  Share2, 
  LogOut, 
  ChevronDown, 
  ChevronLeft,
  X,
  FileText,
  ReceiptIndianRupee,
  LifeBuoy,
  Headset,
  Briefcase,
  SquarePen,
  PlayCircle,
  Award,
  ShoppingCart,
  Percent
} from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { token: rawToken } = useSelector((state: RootState) => state.auth);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const token = isMounted ? rawToken : null;

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  const menuItems = [
    { 
      label: 'Our Blog', 
      icon: <Smile size={22} />, 
      hasDropdown: true,
      subItems: [
        { label: 'Blogs', icon: <SquarePen size={18} />, href: '/blog' },
        { label: 'Videos', icon: <PlayCircle size={18} />, href: '/video-gallery' },
      ]
    },
    { 
      label: 'Exclusive Deals', 
      icon: <Tag size={22} />, 
      hasDropdown: true,
      subItems: [
        { label: 'Deals', icon: <Award size={18} />, href: '/allproduct' },
        { label: 'Combos', icon: <ShoppingCart size={18} />, href: '/special-combos' },
        { label: 'Special Offers', icon: <Percent size={18} />, href: '/special-offers' },
      ]
    },
    { label: 'All categories', icon: <LayoutGrid size={22} />, href: '/allproduct' },
    { label: 'Membership', icon: <Gift size={22} />, href: '/membership' },
    { label: 'Get Projects', icon: <MonitorPlay size={22} />, href: '/project' },
    { label: 'My Order', icon: <Box size={22} />, href: token ? '/my-orders' : '/login' },
    { 
      label: 'Policies', 
      icon: <ShieldCheck size={22} />, 
      hasDropdown: true,
      subItems: [
        { label: 'Terms & conditions', icon: <FileText size={18} />, href: '/terms' },
        { label: 'Privacy Policy', icon: <ShieldCheck size={18} />, href: '/privacy-policy' },
        { label: 'Refund Policy', icon: <ReceiptIndianRupee size={18} />, href: '/return-policy' },
        { label: 'Shipping Policy', icon: <LifeBuoy size={18} />, href: '/shipping-delivery' },
      ]
    },
    { 
      label: 'About us', 
      icon: <User size={22} />, 
      hasDropdown: true,
      subItems: [
        { label: 'About us', icon: <User size={18} />, href: '/about-us' },
        { label: 'Contact us', icon: <Headset size={18} />, href: '/contact-us' },
        { label: 'Career with us', icon: <Briefcase size={18} />, href: '/career' },
      ]
    },
    { label: 'FAQ', icon: <CircleHelp size={22} />, href: '/faq' },
    { label: 'Rate this App', icon: <Star size={22} />, href: '#' },
    { label: 'Share App', icon: <Share2 size={22} />, href: '#' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[150] md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[300px] bg-white z-[160] md:hidden flex flex-col rounded-r-[40px] shadow-2xl transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header / Profile Section */}
        <div className="relative pt-12 pb-8 px-6">
          {/* Decorative background gradient in corner - wrapped to allow button overflow */}
          <div className="absolute inset-0 overflow-hidden rounded-tr-[40px] pointer-events-none">
            <div className="absolute top-[-40px] left-[-40px] w-48 h-48 bg-gradient-to-br from-orange-400/30 to-yellow-200/20 blur-3xl rounded-full" />
          </div>
          
          {token ? (
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0">
                 <Image 
                   src="/profilemobile.png" 
                   alt="User" 
                   width={56} 
                   height={56} 
                   className="object-cover"
                   onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://ui-avatars.com/api/?name=Aisha+Sheikh&background=E47B25&color=fff';
                   }}
                 />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-gray-800 leading-tight">Aisha sheikh</h2>
                <p className="text-[12px] text-gray-500 font-medium tracking-tight">aisha123@gmail.com</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <User size={30} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 leading-tight">Welcome Guest</h2>
                  <p className="text-[12px] text-gray-500 font-medium">Please login to continue</p>
                </div>
              </div>
              <Link 
                href="/login"
                onClick={onClose}
                className="w-full py-2.5 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white rounded-xl text-center font-bold shadow-lg shadow-orange-100 hover:scale-[1.02] transition-transform"
              >
                Login / Register
              </Link>
            </div>
          )}

          {/* Toggle/Back Button - Now fully visible since parent is not overflow-hidden */}
          <button 
            onClick={onClose}
            className={`absolute right-0 top-[50%] translate-x-1/2 w-9 h-9 bg-[#E47B25] rounded-full flex items-center justify-center text-white shadow-lg z-[170] hover:scale-110 active:scale-95 transition-all duration-500 border-2 border-white ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2 px-4 scrollbar-hide">
          <div className="flex flex-col gap-1">
            {menuItems.map((item, idx) => {
              const isExpanded = expandedItems.includes(item.label);
              
              return (
                <div key={idx} className="w-full">
                  {item.hasDropdown ? (
                    <button 
                      onClick={() => toggleExpand(item.label)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 group ${isExpanded ? 'bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white shadow-lg' : 'hover:bg-orange-50'}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`transition-colors duration-300 ${isExpanded ? 'text-white' : 'text-gray-600 group-hover:text-[#E47B25]'}`}>
                          {item.icon}
                        </span>
                        <span className={`font-bold text-[15px] transition-colors duration-300 ${isExpanded ? 'text-white' : 'text-gray-700 group-hover:text-[#E47B25]'}`}>
                          {item.label}
                        </span>
                      </div>
                      <ChevronDown 
                        size={18} 
                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : 'text-gray-400 group-hover:text-[#E47B25]'}`} 
                      />
                    </button>
                  ) : (
                    <Link 
                      href={item.href || '#'} 
                      className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-200 group ${
                        item.href === '/project'
                          ? 'bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-100 shadow-sm shadow-orange-500/5'
                          : 'hover:bg-orange-50'
                      }`}
                      onClick={onClose}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`transition-colors duration-300 ${item.href === '/project' ? 'text-[#E47B25]' : 'text-gray-600 group-hover:text-[#E47B25]'}`}>{item.icon}</span>
                        <span className={`font-bold text-[15px] transition-colors duration-300 ${item.href === '/project' ? 'text-[#E47B25]' : 'text-gray-700 group-hover:text-[#E47B25]'}`}>{item.label}</span>
                      </div>
                    </Link>
                  )}
                  
                  {/* Expandable Submenu with connection lines */}
                  {item.hasDropdown && (
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="relative ml-8 py-2 flex flex-col gap-1">
                        {/* Vertical line */}
                        <div className="absolute left-0 top-0 bottom-8 w-[1.5px] bg-gray-100" />
                        
                        {(item.subItems || [
                          { label: 'Sub Category 1', href: '#', icon: null },
                          { label: 'Sub Category 2', href: '#', icon: null }
                        ]).map((sub: any, sIdx: number) => (
                          <Link 
                            key={sIdx}
                            href={sub.href || '#'} 
                            className="relative flex items-center gap-3 pl-6 py-2.5 group/sub"
                            onClick={onClose}
                          >
                            {/* Horizontal connector line */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-[1.5px] bg-gray-100 rounded-full" />
                            
                            <div className="flex items-center gap-3">
                              {sub.icon && <span className="text-gray-400 group-hover/sub:text-[#E47B25] transition-colors">{sub.icon}</span>}
                              <span className="text-[14px] font-bold text-gray-500 group-hover/sub:text-gray-800 transition-colors">
                                {sub.label}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section - Logout (Only if token exists) */}
        {token && (
          <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0">
            <button className="flex items-center gap-4 p-3.5 w-full rounded-xl hover:bg-red-50 text-gray-700 transition-all duration-200 group">
               <LogOut size={22} className="text-gray-600 group-hover:text-red-500 transition-colors" />
               <span className="font-bold text-[16px] group-hover:text-red-500 transition-colors">Log Out</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileSidebar;
