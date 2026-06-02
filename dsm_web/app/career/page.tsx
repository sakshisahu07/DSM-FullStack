"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchJobs } from "@/redux/slices/careerSlice";
import { Info, Briefcase, Clock, MapPin, ChevronRight, ChevronDown, ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CareerPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { jobs, loading } = useSelector((state: RootState) => state.career);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const safeJobs = Array.isArray(jobs) ? jobs : [];

  const filteredJobs = safeJobs.filter(job =>
    job.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white">

      {/* ───── MOBILE VIEW ───── */}
      <div className="lg:hidden">
        {/* Custom Header */}
        <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] px-4 py-4 flex items-center text-white sticky top-0 z-50">
          <button onClick={() => router.back()} className="mr-3">
            <ArrowLeft size={22} className="text-white" />
          </button>
          <span className="font-semibold text-[18px]">Career</span>
        </div>

        <div className="bg-[#FAF9F6] pb-24">
          {/* Search Bar Mobile */}
          <div className="bg-white px-4 py-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-lg border border-gray-200 px-3 py-2.5 flex items-center gap-2 shadow-sm">
                <input
                  type="text"
                  placeholder="Search here"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-xs text-gray-600 font-bold w-full placeholder:text-gray-300"
                />
                <button className="bg-[#EE9C24] text-white p-1.5 rounded-lg">
                  <Search size={14} className="fill-white" />
                </button>
              </div>
              <button onClick={() => setSearchQuery("")} className="text-[12px] font-black text-gray-400 px-1 uppercase tracking-wider">Cancel</button>
            </div>
          </div>

          {/* Positions Section */}
          <div className="px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] font-black text-[#333] tracking-tighter">Available Positions</h2>
              <div className="bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-sm flex items-center gap-2">
                <span className="text-[11px] font-black text-gray-600">Latest First</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-orange-100 border-t-[#EE9C24] rounded-full animate-spin" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-20 text-center text-gray-400 font-bold text-sm">No positions matching your search.</div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job, idx) => (
                  <div key={`${job._id}-${idx}`} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <Info size={11} className="text-gray-400" />
                        </div>
                        <h3 className="font-black text-[13px] text-[#333] tracking-normal leading-tight">{job.title}</h3>
                      </div>
                      <Link href={`/career/${job._id}`} className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-[11px] font-black text-[#333]">View Job</span>
                        <ChevronRight size={14} className="text-[#333]" />
                      </Link>
                    </div>

                    <div className="flex flex-wrap gap-y-3 pt-1">
                      <div className="w-1/2 flex items-center gap-2">
                        <Clock size={13} className="text-[#EE9C24]" />
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-[#EE9C24] uppercase tracking-wide opacity-80">Job Type :</span>
                          <span className="text-[10px] font-black text-[#333] capitalize">{job.jobType}</span>
                        </div>
                      </div>
                      <div className="w-1/2 flex items-center gap-2">
                        <MapPin size={13} className="text-[#EE9C24]" />
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-[#EE9C24] uppercase tracking-wide opacity-80">Location :</span>
                          <span className="text-[10px] font-black text-[#333] capitalize">{job.city || "Bhopal(M.P)"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ───── DESKTOP VIEW ───── */}
      <div className="hidden lg:block px-4 md:px-16 py-8 bg-white min-h-screen">

        {/* Breadcrumb */}
        <div className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-12">
          <Link href="/" className="hover:text-[#EE9C24] transition-colors">
            HOME
          </Link>{" "}
          &gt;{" "}
          <span className="text-[#EE9C24]">Career</span>
        </div>

        {/* Title Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center">
            <div className="h-[4px] w-20 sm:w-32 bg-[#EE9C24]"></div>
            <h1 className="md:text-[2rem] sm:text-4xl font-black text-black px-6 tracking-wide">
              Career
            </h1>
            <div className="h-[4px] w-20 sm:w-32 bg-[#EE9C24]"></div>
          </div>
        </div>

        {/* Header content */}
        <div className="mb-10">
          <div className="inline-block relative mb-4">
            <h2 className="md:text-[1.2rem] sm:text-2xl font-black text-gray-800 pb-2 uppercase tracking-wide">
              Work With us
            </h2>
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#EE9C24]"></div>
          </div>
          <p className="text-gray-600 text-lg font-bold">
            Be a Part Of our Mission And Organization
          </p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <button className="text-xs px-8 py-3 border-2 border-[#EE9C24] text-[#EE9C24] rounded-full bg-[#F8F7F8] font-black uppercase tracking-wider">
            Available Positions
          </button>

          <div className="relative">
            <select className="appearance-none border border-gray-200 rounded-lg py-2.5 pl-4 pr-10 text-gray-600 bg-white shadow-sm focus:outline-none focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] cursor-pointer font-bold text-sm w-full sm:w-48">
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-gray-500">Loading jobs...</div>
          ) : safeJobs.length === 0 ? (
            <div className="py-20 text-center text-gray-500">No open positions available.</div>
          ) : (
            safeJobs.map((job, idx) => (
              <div
                key={`${job._id}-${idx}`}
                className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] p-6 hover:shadow-[0_5px_20px_rgba(0,0,0,0.06)] transition-all group"
              >
                {/* Card Top Row */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-gray-600" />
                    <h3 className="font-black text-lg text-[#000000] tracking-wide capitalize">
                      {job.title}
                    </h3>
                  </div>
                  <Link href={`/career/${job._id}`} className="flex items-center gap-1 cursor-pointer">
                    <span className="font-black text-[#000000] group-hover:text-[#EE9C24] transition-colors text-[16px]">
                      View Job
                    </span>
                    <ChevronRight size={20} className="text-[#000000] group-hover:text-[#EE9C24] transition-colors" />
                  </Link>
                </div>

                {/* Card Bottom Row */}
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-0 sm:justify-between items-start sm:items-center">

                  <div className="flex items-center gap-2 w-full sm:w-1/3">
                    <Briefcase className="w-5 h-5 text-[#EE9C24]" />
                    <div>
                      <span className="text-[#EE9C24] text-[15px] font-black mr-1">
                        Work Mode :
                      </span>
                      <span className="text-[#333333] font-black text-[15px] capitalize">
                        {job.workMode || "Onsite"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-1/3">
                    <Clock className="w-5 h-5 text-[#EE9C24]" />
                    <div>
                      <span className="text-[#EE9C24] text-[15px] font-black mr-1">
                        Job Type :
                      </span>
                      <span className="text-[#333333] font-black text-[15px] capitalize">
                        {job.jobType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-1/3">
                    <MapPin className="w-5 h-5 text-[#EE9C24]" />
                    <div>
                      <span className="text-[#EE9C24] text-[15px] font-black mr-1">
                        Location :
                      </span>
                      <span className="text-[#333333] font-black text-[15px]">
                        {job.city || "Bhopal"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
