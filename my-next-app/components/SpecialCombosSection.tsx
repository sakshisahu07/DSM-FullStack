"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpDown,
  SlidersHorizontal,
  X,
  Check,
  ChevronRight,
  Star,
  Home,
  Headset,
  Phone,
  ShoppingCart
} from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';
import FlashSale from '@/components/FlashSale';
import FrequentlySaleProduct from '@/components/FrequentlySaleProduct';
import Features from '@/components/Features';
import SpecialCombo from '@/components/SpecialCombo';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchCombos } from '@/redux/slices/comboSlice';

const categories = [
  { name: 'All Categories', active: true },
  { name: 'Communication', active: false },
  { name: 'Arduino', active: false },
  { name: 'Raspberry Pi', active: false },
];

const SpecialCombosSection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { combos, loading } = useSelector((state: RootState) => state.combo);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);

  // Filter States
  const [priceRange, setPriceRange] = useState({ min: 447, max: 627 });
  const [activeBrandToggles, setActiveBrandToggles] = useState([0]);
  const [activeBrandRadio, setActiveBrandRadio] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState([0]);
  const [selectedRating, setSelectedRating] = useState(5);

  useEffect(() => {
    dispatch(fetchCombos('sort&search&category=69c378ed330396cb40beb09f&subCategory&hotDeal&specialOffer&city&pincode'));
  }, [dispatch]);

  const toggleBrand = (idx: number) => {
    setActiveBrandToggles(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const toggleFeature = (idx: number) => {
    setSelectedFeatures(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="w-full bg-[#FFFFFF] min-h-screen">
      {/* Container */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-14 py-4 md:py-8">

        {/* Mobile Header (Image 1) */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-[#E47B25] to-[#B3520A] px-4 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()} className="text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-white font-bold text-lg">Combos</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSortDrawerOpen(true)} className="text-white">
              <ArrowUpDown size={20} />
            </button>
            <button onClick={() => setIsFilterDrawerOpen(true)} className="text-white">
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Spacer to push content below fixed header */}
        <div className="md:hidden h-[64px]" />

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div className="relative">
            <h2 className="text-2xl font-medium text-[#000000] pr-12">Special Combos</h2>
            <div className="absolute -bottom-2 left-0 w-32 h-[3px] bg-[#E47B25]" />
          </div>
        </div>

        {/* Mobile Banner Section (Image 1 Layout) */}
        <div className="md:hidden space-y-4 mb-8 mt-6">
          {/* Top Large Banner */}
          <div className="relative w-full aspect-[2.1/1] rounded-[24px] overflow-hidden shadow-sm">
            <Image src="/ban1.png" alt="Raspberry Pi Boards" fill className="object-cover" />
          </div>

          {/* Bottom Grid Layout */}
          <div className="grid grid-cols-3 gap-3 h-[180px]">
            {/* Left Column: Two Stacked Banners */}
            <div className="col-span-1 flex flex-col gap-3">
              <div className="flex-1 relative rounded-[16px] overflow-hidden shadow-sm">
                <Image src="/ban2.png" alt="Arduino Focus" fill className="object-cover" />
              </div>
              <div className="flex-1 relative rounded-[16px] overflow-hidden shadow-sm">
                <Image src="/ban3.png" alt="Power Supply" fill className="object-cover" />
              </div>
            </div>
            {/* Right Column: One Large Vertical Banner */}
            <div className="col-span-2 relative rounded-[16px] overflow-hidden shadow-sm">
              <Image src="/ban5.png" alt="Automation Combo" fill className="object-cover" />
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E47B25]" />
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
          </div>
        </div>

        {/* Sections for Mobile View (Image 1 & 2) */}
        <div className="md:hidden space-y-2">
          {/* Special Combo Section */}
          <SpecialCombo />

          {/* Arduino Banner */}
          <div className="w-full px-1 mb-8">
            <div className="relative w-full aspect-[21/9] rounded-[20px] overflow-hidden shadow-md">
              <Image src="/ban6.png" alt="Arduino Journey" fill className="object-cover" />
            </div>
          </div>

          {/* Flash Sale Section */}
          <FlashSale />

          {/* Frequently Sale Section */}
          <FrequentlySaleProduct />

          {/* Another Banner (Raspberry Pi Boards) */}
          <div className="w-full px-1 mb-8">
            <div className="relative w-full aspect-[21/9] rounded-[20px] overflow-hidden shadow-md">
              <Image src="/ban1.png" alt="Raspberry Pi Boards" fill className="object-cover" />
            </div>
            {/* Pagination Dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#E47B25]" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            </div>
          </div>

          {/* Feature Banners Grid (Small ones from Image 2) */}
          <div className="grid grid-cols-2 gap-3 mb-8 px-1">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-sm">
              <Image src="/ban2.png" alt="B1" fill className="object-cover" />
            </div>
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-sm">
              <Image src="/ban3.png" alt="B2" fill className="object-cover" />
            </div>
          </div>

          {/* Automation Combo Banner */}
          <div className="w-full px-1 mb-8">
            <div className="relative w-full aspect-[21/9] rounded-[20px] overflow-hidden shadow-md">
              <Image src="/ban5.png" alt="Automation Combo" fill className="object-cover" />
            </div>
          </div>

          {/* Why DSM Electra - Hidden as per request */}
          {/* <Features /> */}
        </div>

        {/* Main Content: Sidebar + Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <aside className="hidden md:block md:col-span-1">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 mb-8">
              <div className="space-y-2">
                {categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer hover:bg-orange-50 text-[#2F2F2F] transition-all">
                    <span className="text-[15px] font-bold">{cat.name}</span>
                    <ChevronRight size={18} className="text-[#E47B25]" strokeWidth={3} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
              <h3 className="text-[18px] font-bold text-[#000000] mb-8">Rating</h3>
              <div className="space-y-5">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-4 cursor-pointer group" onClick={() => setSelectedRating(rating)}>
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedRating === rating ? 'bg-[#E47B25] border-[#E47B25]' : 'border-gray-100 group-hover:border-orange-200'}`}>
                      {selectedRating === rating && <Check size={16} className="text-white" strokeWidth={4} />}
                    </div>
                    <div className="flex gap-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} className={i < rating ? 'fill-[#FFC107] text-[#FFC107]' : 'text-gray-200'} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-10">
              {loading ? (
                Array(6).fill(0).map((_, idx) => (
                  <div key={`skeleton-${idx}`} className="h-full">
                    <ProductCardSkeleton />
                  </div>
                ))
              ) : (
                combos.map((combo) => (
                  <div key={combo._id} className="h-full">
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
                      ...combo,
                      isCombo: true,
                      isHot: true
                    } as any} />
                  </div>
                ))
              )}
              {combos.length === 0 && !loading && (
                <div className="col-span-full py-20 text-center text-gray-500 font-medium">
                  No combos found matching your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-gray-800 font-bold">
                <SlidersHorizontal size={18} />
                <span>Filters</span>
              </div>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Price Range */}
              <div className="space-y-6">
                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Select Price Range</h3>
                <div
                  className="h-1.5 w-full bg-gray-100 rounded-full relative px-1 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    const val = Math.round(447 + (627 - 447) * percentage);
                    if (Math.abs(val - priceRange.min) < Math.abs(val - priceRange.max)) {
                      setPriceRange(prev => ({ ...prev, min: val }));
                    } else {
                      setPriceRange(prev => ({ ...prev, max: val }));
                    }
                  }}
                >
                  <div
                    className="absolute h-full bg-[#E47B25] rounded-full"
                    style={{
                      left: `${((priceRange.min - 447) / (627 - 447)) * 100}%`,
                      right: `${100 - ((priceRange.max - 447) / (627 - 447)) * 100}%`
                    }}
                  />
                  <div
                    className="absolute top-1/2 w-5 h-5 bg-white border-[2.5px] border-[#E47B25] rounded-full shadow-md z-10 -translate-y-1/2 -translate-x-1/2"
                    style={{ left: `${((priceRange.min - 447) / (627 - 447)) * 100}%` }}
                  />
                  <div
                    className="absolute top-1/2 w-5 h-5 bg-white border-[2.5px] border-[#E47B25] rounded-full shadow-md z-10 -translate-y-1/2 -translate-x-1/2"
                    style={{ left: `${((priceRange.max - 447) / (627 - 447)) * 100}%` }}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">From:</span>
                    <div className="bg-gray-50 rounded-2xl p-4 font-bold text-gray-800 border border-gray-100 shadow-inner">₹{priceRange.min}</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">To:</span>
                    <div className="bg-gray-50 rounded-2xl p-4 font-bold text-gray-800 border border-gray-100 shadow-inner">₹{priceRange.max}</div>
                  </div>
                </div>
              </div>

              {/* Deals & Brands */}
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h3 className="text-[14px] font-bold text-gray-900 tracking-tight">Deals</h3>
                  <div className="space-y-4">
                    {['Hot Deals', 'Deals', 'Deals'].map((deal, i) => (
                      <div key={i} className="flex items-center justify-between cursor-pointer" onClick={() => toggleBrand(i)}>
                        <span className={`text-[13px] font-bold transition-colors ${activeBrandToggles.includes(i) ? 'text-[#E47B25]' : 'text-gray-600'}`}>{deal}</span>
                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${activeBrandToggles.includes(i) ? 'bg-[#E47B25]' : 'bg-gray-100'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${activeBrandToggles.includes(i) ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[14px] font-bold text-gray-900 tracking-tight">Brands</h3>
                  <div className="space-y-4">
                    {['All', 'All', 'All', 'All'].map((brand, i) => (
                      <div key={i} className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveBrandRadio(i)}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${activeBrandRadio === i ? 'border-[#E47B25]' : 'border-gray-200'}`}>
                          {activeBrandRadio === i && <div className="w-2.5 h-2.5 bg-[#E47B25] rounded-full animate-in zoom-in" />}
                        </div>
                        <span className={`text-[13px] font-bold transition-colors ${activeBrandRadio === i ? 'text-[#E47B25]' : 'text-gray-600'}`}>{brand}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rating & Feature */}
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h3 className="text-[14px] font-bold text-gray-900 tracking-tight">Rating</h3>
                  <div className="space-y-4">
                    {[5, 4, 3, 2, 1].map((r) => (
                      <div key={r} className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedRating(r)}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedRating === r ? 'bg-[#E47B25] border-[#E47B25]' : 'border-gray-200'}`}>
                          {selectedRating === r && <Check size={12} className="text-white" strokeWidth={4} />}
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={10} className={j < r ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[14px] font-bold text-gray-900 tracking-tight text-right pr-2">feature</h3>
                  <div className="space-y-4">
                    {['Deals', 'Deals', 'Deals'].map((feat, i) => (
                      <div key={i} className="flex items-center gap-3 justify-end pr-2 cursor-pointer" onClick={() => toggleFeature(i)}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedFeatures.includes(i) ? 'bg-[#E47B25] border-[#E47B25]' : 'border-gray-200'}`}>
                          {selectedFeatures.includes(i) && <Check size={12} className="text-white" strokeWidth={4} />}
                        </div>
                        <span className={`text-[13px] font-bold transition-colors ${selectedFeatures.includes(i) ? 'text-gray-900' : 'text-gray-600'}`}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-12">
              <button onClick={() => setIsFilterDrawerOpen(false)} className="flex-1 py-3.5 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold text-[14px]">Reset</button>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white font-bold text-[14px] shadow-lg shadow-orange-100">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sort Drawer */}
      {isSortDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSortDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-gray-800 font-bold">
                <ArrowUpDown size={18} />
                <span>Sort</span>
              </div>
              <button onClick={() => setIsSortDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              {[
                'Latest First', 'Oldest First', 'Price: Low to High',
                'Price: High to Low', 'Popular', 'Top Rated'
              ].map((option, i) => (
                <div key={i} className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsSortDrawerOpen(false)}>
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${i === 0 ? 'bg-[#E47B25] border-[#E47B25]' : 'border-gray-100 group-hover:border-orange-200'}`}>
                    {i === 0 && <Check size={16} className="text-white" strokeWidth={4} />}
                  </div>
                  <span className={`text-[15px] font-bold ${i === 0 ? 'text-gray-900' : 'text-gray-500'}`}>{option}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={() => setIsSortDrawerOpen(false)} className="flex-1 py-3.5 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold text-[14px]">Reset</button>
              <button onClick={() => setIsSortDrawerOpen(false)} className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white font-bold text-[14px] shadow-lg shadow-orange-100">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialCombosSection;
