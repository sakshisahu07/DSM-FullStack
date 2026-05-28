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

const products = [
  {
    id: "69c6238ac40bad37d3db4a88",
    variantId: "69c6238ac40bad37d3db4a89",
    name: "Bluetooth 4.0 Module NRF51822",
    description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ipsume.lorem...",
    price: 347,
    originalPrice: 447,
    rating: 5,
    category: "Category",
    subcategory: "Sub category",
    image: "/frequently.png",

  },
  {
    id: "69c6238ac40bad37d3db4a90",
    variantId: "69c6238ac40bad37d3db4a91",
    name: "Bluetooth 4.0 Module NRF51822",
    description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ipsume.lorem...",
    price: 347,
    originalPrice: 447,
    rating: 5,
    category: "Category",
    subcategory: "Sub category",
    image: "/frequently.png",

  },
  {
    id: "69c6238ac40bad37d3db4a92",
    variantId: "69c6238ac40bad37d3db4a93",
    name: "Bluetooth 4.0 Module NRF51822",
    description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ipsume.lorem...",
    price: 347,
    originalPrice: 447,
    rating: 5,
    category: "Category",
    subcategory: "Sub category",
    image: "/frequently.png",

  },
  {
    id: "69c6238ac40bad37d3db4a94",
    variantId: "69c6238ac40bad37d3db4a95",
    name: "Bluetooth 4.0 Module NRF51822",
    description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ipsume.lorem...",
    price: 347,
    originalPrice: 447,
    rating: 5,
    category: "Category",
    subcategory: "Sub category",
    image: "/frequently.png",

  }
];

import ProductCard from '@/components/products/ProductCard';
import ProductSwiperSkeleton from '@/components/products/ProductSwiperSkeleton';

const FrequentlySaleProduct = ({ products: propProducts, loading = false }: { products?: any[], loading?: boolean }) => {
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  const displayProducts = propProducts && propProducts.length > 0 ? propProducts : products;

  if (loading && (!propProducts || propProducts.length === 0)) {
    return <ProductSwiperSkeleton title="Frequently Sale Products" />;
  }

  return (
    <section className="w-full bg-white py-2 md:py-8 px-4 md:px-14">
      <div className="max-w-[1400px] mx-auto">
         {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between mb-6">
          <div className="relative">
            <h2 className="text-[14px] font-medium text-[#000000]">Frequently Sale Products</h2>
            <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#E47B25] rounded-full" />
          </div>
          <Link href="/allproduct" className="text-[#E47B25] font-semibold text-[15px] hover:underline transition-all">View All</Link>
        </div>
        {/* Header */}
        <div className="hidden md:flex items-center justify-center gap-3 md:gap-6 mb-6 md:mb-10">
          <div className="h-[1.5px] md:h-[1.5px] bg-[#E47B25] flex-1 max-w-[60px] md:max-w-[200px]" />
          <h2 className="text-xl md:text-[1.5rem] font-medium text-gray-900  text-center">Frequently Sale Products</h2>
          <div className="h-[1.5px] md:h-[1.5px] bg-[#E47B25] flex-1 max-w-[60px] md:max-w-[200px]" />
        </div>

        {/* Swiper Container */}
        <div className="relative px-1">
          {/* Navigation Arrows */}
          <div
            ref={prevRef}
            className="absolute top-1/2 -left-2 md:-left-4 -translate-y-1/2 z-20 bg-[#B3520A] rounded-full text-white shadow-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </div>
          <div
            ref={nextRef}
            className="absolute top-1/2 -right-2 md:-right-4 -translate-y-1/2 z-20 bg-[#B3520A] rounded-full text-white shadow-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
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

export default FrequentlySaleProduct;
