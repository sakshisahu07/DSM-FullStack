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
  ShoppingCart,
  Grid,
  ChevronDown,
  Filter,
  Tag
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

const fallbackCategories = [
  { _id: "all", name: "All Categories", active: true, subcategories: [] },
  { _id: "comm", name: "Communication", active: false, subcategories: ["Label 1", "Label 2"] },
  { _id: "ard", name: "Arduino", active: false, subcategories: ["Arduino Uno", "Arduino Mega"] },
  { _id: "rpi", name: "Raspberry Pi", active: false, subcategories: ["Pi camera", "Pi Board"] },
  { _id: "mot", name: "Motors", active: false, subcategories: ["Servo Motors", "DC Motors"] }
];

const fallbackBrands = [
  { _id: "6a1802155c5fded7cd4c1add", brandName: "Arduino" },
  { _id: "brand2", brandName: "Raspberry Pi" },
  { _id: "brand3", brandName: "Adafruit" },
  { _id: "brand4", brandName: "SparkFun" }
];

const SpecialCombosSection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { combos, loading } = useSelector((state: RootState) => state.combo);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);

  // New Dynamic Filter States (Matching SpecialOffers layout)
  const [selectedRating, setSelectedRating] = useState(0);
  const [showFilterView, setShowFilterView] = useState(false);
  const [isCategoryListExpanded, setIsCategoryListExpanded] = useState(true);

  // Price Range State
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [appliedPriceRange, setAppliedPriceRange] = useState<{ min: number; max: number } | null>(null);

  // Brands State
  const [activeBrandToggles, setActiveBrandToggles] = useState<number[]>([0]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  // Features State
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);

  // Dynamic Data State with fallbacks pre-populated to prevent Layout Shift
  const [categoriesList, setCategoriesList] = useState<any[]>(fallbackCategories);
  const [brandsList, setBrandsList] = useState<any[]>(fallbackBrands);

  // Category and Subcategory Filtering States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [activeHoverCategoryId, setActiveHoverCategoryId] = useState<string | null>(null);

  // 1. Fetch Categories & Brands once on mount
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const { BASE_URL } = await import('@/redux/slices/apiConfig');
        const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/';

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Fetch Categories
        fetch(`${cleanBaseUrl}categories?limit=150`, { headers })
          .then(res => res.json())
          .then(json => {
            if (json.success && isMounted) {
              const categoriesData = json.data?.categories || json.data || [];
              setCategoriesList([
                { _id: "all", name: "All Categories", active: !selectedCategoryId, subcategories: [] },
                ...categoriesData.map((c: any) => ({
                  _id: c._id,
                  name: c.title,
                  icon: c.icon,
                  subcategories: c.subcategories || [],
                  active: c._id === selectedCategoryId
                }))
              ]);
            }
          })
          .catch(err => console.error("Error fetching categories:", err));

        // Fetch Brands
        fetch(`${cleanBaseUrl}brands`, { headers })
          .then(res => res.json())
          .then(json => {
            if (json.success && isMounted) {
              const brandsData = json.data?.brands || json.data || [];
              setBrandsList(brandsData);
            }
          })
          .catch(err => console.error("Error fetching brands:", err));

      } catch (err) {
        console.error("Error initializing initial data:", err);
      }
    };
    fetchInitialData();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch filtered combos whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();

    // We append the search parameters that our combos backend handles
    if (selectedCategoryId && selectedCategoryId !== "all") {
      params.append('category', selectedCategoryId);
    }
    if (selectedSubCategoryId) {
      params.append('subCategory', selectedSubCategoryId);
    }
    if (selectedBrandId) {
      params.append('brand', selectedBrandId);
    }
    if (appliedPriceRange) {
      params.append('minPrice', appliedPriceRange.min.toString());
      params.append('maxPrice', appliedPriceRange.max.toString());
    }

    // Dispatch query to redux action
    dispatch(fetchCombos(params.toString()));
  }, [
    dispatch,
    selectedCategoryId,
    selectedSubCategoryId,
    selectedBrandId,
    appliedPriceRange
  ]);

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

  const renderCategoriesList = () => {
    return (
      <div className="space-y-3">
        {/* Premium Accordion Header "All Categories" matching SpecialOffers design */}
        <div
          onClick={() => setIsCategoryListExpanded(!isCategoryListExpanded)}
          className={`flex items-center justify-between px-2.5 lg:px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 ease-out select-none font-bold text-white shadow-md bg-gradient-to-r from-[#E47B25] to-[#B3520A] active:scale-[0.98] flex-nowrap`}
        >
          <div className="flex items-center gap-2 lg:gap-3 overflow-hidden">
            <Grid size={16} className="lg:w-[18px] lg:h-[18px] shrink-0" strokeWidth={2.5} />
            <span className="text-[13px] lg:text-[14px] tracking-tight whitespace-nowrap truncate">All Categories</span>
          </div>
          <ChevronDown
            size={16}
            className={`lg:w-[18px] lg:h-[18px] shrink-0 transition-transform duration-300 ${isCategoryListExpanded ? 'rotate-180' : ''}`}
            strokeWidth={3}
          />
        </div>

        {/* Smooth Animated Category Items Accordion */}
        {isCategoryListExpanded && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300 pl-1">
            {categoriesList.map((cat, idx) => {
              if (cat._id === "all" || cat.name === "All Categories") return null;

              const catId = cat._id;
              const isSelected = selectedCategoryId === catId;
              const subcategories = cat.subcategories || [];
              const hasSub = subcategories.length > 0;
              const isExpanded = activeHoverCategoryId === catId || (selectedCategoryId === catId && hasSub);

              return (
                <div
                  key={catId || idx}
                  className="group relative"
                  onMouseEnter={() => {
                    if (hasSub) setActiveHoverCategoryId(catId);
                  }}
                  onMouseLeave={() => {
                    if (hasSub) setActiveHoverCategoryId(null);
                  }}
                >
                  <div
                    onClick={() => {
                      if (!hasSub) {
                        setSelectedCategoryId(catId);
                        setSelectedSubCategoryId(null);
                      } else {
                        setSelectedCategoryId(isSelected ? null : catId);
                        setSelectedSubCategoryId(null);
                      }
                    }}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ease-out ${isSelected
                        ? 'bg-orange-50/90 text-[#E47B25] font-extrabold shadow-sm'
                        : 'hover:bg-orange-50/40 text-gray-700 hover:text-[#E47B25]'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {cat.icon && cat.icon !== "false" && cat.icon !== "null" && (
                        <div className={`w-5 h-5 relative shrink-0 rounded-lg overflow-hidden flex items-center justify-center p-0.5 ${isSelected ? 'bg-orange-100/50' : 'bg-gray-50'}`}>
                          <Image src={cat.icon} alt={cat.name} fill className="object-contain" />
                        </div>
                      )}
                      <span className="text-[13px] font-bold tracking-tight">{cat.name}</span>
                    </div>
                    {hasSub && (
                      <ChevronRight
                        size={14}
                        className={`transition-transform duration-200 ${isSelected ? 'text-[#E47B25]' : 'text-gray-400'
                          } ${isExpanded ? 'rotate-90' : ''}`}
                        strokeWidth={2.5}
                      />
                    )}
                  </div>

                  {/* Subcategories */}
                  {hasSub && isExpanded && (
                    <div className="pl-6 py-1.5 space-y-1 bg-orange-50/5 rounded-b-xl border-l border-orange-200/50 ml-4 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      {subcategories.map((sub: any, sIdx: number) => {
                        const subName = typeof sub === 'string' ? sub : sub.title;
                        const subId = typeof sub === 'string' ? null : sub._id;
                        const isSubSelected = selectedSubCategoryId === subId;

                        return (
                          <div
                            key={subId || sIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategoryId(catId);
                              setSelectedSubCategoryId(subId);
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 text-[12px] rounded-lg cursor-pointer transition-all duration-200 hover:translate-x-1 ${isSubSelected
                                ? 'text-[#E47B25] bg-orange-50/70 font-bold'
                                : 'text-gray-500 hover:text-[#E47B25] hover:bg-orange-50/20'
                              }`}
                          >
                            <span className={`w-1 h-1 rounded-full shrink-0 ${isSubSelected ? 'bg-[#E47B25]' : 'bg-gray-300'}`} />
                            <span className="font-bold">{subName}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-[#FFFFFF] min-h-screen">
      {/* Container */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-14 py-4 md:py-8">

        {/* Mobile Header */}
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
        <div className="hidden md:flex items-center justify-between mb-12">
          <div className="relative">
            <h2 className="text-[28px] md:text-[1.4rem] font-medium text-[#000000] mb-2 pr-12">Special Combos</h2>
            <div className="w-[200px] h-[4px] bg-[#E47B25] rounded-full shadow-sm" />
          </div>
          <button
            onClick={() => setShowFilterView(!showFilterView)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border transition-all duration-300 font-bold text-[14px] ${showFilterView
              ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
              : 'bg-orange-50 border-[#E47B25] text-[#E47B25] hover:bg-orange-100'
              }`}
          >
            {showFilterView ? (
              <>
                <X size={18} />
                CLOSE FILTER
              </>
            ) : (
              <>
                <Filter size={18} />
                OPEN FILTER
              </>
            )}
          </button>
        </div>

        {/* Mobile Banner Section */}
        <div className="md:hidden space-y-4 mb-8 mt-6">
          <div className="relative w-full aspect-[2.1/1] rounded-[24px] overflow-hidden shadow-sm">
            <Image src="/ban1.png" alt="Raspberry Pi Boards" fill className="object-cover" />
          </div>

          <div className="grid grid-cols-3 gap-3 h-[180px]">
            <div className="col-span-1 flex flex-col gap-3">
              <div className="flex-1 relative rounded-[16px] overflow-hidden shadow-sm">
                <Image src="/ban2.png" alt="Arduino Focus" fill className="object-cover" />
              </div>
              <div className="flex-1 relative rounded-[16px] overflow-hidden shadow-sm">
                <Image src="/ban3.png" alt="Power Supply" fill className="object-cover" />
              </div>
            </div>
            <div className="col-span-2 relative rounded-[16px] overflow-hidden shadow-sm">
              <Image src="/ban5.png" alt="Automation Combo" fill className="object-cover" />
            </div>
          </div>

          <div className="flex justify-center gap-1.5 mt-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E47B25]" />
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
          </div>
        </div>

        {/* Sections for Mobile View */}
        <div className="md:hidden space-y-2">
          <SpecialCombo />

          <div className="w-full px-1 mb-8">
            <div className="relative w-full aspect-[21/9] rounded-[20px] overflow-hidden shadow-md">
              <Image src="/ban6.png" alt="Arduino Journey" fill className="object-cover" />
            </div>
          </div>

          <FlashSale />

          <FrequentlySaleProduct />

          <div className="w-full px-1 mb-8">
            <div className="relative w-full aspect-[21/9] rounded-[20px] overflow-hidden shadow-md">
              <Image src="/ban1.png" alt="Raspberry Pi Boards" fill className="object-cover" />
            </div>
            <div className="flex justify-center gap-1.5 mt-4">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#E47B25]" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8 px-1">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-sm">
              <Image src="/ban2.png" alt="B1" fill className="object-cover" />
            </div>
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-sm">
              <Image src="/ban3.png" alt="B2" fill className="object-cover" />
            </div>
          </div>

          <div className="w-full px-1 mb-8">
            <div className="relative w-full aspect-[21/9] rounded-[20px] overflow-hidden shadow-md">
              <Image src="/ban5.png" alt="Automation Combo" fill className="object-cover" />
            </div>
          </div>
        </div>

        {showFilterView ? (
          /* --- FILTERED VIEW (Aligned Grid to prevent Layout Shift) --- */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10 animate-in fade-in duration-500">
            {/* Complex Sidebar */}
            <aside className="hidden md:block md:col-span-1 space-y-6">
              <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden p-5 space-y-6">
                {renderCategoriesList()}

                {/* Price Filter */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <button className="text-[13px] font-bold text-gray-800 border-b-2 border-[#EE9C24] pb-1">Price Filter</button>
                    <button className="text-[13px] font-bold text-gray-400 border-b-2 border-transparent pb-1 flex items-center gap-1">
                      Color Filter
                    </button>
                  </div>
                  <div className="px-2 space-y-6">
                    <div className="h-1.5 w-full bg-gray-100 rounded-full relative cursor-pointer" onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = x / rect.width;
                      setPriceRange(prev => ({ ...prev, max: Math.round(10000 * percentage) }));
                    }}>
                      <div
                        className="absolute h-full bg-[#E47B25] rounded-full"
                        style={{ left: '0%', right: `${100 - (priceRange.max / 10000) * 100}%` }}
                      ></div>
                      <div className="absolute left-0 -top-1.5 w-4 h-4 bg-white border-2 border-[#E47B25] rounded-full shadow-sm"></div>
                      <div
                        className="absolute -top-1.5 w-4 h-4 bg-white border-2 border-[#E47B25] rounded-full shadow-sm cursor-grab active:cursor-grabbing"
                        style={{ left: `${(priceRange.max / 10000) * 100}%`, transform: 'translateX(-50%)' }}
                      ></div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-50 rounded-xl p-2.5 text-center text-[13px] font-bold text-gray-800 border border-gray-100 transition-all">₹{priceRange.min}</div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-2.5 text-center text-[13px] font-bold text-gray-800 border border-gray-100 transition-all">₹{priceRange.max}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setPriceRange({ min: 0, max: 10000 });
                          setAppliedPriceRange(null);
                        }}
                        className="flex-1 py-2 text-[13px] font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setAppliedPriceRange({ min: priceRange.min, max: priceRange.max })}
                        className="flex-1 py-2 text-[13px] font-bold text-white bg-[#E47B25] rounded-lg shadow-sm shadow-orange-100 hover:opacity-90 transition-opacity"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Deals */}
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <h4 className="text-[14px] font-bold text-gray-900 ">Deals</h4>
                  <div className="space-y-3">
                    {['Hot Deals', 'Deals', 'Deals'].map((brand, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <span className="text-[13px] font-bold text-gray-700">{brand}</span>
                        <div
                          onClick={() => toggleBrand(i)}
                          className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-all duration-300 relative ${activeBrandToggles.includes(i) ? 'bg-[#E47B25]' : 'bg-gray-200'}`}
                        >
                          <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${activeBrandToggles.includes(i) ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands Dynamic Radio List */}
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider">Brands</h4>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
                    <div
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => setSelectedBrandId(null)}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!selectedBrandId ? 'border-[#E47B25]' : 'border-gray-200 group-hover:border-gray-300'}`}>
                        {!selectedBrandId && <div className="w-2.5 h-2.5 bg-[#E47B25] rounded-full animate-in zoom-in duration-300"></div>}
                      </div>
                      <span className={`text-[13px] font-bold transition-colors ${!selectedBrandId ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-800'}`}>
                        All Brands
                      </span>
                    </div>

                    {brandsList.map((brand, i) => {
                      const isSelected = selectedBrandId === brand._id;
                      return (
                        <div
                          key={brand._id || i}
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => setSelectedBrandId(brand._id)}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#E47B25]' : 'border-gray-200 group-hover:border-gray-300'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-[#E47B25] rounded-full animate-in zoom-in duration-300"></div>}
                          </div>
                          <span className={`text-[13px] font-bold transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-800'}`}>
                            {brand.brandName || brand.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Feature Checkboxes */}
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider">feature</h4>
                  <div className="space-y-3">
                    {['High Precision', 'Durable', 'Reliable'].map((feat, i) => (
                      <div key={i} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFeature(i)}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${selectedFeatures.includes(i) ? 'bg-[#E47B25] border-[#E47B25]' : 'border-gray-200 group-hover:border-gray-300'}`}>
                          {selectedFeatures.includes(i) && <Check size={14} className="text-white" strokeWidth={4} />}
                        </div>
                        <span className={`text-[13px] font-bold transition-colors ${selectedFeatures.includes(i) ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-800'}`}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="pt-6 border-t border-gray-100 space-y-4 pb-4">
                  <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider">Rating</h4>
                  <div className="space-y-4">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-3 cursor-pointer group" onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedRating === rating ? 'bg-[#E47B25] border-[#E47B25]' : 'border-gray-200'}`}>
                          {selectedRating === rating && <Check size={14} className="text-white" strokeWidth={4} />}
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < rating ? 'fill-[#FFC107] text-[#FFC107]' : 'text-gray-200'} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Dynamic Combo Grid */}
            <div className="md:col-span-2 lg:col-span-3 space-y-8">


              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                  Array(6).fill(0).map((_, idx) => (
                    <ProductCardSkeleton key={`skeleton-filtered-${idx}`} />
                  ))
                ) : combos.length > 0 ? (
                  combos.map((combo) => (
                    <div key={combo._id} className="h-full animate-in fade-in zoom-in duration-300">
                      <ProductCard product={{
                        id: combo._id,
                        name: combo.name,
                        price: combo.comboPrice,
                        originalPrice: combo.totalMrp,
                        image: combo.icon || combo.images?.[0] || "/combo.png",
                        images: combo.images || (combo.icon ? [combo.icon] : []),
                        discount: combo.discountAmount ? `₹${combo.discountAmount} Off` : "50% Off",
                        category: combo.categories?.[0]?.title || "Category",
                        subcategory: combo.subCategories?.[0]?.title || "Sub category",
                        ...combo,
                        isCombo: true,
                        isHot: true
                      } as any} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 animate-in fade-in duration-300">
                    <Tag size={40} className="text-gray-400 mb-3 text-[#E47B25] animate-bounce" />
                    <h3 className="text-gray-800 font-bold text-lg mb-1">No Combos Found</h3>
                    <p className="text-gray-500 text-sm max-w-xs">There are no combos matching the selected filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* --- DEFAULT VIEW --- */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">
            {/* Sidebar - Hidden on mobile, shown on desktop */}
            <aside className="hidden md:block md:col-span-1">
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 mb-8">
                {renderCategoriesList()}
              </div>

              <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                <h3 className="text-[18px] font-bold text-[#000000] mb-8">Rating</h3>
                <div className="space-y-5">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-4 cursor-pointer group" onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}>
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

            {/* Default Combo Cards Grid */}
            <div className="md:col-span-2 lg:col-span-3">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10">
                {loading ? (
                  Array(6).fill(0).map((_, idx) => (
                    <div key={`skeleton-${idx}`} className="h-full">
                      <ProductCardSkeleton />
                    </div>
                  ))
                ) : combos.length > 0 ? (
                  combos.map((combo) => (
                    <div key={combo._id} className="h-full animate-in fade-in zoom-in duration-300">
                      <ProductCard product={{
                        id: combo._id,
                        name: combo.name,
                        price: combo.comboPrice,
                        originalPrice: combo.totalMrp,
                        image: combo.icon || combo.images?.[0] || "/combo.png",
                        images: combo.images || (combo.icon ? [combo.icon] : []),
                        discount: combo.discountAmount ? `₹${combo.discountAmount} Off` : "50% Off",
                        category: combo.categories?.[0]?.title || "Category",
                        subcategory: combo.subCategories?.[0]?.title || "Sub category",
                        ...combo,
                        isCombo: true,
                        isHot: true
                      } as any} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 w-full animate-in fade-in duration-300">
                    <Tag size={40} className="text-gray-400 mb-3 animate-bounce text-[#E47B25]" />
                    <h3 className="text-gray-800 font-bold text-lg mb-1">No Combos Found</h3>
                    <p className="text-gray-500 text-sm max-w-xs">There are no combos currently available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
                    const val = Math.round(priceRange.min + (priceRange.max - priceRange.min) * percentage);
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
                      left: `${(priceRange.min / 10000) * 100}%`,
                      right: `${100 - (priceRange.max / 10000) * 100}%`
                    }}
                  />
                  <div
                    className="absolute top-1/2 w-5 h-5 bg-white border-[2.5px] border-[#E47B25] rounded-full shadow-md z-10 -translate-y-1/2 -translate-x-1/2"
                    style={{ left: `${(priceRange.min / 10000) * 100}%` }}
                  />
                  <div
                    className="absolute top-1/2 w-5 h-5 bg-white border-[2.5px] border-[#E47B25] rounded-full shadow-md z-10 -translate-y-1/2 -translate-x-1/2"
                    style={{ left: `${(priceRange.max / 10000) * 100}%` }}
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
                  <div className="space-y-4 max-h-[150px] overflow-y-auto pr-1 no-scrollbar">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedBrandId(null)}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!selectedBrandId ? 'border-[#E47B25]' : 'border-gray-200'}`}>
                        {!selectedBrandId && <div className="w-2.5 h-2.5 bg-[#E47B25] rounded-full animate-in zoom-in" />}
                      </div>
                      <span className={`text-[13px] font-bold transition-colors ${!selectedBrandId ? 'text-[#E47B25]' : 'text-gray-600'}`}>All Brands</span>
                    </div>
                    {brandsList.map((brand, i) => {
                      const isSelected = selectedBrandId === brand._id;
                      return (
                        <div key={brand._id || i} className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedBrandId(brand._id)}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#E47B25]' : 'border-gray-200'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-[#E47B25] rounded-full animate-in zoom-in" />}
                          </div>
                          <span className={`text-[13px] font-bold transition-colors ${isSelected ? 'text-[#E47B25]' : 'text-gray-600'}`}>{brand.brandName || brand.name}</span>
                        </div>
                      );
                    })}
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
              <button
                onClick={() => {
                  setSelectedRating(0);
                  setPriceRange({ min: 0, max: 10000 });
                  setAppliedPriceRange(null);
                  setSelectedBrandId(null);
                  setSelectedCategoryId(null);
                  setSelectedSubCategoryId(null);
                  setIsFilterDrawerOpen(false);
                }}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold text-[14px]"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setAppliedPriceRange({ min: priceRange.min, max: priceRange.max });
                  setIsFilterDrawerOpen(false);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white font-bold text-[14px] shadow-lg shadow-orange-100"
              >
                Apply
              </button>
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
