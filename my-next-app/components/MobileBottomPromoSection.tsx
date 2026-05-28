"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Check, Headset, ShieldCheck, ShoppingCart } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const hotProductsData = [
  {
    id: "hot_1",
    variantId: "hot_var_1",
    name: "Bluetooth 4.0 Module NRF51822",
    description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ipsume.lorem...",
    price: 447,
    originalPrice: 447,
    rating: 5,
    category: "Bluetooth",
    subcategory: "Bluetooth",
    image: "/frequently.png",
    isHot: true,
  },
  {
    id: "hot_2",
    variantId: "hot_var_2",
    name: "Bluetooth 4.0 Module NRF51822",
    description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ipsume.lorem...",
    price: 447,
    originalPrice: 447,
    rating: 5,
    category: "Bluetooth",
    subcategory: "Bluetooth",
    image: "/frequently.png",
    isHot: true,
  }
];

const ProductSwiper = ({ title, products, id, viewAllHref = "/allproduct" }: { title: string, products: any[], id: string, viewAllHref?: string }) => {
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full px-4 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="relative">
          <h2 className="text-[15px] font-bold text-[#000000]">{title}</h2>
          <div className="absolute -bottom-[4px] left-0 w-full h-[2.5px] bg-[#E47B25] rounded-full" />
        </div>
        <Link href={viewAllHref} className="text-[#E47B25] font-semibold text-[13px] hover:underline transition-all">View All</Link>
      </div>

      <div className="relative">
        <div
          ref={prevRef}
          className="absolute top-1/2 -left-3 -translate-y-1/2 z-20 bg-[#B3520A] rounded-full text-white shadow-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
        >
          <ChevronLeft size={16} />
        </div>
        <div
          ref={nextRef}
          className="absolute top-1/2 -right-3 -translate-y-1/2 z-20 bg-[#B3520A] rounded-full text-white shadow-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
        >
          <ChevronRight size={16} />
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
          className="!pb-2 overflow-visible"
        >
          {products.map((p, idx) => (
            <SwiperSlide key={`${id}_${idx}`}>
              <ProductCard product={p} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

const MobileBottomPromoSection = () => {
  return (
    <section className="w-full bg-[#FAFAFA] md:hidden py-4 border-t border-gray-100">

      {/* Top Grid Banners */}
      <div className="w-full px-3 mb-8">
        <div className="grid grid-cols-12 gap-2">
          {/* Left Column (2 small banners) */}
          <div className="col-span-5 flex flex-col gap-2">
            <div className="relative w-full aspect-[16/10] rounded-md overflow-hidden shadow-sm">
              <Image src="/ban4.png" alt="Promo 4" fill className="object-cover" />
            </div>
            <div className="relative w-full aspect-[16/10] rounded-md overflow-hidden shadow-sm">
              <Image src="/ban5.png" alt="Promo 5" fill className="object-cover" />
            </div>
          </div>
          {/* Right Column (1 large banner) */}
          <div className="col-span-7 relative w-full h-full rounded-md overflow-hidden shadow-sm">
            <Image src="/ban6.png" alt="Promo 6" fill className="object-cover" />
          </div>
        </div>
      </div>

      {/* Product Sections */}
      <ProductSwiper
        title="Combo offer"
        products={hotProductsData.map(p => ({
          ...p,
          isCombo: true,
          slug: 'bluetooth-module', // Adding a default slug for navigation
          isHot: true
        }))}
        id="combo"
        viewAllHref="/special-combos"
      />
      <ProductSwiper title="Dc Geared Motors" products={hotProductsData} id="dc-geared" />

      {/* Middle Single Banner */}
      <div className="w-full px-4 mb-8 mt-2">
        <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden shadow-sm">
          {/* Reusing ban4.png for the middle banner as requested to only use 4,5,6 */}
          <Image src="/ban4.png" alt="Middle Promo" fill className="object-cover" />
        </div>
      </div>

      <ProductSwiper title="E-Bike Parts" products={hotProductsData} id="ebike" />

      {/* Why DSM Electro Section */}


    </section>

  );
};

export default MobileBottomPromoSection;
