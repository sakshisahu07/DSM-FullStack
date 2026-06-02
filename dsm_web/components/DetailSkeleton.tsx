import React from 'react';
import Skeleton from '@/components/shared/Skeleton';

const DetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Spacer */}
      <div className="md:hidden h-[60px]" />
      
      {/* Breadcrumbs Skeleton */}
      <div className="hidden md:block max-w-[1400px] mx-auto px-4 md:px-14 py-6">
        <div className="flex items-center gap-2">
          <Skeleton variant="text" className="w-16 h-4" />
          <div className="w-4 h-4 bg-gray-100 rounded" />
          <Skeleton variant="text" className="w-24 h-4" />
          <div className="w-4 h-4 bg-gray-100 rounded" />
          <Skeleton variant="text" className="w-32 h-4" />
        </div>
      </div>

      <div className="md:max-w-[1400px] md:mx-auto px-4 md:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-12">
          {/* Left Column: Image Gallery Skeleton */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col-reverse lg:flex-row w-full gap-4">
              {/* Thumbnails */}
              <div className="grid grid-cols-5 lg:flex lg:flex-col gap-2 md:gap-3 w-full lg:w-auto">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="aspect-square w-full lg:w-20 lg:h-20 rounded-xl" />
                ))}
              </div>
              {/* Main Image */}
              <Skeleton className="flex-1 aspect-square rounded-2xl" />
            </div>
          </div>

          {/* Right Column: Info Skeleton */}
          <div className="mt-8 lg:mt-0 space-y-6">
            <div className="space-y-4">
              <Skeleton variant="text" className="w-full h-8" />
              <Skeleton variant="text" className="w-3/4 h-8" />
              <div className="flex gap-4">
                <Skeleton variant="text" className="w-24 h-4" />
                <Skeleton variant="text" className="w-24 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton variant="text" className="w-32 h-6" />
              <div className="flex items-baseline gap-2">
                <Skeleton variant="text" className="w-24 h-10" />
                <Skeleton variant="text" className="w-16 h-6" />
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <Skeleton className="w-full h-12 rounded-xl" />
              <div className="flex gap-4">
                <Skeleton className="flex-1 h-14 rounded-xl" />
                <Skeleton className="flex-1 h-14 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailSkeleton;
