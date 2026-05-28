"use client";

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Search, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const products = [
  {
    id: "69c61a978aa1b6cbb89e46c4",
    variantId: "69c61a988aa1b6cbb89e46c6",
    name: "Bluetooth 4.0 Module NRF51822",
    description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ...",
    price: 347,
    originalPrice: 447,
    rating: 5,
    category: "Bluetooth",
    subcategory: "Bluetooth",
    image: "/bluetooth.png",
    isHot: true,
  },
  {
    id: "69c6238ac40bad37d3db4a7a",
    variantId: "69c6238ac40bad37d3db4a7d",
    name: "Bluetooth 4.0 Module NRF51822",
    description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ...",
    price: 347,
    originalPrice: 447,
    rating: 5,
    category: "Bluetooth",
    subcategory: "Bluetooth",
    image: "/bluetooth.png",
    isHot: true,
  },
  {
    id: "69c65f319376101b1a73d106",
    variantId: "69c65f319376101b1a73d109",
    name: "Bluetooth 4.0 Module NRF51822",
    description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ...",
    price: 347,
    originalPrice: 447,
    rating: 5,
    category: "Bluetooth",
    subcategory: "Bluetooth",
    image: "/bluetooth.png",
    isHot: true,
  },
  {
    id: "69c775e735cb8a0c09045255",
    variantId: "69c775e735cb8a0c09045258",
    name: "Bluetooth 4.0 Module NRF51822",
    description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem...",
    price: 347,
    originalPrice: 447,
    rating: 5,
    category: "Bluetooth",
    subcategory: "Bluetooth",
    image: "/bluetooth.png",
    isHot: false,
    isFan: true,
  }
];

import ProductCard from '@/components/products/ProductCard';
import ProductSwiperSkeleton from '@/components/products/ProductSwiperSkeleton';

const HotProducts = ({ products: propProducts, loading = false }: { products?: any[], loading?: boolean }) => {
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  const displayProducts = propProducts && propProducts.length > 0 ? propProducts : products;

  if (loading && (!propProducts || propProducts.length === 0)) {
    return <ProductSwiperSkeleton title="Hot Products" />;
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
        <div className="relative">
          {/* Navigation Arrows */}
          <div
            ref={prevRef}
            className="absolute top-1/2 -left-4 md:-left-4 -translate-y-1/2 z-20 bg-[#E47B25] rounded-full text-white shadow-lg cursor-pointer hover:bg-[#B3520A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </div>
          <div
            ref={nextRef}
            className="absolute top-1/2 -right-4 md:-right-4 -translate-y-1/2 z-20 bg-[#E47B25]  rounded-full text-white shadow-lg cursor-pointer hover:bg-[#B3520A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default HotProducts;
