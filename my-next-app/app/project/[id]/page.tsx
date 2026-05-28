"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Eye, ThumbsUp, Download, Star, Play, ArrowLeft, Share2, ChevronRight, Check } from "lucide-react";
import ProjectCard from "@/components/project/ProjectCard";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchProjectById, clearCurrentProject, fetchProjectRatings } from "@/redux/slices/projectSlice";

const relatedProjects = Array.from({ length: 4 }, (_, i) => ({
  id: i + 10,
  title: "Arduino based food freshness detection project",
  image: "/project.png",
  views: 216,
  likes: 216,
  downloads: 216,
  rating: 4.8,
  ratingCount: 216,
  finalPrice: 447,
  mrp: 447,
}));

const socialIcons = [
  { src: "/fcbook.png", alt: "Facebook", color: "#1877F2" },
  { src: "/twitter.png", alt: "Twitter", color: "#1DA1F2" },
  { src: "/instagram.png", alt: "Instagram", color: "#E4405F" },
  { src: "/linkdin.png", alt: "LinkedIn", color: "#0A66C2" },
  { src: "/whatsapp.png", alt: "WhatsApp", color: "#25D366" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : i < rating
              ? "fill-yellow-200 text-yellow-400"
              : "fill-gray-200 text-gray-300"
          }
        />
      ))}
    </div>
  );
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { currentProject, loading, ratings, starBreakdown, ratingsSummary, ratingsLoading } = useSelector((state: RootState) => state.project);
  const [activeTab, setActiveTab] = useState<"description" | "source" | "reviews">(
    "description"
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id as string));
      dispatch(fetchProjectRatings(id as string));
    }
    return () => {
      dispatch(clearCurrentProject());
    };
  }, [dispatch, id]);

  if (loading || !currentProject) {
    return <main className="bg-white min-h-screen py-20 text-center"><p className="text-gray-500">Loading project details...</p></main>;
  }

  const renderMobileStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} className={s <= rating ? "fill-[#EE9C24] text-[#EE9C24]" : "text-gray-200 fill-gray-200"} />
      ))}
    </div>
  );

  return (
    <main className="bg-white min-h-screen font-sans">
      
      {/* ───── MOBILE VIEW ───── */}
      <div className="lg:hidden">
        {/* Custom Header */}
        <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] px-4 py-4 flex items-center justify-between text-white sticky top-0 z-50">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-3">
              <ArrowLeft size={22} className="text-white" />
            </button>
            <span className="font-semibold text-[18px]">Projects</span>
          </div>
          <button className="p-2">
            <Share2 size={20} className="text-white" />
          </button>
        </div>

        <div className="bg-[#FAF9F6] pb-24">
          <div className="bg-white px-5 pt-6 pb-4 mb-4">
             <h1 className="text-[18px] font-black text-[#333] leading-tight mb-3">
                {currentProject.title}
             </h1>

             <div className="flex items-center gap-2 mb-4">
                {renderMobileStars(currentProject.rating || 5)}
                <span className="text-[11px] font-bold text-gray-400">({currentProject.rating || '5.0'}) {currentProject.totalRatings || 0} ratings</span>
             </div>

             <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Image src="/stu1.png" alt="s" width={14} height={14} className="opacity-80" />
                   </div>
                   <span className="text-[11px] font-bold text-gray-600">1,200+ students built this project</span>
                </div>
             </div>

             <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg mb-6 bg-gray-50">
                <Image
                  src={currentProject.banner || currentProject.icon || currentProject.images?.[0] || "/provideo.png"}
                  alt={currentProject.title}
                  fill
                  className="object-cover"
                />
                <button className="absolute inset-0 flex items-center justify-center">
                   <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                      <Play size={24} className="text-white fill-white ml-1" />
                   </div>
                </button>
             </div>

             <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3">
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Share Link On:</span>
                <div className="flex items-center gap-2">
                  {socialIcons.map((s) => (
                    <button key={s.alt} className="w-8 h-8 rounded-full shadow-sm active:scale-90 transition-transform">
                       <Image src={s.src} alt={s.alt} width={32} height={32} className="object-contain" />
                    </button>
                  ))}
                </div>
             </div>
          </div>

          {/* Pricing & CTA Sticky-ready */}
          <div className="px-5 mb-6">
             <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 flex items-center justify-between">
                <div>
                   <span className="text-[10px] font-black text-gray-400 uppercase opacity-60">MRP Price</span>
                   <div className="flex items-center gap-2">
                      <span className="text-[22px] font-black text-[#333]">₹{currentProject.finalPrice}</span>
                      <span className="text-[14px] text-gray-300 line-through font-bold">₹{currentProject.mrp}</span>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button className="p-3 bg-[#FAF9F6] rounded-2xl border border-gray-100 text-[#EE9C24] active:scale-95">
                      <ThumbsUp size={18} />
                   </button>
                   <button className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white px-6 py-4 rounded-2xl text-[12px] font-black shadow-lg">Order Project Kit</button>
                </div>
             </div>
          </div>

          {/* Optimized Tabs */}
          <div className="bg-white mb-4 overflow-hidden rounded-t-[32px]">
             <div className="flex border-b border-gray-50">
                {["description", "source", "reviews"].map((t) => (
                   <button 
                      key={t}
                      onClick={() => setActiveTab(t as any)}
                      className={`flex-1 py-4 text-[11px] font-black uppercase tracking-wider relative transition-colors duration-300
                         ${activeTab === t ? 'text-[#EE9C24]' : 'text-gray-400'}`}
                   >
                      {t === "source" ? "Source Code" : t}
                      {activeTab === t && <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#EE9C24] rounded-full" />}
                   </button>
                ))}
             </div>

             <div className="p-5">
                {activeTab === "description" && (
                   <div className="space-y-6">
                      <p className="text-[13px] font-bold text-gray-600 leading-relaxed opacity-90">
                         {currentProject.description}
                      </p>
                      
                      <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-gray-100">
                         <h3 className="text-[14px] font-black text-gray-800 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-[#EE9C24] rounded-full" />
                            Specifications
                         </h3>
                         <div className="space-y-3">
                            {currentProject.specifications?.map((spec: any) => (
                               <div key={spec._id} className="flex justify-between items-center text-[11px]">
                                  <span className="font-black text-gray-400 opacity-60 uppercase">{spec.key}</span>
                                  <span className="font-bold text-[#333] text-right ml-4">{spec.detail}</span>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h3 className="text-[14px] font-black text-gray-800 flex items-center gap-2 uppercase">
                            <div className="w-1.5 h-4 bg-[#EE9C24] rounded-full" />
                            Key Features
                         </h3>
                         <div className="grid gap-2">
                            {currentProject.keyFeatures?.map((f: string, i: number) => (
                               <div key={i} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-gray-50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                  <div className="mt-0.5"><Check size={12} className="text-[#EE9C24]" /></div>
                                  <span className="text-[11px] font-bold text-gray-600 leading-snug">{f}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                )}

                {activeTab === "source" && (
                   <div className="py-10 flex flex-col items-center justify-center text-center px-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                         <Download size={24} className="text-[#EE9C24]" />
                      </div>
                      <h4 className="text-[14px] font-black text-gray-800 mb-2">Source Code Locked</h4>
                      <p className="text-[11px] font-bold text-gray-400">Complete the purchase to unlock the step-by-step code and circuit diagrams.</p>
                      <button className="mt-6 bg-[#EE9C24] text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-md">Get Access Now</button>
                   </div>
                )}

                {activeTab === "reviews" && (
                   <div className="space-y-6">
                      <div className="bg-orange-50/50 rounded-2xl p-5 flex items-center justify-between border border-orange-100">
                         <div>
                            <span className="text-[24px] font-black text-gray-800">{ratingsSummary?.averageRating?.toFixed(1) || "5.0"}</span>
                            <span className="text-[14px] text-gray-400 font-bold ml-1">/ 5</span>
                            <div className="mt-1">{renderMobileStars(ratingsSummary?.averageRating || 5)}</div>
                         </div>
                         <div className="text-right">
                            <span className="text-[11px] font-black text-gray-400 block uppercase">Total Reviews</span>
                            <span className="text-[16px] font-black text-gray-800">{ratingsSummary?.totalRatings || 0}</span>
                         </div>
                      </div>

                      <div className="space-y-4">
                         {ratings?.map((r: any) => (
                            <div key={r._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                               <div className="absolute top-0 left-0 w-1 h-full bg-[#EE9C24] opacity-20" />
                               <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                     <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[12px] font-black text-[#EE9C24]">
                                        {r.user?.email?.[0]?.toUpperCase() || 'U'}
                                     </div>
                                     <div>
                                        <span className="text-[11px] font-black text-gray-800 block truncate w-32">{r.user?.email?.split('@')[0]}</span>
                                        <span className="text-[8px] font-bold text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                                     </div>
                                  </div>
                                  {renderMobileStars(r.rating)}
                               </div>
                               <p className="text-[11px] font-bold text-gray-500 leading-relaxed italic pr-2">"{r.review}"</p>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
             </div>
          </div>

          {/* Related Projects */}
          <div className="px-5 mt-10">
             <h2 className="text-[18px] font-black text-gray-800 mb-4 px-1">Related Projects</h2>
             <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-1">
                {relatedProjects.map((pj) => (
                  <div key={pj.id} className="min-w-[240px] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-50 p-3 flex flex-col">
                     <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 bg-gray-100">
                        <Image src={pj.image} alt="p" fill className="object-cover" />
                     </div>
                     <h3 className="text-[12px] font-black text-[#333] leading-tight line-clamp-2 px-1 mb-2 h-8">{pj.title}</h3>
                     <div className="flex items-center justify-between px-1">
                        <div className="flex flex-col">
                           <span className="text-[8px] font-black text-gray-400 opacity-60 uppercase tracking-wide">Price</span>
                           <div className="flex items-center gap-1.5">
                              <span className="text-[#333] font-black text-[12px]">₹{pj.finalPrice}</span>
                              <span className="text-gray-400 line-through text-[10px]">₹{pj.mrp}</span>
                           </div>
                        </div>
                        <button className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white px-4 py-2 rounded-xl text-[9px] font-black shadow-md">View</button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>


      {/* ───── DESKTOP VIEW ───── */}
      <div className="hidden lg:block">
        <div className="px-4 md:px-10 lg:px-20 py-6">
          {/* Breadcrumb */}
          <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1 uppercase tracking-wide">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <span>&gt;</span>
            <Link href="/project" className="hover:text-gray-600">Project Page</Link>
            <span>&gt;</span>
            <span className="font-semibold" style={{background: 'linear-gradient(to right, #EE9C24, #B8420E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Project Detail Page</span>
          </nav>

          {/* Title + Stats */}
          <h1 className="text-heading text-[#000000] text-2xl md:text-[1.5rem] mb-2">
            {currentProject.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <span>{currentProject.rating}/5 student ratings</span>
              <StarRating rating={currentProject.rating} />
            </div>
            <span className="flex items-center gap-1"><Eye size={14} /> {currentProject.totalViews}</span>
            <span className="flex items-center gap-1"><ThumbsUp size={14} /> {currentProject.totalRatings}</span>
            <span className="flex items-center gap-1"><Download size={14} /> {currentProject.totalDownloads}</span>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            {/* Left – Video + Share */}
            <div className="lg:w-[420px] shrink-0">
              {/* Video Thumbnail */}
              <div className="relative rounded-2xl overflow-hidden mb-4 cursor-pointer group">
                <Image
                  src={currentProject.banner || currentProject.icon || currentProject.images?.[0] || "/provideo.png"}
                  alt={currentProject.title}
                  width={620}
                  height={270}
                  className="w-full object-cover"
                />
              </div>

              {/* Share */}
              <div className="text-center">
                <p className="text-sm text-gray-600 font-medium mb-3">Share Link On:</p>
                <div className="flex items-center justify-center gap-3">
                  {socialIcons.map((s) => (
                    <button
                      key={s.alt}
                      className="w-10 h-10 rounded-full overflow-hidden hover:scale-110 transition-transform shadow-sm"
                    >
                      <Image src={s.src} alt={s.alt} width={40} height={40} className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right – Details */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>
                    <Image src="/stu1.png" alt="Students" width={20} height={20} className="object-contain" />
                  </span>
                  <span className=" text-[#666666] text-[1.1rem]">1,200+ students built this project</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>
                    <Image src="/stu2.png" alt="Level" width={20} height={20} className="object-contain" />
                  </span>
                  <span className=" text-[1.1rem] text-[#666666]">Beginner to Intermediate Level</span>
                </div>
              </div>

              <p className="text-[#333333] text-[1rem] leading-relaxed mb-4">
                {currentProject.description}
              </p>

              {currentProject.detailPoints && currentProject.detailPoints.length > 0 && (
                <ul className="list-disc list-inside text-[1rem] text-[#333333] space-y-1 mb-6">
                  {currentProject.detailPoints.map((dp: any) => (
                    <li key={dp._id}>{dp.point}</li>
                  ))}
                </ul>
              )}

              <div className="mb-5">
                <p className="text-[1rem] text-[#191919] mb-0.5">MRP Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-heading text-[#333333] text-[2rem]">₹{currentProject.finalPrice}</span>
                  <span className="text-gray-400 line-through text-sm">₹{currentProject.mrp}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="bg-primary-gradient text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-md">
                  Order Project Kit
                </button>
                <button className="bg-primary-gradient text-white p-3 rounded-xl hover:opacity-90 transition-opacity shadow-md">
                  <ThumbsUp size={18} />
                </button>
                <button className="bg-primary-gradient text-white p-3 rounded-xl hover:opacity-90 transition-opacity shadow-md">
                  <Download size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8 flex justify-center">
            <div className="flex gap-8">
              {(["description", "source", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-[1.5rem] font-semibold capitalize transition-colors relative ${
                    activeTab === tab ? "" : "text-heading"
                  }`}
                  style={activeTab === tab ? {background: 'linear-gradient(to right, #EE9C24, #B8420E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'} : {}}
                >
                  {tab === "description" ? "Project Description" : tab === "source" ? "Source Code" : "Reviews"}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-gradient rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "description" && (
            <div className="px-6 md:px-20">
              <p className="text-[#333333] text-[1.2rem] leading-relaxed mb-8 w-full">
                {currentProject.details}
              </p>
              <div className="flex flex-col lg:flex-row gap-8 mb-10">
                <div className="lg:w-[45%]">
                  <div className="bg-gray-100 rounded-2xl overflow-hidden p-4">
                    <Image
                      src={currentProject.images?.[0] || currentProject.icon || "/prodetail.png"}
                      alt="Project Circuit"
                      width={500}
                      height={320}
                      className="w-full object-contain"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{background: 'linear-gradient(to right, rgba(238, 156, 36, 0.1), rgba(184, 66, 14, 0.1))'}}>
                          <th className="text-left px-4 py-3 font-semibold text-heading border-b border-gray-200">Specification</th>
                          <th className="text-left px-4 py-3 font-semibold text-heading border-b border-gray-200">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProject.specifications?.map((spec: any, i: number) => (
                          <tr key={spec._id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                            <td className="px-4 py-2.5 text-gray-700 border-b border-gray-100">{spec.key}</td>
                            <td className="px-4 py-2.5 text-gray-600 border-b border-gray-100">{spec.detail}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "source" && (
            <div className="py-20 text-center text-gray-500 font-medium bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
               {currentProject.sourceCode || "Source code will be available after purchase."}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="px-6 md:px-20 py-8">
               {/* existing reviews UI... */}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
