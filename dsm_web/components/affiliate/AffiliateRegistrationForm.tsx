"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { sendAffiliateOtp, registerAffiliate, verifyAffiliateOtp, resetAffiliateState } from '@/redux/slices/affiliateSlice';
import { Pencil, Loader2, CreditCard, ChevronLeft, Calendar, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const FloatingInput = ({ label, placeholder, type = "text", value, name, icon: Icon = Pencil, optional = false, onChange }: any) => (
  <div className="relative group mt-6">
    <label className="absolute -top-2.5 left-4 bg-white px-2 text-[12px] font-bold text-gray-500 group-focus-within:text-[#EE9C24] transition-colors z-10">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Enter Your Value"}
        className="w-full border border-[#F3C49B] rounded-xl px-4 py-3.5 text-[14px] focus:border-[#EE9C24] focus:ring-1 focus:ring-[#EE9C24] outline-none transition-all placeholder:text-gray-300"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EE9C24]">
          <Icon size={18} />
      </div>
    </div>
  </div>
);

interface AffiliateRegistrationFormProps {
  initialView?: 'landing' | 'registration' | 'success';
  isAlreadyReview?: boolean;
}

export default function AffiliateRegistrationForm({ 
  initialView = 'landing', 
  isAlreadyReview: externalIsAlreadyReview = false 
}: AffiliateRegistrationFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error, otpSent } = useSelector((state: RootState) => state.affiliate);
  const { user } = useSelector((state: RootState) => state.auth);

  const [view, setView] = useState<'landing' | 'registration' | 'success'>(initialView);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [currentKycStep, setCurrentKycStep] = useState(1);
  const [panImage, setPanImage] = useState<File | null>(null);
  const [panPreview, setPanPreview] = useState<string | null>(null);
  const [adharImage, setAdharImage] = useState<File | null>(null);
  const [adharPreview, setAdharPreview] = useState<string | null>(null);
  const [isAlreadyReview, setIsAlreadyReview] = useState(externalIsAlreadyReview);

  const [prevInitialView, setPrevInitialView] = useState(initialView);

  // Sync the view state when the parent passes a new initialView
  // (e.g., when dashboard detects OTP was verified and passes 'registration')
  useEffect(() => {
    if (initialView !== prevInitialView) {
      setView(initialView);
      setPrevInitialView(initialView);
    }
    if (externalIsAlreadyReview !== isAlreadyReview) {
      setIsAlreadyReview(externalIsAlreadyReview);
    }
  }, [initialView, prevInitialView, externalIsAlreadyReview, isAlreadyReview]);

  // On mount, always sync initialView (handles case where initialView is 'registration' from the start)
  useEffect(() => {
    setView(initialView);
    setPrevInitialView(initialView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Form State — pre-filled with TEST DATA (remove before production)
  const [formData, setFormData] = useState({
    firstName: 'Test',
    lastName: 'User',
    phone: user?.number || user?.phone || '',
    email: 'testuser@example.com',
    dob: '1995-06-15',
    gender: 'male',
    gst: '',
    company: 'Test Company Pvt Ltd',
    accountNumber: '123456789012',
    ifsc: 'SBIN0001234',
    pan: 'ABCDE1234F',
    adhar: '123456789012',
  });

  // NOTE: Individual action handlers (handleVerifyOtp, handleFinalSubmit) show
  // their own toast.error — do NOT add a generic error useEffect here or toasts
  // will fire multiple times on every re-render.

  const handleSendOtp = () => {
    if (phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    dispatch(sendAffiliateOtp(phoneNumber));
    setFormData(prev => ({ ...prev, phone: phoneNumber }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'phoneNumber' | 'phone') => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    if (field === 'phoneNumber') setPhoneNumber(value);
    else setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length === 4) {
      const result = await dispatch(verifyAffiliateOtp({ phone: phoneNumber, otp: code }));
      if (verifyAffiliateOtp.fulfilled.match(result)) {
        toast.success("OTP verified successfully!");
        // Pre-fill phone in the registration form from the verified phone
        setFormData(prev => ({ ...prev, phone: phoneNumber }));
        setView('registration');
      } else {
        toast.error(result.payload as string || "Invalid OTP or verification failed");
      }
    } else {
      toast.error("Please enter the complete 4-digit OTP");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pan' | 'adhar') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'pan') {
        setPanImage(file);
        setPanPreview(URL.createObjectURL(file));
      } else {
        setAdharImage(file);
        setAdharPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleFinalSubmit = async () => {
    if (!panImage) {
      toast.error("Please upload your PAN card photo");
      return;
    }
    if (!adharImage) {
      toast.error("Please upload your Aadhar card photo");
      return;
    }
    if (!formData.adhar || formData.adhar.length !== 12) {
      toast.error("Please enter a valid 12-digit Aadhar number");
      return;
    }

    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    // Always use the phone from formData which is pre-filled from user profile
    data.append('phone', formData.phone);
    data.append('email', formData.email);
    data.append('panNumber', formData.pan.toUpperCase().trim());
    data.append('adharNumber', formData.adhar);
    data.append('accountNumber', formData.accountNumber);
    data.append('ifscCode', formData.ifsc.toUpperCase().trim());
    data.append('accountHolder', `${formData.firstName} ${formData.lastName}`);
    data.append('panImage', panImage);
    data.append('adharImage', adharImage);

    const result = await dispatch(registerAffiliate(data));
    if (registerAffiliate.fulfilled.match(result)) {
      toast.success("Affiliate application submitted successfully!");
      setView('success');
    } else if (registerAffiliate.rejected.match(result)) {
      const errorMessage = result.payload as string;
      // Always show the actual backend error message
      toast.error(errorMessage || "Registration failed. Please check your details.");
      if (errorMessage === "Your application is already under review") {
        setIsAlreadyReview(true);
        setView('success');
      }
    }
  };

  const desktopSteps = ["Personal Details", "Bank Details", "Review Deatils"];
  const mobileSteps = ["Personal Details", "Identity", "Review"];

  return (
    <div className="w-full">
      {/* ───── LANDING VIEW ───── */}
      {view === 'landing' && (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-4 md:gap-10 mb-8 w-full justify-center">
            <div className="h-[3px] w-12 md:w-32 bg-[#B8420E] rounded-full" />
            <h1 className="text-xl md:text-3xl font-medium text-[#000000] text-center">Become a DSM Affiliate</h1>
            <div className="h-[3px] w-12 md:w-32 bg-[#B8420E] rounded-full" />
          </div>

          <div className="text-center max-w-5xl space-y-6 mb-12 px-4">
            <p className="text-[14px] md:text-2xl font-bold text-[#333333] leading-tight">
              Earn commission by promoting quality electronics, robotics, and educational products.
            </p>
          </div>

          {/* ... Phone & OTP Card ... */}
          <div id="auth-section" className="w-full max-w-3xl bg-white rounded-[40px] md:rounded-[48px] p-6 md:p-12 border border-gray-100 shadow-sm">
             <div className="space-y-6 md:space-y-8">
                <div className="relative group">
                  <label className="absolute -top-2.5 left-6 bg-white px-3 text-[12px] md:text-[14px] font-black text-gray-800 z-10">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      placeholder="Enter Your Number" 
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e, 'phoneNumber')}
                      className="w-full border border-gray-200 rounded-xl md:rounded-2xl px-4 md:px-6 py-4 md:py-5 text-sm md:text-lg outline-none focus:border-[#EE9C24] transition-all"
                    />
                    <Pencil size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
                </div>

                <div className="text-center py-2">
                   <p className="text-xs font-black text-gray-800 mb-3 ">OTP Sending</p>
                   <div className="w-full max-w-sm mx-auto h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-[#EE9C24] rounded-full transition-all duration-700 ${otpSent ? 'w-full' : 'w-[45%]'}`} />
                   </div>
                </div>

                <div className="text-center">
                  <p className="text-xs md:text-base font-black text-gray-800 mb-4">Enter OTP</p>
                  <div className="flex justify-center gap-3 md:gap-6 mb-6">
                    {otp.map((digit, idx) => (
                      <input 
                        key={idx} 
                        id={`otp-${idx}`}
                        type="text" 
                        maxLength={1} 
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-12 h-12 md:w-20 md:h-20 border border-gray-200 rounded-xl md:rounded-2xl text-center font-black text-lg md:text-2xl outline-none focus:border-[#EE9C24]"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 md:gap-6 pt-4">
                  <button className="flex-1 py-4 md:py-5 border-2 border-[#EE9C24] text-[#EE9C24] font-black rounded-full text-sm md:text-lg shadow-sm" onClick={() => { setOtp(['', '', '', '']); setPhoneNumber(''); }}>Reset</button>
                  <button onClick={otpSent ? handleVerifyOtp : handleSendOtp} className="flex-1 py-4 md:py-5 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white font-black rounded-full text-sm md:text-lg shadow-lg flex items-center justify-center">
                    {loading ? <Loader2 className="animate-spin" /> : 'Submit'}
                  </button>
                </div>
              </div>
          </div>
        </div>
      )}

      {/* ───── REGISTRATION VIEW ───── */}
      {view === 'registration' && (
        <div className="w-full">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[2px] w-12 bg-[#B8420E] rounded-full" />
            <h1 className="text-xl font-black text-gray-800 tracking-tight text-center">Register Yourself</h1>
            <div className="h-[2px] w-12 bg-[#B8420E] rounded-full" />
          </div>

          <div className="max-w-xl mx-auto mb-10 px-4 mt-6 ">
            <div className="relative flex items-center justify-between w-full max-w-2xl mx-auto">
               {(typeof window !== 'undefined' && window.innerWidth > 768 ? desktopSteps : mobileSteps).map((step, idx) => (
                 <div key={idx} className="flex flex-col items-center gap-2">
                   <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${currentKycStep >= idx + 1 ? 'bg-[#EE9C24] border-[#EE9C24]' : 'bg-gray-100 border-gray-100'}`}>
                      {currentKycStep >= idx + 1 && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                   </div>
                   <span className={`text-[10px] md:text-[12px] font-bold ${currentKycStep === idx + 1 ? 'text-[#EE9C24]' : 'text-gray-400'}`}>
                      {step}
                   </span>
                 </div>
               ))}
            </div>
          </div>

          <div className="max-w-xl mx-auto">
            {currentKycStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingInput label="First Name" value={formData.firstName} onChange={(e: any) => setFormData({...formData, firstName: e.target.value})} />
                  <FloatingInput label="Last Name" value={formData.lastName} onChange={(e: any) => setFormData({...formData, lastName: e.target.value})} />
                </div>
                {/* Phone is readonly — verified via Auth */}
                <div className="relative group mt-6">
                  <label className="absolute -top-2.5 left-4 bg-white px-2 text-[12px] font-bold text-gray-500 z-10">
                    Phone Number <span className="text-green-500 text-[10px] font-bold ml-1">✓ Verified</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    readOnly
                    className="w-full border border-green-300 bg-green-50 rounded-xl px-4 py-3.5 text-[14px] outline-none text-gray-600 cursor-not-allowed"
                  />
                </div>
                <FloatingInput label="Email Address" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} />
                <FloatingInput label="Date Of Birth" placeholder="YYYY-MM-DD" icon={Calendar} value={formData.dob} onChange={(e: any) => setFormData({...formData, dob: e.target.value})} />
                
                <div className="flex gap-6 pt-12">
                  <button onClick={() => setView('landing')} className="flex-1 py-3.5 border-2 border-[#EE9C24] text-[#EE9C24] font-black rounded-full text-sm">Back</button>
                  <button onClick={() => setCurrentKycStep(2)} className="flex-1 py-3.5 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white font-black rounded-full text-sm">Continue</button>
                </div>
              </div>
            )}

            {currentKycStep === 2 && (
              <div className="space-y-4">
                <FloatingInput label="Account Number" value={formData.accountNumber} onChange={(e: any) => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 18)})} />
                <FloatingInput label="IFSC Code" value={formData.ifsc} onChange={(e: any) => setFormData({...formData, ifsc: e.target.value.toUpperCase().trim()})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingInput label="PAN Card Number" value={formData.pan} onChange={(e: any) => setFormData({...formData, pan: e.target.value.toUpperCase().trim()})} />
                  <FloatingInput label="Aadhar Card Number" value={formData.adhar} onChange={(e: any) => setFormData({...formData, adhar: e.target.value.replace(/\D/g, '').slice(0, 12)})} />
                </div>

                <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <p className="text-sm font-black text-gray-800">Pan Card photo</p>
                     <div className="border-2 border-dashed border-[#F3C49B] rounded-2xl bg-[#EE9C24]/5 p-6 flex flex-col items-center justify-center aspect-video relative overflow-hidden">
                        {panPreview && <Image src={panPreview} alt="" fill className="object-cover opacity-40" />}
                        <input type="file" id="pan-up" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'pan')} />
                        <button onClick={() => document.getElementById('pan-up')?.click()} className="bg-[#EE9C24] text-white px-6 py-2 rounded-full font-bold text-xs relative z-10"><UploadCloud size={14} className="inline mr-1"/> Upload</button>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <p className="text-sm font-black text-gray-800">Aadhar Card photo</p>
                     <div className="border-2 border-dashed border-[#F3C49B] rounded-2xl bg-[#EE9C24]/5 p-6 flex flex-col items-center justify-center aspect-video relative overflow-hidden">
                        {adharPreview && <Image src={adharPreview} alt="" fill className="object-cover opacity-40" />}
                        <input type="file" id="adhar-up" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'adhar')} />
                        <button onClick={() => document.getElementById('adhar-up')?.click()} className="bg-[#EE9C24] text-white px-6 py-2 rounded-full font-bold text-xs relative z-10"><UploadCloud size={14} className="inline mr-1"/> Upload</button>
                     </div>
                   </div>
                </div>

                <div className="flex gap-6 pt-12">
                  <button onClick={() => setCurrentKycStep(1)} className="flex-1 py-3.5 border-2 border-[#EE9C24] text-[#EE9C24] font-black rounded-full text-sm">Back</button>
                  <button onClick={() => setCurrentKycStep(3)} className="flex-1 py-3.5 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white font-black rounded-full text-sm">Continue</button>
                </div>
              </div>
            )}

            {currentKycStep === 3 && (
              <div className="space-y-6">
                <div className="bg-white border border-[#EE9C24]/20 rounded-2xl p-6 shadow-sm">
                   <h3 className="font-black text-gray-800 mb-4">Review Details</h3>
                   <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-gray-400 text-xs">Name</p><p className="font-bold">{formData.firstName} {formData.lastName}</p></div>
                      <div><p className="text-gray-400 text-xs">Email</p><p className="font-bold">{formData.email}</p></div>
                      <div><p className="text-gray-400 text-xs">Account</p><p className="font-bold">{formData.accountNumber}</p></div>
                      <div><p className="text-gray-400 text-xs">IFSC</p><p className="font-bold">{formData.ifsc}</p></div>
                      <div><p className="text-gray-400 text-xs">PAN</p><p className="font-bold">{formData.pan}</p></div>
                      <div><p className="text-gray-400 text-xs">Aadhar</p><p className="font-bold">{formData.adhar}</p></div>
                   </div>
                </div>
                <button 
                  onClick={handleFinalSubmit} 
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white font-black rounded-full shadow-lg flex items-center justify-center"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Confirm & Submit'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'success' && (
        <div className="text-center py-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[#34A853] text-2xl font-black mb-2">{isAlreadyReview ? 'Under Review' : 'Application Submitted!'}</h2>
          <p className="text-gray-500 mb-2 font-medium">Your affiliate application has been received.</p>
          <p className="text-gray-400 text-sm mb-8">Our team will review your KYC documents and notify you once approved.</p>
          <button 
            onClick={() => router.push('/affiliate-dashboard')} 
            className="px-10 py-3 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white font-bold rounded-full shadow-md"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
