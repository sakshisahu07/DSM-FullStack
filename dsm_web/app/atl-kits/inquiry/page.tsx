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
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">ATL Setup Inquiry</h1>
          <p className="text-[#EE9C24] font-bold text-sm uppercase tracking-wide">Request For ATL Setup Inquiry</p>
          <div className="w-full h-px bg-gray-100 mt-6 max-w-4xl mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="relative group">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-bold text-gray-400 group-focus-within:text-[#EE9C24] transition-colors">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter Your Name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 text-sm focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-gray-300"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="relative group">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-bold text-gray-400 group-focus-within:text-[#EE9C24] transition-colors">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter Your Name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 text-sm focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="relative group">
              <label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-bold text-gray-400 group-focus-within:text-[#EE9C24] transition-colors">
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 text-sm focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-gray-300"
                  required
                />
                <Pencil size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#EE9C24]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* School Name */}
              <div className="relative group">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-bold text-gray-400 group-focus-within:text-[#EE9C24] transition-colors">
                  School Name
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  placeholder="Enter School Name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 text-sm focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-gray-300"
                  required
                />
              </div>

              {/* City */}
              <div className="relative group">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-bold text-gray-400 group-focus-within:text-[#EE9C24] transition-colors">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter City"
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 text-sm focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-gray-300"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Available Area */}
              <div className="relative group">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-bold text-gray-400 group-focus-within:text-[#EE9C24] transition-colors">
                  Available Area (sq ft)
                </label>
                <input
                  type="number"
                  name="areaSqFt"
                  value={formData.areaSqFt}
                  onChange={handleChange}
                  placeholder="Enter Area"
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 text-sm focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              {/* Budget Range */}
              <div className="relative group">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-bold text-gray-400 group-focus-within:text-[#EE9C24] transition-colors">
                  Budget Range
                </label>
                <input
                  type="text"
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  placeholder="Enter Budget"
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 text-sm focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Message */}
            <div className="relative group">
              <label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-bold text-gray-400 group-focus-within:text-[#EE9C24] transition-colors">
                Message
              </label>
              <div className="relative">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter Your Message"
                  rows={5}
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 text-sm focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-gray-300 resize-none"
                ></textarea>
                <Pencil size={18} className="absolute right-4 top-4 text-gray-300 group-focus-within:text-[#EE9C24]" />
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
              <label htmlFor="saveInfo" className="text-sm font-bold text-gray-400 cursor-pointer">
                Save this information for next time
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-4 px-6 border border-[#EE9C24] text-[#EE9C24] font-black rounded-full hover:bg-orange-50 transition-colors uppercase tracking-tight text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white font-black rounded-full shadow-lg hover:opacity-90 transition-opacity uppercase tracking-tight text-sm flex items-center justify-center gap-2"
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
          <div className="hidden lg:flex justify-center items-center relative h-full min-h-[600px]">
             {/* Background Shape */}
             <div className="absolute w-[110%] h-[80%] bg-[#EE9C24] rounded-[60px_120px_40px_180px] -z-10 translate-x-10 rotate-3 opacity-90"></div>
             
             <div className="relative w-full aspect-square max-w-lg">
                <Image 
                    src="/atl_inquiry_girl.png" 
                    alt="ATL Setup" 
                    fill 
                    className="object-contain transform scale-110 -translate-y-10"
                    priority
                />
             </div>
          </div>

        </div>
      </div>
    </main>
  );
}
