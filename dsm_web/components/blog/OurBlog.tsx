"use client";

import React, { useState } from 'react';
import BlogCard from './BlogCard';
import { ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const OurBlog = () => {
  const [sortOrder, setSortOrder] = useState('newest');
  const { blogs } = useSelector((state: RootState) => state.blog);

  const sortedPosts = [...blogs].sort((a, b) => {
    const dateA = new Date(a.publishDate || a.createdAt).getTime();
    const dateB = new Date(b.publishDate || b.createdAt).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <section className="w-full py-4 bg-white">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 md:mb-4">
          <div>
            <div className="relative inline-block">
              <h2 className="text-2xl md:text-[1.5rem] font-medium text-[#333333] pb-2">
                Our Blogs
              </h2>
              <span
                className="absolute bottom-0 left-0 h-[3px] md:w-[14rem] rounded-full"
                style={{ background: 'linear-gradient(90deg, #EE9C24 0%, #B8420E 100%)' }}
              />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-700 cursor-pointer focus:outline-none focus:border-[#EE9C24] hover:border-gray-400 transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>

        {/* Blog Grid — 3 cols × 3 rows = 9 cards */}
        {sortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts.slice(0, 9).map((post) => (
              <BlogCard key={post._id} post={post} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20 text-gray-400 font-medium">
            No blogs available yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default OurBlog;
