"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    Star,
    ShoppingCart,
    Heart,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Plus,
    Minus,
    MessageCircle
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { postRating, resetRatingStatus } from '@/redux/slices/ratingSlice';
import { fetchProductById } from '@/redux/slices/productSlice';
import { addToCart } from '@/redux/slices/cartSlice';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '@/redux/slices/wishlistSlice';
import DetailSkeleton from '@/components/DetailSkeleton';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
    const { id: productId } = useParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    
    const { loading: ratingLoading, success: ratingSuccess, error: ratingError } = useSelector((state: RootState) => state.rating);
    const { currentProduct, loading } = useSelector((state: RootState) => state.product);
    const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('Description');
    const [copied, setCopied] = useState(false);

    // Review states
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');

    useEffect(() => {
        if (productId) {
            dispatch(fetchProductById(productId as string));
        }
        dispatch(fetchWishlist());
    }, [productId, dispatch]);

    useEffect(() => {
        if (ratingSuccess) {
            toast.success('Review submitted successfully!');
            setUserComment('');
            setUserRating(5);
            dispatch(resetRatingStatus());
        }
        if (ratingError) {
            toast.error(ratingError);
        }
    }, [ratingSuccess, ratingError, dispatch]);

    const handleReviewSubmit = () => {
        if (!userComment.trim()) {
            toast.error('Please enter a comment');
            return;
        }
        dispatch(postRating({
            productId: productId as string,
            rating: userRating,
            comment: userComment
        }));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAddToCart = async () => {
        const vId = currentProduct?.variantId || currentProduct?.variant?._id || currentProduct?._id;
        if (vId) {
            try {
                const action = await dispatch(addToCart({ variantId: vId, quantity }));
                if (addToCart.fulfilled.match(action)) {
                    toast.success("Added to cart successfully!");
                    return true;
                } else {
                    const errorMsg = action.payload as string || "Failed to add to cart";
                    toast.error(errorMsg);
                    return false;
                }
            } catch (err) {
                toast.error("Failed to add to cart");
                return false;
            }
        }
        return false;
    };

    const toggleWishlist = () => {
        const pId = currentProduct?._id;
        const vId = currentProduct?.variantId || currentProduct?.variant?._id || currentProduct?._id;
        
        const isInWishlist = wishlistItems.some((item: any) => 
            (item.variant === vId) || (item.variant?._id === vId) || (item.product?._id === pId)
        );

        if (isInWishlist) {
            dispatch(removeFromWishlist(pId));
        } else {
            dispatch(addToWishlist(vId));
        }
    };

    const isInWishlist = wishlistItems.some((item: any) => {
        const pId = currentProduct?._id;
        const vId = currentProduct?.variantId || currentProduct?.variant?._id || currentProduct?._id;
        return (item.variant === vId) || (item.variant?._id === vId) || (item.product?._id === pId);
    });

    if (loading) {
        return <DetailSkeleton />;
    }

    // Fallback if currentProduct is not yet available but loading is false
    const productData = currentProduct || {
        name: "BLUETOOTH HC-05 WIRELESS UART MODULE",
        category: "Bluetooth Module",
        availability: "Only 2 in Stock",
        sku: "1484",
        rating: 4.5,
        reviews: 2,
        weight: "20g",
        deliveryDate: "30 July",
        mrp: 473,
        discount: "50% Off",
        price: 273,
        images: ["/bt.png", "/bt.png", "/bt.png", "/bt.png", "/bt.png"],
        features: [
            { label: "Bluetooth 2.0 Support", desc: "Compatible with most Bluetooth devices." },
            { label: "Serial Communication", desc: "Easy UART interface for microcontrollers." },
            { label: "Wide Voltage Range", desc: "Works with 3.3V-5V systems." },
            { label: "Master/Slave Modes", desc: "Flexible connection options." },
            { label: "Stable Wireless Link", desc: "Reliable short-range data transfer." }
        ]
    };

    const product = {
        ...productData,
        name: productData.name || productData.title || "Product",
        images: productData.images && productData.images.length > 0 ? productData.images : (productData.image ? [productData.image] : ["/bt.png"]),
        price: productData.price || 0,
        mrp: productData.mrp || productData.oldPrice || productData.price || 0,
    };

    const socialIcons = [
        { src: "/facebook1.png", alt: "Facebook" },
        { src: "/instagram1.png", alt: "Instagram" },
        { src: "/twitter1.png", alt: "Twitter" },
        { src: "/linkedin1.png", alt: "LinkedIn" },
        { src: "/youtube1.png", alt: "YouTube" }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-[#E47B25] to-[#B3520A] px-4 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-white">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-white font-bold text-lg">Product Details</h1>
                </div>
            </div>

            {/* Mobile Spacer */}
            <div className="md:hidden h-[60px]" />
            {/* Breadcrumbs */}
            <div className="hidden md:block max-w-[1400px] mx-auto px-4 md:px-14 py-6">
                <div className="flex items-center gap-2 text-[10px] md:text-sm font-medium">
                    <span className="text-gray-500">HOME</span>
                    <ChevronRight size={14} className="text-gray-400" />
                    <span className="text-gray-500 uppercase">PRODUCT PAGE</span>
                    <ChevronRight size={14} className="text-gray-400" />
                    <span className="text-[#E47B25] uppercase">PRODUCT DETAIL PAGE</span>
                </div>
            </div>

            <div className="md:max-w-[1400px] md:mx-auto px-4 md:px-14">
                <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-12">

                    {/* Left Column: Image Gallery */}
                    <div className="flex flex-col items-center">
                        <div className="flex flex-col-reverse lg:flex-row w-full gap-4">
                            {/* Thumbnails */}
                            <div className="grid grid-cols-5 lg:flex lg:flex-col gap-2 md:gap-3 w-full lg:w-auto">
                                {product.images.map((img: string, idx: number) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`shrink-0 aspect-square w-full lg:w-20 lg:h-20 border-2 rounded-xl border-[#E47B25]/30 overflow-hidden cursor-pointer transition-all hover:border-[#E47B25] ${selectedImage === idx ? 'border-[#E47B25] shadow-lg' : 'bg-white'}`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`Thumbnail ${idx}`}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover p-2"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Main Image */}
                            <div className="flex-1 relative aspect-square bg-white  rounded-2xl flex items-center justify-center p-8 group">
                                <Image
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    width={500}
                                    height={500}
                                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* Floating WhatsApp Icon */}
                                <div className="absolute top-4 right-4 p-2 rounded-full l cursor-pointer hover:scale-110 transition-transform">
                                    <div className="">
                                        <Image src="/whatsapp.png" alt="WhatsApp" width={32} height={32} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Share & Copy Link (Mobile) */}
                        <div className="lg:hidden w-full mt-6 space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <span className="text-sm font-semibold text-[#191919]">Share Link On:</span>
                                <div className="flex gap-6">
                                    {socialIcons.map((icon, idx) => (
                                        <div key={idx} className="w-12 h-12 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                            <Image src={icon.src} alt={icon.alt} width={36} height={36} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full relative pt-2">
                                <div className="absolute -top-1 left-4 bg-white px-2 z-10">
                                    <span className="text-[10px] md:text-xs text-gray-500 font-medium whitespace-nowrap">
                                        Share your unique Product Affiliate link
                                    </span>
                                </div>
                                <div className="flex items-center border border-[#E47B25]/30 rounded-lg overflow-hidden h-12 bg-white">
                                    <div className="flex-1 px-4 text-[10px] md:text-xs text-gray-600 truncate font-medium">
                                        https://dsmelectro/refer&eran/234501
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="bg-gradient-to-b from-[#EE9C24] to-[#B3520A] text-white px-8 h-full text-sm font-bold active:scale-95 transition-transform"
                                    >
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Social Share (Desktop) */}
                        <div className="hidden lg:flex flex-col items-center gap-4 mt-12">
                            <span className="text-xs font-semibold text-gray-500 tracking-wider">Share Link On:</span>
                            <div className="flex gap-4">
                                {socialIcons.map((icon, idx) => (
                                    <div key={idx} className="w-10 h-10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                        <Image src={icon.src} alt={icon.alt} width={32} height={32} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Product Info */}
                    <div className="flex flex-col space-y-2 mt-6 lg:mt-0">
                        <div className="space-y-2">
                            <h1 className="text-[0.8rem] md:text-3xl w-full md:w-[80%] font-bold text-[#191919] leading-tight">
                                {product.name}
                            </h1>
                            <p className="text-[0.8rem] md:text-lg text-[#666666]">
                                Category: <span className="text-[#191919] font-medium">{product.category}</span>
                            </p>
                        </div>

                        <div className="bg-[#ebf9ee] inline-flex items-center gap-2 px-4 py-1.5 rounded-lg w-fit">
                            <span className="text-[#191919] font-medium text-xs md:text-md">Availability: <span className="text-[#34C759]">{product.availability}</span></span>
                        </div>

                        <div className="text-[#666666] font-medium">
                            SKU: <span className="text-[#666666]">{product.sku}</span>
                        </div>

                        {/* Features List */}
                        <ul className="space-y-3 pt-2">
                            {product.features?.map((feature: any, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-[#191919]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#666666] mt-2" />
                                    <span className="text-[#191919]">{feature.label}:</span>
                                    <span>{feature.desc}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Rating */}
                        <div className="flex items-center gap-4 pt-2 ">
                            <div className="flex items-center gap-2">
                                <span className="text-sm  text-[#666666]">Rating {product.rating}</span>
                                <div className="flex gap-0.5 text-[#FFC107]">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={`star-main-${i}`}
                                            size={18}
                                            fill={i < Math.floor(product.rating) ? "currentColor" : i < product.rating ? "url(#star-half)" : "none"}
                                            className="text-[#FFC107]"
                                        />
                                    ))}
                                    <svg width="0" height="0">
                                        <linearGradient id="star-half">
                                            <stop offset="50%" stopColor="#FFC107" />
                                            <stop offset="50%" stopColor="#E5E7EB" stopOpacity="1" />
                                        </linearGradient>
                                    </svg>
                                </div>
                            </div>
                            <span className="text-gray-300">|</span>
                             <button 
                                onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="text-sm font-medium text-[#333333] hover:text-[#E47B25]"
                            >
                                Review ({product.reviews})
                            </button>
                        </div>

                        <div className="space-y-1 border-t border-gray-100 pt-2">
                            <p className="text-[#666666] font-medium">Weight: {product.weight}</p>
                            <p className="text-[#666666] font-medium">
                                Expected Delivery Date: <span className="text-[#666666]">{product.deliveryDate}</span>
                            </p>
                        </div>

                        {/* Pricing */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex flex-row lg:flex-col lg:space-y-4 justify-between items-start">
                                <div>
                                    <p className="text-xs md:text-sm text-[#191919] font-medium mb-1">MRP Price</p>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <span className="text-2xl md:text-3xl text-[#666666] line-through font-medium">₹{product.mrp}</span>
                                        <span className="bg-white border border-[#EE9C24] text-[#191919] text-[10px] md:text-xs font-medium px-2 py-1 md:px-4 md:py-2 rounded-lg">
                                            {product.discount} Off
                                        </span>
                                    </div>
                                </div>
                                <div className="lg:pt-0">
                                    <p className="text-xs md:text-sm text-[#191919] font-medium mb-1">Discounted Price:</p>
                                    <div className="flex items-baseline gap-1 md:gap-2">
                                        <span className="text-2xl md:text-4xl font-medium text-[#191919]">₹{product.price}</span>
                                        <span className="text-[10px] md:text-sm text-[#666666] font-medium">(incl. gst)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[1px] bg-gray-100 w-full mt-4 lg:hidden" />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-4 md:gap-6 pt-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-gray-200 bg-white rounded-xl overflow-hidden h-11 md:h-[54px] w-fit">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 md:px-5 border-r border-gray-100 hover:bg-gray-50 text-gray-900 transition-colors"
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="w-10 md:w-14 text-center font-medium text-lg md:text-2xl text-gray-900">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-4 md:px-5 border-l border-gray-100 hover:bg-gray-50 text-gray-900 transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            {/* Buy Now & Cart Row */}
                            <div className="flex items-center gap-2 md:gap-4 w-full">
                                <button
                                    onClick={async () => {
                                        const success = await handleAddToCart();
                                        if (success) {
                                            router.push('/cart');
                                        }
                                    }}
                                    className="flex-1 bg-gradient-to-b from-[#EE9C24] to-[#B3520A] text-white font-bold text-[13px] md:text-lg h-11 md:h-[54px] rounded-lg shadow-sm active:scale-95 transition-all whitespace-nowrap"
                                >
                                    Buy Now
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    className="shrink-0 bg-gradient-to-b from-[#EE9C24] to-[#B3520A] text-white p-2 md:p-3.5 h-11 w-11 md:h-[54px] md:w-[54px] flex items-center justify-center rounded-lg shadow-sm active:scale-95 transition-all"
                                >
                                    <Image src="/shoppingcart.png" alt="Cart" width={20} height={20} className="md:w-6 md:h-6 brightness-0 invert object-contain" />
                                </button>
                                <button 
                                    onClick={toggleWishlist}
                                    className={`shrink-0 bg-gradient-to-b from-[#EE9C24] to-[#B3520A] text-white p-2 md:p-3.5 h-11 w-11 md:h-[54px] md:w-[54px] flex items-center justify-center rounded-lg shadow-sm active:scale-95 transition-all ${isInWishlist ? 'ring-2 ring-[#EE9C24] ring-offset-2' : ''}`}
                                >
                                    <Heart className={`md:w-6 md:h-6 ${isInWishlist ? 'fill-white' : ''}`} />
                                </button>
                                <button className="flex-1 border border-[#EE9C24] text-[#191919] font-bold text-[13px] md:text-lg h-11 md:h-[54px] rounded-lg hover:bg-gray-50 active:scale-95 transition-all whitespace-nowrap px-2">
                                    Bulk Inquiry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabbed Product Information Section */}
                <div className="mt-6 border-t border-gray-100 py-8 md:py-10 px-0 md:px-8 lg:px-22">
                    {/* Tabs Header */}
                    <div className="flex justify-start md:justify-center gap-8 md:gap-24 border-b border-gray-100 relative mb-8 md:mb-12 overflow-x-auto hide-scrollbar whitespace-nowrap pb-2 md:pb-0">
                        {['Description', 'Specification', 'Reviews'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-2 md:pb-4 text-base md:text-xl font-medium transition-all relative shrink-0 ${activeTab === tab ? 'text-[#E47B25]' : 'text-[#333333] hover:text-[#333333]'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#E47B25] rounded-t-full shadow-[0_-2px_8px_rgba(228,123,37,0.3)]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'Description' && (
                            <div className="space-y-10">
                                <p className="text-[#191919] leading-relaxed text-md">
                                    The Bluetooth HC-05 Wireless UART Module is a popular and versatile device that allows you to connect
                                    your microcontroller or other serial devices to a Bluetooth network. It provides a simple and
                                    cost-effective way to add wireless communication capabilities to your projects.
                                </p>

                                <div className="space-y-4 md:space-y-2">
                                    <h3 className="text-[#EE9C24] font-medium text-xl">Key Features:</h3>
                                    <ul className="space-y-4 md:space-y-2 p-2 md:p-4">
                                        {[
                                            { label: "Bluetooth 2.0 Compatibility", desc: "Ensures compatibility with a wide range of Bluetooth devices." },
                                            { label: "UART Interface", desc: "Provides a serial communication interface for easy integration with microcontrollers and other devices." },
                                            { label: "Master-Slave Mode", desc: "Can operate in both master and slave modes, allowing for flexible communication scenarios." },
                                            { label: "AT Commands", desc: "Supports AT commands for configuration and control." },
                                            { label: "Low Power Consumption", desc: "Ideal for battery-powered applications." },
                                            { label: "Compact Design", desc: "Small and lightweight, making it easy to incorporate into your projects." }
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-gray-700 leading-relaxed">
                                                <div className="w-2 h-2 md:w-1.5 md:h-1.5 rounded-full bg-gray-900 mt-1.5 md:mt-2.5 shrink-0" />
                                                <span className="text-sm md:text-base">
                                                    <span className="font-semibold md:font-medium text-[#191919]">{item.label}:</span> {item.desc}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-4 md:space-y-4">
                                    <h3 className="text-[#EE9C24] font-medium text-xl">Applications:</h3>
                                    <ul className="space-y-4 md:space-y-2 p-2 md:p-0">
                                        {[
                                            "Wireless Serial Communication: Connecting microcontrollers, sensors, and other devices to a Bluetooth network.",
                                            "Remote Control: Controlling devices or systems from a distance using a smartphone or tablet.",
                                            "Data Transmission: Sending and receiving data wirelessly between devices.",
                                            "IoT Projects: Adding wireless connectivity to Internet of Things applications."
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-gray-700 leading-relaxed">
                                                <div className="w-2 h-2 md:w-1.5 md:h-1.5 rounded-full bg-gray-900 mt-1.5 md:mt-2.5 shrink-0" />
                                                <span className="text-sm md:text-base">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Specification' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[500px] text-left border-collapse">
                                            <thead>
                                                <tr className="bg-[#D9D9D933] border-b border-gray-200">
                                                    <th className="px-4 md:px-8 py-3 md:py-4 text-gray-900 font-bold text-base md:text-lg w-[40%] md:w-1/3">Specification</th>
                                                    <th className="px-4 md:px-8 py-3 md:py-4 text-gray-900 font-bold text-base md:text-lg">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {[
                                                    { label: "Brand", value: "Specification" },
                                                    { label: "Bluetooth Version", value: "Bluetooth 2.0 + EDR" },
                                                    { label: "Model", value: "HC-05 Bluetooth Module" },
                                                    { label: "Shape", value: "Rectangular PCB Module" },
                                                    { label: "Frequency Band", value: "2.4 GHz ISM Band" },
                                                    { label: "Communication Interface", value: "UART (Serial)" },
                                                    { label: "Operating Voltage", value: "3.3V - 5V DC" },
                                                    { label: "Logic Level", value: "3.3V TTL" },
                                                    { label: "Baud Rate Range", value: "1200 - 1382400 bps (configurable)" },
                                                    { label: "Output Type", value: "Serial Data (TX/RX)" },
                                                    { label: "Material", value: "PCB with electronic components" },
                                                    { label: "Dimensions", value: "Approx. 27 × 13 × 2 mm" },
                                                    { label: "Weight", value: "Approx. 3-5 grams" }
                                                ].map((spec, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 md:px-8 py-3 md:py-3.5 font-medium text-gray-700 text-sm md:text-base">{spec.label}</td>
                                                        <td className="px-4 md:px-8 py-3 md:py-3.5 text-gray-600 text-sm md:text-base">{spec.value}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="space-y-8 mt-12">
                                    <h3 className="text-[#EE9C24] font-bold text-xl uppercase tracking-wider">DATA SHEET AND USECASE</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <h4 className="text-[#EE9C24] font-bold text-lg">Key Features:</h4>
                                            <ul className="space-y-4 md:space-y-2 pl-2 md:pl-4">
                                                {[
                                                    "Bluetooth Protocol: Bluetooth V2.0+EDR (Enhanced Data Rate)",
                                                    "Frequency: 2.4 GHz ISM band",
                                                    "Modulation: GFSK (Gaussian Frequency Shift Keying)",
                                                    "Transmission Speed: Asynchronous: 2.1 Mbps (Max) / 160 kbps; Synchronous: 1 Mbps/1 Mbps",
                                                    "Power Consumption: Low power operation with a typical current of 30 mA",
                                                    "Operating Voltage: 3.3V DC",
                                                    "Communication: UART interface with programmable baud rate",
                                                    "Security: Authentication and encryption features"
                                                ].map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-gray-700 leading-relaxed">
                                                        <div className="w-2 h-2 md:w-1.5 md:h-1.5 rounded-full bg-[#EE9C24] md:bg-gray-400 mt-1.5 md:mt-2.5 shrink-0" />
                                                        <span className="text-sm md:text-base">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-[#EE9C24] font-bold text-lg">Pin Configuration:</h4>
                                            <ul className="space-y-4 md:space-y-2 pl-2 md:pl-4">
                                                {[
                                                    "Enable (EN): Enables the module when pulled high",
                                                    "VCC: Power supply pin (3.3V)",
                                                    "Ground (GND): Ground connection",
                                                    "TXD: Transmitter pin",
                                                    "RXD: Receiver pin"
                                                ].map((pin, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-gray-700 leading-relaxed">
                                                        <div className="w-2 h-2 md:w-1.5 md:h-1.5 rounded-full bg-[#EE9C24] md:bg-gray-400 mt-1.5 md:mt-2.5 shrink-0" />
                                                        <span className="text-sm md:text-base">{pin}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Reviews' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                                    <h3 className="text-[#EE9C24] font-bold text-2xl">Customer Reviews</h3>
                                    <div className="relative">
                                        <select className="appearance-none bg-white border border-[#EE9C24] rounded-lg px-6 py-2.5 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#EE9C24]/20 cursor-pointer">
                                            <option>Latest First</option>
                                            <option>Oldest First</option>
                                            <option>Highest Rating</option>
                                            <option>Lowest Rating</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#EE9C24]">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-12">
                                    {[
                                        {
                                            name: "Rohit Sharma",
                                            rating: 4.5,
                                            title: "Good Quality Module",
                                            comment: "Build quality is nice and communication range is decent. Value for money product.",
                                            images: ["/bluetooth.png", "/bluetooth.png", "/bluetooth.png", "/product3.png", "/product4.png"],
                                            avatar: "/bluetooth.png"
                                        },
                                        {
                                            name: "Ankit Rai",
                                            rating: 4.5,
                                            title: "Good Quality Module",
                                            comment: "Build quality is nice and communication range is decent. Value for money product.",
                                            images: [],
                                            avatar: "/bluetooth.png"
                                        }
                                    ].map((review, idx) => (
                                        <div key={idx} className="space-y-2 border-b border-gray-100 last:border-0">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500 font-medium tracking-wide">Rating {review.rating}</span>
                                                    <div className="flex gap-0.5 text-[#FFC107]">
                                                        {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < 4 ? "currentColor" : "currentColor"} className={i === 4 ? "text-gray-300" : ""} />)}
                                                    </div>
                                                </div>
                                                <h4 className="text-[#191919] text-lg">{review.title}</h4>
                                            </div>
                                            <p className="text-[#000000]">{review.comment}</p>
                                            {review.images.length > 0 && (
                                                <div className="flex gap-4 pt-2">
                                                    {review.images.slice(0, 3).map((img, i) => (
                                                        <div key={i} className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 p-1 relative overflow-hidden group">
                                                            <Image src={img} alt="Review product" fill className="object-cover group-hover:scale-110 transition-transform" />
                                                            {i === 2 && review.images.length > 3 && (
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm">
                                                                    +{review.images.length - 2}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 pt-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 relative overflow-hidden border border-gray-200">
                                                    <Image src={review.avatar} alt={review.name} fill className="object-cover" />
                                                </div>
                                                <span className="text-[#191919]  text-sm">{review.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-center w-full pt-10 border-t border-gray-100">
                                    <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 px-2 md:px-0">
                                        <button className="shrink-0 px-3 md:px-6 py-2 md:py-2.5 rounded-lg border border-gray-200 text-gray-400 text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                                            <ChevronLeft size={14} className="md:size-4" /> Back
                                        </button>
                                        <div className="flex items-center gap-1.5 md:gap-2">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                                <button
                                                    key={num}
                                                    className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-xs md:text-sm font-bold transition-all ${num === 1 ? 'bg-gradient-to-b from-[#EE9C24] to-[#B3520A] text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'} ${num > 3 ? 'hidden sm:flex' : 'flex'}`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                            <span className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-400 font-bold">...</span>
                                            <button className="w-8 h-8 md:w-10 md:h-10 border border-gray-200 rounded-lg flex items-center justify-center text-xs md:text-sm font-bold text-gray-600 hover:bg-gray-50">25</button>
                                        </div>
                                        <button className="shrink-0 px-3 md:px-6 py-2 md:py-2.5 rounded-lg border border-gray-200 text-gray-600 text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                                            Next <ChevronRight size={14} className="md:size-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Write Reviews Section */}
                                <div className="mt-20  ">
                                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                                        <div className="flex-1 space-y-8">
                                            <h3 className="text-[#EE9C24] text-2xl md:text-[1.5rem] font-medium">Write Reviews</h3>
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[#666666] font-medium text-lg">Rate Us</span>
                                                    <div className="flex gap-1.5">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star 
                                                                key={star} 
                                                                size={24} 
                                                                className={`cursor-pointer transition-all hover:scale-110 ${star <= userRating ? "text-[#FFC107] fill-[#FFC107]" : "text-gray-300"}`} 
                                                                onClick={() => setUserRating(star)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                                                    <label className="block text-[#666666] font-medium text-lg">Review</label>
                                                    <textarea 
                                                        rows={6} 
                                                        placeholder="Enter Your Review" 
                                                        value={userComment}
                                                        onChange={(e) => setUserComment(e.target.value)}
                                                        className="w-full bg-white border border-[#E5E7EB] rounded-xl px-5 py-4 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#EE9C24] transition-all resize-none placeholder:text-gray-300" 
                                                    />
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                                    <button 
                                                        onClick={handleReviewSubmit}
                                                        disabled={ratingLoading}
                                                        className="cursor-pointer flex-1 bg-gradient-to-b from-[#EE9C24] to-[#B3520A] text-white font-bold py-4 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                                                    >
                                                        {ratingLoading ? 'Submitting...' : 'Submit'}
                                                    </button>
                                                    <button 
                                                        onClick={() => setUserComment('')}
                                                        className="cursor-pointer flex-1 bg-white border border-[#EE9C24] text-[#191919] font-bold py-4 rounded-xl hover:bg-gray-50 transition-all font-bold"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full  lg:w-1/3 flex items-center justify-center">
                                            <div className="w-full  aspect-[4/3] border-2 border-[#D5D9E2] border-dashed rounded-md flex flex-col items-center justify-center p-8 bg-[#E0E4E733] group hover:border-[#EE9C24]/30 transition-colors">
                                                <div className="text-center space-y-6 ">
                                                    <p className="text-[#191919] font-medium text-lg ">Drag & drop photo here or</p>
                                                    <button className="flex justify-center items-center gap-2 bg-gradient-to-b from-[#EE9C24] to-[#B3520A] text-white font-medium px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-all">
                                                        <Image src="/cloud.png" alt="Upload" width={20} height={20} className="brightness-0 invert" />
                                                        Upload File
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Code Tab (Arduino Code) Section - Outside tab content but logically linked */}
                {activeTab === 'Description' && (
                    <div className=" px-0 mb-20 pt-10">
                        <div className="border border-gray-100 rounded-md overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col md:flex-row md:items-center justify-center gap-4 md:gap-6 bg-[#D9D9D933] p-6 md:p-8 border-b border-gray-100">
                                <h3 className="text-[0.8rem] md:text-3xl font-medium text-[#191919] text-center md:text-left ml-20">Code Tab (Arduino Code)</h3>
                                <button className="hidden sm:flex items-center justify-center md:justify-start gap-3 md:gap-4 bg-white border border-gray-100 px-4 md:px-6 py-2 md:py-3 rounded-2xl shadow-sm hover:shadow-md transition-all group w-full md:w-auto">
                                    <div className="bg-[#EE9C24] p-2.5 rounded-xl transition-colors group-hover:bg-[#EE9C24]">
                                        <Image src="/dwnload.png" alt="Download" width={24} height={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-900 leading-none">Download PDF</p>
                                        <p className="text-[11px] text-gray-500 mt-1">View Full Description</p>
                                    </div>
                                </button>
                            </div>
                            <div className="flex bg-white relative">
                                <div className="w-16 md:w-24 bg-[#f8f9fa] border-r border-gray-100 py-6 flex flex-col items-center space-y-[210px] text-gray-400 font-bold select-none">

                                </div>
                                <div className="flex-1 p-10 md:p-6 relative">
                                    <div className="absolute top-10 right-10 z-10">
                                        <button onClick={() => {
                                            const code = `const int gasSensor = A0;\nconst int buzzer = 8;\nint sensorValue = 0;\nint threshold = 400;\n\nvoid setup() {\n  pinMode(buzzer, OUTPUT);\n  Serial.begin(9600);\n}`;
                                            navigator.clipboard.writeText(code);
                                        }} className="flex items-center gap-3 bg-white border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-bold text-[#666666] hover:bg-white hover:shadow-lg transition-all active:scale-95">
                                            Copy Code
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                        </button>
                                    </div>
                                    <div className="space-y-6 mt-4">
                                        <div className="space-y-4">
                                            <div className="text-gray-400 font-bold tracking-tight">CP</div>
                                            <pre className="font-mono text-[#666666] text-[15px] leading-6 md:leading-8">
                                                <span className="text-[#EE9C24]">const int</span> gasSensor = A0;<br />
                                                <span className="text-[#EE9C24]">const int</span> buzzer = 8;<br />
                                                <span className="text-[#EE9C24]">int</span> sensorValue = 0;<br />
                                                <span className="text-[#EE9C24]">int</span> threshold = 400;
                                            </pre>
                                        </div>
                                        <div className="space-y-4">
                                            <pre className="font-mono text-[#666666] text-[15px] leading-6 md:leading-8">
                                                <span className="text-[#EE9C24]">void</span> <span className="text-blue-500">setup</span>() {'{'}<br />
                                                &nbsp;&nbsp;pinMode(buzzer, OUTPUT);<br />
                                                &nbsp;&nbsp;Serial.<span className="text-blue-500">begin</span>(9600);<br />
                                                {'}'}
                                            </pre>
                                        </div>
                                        <div className="space-y-4 pt-4"><div className="text-gray-400 font-bold tracking-tight">CP</div>
                                            <pre className="font-mono text-[#666666] text-[15px] leading-6 md:leading-8">
                                                <span className="text-[#EE9C24]">const int</span> gasSensor = A0;<br />
                                                <span className="text-[#EE9C24]">const int</span> buzzer = 8;<br />
                                                <span className="text-[#EE9C24]">int</span> sensorValue = 0;<br />
                                                <span className="text-[#EE9C24]">int</span> threshold = 400;
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;
