"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BASE_URL } from '@/redux/slices/apiConfig';
import HeroSection from "@/components/HeroSection";
import HotProducts from "@/components/HotProducts";
import FlashSale from "@/components/FlashSale";
import SpecialOffers from "@/components/SpecialOffers";
import MobilePromoSection from "@/components/MobilePromoSection";
import MobileBottomPromoSection from "@/components/MobileBottomPromoSection";
import SpecialCombo from "@/components/SpecialCombo";
import FrequentlySaleProduct from "@/components/FrequentlySaleProduct";
import PromotionGrid from "@/components/PromotionGrid";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const subCategoryParam = searchParams.get('subCategory');

  const [homeData, setHomeData] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const cleanBaseUrl = BASE_URL;

    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        let url = `${cleanBaseUrl.endsWith('/') ? cleanBaseUrl : cleanBaseUrl + '/'}home`;
        
        const params = new URLSearchParams();
        if (categoryParam) params.set('category', categoryParam);
        if (subCategoryParam) params.set('subCategory', subCategoryParam);
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: any = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(url, { headers });
        const json = await res.json();
        if (json.success && isMounted) {
          setHomeData(json.data);
        }
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const fetchBanners = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: any = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const url = `${cleanBaseUrl.endsWith('/') ? cleanBaseUrl : cleanBaseUrl + '/'}banners/active`;
        const res = await fetch(url, { headers });
        const json = await res.json();
        if (json.success && isMounted) {
          const filteredBanners = json.data.slice(0, 3);
          setBanners(filteredBanners);
        }
      } catch (err) {
        console.error("Error fetching banners:", err);
      }
    };

    fetchHomeData();
    fetchBanners();
    return () => {
      isMounted = false;
    };
  }, [categoryParam, subCategoryParam]);

  // Map products/combos helpers
  const mapProduct = (p: any, type: string) => {
    if (!p) return null;
    return {
      id: p._id,
      variantId: p.variantId || p._id,
      name: p.name || p.title || 'Product',
      description: p.description || 'Latest top-quality product with special price.',
      price: p.price || p.mrp || 0,
      originalPrice: p.mrp || p.price || 0,
      rating: p.avgRating || 5,
      category: p.categoryName || 'Electronics',
      subcategory: p.subCategoryName || 'Gadgets',
      image: p.images?.[0] || p.icon || '/bluetooth.png',
      images: p.images || (p.icon ? [p.icon] : []),
      discount: p.discount ? `${p.discount}% Off` : undefined,
      timeLeft: type === 'flash'
        ? (p.flashSaleInfo?.remainingTimeFormatted || "02 : 15 Hours")
        : (type === 'hot' ? p.hotDealInfo?.remainingTimeFormatted : (type === 'special' ? p.specialOfferInfo?.remainingTimeFormatted : undefined)),
      flashSaleInfo: p.flashSaleInfo,
      hotDealInfo: p.hotDealInfo,
      specialOfferInfo: p.specialOfferInfo,
      slug: p.slug
    };
  };

  const mapCombo = (c: any) => {
    if (!c) return null;
    return {
      id: c._id,
      variantId: c._id,
      name: c.name || 'Special Combo',
      description: 'Mega Special Combo Offer with amazing discounts.',
      price: c.comboPrice || 0,
      originalPrice: c.totalMrp || 0,
      rating: 5,
      category: 'Combo',
      subcategory: 'Offers',
      image: c.images?.[0] || c.icon || '/speacialoffer.png',
      images: c.images || (c.icon ? [c.icon] : []),
      discount: c.discount ? `${c.discount}% Off` : undefined,
      isCombo: true,
      slug: c.slug
    };
  };

  const handleCategorySelect = (catId: string | null) => {
    if (catId) {
      router.push(`/?category=${catId}`);
    } else {
      router.push('/');
    }
  };

  const categories = homeData?.categories || [];
  const hotProducts = (homeData?.hotDeals || []).map((p: any) => mapProduct(p, 'hot')).filter(Boolean);
  const flashSales = (homeData?.flashSales || []).map((p: any) => mapProduct(p, 'flash')).filter(Boolean);
  const specialOffers = (homeData?.specialOffers || []).map((p: any) => mapProduct(p, 'special')).filter(Boolean);
  const combos = (homeData?.combos || []).map((c: any) => mapCombo(c)).filter(Boolean);
  const frequentlySales = (homeData?.products?.data || []).map((p: any) => mapProduct(p, 'freq')).filter(Boolean);

  return (
    <main className="min-h-screen bg-white">
      <HeroSection 
        categories={categories} 
        loading={isLoading} 
        selectedCategoryId={categoryParam} 
        onCategorySelect={handleCategorySelect} 
      />
      <HotProducts products={hotProducts} loading={isLoading} />
      <FlashSale products={flashSales} loading={isLoading} />
      <SpecialOffers products={specialOffers} loading={isLoading} />
      <MobilePromoSection />
      <FrequentlySaleProduct products={frequentlySales} loading={isLoading} />
      <MobileBottomPromoSection />
      <div className="hidden md:block">
        <PromotionGrid banners={banners} />
        <SpecialCombo combos={combos} loading={isLoading} />
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-gray-500 font-medium">Loading DSM Electro...</div>}>
      <HomeContent />
    </Suspense>
  );
}