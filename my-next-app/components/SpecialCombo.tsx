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

import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchCombos } from '@/redux/slices/comboSlice';
import ProductCard from '@/components/products/ProductCard';

const SpecialCombo = ({ combos: propCombos, loading: propLoading }: { combos?: any[], loading?: boolean }) => {
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { combos: reduxCombos, loading: reduxLoading, error } = useSelector((state: RootState) => state.combo);

  const displayCombos = propCombos && propCombos.length > 0 ? propCombos : reduxCombos;
  const loading = propCombos !== undefined ? propLoading : reduxLoading;

  React.useEffect(() => {
    if (!propCombos && reduxCombos.length === 0) {
      dispatch(fetchCombos('sort&search&category=69c378ed330396cb40beb09f&subCategory&hotDeal&specialOffer&city&pincode'));
    }
  }, [dispatch, propCombos, reduxCombos.length]);

  if (loading && displayCombos.length === 0) {
    return (
      <section className="w-full bg-white py-8 px-4 md:px-14">
        <div className="max-w-[1400px] mx-auto text-center">Loading Combos...</div>
      </section>
    );
  }

  if (error && displayCombos.length === 0) {
    return (
      <section className="w-full bg-white py-8 px-4 md:px-14">
        <div className="max-w-[1400px] mx-auto text-center text-red-500">Error: {error}</div>
      </section>
    );
  }

  return (
    <section id="special-combo" className="w-full bg-white py-2 md:py-8 px-4 md:px-14">
      <div className="max-w-[1400px] mx-auto">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between mb-6">
          <div className="relative">
            <h2 className="text-[14px] font-medium text-[#000000]">Special Combo</h2>
            <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#E47B25] rounded-full" />
          </div>
          <Link href="/special-combos" className="text-[#E47B25] font-semibold text-[15px] hover:underline transition-all">View All</Link>
        </div>
        {/* Header */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div className="relative">
            <h2 className="text-2xl font-medium text-[#000000] pr-12">Special Combo</h2>
            <div className="absolute -bottom-2 left-0 w-32 h-[3px] bg-[#E47B25]" />
          </div>
          <Link href="/allproduct" className="text-[#E47B25] font-bold flex items-center gap-1 hover:gap-2 transition-all">
            View All
          </Link>
        </div>

        {/* Swiper Container */}
        <div className="relative px-1">
          {/* Navigation Arrows */}
          <div
            ref={prevRef}
            className="absolute top-1/2 -left-2 md:-left-4 -translate-y-1/2 z-20 bg-[#E47B25]  rounded-full text-white shadow-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </div>
          <div
            ref={nextRef}
            className="absolute top-1/2 -right-2 md:-right-4 -translate-y-1/2 z-20 bg-[#E47B25]  rounded-full text-white shadow-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
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
            {displayCombos.map((combo) => (
              <SwiperSlide key={combo._id}>
                <ProductCard product={{
                  id: combo._id,
                  name: combo.name,
                  price: combo.comboPrice,
                  originalPrice: combo.totalMrp,
                  image: (combo.icon && combo.icon !== 'false' ? combo.icon : null) || combo.images?.[0] || "/combo.png",
                  images: combo.images && combo.images.length > 0 ? combo.images : (combo.icon && combo.icon !== 'false' ? [combo.icon] : []),
                  discount: combo.discount ? `${combo.discount}% Off` : undefined,
                  category: combo.categories?.[0]?.title || "Category",
                  subcategory: combo.subCategories?.[0]?.title || "Sub category",
                  // Pass the entire combo object for slug and other info
                  ...combo,
                  isCombo: true,
                  isHot: true
                } as any} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default SpecialCombo;
