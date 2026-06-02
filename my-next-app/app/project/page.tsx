"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, ChevronDown, ArrowLeft, ArrowUpDown, ListFilter, Star, Eye, ThumbsUp, Download, ChevronRight, X, Check } from "lucide-react";
import ProjectCard from "@/components/project/ProjectCard";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import PopularProjects from "@/components/project/PopularProjects";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchProjects, fetchProjectHero } from "@/redux/slices/projectSlice";
import { useRouter } from "next/navigation";

const steps = [
  {
    step: "Step 1",
    title: "Choose Your Project",
    desc: "Select a project based on your class, subject, or competition requirements.",
  },
  {
    step: "Step 2",
    title: "Choose Your Project",
    desc: "Select a project based on your class, subject, or competition requirements.",
  },
  {
    step: "Step 3",
    title: "Choose Your Project",
    desc: "Select a project based on your class, subject, or competition requirements.",
  },
];

const DiamondSelect = ({ isSelected, onClick }: { isSelected: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-6 h-6 rounded-lg border flex items-center justify-center rotate-45 transition-all
      ${isSelected ? 'bg-[#EE9C24] border-[#EE9C24] shadow-[0_2px_8px_rgba(238,156,36,0.3)]' : 'bg-white border-gray-200'}`}
  >
    {isSelected && <Check size={14} className="text-white -rotate-45" />}
  </button>
);

export default function ProjectPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading, hero } = useSelector((state: RootState) => state.project);
  const [projectType, setProjectType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mobile UI States
  const [isViewAll, setIsViewAll] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  // Filter States
  const [selectedSort, setSelectedSort] = useState("newest");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState(50); // 0 to 100 for percentage slider

  useEffect(() => {
    const params = new URLSearchParams();
    if (projectType) params.append("projectType", projectType);
    if (searchQuery) params.append("search", searchQuery);
    if (selectedSort) params.append("sort", selectedSort);
    if (selectedRating) params.append("rating", selectedRating.toString());
    
    dispatch(fetchProjects(params.toString()));
  }, [dispatch, projectType, searchQuery, selectedSort, selectedRating]);

  useEffect(() => {
    dispatch(fetchProjectHero());
  }, [dispatch]);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={10} className={s <= rating ? "fill-[#EE9C24] text-[#EE9C24]" : "text-gray-200 fill-gray-200"} />
      ))}
    </div>
  );

  const handleModalApply = () => {
     setIsSortOpen(false);
     setIsFilterOpen(false);
     setIsViewAll(true);
  };

  const navToDetail = (id: string) => {
     router.push(`/project/${id}`);
  };

  return (
    <main className="bg-white min-h-screen font-sans">
      
      {/* ───── MOBILE VIEW ───── */}
      <div className="lg:hidden">
        {/* Custom Header */}
        <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] px-4 py-4 flex items-center justify-between text-white sticky top-0 z-50">
          <div className="flex items-center">
            <button onClick={() => isViewAll ? setIsViewAll(false) : router.back()} className="mr-3">
              <ArrowLeft size={22} className="text-white" />
            </button>
            <span className="font-semibold text-[18px]">
              {isViewAll ? "View All Projects" : "Projects"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ArrowUpDown size={18} onClick={() => setIsSortOpen(true)} className="cursor-pointer" />
            <ListFilter size={18} onClick={() => setIsFilterOpen(true)} className="cursor-pointer" />
          </div>
        </div>

        {!isViewAll ? (
          /* MAIN PROJECTS SCREEN */
          <div className="bg-[#FAF9F6] pb-24">
            {/* Search Section */}
            <div className="px-4 py-6 bg-white shadow-sm mb-4">
              <h1 className="text-[18px] font-black text-[#333] mb-4">Hello, What Do You Want To Learn?</h1>
              <div className="flex items-center gap-3">
                 <div className="flex-1 bg-[#F9F9F9] rounded-xl border border-[#EE9C24] px-4 py-1.5 flex items-center justify-between">
                    <input 
                       type="text" 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       placeholder="Search categories here" 
                       className="bg-transparent outline-none text-xs text-gray-600 font-bold w-full py-2 placeholder:text-gray-300"
                    />
                    <button className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white p-1.5 rounded-lg shadow-md">
                       <Search size={14} />
                    </button>
                 </div>
                 <button className="text-[11px] font-black text-gray-400">Cancel</button>
              </div>
            </div>

            {/* Build Your Project Section */}
            <div className="px-5 py-4 bg-white mb-6">
               <div className="flex justify-between gap-4 mb-4">
                  <div className="flex-1">
                     <h2 className="text-[16px] font-black text-[#333] mb-1">{hero?.pageTitle || "Build Your Project – Learn by Doing!"}</h2>
                     <p className="text-[10px] font-black text-gray-400 mb-3">{hero?.subTitle || "Perfect for School & College Students"}</p>
                     <p className="text-[11px] font-bold text-gray-500 leading-relaxed opacity-80">
                        {hero?.description || "Get ready-to-build electronics, robotics, and IoT projects designed for students of all levels."}
                     </p>
                  </div>
                  <div className="shrink-0">
                     <div className="w-24 h-24 relative rounded-2xl overflow-hidden shadow-md">
                        <Image src={hero?.pageIcon || "/projecthero.png"} alt="Student" fill className="object-cover bg-[#EE9C24]" />
                     </div>
                  </div>
               </div>

               {/* Steps Scroll */}
               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {(hero?.cards || steps).map((s: any, idx: number) => (
                     <div key={idx} className="min-w-[150px] bg-white border border-gray-50 shadow-sm rounded-2xl p-3 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 bg-[#EE9C24] rounded-lg flex items-center justify-center p-1.5">
                              {s.icon ? (
                                <Image src={s.icon} alt="s" width={16} height={16} className="invert" />
                              ) : (
                                <Image src="/cat.png" alt="s" width={16} height={16} className="invert" />
                              )}
                           </div>
                           <span className="text-[11px] font-black text-[#333]">{s.heading || s.step}</span>
                        </div>
                        <h4 className="text-[11px] font-black text-[#333]">{s.subHeading || s.title}</h4>
                        <p className="text-[9px] font-bold text-gray-400 leading-tight">{s.description || s.desc}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Popular Projects Horizontal */}
            <div className="mb-6">
               <div className="px-5 flex items-center justify-between mb-4">
                  <h2 className="text-[17px] font-black text-gray-800">Popular Projects</h2>
               </div>
               <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 pb-4">
                  {projects.slice(0, 3).map((pj) => (
                     <div key={pj._id} className="min-w-[240px] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-50 p-3 flex flex-col">
                        <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 bg-gray-100">
                           <Image src={pj.icon || pj.images?.[0] || "/project.png"} alt="p" fill className="object-cover" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-start p-2">
                              <span className="bg-[#FAF9F6]/90 backdrop-blur-sm text-[8px] font-black px-2 py-1 rounded border border-gray-100 uppercase line-clamp-1">
                                 {pj.title}
                              </span>
                           </div>
                        </div>

                        <div className="flex items-center justify-between mb-2 px-1">
                           <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                              <Eye size={11} className="text-[#EE9C24]" /> {pj.totalViews || 0}
                           </div>
                           <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                              <ThumbsUp size={11} className="text-[#EE9C24]" /> {pj.totalRatings || 0}
                           </div>
                           <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                              <Download size={11} className="text-[#EE9C24]" /> {pj.totalDownloads || 0}
                           </div>
                        </div>

                        <h3 className="text-[12px] font-black text-[#333] leading-tight line-clamp-2 px-1 mb-2 h-8">{pj.title}</h3>

                        <div className="flex items-center gap-2 px-1 mb-3">
                           <span className="text-[9px] font-black text-gray-400 opacity-60">student ratings</span>
                           {renderStars(pj.rating || 5)}
                        </div>

                        <div className="flex items-center justify-between px-1">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-gray-400 opacity-60 uppercase">Price</span>
                              <div className="flex items-center gap-1.5">
                                 <span className="text-[#333] font-black text-[12px]">₹{pj.finalPrice || 447}</span>
                                 <span className="text-gray-400 line-through text-[10px]">₹{pj.mrp || 447}</span>
                              </div>
                           </div>
                           <button 
                             onClick={() => navToDetail(pj._id)}
                             className="bg-[#EE9C24] text-white px-3 py-1.5 rounded-lg text-[9px] font-black shadow-sm active:scale-95 transition-transform"
                           >
                              View full project
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* All Projects Vertical List */}
            <div className="px-5 mb-8">
               <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[18px] font-black text-gray-800">All Projects</h2>
                  <button onClick={() => setIsViewAll(true)} className="px-4 py-1.5 rounded-lg border border-gray-100 bg-white text-[10px] font-black text-gray-400 shadow-sm">View All</button>
               </div>
               <div className="space-y-4">
                  {projects.slice(3, 6).map((pj) => (
                     <div key={pj._id} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex gap-4">
                        <div className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                           <Image src={pj.icon || pj.images?.[0] || "/project.png"} alt="v" fill className="object-cover" />
                        </div>
                        <div className="flex flex-col flex-1 py-0.5 relative">
                           <h3 className="text-[11px] font-black text-[#333] leading-tight line-clamp-1 mb-1 pr-4">
                              {pj.title}
                           </h3>
                           <div className="flex items-center gap-2 mb-2">
                              <span className="text-[8px] font-black text-gray-400 opacity-60">student ratings</span>
                              {renderStars(pj.rating || 5)}
                           </div>
                           <div className="flex items-center gap-4 mb-2">
                              <span className="flex items-center gap-1 text-[9px] font-black text-gray-400"><Eye size={10} className="text-[#EE9C24]" /> {pj.totalViews || 0}</span>
                              <span className="flex items-center gap-1 text-[9px] font-black text-gray-400"><ThumbsUp size={10} className="text-[#EE9C24]" /> {pj.totalRatings || 0}</span>
                              <span className="flex items-center gap-1 text-[9px] font-black text-gray-400"><Download size={10} className="text-[#EE9C24]" /> {pj.totalDownloads || 0}</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                 <span className="text-[8px] font-black text-gray-400 opacity-60 uppercase">Price</span>
                                 <div className="flex items-center gap-1.5">
                                    <span className="text-[#333] font-black text-[12px]">₹{pj.finalPrice || 447}</span>
                                    <span className="text-gray-400 line-through text-[10px]">₹{pj.mrp || 447}</span>
                                 </div>
                              </div>
                              <button 
                                onClick={() => navToDetail(pj._id)}
                                className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white px-3 py-2 rounded-lg text-[8px] font-black shadow-sm"
                              >
                                View full project
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        ) : (
          /* VIEW ALL PROJECTS SCREEN (LIST VIEW) */
          <div className="bg-[#FAF9F6] pb-24 px-4 pt-4">
             {/* Category Pills Header */}
             <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                {["Newest First", "Hot Deal", "Brand", "5 Rating"].map((filter) => (
                   <button key={filter} className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-[11px] font-black text-gray-500 shadow-sm shrink-0 flex items-center gap-2">
                      {filter}
                      <X size={12} className="opacity-40" />
                   </button>
                )) }
             </div>

             {/* Full List of Projects */}
             <div className="space-y-4">
                {projects.map((pj) => (
                  <div key={pj._id} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex gap-4">
                     <div className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        <Image src={pj.icon || pj.images?.[0] || "/project.png"} alt="v" fill className="object-cover" />
                     </div>
                     <div className="flex flex-col flex-1 py-0.5 relative">
                        <h3 className="text-[11px] font-black text-[#333] leading-tight line-clamp-1 mb-1 pr-4">
                           {pj.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[8px] font-black text-gray-400 opacity-60">student ratings</span>
                           {renderStars(pj.rating || 5)}
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                           <span className="flex items-center gap-1 text-[9px] font-black text-gray-400"><Eye size={10} className="text-[#EE9C24]" /> {pj.totalViews || 0}</span>
                           <span className="flex items-center gap-1 text-[9px] font-black text-gray-400"><ThumbsUp size={10} className="text-[#EE9C24]" /> {pj.totalRatings || 0}</span>
                           <span className="flex items-center gap-1 text-[9px] font-black text-gray-400"><Download size={10} className="text-[#EE9C24]" /> {pj.totalDownloads || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-gray-400 opacity-60 uppercase">Price</span>
                              <div className="flex items-center gap-1.5">
                                 <span className="text-[#333] font-black text-[12px]">₹{pj.finalPrice || 447}</span>
                                 <span className="text-gray-400 line-through text-[10px]">₹{pj.mrp || 447}</span>
                              </div>
                           </div>
                           <button 
                             onClick={() => navToDetail(pj._id)}
                             className="bg-[#EE9C24] text-white px-3 py-2 rounded-lg text-[8px] font-black shadow-sm"
                           >
                             View full project
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* MODAL: SORT */}
        {isSortOpen && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsSortOpen(false)}>
            <div className="w-full bg-white rounded-t-[40px] p-6 pb-12 animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
               <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="bg-white border border-gray-200 p-2 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2">
                           <ArrowUpDown size={14} className="text-gray-400" />
                           <span className="text-[12px] font-black text-gray-500">Sort</span>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => setIsSortOpen(false)} className="bg-gray-100 p-2 rounded-full">
                     <X size={18} className="text-gray-500" />
                  </button>
               </div>
               
               <div className="space-y-4">
                  {[
                     { label: "Latest First", value: "newest" },
                     { label: "Price: Low to High", value: "low" },
                     { label: "Price: High to Low", value: "high" },
                     { label: "Popular", value: "popular" },
                     { label: "Top Rated", value: "rating" }
                  ].map((opt) => (
                    <div 
                       key={opt.value}
                       onClick={() => setSelectedSort(opt.value)}
                       className="w-full flex items-center gap-4 py-2 cursor-pointer group"
                    >
                       <DiamondSelect isSelected={selectedSort === opt.value} onClick={() => setSelectedSort(opt.value)} />
                       <span className={`text-[16px] font-black transition-colors ${selectedSort === opt.value ? 'text-gray-900' : 'text-gray-500'}`}>{opt.label}</span>
                    </div>
                  ))}
               </div>

               <div className="flex gap-4 mt-10">
                  <button onClick={() => { setSelectedSort("newest"); setIsSortOpen(false); }} className="flex-1 py-4 border border-gray-200 rounded-2xl text-[14px] font-black text-gray-400 active:bg-gray-50">Reset</button>
                  <button onClick={handleModalApply} className="flex-2 w-[60%] py-4 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white rounded-2xl text-[14px] font-black shadow-lg shadow-orange-200 active:scale-95 transition-transform">Apply</button>
               </div>
            </div>
          </div>
        )}

        {/* MODAL: FILTER */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}>
            <div className="w-full bg-white rounded-t-[40px] p-6 pb-12 animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
               <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="bg-white border border-gray-200 p-2 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2">
                           <ListFilter size={14} className="text-gray-400" />
                           <span className="text-[12px] font-black text-gray-500">Filters</span>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => setIsFilterOpen(false)} className="bg-gray-100 p-2 rounded-full">
                     <X size={18} className="text-gray-500" />
                  </button>
               </div>

               <div className="space-y-8">
                  {/* Price Range */}
                  <div>
                     <h3 className="text-[15px] font-black text-gray-800 mb-6 uppercase tracking-[1px]">Select Price Range</h3>
                     <div className="relative h-1 bg-gray-100 rounded-full mb-10 mx-2">
                        <div className="absolute top-0 bottom-0 bg-[#EE9C24] rounded-full" style={{ left: '0%', right: `${100 - priceRange}%` }} />
                        <input 
                           type="range" 
                           min="0" 
                           max="100" 
                           value={priceRange} 
                           onChange={(e) => setPriceRange(parseInt(e.target.value))}
                           className="absolute -top-4 w-full h-10 opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-100 rounded-full shadow-lg flex items-center justify-center -ml-3" style={{ left: '0%' }}>
                           <ChevronRight size={14} className="text-[#EE9C24] rotate-180" />
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-100 rounded-full shadow-lg flex items-center justify-center -mr-3" style={{ left: `${priceRange}%` }}>
                           <ChevronRight size={14} className="text-[#EE9C24]" />
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="flex-1 bg-[#F9F9F9] rounded-2xl p-4 border border-gray-50">
                           <span className="text-[10px] font-black text-gray-300 block mb-1">From :</span>
                           <span className="text-[16px] font-black text-gray-800">₹447</span>
                        </div>
                        <div className="flex-1 bg-[#F9F9F9] rounded-2xl p-4 border border-gray-50">
                           <span className="text-[10px] font-black text-gray-300 block mb-1">To :</span>
                           <span className="text-[16px] font-black text-gray-800">₹447</span>
                        </div>
                     </div>
                  </div>

                  {/* Level / Feature */}
                  <div>
                     <h3 className="text-[15px] font-black text-gray-800 mb-6 uppercase tracking-[1px]">feature</h3>
                     <div className="space-y-4">
                         {[
                           { label: "Beginner Level", value: "beginner" },
                           { label: "Intermediate Level", value: "intermediate" },
                           { label: "Advanced Level", value: "advance" },
                         ].map((lv) => (
                            <div key={lv.value} onClick={() => setProjectType(lv.value)} className="flex items-center gap-4 cursor-pointer">
                               <DiamondSelect isSelected={projectType === lv.value} onClick={() => setProjectType(lv.value)} />
                               <span className={`text-[16px] font-black transition-colors ${projectType === lv.value ? 'text-gray-900' : 'text-gray-500'}`}>{lv.label}</span>
                            </div>
                         ))}
                     </div>
                  </div>

                  {/* Rating */}
                  <div>
                     <h3 className="text-[15px] font-black text-gray-800 mb-6 uppercase tracking-[1px]">Rating</h3>
                     <div className="space-y-4">
                        {[5, 4, 3, 2, 1].map((r) => (
                           <div key={r} onClick={() => setSelectedRating(r)} className="flex items-center gap-4 cursor-pointer">
                              <DiamondSelect isSelected={selectedRating === r} onClick={() => setSelectedRating(r)} />
                              <div className="flex items-center gap-2">
                                 <span className={`text-[16px] font-black ${selectedRating === r ? 'text-gray-900' : 'text-gray-500'} mr-1`}>{r}</span>
                                 <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                       <Star key={star} size={16} className={star <= r ? "fill-[#EE9C24] text-[#EE9C24]" : "text-gray-100 fill-gray-100"} />
                                    ))}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 mt-12 pb-6">
                  <button onClick={() => { setSelectedRating(null); setProjectType(""); setPriceRange(50); setIsFilterOpen(false); }} className="flex-1 py-4 border border-gray-200 rounded-2xl text-[14px] font-black text-gray-400 active:bg-gray-50">Reset</button>
                  <button onClick={handleModalApply} className="flex-2 w-[60%] py-4 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white rounded-2xl text-[14px] font-black shadow-lg shadow-orange-200 active:scale-95 transition-transform">Apply</button>
               </div>
            </div>
          </div>
        )}
      </div>


      {/* ───── DESKTOP VIEW ───── */}
      <div className="hidden lg:block">
        <section className="px-4 md:px-10 lg:px-20 pt-6 pb-10">
          <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1">
            <Link href="/" className="hover:text-gray-600 uppercase tracking-wide">Home</Link>
            <span>&gt;</span>
            <span className="text-[#EE9C24] font-semibold uppercase tracking-wide">Projects</span>
          </nav>
          <div className="text-center mb-8">
            <h1 className="text-heading font-bold text-2xl md:text-3xl mb-5">Hello, What Do You Want To Learn?</h1>
            <div className="relative max-w-xl mx-auto">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="search Project what you want .." className="w-full border-2 border-orange-400 rounded-full pl-5 pr-14 py-3 text-sm text-gray-500 outline-none focus:ring-2 focus:ring-orange-200" />
              <button className="absolute right-0 top-0 h-full bg-primary-gradient rounded-full px-4 flex items-center justify-center"><Search size={16} className="text-white" /></button>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-start gap-8">
            <div className="flex-1">
              <h2 className="text-heading font-bold text-2xl md:text-3xl mb-1">{hero?.pageTitle || "Build Your Project – Learn by Doing!"}</h2>
              <p className="text-gray-500 text-sm mb-3">{hero?.subTitle || "Perfect for School & College Students"}</p>
              <p className="text-gray-600 text-sm leading-relaxed mb-7 max-w-xl">{hero?.description || "Get ready-to-build electronics, robotics, and IoT projects designed for students of all levels."}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(hero?.cards || steps).map((s: any, idx: number) => (
                  <div key={idx} className="card rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {s.icon ? (
                         <div className="w-11 h-11 bg-primary-gradient rounded-xl flex items-center justify-center shrink-0">
                           <Image src={s.icon} alt={s.heading || s.step} width={22} height={22} className="invert" />
                         </div>
                      ) : (
                         <div className="w-11 h-11 bg-primary-gradient rounded-xl flex items-center justify-center shrink-0 text-white"><ThumbsUp size={22} /></div>
                      )}
                      <span className="text-heading font-bold text-base">{s.heading || s.step}</span>
                    </div>
                    <h4 className="text-heading font-semibold text-sm">{s.subHeading || s.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{s.description || s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-72 xl:w-80 shrink-0 self-end hidden lg:block">
              <Image src={hero?.pageIcon || "/projecthero.png"} alt="Student" width={380} height={460} className="object-contain" />
            </div>
          </div>
        </section>
        <section className="px-4 md:px-10 lg:px-20 py-8 ">
          <div className="flex gap-6">
            <div className="w-64 shrink-0 hidden md:block">
              <ProjectSidebar 
                activeCategory={projectType} 
                onCategoryChange={setProjectType} 
                selectedRating={selectedRating}
                onRatingChange={setSelectedRating}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-heading font-bold text-xl">Projects</h2>
                <div className="relative">
                  <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)} className="appearance-none border border-gray-200 rounded-lg px-4 py-2 text-sm text-heading font-medium pr-8 bg-white outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer">
                    <option value="newest">Newest First</option>
                    <option value="low">Price: Low to High</option>
                    <option value="high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              {loading ? <div className="py-10 text-center text-gray-500">Loading projects...</div> : projects.length === 0 ? <div className="py-10 text-center text-gray-500">No projects found.</div> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-2">
                  {projects.map((pj) => <ProjectCard key={pj._id} id={pj._id} title={pj.title} image={pj.icon || pj.images?.[0] || "/project.png"} views={pj.totalViews || 0} likes={pj.totalRatings || 0} downloads={pj.totalDownloads || 0} rating={pj.rating || 0} ratingCount={pj.totalRatings || 0} price={pj.finalPrice} originalPrice={pj.mrp} />)}
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="px-4 md:px-10 lg:px-20 bg-white">
          <PopularProjects title="Popular Projects" />
        </section>
        <section className="px-4 md:px-10 lg:px-20 bg-white pb-12">
          <PopularProjects title="View Also This" />
        </section>
      </div>
    </main>
  );
}
