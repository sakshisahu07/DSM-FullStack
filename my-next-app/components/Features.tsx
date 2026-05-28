"use client";

import React from 'react';
import Image from 'next/image';


const features = [
  {
    id: 1,
    title: "Genuine Components",
    subtitle: "100% Original Products",
    image: "/feature1.png",
  },
  {
    id: 2,
    title: "Bulk Order Support",
    subtitle: "Special Pricing for Quantity",
    image: "/feature2.png",
  },
  {
    id: 3,
    title: "Technical Assistance",
    subtitle: "Expert Help Available",
    image: "/feature3.png",
  },
  {
    id: 4,
    title: "Secure Payments",
    subtitle: "Safe & Encrypted Checkout",
    image: "/feature4.png",
  }
];

const Features = () => {
  return (
    <section className="w-full bg-white py-8 md:py-12 px-4 md:px-14 ">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-4 md:gap-8 mb-16">
          <div className="h-[2px] bg-[#E47B25] flex-1 max-w-[60px] md:max-w-[300px]" />
          <h2 className="text-xl md:text-2xl font-medium text-[#000000] whitespace-nowrap">Why DSM Electro</h2>
          <div className="h-[2px] bg-[#E47B25] flex-1 max-w-[60px] md:max-w-[300px]" />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="relative bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col items-center pb-4 text-center transition-all hover:-translate-y-1 hover:shadow-xl group"
            >
              {/* Top Gradient Bar */}
              <div className="w-full h-10 bg-gradient-to-r from-[#E47B25] to-[#B3520A]" />

              {/* Icon Circle */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-16  rounded-full flex items-center justify-center shadow-md z-10 ">
                <div className="">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="mt-10 px-4 space-y-1">
                <h3 className="text-[#E47B25] font-medium text-lg md:text-xl ">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-[10px] md:text-xs">
                  {feature.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
