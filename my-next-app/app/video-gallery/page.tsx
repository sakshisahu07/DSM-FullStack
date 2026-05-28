"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Play, Clock, ArrowLeft, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchVideos, recordVideoView, Video } from '@/redux/slices/videoSlice';
import { fetchCategories } from '@/redux/slices/categorySlice';

const VideoGalleryPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { videos, loading } = useSelector((state: RootState) => state.video);
  const { categories } = useSelector((state: RootState) => state.category);

  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.append('page', '1');
    params.append('limit', '50'); // Fetch enough for the gallery
    if (activeCategoryId) params.append('categoryId', activeCategoryId);
    
    dispatch(fetchVideos(params.toString()));
  }, [dispatch, activeCategoryId]);

  const handlePlayVideo = (video: Video) => {
    setPlayingId(video._id);
    dispatch(recordVideoView(video._id));
  };

  const featuredVideos = videos.slice(0, 3);

  return (
    <main className="min-h-screen bg-white font-sans">
      
      {/* ───── MOBILE VIEW ───── */}
      <div className="lg:hidden">
         {/* Custom Header */}
         <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] px-4 py-4 flex items-center text-white sticky top-0 z-50">
            <button onClick={() => router.back()} className="mr-3">
              <ArrowLeft size={22} className="text-white" />
            </button>
            <span className="font-semibold text-[18px]">Video Gallery</span>
         </div>

         <div className="bg-[#FAF9F6] pb-24">
            {/* Scrollable Categories */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-6">
               <button
                  onClick={() => setActiveCategoryId("")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white whitespace-nowrap transition-all
                     ${activeCategoryId === "" ? 'border-[#EE9C24]' : 'border-gray-200'}`}
               >
                  <span className={`text-[11px] font-black ${activeCategoryId === "" ? 'text-[#333]' : 'text-gray-500'}`}>
                     All
                  </span>
               </button>
               {categories.map((cat) => (
                  <button
                     key={cat._id}
                     onClick={() => setActiveCategoryId(cat._id)}
                     className={`flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white whitespace-nowrap transition-all
                        ${activeCategoryId === cat._id ? 'border-[#EE9C24]' : 'border-gray-200'}`}
                  >
                     <span className={`text-[11px] font-black ${activeCategoryId === cat._id ? 'text-[#333]' : 'text-gray-500'}`}>
                        {cat.title}
                     </span>
                  </button>
               ))}
            </div>

            {/* Featured Videos Horizontal */}
            <div className="px-4 mb-8">
               <h2 className="text-[17px] font-black text-gray-800 mb-4 ml-1">Featured Videos</h2>
               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {featuredVideos.map((video) => (
                     <div key={video._id} className="min-w-[300px] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col p-3">
                        <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 bg-black">
                           {playingId === video._id ? (
                              <video src={video.video?.url} autoPlay controls className="w-full h-full" />
                           ) : (
                              <>
                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10" onClick={() => handlePlayVideo(video)}>
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                                       <Play size={20} className="text-white fill-white ml-1" />
                                    </div>
                                 </div>
                                 <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-sm z-20">
                                    <Clock size={10} className="text-[#EE9C24]" />
                                    <span className="text-[9px] font-black text-gray-800 uppercase">{Math.floor(video.duration / 60)} min</span>
                                 </div>
                              </>
                           )}
                        </div>

                        <div className="flex items-center justify-between mb-3 px-1">
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-gray-400 uppercase opacity-60">Views: {video.views}</span>
                           </div>
                        </div>

                        <h3 className="text-[13px] font-black text-[#333] leading-tight line-clamp-2 px-1 mb-4 h-9">
                           {video.title}
                        </h3>

                        <button 
                           onClick={() => handlePlayVideo(video)}
                           className="w-full py-3 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
                        >
                           Watch full video
                        </button>
                     </div>
                  ))}
               </div>
            </div>

            {/* All Videos Vertical List */}
            <div className="px-4 mt-4">
               <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[18px] font-black text-gray-800">All Vedios</h2>
                  <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center gap-2">
                     <span className="text-[11px] font-black text-gray-600">Newest First</span>
                     <ChevronDown size={14} className="text-gray-400" />
                  </div>
               </div>

               <div className="space-y-4">
                  {videos.map((video) => (
                     <div key={video._id} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex gap-4">
                        <div className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-black" onClick={() => handlePlayVideo(video)}>
                           {playingId === video._id ? (
                              <video src={video.video?.url} autoPlay controls className="w-full h-full object-cover" />
                           ) : (
                              <>
                                 <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                                       <Play size={10} className="text-[#EE9C24] fill-[#EE9C24] ml-0.5" />
                                    </div>
                                 </div>
                              </>
                           )}
                        </div>
                        <div className="flex flex-col justify-between flex-1 py-0.5" onClick={() => handlePlayVideo(video)}>
                           <h3 className="text-[11px] font-black text-[#333] leading-tight line-clamp-2">
                              {video.title}
                           </h3>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400">
                                 <Clock size={12} className="text-[#EE9C24]" />
                                 Duration : {Math.floor(video.duration / 60)} min
                              </div>
                              <div className="bg-[#EE9C24] rounded-full p-1 shadow-sm">
                                 <ChevronRight size={12} className="text-white" />
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* ───── DESKTOP VIEW ───── */}
      <div className="hidden lg:block">
         {/* 1. Breadcrumbs */}
         <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-6">
         <nav className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-gray-400">
            <Link href="/" className="hover:text-gray-600 transition-colors text-gray-400">Home</Link>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-[#EE9C24]">Video gallery</span>
         </nav>
         </div>

         {/* 2. Header */}
         <div className="text-center mb-12">
         <div className="inline-block relative">
            <h1 className="text-[1.6rem] font-medium text-gray-900  px-4 tracking-tight">Video gallery</h1>
            <div className="h-[2.5px] w-full bg-[#E47B25] scale-x-75 mx-auto"></div>
         </div>
         </div>

         {/* 3. Filters Section */}
         <div className=" px-6 md:px-12 mb-12">
         <div className="flex flex-col gap-4">
            {/* Category Tabs */}
            <div className="flex items-center justify-center gap-4">
               <button
                  onClick={() => setActiveCategoryId("")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300 bg-[#F8F8F8]
                     ${activeCategoryId === "" 
                     ? 'border-[#EE9C24] shadow-[0_2px_10px_rgba(238,156,36,0.15)]' 
                     : 'border-gray-100 hover:border-gray-200'}`}
               >
                  <span className={`text-[13.5px] font-medium ${activeCategoryId === "" ? 'text-[#333333]' : 'text-gray-600'}`}>
                     All
                  </span>
               </button>
               {categories.map((cat) => (
                  <button
                     key={cat._id}
                     onClick={() => setActiveCategoryId(cat._id)}
                     className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300 bg-[#F8F8F8]
                        ${activeCategoryId === cat._id 
                        ? 'border-[#EE9C24] shadow-[0_2px_10px_rgba(238,156,36,0.15)]' 
                        : 'border-gray-100 hover:border-gray-200'}`}
                  >
                     <span className={`text-[13.5px] font-medium ${activeCategoryId === cat._id ? 'text-[#333333]' : 'text-gray-600'}`}>
                        {cat.title}
                     </span>
                  </button>
               ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex justify-end">
               <div className="relative">
               <select className="appearance-none bg-white border border-gray-100 rounded-lg px-6 py-2.5 text-sm font-medium text-gray-600 focus:outline-none focus:border-gray-200 shadow-sm pr-12 hover:border-gray-300 cursor-pointer">
                  <option>Newest First</option>
                  <option>Oldest First</option>
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={16} />
               </div>
               </div>
            </div>
         </div>
         </div>

         {/* 4. Video Grid */}
         <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-16">
            {loading ? (
               <div className="text-center py-20 font-bold text-gray-400">Loading videos...</div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                  {videos.map((video) => (
                     <div key={video._id} className="bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden group h-full flex flex-col">
                        
                        {/* Share Bar */}
                        <div className="px-5 py-4 border-b border-gray-100 bg-white">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                 <span>Share link on :</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Image src="/fcbook.png" height={20} width={20} alt="fb" />
                                 <Image src="/instagram.png" height={20} width={20} alt="ig" />
                                 <Image src="/whatsapp.png" height={20} width={20} alt="wa" />
                              </div>
                           </div>
                        </div>

                        {/* Thumbnail Area */}
                        <div className="relative aspect-[16/9.8] mx-4 mt-4 rounded-xl overflow-hidden bg-black">
                           {playingId === video._id ? (
                              <video src={video.video?.url} autoPlay controls className="w-full h-full" />
                           ) : (
                              <>
                                 <div className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer" onClick={() => handlePlayVideo(video)}>
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-[1.1] transition-transform duration-300">
                                       <Play className="w-7 h-7 text-[#EE9C24] fill-[#EE9C24] ml-1" />
                                    </div>
                                 </div>
                                 <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xl z-20">
                                    <Clock size={13} className="text-gray-800" />
                                    <span className="text-[11px] font-bold text-gray-800 uppercase tracking-tighter">Duration : {Math.floor(video.duration / 60)} min</span>
                                 </div>
                                 <div className="absolute bottom-3 left-3 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-bold">
                                    Views: {video.views}
                                 </div>
                              </>
                           )}
                        </div>

                        {/* Text Area */}
                        <div className="p-6 pt-5 flex flex-col flex-grow">
                           <h3 className="text-[1.1rem] font-medium text-gray-800 leading-[1.6] mb-6 line-clamp-2 min-h-[3.5rem]">
                              {video.title}
                           </h3>

                           <button 
                              onClick={() => handlePlayVideo(video)}
                              className="w-full bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white py-2.5 rounded flex items-center justify-center gap-2.5 text-sm font-medium shadow-md hover:opacity-95 transition-all mt-auto tracking-wide"
                           >
                              watch full video
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
    </main>
  );
};

export default VideoGalleryPage;
