"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { registerLoginUser, verifyOtp } from '@/redux/slices/authSlice';

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, otpInfo } = useSelector((state: RootState) => state.auth);

  const [step, setStep] = useState(1); // 1: Input, 2: Sending, 3: OTP, 4: Success
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [resendTimer, setResendTimer] = useState(30);
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Handle step transitions for demo
  useEffect(() => {
    if (step === 2) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep(3), 500);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    if (step === 3 || step === 4) {
      if (resendTimer > 0) {
        const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [step, resendTimer]);

  const handleContinue = async () => {
    if (step === 1) {
      if (phoneNumber.length === 10) {
        try {
          const resultAction = await dispatch(registerLoginUser({
            number: phoneNumber
          }));

          if (registerLoginUser.fulfilled.match(resultAction)) {
            setStep(2);
          }
        } catch (err) {
          console.error("Login failed:", err);
        }
      } else {
        alert("Please enter a valid 10-digit phone number.");
      }
    } else if (step === 3) {
      const otpValue = otp.join('');
      if (otpValue.length === 4) {
        try {
          const resultAction = await dispatch(verifyOtp({ number: phoneNumber, otp: otpValue }));
          if (verifyOtp.fulfilled.match(resultAction)) {
            setStep(4);
          }
        } catch (err) {
          console.error("OTP Verification failed:", err);
        }
      } else {
        alert("Please enter a valid 4-digit OTP.");
      }
    } else if (step === 4) {
      router.push('/');
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-12 md:pt-10 px-4 font-sans">
      {/* logo */}
      <div className="mb-6 md:mb-10">
        <Image
          src="/dsmlogo.png"
          alt="DSM ELECTRO"
          width={450}
          height={150}
          className="w-[200px] md:w-[250px] h-auto object-contain"
          priority
          unoptimized
        />
      </div>

      <div className="w-full max-w-[580px] flex flex-col items-center">
        {/* SMALL LOG IN TEXT */}
        <span className="text-[#191919] text-[10px] md:text-[12px] font-medium tracking-[0.15em] mb-4">
          LOG IN
        </span>

        {/* OTP VERIFICATION TITLE */}
        <h1 className="text-[#323232] text-[24px] md:text-[24px] font-bold mb-4">
          OTP Verification
        </h1>

        {/* SUBTITLE */}
        <p className="text-[#B6B6B6] text-center text-[13px] md:text-[1.1rem] mb-8 font-medium">
          Enter phone number to send one time Password On SMS
        </p>



        {/* PHONE NUMBER FIELD */}
        <div className="w-full mb-8 relative">
          <div className="relative group">
            <div 
              className="absolute inset-0 rounded-[12px] p-[1.5px]" 
              style={{ 
                background: 'linear-gradient(to right, #F59E0B, #D97706, #B45309)' 
              }}
            >
              <div className="w-full h-full bg-white rounded-[10.5px]" />
            </div>

            <div className="absolute -top-[12px] left-10 z-20 px-2 bg-white">
              <span className="text-[14px] md:text-[15px] font-medium text-[#333] tracking-tight">
                Phone Number
              </span>
            </div>

            <div className="relative flex items-center px-8 h-[70px]">
              <div className="flex items-center w-full">
                {step > 1 && <span className="text-[18px] text-[#333] mr-1">+91</span>}
                <input 
                  type="text" 
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => {
                    if (step === 1) {
                      setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''));
                    }
                  }}
                  readOnly={step > 1}
                  placeholder="Enter Your Number"
                  className="w-full bg-transparent outline-none text-[18px] text-[#333] placeholder:text-[#B6B6B6] font-medium"
                />
              </div>
              <div className="text-[#AAA] ml-2 cursor-pointer" onClick={() => setStep(1)}>
               <Image src="/editicon.png" alt="edit" width={22} height={22} />
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: OTP SENDING */}
        {step === 2 && (
          <div className="w-full flex flex-col items-center mb-10 overflow-hidden">
            <span className="text-[#333] font-bold text-sm md:text-base mb-6">OTP Sending</span>
            <div className="w-full h-[6px] bg-[#E8E8E8] rounded-full relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#E47B25] to-[#B3520A] transition-all duration-100 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 3 & 4: ENTER OTP */}
        {(step === 3 || step === 4) && (
          <div className="w-full flex flex-col items-center mb-8">
            <span className="text-[#333] font-bold text-sm md:text-base mb-2 tracking-wide">Enter OTP</span>
            {otpInfo && (
              <span className="text-[#EE9C24] text-xs mb-4 font-bold animate-pulse">
                Debug Mode: Your OTP is {otpInfo.code}
              </span>
            )}
            <div className="flex gap-4 md:gap-6 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="relative w-16 h-16 md:w-20 md:h-20">
                   <div 
                    className="absolute inset-0 rounded-[12px] p-[1.5px]" 
                    style={{ background: 'linear-gradient(to bottom, #F59E0B, #D97706, #B45309)' }}
                  >
                    <div className="w-full h-full bg-white rounded-[10.5px]" />
                  </div>
                  <input 
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text" 
                    maxLength={1}
                    value={otp[i]}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className="relative z-10 w-full h-full bg-transparent text-center text-xl md:text-2xl font-bold text-[#333] outline-none"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-1.5 text-sm md:text-base font-bold text-[#333]">
              <span>OTP Resend In {resendTimer} Sec</span>
              <button className="text-[#DE7420] hover:underline cursor-pointer">Resend</button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS BANNER */}
        {step === 4 && (
          <div className="w-full mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#D9F9E2] border-l-[6px] border-[#4ADE80] rounded-xl px-6 py-5 flex items-center gap-4">
              <div className="w-6 h-6 bg-[#22C55E] rounded-full flex items-center justify-center text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="text-[#15803D] font-black text-xl">Success</span>
                <span className="text-[#15803D] font-medium text-sm md:text-base opacity-80 mt-0.5">Your Data Save SuccessFully</span>
              </div>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="w-full mb-4 text-red-500 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {/* CONTINUE BUTTON */}
        <button 
          onClick={handleContinue}
          disabled={loading}
          className="md:mb-20 w-full h-[75px] md:h-[85px] rounded-[50px] text-white font-bold text-[18px] md:text-[22px] transition-all hover:opacity-95 shadow-lg shadow-[#EE9C24]/20 flex items-center justify-center cursor-pointer active:scale-[0.98] disabled:opacity-50"
          style={{ 
            background: 'linear-gradient(to right, #DE7420, #C25C13)' 
          }}
        >
          {loading ? 'Processing...' : 'Continue'}
        </button>

        {/* Mobile-only Login Illustration */}
        <div className="md:hidden mt-8 w-full flex justify-center pb-6">
          <Image 
            src="/loginimg.png" 
            alt="Login Illustration" 
            width={400} 
            height={400} 
            className="w-full  h-auto object-contain transition-all duration-700 animate-in fade-in zoom-in-95" 
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
