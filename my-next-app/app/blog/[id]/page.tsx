"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Share2, ArrowLeft, Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchBlogById, fetchBlogs, clearCurrentBlog } from '@/redux/slices/blogSlice';
import BlogCard from '@/components/blog/BlogCard';

const BlogDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentBlog: post, blogs, loading, error } = useSelector((state: RootState) => state.blog);

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogById(id as string));
    }
    dispatch(fetchBlogs(''));
    return () => {
      dispatch(clearCurrentBlog());
    };
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 border-4 border-orange-100 border-t-[#EE9C24] rounded-full animate-spin" />
        <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Loading Blog...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-bold text-gray-500">Post not found</p>
      </div>
    );
  }

  const formattedDate = new Date(post.publishDate || post.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const bannerImage = post.banner || post.icon || post.images?.[0] || '/hero2.png';

  return (
    <main className="min-h-screen bg-white font-sans">
      
      {/* Mobile View */}
      <div className="lg:hidden">
         {/* Custom Header */}
         <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] px-4 py-4 flex items-center text-white sticky top-0 z-50">
           <button onClick={() => router.back()} className="mr-3">
             <ArrowLeft size={22} className="text-white" />
           </button>
           <span className="font-semibold text-[18px]">Blogs</span>
         </div>

          <div className="px-5 py-4">
            {/* Social Share Bar */}
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2 text-[#333] font-black text-[11px] opacity-60">
                 <Share2 size={13} className="text-[#EE9C24]" />
                 Share link on :
               </div>
               <div className="flex gap-2.5 scale-90 origin-right">
                 <Image src="/fcbook.png" alt="fb" width={24} height={24} />
                 <Image src="/instagram.png" alt="ig" width={24} height={24} />
                 <Image src="/twtter.png" alt="tw" width={24} height={24} />
                 <Image src="/linked.png" alt="li" width={24} height={24} />
                 <Image src="/utube.png" alt="yt" width={24} height={24} />
               </div>
            </div>

            {/* Blog Title */}
            <h1 className="text-[20px] font-black text-[#333] leading-[1.2] mb-6">
               {post.title}
            </h1>

            {/* Featured Image */}
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-md mb-8">
               <Image src={bannerImage} alt="blog" fill className="object-cover" />
            </div>

            {/* Meta Info Row */}
            <div className="flex items-center justify-between py-4 border-y border-gray-100 mb-6 font-black text-[11px] text-gray-400">
               <div className="flex items-center gap-1.5">
                  <span>Published by :</span>
                  <span className="text-gray-800">DSM ONLINE</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <span>Date :</span>
                  <span className="text-gray-800">{formattedDate}</span>
               </div>
            </div>

            {/* Category Badges */}
            <div className="flex items-center gap-3 mb-6">
               <span className="px-4 py-1.5 border border-gray-200 rounded-lg text-[#333] text-[11px] font-black">{post.category?.title || 'Category'}</span>
               <span className="px-4 py-1.5 border border-gray-200 rounded-lg text-[#333] text-[11px] font-black">{post.subCategory?.title || 'Subcategory'}</span>
            </div>

            {/* Individual Date Line with Icon */}
            <div className="flex items-center justify-between mb-8">
               <span className="text-[11px] font-black text-gray-400">Date : {formattedDate}</span>
               <div className="bg-[#EE9C24] p-1.5 rounded-full shadow-sm">
                  <Clock size={12} className="text-white" />
               </div>
            </div>

            {/* Content Body */}
            <div className="prose prose-sm max-w-full">
               {post.description && (
                  <p className="text-[14px] font-black text-gray-800 leading-relaxed mb-8 opacity-90">
                     {post.description}
                  </p>
               )}

               {/* Dynamic Sections from post object */}
               {post.keyFeatures && post.keyFeatures.length > 0 && (
                  <div className="mb-8">
                     <h2 className="text-[17px] font-black text-[#333] mb-5 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-[#EE9C24]">
                        Key Features
                     </h2>
                     <ul className="mt-6 space-y-5 list-none p-0">
                        {post.keyFeatures.map((kf: any) => (
                           <li key={kf._id} className="flex items-start gap-3">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#EE9C24] shrink-0" />
                              <span className="text-[13px] text-gray-700 leading-relaxed font-bold">
                                 <strong className="text-[#EE9C24] font-black">{kf.title}: </strong>
                                 {kf.description}
                              </span>
                           </li>
                        ))}
                     </ul>
                  </div>
               )}

               {post.details && (
                  <div className="mb-8">
                     <h2 className="text-[17px] font-black text-[#333] mb-5 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-[#EE9C24]">
                        Details
                     </h2>
                     <p className="text-[13px] font-bold text-gray-600 leading-relaxed opacity-80">
                        {post.details}
                     </p>
                  </div>
               )}

               {/* Components showcase - Optional: only show if related blogs/products exist or keep as static premium element */}
               <div className="bg-[#FAF9F6] rounded-3xl p-5 mb-10 border border-gray-100">
                  <h3 className="text-[15px] font-black text-gray-800 mb-4">Get Your Components from the Best</h3>
                  <div className="flex gap-4 items-center">
                     <div className="flex-1 space-y-3">
                        <p className="text-[11px] font-bold text-gray-500 leading-tight">
                           If you are looking for an electronics shop near me to source high-quality, reliable sensors and microcontrollers.
                        </p>
                        <p className="text-[12px] font-bold text-gray-600">
                           Get your components here: <Link href="/allproduct" className="text-[#EE9C24] underline font-black">DSM Online Shop</Link>
                        </p>
                     </div>
                     <div className="flex flex-col gap-2 shrink-0">
                        <div className="relative w-20 h-14 rounded-xl overflow-hidden shadow-sm border border-white">
                           <Image src="/btmodule.png" alt="c" fill className="object-cover" />
                        </div>
                        <div className="relative w-20 h-14 rounded-xl overflow-hidden shadow-sm border border-white">
                           <Image src="/arduino.png" alt="c" fill className="object-cover" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Conclusion Section */}
               {post.conclusion?.title && (
                  <div className="mb-14 pb-10">
                     <h2 className="text-[18px] font-black text-[#333] mb-5 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-[#EE9C24]">
                        {post.conclusion.title}
                     </h2>
                     <p className="text-[13px] font-bold text-gray-600 leading-relaxed opacity-80">
                        {post.conclusion.content}
                     </p>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block pb-24">
        {/* Breadcrumb */}
        <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-4">
          <nav className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              Home
            </Link>
            <span className="text-gray-300 text-sm font-normal items-center flex mt-[-2px]">{">"}</span>
            <Link href="/blog" className="text-[#EE9C24]">
              Blog
            </Link>
          </nav>
        </div>

        {/* Social Share Bar */}
        <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between border-y border-gray-100 mb-6">
          <div className="flex items-center gap-2 text-[#333333] font-medium text-[1.5rem]">
            <Share2 size={18} />
            Share link on :
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <a href="#"><Image src="/fcbook.png" alt="facebook" width={40} height={40} /></a>
            <a href="#"><Image src="/instagram.png" alt="instagram" width={40} height={40} /></a>
            <a href="#"><Image src="/twtter.png" alt="twitter" width={40} height={40} /></a>
            <a href="#"><Image src="/linked.png" alt="linkedin" width={40} height={40} /></a>
            <a href="#"><Image src="/utube.png" alt="youtube" width={40} height={40} /></a>
          </div>
        </div>

        <div className="max-w-[1300px] mx-auto px-4 md:px-6">
          <div className="relative w-full aspect-[21/9] rounded-[32px] overflow-hidden shadow-sm mb-12">
            <Image src={bannerImage} alt={post.title} fill className="object-cover" priority />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16">
            <article className="flex flex-col">
              <div className="flex items-center justify-between py-6 border-y border-gray-200 mb-8 text-[13px] font-bold text-gray-500 tracking-tight uppercase">
                <span>Published by : <span className="text-gray-800">DSM Electro</span></span>
                <span>Date : <span className="text-gray-800">{formattedDate}</span></span>
              </div>

              <div className="flex items-center gap-4 mb-10">
                <span className="px-8 py-2 border border-[#333333] rounded text-[#333333] text-[1rem] font-medium bg-white">{post.category?.title || 'Category'}</span>
                <span className="px-8 py-2 border border-[#333333] rounded text-[#333333] text-[1rem] font-medium bg-white">{post.subCategory?.title || 'Subcategory'}</span>
              </div>

              <h1 className="text-4xl md:text-[2.1rem] font-medium text-[#333333] leading-[1.1] mb-10">{post.title}</h1>

              {post.description && <p className="text-gray-600 leading-[1.9] text-[18px] mb-8">{post.description}</p>}

              {post.keyFeatures && post.keyFeatures.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-[1.6rem] font-medium text-[#222] mb-4 relative inline-block pb-[0.6rem] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[75px] after:h-[4px] after:bg-[#EE9C24] after:rounded">Key Features</h2>
                  <ul className="mt-6 space-y-4">
                    {post.keyFeatures.map((kf: any) => (
                      <li key={kf._id} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                        <span className="mt-2 w-2 h-2 rounded-full bg-[#EE9C24] shrink-0" />
                        <span><strong className="text-[#222] font-bold">{kf.title}: </strong>{kf.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {post.details && (
                <div className="mb-8">
                  <h2 className="text-[1.6rem] font-medium text-[#222] mb-4 relative inline-block pb-[0.6rem] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[75px] after:h-[4px] after:bg-[#EE9C24] after:rounded">Details</h2>
                  <p className="text-gray-600 leading-[1.9] text-[18px] mt-6">{post.details}</p>
                </div>
              )}

              {post.conclusion?.title && (
                <div className="mb-8">
                  <h2 className="text-[1.6rem] font-medium text-[#222] mb-4 relative inline-block pb-[0.6rem] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[75px] after:h-[4px] after:bg-[#EE9C24] after:rounded">{post.conclusion.title}</h2>
                  <p className="text-gray-600 leading-[1.9] text-[18px] mt-6">{post.conclusion.content}</p>
                </div>
              )}
            </article>

            <aside className="hidden lg:flex flex-col gap-8">
               {blogs.filter(b => b._id !== post._id).slice(0, 3).map((rp) => (
                  <div key={rp._id} className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-lg group cursor-pointer">
                    <Image src={rp.icon || rp.banner || rp.images?.[0] || '/hero2.png'} alt={rp.title} fill className="object-cover transition-transform group-hover:scale-110" />
                  </div>
               ))}
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BlogDetailPage;
