"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, ChevronDown, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { registerLoginUser, verifyOtp } from "@/redux/slices/authSlice";
import { submitBulkInquiry, resetInquiryStatus, fetchCities } from "@/redux/slices/bulkInquirySlice";

export default function BulkInquiryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading: authLoading, error: authError, otpInfo, user, token } = useSelector((state: RootState) => state.auth);
  const { loading: inquiryLoading, error: inquiryError, success: inquirySuccess, cities } = useSelector((state: RootState) => state.bulkInquiry);

  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [countryName, setCountryName] = useState("");
  const [message, setMessage] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [resendTimer, setResendTimer] = useState(30);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (token) {
      console.log("BulkInquiryPage mounted, dispatching fetchCities with token:", token);
      dispatch(fetchCities(token));
    } else {
      // If no token from state, try localStorage
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (localToken) {
        console.log("BulkInquiryPage mounted, dispatching fetchCities with localToken:", localToken);
        dispatch(fetchCities(localToken));
      } else {
        console.log("No token available yet to fetch cities.");
      }
    }
  }, [dispatch, token]);

  console.log("Current cities in state:", cities);

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );
  console.log("Filtered cities list:", filteredCities);

  // Sample products based on user's examples
  const availableProducts = [
    { id: "69c77f35278095a2c660f1cb", name: "Bluetooth Module", category: "Communication", image: "/bluetooth.png" },
    { id: "69c780ec1bb7552fbf1b7caf", name: "Arduino Uno", category: "Microcontrollers", image: "/arduino.png" },
    { id: "69c781a11bb7552fbf1b7cb5", name: "Ultrasonic Sensor", category: "Sensors", image: "/sensor.png" },
  ];

  const filteredProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  useEffect(() => {
    if (isOtpMode && loadingProgress < 100) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) return 100;
          return prev + 5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isOtpMode, loadingProgress]);

  useEffect(() => {
    if (isOtpMode && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOtpMode, resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Proceed with registration/login to trigger OTP
    if (!phoneNumber || !phoneNumber.match(/^\d{10}$/)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      const resultAction = await dispatch(registerLoginUser({
        number: phoneNumber,
        firstName,
        lastName
      }));

      if (registerLoginUser.fulfilled.match(resultAction)) {
        setIsOtpMode(true);
        setLoadingProgress(0);
        setResendTimer(30);
      }
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }

    // Check if fully entered
    if (newOtp.every(v => v !== '')) {
      handleFinalSubmit(newOtp.join(''));
    }
  };

  const handleFinalSubmit = async (otpValue: string, existingToken?: string, existingUser?: any) => {
    try {
      let finalToken = existingToken;
      let finalUser = existingUser;

      // Check localStorage if state is empty
      if (!finalToken && typeof window !== 'undefined') {
        const localToken = localStorage.getItem('token');
        if (localToken) {
          console.log("Using token from localStorage:", localToken);
          finalToken = localToken;
          finalUser = JSON.parse(localStorage.getItem('user') || 'null');
        }
      }

      // 1. If no existing token, verify OTP to get it
      if (!finalToken) {
        console.log("No token found, verifying OTP...");
        const otpActionResult = await dispatch(verifyOtp({ number: phoneNumber, otp: otpValue }));

        if (verifyOtp.fulfilled.match(otpActionResult)) {
          finalToken = otpActionResult.payload.data?.token || otpActionResult.payload.token;
          finalUser = otpActionResult.payload.data;

          if (typeof window !== 'undefined' && finalToken) {
            localStorage.setItem('token', finalToken);
            localStorage.setItem('user', JSON.stringify(finalUser));
          }

          // Re-fetch cities now that we have a valid token
          dispatch(fetchCities(finalToken || null));
        } else {
          alert("Unauthorized: Please verify your phone number to get a valid token.");
          return;
        }
      }

      if (!finalToken) {
        alert("Unauthorized: Login required. Please enter your phone number.");
        return;
      }

      if (finalToken) {
        const userId = finalUser?.id || finalUser?._id || "69be6399fad67c5bc38c88a9";

        const inquiryData = {
          userId,
          number: phoneNumber || finalUser?.number || "",
          products: selectedProducts.length > 0 ? selectedProducts.map(p => p.id) : ["69c77f35278095a2c660f1cb"],
          country: selectedCountryId || "69c389b43f5fc953412718a0",
          state: selectedStateId || "69c39e01202240d9f7d0a17a",
          city: selectedCityId || "69c4cdf989423fb1b9fceded",
          pincode: zipCode || "69c4cea289423fb1b9fcedf5",
          message: message || "I am interested in these products",
        };

        console.log("Submitting inquiry with token:", finalToken);
        const result = await dispatch(submitBulkInquiry({ inquiryData, token: finalToken }));

        if (submitBulkInquiry.fulfilled.match(result)) {
          alert("Inquiry submitted successfully!");
          setIsOtpMode(false);
          setOtp(['', '', '', '']);
        }
      }
    } catch (err) {
      console.error("Final submission failed:", err);
    }
  };

  const toggleProduct = (product: any) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Desktop View */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm font-medium text-gray-500 mb-8 tracking-wider ">
          <Link href="/" className="hover:text-[#EE9C24] transition-colors">
            HOME
          </Link>{" "}
          &gt;{" "}
          <span className="text-[#EE9C24]">BULK INQUIRY</span>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-[1.2rem] font-bold text-gray-800 tracking-wide">
            Bulk Inquiry
          </h1>
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            <h2 className="border-b w-full text-[#EE9C24] font-medium px-4 whitespace-nowrap text-lg">
              Request For Bulk Inquiry(Quotation)
            </h2>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Form */}
          <div className="bg-white rounded-xl shadow-[0_0px_20px_rgba(0,0,0,0.05)] p-6 sm:p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* First Name */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 z-10 bg-white px-2 text-sm font-semibold text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter First Name"
                    className="w-full border-2 border-[#EE9C24]/30 rounded-lg p-4 outline-none focus:border-[#EE9C24] text-gray-600 placeholder-gray-400 font-medium transition-colors relative z-0"
                  />
                </div>

                {/* Last Name */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 z-10 bg-white px-2 text-sm font-semibold text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter Last Name"
                    className="w-full border-2 border-[#EE9C24]/30 rounded-lg p-4 outline-none focus:border-[#EE9C24] text-gray-600 placeholder-gray-400 font-medium transition-colors relative z-0"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="relative">
                <label className="absolute -top-3 left-4 z-10 bg-white px-2 text-sm font-semibold text-gray-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter Your Number"
                  className="w-full border-2 border-[#EE9C24]/30 rounded-lg p-4 pr-12 outline-none focus:border-[#EE9C24] text-gray-600 placeholder-gray-400 font-medium transition-colors relative z-0"
                />
                <Image src="/editicon.png" alt="edit" width={20} height={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer z-10" />
              </div>

              {/* OTP Section (Conditionally Rendered) */}
              {isOtpMode && (
                <div className="flex flex-col items-center animate-in fade-in fill-mode-both duration-500 py-2">
                  <h3 className="font-semibold text-gray-800 text-[1.1rem] mb-2 tracking-wide">OTP Sending</h3>

                  {/* Progress Bar */}
                  <div className="w-[85%] mx-auto h-2 bg-gray-200 rounded-full mb-8 relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-[#EE9C24] rounded-full transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>

                  <h4 className="font-medium text-gray-800 mb-4 tracking-wide text-lg">Enter OTP</h4>
                  {otpInfo && (
                    <span className="text-orange-600 text-xs mb-4 font-bold animate-pulse">
                      Debug Mode: Your OTP is {otpInfo.code}
                    </span>
                  )}
                  <div className="flex gap-4 sm:gap-6 justify-center mb-6">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        ref={el => { otpRefs.current[index] = el; }}
                        type="text"
                        maxLength={1}
                        value={otp[index]}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        className="w-14 h-14 sm:w-16 sm:h-16 border-[1.5px] border-[#EE9C24] rounded-xl text-center text-2xl outline-none focus:border-[#EE9C24] focus:ring-2 focus:ring-[#EE9C24]/20 text-gray-700 font-bold transition-all shadow-sm"
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 font-medium text-sm">
                    OTP Resend In {resendTimer} Sec <button type="button" className="text-[#EE9C24] font-semibold hover:underline">Resend</button>
                  </p>
                </div>
              )}

              {/* Inquiry Error Display */}
              {inquiryError && (
                <div className="w-full p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm font-medium">
                  {inquiryError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* State (Read-only display) */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 z-10 bg-white px-2 text-sm font-semibold text-gray-700">
                    State
                  </label>
                  <div className="w-full border-2 border-gray-100 rounded-lg p-4 text-gray-800 font-medium min-h-[58px] flex items-center">
                    {stateName || "Select City First"}
                  </div>
                </div>

                {/* Country (Read-only display) */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 z-10 bg-white px-2 text-sm font-semibold text-gray-700">
                    Country
                  </label>
                  <div className="w-full border-2 border-gray-100 rounded-lg p-4 text-gray-800 font-medium min-h-[58px] flex items-center">
                    {countryName || "Select City First"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* City (Searchable Dropdown) */}
                <div className="relative z-30">
                  <label className="absolute -top-3 left-4 z-10 bg-white px-2 text-sm font-semibold text-gray-700">
                    City
                  </label>
                  <div
                    className="flex items-center w-full border-2 border-[#EE9C24]/30 rounded-lg p-4 outline-none focus-within:border-[#EE9C24] text-gray-600 font-medium transition-colors cursor-text relative z-0 bg-white"
                    onClick={() => setShowCityDropdown(true)}
                  >
                    <input
                      type="text"
                      value={city || citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        if (city) setCity(""); // Clear selection if typing
                      }}
                      placeholder="Search City"
                      className="w-full outline-none bg-transparent placeholder-gray-400"
                      onFocus={() => setShowCityDropdown(true)}
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  </div>

                  {/* City Dropdown */}
                  {showCityDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowCityDropdown(false)}
                      ></div>
                      <div className="absolute top-[110%] left-0 w-full bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 z-50 overflow-hidden transform">
                        <div className="max-h-60 overflow-y-auto">
                          {filteredCities.length > 0 ? (
                            filteredCities.map((c, index) => (
                              <div
                                key={c._id}
                                className={`px-6 py-4 cursor-pointer hover:bg-orange-50 transition-colors ${index !== filteredCities.length - 1 ? 'border-b border-gray-100/50' : ''}`}
                                onClick={() => {
                                  setCity(c.name);
                                  setSelectedCityId(c._id);
                                  setStateName(c.stateId?.name || "");
                                  setSelectedStateId(c.stateId?._id || "");
                                  setCountryName(c.countryId?.name || "");
                                  setSelectedCountryId(c.countryId?._id || "");
                                  setShowCityDropdown(false);
                                  setCitySearch("");
                                }}
                              >
                                <p className="text-gray-700 font-medium">{c.name}</p>
                                <p className="text-gray-400 text-xs">{c.stateId?.name}, {c.countryId?.name}</p>
                              </div>
                            ))
                          ) : (
                            <div className="px-6 py-4 text-gray-400 text-center">No cities found</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Zip Code */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 z-10 bg-white px-2 text-sm font-semibold text-gray-700">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Enter Zip Code"
                    className="w-full border-2 border-[#EE9C24]/30 rounded-lg p-4 outline-none focus:border-[#EE9C24] text-gray-600 placeholder-gray-400 font-medium transition-colors relative z-0"
                  />
                </div>
              </div>

              {/* Search Product Box (Custom Select) */}
              <div className="relative z-20">
                <label className="absolute -top-3 left-4 z-10 bg-white px-2 text-sm font-semibold text-gray-700">
                  Search Product {selectedProducts.length > 0 && `(${selectedProducts.length} selected)`}
                </label>
                <div
                  className="flex items-center w-full border-2 border-[#EE9C24]/30 rounded-lg p-4 pr-12 outline-none focus-within:border-[#EE9C24] text-gray-600 font-medium transition-colors cursor-text relative z-0 bg-white"
                  onClick={() => setShowProductDropdown(true)}
                >
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search your Product here"
                    className="w-full outline-none bg-transparent placeholder-gray-400"
                    onFocus={() => setShowProductDropdown(true)}
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                </div>

                {/* Custom Product Dropdown */}
                {showProductDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProductDropdown(false)}
                    ></div>
                    <div className="absolute top-[110%] left-0 w-full bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 z-50 overflow-hidden transform">
                      <div className="px-6 py-4 border-b border-gray-100/50">
                        <h3 className="text-[#EE9C24] font-medium text-lg">Select Product</h3>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {filteredProducts.map((product, index) => {
                          const isSelected = selectedProducts.find(p => p.id === product.id);
                          return (
                            <div
                              key={product.id}
                              className={`flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${index !== filteredProducts.length - 1 ? 'border-b border-gray-100/50' : ''} ${isSelected ? 'bg-orange-50' : ''}`}
                              onClick={() => toggleProduct(product)}
                            >
                              <div className="w-12 h-12 bg-white border border-gray-100 rounded-lg flex items-center justify-center shrink-0 p-1">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={36}
                                  height={36}
                                  className="object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <p className="text-gray-700 font-medium leading-tight pb-0.5">{product.name}</p>
                                <p className="text-gray-400 text-xs">Category: {product.category}</p>
                              </div>
                              {isSelected && (
                                <div className="text-[#EE9C24]">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Message */}
              <div className="relative">
                <label className="absolute -top-3 left-4 z-10 bg-white px-2 text-sm font-semibold text-gray-700">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter Your Message"
                  className="w-full border-2 border-[#EE9C24]/30 rounded-lg p-4 pr-12 outline-none focus:border-[#EE9C24] text-gray-600 placeholder-gray-400 font-medium transition-colors resize-none relative z-0"
                ></textarea>
                <Image src="/editicon.png" alt="edit" width={20} height={20} className="absolute right-4 top-4 text-gray-400 w-5 h-5 cursor-pointer z-10" />
              </div>

              {/* Save Information Checkbox */}
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="save-info"
                  defaultChecked
                  className="w-5 h-5 rounded border-gray-300 text-[#EE9C24] focus:ring-[#EE9C24] accent-[#EE9C24] cursor-pointer"
                />
                <label
                  htmlFor="save-info"
                  className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Keep me login
                </label>
              </div>

              {/* Buttons */}
              <div className="mt-8 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="py-3 px-6 rounded-full border-2 border-[#EE9C24] text-[#EE9C24] font-bold hover:bg-[#EE9C24]/10 transition-colors w-full tracking-wide text-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={authLoading || inquiryLoading}
                    className="py-3 px-6 rounded-full bg-gradient-to-r from-[#EE9C24] to-[#B8420E] hover:from-[#d98b1d] hover:to-[#91330a] text-white font-bold shadow-lg shadow-[#EE9C24]/30 transition-all w-full tracking-wide hover:scale-[1.02] text-lg disabled:opacity-50 disabled:scale-100"
                  >
                    {authLoading || inquiryLoading ? 'Processing...' : 'Submit'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Image */}
          <div className="h-full w-full">
            <div className="relative w-full h-[600px] lg:h-full min-h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/bulk.png"
                alt="Bulk Inquiry Warehouse Boxes"
                fill
                style={{ objectFit: "cover" }}
                className=""
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        {/* Custom Header */}
        <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] px-4 py-4 flex items-center text-white sticky top-0 z-50">
          <button onClick={() => router.back()} className="mr-3 p-1">
            <ArrowLeft size={22} className="text-white" />
          </button>
          <span className="font-semibold text-[18px]">Bulk Inquiry</span>
        </div>

        <div className="bg-white">
          {/* Top Illustration */}
          <div className="relative w-full h-72 flex items-center justify-center p-4">
            <Image src="/bulk-inquiry.png" alt="Illustration" width={300} height={300} className="object-contain" />
          </div>

          {/* Form Content */}
          <div className="px-5 pb-20 -mt-2 relative z-10">
            <div className="bg-white rounded-[40px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-50">
              <form className="space-y-7">

                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="relative group">
                    <div className="absolute -top-[10px] left-4 z-10 bg-white px-2">
                      <span className="text-[10px] font-black text-gray-400 ">First Name</span>
                    </div>
                    <div className="w-full bg-white border border-[#EE9C24]/30 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm focus-within:border-[#EE9C24] transition-all">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter Your Number"
                        className="w-full outline-none text-[#333333] font-black text-xs bg-transparent placeholder:text-gray-300"
                      />
                      <Image src="/editicon.png" alt="edit" width={14} height={14} className="opacity-40" />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="relative group">
                    <div className="absolute -top-[10px] left-4 z-10 bg-white px-2">
                      <span className="text-[10px] font-black text-gray-400 ">Last Name</span>
                    </div>
                    <div className="w-full bg-white border border-[#EE9C24]/30 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm focus-within:border-[#EE9C24] transition-all">
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter Your Number"
                        className="w-full outline-none text-[#333333] font-black text-xs bg-transparent placeholder:text-gray-300"
                      />
                      <Image src="/editicon.png" alt="edit" width={14} height={14} className="opacity-40" />
                    </div>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="relative group">
                  <div className="absolute -top-[10px] left-4 z-10 bg-white px-2">
                    <span className="text-[10px] font-black text-gray-400 ">Phone Number</span>
                  </div>
                  <div className="w-full bg-white border border-[#EE9C24]/30 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm focus-within:border-[#EE9C24] transition-all">
                    <div className="flex items-center gap-1 flex-1">
                      {/* Screenshot shows +91 123 456789 value */}
                      <input
                        type="text"
                        maxLength={15}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 123 456789"
                        className="w-full outline-none text-[#333333] font-black text-xs bg-transparent placeholder:text-gray-600"
                      />
                    </div>
                    <Image src="/editicon.png" alt="edit" width={14} height={14} className="opacity-40" />
                  </div>
                </div>

                {/* Keep me login checkbox */}
                <div className="flex items-center gap-3 px-1">
                  {/* Screenshot shows orange box with checkmark */}
                  <div
                    onClick={() => { }}
                    className="w-5 h-5 rounded-md bg-[#EE9C24] flex items-center justify-center cursor-pointer"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span className="text-[11px] font-black text-gray-800">Keep me login</span>
                </div>

                {/* OTP Flow (Mobile) */}
                {isOtpMode && (
                  <div className="space-y-6 pt-2 pb-4">
                    <div className="text-center space-y-1">
                      <h3 className="text-[13px] font-black text-gray-800">OTP Sending</h3>
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#E47B25] transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
                      </div>
                    </div>

                    <div className="text-center space-y-4">
                      <span className="text-[13px] font-black text-gray-800">Enter OTP</span>
                      <div className="flex gap-4 justify-center">
                        {[0, 1, 2, 3].map((idx) => (
                          <div key={idx} className="w-12 h-14 border-2 border-[#E47B25]/30 rounded-xl flex items-center justify-center bg-white shadow-sm focus-within:border-[#E47B25] transition-all">
                            <input
                              className="w-full text-center outline-none font-black text-lg text-gray-800 bg-transparent"
                              type="text"
                              maxLength={1}
                              value={otp[idx]}
                              onChange={(e) => handleOtpChange(e.target.value, idx)}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] font-black text-gray-400">
                        OTP Resend In {resendTimer} Sec <button className="text-[#EE9C24] ml-1">Resend</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Country */}
                  <div className="relative group">
                    <div className="absolute -top-[10px] left-4 z-10 bg-white px-2">
                      <span className="text-[10px] font-black text-gray-400 ">Country</span>
                    </div>
                    <div className="w-full bg-white border border-[#EE9C24]/30 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm transition-all focus-within:border-[#EE9C24]">
                      <select
                        className="w-full outline-none text-[#333333] font-black text-[11px] bg-transparent appearance-none"
                      >
                        <option>Select country</option>
                        <option>India</option>
                      </select>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                  </div>

                  {/* State */}
                  <div className="relative group">
                    <div className="absolute -top-[10px] left-4 z-10 bg-white px-2">
                      <span className="text-[10px] font-black text-gray-400 ">State</span>
                    </div>
                    <div className="w-full bg-white border border-[#EE9C24]/30 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm transition-all focus-within:border-[#EE9C24]">
                      <select
                        className="w-full outline-none text-[#333333] font-black text-[11px] bg-transparent appearance-none"
                      >
                        <option>Select state</option>
                        <option>Gujarat</option>
                      </select>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* City */}
                  <div className="relative group">
                    <div className="absolute -top-[10px] left-4 z-10 bg-white px-2">
                      <span className="text-[10px] font-black text-gray-400 ">City</span>
                    </div>
                    <div className="w-full bg-white border border-[#EE9C24]/30 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm transition-all focus-within:border-[#EE9C24]">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter Your Number"
                        className="w-full outline-none text-[#333333] font-black text-[11px] bg-transparent placeholder:text-gray-300"
                      />
                      <Image src="/editicon.png" alt="edit" width={14} height={14} className="opacity-40" />
                    </div>
                  </div>

                  {/* Zipcode */}
                  <div className="relative group">
                    <div className="absolute -top-[10px] left-4 z-10 bg-white px-2">
                      <span className="text-[10px] font-black text-gray-400 ">Zipcode</span>
                    </div>
                    <div className="w-full bg-white border border-[#EE9C24]/30 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm transition-all focus-within:border-[#EE9C24]">
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="Enter Your Number"
                        className="w-full outline-none text-[#333333] font-black text-[11px] bg-transparent placeholder:text-gray-300"
                      />
                      <Image src="/editicon.png" alt="edit" width={14} height={14} className="opacity-40" />
                    </div>
                  </div>
                </div>

                {/* Select Product */}
                <div className="relative group">
                  <div className="absolute -top-[10px] left-4 z-10 bg-white px-2">
                    <span className="text-[10px] font-black text-gray-400 ">Select Product</span>
                  </div>
                  <div
                    className="w-full bg-white border border-[#EE9C24]/30 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm transition-all focus-within:border-[#EE9C24]"
                    onClick={() => setShowProductDropdown(!showProductDropdown)}
                  >
                    <span className={`text-[11px] font-black ${selectedProducts.length > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                      {selectedProducts.length > 0 ? selectedProducts[0].name : 'Select a Product'}
                    </span>
                    <Search size={16} className="text-gray-400" />
                  </div>

                  {/* Product Dropdown Popup for Mobile */}
                  {showProductDropdown && (
                    <div className="absolute top-[110%] left-0 w-full bg-white rounded-3xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                      <div className="p-4 border-b border-gray-50">
                        <span className="text-xs font-black text-[#EE9C24]">Select Product</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredProducts.map((p) => (
                          <div
                            key={p.id}
                            className="p-4 flex items-center gap-3 active:bg-orange-50 border-b border-gray-50"
                            onClick={() => {
                              toggleProduct(p);
                              setShowProductDropdown(false);
                            }}
                          >
                            <Image src={p.image} alt="" width={30} height={30} className="object-contain" />
                            <div className="flex-1">
                              <p className="text-[11px] font-black text-gray-800">{p.name}</p>
                              <p className="text-[9px] text-gray-400 font-bold ">Category: {p.category}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="relative group">
                  <div className="absolute -top-[10px] left-4 z-10 bg-white px-2">
                    <span className="text-[10px] font-black text-gray-400 ">Message</span>
                  </div>
                  <div className="w-full bg-white border border-[#EE9C24]/30 rounded-2xl px-4 py-3.5 flex items-start justify-between shadow-sm transition-all focus-within:border-[#EE9C24]">
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter Your Message"
                      className="w-full outline-none text-[#333333] font-black text-[11px] bg-transparent placeholder:text-gray-300 resize-none"
                    />
                    <Image src="/editicon.png" alt="edit" width={14} height={14} className="opacity-40 mt-1" />
                  </div>
                </div>

                {/* Save information checkbox */}
                <div className="flex items-center gap-3 px-1">
                  <div
                    onClick={() => { }}
                    className="w-5 h-5 rounded-md bg-[#EE9C24] flex items-center justify-center cursor-pointer"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span className="text-[11px] font-black text-gray-800">Save this information for next time</span>
                </div>

                {/* Bottom Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    type="button"
                    className="w-full py-4 border-2 border-[#EE9C24] text-[#EE9C24] font-black text-[13px] rounded-3xl active:bg-orange-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full py-4 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white font-black text-[13px] rounded-3xl shadow-lg shadow-orange-200 active:scale-95 transition-all"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
