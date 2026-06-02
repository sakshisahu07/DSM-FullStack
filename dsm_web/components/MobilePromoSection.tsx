"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const newArrivals = [
  {
    id: "new_1",
    variantId: "new_var_1",
    name: "Bluetooth 4.0 Module NRF51822",
    description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ipsume.lorem...",
    price: 447,
    originalPrice: 447,
    rating: 5,
    category: "Bluetooth",
    subcategory: "Bluetooth",
    image: "/speacialoffer.png", // I'll use speacialoffer.png or frequently.png as placeholder, wait, they used /speacialoffer.png in others. Let's use /frequently.png as it looks like the product in the screenshot
  },
  {
    id: "new_2",
    variantId: "new_var_2",
    name: "Bluetooth 4.0 Module NRF51822",
    description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ipsume.lorem...",
    price: 447,
    originalPrice: 447,
    rating: 5,
    category: "Bluetooth",
    subcategory: "Bluetooth",
    image: "/frequently.png",
  }
];

const bestSelling = [
  {
    id: "best_1",
    variantId: "best_var_1",
    name: "Bluetooth 4.0 Module NRF51822",
    description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ipsume.lorem...",
    price: 447,
    originalPrice: 447,
    rating: 5,
    category: "Bluetooth",
    subcategory: "Bluetooth",
    image: "/frequently.png",
    isTrending: true,
  },
  {
    id: "best_2",
    variantId: "best_var_2",
    name: "Bluetooth 4.0 Module NRF51822",
    description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ipsume.lorem...",
    price: 447,
    originalPrice: 447,
    rating: 5,
    category: "Bluetooth",
    subcategory: "Bluetooth",
    image: "/frequently.png",
    isTrending: true,
  }
];

const MobilePromoSection = () => {
  const newArrivalsPrevRef = useRef<HTMLDivElement>(null);
  const newArrivalsNextRef = useRef<HTMLDivElement>(null);
  const bestSellingPrevRef = useRef<HTMLDivElement>(null);
  const bestSellingNextRef = useRef<HTMLDivElement>(null);

  return (
    <section className="w-full bg-white md:hidden py-4">
      {/* Banner Carousel */}
      <div className="w-full mb-6 mt-2">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          spaceBetween={16}
          slidesPerView={1.2}
          centeredSlides={true}
          loop={true}
          className="pb-10"
        >
          {['/ban2.png', '/ban3.png', '/ban1.png', '/ban2.png', '/ban3.png', '/ban1.png'].map((src, index) => (
            <SwiperSlide key={index}>
              <div className="w-full relative aspect-[1.5/1] rounded-2xl overflow-hidden shadow-sm">
                <Image 
                  src={src} 
                  alt={`Promo Banner ${index + 1}`} 
                  fill
                  className="object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* New Arrivals */}
      <div className="w-full px-4 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <h2 className="text-[16px] font-semibold text-[#000000]">New Arrivals</h2>
            <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#E47B25] rounded-full" />
          </div>
          <Link href="/allproduct" className="text-[#E47B25] font-semibold text-[14px] hover:underline transition-all">View All</Link>
        </div>

        <div className="relative">
          <div
            ref={newArrivalsPrevRef}
            className="absolute top-1/2 -left-3 -translate-y-1/2 z-20 bg-[#B3520A] rounded-full text-white shadow-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </div>
          <div
            ref={newArrivalsNextRef}
            className="absolute top-1/2 -right-3 -translate-y-1/2 z-20 bg-[#B3520A] rounded-full text-white shadow-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </div>
          <Swiper
            modules={[Navigation]}
            onInit={(swiper: any) => {
              // @ts-ignore
              swiper.params.navigation.prevEl = newArrivalsPrevRef.current;
              // @ts-ignore
              swiper.params.navigation.nextEl = newArrivalsNextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            spaceBetween={12}
            slidesPerView={2}
            className="!pb-2 overflow-visible"
          >
            {newArrivals.map((p) => (
              <SwiperSlide key={p.id}>
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Best Selling */}
      <div className="w-full px-4 mb-2">
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <h2 className="text-[16px] font-semibold text-[#000000]">Best Selling</h2>
            <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#E47B25] rounded-full" />
          </div>
          <Link href="/allproduct" className="text-[#E47B25] font-semibold text-[14px] hover:underline transition-all">View All</Link>
        </div>

        <div className="relative">
          <div
            ref={bestSellingPrevRef}
            className="absolute top-1/2 -left-3 -translate-y-1/2 z-20 bg-[#B3520A] rounded-full text-white shadow-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </div>
          <div
            ref={bestSellingNextRef}
            className="absolute top-1/2 -right-3 -translate-y-1/2 z-20 bg-[#B3520A] rounded-full text-white shadow-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </div>
          <Swiper
            modules={[Navigation]}
            onInit={(swiper: any) => {
              // @ts-ignore
              swiper.params.navigation.prevEl = bestSellingPrevRef.current;
              // @ts-ignore
              swiper.params.navigation.nextEl = bestSellingNextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            spaceBetween={12}
            slidesPerView={2}
            className="!pb-2 overflow-visible"
          >
            {bestSelling.map((p) => (
              <SwiperSlide key={p.id}>
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: #D1D5DB !important;
          opacity: 1 !important;
          width: 12px !important;
          height: 12px !important;
          margin: 0 5px !important;
        }
        .swiper-pagination-bullet-active {
          background-color: #E47B25 !important;
        }
        .swiper-pagination {
          bottom: 4px !important;
        }
      `}</style>
    </section>
  );
};

export default MobilePromoSection;
