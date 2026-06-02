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
      <div className={`relative ${className} rounded-3xl overflow-hidden group border border-gray-100 shadow-sm bg-black transition-all hover:shadow-lg cursor-pointer`}>
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
    <section className="w-full bg-white py-8 px-4 md:px-14">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Stacked Banners */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Top Left Banner */}
          {renderBanner(banner1, "/img1.png", "Promotion 1", "aspect-[16/10]")}

          {/* Bottom Left Banner */}
          {renderBanner(banner2, "/img3.png", "Promotion 2", "aspect-[16/10]")}
        </div>

        {/* Right Column: Large Banner */}
        <div className="lg:col-span-2">
          {renderBanner(banner3, "/img2.png", "Promotion 3", "aspect-[16/9] md:aspect-auto md:h-full min-h-[250px] md:min-h-[400px]")}
        </div>

      </div>
    </section>
  );
};

export default PromotionGrid;
