"use client";

import React from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

interface Banner {
  _id: string;
  image: string;
  title: string;
  redirectUrl?: string;
}

interface PromotionGridProps {
  banners?: Banner[];
}

const PromotionGrid = ({ banners = [] }: PromotionGridProps) => {
  // Get banner data with fallbacks
  const banner1 = banners[0];
  const banner2 = banners[1];
  const banner3 = banners[2];

  const renderBanner = (banner: Banner | undefined, defaultSrc: string, alt: string, className: string = "") => {
    const content = (
      <div className={`relative ${className} rounded-xl overflow-hidden group border border-gray-100 shadow-sm bg-black transition-all hover:shadow-lg cursor-pointer`}>
        <Image
          src={banner?.image || defaultSrc}
          alt={banner?.title || alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
    );

    if (banner?.redirectUrl) {
      return (
        <a href={banner.redirectUrl} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      );
    }

    return content;
  };

  return (
    <section className="w-full bg-white py-8 px-4 md:px-4">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* 3 Column Equal Grid */}
        <div className="lg:col-span-1">
          {renderBanner(banner1, "/img1.png", "Promotion 1", "h-[250px] md:h-[300px] lg:h-[350px] w-full")}
        </div>
        <div className="lg:col-span-1">
          {renderBanner(banner2, "/img3.png", "Promotion 2", "h-[250px] md:h-[300px] lg:h-[350px] w-full")}
        </div>
        <div className="lg:col-span-1">
          {renderBanner(banner3, "/img2.png", "Promotion 3", "h-[250px] md:h-[300px] lg:h-[350px] w-full")}
        </div>

      </div>
    </section>
  );
};

export default PromotionGrid;