"use client";

import React, { useRef, useState, useEffect } from 'react';
import { BASE_URL } from '@/redux/slices/apiConfig';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchCategories } from '@/redux/slices/categorySlice';
import CategorySkeleton from '@/components/CategorySkeleton';

const HeroSection = ({
  categories: propCategories,
  loading: propLoading,
  selectedCategoryId,
  onCategorySelect
}: {
  categories?: any[],
  loading?: boolean,
  selectedCategoryId?: string | null,
  onCategorySelect?: (categoryId: string | null) => void
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories: reduxCategories, loading: reduxLoading } = useSelector((state: RootState) => state.category);

  const categoriesList = propCategories || reduxCategories;
  const categoriesLoading = propCategories !== undefined ? propLoading : reduxLoading;

  useEffect(() => {
    if (!propCategories && reduxCategories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, propCategories, reduxCategories.length]);

  // Map dynamic categories to the format expected by the UI
  const categories = categoriesList.length > 0 ? categoriesList.map(c => ({
    id: c._id,
    name: c.title,
    items: '0 Items', // Static for now as API doesn't provide counts
    icon: (c.icon && c.icon !== 'false' && c.icon !== 'null') ? c.icon : '/navImg.png'
  })) : [
    { id: '1', name: 'Communication', items: '100 Items', icon: '/navImg.png' },
    { id: '2', name: 'Arduino', items: '150 Items', icon: '/navImg.png' },
    { id: '3', name: 'Raspberry Pi', items: '120 Items', icon: '/navImg.png' },
    { id: '4', name: 'Motors', items: '130 Items', icon: '/navImg.png' },
    { id: '5', name: 'Sensors', items: '105 Items', icon: '/navImg.png' },
    { id: '6', name: 'Robot Parts', items: '130 Items', icon: '/navImg.png' },
    { id: '7', name: 'Robot Parts', items: '125 Items', icon: '/navImg.png' },
    { id: '8', name: 'Development Boards', items: '120 Items', icon: '/navImg.png' },
    { id: '9', name: 'Programmers', items: '125 Items', icon: '/navImg.png' },
  ];

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchBanners = async () => {
      try {
        const cleanBaseUrl = BASE_URL;
        const url = `${cleanBaseUrl.endsWith('/') ? cleanBaseUrl : cleanBaseUrl + '/'}banners/active`;
        
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: any = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch(url, { headers });
        const json = await res.json();
        if (json.success && isMounted) {
          setBanners(json.data || []);
        }
      } catch (err) {
        console.error("Error fetching active banners:", err);
      }
    };
    fetchBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  // Group active banners into pairs of 2 for grid layout, fallback to static if empty
  const activeBanners = banners.length > 0 ? banners : [
    { _id: 'static-1', image: '/hero2.png', title: 'Spring Collection 1', redirectUrl: '#' },
    { _id: 'static-2', image: '/hero1.png', title: 'Spring Collection 2', redirectUrl: '#' }
  ];

  const bannerPairs: any[][] = [];
  for (let i = 0; i < activeBanners.length; i += 2) {
    bannerPairs.push([
      activeBanners[i],
      activeBanners[i + 1] || activeBanners[i]
    ]);
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (catId: string, catName: string) => {
    if (catName === 'Communication') {
      setIsMegaMenuOpen(true);
    }
    if (onCategorySelect) {
      if (selectedCategoryId === catId) {
        onCategorySelect(null); // Clear filter if clicked again
      } else {
        onCategorySelect(catId);
      }
    }
  };

  return (
    <section className="w-full bg-white pb-6 md:pb-8 relative">
      {/* Category Selection Row */}
      <div className=" px-4 md:px-14 py-4 md:py-8 relative group">
        
        {/* Mobile Categories Header */}
        <div className="flex md:hidden items-center justify-between mb-4">
          <div className="relative">
            <h2 className="text-[18px] font-semibold text-[#000000]">Categories</h2>
            <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#E47B25] rounded-full" />
          </div>
          <Link href="/allproduct" className="text-[#E47B25] font-semibold text-[15px] hover:underline transition-all">View All</Link>
        </div>

        {/* Categories Swiper (Mobile & Desktop) */}
        <div className="relative mb-4 md:mb-0">
          <Swiper
            modules={[Autoplay]}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            spaceBetween={8}
            slidesPerView={4.5}
            breakpoints={{
              480: { slidesPerView: 5.5, spaceBetween: 12 },
              640: { slidesPerView: 6.5, spaceBetween: 16 },
              1024: { slidesPerView: 8.5, spaceBetween: 16 },
              1280: { slidesPerView: 9, spaceBetween: 16 },
            }}
            className="category-swiper"
          >
            {categoriesLoading ? (
              Array(10).fill(0).map((_, idx) => (
                <SwiperSlide key={`skeleton-${idx}`}>
                  <CategorySkeleton />
                </SwiperSlide>
              ))
            ) : (
              categories.map((cat, idx) => (
                <SwiperSlide key={idx}>
                  <div 
                    className="flex flex-col items-center group cursor-pointer"
                    onClick={() => handleCategoryClick(cat.id, cat.name)}
                  >
                    <div className={`w-[50px] h-[50px] md:w-20 md:h-20 rounded-full flex items-center justify-center mb-1 md:mb-3 overflow-hidden transition-all duration-300 ${cat.id === selectedCategoryId ? 'bg-[#E47B25]/20 border-2 border-[#E47B25] scale-105 shadow-md' : 'bg-[#FDF4EE]'}`}>
                      <Image
                        src={cat.icon}
                        alt={cat.name}
                        width={80}
                        height={80}
                        className="object-cover transition-opacity w-[40px] h-[40px] md:w-[80px] md:h-[80px] rounded-full"
                      />
                    </div>
                    <div className="flex flex-col items-center w-full px-1">
                      <span className={`text-[8px] md:text-[11px] font-bold text-center leading-[1.1] md:leading-tight line-clamp-1 md:line-clamp-none md:whitespace-nowrap transition-colors duration-300 ${cat.id === selectedCategoryId ? 'text-[#E47B25]' : 'text-gray-800'}`}>{cat.name}</span>
                      <span className="text-[6px] md:text-[8px] text-gray-400 mt-0.5 whitespace-nowrap">{cat.items}</span>
                    </div>
                  </div>
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>

        {/* Mega Menu Modal */}
        {isMegaMenuOpen && (
          <div 
            ref={megaMenuRef}
            className="absolute top-[80%] left-1/2 -translate-x-1/2 w-[95%]  bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row gap-8 animate-in fade-in zoom-in-95 duration-300"
          >
            {/* Pointer Tip */}
            <div className="absolute -top-2 left-[5%] w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100" />

            <div className="flex-1">
              <h3 className="text-gray-400 text-xs font-bold  mb-6">Communication</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-4 ">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-2xl flex items-center gap-4 transition-all group/item cursor-pointer ${i === 0 ? 'bg-gradient-to-r from-[#DE7420] to-[#C25C13] shadow-lg' : 'hover-bg-gradient-to-r from-[#DE7420] to-[#C25C13]'}`}
                  >
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2 shrink-0 shadow-sm ">
                      <Image src="/bluetooth.png" alt="Bluetooth" width={40} height={40} className="object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[15px] ${i === 0 ? 'text-white' : 'text-[#2F2F2F] group-hover/item:text-[#DE7420] hover-bg-gradient-to-r from-[#DE7420] to-[#C25C13]'}`}>Bluetooth Module</span>
                      <span className={`text-[11px] leading-tight ${i === 0 ? 'text-white/80' : 'text-[#4F4F4F]'}`}>Wireless module for Bluetooth communication</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explore Column */}
            <div className="hidden md:flex w-[300px]  pl-8 flex-col">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 text-right">Explore</h3>
              <div className=" ">
                <Image 
                  src="/bluetooth1.png" 
                  alt="Bluetooth" 
                  width={280} 
                  height={180} 
                  className="object-contain " 
                />
              </div>
              <div className="space-y-1">
                <h4 className=" text-lg text-[#2F2F2F]">Bluetooth</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">Wireless module for Bluetooth communication</p>
                <Link href="/allproduct" className="inline-flex items-center gap-2 text-[#DE7420] font-bold text-sm mt-3 hover:gap-3 transition-all">
                  Shop Now <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Featured Banners Swiper */}
      <div className="px-4 md:px-4">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            el: '.banner-pagination',
            bulletClass: 'w-3 h-3 rounded-full bg-gray-200 cursor-pointer transition-all duration-300',
            bulletActiveClass: '!bg-[#E47B25]',
            renderBullet: (index, className) => {
              return `<div class="${className}"></div>`;
            },
          }}
          className="hero-banner-swiper"
        >
          {bannerPairs.map((pair, index) => (
            <SwiperSlide key={index}>
              <div className="flex md:grid md:grid-cols-12 gap-3 md:gap-6 md:h-[350px]">
                {/* Hero Banner 1 */}
                <div 
                  className="flex-[2] md:col-span-8 relative rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer h-[120px] md:h-[22rem] border border-gray-100 shadow-sm"
                  onClick={() => pair[0]?.redirectUrl && window.open(pair[0].redirectUrl, '_blank')}
                >
                  <Image
                    src={pair[0]?.image || "/hero2.png"}
                    alt={pair[0]?.title || "Hero Banner 1"}
                    width={900}
                    height={450}
                    priority={index === 0}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
                </div>

                {/* Hero Banner 2 */}
                <div 
                  className="flex-1 md:col-span-4 relative rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer h-[120px] md:h-[22rem] border border-gray-100 shadow-sm"
                  onClick={() => pair[1]?.redirectUrl && window.open(pair[1].redirectUrl, '_blank')}
                >
                  <Image
                    src={pair[1]?.image || "/hero1.png"}
                    alt={pair[1]?.title || "Hero Banner 2"}
                    width={450}
                    height={450}
                    priority={index === 0}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Pagination Dots Container */}
        <div className="banner-pagination flex justify-center items-center gap-2 mt-8" />
      </div>
    </section>
  );
};

export default HeroSection;
