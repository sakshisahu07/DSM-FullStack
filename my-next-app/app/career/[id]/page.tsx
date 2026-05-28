"use client";

import Image from "next/image";
import Link from "next/link";
import { Info, ChevronRight, CloudUpload, ArrowLeft, Share2, Briefcase, Clock, MapPin, Check, X, ChevronDown, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchJobById, clearCurrentJob, applyJob, clearApplyStatus } from "@/redux/slices/careerSlice";

export default function JobDetail() {
   const { id } = useParams();
   const router = useRouter();
   const dispatch = useDispatch<AppDispatch>();
   const { currentJob, loading, applyLoading } = useSelector((state: RootState) => state.career);

   const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      city: "",
      state: "",
      country: "",
      zipcode: "",
      product: "",
      message: "",
   });
   const [resume, setResume] = useState<File | null>(null);

   useEffect(() => {
      if (id) {
         dispatch(fetchJobById(id as string));
      }
      return () => {
         dispatch(clearCurrentJob());
         dispatch(clearApplyStatus());
      };
   }, [id, dispatch]);

   const handleChange = (e: any) => {
      const { name, value } = e.target;
      if (name === "phone") {
         const numericValue = value.replace(/\D/g, "");
         if (numericValue.length <= 10) {
            setFormData({ ...formData, [name]: numericValue });
         }
      } else {
         setFormData({ ...formData, [name]: value });
      }
   };

   const handleFileChange = (e: any) => {
      if (e.target.files && e.target.files[0]) {
         setResume(e.target.files[0]);
      }
   };

   const handleSubmit = (e: React.MouseEvent) => {
      e.preventDefault();
      if (!resume) {
         alert("Please upload your resume.");
         return;
      }
      const data = new FormData();
      data.append("jobId", id as string);
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("phone", formData.phone);

      // Backend logic remains consistent with existing fixes
      data.append("city", "69c4cdf989423fb1b9fceded");

      // Packing additional UI fields into the message to ensure data is captured by the backend
      const extendedMessage = [
         formData.city ? `City: ${formData.city}` : "",
         formData.state ? `State: ${formData.state}` : "",
         formData.zipcode ? `Zipcode: ${formData.zipcode}` : "",
         formData.product ? `Product: ${formData.product}` : "",
         formData.message ? `Message: ${formData.message}` : ""
      ].filter(Boolean).join(" | ");

      data.append("message", extendedMessage);

      data.append("resume", resume);
      data.append("country", "69c389b43f5fc953412718a0");
      data.append("state", "69c39e01202240d9f7d0a17a");
      data.append("pincode", "69c4cea289423fb1b9fcedf5");

      dispatch(applyJob(data)).then((res: any) => {
         if (res.meta.requestStatus === 'fulfilled') {
            alert("Application submitted successfully!");
            setFormData({ firstName: "", lastName: "", phone: "", email: "", city: "", state: "", country: "", zipcode: "", product: "", message: "" });
            setResume(null);
         } else {
            alert(res.payload || "Failed to submit application");
         }
      });
   };

   if (loading || !currentJob) {
      return (
         <main className="bg-white min-h-screen py-20 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-orange-100 border-t-[#EE9C24] rounded-full animate-spin" />
         </main>
      );
   }

   return (
      <main className="min-h-screen bg-white">

         {/* ───── MOBILE VIEW ───── */}
         <div className="lg:hidden">
            {/* Custom Header */}
            <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] px-4 py-4 flex items-center justify-between text-white sticky top-0 z-50">
               <div className="flex items-center">
                  <button onClick={() => router.back()} className="mr-3">
                     <ArrowLeft size={22} className="text-white" />
                  </button>
                  <span className="font-semibold text-[18px]">Career</span>
               </div>
               <button className="p-2">
                  <Share2 size={20} className="text-white" />
               </button>
            </div>

            <div className="bg-white pb-24 px-4 pt-6">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <div className="w-4 h-4 bg-gray-50 rounded-full flex items-center justify-center">
                        <Info size={10} className="text-gray-400" />
                     </div>
                     <h1 className="text-[16px] font-black text-[#333] tracking-tighter leading-tight ">{currentJob.title}</h1>
                  </div>
                  <button className="text-[12px] font-black text-[#333] flex items-center gap-1">Apply Now <ChevronRight size={14} /></button>
               </div>

               <h2 className="text-[#EE9C24] text-[13px] font-black  mb-4 tracking-wider">Job Description</h2>

               <div className="space-y-2 mb-8">
                  <div className="text-[11px] font-bold text-[#333]">
                     <span className="text-gray-400 font-black mr-2  tracking-wide opacity-80">Position:</span> {currentJob.title}
                  </div>
                  <div className="text-[11px] font-bold text-[#333]">
                     <span className="text-gray-400 font-black mr-2  opacity-80">Employment Type:</span> <span className="capitalize">{currentJob.jobType}</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#333]">
                     <span className="text-gray-400 font-black mr-2  opacity-80">Experience Required:</span> 2—3 Years
                  </div>
                  <div className="text-[11px] font-bold text-[#333]">
                     <span className="text-gray-400 font-black mr-2  opacity-80">Location:</span> {currentJob.city}
                  </div>
               </div>

               <div className="mb-8">
                  <h3 className="text-[#EE9C24] text-[12px] font-black  mb-3 tracking-wider">Role Overview</h3>
                  <p className="text-[11px] font-bold text-gray-500 ">
                     {currentJob.roleOverview || currentJob.description}
                  </p>
               </div>

               {currentJob.responsibilities && (
                  <div className="mb-8">
                     <h3 className="text-[#EE9C24] text-[12px] font-black  mb-3 ">Key Responsibilities</h3>
                     <ul className="space-y-2">
                        {currentJob.responsibilities.map((r: string, idx: number) => (
                           <li key={idx} className="flex gap-3 items-start">
                              <div className="mt-1"><div className="w-1.5 h-1.5 rounded-full bg-gray-400" /></div>
                              <span className="text-[11px] font-bold text-gray-500 leading-snug">{r}</span>
                           </li>
                        ))}
                     </ul>
                  </div>
               )}

               {currentJob.skills && (
                  <div className="mb-12">
                     <h3 className="text-[#EE9C24] text-[12px] font-black mb-3 tracking-wider">Required Skills & Qualifications</h3>
                     <ul className="space-y-2">
                        {currentJob.skills.map((s: string, idx: number) => (
                           <li key={idx} className="flex gap-3 items-start">
                              <div className="mt-1"><div className="w-1.5 h-1.5 rounded-full bg-gray-400" /></div>
                              <span className="text-[11px] font-bold text-gray-500 leading-snug">{s}</span>
                           </li>
                        ))}
                     </ul>
                  </div>
               )}

               {/* Application Form Mobile */}
               <div className="bg-[#FFFAF2] rounded-[32px] p-6 border border-orange-50">
                  <form className="space-y-8">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                           <label className="absolute -top-2.5 left-4 px-2 bg-[#FFFAF2] text-[10px] font-black text-gray-700  z-10">First Name</label>
                           <div className="flex bg-white rounded-xl border border-[#EE9C24]/30 px-3 py-3 items-center justify-between">
                              <input
                                 type="text"
                                 name="firstName"
                                 placeholder="Enter your Number"
                                 value={formData.firstName}
                                 onChange={handleChange}
                                 className="bg-transparent outline-none text-[11px] font-bold text-gray-700 w-full placeholder:text-gray-200"
                              />
                              <Image src="/editicon.png" alt="edit" width={12} height={12} className="opacity-40" />
                           </div>
                        </div>
                        <div className="relative">
                           <label className="absolute -top-2.5 left-4 px-2 bg-[#FFFAF2] text-[10px] font-black text-gray-700  z-10">Last Name</label>
                           <div className="flex bg-white rounded-xl border border-[#EE9C24]/30 px-3 py-3 items-center justify-between">
                              <input
                                 type="text"
                                 name="lastName"
                                 placeholder="Enter your Number"
                                 value={formData.lastName}
                                 onChange={handleChange}
                                 className="bg-transparent outline-none text-[11px] font-bold text-gray-700 w-full placeholder:text-gray-200"
                              />
                              <Image src="/editicon.png" alt="edit" width={12} height={12} className="opacity-40" />
                           </div>
                        </div>
                     </div>

                     <div className="relative">
                        <label className="absolute -top-2.5 left-4 px-2 bg-[#FFFAF2] text-[10px] font-black text-gray-700  z-10">Phone Number</label>
                        <div className="flex bg-white rounded-xl border border-[#EE9C24]/30 px-3 py-3 items-center justify-between">
                           <input
                              type="tel"
                              name="phone"
                              maxLength={10}
                              placeholder="1234567890"
                              value={formData.phone}
                              onChange={handleChange}
                              className="bg-transparent outline-none text-[11px] font-bold text-gray-700 w-full placeholder:text-gray-200"
                           />
                           <Image src="/editicon.png" alt="edit" width={12} height={12} className="opacity-40" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                           <label className="absolute -top-2.5 left-4 px-2 bg-[#FFFAF2] text-[10px] font-black text-gray-700  z-10">Country</label>
                           <div className="flex bg-white rounded-xl border border-[#EE9C24]/30 px-3 py-3 items-center justify-between">
                              <input
                                 type="text"
                                 name="country"
                                 placeholder="Select country"
                                 value={formData.country}
                                 onChange={handleChange}
                                 className="bg-transparent outline-none text-[11px] font-bold text-gray-700 w-full placeholder:text-gray-200"
                              />
                              <ChevronDown size={14} className="text-gray-300" />
                           </div>
                        </div>
                        <div className="relative">
                           <label className="absolute -top-2.5 left-4 px-2 bg-[#FFFAF2] text-[10px] font-black text-gray-700  z-10">State</label>
                           <div className="flex bg-white rounded-xl border border-[#EE9C24]/30 px-3 py-3 items-center justify-between">
                              <input
                                 type="text"
                                 name="state"
                                 placeholder="Select state"
                                 value={formData.state}
                                 onChange={handleChange}
                                 className="bg-transparent outline-none text-[11px] font-bold text-gray-700 w-full placeholder:text-gray-200"
                              />
                              <ChevronDown size={14} className="text-gray-300" />
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                           <label className="absolute -top-2.5 left-4 px-2 bg-[#FFFAF2] text-[10px] font-black text-gray-700  z-10">City</label>
                           <div className="flex bg-white rounded-xl border border-[#EE9C24]/30 px-3 py-3 items-center justify-between">
                              <input
                                 type="text"
                                 name="city"
                                 placeholder="Enter Your Number"
                                 value={formData.city}
                                 onChange={handleChange}
                                 className="bg-transparent outline-none text-[11px] font-bold text-gray-700 w-full placeholder:text-gray-200"
                              />
                              <Image src="/editicon.png" alt="edit" width={12} height={12} className="opacity-40" />
                           </div>
                        </div>
                        <div className="relative">
                           <label className="absolute -top-2.5 left-4 px-2 bg-[#FFFAF2] text-[10px] font-black text-gray-700  z-10">Zipcode</label>
                           <div className="flex bg-white rounded-xl border border-[#EE9C24]/30 px-3 py-3 items-center justify-between">
                              <input
                                 type="text"
                                 name="zipcode"
                                 placeholder="Enter your Number"
                                 value={formData.zipcode}
                                 onChange={handleChange}
                                 className="bg-transparent outline-none text-[11px] font-bold text-gray-700 w-full placeholder:text-gray-200"
                              />
                              <Image src="/editicon.png" alt="edit" width={12} height={12} className="opacity-40" />
                           </div>
                        </div>
                     </div>

                     <div className="relative">
                        <label className="absolute -top-2.5 left-4 px-2 bg-[#FFFAF2] text-[10px] font-black text-gray-700  z-10">Select Product</label>
                        <div className="flex bg-white rounded-xl border border-[#EE9C24]/30 px-3 py-3 items-center justify-between">
                           <input
                              type="text"
                              name="product"
                              placeholder="Select a Product"
                              value={formData.product}
                              onChange={handleChange}
                              className="bg-transparent outline-none text-[11px] font-bold text-gray-700 w-full placeholder:text-gray-200"
                           />
                           <Search size={14} className="text-gray-300" />
                        </div>
                     </div>

                     <div className="relative">
                        <label className="absolute -top-2.5 left-4 px-2 bg-[#FFFAF2] text-[10px] font-black text-gray-700  z-10">Message</label>
                        <div className="flex bg-white rounded-xl border border-[#EE9C24]/30 px-3 py-3 items-center justify-between">
                           <input
                              type="text"
                              name="message"
                              placeholder="Enter your Message"
                              value={formData.message}
                              onChange={handleChange}
                              className="bg-transparent outline-none text-[11px] font-bold text-gray-700 w-full placeholder:text-gray-200"
                           />
                           <Image src="/editicon.png" alt="edit" width={12} height={12} className="opacity-40" />
                        </div>
                     </div>

                     {/* Upload Mobile */}
                     <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center relative">
                        <input
                           type="file"
                           onChange={handleFileChange}
                           className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                        />
                        <span className="text-[11px] font-bold text-gray-400 mb-4">{resume ? resume.name : "Drag & drop Resume here or"}</span>
                        <button type="button" className="bg-[#EE9C24] text-white px-8 py-3 rounded-full text-[11px] font-black flex items-center gap-2 shadow-lg shadow-orange-100">
                           <CloudUpload size={16} />
                           {resume ? "File Added" : "Upload File"}
                        </button>
                     </div>

                     <div className="flex items-center gap-2 px-1">
                        <div className="w-4 h-4 rounded-md border-2 border-[#EE9C24] bg-[#EE9C24] flex items-center justify-center">
                           <Check size={10} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black text-gray-500">Save this information for next time</span>
                     </div>

                     <div className="flex gap-4 pt-4">
                        <button type="button" className="flex-1 py-4 border border-[#EE9C24] text-[#EE9C24] font-black text-[12px]  rounded-full">Cancel</button>
                        <button
                           type="button"
                           onClick={handleSubmit}
                           disabled={applyLoading}
                           className="flex-1 py-4 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white font-black text-[12px] rounded-full shadow-lg shadow-orange-100 disabled:opacity-50"
                        >
                           {applyLoading ? "..." : "Submit"}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>

         {/* ───── DESKTOP VIEW ───── */}
         <div className="hidden lg:block px-4 md:px-16 py-8 bg-white min-h-screen">
            {/* Breadcrumb */}
            <div className="text-sm font-medium text-gray-500 tracking-wider  mb-12">
               <Link href="/" className="hover:text-[#EE9C24] transition-colors">
                  HOME
               </Link>{" "}
               &gt;{" "}
               <Link href="/career" className="hover:text-[#EE9C24] transition-colors">
                  Career
               </Link>
            </div>

            {/* Title Section */}
            <div className="text-center mb-16">
               <div className="flex items-center justify-center">
                  <div className="h-[4px] w-20 sm:w-32 bg-[#EE9C24]"></div>
                  <h1 className="md:text-[2rem] sm:text-4xl font-black text-black px-6 tracking-wide ">
                     Career
                  </h1>
                  <div className="h-[4px] w-20 sm:w-32 bg-[#EE9C24]"></div>
               </div>
            </div>

            {/* Header content */}
            <div className="mb-10">
               <div className="inline-block relative mb-4">
                  <h2 className="md:text-[1.2rem] sm:text-2xl font-black text-gray-800 pb-2 ">
                     Work With us
                  </h2>
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#EE9C24]"></div>
               </div>
               <p className="text-gray-600 text-lg font-bold">
                  Be a Part Of our Mission And Organization
               </p>
            </div>

            {/* Details Wrapper */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] p-8 mb-12">
               <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-100/50 pb-6 mb-8 gap-4">
                  <div className="flex items-center gap-3">
                     <Info className="w-5 h-5 text-gray-600" />
                     <h3 className="font-black text-xl text-[#000000] tracking-wide capitalize">
                        {currentJob.title}
                     </h3>
                  </div>
                  <a href="#application-form" className="flex items-center gap-1 cursor-pointer group">
                     <span className="font-black text-[#000000] group-hover:text-[#EE9C24] transition-colors text-[18px]">
                        Apply Now
                     </span>
                     <ChevronRight className="w-5 h-5 text-[#000000] group-hover:text-[#EE9C24] transition-colors" />
                  </a>
               </div>

               <div className="space-y-8">
                  <div>
                     <h4 className="text-[#EE9C24] font-black text-lg mb-4 ">Job Description</h4>
                     <div className="space-y-2 text-gray-800 text-[16px] font-bold">
                        <p><span className="font-black text-gray-400 mr-2  ">Position:</span> {currentJob.title}</p>
                        <p><span className="font-black text-gray-400 mr-2  ">Employment Type:</span> <span className="capitalize">{currentJob.jobType}</span></p>
                        <p><span className="font-black text-gray-400 mr-2  ">Work Mode:</span> <span className="capitalize">{currentJob.workMode}</span></p>
                        <p><span className="font-black text-gray-400 mr-2  ">Location:</span> {currentJob.city}</p>
                     </div>
                  </div>

                  <div>
                     <h4 className="text-[#EE9C24] font-black text-lg mb-4 ">Role Overview</h4>
                     <p className="text-gray-600  text-[16px] font-bold">
                        {currentJob.roleOverview || currentJob.description}
                     </p>
                  </div>

                  {currentJob.responsibilities && (
                     <div>
                        <h4 className="text-[#EE9C24] font-black text-lg mb-4 ">Key Responsibilities</h4>
                        <ul className="list-disc list-outside ml-5 space-y-2 text-gray-600 text-[16px] font-bold">
                           {currentJob.responsibilities.map((resp: string, i: number) => (
                              <li key={i}>{resp}</li>
                           ))}
                        </ul>
                     </div>
                  )}
               </div>
            </div>

            {/* Form Section Desktop */}
            <div id="application-form" className="bg-[#FFF4E2] p-10 rounded-[48px] border border-orange-50">
               <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12">
                  <form className="space-y-8">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="relative">
                           <label className="absolute -top-3 left-6 px-2 bg-[#FFF4E2] text-xs font-black text-gray-600  z-10">First Name</label>
                           <div className="flex bg-white rounded-2xl border border-[#EE9C24]/30 px-5 py-4 shadow-sm items-center justify-between">
                              <input
                                 name="firstName"
                                 value={formData.firstName}
                                 onChange={handleChange}
                                 placeholder="Enter Your Name"
                                 className="bg-transparent outline-none font-bold text-gray-700 w-full"
                              />
                              <Image src="/editicon.png" alt="edit" width={18} height={18} />
                           </div>
                        </div>
                        <div className="relative">
                           <label className="absolute -top-3 left-6 px-2 bg-[#FFFAF2] text-xs font-black text-gray-600  z-10">Last Name</label>
                           <div className="flex bg-white rounded-2xl border border-[#EE9C24]/30 px-5 py-4 shadow-sm items-center justify-between">
                              <input
                                 name="lastName"
                                 value={formData.lastName}
                                 onChange={handleChange}
                                 placeholder="Enter Your Last Name"
                                 className="bg-transparent outline-none font-bold text-gray-700 w-full"
                              />
                              <Image src="/editicon.png" alt="edit" width={18} height={18} />
                           </div>
                        </div>
                     </div>

                     <div className="relative">
                        <label className="absolute -top-3 left-6 px-2 bg-[#FFFAF2] text-xs font-black text-gray-600  z-10">Phone Number</label>
                        <div className="flex bg-white rounded-2xl border border-[#EE9C24]/30 px-5 py-4 shadow-sm items-center justify-between">
                           <input
                              type="tel"
                              name="phone"
                              maxLength={10}
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="1234567890"
                              className="bg-transparent outline-none font-bold text-gray-700 w-full"
                           />
                           <Image src="/editicon.png" alt="edit" width={18} height={18} />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="relative">
                           <label className="absolute -top-3 left-6 px-2 bg-[#FFFAF2] text-xs font-black text-gray-600  z-10">Country</label>
                           <div className="flex bg-white rounded-2xl border border-[#EE9C24]/30 px-5 py-4 shadow-sm items-center justify-between">
                              <input
                                 name="country"
                                 placeholder="Select Country"
                                 defaultValue="India"
                                 className="bg-transparent outline-none font-bold text-gray-700 w-full"
                              />
                              <ChevronDown size={20} className="text-[#EE9C24]" />
                           </div>
                        </div>
                        <div className="relative">
                           <label className="absolute -top-3 left-6 px-2 bg-[#FFFAF2] text-xs font-black text-gray-600  z-10">State</label>
                           <div className="flex bg-white rounded-2xl border border-[#EE9C24]/30 px-5 py-4 shadow-sm items-center justify-between">
                              <input
                                 name="state"
                                 placeholder="Select State"
                                 defaultValue="Madhya Pradesh"
                                 className="bg-transparent outline-none font-bold text-gray-700 w-full"
                              />
                              <ChevronDown size={20} className="text-[#EE9C24]" />
                           </div>
                        </div>
                     </div>

                     <div className="relative">
                        <label className="absolute -top-3 left-6 px-2 bg-[#FFFAF2] text-xs font-black text-gray-600 z-10">Message</label>
                        <div className="flex bg-white rounded-2xl border border-[#EE9C24]/30 px-5 py-4 shadow-sm items-center justify-between">
                           <textarea
                              name="message"
                              value={formData.message}
                              onChange={handleChange}
                              placeholder="Enter Your Message"
                              rows={4}
                              className="bg-transparent outline-none font-bold text-gray-700 w-full resize-none"
                           ></textarea>
                           <Image src="/editicon.png" alt="edit" width={18} height={18} className="self-start" />
                        </div>
                     </div>

                     <div className="flex gap-6">
                        <button type="button" className="flex-1 py-4 rounded-full border-2 border-[#EE9C24] text-[#EE9C24] font-black  text-sm">Cancel</button>
                        <button
                           type="button"
                           onClick={handleSubmit}
                           disabled={applyLoading}
                           className="flex-1 py-4 rounded-full bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white font-black  text-sm shadow-xl shadow-orange-100"
                        >
                           {applyLoading ? "Sending..." : "Submit"}
                        </button>
                     </div>
                  </form>

                  <div className="flex flex-col justify-center">
                     <div className="border-2 border-dashed border-gray-300 rounded-[32px] p-12 bg-white flex flex-col items-center justify-center text-center relative group transition-all hover:border-[#EE9C24]">
                        <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <p className="text-gray-500 font-bold mb-6">{resume ? resume.name : "Drag & drop Resume here or"}</p>
                        <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white px-10 py-4 rounded-full font-black flex items-center gap-3 shadow-lg">
                           <CloudUpload size={24} />
                           Upload File
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </main>
   );
}
