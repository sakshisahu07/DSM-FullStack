"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchAtlData } from '@/redux/slices/atlSlice';
import { Printer, Wrench, ArrowLeft, Share2 } from 'lucide-react';

export default function AtlKitsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.atl);

  useEffect(() => {
    dispatch(fetchAtlData());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-orange-100 border-t-[#EE9C24] rounded-full animate-spin"></div>
           <p className="text-xs font-bold text-gray-400 ">Loading ATL Solutions...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400 font-medium">Failed to load content. Please try again later.</p>
      </div>
    );
  }

  const { banner, heading, description, subTitle, subDescription, cards, images, setupDetails, setProcess, processHeading, processImage, setupHeading, setupImage } = data;

  return (
    <main className="min-h-screen font-sans bg-white">
      
      {/* ───── MOBILE VIEW ───── */}
      <div className="lg:hidden">
         <div className="bg-white pb-20 pt-4">
            {/* Mobile Hero Banner */}
            <div className="relative aspect-video w-full bg-gray-100">
               <Image src={banner?.url && banner.url !== 'false' ? banner.url : '/placeholder.png'} alt="ATL Hero" fill className="object-cover" />
            </div>

            {/* About ATL Mobile */}
            <div className="px-5 py-10">
               <div className="flex flex-col items-center text-center mb-8">
                  <h2 className="text-[22px] font-bold text-gray-800 mb-4 tracking-tighter">
                     About <span className="text-[#EE9C24]">{heading}</span>
                  </h2>
                  <div className="h-1.5 w-16 bg-[#EE9C24] rounded-full" />
               </div>
               <p className="text-[13px] font-medium text-gray-400 leading-relaxed text-center mb-10 px-2 opacity-80">
                  {description}
               </p>

               <div className="flex flex-col items-center text-center mb-8">
                  <h2 className="text-[22px] font-bold text-gray-800 mb-4 tracking-tighter">
                    {subTitle.split(' ').map((word, i, arr) => (
                      <React.Fragment key={i}>
                        {i === arr.length - 1 ? <span className="text-[#EE9C24]">{word}</span> : word + ' '}
                      </React.Fragment>
                    ))}
                  </h2>
                  <div className="h-1.5 w-16 bg-[#EE9C24] rounded-full" />
               </div>
               <p className="text-[13px] font-medium text-gray-400 leading-relaxed text-center mb-12 px-2 opacity-80">
                  {subDescription}
               </p>

               {/* Mobile Info Cards */}
               <div className="space-y-16 pt-10">
                  {cards.map((card) => (
                     <div key={card._id} className="bg-white rounded-[32px] p-6 pt-16 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] border border-gray-50 relative text-center flex flex-col items-center">
                        <div className="absolute -top-12 w-24 h-24 flex items-center justify-center">
                           <Image src={card.icon?.url && card.icon.url !== 'false' ? card.icon.url : '/placeholder.png'} alt="icon" width={100} height={100} className="w-full h-full object-contain" />
                        </div>
                        <h3 className="text-[16px] font-bold text-gray-800 mb-3">{card.title}</h3>
                        <p className="text-[11px] font-medium text-gray-400 leading-relaxed opacity-90">{card.description}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Set Process Mobile (Using this for challenges style if applicable) */}
            {setProcess && setProcess.length > 0 && (
               <div className="px-5 py-12 bg-[#FAF9F6]">
                  <div className="relative mb-12 flex justify-center">
                     <h2 className="text-[20px] font-bold text-gray-800 relative z-10 text-center pl-6">
                        <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-[#EE9C24] to-[#B8420E] rounded-full z-[-1]" />
                        {processHeading || "ATL Implementation Process"}
                     </h2>
                  </div>

                  <div className="space-y-10">
                     {setProcess.map((step) => (
                        <div key={step._id} className="flex gap-4">
                           <div className="mt-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#EE9C24]" /></div>
                           <div className="flex flex-col">
                              <h3 className="text-[14px] font-bold text-[#EE9C24] case  mb-1">{step.heading}</h3>
                              <p className="text-[11px] font-medium text-gray-400  pr-2">{step.description}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Setup Details Mobile */}
            <div className="px-5 py-16">
               <h2 className="text-[22px] font-bold text-gray-800 mb-10 ">
                  {setupHeading ? (
                     setupHeading.split(' ').map((word: string, i: number, arr: string[]) => (
                        <React.Fragment key={i}>
                           {i === arr.length - 1 ? <span className="text-[#EE9C24]">{word}</span> : word + ' '}
                        </React.Fragment>
                     ))
                  ) : (
                     <>Lab Setup <span className="text-[#EE9C24]">Inclusions</span></>
                  )}
               </h2>

               <div className="space-y-10">
                  {setupDetails.map((item) => (
                     <div key={item._id} className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-50 flex items-center justify-center shrink-0">
                           <Image src={item.setupIcon?.url && item.setupIcon.url !== 'false' ? item.setupIcon.url : '/placeholder.png'} alt="i" width={32} height={32} className="object-contain p-1" />
                        </div>
                        <div className="flex flex-col">
                           <h3 className="text-[14px] font-bold text-gray-800 mb-1">{item.title}</h3>
                           <p className="text-[11px] font-medium text-gray-400 leading-relaxed opacity-80">{item.description}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>


      {/* ───── DESKTOP VIEW ───── */}
      <div className="hidden lg:block min-h-screen">
        {/* 1. Hero Section */}
        <div className="relative w-full aspect-[1920/600] bg-gray-100">
           <Image src={banner?.url && banner.url !== 'false' ? banner.url : '/placeholder.png'} alt="ATL Hero Banner" fill className="object-cover" />
        </div>

        {/* 2. About ATL Section */}
        <div id="about-atl" className="px-16 pt-12 bg-white">
          <div className="flex flex-col items-center justify-center mb-10">
            <h2 className="text-center text-4xl font-bold text-gray-800 mb-6 ">About <span className="text-[#EE9C24]">{heading}</span></h2>
            <div className="h-[4px] w-24 bg-[#EE9C24] rounded-full"></div>
          </div>
          
          <p className="text-center text-[#333333] font-medium leading-[1.8] text-[1.28rem] mb-16  opacity-80  px-10">
             {description}
          </p>

          <div className="flex flex-col items-center justify-center mb-10">
            <h2 className="text-center text-4xl font-bold text-gray-800 mb-6 ">
                {subTitle.split(' ').map((word, i, arr) => (
                    <React.Fragment key={i}>
                        {i === arr.length - 1 ? <span className="text-[#EE9C24]">{word}</span> : word + ' '}
                    </React.Fragment>
                ))}
            </h2>
            <div className="h-[4px] w-24 bg-[#EE9C24] rounded-full"></div>
          </div>
          
          <p className="text-center text-[#333333] font-medium leading-[1.8] text-[1.28rem] mb-32 opacity-80 px-10">
             {subDescription}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {cards.map((card) => (
              <div key={card._id} className="px-6 py-16 bg-white rounded-[48px] shadow-[0_10px_50px_-10px_rgba(0,0,0,0.06)] border border-gray-100 relative text-center flex flex-col items-center justify-center group hover:scale-[1.02] transition-all">
                <div className="absolute -top-16 w-32 h-32 flex items-center justify-center">
                  <Image src={card.icon?.url && card.icon.url !== 'false' ? card.icon.url : '/placeholder.png'} alt="ATL Icon" width={200} height={200} className="w-full h-full object-contain" />
                </div>
                <h3 className="text-[1.6rem] font-medium text-[#333333] mb-6 mt-4">{card.title}</h3>
                <p className="text-[#333333]  text-[1.1rem] opacity-80">{card.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Steps/Process Section */}
        {setProcess && setProcess.length > 0 && (
            <div id="process" className="py-24 px-16 bg-white">
            <div className="grid grid-cols-2 gap-20 items-center">
                <div>
                <h2 className="text-[2.2rem] font-bold text-[#333333] mb-16 relative z-10 pl-6 ">
                    <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-[#EE9C24] to-[#B8420E] rounded-full z-[-1]"></div>
                    {processHeading ? (
                        <>
                           <span className="text-white">{processHeading.slice(0, 2)}</span>
                           <span>{processHeading.slice(2)}</span>
                        </>
                    ) : (
                        <>
                           <span className="text-white">Im</span>
                           <span>plementation Process</span>
                        </>
                    )}
                </h2>

                <div className="space-y-12">
                    {setProcess.map((step) => (
                        <div key={step._id}>
                            <h3 className="text-[#EE9C24] text-[1.5rem] font-bold  mb-2">{step.heading}</h3>
                            <p className="text-[#333333] font-medium text-[1.18rem] opacity-80">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
                </div>
                
                <div className="relative aspect-[4/3] w-full">
                <div className="absolute -top-8 -left-8 w-40 h-40 bg-[#EE9C24] rounded-[48px] z-0 opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[#B8420E] rounded-[48px] z-0 opacity-20"></div>
                <div className="relative h-full w-full rounded-[48px] overflow-hidden shadow-2xl z-10 border-8 border-white">
                    <Image src={processImage?.url && processImage.url !== 'false' ? processImage.url : (images && images[0]?.url ? images[0].url : "/atlTeacher.png")} alt="Process Image" fill className="object-cover" />
                </div>
                </div>
            </div>
            </div>
        )}

        {/* 4. Included Section */}
        <div id="lab-setup" className="py-14 px-16  rounded-[80px_80px_0_0]">
           <div className="grid grid-cols-[1.2fr_0.8fr] gap-20">
              <div>
                 <h2 className="text-5xl font-bold text-gray-800 mb-16 ">
                    {setupHeading ? (
                        setupHeading.split(' ').map((word: string, i: number, arr: string[]) => (
                           <React.Fragment key={i}>
                              {i === arr.length - 1 ? <span className="text-[#EE9C24]">{word}</span> : word + ' '}
                           </React.Fragment>
                        ))
                     ) : (
                        <>What&apos;s <span className="text-[#EE9C24]">Included</span> in ATL Lab Setup</>
                     )}
                 </h2>
                 <div className="space-y-12">
                    {setupDetails.map((item) => (
                       <div key={item._id} className="flex gap-8 group">
                          <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center shrink-0 border border-gray-50 transform group-hover:rotate-12 transition-transform p-3">
                             <Image src={item.setupIcon?.url && item.setupIcon.url !== 'false' ? item.setupIcon.url : '/placeholder.png'} alt="i" width={48} height={48} className="object-contain" />
                          </div>
                          <div>
                             <h3 className="text-2xl font-bold text-gray-800 mb-3 ">{item.title}</h3>
                             <p className="text-[#333333] font-medium text-[1.1rem] opacity-80 ">{item.description}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="relative h-full flex items-center justify-center">
                 <div className="absolute w-[90%] h-[90%] rounded-full bg-gradient-to-br from-[#EE9C24] to-[#B8420E] opacity-10 animate-blob"></div>
                 <div className="relative w-full aspect-square filter drop-shadow-2xl">
                    <Image src={setupImage?.url && setupImage.url !== 'false' ? setupImage.url : (images && images[1]?.url ? images[1].url : "/atlsetup.png")} alt="Setup" fill className="object-contain scale-110" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
