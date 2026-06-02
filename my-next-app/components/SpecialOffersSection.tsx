"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Heart, Star, ShoppingCart, Check, Filter, X, ChevronDown, Tag, Zap, Flame, Trophy, Clock, ArrowLeft, ArrowUpDown, SlidersHorizontal, Home, Grid, User as UserIcon, HelpCircle } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

const banners = [
  {
    id: 1,
    image: "/motor1.png",
    title: "Servo Motors",
    subtitle: "Precision Motion Control",
    features: ["Smooth rotation", "Ideal for robotics", "Durable & efficient"],
    buttonText: "SHOP NOW"
  },
  {
    id: 2,
    image: "/motor2.png",
    title: "HIGH-SPEED DRONE PERFORMANCE",
    features: ["Lightweight & powerful", "Smooth flight control", "Reliable performance"],
    buttonText: "Explore More"
  },
  {
    id: 3,
    image: "/motor3.png",
    title: "Smart Sensors for Smart Projects",
    features: ["Temperature, gas, IR & more", "Accurate and reliable", "Easy to integrate"],
    buttonText: "ORDER NOW!"
  }
];

const categories = [
  { name: "All Categories", active: true },
  { name: "Communication", hasSub: true },
  { name: "Arduino", hasSub: true },
  {
    name: "Raspberry Pi",
    active: true,
    expanded: true,
    subCategories: ["Pi camera", "Pi Board", "Pi Display", "Pi Module", "Pi Accessories"]
  },
  { name: "Motors", hasSub: true },
  { name: "Label", hasSub: true },
  { name: "Label", hasSub: true },
];

const dummyProducts = Array(12).fill({
  id: "69c6238ac40bad37d3db4a96",
  name: "Bluetooth 4.0 Module NRF51822",
  description: "Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ipsume.lorem...",
  price: 447,
  originalPrice: 447,
  rating: 5,
  category: "Category",
  subcategory: "Sub category",
  image: "/speacialoffer.png",
  discount: "50% Off"
});

const filterTabs = [
  { id: 'best-selling', name: 'Best Selling', icon: Trophy },
  { id: 'new-arrivals', name: 'New Arrivals', icon: Tag, active: true },
  { id: 'hot-deals', name: 'Hot Deals', icon: Flame },
  { id: 'frequently-sale', name: 'Frequently sale Product', icon: Zap },
  { id: 'flash-sale', name: 'Flash sale', icon: Clock },
];

import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';

const SpecialOffersSection = ({ loading = false }: { loading?: boolean }) => {
  const [selectedRating, setSelectedRating] = useState(5);
  const [showFilterView, setShowFilterView] = useState(false);

  // Price Range State
  const [priceRange, setPriceRange] = useState({ min: 447, max: 627 });

  // Brand Toggles State (index based for mockup)
  const [activeBrandToggles, setActiveBrandToggles] = useState<number[]>([0]);

  // Brand Radios State
  const [activeBrandRadio, setActiveBrandRadio] = useState(0);

  // Category Tabs State
  const [activeTabId, setActiveTabId] = useState('new-arrivals');

  // Mobile Drawers State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);

  // Feature Checkboxes State
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([0]);

  const toggleBrand = (idx: number) => {
    setActiveBrandToggles(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  // Dynamic Data State
  const [products, setProducts] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>(categories);
  const [isDataLoading, setIsDataLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        setIsDataLoading(true);
        const { BASE_URL } = await import('@/redux/slices/apiConfig');
        const cleanBaseUrl = BASE_URL;
        const url = `${cleanBaseUrl.endsWith('/') ? cleanBaseUrl : cleanBaseUrl + '/'}home`;

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(url, { headers });
        const json = await res.json();

        if (json.success && isMounted) {
          if (json.data?.categories) {
            setCategoriesList([
              { name: "All Categories", active: true },
              ...json.data.categories.map((c: any) => ({
                name: c.title,
                hasSub: false, // You can populate this if subcategories exist
                active: false
              }))
            ]);
          }

          if (json.data?.specialOffers) {
            const mapped = json.data.specialOffers.map((p: any) => ({
              id: p._id,
              variantId: p.variantId || p._id,
              name: p.name || p.title || 'Product',
              description: p.description || 'Latest top-quality product with special price.',
              price: p.price || p.mrp || 0,
              originalPrice: p.mrp || p.price || 0,
              rating: p.avgRating || 5,
              category: p.categoryName || 'Electronics',
              subcategory: p.subCategoryName || 'Gadgets',
              image: p.images?.[0] || (p.icon && p.icon !== 'false' ? p.icon : '/bluetooth.png'),
              images: p.images && p.images.length > 0 ? p.images : (p.icon && p.icon !== 'false' ? [p.icon] : []),
              discount: p.discount ? `${p.discount}% Off` : undefined,
              slug: p.slug
            }));
            setProducts(mapped.length ? mapped : dummyProducts);
          } else {
            setProducts(dummyProducts);
          }
        }
      } catch (err) {
        console.error("Error fetching special offers:", err);
        setProducts(dummyProducts);
      } finally {
        if (isMounted) setIsDataLoading(false);
      }
    };

    fetchHomeData();
    return () => { isMounted = false; };
  }, []);

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
            <h1 className="text-white font-bold text-lg">Special Offers</h1>
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

        {/* Mobile Filter Tabs (At the very top as requested) */}
        <div className="md:hidden flex overflow-x-auto no-scrollbar gap-3 mb-6 pb-2 -mx-1 px-1 mt-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 text-[13px] font-bold whitespace-nowrap shadow-sm ${activeTabId === tab.id
                ? 'border-[#E47B25] text-[#E47B25] bg-orange-50/30 ring-1 ring-[#E47B25]/20'
                : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
                }`}
            >
              <tab.icon size={16} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Breadcrumb (Desktop Only) */}
        <nav className="hidden md:flex items-center gap-2 text-[10px] md:text-[14px] font-medium mb-10 tracking-tight">
          <Link href="/" className="text-gray-400 hover:text-gray-600">HOME</Link>
          <span className="text-gray-400 font-normal">{'>'}</span>
          <span className="text-[#E47B25]">SPECIAL OFFERS</span>
        </nav>

        {/* Section Title & Filter Toggle (Desktop Only) */}
        <div className="hidden md:flex items-center justify-between mb-12">
          <Link href="/special-combos" className="group">
            <h1 className="text-[28px] md:text-[1.4rem] font-medium text-[#000000] mb-2 group-hover:text-[#E47B25] transition-colors">Exclusive Deals & Offers</h1>
            <div className="w-[200px] h-[4px] bg-[#E47B25] rounded-full shadow-sm" />
          </Link>
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


        {/* Mobile Banners Carousel (Image 1) */}
        {!showFilterView && (
          <div className="md:hidden flex overflow-x-auto no-scrollbar gap-4 mb-10 pb-2 -mx-4 px-4">
            {banners.map((banner) => (
              <div key={banner.id} className="min-w-[85%] relative aspect-[1.3/1] rounded-[24px] overflow-hidden shadow-md group">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            ))}
          </div>
        )}

        {showFilterView ? (
          /* --- FILTERED VIEW (Same to same as image) --- */
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-4">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-300 text-[14px] font-medium shadow-sm ${activeTabId === tab.id
                    ? 'border-[#E47B25] text-[#E47B25] bg-orange-50/30 ring-1 ring-[#E47B25]/20'
                    : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
                    }`}
                >
                  <tab.icon size={16} />
                  {tab.name}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-10">
              {/* Complex Sidebar */}
              <aside className="w-full md:w-[320px] shrink-0 space-y-6">
                <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden p-5 space-y-6">
                  {/* Categories */}
                  <div className="space-y-1">
                    {categoriesList.map((cat, idx) => (
                      <div key={idx} className="group">
                        <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition-all ${cat.active && !cat.subCategories ? 'bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white' : cat.name === 'Raspberry Pi' && cat.active ? 'bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white' : 'hover:bg-orange-50 text-gray-700'}`}>
                          <span className="text-[14px] font-bold">{cat.name}</span>
                          <ChevronRight size={14} className={cat.active ? 'text-white' : 'text-[#E47B25]'} strokeWidth={3} />
                        </div>
                        {cat.expanded && cat.subCategories && (
                          <div className="pl-6 pt-2 pb-1 space-y-3">
                            {cat.subCategories.map((sub: any, sIdx: number) => (
                              <div key={sIdx} className="flex items-center gap-2 group/sub cursor-pointer">
                                <ChevronRight size={10} className="text-[#E47B25] -ml-2" strokeWidth={4} />
                                <span className="text-[13px] text-gray-600 font-bold group-hover/sub:text-[#E47B25]">{sub}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Price Filter */}
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                      <button className="text-[13px] font-bold text-gray-800 border-b-2 border-transparent pb-1">Price Filter</button>
                      <button className="text-[13px] font-bold text-[#E47B25] border-b-2 border-[#EE9C24] pb-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#E47B25]"></span>
                        Color Filter
                      </button>
                    </div>
                    <div className="px-2 space-y-6">
                      {/* Interactive Progress Bar Slider Mockup */}
                      <div className="h-1.5 w-full bg-gray-100 rounded-full relative cursor-pointer" onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percentage = x / rect.width;
                        setPriceRange(prev => ({ ...prev, max: Math.round(447 + (627 - 447) * percentage) }));
                      }}>
                        <div
                          className="absolute h-full bg-[#E47B25] rounded-full"
                          style={{ left: '0%', right: `${100 - ((priceRange.max - 447) / (627 - 447)) * 100}%` }}
                        ></div>
                        <div className="absolute left-0 -top-1.5 w-4 h-4 bg-white border-2 border-[#E47B25] rounded-full shadow-sm"></div>
                        <div
                          className="absolute -top-1.5 w-4 h-4 bg-white border-2 border-[#E47B25] rounded-full shadow-sm cursor-grab active:cursor-grabbing"
                          style={{ left: `${((priceRange.max - 447) / (627 - 447)) * 100}%`, transform: 'translateX(-50%)' }}
                        ></div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-50 rounded-xl p-2.5 text-center text-[13px] font-bold text-gray-800 border border-gray-100 transition-all">₹{priceRange.min}</div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-2.5 text-center text-[13px] font-bold text-gray-800 border border-gray-100 transition-all">₹{priceRange.max}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPriceRange({ min: 447, max: 627 })}
                          className="flex-1 py-2 text-[13px] font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button className="flex-1 py-2 text-[13px] font-bold text-white bg-[#E47B25] rounded-lg shadow-sm shadow-orange-100 hover:opacity-90 transition-opacity">Apply</button>
                      </div>
                    </div>
                  </div>

                  {/* Brands & Feature Checkboxes */}
                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <h4 className="text-[14px] font-bold text-gray-900 ">Brands</h4>
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

                  {/* Second Brands/Radios */}
                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider">Brands</h4>
                    <div className="space-y-3">
                      {['All', 'All', 'All', 'All'].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveBrandRadio(i)}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${activeBrandRadio === i ? 'border-[#E47B25]' : 'border-gray-200 group-hover:border-gray-300'}`}>
                            {activeBrandRadio === i && <div className="w-2.5 h-2.5 bg-[#E47B25] rounded-full animate-in zoom-in duration-300"></div>}
                          </div>
                          <span className={`text-[13px] font-bold transition-colors ${activeBrandRadio === i ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-800'}`}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature Checkboxes */}
                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider">feature</h4>
                    <div className="space-y-3">
                      {['Deals', 'Deals', 'Deals'].map((feat, i) => (
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
                        <div key={rating} className="flex items-center gap-3 cursor-pointer group" onClick={() => setSelectedRating(rating)}>
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

              {/* Product Grid Area */}
              <div className="flex-1 space-y-8">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-[20px] font-bold text-gray-900 mb-1">
                      {filterTabs.find(t => t.id === activeTabId)?.name || 'New Release'}
                    </h2>
                    <div className="w-[100px] h-[3px] bg-[#E47B25] rounded-full"></div>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm cursor-pointer group">
                    <span className="text-[13px] font-bold text-gray-600">Newest First</span>
                    <ChevronDown size={16} className="text-gray-400 group-hover:text-[#E47B25]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {isDataLoading || loading ? (
                    Array(6).fill(0).map((_, idx) => (
                      <ProductCardSkeleton key={`skeleton-filtered-${idx}`} />
                    ))
                  ) : (
                    products.map((product, idx) => (
                      <div key={`${activeTabId}-${idx}`} className="h-full animate-in fade-in zoom-in duration-300">
                        <ProductCard product={{
                          ...product,
                          isTrending: activeTabId === 'new-arrivals' || activeTabId === 'hot-deals'
                        }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- DEFAULT VIEW (Simple with banners) --- */
          <>
            {/* Promo Banners Grid (Desktop Only) */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
              {banners.map((banner) => (
                <div key={banner.id} className="relative aspect-[16/10] md:aspect-[1.3/1] rounded-[24px] overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>

            {/* Main Content: Sidebar + Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">

              {/* Sidebar - Hidden on mobile, shown on desktop */}
              <aside className="hidden md:block md:col-span-1 md:row-span-2">
                {/* Categories Card */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 mb-8">
                  <div className="space-y-2">
                    {categoriesList.map((cat, idx) => (
                      <div key={idx} className="space-y-2">
                        <div
                          className={`flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 ${(cat.active && !cat.subCategories) || (cat.name === 'Raspberry Pi' && cat.active)
                            ? 'bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white shadow-lg shadow-orange-100 scale-[1.02]'
                            : 'hover:bg-orange-50 text-[#2F2F2F]'
                            }`}
                        >
                          <span className="text-[15px] font-bold">{cat.name}</span>
                          <ChevronRight size={18} className={(cat.active || cat.expanded) ? 'text-white' : 'text-[#E47B25]'} strokeWidth={3} />
                        </div>

                        {/* Subcategories (Expanded) */}
                        {cat.expanded && cat.subCategories && (
                          <div className="pl-8 space-y-4 py-4">
                            {cat.subCategories.map((sub: any, sIdx: number) => (
                              <div key={sIdx} className="flex items-center gap-3 group cursor-pointer">
                                <div className="flex gap-0.5 text-[#E47B25] group-hover:translate-x-1 transition-transform">
                                  <ChevronRight size={12} strokeWidth={4} />
                                  <ChevronRight size={12} strokeWidth={4} className="-ml-2" />
                                </div>
                                <span className="text-[14px] text-gray-700 font-bold group-hover:text-[#E47B25] transition-colors">{sub}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating Filter Card */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                  <h3 className="text-[18px] font-bold text-[#000000] mb-8">Rating</h3>
                  <div className="space-y-5">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div
                        key={rating}
                        className="flex items-center gap-4 cursor-pointer group"
                        onClick={() => setSelectedRating(rating)}
                      >
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${selectedRating === rating
                          ? 'bg-[#E47B25] border-[#E47B25] shadow-sm shadow-orange-100'
                          : 'border-gray-200 group-hover:border-[#E47B25]'
                          }`}>
                          {selectedRating === rating && <Check size={16} className="text-white" strokeWidth={4} />}
                        </div>
                        <div className="flex gap-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              className={i < rating ? 'fill-[#FFC107] text-[#FFC107]' : 'text-gray-200'}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Product Cards - Grid (2 cols on mobile) */}
              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-10">
                {isDataLoading || loading ? (
                  Array(6).fill(0).map((_, idx) => (
                    <ProductCardSkeleton key={`skeleton-default-${idx}`} />
                  ))
                ) : (
                  products.map((product, idx) => (
                    <div key={`${activeTabId}-${idx}`} className="h-full animate-in fade-in zoom-in duration-300">
                      <ProductCard product={{
                        ...product,
                        isTrending: activeTabId === 'new-arrivals' || activeTabId === 'hot-deals',
                        isHot: false
                      }} />
                    </div>
                  ))
                )}
              </div>

            </div>
          </>
        )}

      </div>

      {/* Mobile Filter Drawer (Image 2 - left) */}
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
                    // Simple logic to move the closer handle
                    if (Math.abs(val - priceRange.min) < Math.abs(val - priceRange.max)) {
                      setPriceRange(prev => ({ ...prev, min: val }));
                    } else {
                      setPriceRange(prev => ({ ...prev, max: val }));
                    }
                  }}
                >
                  {/* Connecting Bar */}
                  <div
                    className="absolute h-full bg-[#E47B25] rounded-full"
                    style={{
                      left: `${((priceRange.min - 447) / (627 - 447)) * 100}%`,
                      right: `${100 - ((priceRange.max - 447) / (627 - 447)) * 100}%`
                    }}
                  />
                  {/* Min Handle */}
                  <div
                    className="absolute top-1/2 w-5 h-5 bg-white border-[2.5px] border-[#E47B25] rounded-full shadow-[0_2px_10px_rgba(228,123,37,0.3)] z-10 -translate-y-1/2 -translate-x-1/2 transition-all active:scale-110"
                    style={{ left: `${((priceRange.min - 447) / (627 - 447)) * 100}%` }}
                  />
                  {/* Max Handle */}
                  <div
                    className="absolute top-1/2 w-5 h-5 bg-white border-[2.5px] border-[#E47B25] rounded-full shadow-[0_2px_10px_rgba(228,123,37,0.3)] z-10 -translate-y-1/2 -translate-x-1/2 transition-all active:scale-110"
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
              <button
                onClick={() => {
                  setPriceRange({ min: 447, max: 627 });
                  setActiveBrandToggles([0]);
                  setActiveBrandRadio(0);
                  setSelectedFeatures([0]);
                  setSelectedRating(5);
                }}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold text-[14px] hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white font-bold text-[14px] shadow-lg shadow-orange-100 hover:opacity-90 transition-opacity">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sort Drawer (Image 2 - right) */}
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
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${i === 0 ? 'bg-orange-500 border-orange-500 shadow-sm' : 'border-gray-100 group-hover:border-orange-200'}`}>
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

export default SpecialOffersSection;
