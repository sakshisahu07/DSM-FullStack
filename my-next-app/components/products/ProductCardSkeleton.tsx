import React from 'react';
import Skeleton from '@/components/shared/Skeleton';

const ProductCardSkeleton = () => {
  return (
    <div className="w-full h-full bg-white rounded-[20px] md:rounded-3xl p-0 relative flex flex-col border border-gray-100 overflow-hidden">
      {/* Product Image Area Skeleton */}
      <div className="relative w-full aspect-[4/3] bg-gray-50 p-2 md:p-6 flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>

      {/* Product Info Skeleton */}
      <div className="p-3 md:p-6 pt-1 md:pt-2 flex-1 flex flex-col space-y-2 md:space-y-4 border-t border-gray-50">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-16 rounded md:w-20" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>

        <div className="hidden md:block space-y-2">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
        </div>

        <div className="flex items-center justify-between pt-1 md:pt-2 mt-auto">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-2 w-8 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
          <Skeleton className="h-8 w-24 md:w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
