"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Share2 } from 'lucide-react';
import { Blog } from '@/redux/slices/blogSlice';

interface BlogCardProps {
  post: Blog;
  variant?: 'slider' | 'grid';
}

const SocialIcons = () => (
  <div className="flex items-center gap-2">
    <a href="#" aria-label="Facebook" className="hover:opacity-80 transition-opacity">
      <Image src="/fcbook.png" height={20} width={20} alt="" />
    </a>
    <a href="#" aria-label="Instagram" className="hover:opacity-80 transition-opacity">
      <Image src="/instagram.png" height={20} width={20} alt="" />
    </a>
    <a href="#" aria-label="Twitter/X" className="hover:opacity-70 transition-opacity">
      <Image src="/twtter.png" height={20} width={20} alt="" />
    </a>
    <a href="#" aria-label="LinkedIn" className="hover:opacity-80 transition-opacity">
      <Image src="/linked.png" height={20} width={20} alt="" />
    </a>
    <a href="#" aria-label="YouTube" className="hover:opacity-80 transition-opacity">
      <Image src="/utube.png" height={20} width={20} alt="" />
    </a>
  </div>
);

const BlogCard: React.FC<BlogCardProps> = ({ post, variant = 'grid' }) => {
  const formattedDate = new Date(post.publishDate || post.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const imageUrl = post.icon || post.banner || (post.images?.[0]) || '/hero2.png';

  return (
    <div
      className={`group bg-white rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 flex flex-col ${
        variant === 'slider' ? 'h-full' : ''
      }`}
    >
      {/* Social Share Bar */}
      <div className="px-4 py-2.5 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Share2 size={13} className="text-gray-400" />
            <span>Share link on :</span>
          </div>
          <SocialIcons />
        </div>
      </div>

      {/* Blog Image */}
      <div className="relative aspect-[16/10] rounded-xl">
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          className="object-cover p-4 rounded-xl transition-transform duration-500"
        />
      </div>

      {/* Card Content */}
      <div className="p-4 md:p-5 flex flex-col flex-grow">
        {/* Author & Date row */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>
            Published by : <span className="font-semibold text-gray-700">DSM Electro</span>
          </span>
          <span>
            Date : <span className="font-semibold text-gray-700">{formattedDate}</span>
          </span>
        </div>

        {/* Category Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 border border-gray-400 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors cursor-pointer">
            {post.category?.title || 'Category'}
          </span>
          <span className="px-2.5 py-0.5 border border-gray-400 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors cursor-pointer">
            {post.subCategory?.title || 'Subcategory'}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-medium text-[#333333] text-base leading-snug line-clamp-2 mb-2">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-[#333333] text-sm line-clamp-3 leading-relaxed mb-4 flex-grow">
          {post.description}
        </p>

        {/* Read Full Blog Link */}
        <Link
          href={`/blog/${post._id}`}
          className="inline-flex items-center justify-center gap-2 w-full py-1 px-4 rounded text-white text-sm font-medium tracking-wide transition-all duration-300 hover:opacity-90 active:scale-95 mt-auto"
          style={{ background: 'linear-gradient(135deg, #EE9C24 0%, #B8420E 100%)' }}
        >
          <Image src="/blogicon.png" height={20} width={20} alt="" />
          Read full Blog
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;
