"use client";

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Search, Star, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// No static fallback — section only renders when live API data is available

import ProductCard from '@/components/products/ProductCard';
import ProductSwiperSkeleton from '@/components/products/ProductSwiperSkeleton';

const HotProducts = ({ products: propProducts, loading = false }: { products?: any[], loading?: boolean }) => {
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  const displayProducts = propProducts || [];

  if (loading && displayProducts.length === 0) {
    return <ProductSwiperSkeleton title="Hot Products" />;
  }

  // Hide section if no live data from API
  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white px-4 md:px-14 py-2">
      <div className="max-w-[1400px] mx-auto relative">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between mb-6">
          <div className="relative">
            <h2 className="text-[14px] font-medium text-[#000000]">Hot Products</h2>
            <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#E47B25] rounded-full" />
          </div>
          <Link href="/allproduct" className="text-[#E47B25] font-semibold text-[15px] hover:underline transition-all">View All</Link>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-center gap-6 mb-4">
          <div className="h-[2px] bg-[#E47B25] flex-1 max-w-[100px]" />
          <h2 className="text-[1.5rem] font-medium text-gray-900 text-center">Hot Products</h2>
          <div className="h-[2px] bg-[#E47B25] flex-1 max-w-[100px]" />
        </div>

        {/* Swiper Container */}
        <div className="relative px-1">
          {/* Navigation Arrows */}
          <div
            ref={prevRef}
            className="absolute top-1/2 -left-3 md:-left-10 -translate-y-1/2 z-20 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-[#E47B25] rounded-full text-white shadow-md cursor-pointer hover:bg-[#B3520A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft size={16} className="md:w-5 md:h-5" />
          </div>
          <div
            ref={nextRef}
            className="absolute top-1/2 -right-3 md:-right-10 -translate-y-1/2 z-20 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-[#E47B25] rounded-full text-white shadow-md cursor-pointer hover:bg-[#B3520A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight size={16} className="md:w-5 md:h-5" />
          </div>

          <Swiper
            modules={[Navigation]}
            onInit={(swiper: any) => {
              // @ts-ignore
              swiper.params.navigation.prevEl = prevRef.current;
              // @ts-ignore
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            spaceBetween={16}
            slidesPerView={2}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 16
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 24
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 24
              },
            }}
            className="w-full"
          >
            {displayProducts.map((p, idx) => (
              <SwiperSlide key={`${p.id}-${idx}`} className="w-full pb-4">
                <ProductCard product={{ ...p, isHot: true }} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default HotProducts;
