"use client";

import React, { useEffect } from 'react';
import HeroSlider from '@/components/blog/HeroSlider';
import OurBlog from '@/components/blog/OurBlog';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Search, Clock, ChevronDown, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchBlogs } from '@/redux/slices/blogSlice';

const BlogPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { blogs, loading } = useSelector((state: RootState) => state.blog);

  useEffect(() => {
    dispatch(fetchBlogs(''));
  }, [dispatch]);

  const featuredBlogs = blogs.slice(0, 3);

  return (
    <main className="min-h-screen bg-white">
      
      {/* Mobile View */}
      <div className="lg:hidden">
         {/* Custom Header */}
         <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] px-4 py-4 flex items-center text-white sticky top-0 z-50">
           <button onClick={() => router.back()} className="mr-3">
             <ArrowLeft size={22} className="text-white" />
           </button>
           <span className="font-semibold text-[18px]">Blogs</span>
         </div>

         <div className="bg-[#FAF9F6] pb-24">
            {/* Featured Blogs Section */}
            <div className="px-4 py-6">
               <h2 className="text-[18px] font-black text-gray-800 mb-4">Featured Blogs</h2>
               
               {loading && blogs.length === 0 ? (
                  <div className="flex items-center justify-center py-10">
                     <div className="w-8 h-8 border-4 border-orange-100 border-t-[#EE9C24] rounded-full animate-spin" />
                  </div>
               ) : (
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                     {featuredBlogs.map((blog) => {
                        const imageUrl = blog.banner || blog.icon || (blog.images && blog.images[0]) || "/hero2.png";
                        const formattedDate = new Date(blog.publishDate || blog.createdAt).toLocaleDateString('en-IN', {
                           day: '2-digit',
                           month: 'short',
                           year: 'numeric',
                        });

                        return (
                           <div key={blog._id} className="min-w-[300px] w-[300px] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                              {/* Social Share Icons */}
                              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                                 <span className="text-[11px] font-black text-gray-400 flex items-center gap-2">
                                    <Share2 size={13} className="text-[#EE9C24]" />
                                    <span className="text-[#333] opacity-60">Share Link on :</span>
                                 </span>
                                 <div className="flex gap-2.5 scale-[0.85] origin-right">
                                    <Image src="/fcbook.png" alt="fb" width={22} height={22} />
                                    <Image src="/instagram.png" alt="ig" width={22} height={22} />
                                    <Image src="/twtter.png" alt="tw" width={22} height={22} />
                                    <Image src="/linked.png" alt="li" width={22} height={22} />
                                    <Image src="/utube.png" alt="yt" width={22} height={22} />
                                 </div>
                              </div>
                              
                              <div className="p-3">
                                 <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 shadow-sm">
                                    <Image src={imageUrl} alt="blog" fill className="object-cover" />
                                 </div>
                                 
                                 <div className="flex items-center justify-between mb-3 px-1">
                                    <div className="flex flex-col">
                                       <span className="text-[10px] font-black text-gray-400 mb-0.5">Published by : <span className="text-gray-800">DSM ONLINE</span></span>
                                       <span className="text-[11px] font-black text-gray-800 flex items-center gap-1.5">
                                          Date : {formattedDate}
                                       </span>
                                    </div>
                                 </div>

                                 <div className="flex gap-2 mb-4">
                                    <span className="px-3 py-1 border border-gray-300 rounded-md text-[10px] font-black text-gray-600">{blog.category?.title || 'Electronics'}</span>
                                    <span className="px-3 py-1 border border-gray-300 rounded-md text-[10px] font-black text-gray-600">{blog.subCategory?.title || 'Guide'}</span>
                                 </div>

                                 <h3 className="text-[14px] font-black text-[#333] leading-tight line-clamp-2 mb-4 h-9 px-1">
                                    {blog.title}
                                 </h3>

                                 <Link href={`/blog/${blog._id}`} className="w-full py-2.5 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white font-black text-xs rounded-lg active:scale-[0.98] transition-all flex items-center justify-center">
                                    Read full Blog
                                 </Link>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>

            {/* All Blogs Section */}
            <div className="px-4 py-4">
               <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[18px] font-black text-gray-800">All Blogs</h2>
                  <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center gap-2">
                     <span className="text-[11px] font-black text-gray-600">Newest First</span>
                     <ChevronDown size={14} className="text-gray-400" />
                  </div>
               </div>

               {/* Search Bar Container */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-6">
                  <div className="flex items-center gap-2">
                     <div className="flex-1 bg-[#F9F9F9] rounded-lg border border-gray-100 px-3 py-2.5 flex items-center justify-between">
                        <input 
                           type="text" 
                           placeholder="Search categories here" 
                           className="bg-transparent outline-none text-xs text-gray-600 font-bold w-full placeholder:text-gray-300"
                        />
                        <button className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white p-1.5 rounded-md">
                           <Search size={14} />
                        </button>
                     </div>
                     <button className="text-[11px] font-black text-gray-400 px-1">Cancel</button>
                  </div>
               </div>

               {/* All Blogs List */}
               <div className="space-y-4">
                  {blogs.map((blog) => {
                     const imageUrl = blog.icon || blog.banner || (blog.images && blog.images[0]) || "/hero2.png";
                     return (
                        <Link key={blog._id} href={`/blog/${blog._id}`} className="block bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                           <div className="flex gap-4">
                              <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                 <Image src={imageUrl} alt="blog" fill className="object-cover" />
                              </div>
                              <div className="flex flex-col flex-1 py-0.5 justify-between">
                                 <h3 className="text-[11px] font-black text-gray-800 leading-tight line-clamp-2">
                                    {blog.title}
                                 </h3>
                                 <div className="flex flex-wrap gap-1.5 my-1.5">
                                    <span className="px-2 py-0.5 border border-gray-200 rounded text-[8px] font-black text-gray-400">{blog.category?.title}</span>
                                    <span className="px-2 py-0.5 border border-gray-200 rounded text-[8px] font-black text-gray-400">{blog.subCategory?.title}</span>
                                 </div>
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400">
                                       <Clock size={12} className="text-[#EE9C24]" />
                                       Duration : 41 min
                                    </div>
                                    <div className="bg-[#EE9C24] rounded-full p-1 shadow-sm">
                                       <ChevronDown size={12} className="text-white -rotate-90" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </Link>
                     );
                  })}
               </div>
            </div>
         </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        {/* Breadcrumb */}
        <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-4">
          <nav className="flex items-center gap-1 text-xs text-gray-400 font-medium tracking-wide uppercase">
            <Link href="/" className="hover:text-gray-600 transition-colors">
              Home
            </Link>
            <span className="flex items-center font-bold text-gray-300 mx-1">{'>'}</span>
            <span
              className="font-semibold"
              style={{ color: '#EE9C24' }}
            >
              Blog
            </span>
          </nav>
        </div>

        {/* Featured Blogs Slider */}
        <HeroSlider />

        {/* Our Blogs Grid */}
        <OurBlog />
      </div>
    </main>
  );
};

export default BlogPage;
