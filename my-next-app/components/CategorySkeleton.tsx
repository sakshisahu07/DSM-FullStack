import React from 'react';
import Skeleton from '@/components/shared/Skeleton';

const CategorySkeleton = () => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton variant="circular" className="w-[50px] h-[50px] md:w-20 md:h-20" />
      <Skeleton variant="text" className="w-12 md:w-16 h-3" />
      <Skeleton variant="text" className="w-8 md:w-10 h-2" />
    </div>
  );
};

export default CategorySkeleton;
