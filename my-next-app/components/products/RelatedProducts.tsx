"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchRelatedProducts, fetchProducts } from "@/redux/slices/productSlice";
import ProductCard from "./ProductCard";
import { usePathname } from "next/navigation";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

interface RelatedProductsProps {
    categoryId?: string;
    subCategoryId?: string;
    limit?: number;
}

export default function RelatedProducts({ categoryId: initialCategoryId, subCategoryId: initialSubCategoryId, limit = 10 }: RelatedProductsProps) {
    const dispatch = useDispatch<AppDispatch>();
    const pathname = usePathname();
    const prevRef = useRef<HTMLDivElement>(null);
    const nextRef = useRef<HTMLDivElement>(null);
    const { relatedProducts, products, currentProduct, loading } = useSelector((state: RootState) => state.product);

    // Determine IDs based on props or current context
    // Support both wrapped (currentProduct.product) and unwrapped product objects
    const p = currentProduct?.product || currentProduct;
    const effectiveCategoryId = initialCategoryId || p?.categoryId?._id || p?.categoryId;
    const effectiveSubCategoryId = initialSubCategoryId || p?.subCategoryId?._id || p?.subCategoryId;

    // Determine which products to display
    // If we have category context, use relatedProducts, otherwise use general products as fallback
    const hasContext = !!(effectiveCategoryId || effectiveSubCategoryId);
    const displayProducts = hasContext ? relatedProducts : products;

    useEffect(() => {
        // If we have specific category/subcategory IDs, fetch related products
        if (effectiveCategoryId || effectiveSubCategoryId) {
            dispatch(fetchRelatedProducts({ 
                categoryId: effectiveCategoryId, 
                subCategoryId: effectiveSubCategoryId, 
                limit: 10 
            }));
        } else {
            // Fallback for pages without specific context (like home or generic listings)
            // Fetch first few products to show something instead of an empty section
            dispatch(fetchProducts('limit=10'));
        }
    }, [dispatch, effectiveCategoryId, effectiveSubCategoryId]);

    if (loading && relatedProducts.length === 0) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E47B25]"></div>
            </div>
        );
    }

    if (displayProducts.length === 0) {
        return null;
    }

    return (
        <section className="px-4 md:px-14 py-8 md:py-12 bg-white">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex items-center justify-between mb-6 md:mb-10">
                    <div className="relative">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {hasContext ? 'Related Products' : 'Featured Products'}
                        </h2>
                        <div className="absolute -bottom-2 left-0 w-24 h-[3px] bg-[#E47B25] rounded-full" />
                    </div>
                </div>

                <div className="relative px-1">
                    {/* Navigation Arrows */}
                    <div
                        ref={prevRef}
                        className="absolute top-1/2 -left-4 md:-left-6 -translate-y-1/2 z-20 bg-[#E47B25] rounded-full text-white shadow-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
                    >
                        <ChevronLeft size={24} />
                    </div>
                    <div
                        ref={nextRef}
                        className="absolute top-1/2 -right-4 md:-right-6 -translate-y-1/2 z-20 bg-[#E47B25] rounded-full text-white shadow-lg cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
                    >
                        <ChevronRight size={24} />
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
                        className="!pb-6"
                    >
                        {displayProducts.slice(0, 10).map((product) => (
                            <SwiperSlide key={product._id}>
                                <ProductCard product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}