import React from 'react';
import ProductCardSkeleton from './ProductCardSkeleton';
import Skeleton from '@/components/shared/Skeleton';

interface ProductSwiperSkeletonProps {
  title?: string;
}

const ProductSwiperSkeleton: React.FC<ProductSwiperSkeletonProps> = ({ title = "Loading Products..." }) => {
  return (
    <section className="w-full bg-white py-2 px-4 md:px-14">
      <div className="max-w-[1400px] mx-auto relative">
        {/* Mobile Header Skeleton */}
        <div className="flex md:hidden items-center justify-between mb-6">
          <div className="relative">
            <Skeleton variant="text" className="w-24 h-5" />
            <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-gray-200 rounded-full" />
          </div>
          <Skeleton variant="text" className="w-16 h-4" />
        </div>

        {/* Desktop Header Skeleton */}
        <div className="hidden md:flex items-center justify-center gap-6 mb-4">
          <div className="h-[2px] bg-gray-100 flex-1 max-w-[200px]" />
          <Skeleton variant="text" className="w-48 h-8 rounded" />
          <div className="h-[2px] bg-gray-100 flex-1 max-w-[200px]" />
        </div>

        {/* Swiper Content Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <div className="hidden md:block">
            <ProductCardSkeleton />
          </div>
          <div className="hidden lg:block">
            <ProductCardSkeleton />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSwiperSkeleton;
