"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingCart, User, Heart, Package, Truck, ChevronDown, ChevronRight, Menu, X, Star, Bell } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchCategories } from '@/redux/slices/bulkInquirySlice';
import { usePathname, useRouter } from 'next/navigation';
import { fetchWishlist } from '@/redux/slices/wishlistSlice';
import { fetchUnseenCount } from '@/redux/slices/notificationSlice';
import MobileSidebar from './MobileSidebar';
import WishlistModal from './WishlistModal';

const staticCategories = [
  {
    name: 'Communication',
    subcategories: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6']
  },
  {
    name: 'Arduino',
    subcategories: ['Arduino Uno', 'Arduino Mega', 'Arduino Nano', 'Arduino Shields', 'Arduino Kits', 'Arduino Accessories']
  },
  {
    name: 'Raspberry Pi',
    subcategories: ['RPi 4', 'RPi 3', 'RPi Zero', 'RPi Accessories', 'RPi Shields', 'RPi Kits']
  },
  {
    name: 'Sensors',
    subcategories: ['Temperature', 'Ultrasonic', 'Gas Sensors', 'IR Sensors', 'Pressure Sensors', 'Motion Sensors']
  },
  {
    name: 'Motors',
    subcategories: ['Servo Motors', 'DC Motors', 'Stepper Motors', 'Motor Drivers', 'Linear Actuators', 'Wheels']
  },
  {
    name: 'Robot Parts',
    subcategories: ['Chassis', 'Wheels', 'Grippers', 'Robot Arms', 'Gears', 'Bearings']
  },
  {
    name: 'Drone Parts',
    subcategories: ['Propellers', 'Flight Controllers', 'ESCs', 'Drone Frames', 'BLDC Motors', 'FPV Cameras']
  },
  {
    name: 'Development Boards',
    subcategories: ['ESP32', 'ESP8266', 'STM32', 'TIVA', 'PIC', 'AVR']
  },
  {
    name: 'Programmers',
    subcategories: ['USBASP', 'FTDI', 'Pickit', 'ST-Link', 'JTAG', 'ISP']
  }
];

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { categories: dynamicCategories } = useSelector((state: RootState) => state.bulkInquiry);
  const { unseenCount } = useSelector((state: RootState) => state.notification);
  const { token: rawToken } = useSelector((state: RootState) => state.auth);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const token = isMounted ? rawToken : null;
  const pathname = usePathname() || '';

  const isCustomHeaderPage = pathname === '/faq' || pathname === '/about-us' || pathname === '/contact-us' || pathname === '/affiliate' || pathname === '/support-policy' || pathname === '/return-policy' || pathname === '/privacy-policy' || pathname === '/terms' || pathname === '/shipping-delivery';
  const isBulkInquiryPage = pathname === '/bulk-inquiry';
  const isBlogListingRoute = pathname === '/blog';
  const isVideoGalleryRoute = pathname === '/video-gallery';
  const isProjectRoute = pathname === '/project';
  const isCareerRoute = pathname === '/career';
  const isAtlKitsRoute = pathname.startsWith('/atl-kits');
  const isSupportPolicyRoute = pathname === '/support-policy';
  const isCareerDetailRoute = pathname.startsWith('/career/') && pathname.split('/').length === 3;
  const isProductDetailRoute = pathname.startsWith('/product/') && pathname.split('/').length === 3;
  const isComboDetailRoute = pathname.startsWith('/combo/') && pathname.split('/').length === 3;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/search?search=${encodeURIComponent(searchQuery)}`);
          const json = await res.json();
          if (json.success) {
            setSearchResults(json.data.products || []);
          }
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Create display categories list
  const displayCategories = React.useMemo(() => {
    if (dynamicCategories && dynamicCategories.length > 0) {
      const uniqueMap = new Map();
      dynamicCategories.forEach((c: any) => {
        const key = c._id || c.title;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, {
            ...c,
            name: c.title,
            subcategories: c.subcategories || []
          });
        }
      });
      return Array.from(uniqueMap.values());
    }
    return staticCategories;
  }, [dynamicCategories]);

  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const [activeCategory, setActiveCategory] = useState<any>(null);

  // Initialize and Sync activeCategory
  useEffect(() => {
    if (!activeCategory && displayCategories.length > 0) {
      setActiveCategory(displayCategories[0]);
    }
  }, [displayCategories, activeCategory]);

  useEffect(() => {
    const activeToken = rawToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    dispatch(fetchCategories(activeToken));
    if (activeToken) {
      dispatch(fetchWishlist());
      dispatch(fetchUnseenCount());
    }
  }, [dispatch, rawToken]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (pathname === "/allproduct") {
    return (
      <nav className="hidden md:flex w-full flex-col font-sans relative">
        <div className="flex bg-white py-4 px-6 items-center justify-between gap-4 max-w-[1400px] mx-auto w-full">
          <Link href="/" className="flex flex-col shrink-0 cursor-pointer hover:opacity-80 transition-opacity duration-200">
            <Image src="/logo.png" alt="Logo" width={140} height={36} className="h-auto w-[140px]" />
          </Link>
          <div className="flex-1 max-w-2xl relative group mx-4" ref={searchRef}>
            <div className="flex items-center border-[1.5px] border-[#EE9C24] rounded-full overflow-hidden hover:border-[#EE9C24] transition-colors bg-white pr-1 py-0.5 pl-4 shadow-sm w-full">
              <input type="text" placeholder="Search components..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setIsSearchFocused(true)} className="w-full py-2 outline-none text-sm text-gray-600" />
              <button className="bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white p-2 rounded-full"><Search size={20} /></button>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link href={token ? "/my-orders" : "/login"} className="flex items-center gap-2 cursor-pointer hover:text-[#EE9C24]">
              <Image src="/order.png" alt="order" width={22} height={22} className='grayscale opacity-70' />
              <span>My Order</span>
            </Link>
            <Link href={token ? "/track-order" : "/login"} className="flex items-center gap-2 cursor-pointer hover:text-[#EE9C24]">
              <Truck size={20} />
              <span>Track My Order</span>
            </Link>
            {!token && (
              <Link href="/login" className="flex items-center gap-1.5 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white px-4 py-2 rounded-md font-bold shadow-md">
                <span>Login</span>
                <ChevronDown size={14} />
              </Link>
            )}
          </div>
        </div>
        <div className="w-full" style={{ background: 'linear-gradient(to right, #E47B25, #B3520A)' }}>
          <div className="max-w-[1400px] mx-auto px-6 h-12 flex items-center justify-between text-white font-medium">
            <div className="flex items-center h-full relative" ref={dropdownRef}>
              <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-1 px-4 h-full cursor-pointer border-r border-white/20 whitespace-nowrap hover:bg-white/10">
                <span className="text-sm">All Categories</span>
                <ChevronDown size={16} />
              </div>
              <div className="flex items-center gap-4 lg:gap-8 px-4 lg:px-8 h-full text-sm">
                <Link href="/" className="hover:text-orange-200 transition-colors">Home</Link>
                <Link href="/allproduct" className="hover:text-orange-200 transition-colors">Shop By</Link>
                <Link href="/bulk-inquiry" className="hover:text-orange-200 transition-colors hidden lg:inline">Bulk Inquiry</Link>
                <Link href="/special-offers" className="hover:text-orange-200 transition-colors">Special Offers</Link>
                <Link href="/special-combos" className="hover:text-orange-200 transition-colors">Special Combos</Link>
                <Link href="/atl-kits" className="hover:text-orange-200 transition-colors hidden xl:inline">ATL Kits</Link>
                <Link href="/blog" className="hover:text-orange-200 transition-colors">Blog</Link>
                <Link 
                  href="/project" 
                  className="transition-all duration-300 px-3 py-1 rounded-full font-semibold border border-white/30 text-white hover:bg-white/10 hover:border-white/60"
                >
                  Projects
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4 lg:gap-6 pr-2 shrink-0">
              <div className="relative cursor-pointer hover:scale-110 transition-transform" onClick={() => setIsWishlistModalOpen(true)}>
                <Image src="/heart1.png" alt="wishlist" width={20} height={20} style={{ width: 'auto', height: 'auto' }} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <Link href="/cart" className="relative cursor-pointer hover:scale-110 transition-transform">
                <Image src="/shoppingcart.png" alt="cart" width={20} height={20} style={{ width: 'auto', height: 'auto' }} />
                {cartItems?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                    {cartItems.length}
                  </span>
                )}
              </Link>
              <Link href={token ? "/profile" : "/login"}>
                <Image src="/account.png" alt="account" width={20} height={20} />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const isProfileRoute = pathname.startsWith('/profile') || pathname === '/notifications' || pathname === '/view-invoices' || pathname === '/my-wishlist' || pathname === '/my-orders' || pathname === '/track-order' || pathname === '/affiliate-dashboard' || pathname === '/refer-earn' || pathname === '/payments-wallet' || pathname.startsWith('/membership');

  return (
    <nav className={`w-full flex-col font-sans relative ${isBulkInquiryPage ? 'hidden lg:flex' : isAtlKitsRoute ? 'hidden' : (isProfileRoute || isBlogListingRoute || isVideoGalleryRoute || isProjectRoute || isCareerRoute || isCustomHeaderPage || isCareerDetailRoute || isProductDetailRoute || isComboDetailRoute || pathname === '/special-offers' || pathname === '/special-combos' || pathname === '/cart') ? 'hidden md:flex' : 'flex'}`}>
      {(!isCustomHeaderPage && !isBlogListingRoute && !isVideoGalleryRoute && !isProjectRoute && !isCareerRoute && !isAtlKitsRoute && !isCareerDetailRoute && !isProductDetailRoute && !isComboDetailRoute && pathname !== '/special-combos') && (
        <div className="flex flex-col md:hidden w-full bg-white">
          <div className="flex items-center justify-between px-4 py-3 gap-2">
            <Link href="/" className="shrink-0">
              <Image src="/logo.png" alt="Logo" width={80} height={24} className="h-auto w-[35px]" />
            </Link>
            <div className="flex-1 max-w-[200px] relative">
              <div className="flex items-center border border-orange-200 rounded-full overflow-hidden bg-white pr-1 py-0.5 pl-3 shadow-sm w-full">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setIsMobileSearchOpen(true);
                    setIsSearchFocused(true);
                  }}
                  className="w-full  outline-none text-[10px] text-gray-600 placeholder:text-gray-400"
                />
                <button className="bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white p-1 rounded-full shrink-0">
                  <Search size={12} />
                </button>
              </div>
            </div>
            {!token && (
              <Link
                href="/login"
                className="bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white px-3 py-1.5 rounded-md text-[11px] font-bold shadow-sm whitespace-nowrap"
              >
                Login -
              </Link>
            )}
          </div>
          <div className="h-[1px] bg-gray-100 w-full" />
          <div className="flex items-center justify-between px-4 py-3 relative h-[55px]">
            <button
              className={`text-[#E47B25] transition-opacity duration-300 ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              onClick={() => setIsMenuOpen(true)}
            >
              <div className="flex flex-col gap-1 w-6">
                <span className="w-full h-[2.5px] bg-[#E47B25] rounded-full"></span>
                <span className="w-full h-[2.5px] bg-[#E47B25] rounded-full"></span>
                <span className="w-2/3 h-[2.5px] bg-[#E47B25] rounded-full"></span>
              </div>
            </button>
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <Image src="/logo.png" alt="Logo" width={90} height={28} className="h-auto w-[55px]" />
            </Link>
            <div className="flex items-center gap-3 text-[#E47B25]">
              <Search size={20} className="cursor-pointer" onClick={() => setIsMobileSearchOpen(true)} />
              <Link href="/notifications" className="relative cursor-pointer">
                <Bell size={20} />
                {unseenCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                    {unseenCount > 9 ? '9+' : unseenCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
          <div className="h-[1px] bg-gray-200 w-full" />
        </div>
      )}

      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-[120] animate-in fade-in duration-300">
          <div className="flex items-center px-4  gap-3 border-b border-gray-100 h-[60px]">
            <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2 border border-orange-100">
              <Search size={18} className="text-[#E47B25]" />
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-sm px-2 text-gray-700"
                autoFocus
                onFocus={() => setIsSearchFocused(true)}
              />
            </div>
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setIsSearchFocused(false);
              }}
              className="text-[#E47B25] p-1"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100vh-60px)]">
            <h3 className="text-[#DE7420] text-sm font-medium mb-4">{searchQuery.length >= 2 ? 'Search Results' : 'Type to search...'}</h3>
            <div className="space-y-4">
              {isSearching ? (
                <div className="text-gray-500 text-sm py-2">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((product) => (
                  <Link href={`/product/${product.slug || product._id}`} onClick={() => setIsMobileSearchOpen(false)} key={product._id} className="flex items-center gap-3 p-2 border-b border-gray-50">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.name} width={32} height={32} className="object-contain w-full h-full" />
                      ) : (
                        <Image src="/btmodule.png" alt="p" width={32} height={32} className="object-contain" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</span>
                      <span className="text-[10px] text-gray-400">Price: ₹{product.finalPrice || product.price || 0}</span>
                    </div>
                  </Link>
                ))
              ) : searchQuery.length >= 2 ? (
                <div className="text-gray-500 text-sm py-2">No products found.</div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <div className="hidden md:flex bg-white py-4 px-6 items-center justify-between gap-4 max-w-[1400px] mx-auto w-full">
        <Link href="/" className="flex flex-col shrink-0 cursor-pointer hover:opacity-80 transition-opacity duration-200">
          <Image src="/logo.png" alt="Logo" width={140} height={36} className="h-auto w-[140px]" style={{ width: 'auto', height: 'auto' }} />
        </Link>
        <div className="flex-1 max-w-2xl relative group mx-4" ref={searchRef}>
          <div className="flex items-center border-[1.5px] border-orange-200 rounded-full overflow-hidden hover:border-orange-400 transition-colors bg-white pr-1 py-0.5 pl-4 shadow-sm w-full">
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full py-2 outline-none text-sm text-gray-600 placeholder:text-gray-400"
            />
            <button className="bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white p-2 rounded-full hover:opacity-90 transition-opacity shrink-0">
              <Search size={20} />
            </button>
          </div>
          {isSearchFocused && (
            <div className="absolute top-[110%] mt-2 left-0 w-[700px] bg-white rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-[110] border border-gray-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300 max-h-[70vh] overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[#DE7420] p-3 text-base font-medium">{searchQuery.length >= 2 ? 'Search Results' : 'Type to search...'}</h3>
                  {searchQuery.length >= 2 && <Link href={`/allproduct?search=${encodeURIComponent(searchQuery)}`} onClick={() => setIsSearchFocused(false)} className="text-gray-500 text-sm font-bold hover:text-[#DE7420] transition-colors">View All</Link>}
                </div>
                {isSearching ? (
                  <div className="text-center py-8 text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4 p-3 ">
                    {searchResults.slice(0, 6).map((product) => (
                      <Link href={`/product/${product.slug || product._id}`} onClick={() => setIsSearchFocused(false)} key={product._id} className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col group hover:shadow-md transition-all shadow-sm relative">
                        {product.trending && (
                          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-gradient-to-r from-[#DE7420] to-[#B3520A] text-white text-[9px] font-bold px-2 py-1 rounded-md">
                            <Image src="/hot.png" alt="hot" width={10} height={10} className="invert brightness-0" />
                            Trending
                          </div>
                        )}
                        <div className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 rounded-full shadow-sm text-[#DE7420] hover:bg-orange-50 cursor-pointer">
                          <Heart size={14} />
                        </div>
                        <div className="aspect-[4/3] flex items-center justify-center mb-3 overflow-hidden">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} width={100} height={100} className="object-contain w-full h-full group-hover:scale-110 transition-transform" />
                          ) : (
                            <Image src="/bluetooth.png" alt="p" width={100} height={100} className="object-contain group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                        <div className="flex flex-col space-y-1 mt-auto">
                          <h4 className="text-[12px] text-gray-900 font-medium line-clamp-1">{product.name}</h4>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, j) => <Star key={j} size={10} fill="currentColor" />)}
                          </div>
                          <div className="flex items-end justify-between mt-2">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-gray-400 leading-none">Price</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-gray-900">₹{product.finalPrice || product.price || 0}</span>
                                {product.discount > 0 && <span className="text-[10px] text-gray-400 line-through">₹{product.price || 0}</span>}
                              </div>
                            </div>
                            <button className="bg-gradient-to-r from-[#DE7420] to-[#C25C13] text-white p-1.5 rounded-lg shadow-sm hover:opacity-90">
                              <ShoppingCart size={14} />
                            </button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-8 text-gray-500">No products found.</div>
                ) : null}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href={token ? "/my-orders" : "/login"} className="flex items-center gap-2 cursor-pointer hover:text-[#EE9C24] transition-colors">
            <Image src="/order.png" alt="order" width={22} height={22} className='grayscale opacity-70' style={{ width: 'auto', height: 'auto' }} />
            <span>My Order</span>
          </Link>
          <Link href={token ? "/track-order" : "/login"} className="flex items-center gap-2 cursor-pointer hover:text-[#EE9C24] transition-colors">
            <Truck size={20} className="text-gray-600" />
            <span>Track My Order</span>
          </Link>
          {!token && (
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white px-4 py-2 rounded-md cursor-pointer hover:opacity-90 transition-opacity font-bold shadow-md shadow-orange-100"
            >
              <span>Login</span>
              <ChevronDown size={14} />
            </Link>
          )}
        </div>
      </div>

      <div className="hidden md:block w-full" style={{ background: 'linear-gradient(to right, #E47B25, #B3520A)' }}>
        <div className="max-w-[1400px] mx-auto px-6 h-12 flex items-center justify-between text-white font-medium">
          <div className="flex items-center h-full relative" ref={dropdownRef}>
            <div
              className={`flex items-center gap-1 px-4 h-full cursor-pointer transition-colors border-r border-white/20 whitespace-nowrap ${isDropdownOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="text-sm">All Categories</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-[100%] left-0 w-[600px] bg-white rounded-b-2xl shadow-2xl z-[100] border border-gray-100 flex overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ease-out">
                <div className="w-[300px] bg-white border-r border-gray-100 py-4 max-h-[500px] overflow-y-auto">
                  {displayCategories.map((category) => (
                    <div
                      key={category._id || category.name}
                      onMouseEnter={() => setActiveCategory(category)}
                      onClick={() => {
                        const catId = category._id || category.id;
                        const subCount = category.subcategories?.length || 0;
                        if (subCount === 0) {
                          setIsDropdownOpen(false);
                          if (catId) {
                            router.push(`/?category=${catId}`);
                          }
                        } else {
                          setActiveCategory(category);
                        }
                      }}
                      className={`px-6 py-3 flex items-center justify-between cursor-pointer transition-all duration-300 group/item mx-2 rounded-xl ${activeCategory?.name === category.name
                        ? 'bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white shadow-md'
                        : 'text-gray-700 hover:bg-orange-50/60 hover:text-[#E47B25]'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {category.icon && (
                          <div className="w-6 h-6 relative shrink-0">
                            <Image src={category.icon} alt={category.name} fill className="object-contain" />
                          </div>
                        )}
                        <span className="text-[14px] font-medium">{category.name}</span>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`transition-transform group-hover/item:translate-x-1 ${activeCategory?.name === category.name ? 'text-white' : 'text-[#EE9C24]'
                          }`}
                      />
                    </div>
                  ))}
                </div>
                <div 
                  key={activeCategory?._id || activeCategory?.name}
                  className="flex-1 bg-white py-6 px-8 overflow-y-auto max-h-[500px] animate-in fade-in slide-in-from-left-3 duration-300 ease-out"
                >
                  <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                    {activeCategory?.name}
                  </h3>
                  <div className="grid grid-cols-1 gap-1">
                    {activeCategory?.subcategories?.map((sub: any) => {
                      const subName = typeof sub === 'string' ? sub : sub.title;
                      const subId = typeof sub === 'string' ? null : sub._id;
                      const catId = activeCategory._id || activeCategory.id;

                      return (
                        <div
                          key={subId || subName}
                          onClick={() => {
                            setIsDropdownOpen(false);
                            if (catId && subId) {
                              router.push(`/?category=${catId}&subCategory=${subId}`);
                            } else if (catId) {
                              router.push(`/?category=${catId}`);
                            }
                          }}
                          className="py-2 px-3 text-[14px] text-gray-600 hover:text-[#E47B25] hover:bg-orange-50/50 rounded-xl cursor-pointer transition-all duration-200 hover:translate-x-1.5 flex items-center gap-2 group/sub"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 scale-0 group-hover/sub:scale-100 transition-all duration-200 shrink-0" />
                          {subName}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 lg:gap-8 px-4 lg:px-8 h-full overflow-x-auto no-scrollbar whitespace-nowrap text-sm">
              <Link href="/" className="hover:text-orange-200 transition-colors">Home</Link>
              <Link href="/allproduct" className="hover:text-orange-200 transition-colors">Shop By</Link>
              <Link href="/bulk-inquiry" className="hover:text-orange-200 transition-colors hidden lg:inline">Bulk Inquiry</Link>
              <Link href="/special-offers" className="hover:text-orange-200 transition-colors">Special Offers</Link>
              <Link href="/special-combos" className="hover:text-orange-200 transition-colors">Special Combos</Link>
              <Link href="/atl-kits" className="hover:text-orange-200 transition-colors hidden xl:inline">ATL Kits</Link>
              <Link href="/blog" className="hover:text-orange-200 transition-colors">Blog</Link>
              <Link 
                href="/project" 
                className={`transition-all duration-300 px-3 py-1 rounded-full font-semibold ${
                  pathname === '/project' 
                    ? 'bg-white text-orange-600 shadow-md font-bold' 
                    : 'border border-white/30 text-white hover:bg-white/10 hover:border-white/60'
                }`}
              >
                Projects
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-6 pr-2 shrink-0">
            <div className="relative cursor-pointer hover:scale-110 transition-transform" onClick={() => setIsWishlistModalOpen(true)}>
              <Image src="/heart1.png" alt="wishlist" width={20} height={20} style={{ width: 'auto', height: 'auto' }} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                  {wishlistItems.length}
                </span>
              )}
            </div>
            <Link href="/cart" className="relative cursor-pointer hover:scale-110 transition-transform">
              <Image src="/shoppingcart.png" alt="cart" width={20} height={20} style={{ width: 'auto', height: 'auto' }} />
              {cartItems?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                  {cartItems.length}
                </span>
              )}
            </Link>
            <Link href={token ? "/profile" : "/login"}>
              <Image src="/account.png" alt="account" width={20} height={20} />
            </Link>
          </div>
        </div>
      </div>
      <MobileSidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
