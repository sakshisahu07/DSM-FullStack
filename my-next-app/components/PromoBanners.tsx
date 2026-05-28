"use client";

import React from 'react';
import Image from 'next/image';

const banners = [
  {
    id: 1,
    image: "/motor1.png",
    alt: "Servo Motors - Precision Motion Control"
  },
  {
    id: 2,
    image: "/motor2.png",
    alt: "High-Speed Drone Performance"
  },
  {
    id: 3,
    image: "/motor3.png",
    alt: "Smart Sensors for Smart Projects"
  }
];

const PromoBanners = () => {
  return (
    <section className="w-full bg-white py-6 md:py-8 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {banners.map((banner) => (
          <div 
            key={banner.id} 
            className="relative aspect-[16/10] md:aspect-[4/3] lg:aspect-[16/10] rounded-2xl overflow-hidden group cursor-pointer border border-gray-100 shadow-sm"
          >
            <Image
              src={banner.image}
              alt={banner.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
            />
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PromoBanners;
