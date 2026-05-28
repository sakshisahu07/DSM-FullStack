"use client";

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const products: any[] = []; // Removed static fallback data

import ProductCard from '@/components/products/ProductCard';
import ProductSwiperSkeleton from '@/components/products/ProductSwiperSkeleton';

const SpecialOffers = ({ products: propProducts, loading = false }: { products?: any[], loading?: boolean }) => {
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  const displayProducts = propProducts || [];

  if (loading && displayProducts.length === 0) {
    return <ProductSwiperSkeleton title="Special Offers" />;
  }

  // If no dynamic data is available, do not render the section
  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section id="special-offers" className="w-full bg-white py-2 px-4 md:px-14">
      <div className="max-w-[1400px] mx-auto relative">
         {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between mb-6">
          <div className="relative">
            <h2 className="text-[14px] font-medium text-[#000000]">Special Offer</h2>
            <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#E47B25] rounded-full" />
          </div>
          <Link href="/allproduct" className="text-[#E47B25] font-semibold text-[15px] hover:underline transition-all">View All</Link>
        </div>
        {/* Header */}
        <div className="hidden md:flex items-center justify-center gap-6 mb-4">
          <div className="h-[1.5px] md:h-[1.5px] bg-[#E47B25] flex-1 max-w-[60px] md:max-w-[200px]" />
          <h2 className="text-xl md:text-[1.5rem] font-medium text-gray-900  text-center">Special Offers</h2>
          <div className="h-[1.5px] md:h-[1.5px] bg-[#E47B25] flex-1 max-w-[60px] md:max-w-[200px]" />
        </div>

        {/* Swiper Container */}
        <div className="relative px-1">
          {/* Navigation Arrows */}
          <div
            ref={prevRef}
            className="absolute top-1/2 -left-2 md:-left-4 -translate-y-1/2 z-20 bg-[#B3520A]  rounded-full text-white shadow-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </div>
          <div
            ref={nextRef}
            className="absolute top-1/2 -right-2 md:-right-4 -translate-y-1/2 z-20 bg-[#B3520A]  rounded-full text-white shadow-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
          >
            <ChevronRight size={20} />
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
            spaceBetween={12}
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
            className="!pb-6 overflow-visible"
          >
            {displayProducts.map((p, idx) => (
              <SwiperSlide key={`${p.id}-${idx}`}>
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
