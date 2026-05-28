"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import BlogCard from './BlogCard';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchBlogs } from '@/redux/slices/blogSlice';

import 'swiper/css';
import 'swiper/css/navigation';

const HeroSlider = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { blogs, loading } = useSelector((state: RootState) => state.blog);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch(fetchBlogs(''));
  }, [dispatch]);

  const featuredPosts = blogs.slice(0, 6);

  if (!mounted) return null;

  return (
    <section className="w-full bg-white overflow-hidden border-b border-gray-100">
      <div className="relative">

        {/* Section Header */}
        <div className="md:px-10 flex items-center justify-between mb-2">
          <div>
            <div className="relative inline-block">
              <h2 className="text-2xl md:text-[1.5rem] font-medium text-[#333333] pb-2">
                Featured Blogs
              </h2>
              <span
                className="absolute bottom-0 left-0 h-[3px] md:w-[14rem] rounded-full"
                style={{ background: 'linear-gradient(90deg, #EE9C24 0%, #B8420E 100%)' }}
              />
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#EE9C24] border-t-[#EE9C24] rounded-full animate-spin" />
          </div>
        )}

        {/* Swiper */}
        {!loading && featuredPosts.length > 0 && (
          <Swiper
            modules={[Navigation, Autoplay]}
            onInit={(swiper) => {
              // @ts-ignore
              swiper.params.navigation.prevEl = prevRef.current;
              // @ts-ignore
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640:  { slidesPerView: 1.4, spaceBetween: 20 },
              768:  { slidesPerView: 2,   spaceBetween: 24 },
              1024: { slidesPerView: 2.5, spaceBetween: 24 },
              1280: { slidesPerView: 3,   spaceBetween: 24 },
            }}
            loop={featuredPosts.length > 1}
            className="featured-blog-swiper"
          >
            {featuredPosts.map((post) => (
              <SwiperSlide key={post._id} className="!flex h-auto mt-4">
                <BlogCard post={post} variant="slider" />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Empty state */}
        {!loading && featuredPosts.length === 0 && (
          <div className="flex items-center justify-center py-20 text-gray-400 font-medium">
            No blogs available yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSlider;
