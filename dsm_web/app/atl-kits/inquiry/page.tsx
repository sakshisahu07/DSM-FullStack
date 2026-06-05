"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { createAtlInquiry, resetSuccess } from '@/redux/slices/atlSlice';
import { Pencil, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AtlInquiryPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { submitting, success, error } = useSelector((state: RootState) => state.atl);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    schoolName: '',
    city: '',
    areaSqFt: '',
    budgetRange: '',
    message: '',
  });

  const [saveInfo, setSaveInfo] = useState(false);

  useEffect(() => {
    if (success) {
      toast.success('Inquiry submitted successfully!');
      dispatch(resetSuccess());
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        schoolName: '',
        city: '',
        areaSqFt: '',
        budgetRange: '',
        message: '',
      });
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.phone || !formData.schoolName || !formData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    const submissionData = {
      ...formData,
      areaSqFt: formData.areaSqFt ? Number(formData.areaSqFt) : 0,
    };

    // Only send non-empty fields to avoid potential "null/undefined" errors on API
    const finalData: any = {};
    Object.entries(submissionData).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        finalData[key] = value;
      }
    });

    dispatch(createAtlInquiry(finalData));
  };

  return (
    <main className="min-h-screen bg-white py-12 px-6 md:px-12 lg:px-24 font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-lg font-medium text-gray-800 ">ATL Setup Inquiry</h1>
          <p className="text-[#EE9C24] font-medium text-md ">Request For ATL Setup Inquiry</p>
          <div className="w-full h-[1px] bg-gradient-to-r from-[#EE9C24] to-[#B8420E] mt-6 mb-8 max-w-[1200px] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="relative group">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-[16px] font-medium text-[#333333] group-focus-within:text-[#EE9C24] transition-colors">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter Your Name"
                  className="w-full border border-[#EE9C24] rounded-[8px] px-4 py-4  text-[16px] focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-[#999999]"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="relative group">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-[16px] font-medium text-[#333333] group-focus-within:text-[#EE9C24] transition-colors">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter Your Name"
                  className="w-full border border-[#EE9C24] rounded-[8px] px-4 py-4  text-[16px] focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-[#999999]"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="relative group">
              <label className="absolute -top-2.5 left-4 z-10 bg-white px-2 text-[16px] font-medium text-[#333333] group-focus-within:text-[#EE9C24] transition-colors">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter Your Number"
                  maxLength={10}
                  className="w-full border border-[#EE9C24] rounded-[8px] pl-4 pr-12 py-4 text-[16px] focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-[#999999]"
                  required
                />
                <Image src="/editicon.png" alt="edit icon" width={24} height={24} className="absolute right-4 top-4 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* School Name */}
              <div className="relative group">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-[16px] font-medium text-[#333333] group-focus-within:text-[#EE9C24] transition-colors">
                  School Name
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  placeholder="Enter School Name"
                  className="w-full border border-[#EE9C24] rounded-[8px] px-4 py-4 text-[16px] focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-[#999999]"
                  required
                />
              </div>

              {/* City */}
              <div className="relative group">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-[16px] font-medium text-[#333333] group-focus-within:text-[#EE9C24] transition-colors">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter City"
                  className="w-full border border-[#EE9C24] rounded-[8px] px-4 py-4 text-[16px] focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-[#999999]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Available Area */}
              <div className="relative group">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-[16px] font-medium text-[#333333] group-focus-within:text-[#EE9C24] transition-colors">
                  Available Area (sq ft)
                </label>
                <input
                  type="number"
                  name="areaSqFt"
                  value={formData.areaSqFt}
                  onChange={handleChange}
                  placeholder="Enter Area"
                  className="w-full border border-[#EE9C24] rounded-[8px] px-4 py-4 text-[16px] focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-[#999999]"
                />
              </div>

              {/* Budget Range */}
              <div className="relative group">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-[16px] font-medium text-[#333333] group-focus-within:text-[#EE9C24] transition-colors">
                  Budget Range
                </label>
                <input
                  type="text"
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  placeholder="Enter Budget"
                  className="w-full border border-[#EE9C24] rounded-[8px] px-4 py-4 text-[16px] focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-[#999999]"
                />
              </div>
            </div>

            {/* Message */}
            <div className="relative group">
              <label className="absolute -top-2.5 left-4 z-10 bg-white px-2 text-[16px] font-medium text-[#333333] group-focus-within:text-[#EE9C24] transition-colors">
                Message
              </label>
              <div className="relative">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter Your Message"
                  rows={5}
                  className="w-full border border-[#EE9C24] rounded-[8px] pl-4 pr-12 py-4 text-[16px] focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-[#999999] resize-none"
                ></textarea>
                <Image src="/editicon.png" alt="edit icon" width={24} height={24} className="absolute right-4 top-4 cursor-pointer" />
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="saveInfo"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#EE9C24] focus:ring-[#EE9C24] cursor-pointer"
              />
              <label htmlFor="saveInfo" className="text-[142x] font-medium text-[#333333] cursor-pointer">
                Save this information for next time
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 ">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 px-6 border border-[#EE9C24] text-[#EE9C24] rounded-full hover:bg-orange-50 transition-colors  text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white  rounded-full shadow-lg hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  'Get Budget Plan'
                )}
              </button>
            </div>
          </form>

          {/* Right Side Illustration */}
          <div className="hidden lg:flex justify-center items-end relative h-full min-h-[600px] pb-10">
             {/* Background Shape */}
             <div className=""></div>
             
             <div className="">
                <Image 
                    src="/inquiryy.png" 
                    alt="ATL Setup" 
                    fill 
                    className=""
                    priority
                />
             </div>
          </div>

        </div>
      </div>
    </main>
  );
}
