"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
// useDispatch imported above
import { fetchAddresses, createAddress, getAddressById, updateAddress, deleteAddress } from '@/redux/slices/addressSlice';
import { createOrder, verifyPayment, cancelOrder } from '@/redux/slices/orderSlice';
import { clearCart, fetchCart } from '@/redux/slices/cartSlice';
import { getActiveCoupon, validateCoupon } from '@/redux/slices/membershipSlice';
import toast from 'react-hot-toast';

// Add razorpay types globally
declare global {
    interface Window {
        Razorpay: any;
    }
}

import { RootState, AppDispatch } from '@/redux/store';
import {
    CreditCard,
    ChevronRight,
    Info,
    Pencil,
    CircleHelp,
    Check,
    ChevronDown,
    MapPin,
    Plane,
    Package,
    ChevronRight as ChevronRightIcon,
    ShoppingBag,
    CheckCircle,
    ArrowLeft,
    Minus,
    Plus,
    Trash2
} from 'lucide-react';

const getItemImage = (item: any) => {
    if (item.itemType === 'combo') {
        const combo = item.comboId;
        if (combo) {
            if (combo.images && combo.images.length > 0 && combo.images[0] && combo.images[0] !== 'null') {
                return combo.images[0];
            }
            if (combo.icon && combo.icon !== 'null') {
                return combo.icon;
            }
            // Fallback to first combo item product image
            const firstItemProduct = combo.items?.[0]?.variantId?.productId;
            if (firstItemProduct) {
                if (firstItemProduct.images && firstItemProduct.images.length > 0 && firstItemProduct.images[0] && firstItemProduct.images[0] !== 'null') {
                    return firstItemProduct.images[0];
                }
                if (firstItemProduct.icon && firstItemProduct.icon !== 'null') {
                    return firstItemProduct.icon;
                }
            }
        }
        return "/combo.png";
    } else {
        const product = item.productId || item.variantId?.productId;
        if (product) {
            if (product.images && product.images.length > 0 && product.images[0] && product.images[0] !== 'null') {
                return product.images[0];
            }
            if (product.icon && product.icon !== 'null') {
                return product.icon;
            }
        }
        const variant = item.variantId;
        if (variant && variant.image && variant.image !== 'null') {
            return variant.image;
        }
        return "/btmodule.png";
    }
};

const CheckoutPage = () => {
    const steps = ['Login', 'Contact', 'Delivery', 'Payment'];
    const { token } = useSelector((state: RootState) => state.auth);
    const { items: cartItems, summary } = useSelector((state: RootState) => state.cart);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedAddress, setSelectedAddress] = useState(0);
    const [selectedShipping, setSelectedShipping] = useState('air');
    const [selectedPayment, setSelectedPayment] = useState('upi');
    const [isSuccess, setIsSuccess] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { addresses } = useSelector((state: RootState) => state.address);
    const { currentOrder, loading: orderLoading } = useSelector((state: RootState) => state.order);

    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [membershipCouponDiscount, setMembershipCouponDiscount] = useState<number>(0);

    const [contactData, setContactData] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: '',
        phone: '',
        firstName: '',
        lastName: '',
        email: '',
        gstNumber: '',
        companyName: ''
    });
    const [saveAddress, setSaveAddress] = useState(true);
    const [loginPhone, setLoginPhone] = useState("");

    // Dynamic Country & State lookup states
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://api.dsmelectro.com/api/v1';

    // Fetch Countries on Mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await fetch(`${BASE_URL}/countries?limit=100`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data && Array.isArray(data.data.data)) {
                        setCountries(data.data.data);
                    }
                }
            } catch (err) {
                console.error("Error fetching countries:", err);
            }
        };
        fetchCountries();
    }, [BASE_URL]);

    // Fetch States when selected country changes
    useEffect(() => {
        if (!contactData.country) {
            setStates([]);
            return;
        }
        const fetchStates = async () => {
            try {
                const res = await fetch(`${BASE_URL}/states?countryId=${contactData.country}&limit=100`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data && Array.isArray(data.data.data)) {
                        setStates(data.data.data);
                    }
                }
            } catch (err) {
                console.error("Error fetching states:", err);
            }
        };
        fetchStates();
    }, [contactData.country, BASE_URL]);

    useEffect(() => {
        if (token) {
            dispatch(fetchAddresses());
            
            // Try fetching membership active coupon
            dispatch(getActiveCoupon())
                .unwrap()
                .then((res: any) => {
                    if (res && res.is_active) {
                        setAppliedCoupon(res);
                    }
                })
                .catch(() => {});
        }
    }, [token, dispatch]);

    // Recalculate cart based on selected address's pincode
    useEffect(() => {
        if (addresses && addresses.length > 0 && addresses[selectedAddress]) {
            const addr = addresses[selectedAddress];
            const pincode = typeof addr.pincode === 'object' ? (addr.pincode?.code || addr.pincode?.name) : addr.pincode;
            if (pincode) {
                dispatch(fetchCart(pincode));
            }
        }
    }, [selectedAddress, addresses, dispatch]);

    // Load Razorpay Script
    useEffect(() => {
        const loadScript = () => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        };
        loadScript();
    }, []);


    // Skip login step if already logged in
    useEffect(() => {
        if (token && currentStep === 0) {
            setCurrentStep(1);
        }
    }, [token]);

    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

    const handleEditAddress = async (id: string) => {
        try {
            const addr = await dispatch(getAddressById(id)).unwrap();
            setContactData({
                firstName: addr?.firstName || '',
                lastName: addr?.lastName || '',
                phone: addr?.phone || '',
                email: addr?.email || '',
                street: addr?.street || '',
                city: (addr?.city && typeof addr.city === 'object') ? addr.city._id : (addr?.city || ''),
                state: (addr?.state && typeof addr.state === 'object') ? addr.state._id : (addr?.state || ''),
                country: (addr?.country && typeof addr.country === 'object') ? addr.country._id : (addr?.country || ''),
                pincode: (addr?.pincode && typeof addr.pincode === 'object') ? addr.pincode.code : (addr?.pincode || ''),
                gstNumber: addr?.gstNumber || '',
                companyName: addr?.companyName || '',
            });
            setEditingAddressId(id);
            setIsAddingNewAddress(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error("Error in handleEditAddress:", error);
            toast.error("Failed to fetch address details");
        }
    };

    const handleDeleteAddress = async (id: string, idx: number) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await dispatch(deleteAddress(id)).unwrap();
            toast.success("Address deleted");
            dispatch(fetchAddresses());
            if (selectedAddress === idx) {
                setSelectedAddress(0);
            } else if (selectedAddress > idx) {
                setSelectedAddress(selectedAddress - 1);
            }
        } catch (error) {
            toast.error("Failed to delete address");
        }
    };

    const handleContinue = async () => {
        if (currentStep === 0 && !token) {
            if (loginPhone.replace(/\D/g, '').length !== 10) {
                toast.error("Please enter a valid 10-digit phone number.");
                return;
            }
        }

        if (currentStep === 1) {
            if (addresses.length === 0 || isAddingNewAddress) {
                if (!contactData.firstName?.trim()) return toast.error("First Name is required");
                if (!contactData.lastName?.trim()) return toast.error("Last Name is required");
                if (!contactData.phone?.trim() || contactData.phone.replace(/\D/g, '').length !== 10) return toast.error("Phone Number must be exactly 10 digits");
                if (!contactData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email.trim())) return toast.error("Please enter a valid email address");
                if (!contactData.street?.trim()) return toast.error("Address/Street is required");
                if (!contactData.country?.trim()) return toast.error("Country is required");
                if (!contactData.state?.trim()) return toast.error("State is required");
                if (!contactData.city?.trim()) return toast.error("City is required");
                if (!contactData.pincode?.trim() || contactData.pincode.replace(/\D/g, '').length !== 6) return toast.error("Zip Code must be exactly 6 digits");

                try {
                    const addressPayload: any = {
                        firstName: contactData.firstName,
                        lastName: contactData.lastName,
                        phone: contactData.phone,
                        email: contactData.email,
                        street: contactData.street,
                        city: contactData.city,
                        pincode: contactData.pincode,
                        companyName: contactData.companyName,
                        gstNumber: contactData.gstNumber,
                    };
                    if (contactData.country) addressPayload.country = contactData.country;
                    if (contactData.state) addressPayload.state = contactData.state;

                    if (editingAddressId) {
                        await dispatch(updateAddress({ addressId: editingAddressId, addressData: addressPayload })).unwrap();
                        setEditingAddressId(null);
                    } else {
                        const addressResult = await dispatch(createAddress(addressPayload)).unwrap();
                        const addressId = addressResult?._id || addressResult;
                        if (!addressId) {
                            toast.error("Failed to save address. Please try again.");
                            return;
                        }
                    }
                    
                    setIsAddingNewAddress(false);
                    // refresh addresses
                    dispatch(fetchAddresses());
                    // we'll assume the new address will be at index 0 after fetch, or user can select it
                    setSelectedAddress(0);
                } catch (err: any) {
                    toast.error(err || "Failed to save address.");
                    return;
                }
            } else {
                if (addresses.length === 0 || !addresses[selectedAddress]) {
                    toast.error("Please select a delivery address");
                    return;
                }
            }
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else if (currentStep === steps.length - 1) {
            // ── Place Order Flow ──
            if (!token) {
                toast.error("Please log in to place an order.");
                return;
            }

            // Map frontend payment option to backend paymentMethod
            const paymentMethodMap: Record<string, string> = {
                upi: 'ONLINE',
                cards: 'ONLINE',
                cod: 'COD',
                wallet: 'WALLET',
            };
            const paymentMethod = paymentMethodMap[selectedPayment] || 'COD';
            const shippingMode = selectedShipping === 'air' ? 'air' : 'road';

            try {
                let addressId;
                if (addresses && addresses[selectedAddress]) {
                    addressId = addresses[selectedAddress]._id;
                }

                if (!addressId) {
                    toast.error("Failed to get delivery address. Please try again.");
                    return;
                }

                // 2. Create order
                const storedAffiliateCode = typeof window !== 'undefined' ? localStorage.getItem('affiliateCode') : null;
                
                const orderPayload = {
                    paymentMethod,
                    address: { _id: addressId },
                    shippingMode,
                    ...(paymentMethod === 'WALLET' ? { walletOption: 'BALANCE' } : {}),
                    ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
                    ...(storedAffiliateCode ? { affiliateCode: storedAffiliateCode } : {})
                };

                const orderResult = await dispatch(createOrder(orderPayload)).unwrap();

                if (!orderResult) {
                    toast.error("Failed to create order. Please try again.");
                    return;
                }

                // 3. Handle payment
                if ((paymentMethod === 'ONLINE' || paymentMethod === 'WALLET') && orderResult.razorpayOrderId) {
                    if (typeof window === 'undefined' || !(window as any).Razorpay) {
                        toast.error("Payment SDK is still loading. Please wait a moment and try again.");
                        return;
                    }

                    // Open Razorpay checkout
                    const options = {
                        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
                        amount: Math.round((orderResult.onlineAmount || orderResult.orderTotal || orderResult.amount) * 100),
                        currency: 'INR',
                        name: 'DSM Electro',
                        description: 'Order Payment',
                        order_id: orderResult.razorpayOrderId,
                        handler: async (response: any) => {
                            try {
                                await dispatch(verifyPayment({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    orderId: orderResult._id,
                                })).unwrap();
                                toast.success("Payment successful! Order placed.");
                                dispatch(clearCart());
                                setIsSuccess(true);
                            } catch (err: any) {
                                toast.error(err || "Payment verification failed.");
                            }
                        },
                        prefill: {
                            name: `${contactData.firstName} ${contactData.lastName}`,
                            email: contactData.email,
                            contact: contactData.phone,
                        },
                        theme: { color: '#EE9C24' },
                        modal: {
                            ondismiss: async () => {
                                toast.error("Payment cancelled.");
                                try {
                                    await dispatch(cancelOrder({ orderId: orderResult._id, reason: "Payment cancelled by customer" })).unwrap();
                                } catch (cancelErr: any) {
                                    console.error("Rollback failed:", cancelErr);
                                }
                            },
                        },
                    };

                    const razorpay = new (window as any).Razorpay(options);
                    razorpay.open();
                } else {
                    // COD or WALLET — order already placed (fully paid with coins + balance)
                    toast.success("Order placed successfully!");
                    dispatch(clearCart());
                    setIsSuccess(true);
                }
            } catch (err: any) {
                toast.error(err || "Something went wrong. Please try again.");
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            // Prevent going back to login if already logged in
            if (currentStep === 1 && token) {
                return;
            }
            setCurrentStep(currentStep - 1);
        }
    };

    const itemsMRP = summary?.totalMRP || cartItems?.reduce((acc, item: any) => acc + (Number(item.mrp) * Number(item.quantity) || 0), 0) || 0;
    const subtotal = (summary?.subTotal !== undefined && summary?.subTotal !== null) ? summary.subTotal : (cartItems?.reduce((acc, item: any) => acc + (Number(item.finalPrice) * Number(item.quantity) || 0), 0) || 0);

    // Validate coupon dynamically against subtotal
    useEffect(() => {
        if (appliedCoupon && subtotal > 0) {
            dispatch(validateCoupon({ code: appliedCoupon.code, orderValue: subtotal }))
                .unwrap()
                .then((res: any) => {
                    if (res && res.discount_amount) {
                        setMembershipCouponDiscount(res.discount_amount);
                    } else {
                        setMembershipCouponDiscount(0);
                    }
                })
                .catch(() => {
                    setMembershipCouponDiscount(0);
                });
        } else {
            setMembershipCouponDiscount(0);
        }
    }, [appliedCoupon, subtotal, dispatch]);

    const couponDiscount = (summary?.couponDiscount || 0) + membershipCouponDiscount;
    const productSaving = summary?.totalProductSaving || (itemsMRP - (cartItems?.reduce((acc, item: any) => acc + (Number(item.finalPrice) * Number(item.quantity) || 0), 0) || 0));
    const totalSaving = productSaving + couponDiscount;
    const totalQuantity = summary?.totalQuantity || cartItems?.reduce((acc, item: any) => acc + (Number(item.quantity) || 0), 0) || 0;
    const shippingFee = cartItems?.length > 0 ? (selectedShipping === 'air' ? (summary?.shipping?.air?.charge ?? 250) : (summary?.shipping?.road?.charge ?? 150)) : 0;
    const grandTotal = subtotal + shippingFee - membershipCouponDiscount;

    return (
        <div className="min-h-screen bg-white pb-6 px-1 md:px-12 font-sans">
            {/* Mobile View */}
            <MobileCheckoutView
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                steps={steps}
                handleBack={handleBack}
                handleContinue={handleContinue}
                isSuccess={isSuccess}
                setIsSuccess={setIsSuccess}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
                selectedShipping={selectedShipping}
                setSelectedShipping={setSelectedShipping}
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                token={token}
                cartItems={cartItems}
                summary={summary}
                grandTotal={grandTotal}
                shippingFee={shippingFee}
                itemsMRP={itemsMRP}
                membershipCouponDiscount={membershipCouponDiscount}
                addresses={addresses}
                contactData={contactData}
                setContactData={setContactData}
                saveAddress={saveAddress}
                setSaveAddress={setSaveAddress}
                loginPhone={loginPhone}
                setLoginPhone={setLoginPhone}
                countries={countries}
                states={states}
                isAddingNewAddress={isAddingNewAddress}
                setIsAddingNewAddress={setIsAddingNewAddress}
                handleEditAddress={handleEditAddress}
                handleDeleteAddress={handleDeleteAddress}
            />

            {/* Desktop View */}
            <div className="hidden md:block w-full  px-4 md:px-0">
                {/* Breadcrumb */}
                <div className="py-6">
                    <nav className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <Link href="/" className="hover:text-gray-900 transition-colors uppercase">HOME</Link>
                        <ChevronRight size={14} />
                        <Link href="/cart" className="hover:text-gray-900 transition-colors uppercase">ADD TO CART</Link>
                        <ChevronRight size={14} />
                        <span className="text-[#EE9C24] uppercase">CHECKOUT</span>
                    </nav>
                </div>
                {!isSuccess && (
                    <>
                        {/* Header Section */}
                        <div className="flex items-center gap-4 mb-6 ml-0 md:ml-10 pt-6 md:pt-10 px-4 md:px-0">
                            <Image src="/checkout.png" alt="checkout" width={40} height={40} className="md:w-[50px] md:h-[50px]" />
                            <div>
                                <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">Check Out</h1>
                                <p className="text-[#E9A157] font-medium text-sm md:text-md">Complete your order in seconds.</p>
                            </div>
                        </div>

                        {/* Divider Line */}
                        <div className="h-[1px] md:h-[1.5px] bg-[#F4E1D2] w-full mb-8 md:mb-12" />
                    </>
                )}

                <div className="flex flex-col lg:flex-row  px-2 md:px-2 gap-8 ">
                    {/* Left Column - Checkout Steps */}
                    <div className="flex-1">
                        {!isSuccess ? (
                            <>
                                {/* Stepper */}
                                <div className="relative flex justify-between items-center mb-16 max-w-[90%] sm:max-w-[600px] mx-auto lg:mx-0 lg:ml-6">
                                    {/* Connector Line */}
                                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#E5E7EB] -translate-y-1/2 z-0" />
                                    {/* Progress Line (Orange) */}
                                    <div
                                        className="absolute top-1/2 left-0 h-[3px] bg-[#EE9C24] -translate-y-1/2 z-0 transition-all duration-500"
                                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                                    />

                                    {steps.map((step, index) => (
                                        <div key={step} className="relative z-10 flex flex-col items-center">
                                            <div
                                                className={`w-5 h-5 rounded-full border-2 bg-white transition-all duration-300 flex items-center justify-center ${index <= currentStep ? 'border-[#EE9C24]' : 'border-gray-200'
                                                    }`}
                                            >
                                                {index < currentStep ? (
                                                    <div className="w-full h-full bg-[#EE9C24] rounded-full flex items-center justify-center">
                                                        <Check className="text-white" size={14} strokeWidth={3} />
                                                    </div>
                                                ) : index === currentStep ? (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#EE9C24]" />
                                                ) : null}
                                            </div>
                                            <span
                                                className={`absolute -bottom-8 text-[10px] sm:text-sm font-semibold transition-colors duration-300 whitespace-nowrap ${index === currentStep ? 'text-[#EE9C24]' : 'text-gray-400'
                                                    }`}
                                            >
                                                {step}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {currentStep === 0 ? (
                                    /* Login Form Content */
                                    <div className="w-full lg:ml-6">
                                        {/* Phone Number Field */}
                                        <div className="relative mb-6">
                                            <fieldset className="border-2 w-full max-w-full sm:max-w-[40rem] mx-auto border-[#F4E1D2] rounded-xl px-4 py-1">
                                                <legend className="px-2 text-sm font-bold text-gray-800">Phone Number</legend>
                                                <div className="flex items-center justify-between py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Your Phone Number"
                                                        value={loginPhone}
                                                        onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                        className="bg-transparent border-none outline-none text-gray-500 font-medium w-full text-sm sm:text-base"
                                                    />
                                                    <Pencil className="text-gray-400" size={18} />
                                                </div>
                                            </fieldset>
                                        </div>

                                        {/* Keep Login Checkbox */}
                                        {/* Keep Login Checkbox */}
                                        <div className="flex items-center gap-3 mb-10 text-left">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        id="keepLogin"
                                                        className="peer sr-only"
                                                        defaultChecked
                                                    />
                                                    <div className="w-5 h-5 border-2 border-[#EE9C24] rounded-md transition-all peer-checked:bg-[#EE9C24] flex items-center justify-center">
                                                        <Check stroke="white" className="opacity-0 peer-checked:opacity-100 transition-opacity" size={14} strokeWidth={4} />
                                                    </div>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">Keep me login</span>
                                            </label>
                                        </div>

                                        {/* OTP Section */}
                                        <div className="text-center mb-8 flex flex-col items-center">
                                            <p className="text-[#333333] mb-4">OTP Sending</p>
                                            <div className="w-full max-w-[40rem] mx-auto h-2 bg-[#F1F3F5] rounded-full overflow-hidden mb-8">
                                                <div className="h-full bg-[#EE9C24] w-[45%] rounded-full shadow-[0_0_10px_rgba(238,156,236,0.3)]" />
                                            </div>

                                            <h3 className="text-[#333333] text-lg mb-6 ">Enter OTP</h3>

                                            <div className="flex justify-center gap-2 sm:gap-4 mb-8">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <input
                                                        key={i}
                                                        type="text"
                                                        className="w-12 h-12 sm:w-20 sm:h-20 border-2 border-[#F4E1D2] rounded-xl text-center text-xl sm:text-2xl font-bold focus:border-[#EE9C24] outline-none transition-colors"
                                                    />
                                                ))}
                                            </div>

                                            <p className="text-[#333333] mb-4">
                                                OTP Resend In 30 Sec <span className="text-[#EE9C24] underline cursor-pointer">Resend</span>
                                            </p>

                                            <button
                                                onClick={handleContinue}
                                                className="w-full max-w-full sm:max-w-[40rem] mx-auto py-2.5 bg-gradient-to-r from-[#EE9C24] to-[#B3520A] text-white rounded-full font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                                            >
                                                Continue
                                            </button>
                                        </div>
                                    </div>
                                ) : currentStep === 1 ? (
                                    /* Contact Details Form Content */
                                    <div className="w-full max-w-[40rem] lg:ml-6 space-y-4 md:space-y-5 pb-10">
                                        {addresses.length > 0 && !isAddingNewAddress ? (
                                            <div className="bg-white border border-[#F4E1D2] rounded-2xl p-6 shadow-sm mb-6">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="text-lg font-bold text-[#333333]">Select Address</h3>
                                                    <button onClick={() => setIsAddingNewAddress(true)} className="text-[#EE9C24] font-bold hover:underline">+ Add New Address</button>
                                                </div>
                                                <div className="space-y-4">
                                                    {addresses.map((addr: any, idx: number) => (
                                                        <div key={idx} onClick={() => setSelectedAddress(idx)} className="flex items-start gap-4 cursor-pointer group p-4 border rounded-xl hover:border-[#EE9C24] transition-colors">
                                                            <div className={`w-5 h-5 mt-1 border-2 rounded-sm rotate-45 flex items-center justify-center transition-colors ${selectedAddress === idx ? 'bg-[#EE9C24] border-[#EE9C24]' : 'bg-white border-gray-200'}`}>
                                                                {selectedAddress === idx && <div className="-rotate-45 mb-0.5"><Check className="text-white" size={14} strokeWidth={4} /></div>}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-bold text-[#333333]">{addr.firstName} {addr.lastName}</p>
                                                                <p className="text-sm text-gray-600 mt-1">{addr.street}, {(typeof addr.city === 'object' ? addr.city?.name : addr.city)}, {(typeof addr.state === 'object' ? addr.state?.name : addr.state)}, {(typeof addr.pincode === 'object' ? (addr.pincode?.code || addr.pincode?.name) : addr.pincode)}</p>
                                                                <p className="text-sm text-gray-600 mt-1">{addr.phone}</p>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <button onClick={(e) => { e.stopPropagation(); handleEditAddress(addr._id); }} className="text-gray-400 hover:text-[#EE9C24]">
                                                                    <Pencil size={18} />
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id, idx); }} className="text-gray-400 hover:text-red-500">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex gap-4 mt-8">
                                                    <button onClick={handleBack} className="flex-1 py-2 border-2 border-[#EE9C24] text-[#EE9C24] rounded-full text-lg hover:bg-gray-50 transition-colors">Back</button>
                                                    <button onClick={handleContinue} className="flex-1 py-2 bg-gradient-to-r from-[#EE9C24] to-[#B3520A] text-white rounded-full text-lg shadow-lg hover:shadow-xl transition-all">Continue</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {addresses.length > 0 && (
                                                    <button onClick={() => setIsAddingNewAddress(false)} className="text-[#EE9C24] font-bold block ml-auto hover:underline mb-2">
                                                        Cancel Add New Address
                                                    </button>
                                                )}
                                                {/* GST Number */}
                                        <div className="relative">
                                            <fieldset className="border-2 border-[#EE9C24] rounded-xl px-4 py-1">
                                                <legend className="px-2 md:text-[1rem]  text-[#333333]">GST Number(If Applicable)</legend>
                                                <div className="flex items-center justify-between py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Your GST Number"
                                                        value={contactData.gstNumber}
                                                        onChange={(e) => setContactData({ ...contactData, gstNumber: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15) })}
                                                        className="bg-transparent border-none outline-none text-[#333333] font-medium w-full text-[1rem]"
                                                    />
                                                    <Pencil className="text-gray-400" size={18} />
                                                </div>
                                            </fieldset>
                                        </div>

                                        {/* Company Name */}
                                        <div className="relative">
                                            <fieldset className="border-2 border-[#EE9C24] rounded-xl px-4 py-1">
                                                <legend className="px-2 md:text-[1rem]  text-[#333333]">Company Name</legend>
                                                <div className="flex items-center justify-between py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Your Company Name"
                                                        value={contactData.companyName}
                                                        onChange={(e) => setContactData({ ...contactData, companyName: e.target.value })}
                                                        className="bg-transparent border-none outline-none text-[#333333] font-medium w-full text-[1rem]"
                                                    />
                                                    <Pencil className="text-gray-400" size={18} />
                                                </div>
                                            </fieldset>
                                        </div>

                                        {/* Name row */}
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-1 relative">
                                                <fieldset className="border-2 border-[#EE9C24] rounded-xl px-4 py-1">
                                                    <legend className="px-2 text-sm md:text-[1rem]  text-[#333333]">First Name</legend>
                                                    <div className="flex items-center py-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter Your First Name"
                                                            value={contactData.firstName}
                                                            onChange={(e) => setContactData({ ...contactData, firstName: e.target.value })}
                                                            className="bg-transparent border-none outline-none text-[#333333] font-medium w-full text-sm md:text-[1rem]"
                                                        />
                                                    </div>
                                                </fieldset>
                                            </div>
                                            <div className="flex-1 relative">
                                                <fieldset className="border-2 border-[#EE9C24] rounded-xl px-4 py-1">
                                                    <legend className="px-2 text-sm md:text-[1rem]  text-[#333333]">Last Name</legend>
                                                    <div className="flex items-center py-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter Your Last Name"
                                                            value={contactData.lastName}
                                                            onChange={(e) => setContactData({ ...contactData, lastName: e.target.value })}
                                                            className="bg-transparent border-none outline-none text-[#333333] font-medium w-full text-sm md:text-[1rem]"
                                                        />
                                                    </div>
                                                </fieldset>
                                            </div>
                                        </div>

                                        {/* Phone Number */}
                                        <div className="relative">
                                            <fieldset className="border-2 border-[#EE9C24] rounded-xl px-4 py-1">
                                                <legend className="px-2 md:text-[1rem]  text-[#333333]">Phone Number</legend>
                                                <div className="flex items-center justify-between py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Your Phone Number"
                                                        value={contactData.phone}
                                                        onChange={(e) => setContactData({ ...contactData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                                        className="bg-transparent border-none outline-none text-[#333333] font-medium w-full md:text-[1rem]"
                                                    />
                                                    <Pencil className="text-gray-400" size={18} />
                                                </div>
                                            </fieldset>
                                        </div>

                                        {/* Email Address */}
                                        <div className="relative">
                                            <fieldset className="border-2 border-[#EE9C24] rounded-xl px-4 py-1">
                                                <legend className="px-2 md:text-[1rem]  text-[#333333]">Email Address</legend>
                                                <div className="flex items-center justify-between py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Your Email Address"
                                                        value={contactData.email}
                                                        onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                                                        className="bg-transparent border-none outline-none text-[#333333] font-medium w-full md:text-[1rem]"
                                                    />
                                                    <Pencil className="text-gray-400" size={18} />
                                                </div>
                                            </fieldset>
                                        </div>

                                        {/* Address */}
                                        <div className="relative">
                                            <fieldset className="border-2 border-[#EE9C24] rounded-xl px-4 py-1">
                                                <legend className="px-2 md:text-[1rem]  text-[#333333]">Address</legend>
                                                <div className="flex items-center justify-between py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Your Address"
                                                        value={contactData.street}
                                                        onChange={(e) => setContactData({ ...contactData, street: e.target.value })}
                                                        className="bg-transparent border-none outline-none text-[#333333] font-medium w-full md:text-[1rem]"
                                                    />
                                                    <Pencil className="text-gray-400" size={18} />
                                                </div>
                                            </fieldset>
                                        </div>

                                        {/* Country */}
                                        <div className="relative">
                                            <fieldset className="border-2 border-[#EE9C24] rounded-xl px-4 py-1">
                                                <legend className="px-2 md:text-[1rem]  text-[#333333]">Country</legend>
                                                <div className="flex items-center justify-between py-1">
                                                    <select
                                                        value={contactData.country}
                                                        onChange={(e) => setContactData({ ...contactData, country: e.target.value, state: '' })}
                                                        className="bg-transparent border-none outline-none text-[#333333] font-medium w-full md:text-[1rem] appearance-none cursor-pointer focus:outline-none"
                                                    >
                                                        <option value="" className="text-gray-400">Select Country</option>
                                                        {countries.map((c) => (
                                                            <option key={c._id} value={c._id} className="text-gray-800">{c.name}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="text-gray-600 pointer-events-none" size={18} />
                                                </div>
                                            </fieldset>
                                        </div>

                                        {/* State */}
                                        <div className="relative">
                                            <fieldset className="border-2 border-[#EE9C24] rounded-xl px-4 py-1">
                                                <legend className="px-2 md:text-[1rem]  text-[#333333]">State</legend>
                                                <div className="flex items-center justify-between py-1">
                                                    <select
                                                        value={contactData.state}
                                                        onChange={(e) => setContactData({ ...contactData, state: e.target.value })}
                                                        className="bg-transparent border-none outline-none text-[#333333] font-medium w-full md:text-[1rem] appearance-none cursor-pointer focus:outline-none"
                                                    >
                                                        <option value="" className="text-gray-400">Select State</option>
                                                        {states.map((s) => (
                                                            <option key={s._id} value={s._id} className="text-gray-800">{s.name}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="text-gray-600 pointer-events-none" size={18} />
                                                </div>
                                            </fieldset>
                                        </div>

                                        {/* City and Zip Code */}
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-1 relative">
                                                <fieldset className="border-2 border-[#EE9C24] rounded-xl px-4 py-1">
                                                    <legend className="px-2 text-sm md:text-[1rem]  text-[#333333]">City</legend>
                                                    <div className="flex items-center py-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter Your City"
                                                            value={contactData.city}
                                                            onChange={(e) => setContactData({ ...contactData, city: e.target.value })}
                                                            className="bg-transparent border-none outline-none text-[#333333] font-medium w-full text-sm md:text-[1rem]"
                                                        />
                                                    </div>
                                                </fieldset>
                                            </div>
                                            <div className="flex-1 relative">
                                                <fieldset className="border-2 border-[#EE9C24] rounded-xl px-4 py-1">
                                                    <legend className="px-2 text-sm md:text-[1rem]  text-[#333333]">Zip Code</legend>
                                                    <div className="flex items-center py-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter Your Zip Code"
                                                            value={contactData.pincode}
                                                            onChange={(e) => setContactData({ ...contactData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                                            className="bg-transparent border-none outline-none text-[#333333] font-medium w-full text-sm md:text-[1rem]"
                                                        />
                                                    </div>
                                                </fieldset>
                                            </div>
                                        </div>

                                        {/* Save for next time checkbox */}
                                        {/* Save for next time checkbox */}
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        id="saveInfo"
                                                        className="peer sr-only"
                                                        defaultChecked
                                                    />
                                                    <div className="w-5 h-5 border-2 border-[#EE9C24] rounded-md transition-all peer-checked:bg-[#EE9C24] flex items-center justify-center">
                                                        <Check stroke="white" className="opacity-0 peer-checked:opacity-100 transition-opacity" size={14} strokeWidth={4} />
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-600 tracking-tight">Save this information for next time</span>
                                            </label>
                                        </div>

                                        {/* Bottom Buttons */}
                                        <div className="flex gap-4 ">
                                            <button
                                                onClick={handleBack}
                                                className="flex-1 py-2 border-2 border-[#EE9C24] text-[#EE9C24] rounded-full text-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleContinue}
                                                className="flex-1 py-2 bg-gradient-to-r from-[#EE9C24] to-[#B3520A] text-white rounded-full  text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                                            >
                                                Continue
                                            </button>
                                        </div>
                                            </>
                                        )}
                                    </div>
                                ) : currentStep === 2 ? (
                                    /* Delivery Step Content */
                                    <div className="lg:ml-6 space-y-6">
                                        {/* Selected Address Summary */}
                                        <div className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-gray-900">Delivery Address</h3>
                                                    <CircleHelp className="text-gray-400" size={18} />
                                                </div>
                                                <button onClick={() => setCurrentStep(1)} className="text-[#EE9C24] text-sm font-bold">Change</button>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="flex">
                                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                                        <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                                                            <span className="text-[#9C939D] text-xs sm:text-sm">Deliver to</span>
                                                            <Image src="/loc.png" alt="location" width={14} height={14} className="sm:w-4 sm:h-4" />
                                                        </div>
                                                        <p className="text-[#333333] sm:ml-2 text-xs sm:text-sm tracking-tight leading-relaxed pr-0 sm:pr-8">
                                                            {addresses?.[selectedAddress]?.street}, {(typeof addresses?.[selectedAddress]?.city === 'object' ? addresses?.[selectedAddress]?.city?.name : addresses?.[selectedAddress]?.city)}, {(typeof addresses?.[selectedAddress]?.state === 'object' ? addresses?.[selectedAddress]?.state?.name : addresses?.[selectedAddress]?.state)}, {(typeof addresses?.[selectedAddress]?.pincode === 'object' ? (addresses?.[selectedAddress]?.pincode?.code || addresses?.[selectedAddress]?.pincode?.name) : addresses?.[selectedAddress]?.pincode)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipping Options */}
                                        <div className="space-y-4 pt-4">
                                            {/* By Air */}
                                            <div
                                                onClick={() => setSelectedShipping('air')}
                                                className={`flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-[30px] border-2 cursor-pointer transition-all ${selectedShipping === 'air' ? 'border-gray-100 bg-white' : 'border-transparent '
                                                    }`}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedShipping === 'air' ? 'border-black' : 'border-gray-200'
                                                        }`}>
                                                        {selectedShipping === 'air' && <div className="w-3 h-3 rounded-full bg-[#111]" />}
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <Image src="/air.png" alt="air" width={48} height={48} className="md:w-[68px] md:h-[68px]" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[#0D0C0D] text-sm md:text-md">By Air</h4>
                                                        <p className="text-[#333333] text-[10px] md:text-[12px] mt-1">Expected Delivery Date : 30 July 2026</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-[#0D0C0D] mb-1">Fee</p>
                                                    <p className="text-[#0D0C0D]  text-md">₹{summary?.shipping?.air?.charge ?? 250}</p>
                                                </div>
                                            </div>

                                            {/* By Surface */}
                                            <div
                                                onClick={() => setSelectedShipping('surface')}
                                                className={`flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-[30px] border-2 cursor-pointer transition-all ${selectedShipping === 'surface' ? 'border-gray-100 bg-white' : 'border-transparent '
                                                    }`}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedShipping === 'surface' ? 'border-black' : 'border-gray-200'
                                                        }`}>
                                                        {selectedShipping === 'surface' && <div className="w-3 h-3 rounded-full bg-[#111]" />}
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <Image src="/surface.png" alt="surface" width={48} height={48} className="md:w-[68px] md:h-[68px]" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[#0D0C0D] text-sm md:text-md">By Surface</h4>
                                                        <p className="text-[#333333] text-[10px] md:text-[12px] mt-1">Expected Delivery Date : 30 July 2026</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-[#0D0C0D]  mb-1">Fee</p>
                                                    <p className="text-[#0D0C0D]  text-md">₹{summary?.shipping?.road?.charge ?? 150}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Navigation Buttons */}
                                        <div className="flex gap-4 pt-10">
                                            <button
                                                onClick={handleBack}
                                                className="flex-1 py-1.5 md:py-2 border-2 border-[#F4E1D2] text-[#EE9C24] rounded-full font-bold text-lg md:text-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleContinue}
                                                className="flex-1 py-1.5 md:py-2 bg-gradient-to-r from-[#EE9C24] to-[#B3520A] text-white rounded-full font-bold text-lg md:text-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                                            >
                                                Continue
                                            </button>
                                        </div>
                                    </div>
                                ) : currentStep === 3 ? (
                                    /* Payment Step Content */
                                    <div className=" lg:ml-6 space-y-6">
                                        {/* Select Address Summary Card */}
                                        <div className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-gray-900">Select Address</h3>
                                                    <CircleHelp className="text-gray-400" size={18} />
                                                </div>
                                                <ChevronRightIcon className="text-gray-400" size={24} />
                                            </div>

                                            <div className="space-y-4">
                                                {[0, 1].map((idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => setSelectedAddress(idx)}
                                                        className="flex items-start gap-4 cursor-pointer group"
                                                    >
                                                        <div className={`w-5 h-5 mt-1 border-2 rounded-sm rotate-45 flex items-center justify-center transition-colors ${selectedAddress === idx ? 'bg-[#EE9C24] border-[#EE9C24]' : 'bg-white border-gray-100'
                                                            }`}>
                                                            {selectedAddress === idx && <div className="-rotate-45 mb-0.5"><Check className="text-white" size={14} strokeWidth={4} /></div>}
                                                        </div>
                                                        <div className="flex">
                                                            <div className="flex flex-col sm:flex-row sm:items-center">
                                                                <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                                                                    <span className="text-[#9C939D] text-xs sm:text-sm">Deliver to</span>
                                                                    <Image src="/loc.png" alt="location" width={14} height={14} className="sm:w-4 sm:h-4" />
                                                                </div>
                                                                <p className="text-[#333333] sm:ml-2 text-xs sm:text-sm tracking-tight leading-relaxed pr-0 sm:pr-8">
                                                                    {addresses?.[idx]?.street || contactData?.street || 'No Address selected'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2 mb-4">
                                            <h3 className="text-lg font-bold text-gray-900">Payment Option</h3>
                                            <CircleHelp className="text-gray-400" size={18} />
                                        </div>

                                        {/* Payment Methods */}
                                        <div className="space-y-4 w-full">
                                            {/* UPI Card */}
                                            <div
                                                onClick={() => setSelectedPayment('upi')}
                                                className={`flex items-center justify-between p-4 md:p-6 rounded-2xl w-full md:rounded-[30px] border-2 cursor-pointer transition-all ${selectedPayment === 'upi' ? 'border-[#F8F7F8] bg-white' : 'border-transparent '
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 md:gap-4">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPayment === 'upi' ? 'border-black' : 'border-gray-200'
                                                        }`}>
                                                        {selectedPayment === 'upi' && <div className="w-3 h-3 rounded-full bg-[#111]" />}
                                                    </div>
                                                    <div className="">
                                                        <Image src="/upi.png" alt="Logo" width={32} height={32} className="md:w-[40px] md:h-[40px]" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[#0D0C0D] text-sm">UPI | Wallets | EMI | Amazon Pay</h4>
                                                        <p className="text-[#333333] text-[12px] mt-1">Offer : Get Extra 10% discount on UPI Payment</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 flex-shrink-0">
                                                    <Image src="/payment.png" alt="Logo" width={40} height={40} className="md:w-[50px] md:h-[50px]" />
                                                </div>
                                            </div>

                                            {/* Cards Card */}
                                            <div
                                                onClick={() => setSelectedPayment('cards')}
                                                className={`flex items-center justify-between p-4 md:p-6 rounded-2xl w-full md:rounded-[30px] border-2 cursor-pointer transition-all ${selectedPayment === 'cards' ? 'border-[#F8F7F8] bg-white' : 'border-transparent b'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 md:gap-4">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPayment === 'cards' ? 'border-black' : 'border-gray-200'
                                                        }`}>
                                                        {selectedPayment === 'cards' && <div className="w-3 h-3 rounded-full bg-[#111]" />}
                                                    </div>
                                                    <div>
                                                        <Image src="/upi2.png" alt="Logo" width={40} height={40} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[#0D0C0D] text-sm">Net Banking | Credit | Debit Card</h4>
                                                        <p className="text-[#333333] text-[12px] mt-1">Offer : Get Extra 10% discount on UPI Payment</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] text-gray-400 font-bold uppercase mb-0.5">Fee</p>
                                                    <p className="text-[#0D0C0D]  text-md">₹150</p>
                                                </div>
                                            </div>

                                            {/* COD Card */}
                                            <div
                                                onClick={() => setSelectedPayment('cod')}
                                                className={`flex items-center justify-between p-4 md:p-6 rounded-2xl w-full md:rounded-[30px] border-2 cursor-pointer transition-all ${selectedPayment === 'cod' ? 'border-[#F8F7F8] bg-white' : 'border-transparent 0'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 md:gap-4">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPayment === 'cod' ? 'border-black' : 'border-gray-200'
                                                        }`}>
                                                        {selectedPayment === 'cod' && <div className="w-3 h-3 rounded-full bg-[#111]" />}
                                                    </div>
                                                    <div >
                                                        <Image src="/upi3.png" alt="Logo" width={40} height={40} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[#0D0C0D] text-sm">Cash On Delivery</h4>
                                                        <p className="text-[#333333] text-[12px] mt-1">Offer : No Discount Available for this Option</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] text-gray-400 font-bold uppercase mb-0.5">Fee</p>
                                                    <p className="text-[#0D0C0D]  text-md">₹150</p>
                                                </div>
                                            </div>

                                            {/* DSM Wallet Card */}
                                            <div
                                                onClick={() => setSelectedPayment('wallet')}
                                                className={`flex items-center justify-between p-4 md:p-6 rounded-2xl w-full md:rounded-[30px] border-2 cursor-pointer transition-all ${selectedPayment === 'wallet' ? 'border-[#F8F7F8] bg-white' : 'border-transparent '
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 md:gap-4">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPayment === 'wallet' ? 'border-black' : 'border-gray-200'
                                                        }`}>
                                                        {selectedPayment === 'wallet' && <div className="w-3 h-3 rounded-full bg-[#111]" />}
                                                    </div>
                                                    <div >
                                                        <Image src="/upi3.png" alt="Logo" width={40} height={40} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[#0D0C0D] text-sm">DSM Wallet</h4>
                                                        <p className="text-[#333333] text-[12px] mt-1">Offer : Get Extra 15% discount on UPI Payment</p>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <Image src="/logo.png" alt="Logo" width={80} height={24} className="h-auto w-[80px] md:w-[140px]" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Buttons */}
                                        <div className="flex gap-4 ">
                                            <button
                                                onClick={handleBack}
                                                className="flex-1 py-2 border-2 border-[#F4E1D2] text-[#EE9C24] rounded-full font-bold text-lg hover:bg-gray-50 transition-all active:scale-[0.98]"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleContinue}
                                                disabled={orderLoading}
                                                className={`flex-1 py-2 bg-gradient-to-r from-[#EE9C24] to-[#B3520A] text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] ${orderLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                            >
                                                {orderLoading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                        Processing...
                                                    </span>
                                                ) : "Place order"}
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </>
                        ) : (
                            /* Order Success Left Content */
                            <div className="flex flex-col items-center justify-center w-full min-h-[50vh]">
                                {/* Order In Progress Card */}
                                <div className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm w-full max-w-2xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">Order In Progress</h3>
                                        <span className="px-3 py-2 bg-[#FAF8F9] text-[#EE9C24] text-sm  rounded-xl border border-[#FFE4B5]">In Progress</span>
                                    </div>
                                    <p className="text-gray-400 text-xs font-bold mb-8">Order Arrived at Apr 5, 2022, 10:07 AM</p>

                                    <div className="flex flex-col items-center py-10">
                                        <div >
                                            <div >
                                                <Image src="/transport.png" alt="Logo" width={60} height={60} className="md:w-[80px] md:h-[80px]" />
                                            </div>
                                        </div>
                                        <h2 className="text-[#34C759] mt-2 text-md md:text-2xl font-bold mb-2 text-center px-4">Your Order Has Been Successfully Placed</h2>
                                        <p className="text-[#000000] mb-1 text-xs md:text-sm font-medium text-center max-w-[400px]">Thank you for your purchase!</p>
                                        <p className="text-[#000000] text-xs md:text-sm font-medium text-center max-w-[400px]">
                                            We've received your order and will start processing it shortly.
                                        </p>
                                    </div>

                                    {/* Success Buttons */}
                                    <div className="flex gap-4 md:pt-10 px-4">
                                        <button
                                            onClick={() => { setIsSuccess(false); setCurrentStep(0); }}
                                            className="flex-1 py-2 border-2 border-[#F4E1D2] text-[#EE9C24] rounded-full font-bold text-sm md:text-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Continue To Shopping
                                        </button>
                                        <button className="flex-1 py-2 bg-gradient-to-r from-[#EE9C24] to-[#B3520A] text-white rounded-full font-bold text-sm md:text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]">
                                            Track Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Order Review & Summary */}
                    {!isSuccess && (
                        <div className="w-full lg:w-[480px]">
                            <div className="bg-white rounded-3xl md:rounded-[40px] border border-gray-100 p-4 md:p-8 ">
                                {/* Orange Bar */}
                                <div className="w-28 h-2 bg-[#EE9C24] rounded-full mb-8" />

                                {/* Product Item Cards */}
                                    <div className="space-y-4 max-h-[350px] overflow-y-auto mb-4 pr-2 custom-scrollbar">
                                        {cartItems && cartItems.length > 0 ? (
                                            cartItems.map((item: any) => (
                                                <div key={item._id} className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-3 md:p-4 flex gap-3 md:gap-4 shadow-sm group hover:shadow-md transition-all">
                                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white border border-gray-50 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center p-1.5 md:p-2">
                                                        <Image
                                                            src={getItemImage(item)}
                                                            alt={item.comboId?.name || item.productId?.name || "Product"}
                                                            width={60} height={60}
                                                            className="object-contain group-hover:scale-105 transition-transform"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[13px] md:text-[0.8rem] font-bold text-gray-800 leading-[1.2] mb-1 md:mb-2 pr-2 md:pr-6 line-clamp-2">
                                                            {item.comboId?.name || item.productId?.name || item.variantId?.productId?.name || "Product Name"}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[#EE9C24] font-bold text-xs md:text-sm">₹{item.finalPrice}</span>
                                                            <span className="text-gray-300 line-through text-[0.55rem] md:text-[0.65rem] font-medium">₹{item.mrp}</span>
                                                            <span className="text-gray-400 text-[10px] font-bold ml-2">x {item.quantity}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col justify-center flex-shrink-0 min-w-[80px]">
                                                        <p className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total</p>
                                                        <p className="text-sm md:text-[1rem] font-black text-[#111]">₹{(Number(item.finalPrice) * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm italic text-center py-4">Your cart is empty</p>
                                        )}
                                    </div>

                                    <button className="w-full text-right text-xs font-bold text-gray-400 mb-8 hover:text-gray-600 transition-colors uppercase pr-2">
                                        View All
                                    </button>

                                    {/* Order Summary */}
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                                    <div className="space-y-3.5 mb-2 px-1 text-sm font-bold">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500">Items total(incl. GST)</span>
                                            <span className="text-gray-900">₹{itemsMRP.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500">Delivery Fee</span>
                                            <span className="text-gray-900">₹{shippingFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500">Offer Savings</span>
                                            <span className="text-[#198E44]">-₹{totalSaving.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* View All under Summary */}
                                    <button className="w-full text-right text-[10px] font-bold text-gray-400 underline mb-8 mt-2 hover:text-gray-600 transition-colors uppercase">
                                        View All Details
                                    </button>

                                    {/* Amount Payable Area */}
                                    <div className="flex justify-between items-center bg-[#FFFBFA] border border-[#F4E1D2]/30 p-4 md:p-5 rounded-2xl mb-8 md:mb-10 shadow-inner">
                                        <div>
                                            <h3 className="text-gray-900 font-black text-sm">Amount Payable</h3>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Incl. Shipping & Taxes</p>
                                        </div>
                                        <div className="text-[#EE9C24] font-black text-xl">₹{grandTotal.toFixed(2)}</div>
                                    </div>

                                    {/* Grand Total Footer */}
                                    <div className="flex justify-between items-end border-t border-gray-100 pt-6">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900">Grand Total</h3>
                                            <p className="text-[10px] text-gray-400 font-bold leading-none mt-1 uppercase tracking-tighter">Final Net Amount</p>
                                        </div>
                                        <div className="text-2xl font-black text-[#111]">₹{grandTotal.toFixed(2)}</div>
                                    </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;

const MobileCheckoutView = ({
    currentStep,
    setCurrentStep,
    steps,
    handleBack,
    handleContinue,
    isSuccess,
    setIsSuccess,
    selectedAddress,
    setSelectedAddress,
    selectedShipping,
    setSelectedShipping,
    selectedPayment,
    setSelectedPayment,
    token,
    cartItems,
    summary,
    grandTotal,
    shippingFee,
    itemsMRP,
    membershipCouponDiscount,
    addresses,
    contactData,
    setContactData,
    saveAddress,
    setSaveAddress,
    loginPhone,
    setLoginPhone,
    countries,
    states,
    isAddingNewAddress,
    setIsAddingNewAddress,
    handleEditAddress,
    handleDeleteAddress
}: {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    steps: string[];
    handleBack: () => void;
    handleContinue: () => void;
    isSuccess: boolean;
    setIsSuccess: (success: boolean) => void;
    selectedAddress: number;
    setSelectedAddress: (idx: number) => void;
    selectedShipping: string;
    setSelectedShipping: (type: string) => void;
    selectedPayment: string;
    setSelectedPayment: (type: any) => void;
    token: string | null;
    cartItems: any[];
    summary: any;
    grandTotal: number;
    shippingFee: number;
    itemsMRP: number;
    membershipCouponDiscount: number;
    addresses?: any[];
    contactData?: any;
    setContactData?: any;
    saveAddress?: boolean;
    setSaveAddress?: any;
    loginPhone?: string;
    setLoginPhone?: any;
    countries: any[];
    states: any[];
    isAddingNewAddress: boolean;
    setIsAddingNewAddress: (val: boolean) => void;
    handleEditAddress: (id: string) => void;
    handleDeleteAddress: (id: string, idx: number) => void;
}) => {
    const { loading: orderLoading } = useSelector((state: RootState) => state.order);

    if (isSuccess) {
        return (
            <div className="md:hidden bg-[#F8F9FA] min-h-screen pb-32">
                {/* Header */}
                <div className="bg-white px-4 py-6 flex items-center gap-4 sticky top-0 z-50 shadow-sm">
                    <button onClick={() => { setIsSuccess(false); setCurrentStep(0); }}>
                        <ArrowLeft className="text-gray-900" size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
                </div>

                <div className="px-4 pt-6 space-y-6">
                    {/* Order Status Card */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-1">Order Placed</h3>
                                <p className="text-[10px] font-bold text-gray-400">Order Arrived at Apr 5, 2022, 10:07 AM</p>
                            </div>
                            <span className="px-3 py-1 bg-white border border-[#EE9C24] text-[#EE9C24] text-[10px] font-black rounded-lg uppercase">
                                In Progress
                            </span>
                        </div>

                        <div className="flex flex-col items-center py-8 text-center">
                            <div className="w-24 h-24 bg-[#E8F5E9] rounded-full flex items-center justify-center mb-6 relative">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center">
                                    <ShoppingBag className="text-[#2E7D32]" size={32} />
                                </div>
                                <div className="absolute bottom-1 right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-[#E8F5E9]">
                                    <Check className="text-[#2E7D32]" size={16} strokeWidth={4} />
                                </div>
                            </div>

                            <h2 className="text-lg font-black text-[#22C55E] mb-4">
                                Your Order Has Been Successfully Placed
                            </h2>

                            <p className="text-[11px] font-bold text-gray-800 mb-1">
                                Thank you for your purchase!
                            </p>
                            <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-[240px]">
                                We've received your order and will start processing it shortly.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => { setIsSuccess(false); setCurrentStep(0); }}
                                className="flex-1 py-4 border-2 border-[#F4E1D2] text-[#EE9C24] rounded-full font-bold text-sm transition-all active:scale-95"
                            >
                                Back
                            </button>
                            <Link
                                href="/"
                                className="flex-2 w-[60%] py-4 bg-gradient-to-r from-[#B3520A] to-[#EE9C24] text-white rounded-full font-bold text-sm shadow-lg text-center transition-all active:scale-95"
                            >
                                Continue
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="md:hidden bg-[#F8F9FA] min-h-screen pb-32">
            {/* Header */}
            <div className="bg-white px-4 py-6 flex items-center gap-4 sticky top-0 z-50 shadow-sm">
                <button onClick={handleBack}>
                    <ArrowLeft className="text-gray-900" size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
            </div>

            <div className="px-4 pt-6">
                {/* Stepper */}
                <div className="relative flex justify-between items-center mb-12 px-2">
                    <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200 -z-0" />
                    <div
                        className="absolute top-4 left-0 h-[2px] bg-[#EE9C24] -z-0 transition-all duration-500"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />
                    {steps.map((step, index) => (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${index <= currentStep ? 'border-[#EE9C24] bg-white' : 'border-gray-200 bg-gray-100'
                                }`}>
                                {index === currentStep ? (
                                    <div className="w-3 h-3 rounded-full bg-[#EE9C24]" />
                                ) : index < currentStep ? (
                                    <Check className="text-[#EE9C24]" size={16} strokeWidth={4} />
                                ) : null}
                            </div>
                            <span className={`text-[10px] font-bold ${index <= currentStep ? 'text-[#EE9C24]' : 'text-gray-400'
                                }`}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                {currentStep === 0 && (
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm mb-6">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">LOG IN</p>
                            <h2 className="text-xl font-black text-[#333333] mb-2">OTP Verification</h2>
                            <p className="text-[11px] text-gray-400 font-medium mb-8 leading-relaxed">
                                Enter phone number to send one time Password On SMS
                            </p>

                            <div className="relative mb-6 text-left">
                                <fieldset className="border-2 border-[#F4E1D2] rounded-2xl px-4 py-2">
                                    <legend className="px-2 text-[10px] font-bold text-gray-800">Phone Number</legend>
                                    <div className="flex items-center justify-between py-1">
                                        <input
                                            type="text"
                                            placeholder="Enter Your Phone Number"
                                            value={loginPhone}
                                            onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="bg-transparent border-none outline-none text-gray-500 font-bold w-full text-sm"
                                        />
                                        <Pencil className="text-gray-400" size={16} />
                                    </div>
                                </fieldset>
                            </div>

                            <p className="text-[11px] font-bold text-gray-600 mb-2">OTP Sending</p>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-8">
                                <div className="h-full bg-[#EE9C24] w-[45%] rounded-full shadow-[0_0_10px_rgba(238,156,36,0.3)]" />
                            </div>

                            <h3 className="text-sm font-bold text-gray-800 mb-6">Enter OTP</h3>
                            <div className="flex justify-center gap-3 mb-8">
                                {[1, 2, 3, 4].map((i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        className="w-12 h-14 border-2 border-[#F4E1D2] rounded-2xl text-center text-xl font-black text-gray-800 focus:border-[#EE9C24] outline-none transition-all"
                                    />
                                ))}
                            </div>

                            <p className="text-[11px] font-bold text-gray-600 mb-8">
                                OTP Resend In 30 Sec <span className="text-[#EE9C24] cursor-pointer">Resend</span>
                            </p>

                            <button
                                onClick={handleContinue}
                                className="w-full bg-gradient-to-r from-[#B3520A] to-[#EE9C24] text-white py-4 rounded-full font-bold text-sm shadow-[0_8px_25px_rgba(238,156,36,0.3)] transition-all active:scale-[0.98]"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1: Contact Details */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm mb-6">
                        {addresses && addresses.length > 0 && !isAddingNewAddress ? (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-black text-[#333333]">Select Address</h2>
                                    <button onClick={() => setIsAddingNewAddress(true)} className="text-[#EE9C24] text-sm font-bold">+ Add New</button>
                                </div>
                                <div className="space-y-6">
                                    {addresses.map((addr: any, idx: number) => (
                                        <div key={idx} onClick={() => setSelectedAddress(idx)} className="flex items-start gap-4 cursor-pointer">
                                            <div className={`w-5 h-5 mt-1 border-2 rounded-sm rotate-45 flex items-center justify-center transition-all ${selectedAddress === idx ? 'bg-[#EE9C24] border-[#EE9C24] shadow-md' : 'bg-white border-gray-100'
                                                }`}>
                                                {selectedAddress === idx && (
                                                    <div className="-rotate-45 mb-0.5">
                                                        <Check className="text-white" size={14} strokeWidth={4} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Deliver to</span>
                                                    <MapPin className="text-[#EE9C24]" size={12} />
                                                </div>
                                                <p className="text-xs font-bold text-gray-800 leading-relaxed pr-4">
                                                    {addr.firstName} {addr.lastName} <br />
                                                    {addr.street}, {(typeof addr.city === 'object' ? addr.city?.name : addr.city)}, {(typeof addr.state === 'object' ? addr.state?.name : addr.state)}, {(typeof addr.pincode === 'object' ? (addr.pincode?.code || addr.pincode?.name) : addr.pincode)} <br />
                                                    {addr.phone}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <button onClick={(e) => { e.stopPropagation(); handleEditAddress(addr._id); }} className="text-gray-400 hover:text-[#EE9C24]">
                                                    <Pencil size={18} />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id, idx); }} className="text-gray-400 hover:text-red-500">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-4 pt-8">
                                    <button onClick={handleBack} className="flex-1 py-4 border-2 border-[#F4E1D2] text-[#EE9C24] rounded-full font-bold text-sm transition-all active:scale-95">Back</button>
                                    <button onClick={handleContinue} className="flex-2 py-4 bg-gradient-to-r from-[#B3520A] to-[#EE9C24] text-white rounded-full font-bold text-sm shadow-lg transition-all active:scale-95">Continue</button>
                                </div>
                            </>
                        ) : (
                            <>
                                {addresses && addresses.length > 0 && (
                                    <button onClick={() => setIsAddingNewAddress(false)} className="text-[#EE9C24] font-bold block ml-auto hover:underline mb-2 text-sm">
                                        Cancel Add New
                                    </button>
                                )}
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">CONTACT</p>
                                <h2 className="text-xl font-black text-[#333333] mb-8 text-center">Contact Details</h2>

                                <div className="space-y-5">
                                    {/* GST Number */}
                            <div className="relative">
                                <fieldset className="border-2 border-[#F4E1D2] rounded-2xl px-4 py-2">
                                    <legend className="px-2 text-[10px] font-bold text-gray-800">GST Number (If Applicable)</legend>
                                    <div className="flex items-center justify-between py-1">
                                        <input type="text" placeholder="Enter Your Number" className="bg-transparent border-none outline-none text-gray-500 font-bold w-full text-sm" />
                                        <Pencil className="text-gray-400" size={16} />
                                    </div>
                                </fieldset>
                            </div>

                            {/* Company Name */}
                            <div className="relative">
                                <fieldset className="border-2 border-[#F4E1D2] rounded-2xl px-4 py-2">
                                    <legend className="px-2 text-[10px] font-bold text-gray-800">Company Name</legend>
                                    <div className="flex items-center justify-between py-1">
                                        <input type="text" placeholder="Enter Your Company name" className="bg-transparent border-none outline-none text-gray-500 font-bold w-full text-sm" />
                                        <Pencil className="text-gray-400" size={16} />
                                    </div>
                                </fieldset>
                            </div>

                            {/* Name Row */}
                            <div className="flex gap-4">
                                <fieldset className="flex-1 border-2 border-[#F4E1D2] rounded-2xl px-4 py-2">
                                    <legend className="px-2 text-[10px] font-bold text-gray-800">First Name</legend>
                                    <input type="text" placeholder="First Name" value={contactData.firstName} onChange={(e) => setContactData({ ...contactData, firstName: e.target.value })} className="bg-transparent border-none outline-none text-gray-500 font-bold w-full text-sm py-1" />
                                </fieldset>
                                <fieldset className="flex-1 border-2 border-[#F4E1D2] rounded-2xl px-4 py-2">
                                    <legend className="px-2 text-[10px] font-bold text-gray-800">Last Name</legend>
                                    <input type="text" placeholder="Last Name" value={contactData.lastName} onChange={(e) => setContactData({ ...contactData, lastName: e.target.value })} className="bg-transparent border-none outline-none text-gray-500 font-bold w-full text-sm py-1" />
                                </fieldset>
                            </div>

                            {/* Phone Number */}
                            <div className="relative">
                                <fieldset className="border-2 border-[#F4E1D2] rounded-2xl px-4 py-2">
                                    <legend className="px-2 text-[10px] font-bold text-gray-800">Phone Number</legend>
                                    <div className="flex items-center justify-between py-1">
                                        <input type="text" placeholder="Enter Your Number" className="bg-transparent border-none outline-none text-gray-500 font-bold w-full text-sm" />
                                        <Pencil className="text-gray-400" size={16} />
                                    </div>
                                </fieldset>
                            </div>

                            {/* Email Address */}
                            <div className="relative">
                                <fieldset className="border-2 border-[#F4E1D2] rounded-2xl px-4 py-2">
                                    <legend className="px-2 text-[10px] font-bold text-gray-800">Email Address</legend>
                                    <div className="flex items-center justify-between py-1">
                                        <input type="text" placeholder="Enter Email Address" value={contactData.email} onChange={(e) => setContactData({ ...contactData, email: e.target.value })} className="bg-transparent border-none outline-none text-gray-500 font-bold w-full text-sm" />
                                        <Pencil className="text-gray-400" size={16} />
                                    </div>
                                </fieldset>
                            </div>

                            {/* Address */}
                            <div className="relative">
                                <fieldset className="border-2 border-[#F4E1D2] rounded-2xl px-4 py-2">
                                    <legend className="px-2 text-[10px] font-bold text-gray-800">Address</legend>
                                    <div className="flex items-center justify-between py-1">
                                        <input type="text" placeholder="Enter Full Address" value={contactData.street} onChange={(e) => setContactData({ ...contactData, street: e.target.value })} className="bg-transparent border-none outline-none text-gray-500 font-bold w-full text-sm" />
                                        <Pencil className="text-gray-400" size={16} />
                                    </div>
                                </fieldset>
                            </div>

                            {/* Country */}
                            <div className="relative">
                                <fieldset className="border-2 border-[#F4E1D2] rounded-2xl px-4 py-2">
                                    <legend className="px-2 text-[10px] font-bold text-gray-800">Country</legend>
                                    <div className="flex items-center justify-between py-1">
                                        <select
                                            value={contactData.country}
                                            onChange={(e) => setContactData({ ...contactData, country: e.target.value, state: '' })}
                                            className="bg-transparent border-none outline-none text-gray-500 font-bold w-full text-sm appearance-none cursor-pointer focus:outline-none"
                                        >
                                            <option value="">Select Country</option>
                                            {countries.map((c: any) => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </fieldset>
                            </div>

                            {/* State */}
                            <div className="relative">
                                <fieldset className="border-2 border-[#F4E1D2] rounded-2xl px-4 py-2">
                                    <legend className="px-2 text-[10px] font-bold text-gray-800">State</legend>
                                    <div className="flex items-center justify-between py-1">
                                        <select
                                            value={contactData.state}
                                            onChange={(e) => setContactData({ ...contactData, state: e.target.value })}
                                            className="bg-transparent border-none outline-none text-gray-500 font-bold w-full text-sm appearance-none cursor-pointer focus:outline-none"
                                        >
                                            <option value="">Select State</option>
                                            {states.map((s: any) => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </fieldset>
                            </div>

                            {/* City & Zip Code Row */}
                            <div className="flex gap-4">
                                <fieldset className="flex-1 border-2 border-[#F4E1D2] rounded-2xl px-4 py-2">
                                    <legend className="px-2 text-[10px] font-bold text-gray-800">City</legend>
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={contactData.city}
                                        onChange={(e) => setContactData({ ...contactData, city: e.target.value })}
                                        className="bg-transparent border-none outline-none text-gray-500 font-bold w-full text-sm py-1"
                                    />
                                </fieldset>
                                <fieldset className="flex-1 border-2 border-[#F4E1D2] rounded-2xl px-4 py-2">
                                    <legend className="px-2 text-[10px] font-bold text-gray-800">Zip Code</legend>
                                    <input
                                        type="text"
                                        placeholder="Zip Code"
                                        value={contactData.pincode}
                                        onChange={(e) => setContactData({ ...contactData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                        className="bg-transparent border-none outline-none text-gray-500 font-bold w-full text-sm py-1"
                                    />
                                </fieldset>
                            </div>

                            {/* Save Checkbox */}
                            <div className="flex items-center gap-3 py-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" className="peer sr-only" defaultChecked />
                                        <div className="w-5 h-5 border-2 border-[#EE9C24] rounded-md transition-all peer-checked:bg-[#EE9C24] flex items-center justify-center">
                                            <Check stroke="white" className="opacity-0 peer-checked:opacity-100 transition-opacity" size={14} strokeWidth={4} />
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Save this for next time</span>
                                </label>
                            </div>

                                {/* Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={handleBack}
                                        className="flex-1 py-4 border-2 border-[#F4E1D2] text-[#EE9C24] rounded-full font-bold text-sm transition-all active:scale-95"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleContinue}
                                        className="flex-2 py-4 bg-gradient-to-r from-[#B3520A] to-[#EE9C24] text-white rounded-full font-bold text-sm shadow-lg transition-all active:scale-95"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                            </>
                        )}
                    </div>
                )}

                {/* Step 2: Delivery */}
                {currentStep === 2 && (
                    <div className="space-y-6 mb-6">
                        {/* Selected Address Summary */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Delivery Address</h3>
                                    <CircleHelp className="text-gray-400" size={14} />
                                </div>
                                <button onClick={() => setCurrentStep(1)} className="text-[#EE9C24] text-sm font-bold">Change</button>
                            </div>

                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Deliver to</span>
                                    <MapPin className="text-[#EE9C24]" size={12} />
                                </div>
                                <p className="text-xs font-bold text-gray-800 leading-relaxed pr-4">
                                    {addresses?.[selectedAddress]?.street}, {(typeof addresses?.[selectedAddress]?.city === 'object' ? addresses?.[selectedAddress]?.city?.name : addresses?.[selectedAddress]?.city)}, {(typeof addresses?.[selectedAddress]?.state === 'object' ? addresses?.[selectedAddress]?.state?.name : addresses?.[selectedAddress]?.state)}, {(typeof addresses?.[selectedAddress]?.pincode === 'object' ? (addresses?.[selectedAddress]?.pincode?.code || addresses?.[selectedAddress]?.pincode?.name) : addresses?.[selectedAddress]?.pincode)}
                                </p>
                            </div>
                        </div>

                        {/* Shipping Options */}
                        <div className="space-y-4">
                            <div
                                onClick={() => setSelectedShipping('air')}
                                className={`bg-white rounded-[2rem] p-6 flex items-center justify-between border-2 transition-all ${selectedShipping === 'air' ? 'border-[#EE9C24] shadow-md' : 'border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedShipping === 'air' ? 'border-gray-800' : 'border-gray-200'
                                        }`}>
                                        {selectedShipping === 'air' && <div className="w-3 h-3 rounded-full bg-gray-800" />}
                                    </div>
                                    <div className="w-12 h-12 bg-[#F8F9FA] rounded-2xl flex items-center justify-center p-2">
                                        <Plane className="text-[#EE9C24]" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-gray-800">By Air</h4>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Expected: 30 July 2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">Fee</p>
                                    <p className="text-sm font-black text-[#111]">₹{summary?.shipping?.air?.charge ?? 250}</p>
                                </div>
                            </div>

                            <div
                                onClick={() => setSelectedShipping('surface')}
                                className={`bg-white rounded-[2rem] p-6 flex items-center justify-between border-2 transition-all ${selectedShipping === 'surface' ? 'border-[#EE9C24] shadow-md' : 'border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedShipping === 'surface' ? 'border-gray-800' : 'border-gray-200'
                                        }`}>
                                        {selectedShipping === 'surface' && <div className="w-3 h-3 rounded-full bg-gray-800" />}
                                    </div>
                                    <div className="w-12 h-12 bg-[#F8F9FA] rounded-2xl flex items-center justify-center p-2">
                                        <Package className="text-[#EE9C24]" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-gray-800">By Surface</h4>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Expected: 30 July 2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">Fee</p>
                                    <p className="text-sm font-black text-[#111]">₹{summary?.shipping?.road?.charge ?? 150}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 pt-4 px-2">
                            <button
                                onClick={handleBack}
                                className="flex-1 py-4 border-2 border-[#F4E1D2] text-[#EE9C24] rounded-full font-bold text-sm transition-all active:scale-95"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleContinue}
                                className="flex-2 py-4 bg-gradient-to-r from-[#B3520A] to-[#EE9C24] text-white rounded-full font-bold text-sm shadow-lg transition-all active:scale-95"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                    <div className="space-y-6 mb-6">
                        {/* Address Summary */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Select Address</h3>
                                <ChevronRight className="text-gray-400" size={20} />
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-5 h-5 mt-1 bg-[#EE9C24] rounded-sm rotate-45 flex items-center justify-center shadow-md">
                                    <div className="-rotate-45 mb-0.5">
                                        <Check className="text-white" size={14} strokeWidth={4} />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Deliver to</span>
                                        <MapPin className="text-[#EE9C24]" size={12} />
                                    </div>
                                    <p className="text-xs font-bold text-gray-800 leading-relaxed pr-4">
                                        {addresses?.[selectedAddress]?.street || contactData?.street || 'No Address selected'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Options Header */}
                        <div className="flex items-center gap-2 px-2">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Payment Option</h3>
                            <CircleHelp className="text-gray-400" size={14} />
                        </div>

                        {/* Payment Methods */}
                        <div className="space-y-4">
                            {[
                                { id: 'upi', title: 'UPI | Wallets | EMI', subtitle: 'Extra 10% discount on UPI', icon: '/upi.png' },
                                { id: 'cards', title: 'Net Banking | Cards', subtitle: 'Extra 10% discount on Cards', icon: '/upi2.png' },
                                { id: 'cod', title: 'Cash On Delivery', subtitle: 'No Discount Available', icon: '/upi3.png' },
                                { id: 'wallet', title: 'DSM Wallet', subtitle: 'Extra 15% discount on Wallet', icon: '/logo.png', isLogo: true }
                            ].map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setSelectedPayment(method.id as any)}
                                    className={`bg-white rounded-[2rem] p-5 flex items-center justify-between border-2 transition-all ${selectedPayment === method.id ? 'border-[#EE9C24] shadow-md' : 'border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedPayment === method.id ? 'border-gray-800' : 'border-gray-200'
                                            }`}>
                                            {selectedPayment === method.id && <div className="w-2.5 h-2.5 rounded-full bg-gray-800" />}
                                        </div>
                                        <div className={`w-10 h-10 bg-[#F8F9FA] rounded-xl flex items-center justify-center p-2 overflow-hidden`}>
                                            <Image src={method.icon} alt={method.id} width={40} height={40} className={method.isLogo ? 'w-full h-auto' : 'object-contain'} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-[11px] font-black text-gray-800 truncate">{method.title}</h4>
                                            <p className="text-[8px] font-bold text-[#EE9C24] uppercase tracking-tighter mt-0.5">{method.subtitle}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-300" size={16} />
                                </div>
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 pt-4 px-2">
                            <button
                                onClick={handleBack}
                                className="flex-1 py-4 border-2 border-[#F4E1D2] text-[#EE9C24] rounded-full font-bold text-sm transition-all active:scale-95"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleContinue}
                                disabled={orderLoading}
                                className={`flex-2 py-4 bg-gradient-to-r from-[#B3520A] to-[#EE9C24] text-white rounded-full font-bold text-sm shadow-lg transition-all active:scale-95 ${orderLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {orderLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Processing...
                                    </span>
                                ) : "Pay Now"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Review Order Items */}
                <div className="space-y-4 mb-8">
                    {cartItems && cartItems.length > 0 ? (
                        cartItems.map((item: any) => (
                            <div key={item._id} className="bg-white rounded-[2rem] p-4 flex gap-4 shadow-sm border border-gray-50 group">
                                <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex-shrink-0 flex items-center justify-center p-2">
                                    <Image
                                        src={getItemImage(item)}
                                        alt={item.comboId?.name || item.productId?.name || "Product"}
                                        width={48} height={48}
                                        className="object-contain"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-800 leading-tight mb-1 line-clamp-1">
                                            {item.comboId?.name || item.productId?.name || item.variantId?.productId?.name || "Product Name"}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-400">Qty: {item.quantity}</span>
                                            <span className="text-[#EE9C24] font-black text-[11px]">₹{item.finalPrice}</span>
                                            <span className="text-gray-300 line-through text-[9px] font-bold">₹{item.mrp}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col justify-center items-end flex-shrink-0">
                                    <div>
                                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Total</p>
                                        <p className="text-sm font-black text-[#111]">₹{(Number(item.finalPrice) * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 text-xs italic py-4">No items in cart</p>
                    )}
                    <button className="w-full text-right text-[10px] font-black text-gray-400 underline uppercase pr-4">
                        View All
                    </button>
                </div>

                {/* Order Summary Area */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 mb-10">
                    <div className="w-16 h-1.5 bg-[#EE9C24] rounded-full mb-6" />
                    <p className="text-[11px] text-gray-400 font-medium mb-2">Fast, easy, and secure—proceed to checkout.</p>

                    <h2 className="text-lg font-black text-[#333333] mb-6">Order Summary</h2>
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-tight">Items total(M.R.P)</span>
                            <span className="text-gray-800 font-black text-sm">₹{itemsMRP.toFixed(2)}</span>
                        </div>
                        {membershipCouponDiscount > 0 && (
                            <div className="flex justify-between items-center text-[#34C759]">
                                <span className="font-bold text-xs uppercase tracking-tight">Membership Discount</span>
                                <span className="font-black text-sm">-₹{membershipCouponDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-tight">Delivery Fee</span>
                            <span className="text-gray-800 font-black text-sm">₹{shippingFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                            <span className="text-gray-800 font-black text-xs uppercase tracking-tight">Total Amount</span>
                            <span className="text-[#EE9C24] font-black text-lg">₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <button className="w-full text-right text-[10px] font-black text-[#333333] underline uppercase">
                        View All Details
                    </button>
                </div>
            </div>
        </div>
    );
};

