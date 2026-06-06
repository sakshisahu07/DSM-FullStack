"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Trash2,
    Plus,
    Minus,
    ChevronRight,
    ShoppingCart,
    CreditCard,
    X,
    ChevronDown,
    CheckCircle2,
    ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchCart, removeFromCart, increaseQuantity, decreaseQuantity, applyCoupon, removeCoupon } from '@/redux/slices/cartSlice';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '@/redux/slices/wishlistSlice';
import toast from 'react-hot-toast';

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

const CartPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { items: cartItems, summary, loading, error } = useSelector((state: RootState) => state.cart);
    const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
    const { token } = useSelector((state: RootState) => state.auth);

    const [showShippingOptions, setShowShippingOptions] = useState(false);
    const [selectedShipping, setSelectedShipping] = useState('air');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isShippingCalculated, setIsShippingCalculated] = useState(false);
    const [showCouponList, setShowCouponList] = useState(false);
    const [isCouponApplied, setIsCouponApplied] = useState(false);
    const [isCouponError, setIsCouponError] = useState(false);

    // Country & State dynamic select states
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [couponInput, setCouponInput] = useState('');
    const [apiCoupons, setApiCoupons] = useState<any[]>([]);

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

    // Fetch States when Selected Country Changes
    useEffect(() => {
        if (!selectedCountry) {
            setStates([]);
            setSelectedState('');
            return;
        }
        const fetchStates = async () => {
            try {
                const res = await fetch(`${BASE_URL}/states?countryId=${selectedCountry}&limit=100`);
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
    }, [selectedCountry, BASE_URL]);

    // Fetch Coupons when showing coupon list
    useEffect(() => {
        if (showCouponList && apiCoupons.length === 0) {
            const fetchCoupons = async () => {
                try {
                    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                    const res = await fetch(`${BASE_URL}/coupon`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await res.json();
                    if (data.success && data.data) {
                        setApiCoupons(data.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch coupons:", err);
                }
            };
            fetchCoupons();
        }
    }, [showCouponList, BASE_URL]);


    useEffect(() => {
        dispatch(fetchCart());
        dispatch(fetchWishlist());
    }, [dispatch]);

    const handleCalculateShipping = async (e: React.MouseEvent | React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedCountry) {
            toast.error("Please select a country");
            return;
        }
        if (!selectedState) {
            toast.error("Please select a state");
            return;
        }
        if (!city.trim()) {
            toast.error("Please enter a city");
            return;
        }
        if (!zipCode || zipCode.length !== 6) {
            toast.error("Please enter a valid 6-digit zip code");
            return;
        }

        const countryObj = countries.find(c => c._id === selectedCountry);
        const stateObj = states.find(s => s._id === selectedState);

        try {
            await dispatch(fetchCart(zipCode)).unwrap();
            setIsShippingCalculated(true);
            toast.success(`Shipping charges calculated for ${city}, ${stateObj?.name}, ${countryObj?.name}!`);
            setShowAddressForm(false);
        } catch (err: any) {
            toast.error(err || "Failed to calculate shipping charges.");
        }
    };

    const handleApplyCoupon = async (code: string) => {
        if (!code.trim()) {
            toast.error("Please enter a coupon code");
            return;
        }
        try {
            const resAction = await dispatch(applyCoupon(code));
            if (applyCoupon.fulfilled.match(resAction)) {
                toast.success("Coupon Applied Successfully");
                setIsCouponApplied(true);
                setIsCouponError(false);
                setCouponInput('');
            } else {
                const errorMsg = resAction.payload as string || "Invalid coupon code";
                toast.error(errorMsg);
                setIsCouponError(true);
                setIsCouponApplied(false);
            }
        } catch (err: any) {
            toast.error("Error applying coupon");
        }
    };

    const handleRemoveCoupon = async () => {
        try {
            const resAction = await dispatch(removeCoupon());
            if (removeCoupon.fulfilled.match(resAction)) {
                toast.success("Coupon Removed Successfully");
                setIsCouponApplied(false);
                setIsCouponError(false);
            } else {
                toast.error("Failed to remove coupon");
            }
        } catch (err: any) {
            toast.error("Error removing coupon");
        }
    };

    const updateQuantity = (id: string, delta: number, currentQuantity: number) => {
        if (delta > 0) {
            dispatch(increaseQuantity({ itemId: id, currentQuantity }));
        } else {
            if (currentQuantity > 1) {
                dispatch(decreaseQuantity({ itemId: id, currentQuantity }));
            } else {
                dispatch(removeFromCart(id));
            }
        }
    };

    const removeItem = (id: string) => {
        dispatch(removeFromCart(id));
    };

    const toggleWishlist = (e: React.MouseEvent, productId: string, variantId: string) => {
        e.stopPropagation();
        const isInWishlist = wishlistItems.some((item: any) =>
            (item.variant === variantId) || (item.variant?._id === variantId) || (item.product?._id === productId)
        );

        if (isInWishlist) {
            dispatch(removeFromWishlist(productId));
        } else {
            dispatch(addToWishlist(variantId));
        }
    };

    const itemsMRP = summary?.totalMRP || cartItems?.reduce((acc, item) => acc + (Number(item.mrp) * Number(item.quantity) || 0), 0) || 0;
    const subtotal = (summary?.subTotal !== undefined && summary?.subTotal !== null) ? summary.subTotal : (cartItems?.reduce((acc, item) => acc + (Number(item.finalPrice) * Number(item.quantity) || 0), 0) || 0);
    const couponDiscount = summary?.couponDiscount || 0;
    const productSaving = summary?.totalProductSaving || (itemsMRP - (cartItems?.reduce((acc, item) => acc + (Number(item.finalPrice) * Number(item.quantity) || 0), 0) || 0));
    const totalSaving = productSaving + couponDiscount;
    const shippingFee = cartItems?.length > 0 ? (isShippingCalculated ? (selectedShipping === 'air' ? (summary?.shipping?.air?.charge ?? 250) : (summary?.shipping?.road?.charge ?? 150)) : 0) : 0;
    const totalWeight = summary?.totalWeight || ((cartItems?.reduce((acc, item) => acc + (Number(item.variantId?.weight?.value || 0) * Number(item.quantity || 0)), 0) || 0) / 1000);

    return (
        <div className="min-h-screen bg-white md:bg-white">
            {/* Desktop View */}
            <div className="hidden md:block pb-20 px-4 md:px-12">
                {/* Breadcrumb */}
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
                    <nav className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <Link href="/" className="hover:text-gray-900 transition-colors uppercase">HOME</Link>
                        <ChevronRight size={14} />
                        <span className="text-[#EE9C24] uppercase">ADD TO CART</span>
                    </nav>
                </div>

                <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                    {/* Header */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="flex items-center justify-center">
                            <Image src="/cart.png" alt="Cart" width={48} height={48} className="md:w-16 md:h-16" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-[1.2rem] font-bold text-gray-900">Add To Cart</h1>
                            {loading ? (
                                <p className="text-gray-400 text-xs md:text-sm font-medium mt-1">Loading cart items...</p>
                            ) : error ? (
                                <p className="text-red-500 text-xs md:text-sm font-medium mt-1">{error}</p>
                            ) : (
                                <p className="text-[#000000] md:text-[#EE9C24] text-xs md:text-sm font-medium mt-1">Total {cartItems?.length || 0} items in your Cart</p>
                            )}
                        </div>
                    </div>

                    {/* Orange Divider */}
                    <div className="h-[1px] bg-[#EE9C24] w-full mb-2" />

                    {/* Cart Layout */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column - Cart Items */}
                        <div className="flex-1 space-y-3 ">
                            {cartItems && cartItems.length > 0 ? (
                                cartItems.map((item) => (
                                    <div key={item._id} className="bg-white rounded-2xl md:rounded-[30px] border border-[#F8F7F8] p-3 md:p-4 flex flex-col shadow-sm hover:shadow-md transition-all">
                                        {/* Top Section: Image, Info, Total */}
                                        <div className="flex items-start justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                {/* Product Image */}
                                                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl flex-shrink-0 relative overflow-hidden border border-gray-100 p-2">
                                                    <Image src={getItemImage(item)} alt={item.comboId?.name || item.productId?.name || "Product"} fill className="object-contain" />
                                                </div>

                                                {/* Product Info */}
                                                <div className="space-y-2">
                                                    <h3 className="text-gray-900 font-medium text-sm md:text-lg lg:text-[1rem] line-clamp-2">{item.comboId?.name || item.productId?.name || item.variantId?.productId?.name || "Bluetooth HC-05 Wireless UART Module"}</h3>
                                                    <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-sm lg:text-base">
                                                        <span className="text-gray-500 font-medium">Weight : {item.variantId?.weight?.value} {item.variantId?.weight?.unit}</span>
                                                        <span className="text-[#EE9C24] font-medium">₹{item.finalPrice}</span>
                                                        <span className="text-gray-400 line-through text-xs">₹{item.mrp}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Item Total (Top Right) */}
                                            <div className="text-right pr-0 md:pr-4">
                                                <div className="text-[0.7rem] md:text-[0.8rem] text-[#0D0C0D] font-semibold mb-0 md:mb-1">Total</div>
                                                <div className="text-sm md:text-[1rem] text-[#0D0C0D] font-bold text-gray-900">₹{(Number(item.finalPrice) * item.quantity).toFixed(2)}</div>
                                            </div>
                                        </div>

                                        {/* Bottom Section: Count and Trash */}
                                        <div className="flex items-center justify-between pt-2 pr-0 md:pr-4">
                                            {/* Quantity Selector - Pill Style */}
                                            <div className="flex items-center bg-[#F8F9FA] rounded-full p-0.5 md:p-1 gap-1 md:gap-3">
                                                <button
                                                    onClick={() => updateQuantity(item._id, -1, item.quantity)}
                                                    className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-[#B3520A] text-white flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95"
                                                >
                                                    <Minus size={14} className="md:w-[18px] md:h-[18px]" />
                                                </button>
                                                <span className="min-w-[24px] md:min-w-[32px] text-center font-bold text-sm md:text-xl text-[#0D0C0D] drop-shadow-sm">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, 1, item.quantity)}
                                                    className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-[#EE9C24] text-white flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95"
                                                >
                                                    <Plus size={14} className="md:w-[18px] md:h-[18px]" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Wishlist Button */}
                                                <button
                                                    onClick={(e) => {
                                                        const pId = item.productId?._id || item.variantId?.productId?._id;
                                                        const vId = item.variantId?._id;
                                                        if (pId && vId) toggleWishlist(e, pId, vId);
                                                    }}
                                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill={wishlistItems.some((w: any) => (w.product?._id === item.productId?._id) || (w.variant?._id === item.variantId?._id)) ? "#B3520A" : "none"}
                                                        stroke={wishlistItems.some((w: any) => (w.product?._id === item.productId?._id) || (w.variant?._id === item.variantId?._id)) ? "#B3520A" : "currentColor"}
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="md:w-6 md:h-6"
                                                    >
                                                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                                    </svg>
                                                </button>

                                                {/* Remove Button - Circular Border */}
                                                <button
                                                    onClick={() => removeItem(item._id)}
                                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors"
                                                >
                                                    <Image src="/delete.png" alt="Delete" width={20} height={20} className="md:w-6 md:h-6 object-contain" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                    <ShoppingCart size={48} className="text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-medium">Your cart is empty</p>
                                    <Link href="/allproduct" className="mt-4 text-[#EE9C24] font-bold hover:underline">Continue Shopping</Link>
                                </div>
                            )}
                        </div>

                        <div className="w-full lg:w-[450px] xl:w-[550px]">
                            <div className="bg-white rounded-3xl md:rounded-[40px] border border-gray-100 p-5 md:p-8 shadow-sm">
                                {/* Top Progress Bar */}
                                <div className=" h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
                                    <div className=" h-full bg-gradient-to-r from-[#B3520A] to-[#EE9C24] rounded-full" />
                                </div>
                                <p className="text-[#333333] text-sm font-medium mb-6">Fast, easy, and secure—proceed to checkout.</p>
                                {/* Coupon Section */}
                                <div className="pt-4 border-t border-gray-100 space-y-4 mb-8">
                                    <h3 className="font-bold text-gray-900">Have a Coupon Code?</h3>

                                    {summary?.couponCode ? (
                                        <div className="bg-[#E7F6E7] border-l-[6px] border-[#2EB85C] rounded-r-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="text-[#2EB85C]" size={24} />
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#2EB85C] text-sm">Coupon "{summary.couponCode}" Applied</span>
                                                    <span className="text-[#5C685C] text-xs font-semibold">Saved ₹{summary.couponDiscount.toFixed(2)} on this order!</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleRemoveCoupon}
                                                className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full"
                                            >
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1.5">
                                            {isCouponError && (
                                                <span className="text-red-500 text-xs font-semibold px-1">Invalid or expired coupon code</span>
                                            )}
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter code (e.g. SAVE2026)"
                                                    value={couponInput}
                                                    onChange={(e) => {
                                                        setCouponInput(e.target.value.toUpperCase());
                                                        if (isCouponError) setIsCouponError(false);
                                                    }}
                                                    className={`flex-1 text-[#333333] border ${isCouponError ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-100 focus:ring-[#EE9C24]/20'} rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2`}
                                                />
                                                <button
                                                    onClick={() => handleApplyCoupon(couponInput)}
                                                    className="bg-gradient-to-b from-[#EE9C24] to-[#B3520A] text-white px-6 py-3 rounded-md font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95 leading-none"
                                                >
                                                    Apply Coupon
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setShowCouponList(!showCouponList)}
                                        className="text-[#333333] text-sm font-bold block ml-auto hover:underline underline"
                                    >
                                        {showCouponList ? 'Hide Coupons' : 'View Coupon'}
                                    </button>

                                    {showCouponList && (
                                        <div className="bg-[#FBFAFA] rounded-3xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {apiCoupons.length > 0 ? apiCoupons.map((coupon, idx) => {
                                                const isExpired = !coupon.isActive || (new Date(coupon.endDate) < new Date());
                                                return (
                                                <div key={idx} className={`bg-white rounded-2xl border flex overflow-hidden shadow-sm ${isExpired ? 'border-gray-100 opacity-60 grayscale' : 'border-[#FBE9D9]'}`}>
                                                    <div className="flex-1 p-4 space-y-1">
                                                        <h4 className="font-bold text-[#E47B25] text-sm">{coupon.code}</h4>
                                                        <p className="text-[#333333] text-[11px] font-medium">
                                                            {coupon.description || `Get ${coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}`}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 font-medium">
                                                            {coupon.minPurchaseAmount > 0 ? `Valid on orders above ₹${coupon.minPurchaseAmount}` : 'No minimum order'}
                                                        </p>
                                                        <p className="text-[9px] text-gray-400 italic">Valid until {new Date(coupon.endDate).toLocaleDateString()}</p>
                                                    </div>
                                                    {summary?.couponCode === coupon.code ? (
                                                        <div className="relative w-24 flex items-center justify-center bg-[#FBE9D9]/50 border-l border-dashed border-[#FBE9D9]">
                                                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FBFAFA] rounded-full" />
                                                            <span className="font-bold text-[#CD9264] text-sm">Applied</span>
                                                        </div>
                                                    ) : isExpired ? (
                                                        <div className="relative w-24 flex items-center justify-center bg-gray-200 text-gray-500 border-l border-dashed border-gray-300">
                                                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FBFAFA] rounded-full" />
                                                            <span className="font-bold text-sm">Expired</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleApplyCoupon(coupon.code)}
                                                            className="relative w-24 bg-gradient-to-b from-[#EE9C24] to-[#B3520A] flex items-center justify-center text-white border-l border-dashed border-white/20 active:scale-95 transition-all"
                                                        >
                                                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FBFAFA] rounded-full" />
                                                            <span className="font-bold text-sm">Apply</span>
                                                        </button>
                                                    )}
                                                </div>
                                                );
                                            }) : (
                                                <div className="text-center p-4 text-gray-500 text-sm">
                                                    No coupons available at the moment.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-2xl font-bold text-[#333333] mb-2">Order Summary</h2>

                                <div className="space-y-2 mb-4 ml-4">
                                    <div className="flex justify-between items-center text-[#333333] font-medium">
                                        <span>Items total(incl. GST)</span>
                                        <span className="font-medium text-gray-900">₹{itemsMRP.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[#333333] font-medium">
                                        <span>Items Quantity</span>
                                        <span className="font-bold text-[#333333]">{summary?.totalQuantity || cartItems?.reduce((acc, item: any) => acc + (Number(item.quantity) || 0), 0) || 0} items</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[#333333] font-medium">
                                        <span>Discount</span>
                                        <span className="font-bold text-red-500">₹{productSaving.toFixed(2)}</span>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between items-center text-[#333333] font-medium">
                                            <span>Coupon Discount</span>
                                            <span className="font-bold text-red-500">₹{couponDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-[#333333] font-medium">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-[#333333]">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Shipping Section */}
                                <div className="pt-2 border-t border-gray-100 space-y-2 mb-2">
                                    <h3 className=" text-[#333333] font-medium">Shipping Details</h3>
                                    <div className="flex justify-between items-center text-gray-600 font-medium">
                                        <span>Total Weight</span>
                                        <span className="font-medium text-[#333333]">{totalWeight} kg</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-600 font-medium">
                                        <span>Delivery Fee</span>
                                        <button
                                            onClick={() => setShowShippingOptions(!showShippingOptions)}
                                            className="text-[#EE9C24] font-bold underline hover:no-underline"
                                        >
                                            {showShippingOptions ? 'Close' : 'Calculate Now'}
                                        </button>
                                    </div>

                                    {showShippingOptions && (
                                        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {/* By Air Option */}
                                            <div
                                                onClick={() => setSelectedShipping('air')}
                                                className={`p-3 md:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedShipping === 'air' ? 'border-[#F8F7F8] ' : 'border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center ${selectedShipping === 'air' ? 'border-black' : 'border-gray-300'
                                                        }`}>
                                                        {selectedShipping === 'air' && <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-black" />}
                                                    </div>
                                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#E47B25] flex items-center justify-center text-white shadow-sm">
                                                        <svg width="16" height="16" className="md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#333333] text-xs md:text-sm">By Air</p>
                                                        <p className="text-[9px] md:text-[10px] text-gray-500">Expected Delivery in 1 days</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] md:text-[10px] text-gray-400 font-medium uppercase">Fee</p>
                                                    <p className="font-bold text-[#333333] text-sm md:text-base">
                                                        {isShippingCalculated ? `₹${summary?.shipping?.air?.charge ?? 250}` : <span className="text-xs text-[#EE9C24]">Pending</span>}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* By Surface Option */}
                                            <div
                                                onClick={() => {
                                                    setSelectedShipping('surface');
                                                    setShowAddressForm(true);
                                                }}
                                                className={`p-3 md:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedShipping === 'surface' ? 'border-[#F8F7F8] ' : 'border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center ${selectedShipping === 'surface' ? 'border-black' : 'border-gray-300'
                                                        }`}>
                                                        {selectedShipping === 'surface' && <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-black" />}
                                                    </div>
                                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#B3520A] flex items-center justify-center text-white shadow-sm">
                                                        <svg width="16" height="16" className="md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#333333] text-xs md:text-sm">By Surface</p>
                                                        <p className="text-[9px] md:text-[10px] text-gray-500">Expected Delivery in 2 - 3 days</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] md:text-[10px] text-gray-400 font-medium uppercase">Fee</p>
                                                    <p className="font-bold text-[#333333] text-sm md:text-base">
                                                        {isShippingCalculated ? `₹${summary?.shipping?.road?.charge ?? 150}` : <span className="text-xs text-[#EE9C24]">Pending</span>}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Delivery Address Input */}
                                            <div className="pt-4 flex flex-col gap-4 border-t border-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold text-[#333333]">Add Delivery Address</p>
                                                    <button
                                                        onClick={() => setShowAddressForm(!showAddressForm)}
                                                        className="text-[#EE9C24] font-bold underline text-sm hover:no-underline "
                                                    >
                                                        Calculate
                                                    </button>
                                                </div>

                                                {showAddressForm && (
                                                    <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-4 border border-gray-100 space-y-3 md:space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-bold text-[#333333] text-sm md:text-base">Calculate shipping charges</h4>
                                                            <button
                                                                onClick={() => setShowAddressForm(false)}
                                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                                            >
                                                                <X size={20} />
                                                            </button>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="relative">
                                                                <select
                                                                    value={selectedCountry}
                                                                    onChange={(e) => setSelectedCountry(e.target.value)}
                                                                    className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 text-sm text-gray-500 appearance-none focus:outline-none focus:ring-2 focus:ring-[#EE9C24]/10 cursor-pointer"
                                                                >
                                                                    <option value="">Select Country</option>
                                                                    {countries.map((c) => (
                                                                        <option key={c._id} value={c._id}>{c.name}</option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                                            </div>

                                                            <div className="relative">
                                                                <select
                                                                    value={selectedState}
                                                                    onChange={(e) => setSelectedState(e.target.value)}
                                                                    className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 text-sm text-gray-500 appearance-none focus:outline-none focus:ring-2 focus:ring-[#EE9C24]/10 cursor-pointer"
                                                                >
                                                                    <option value="">Select State</option>
                                                                    {states.map((s) => (
                                                                        <option key={s._id} value={s._id}>{s.name}</option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                                            </div>

                                                            <input
                                                                type="text"
                                                                placeholder="Enter City"
                                                                value={city}
                                                                onChange={(e) => setCity(e.target.value)}
                                                                className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EE9C24]/10"
                                                            />

                                                            <input
                                                                type="text"
                                                                placeholder="Enter Zip Code"
                                                                value={zipCode}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                                    setZipCode(val);
                                                                }}
                                                                className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EE9C24]/10"
                                                            />
                                                        </div>

                                                        <button
                                                            onClick={handleCalculateShipping}
                                                            className="w-full bg-gradient-to-r from-[#EE9C24] to-[#B3520A] text-white py-2 md:py-4 rounded-full font-bold text-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                                                        >
                                                            Calculate
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Grand Total */}
                                <div className="pt-8 border-t border-gray-100 flex justify-between items-end mb-8">
                                    <div>
                                        <h3 className="text-xl font-semibold text-[#333333]">Grand Total</h3>
                                        <p className="text-xs text-[#333333] font-medium">Including GST</p>
                                    </div>
                                    <div className="text-2xl font-bold text-[#333333]">₹{(subtotal + shippingFee).toFixed(2)}</div>
                                </div>

                                {/* Checkout Button */}
                                <Link href="/checkout" className="w-full bg-gradient-to-b from-[#EE9C24] to-[#B3520A] text-white py-3 md:py-4 rounded-full font-bold text-base md:text-lg shadow-[0_4px_20px_rgba(238,156,36,0.3)] hover:shadow-[0_6px_25px_rgba(238,156,36,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 md:gap-4">
                                    <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
                                    Checkout
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden bg-[#F8F9FA] min-h-screen pb-32">
                {/* Mobile Header */}
                <div className="bg-white px-4 py-5 flex items-center gap-4 sticky top-0 z-50 shadow-sm">
                    <button onClick={() => router.back()} className="text-[#333333]">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-[#333333]">Add to Cart</h1>
                        <p className="text-[11px] text-gray-400 font-medium">total {cartItems?.length || 0} items in your cart</p>
                    </div>
                </div>

                <div className="px-4 py-6">
                    {/* Cart Items List */}
                    <div className="space-y-4 mb-4">
                        {cartItems && cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <div key={item._id} className="bg-white rounded-2xl p-3 border border-[#F8F7F8] flex gap-3 shadow-sm relative overflow-hidden">
                                    {/* Product Image */}
                                    <div className="w-20 h-20 bg-white rounded-xl flex-shrink-0 relative overflow-hidden border border-gray-50 p-2">
                                        <Image src={getItemImage(item)} alt={item.comboId?.name || "product"} fill className="object-contain" />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 flex flex-col justify-between py-0.5">
                                        <div>
                                            <h3 className="text-[13px] font-bold text-[#333333] line-clamp-1 pr-8">{item.comboId?.name || item.productId?.name || item.variantId?.productId?.name}</h3>
                                            <p className="text-[10px] text-gray-400 font-medium mt-1">Weight : {item.variantId?.weight?.value} {item.variantId?.weight?.unit}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[#EE9C24] font-bold text-sm">₹{item.finalPrice}</span>
                                                <span className="text-gray-400 line-through text-[10px]">₹{item.mrp}</span>
                                            </div>
                                        </div>

                                        {/* Quantity Selector */}
                                        <div className="flex items-center gap-3 mt-2">
                                            <button
                                                onClick={() => updateQuantity(item._id, -1, item.quantity)}
                                                className="w-6 h-6 rounded-full bg-[#B3520A] text-white flex items-center justify-center active:scale-90 transition-transform"
                                            >
                                                <Minus size={12} strokeWidth={3} />
                                            </button>
                                            <span className="text-sm font-bold text-[#333333] min-w-[15px] text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, 1, item.quantity)}
                                                className="w-6 h-6 rounded-full bg-[#EE9C24] text-white flex items-center justify-center active:scale-90 transition-transform"
                                            >
                                                <Plus size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right Controls: Total, Wishlist and Delete */}
                                    <div className="flex flex-col justify-between items-end shrink-0">
                                        <div className="text-right">
                                            <p className="text-[9px] text-[#333333] font-bold uppercase mb-0.5">Total</p>
                                            <p className="text-sm font-bold text-[#333333]">₹{(Number(item.finalPrice) * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => {
                                                    const pId = item.productId?._id || item.variantId?.productId?._id;
                                                    const vId = item.variantId?._id;
                                                    if (pId && vId) toggleWishlist(e, pId, vId);
                                                }}
                                                className="p-1 active:scale-90 transition-transform"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill={wishlistItems.some((w: any) => (w.product?._id === item.productId?._id) || (w.variant?._id === item.variantId?._id)) ? "#E47B25" : "none"}
                                                    stroke={wishlistItems.some((w: any) => (w.product?._id === item.productId?._id) || (w.variant?._id === item.variantId?._id)) ? "#E47B25" : "currentColor"}
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => removeItem(item._id)} className="p-1 active:scale-90 transition-transform">
                                                <Image src="/delete.png" alt="delete" width={18} height={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
                                <ShoppingCart size={48} className="text-gray-200 mb-4" />
                                <p className="text-gray-500 font-bold mb-4">Your cart is empty</p>
                                <Link href="/allproduct" className="bg-[#EE9C24] text-white px-6 py-2 rounded-full font-bold text-sm">Shop Now</Link>
                            </div>
                        )}
                    </div>

                    {/* Links and Promo Section */}
                    <div className="flex flex-col gap-4">
                        <div className="text-right">
                            <button className="text-[11px] font-bold text-[#333333] underline">View All</button>
                        </div>

                        <div className="space-y-3">
                            <div className="h-[2.5px] bg-[#EE9C24] w-28 rounded-full" />
                            <p className="text-[11px] text-[#333333] font-medium leading-relaxed italic">Fast, easy, and secure—proceed to checkout.</p>
                            <div className="text-right">
                                <button onClick={() => setShowCouponList(!showCouponList)} className="text-[11px] font-bold text-[#333333] underline">
                                    {showCouponList ? 'Hide Coupons' : 'View Coupons'}
                                </button>
                            </div>
                            
                            {showCouponList && (
                                <div className="bg-[#FBFAFA] rounded-3xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {apiCoupons.length > 0 ? apiCoupons.map((coupon, idx) => {
                                        const isExpired = !coupon.isActive || (new Date(coupon.endDate) < new Date());
                                        return (
                                        <div key={idx} className={`bg-white rounded-2xl border flex overflow-hidden shadow-sm ${isExpired ? 'border-gray-100 opacity-60 grayscale' : 'border-[#FBE9D9]'}`}>
                                            <div className="flex-1 p-4 space-y-1">
                                                <h4 className="font-bold text-[#E47B25] text-sm">{coupon.code}</h4>
                                                <p className="text-[#333333] text-[11px] font-medium">
                                                    {coupon.description || `Get ${coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}`}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-medium">
                                                    {coupon.minPurchaseAmount > 0 ? `Valid on orders above ₹${coupon.minPurchaseAmount}` : 'No minimum order'}
                                                </p>
                                                <p className="text-[9px] text-gray-400 italic">Valid until {new Date(coupon.endDate).toLocaleDateString()}</p>
                                            </div>
                                            {summary?.couponCode === coupon.code ? (
                                                <div className="relative w-24 flex items-center justify-center bg-[#FBE9D9]/50 border-l border-dashed border-[#FBE9D9]">
                                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FBFAFA] rounded-full" />
                                                    <span className="font-bold text-[#CD9264] text-sm">Applied</span>
                                                </div>
                                            ) : isExpired ? (
                                                <div className="relative w-24 flex items-center justify-center bg-gray-200 text-gray-500 border-l border-dashed border-gray-300">
                                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FBFAFA] rounded-full" />
                                                    <span className="font-bold text-sm">Expired</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleApplyCoupon(coupon.code)}
                                                    className="relative w-24 bg-gradient-to-b from-[#EE9C24] to-[#B3520A] flex items-center justify-center text-white border-l border-dashed border-white/20 active:scale-95 transition-all"
                                                >
                                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FBFAFA] rounded-full" />
                                                    <span className="font-bold text-sm">Apply</span>
                                                </button>
                                            )}
                                        </div>
                                        );
                                    }) : (
                                        <div className="text-center p-4 text-gray-500 text-sm">
                                            No coupons available at the moment.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                                <h3 className="text-sm font-bold text-[#333333]">Discount</h3>
                                {summary?.couponCode ? (
                                    <div className="bg-[#E7F6E7] border-l-[4px] border-[#2EB85C] rounded-r-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#2EB85C] text-xs">Coupon "{summary.couponCode}" Applied</span>
                                            <span className="text-[#5C685C] text-[10px] font-semibold">Saved ₹{summary.couponDiscount.toFixed(2)}!</span>
                                        </div>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="text-red-500 hover:text-red-700 font-bold text-[10px] flex items-center gap-1 transition-all active:scale-95 bg-red-50 px-2.5 py-1 rounded-full"
                                        >
                                            <Trash2 size={12} /> Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1.5">
                                        {isCouponError && (
                                            <span className="text-red-500 text-[10px] font-semibold px-1">Invalid or expired coupon code</span>
                                        )}
                                        <div className="flex gap-2 h-12">
                                            <input
                                                type="text"
                                                placeholder="Enter code (e.g. SAVE2026)"
                                                value={couponInput}
                                                onChange={(e) => {
                                                    setCouponInput(e.target.value.toUpperCase());
                                                    if (isCouponError) setIsCouponError(false);
                                                }}
                                                className={`flex-1 bg-white border ${isCouponError ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-100 focus:ring-[#EE9C24]/20'} rounded-md px-4 text-xs font-medium focus:outline-none focus:ring-1 text-[#333333]`}
                                            />
                                            <button
                                                onClick={() => handleApplyCoupon(couponInput)}
                                                className="bg-gradient-to-r from-[#B3520A] to-[#EE9C24] text-white px-4 rounded-md font-bold text-xs shadow-sm active:scale-95 transition-transform"
                                            >
                                                Apply Coupon
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary Table */}
                        <div className="space-y-4 pt-2">
                            <h2 className="text-xl font-bold text-[#333333]">Order Summary</h2>
                            <div className="space-y-3.5 px-1">
                                <div className="flex justify-between items-center text-xs font-semibold text-[#333333]">
                                    <span className="opacity-70">Items total(incl. GST)</span>
                                    <span>₹{itemsMRP.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-semibold text-[#333333]">
                                    <span className="opacity-70">Items Quantity</span>
                                    <span>{summary?.totalQuantity || cartItems?.reduce((acc, item: any) => acc + (Number(item.quantity) || 0), 0) || 0} items</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-semibold text-[#333333]">
                                    <span className="opacity-70">Discount</span>
                                    <span className="text-red-500 font-bold">-₹{productSaving.toFixed(2)}</span>
                                </div>
                                {couponDiscount > 0 && (
                                    <div className="flex justify-between items-center text-xs font-semibold text-[#333333]">
                                        <span className="opacity-70">Coupon Discount</span>
                                        <span className="text-red-500 font-bold">-₹{couponDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-xs font-semibold text-[#333333]">
                                    <span className="opacity-70">Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Details Section */}
                        <div className="space-y-3.5 pt-4">
                            <h3 className="text-sm font-bold text-[#333333]">Shipping Details</h3>
                            <div className="flex justify-between items-center text-xs font-semibold text-[#333333] px-1">
                                <span className="opacity-70">Total Weight</span>
                                <span>{totalWeight} kg</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold text-[#333333] px-1">
                                <span className="opacity-70">Delivery Fee</span>
                                <button
                                    onClick={() => {
                                        setShowAddressForm(true);
                                        const element = document.getElementById("mobile-address-estimator");
                                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="text-[#EE9C24] font-bold underline"
                                >
                                    Calculate Now
                                </button>
                            </div>
                        </div>

                        {/* Delivery Address and Coupon Section */}
                        <div id="mobile-address-estimator" className="space-y-5 pt-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-[#333333]">Add Delivery Address</h3>
                                <button
                                    onClick={() => setShowAddressForm(!showAddressForm)}
                                    className="text-[#EE9C24] font-bold underline text-xs"
                                >
                                    {showAddressForm ? "Hide" : "Calculate"}
                                </button>
                            </div>

                            {showAddressForm && (
                                <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <select
                                                value={selectedCountry}
                                                onChange={(e) => setSelectedCountry(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 text-xs text-gray-500 appearance-none focus:outline-none focus:ring-2 focus:ring-[#EE9C24]/10 cursor-pointer"
                                            >
                                                <option value="">Select Country</option>
                                                {countries.map((c: any) => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>

                                        <div className="relative">
                                            <select
                                                value={selectedState}
                                                onChange={(e) => setSelectedState(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 text-xs text-gray-500 appearance-none focus:outline-none focus:ring-2 focus:ring-[#EE9C24]/10 cursor-pointer"
                                            >
                                                <option value="">Select State</option>
                                                {states.map((s: any) => (
                                                    <option key={s._id} value={s._id}>{s.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Enter City"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 text-xs text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EE9C24]/10"
                                        />

                                        <input
                                            type="text"
                                            placeholder="Enter Zip Code"
                                            value={zipCode}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                setZipCode(val);
                                            }}
                                            className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 text-xs text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EE9C24]/10"
                                        />
                                    </div>

                                    <button
                                        onClick={handleCalculateShipping}
                                        className="w-full bg-gradient-to-r from-[#EE9C24] to-[#B3520A] text-white py-2 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                                    >
                                        Calculate
                                    </button>
                                </div>
                            )}

                        {/* Bottom Sticky-style Summary Card */}
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] mt-6 space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-lg font-bold text-[#333333]">Grand Total</h3>
                                    <p className="text-[10px] text-gray-400 font-bold">Including GST</p>
                                </div>
                                <div className="text-2xl font-black text-[#333333]">₹{(subtotal + shippingFee).toFixed(2)}</div>
                            </div>

                            <Link href="/checkout" className="w-full bg-gradient-to-r from-[#B3520A] to-[#EE9C24] text-white py-4 rounded-full font-bold text-sm shadow-[0_8px_25px_rgba(238,156,36,0.3)] flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                                <Image src="/cart.png" width={18} height={18} alt="checkout" className="invert brightness-0" />
                                Checkout
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
