"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
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
import { RootState, AppDispatch } from '@/redux/store';
import { fetchComboBySlug, clearCurrentCombo, fetchComboById } from '@/redux/slices/comboSlice';
import { addToCart } from '@/redux/slices/cartSlice';
import { postRating, resetRatingStatus } from '@/redux/slices/ratingSlice';
import toast from 'react-hot-toast';
import { BASE_URL } from '@/redux/slices/apiConfig';
function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (typeof window === 'undefined') return resolve(false);
        if ((window as any).Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

import DetailSkeleton from '@/components/DetailSkeleton';

const ComboDetailPage = () => {
    const { slug } = useParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { currentCombo, loading, error } = useSelector((state: RootState) => state.combo);
    const { loading: ratingLoading, success: ratingSuccess, error: ratingError } = useSelector((state: RootState) => state.rating);

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('Description');
    const [buyNowLoading, setBuyNowLoading] = useState(false);

    // Review states
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');

    useEffect(() => {
        if (slug) {
            dispatch(fetchComboBySlug(slug as string));
        }
        return () => {
            dispatch(clearCurrentCombo());
            dispatch(resetRatingStatus());
        };
    }, [slug, dispatch]);

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

    if (loading) {
        return <DetailSkeleton />;
    }

    if (error || !currentCombo) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-red-500">{error || 'Combo not found'}</p>
                <button onClick={() => router.back()} className="text-[#E47B25] font-bold">Go Back</button>
            </div>
        );
    }

    const combo = currentCombo;
    const images = combo.images && combo.images.length > 0 ? combo.images : [combo.icon];
    const socialIcons = [
        { src: "/facebook1.png", alt: "Facebook" },
        { src: "/instagram1.png", alt: "Instagram" },
        { src: "/twitter1.png", alt: "Twitter" },
        { src: "/linkedin1.png", alt: "LinkedIn" },
        { src: "/youtube1.png", alt: "YouTube" }
    ];

    const handleBuyNow = async () => {
        setBuyNowLoading(true);
        try {
            const action = await dispatch(addToCart({ comboId: combo._id, quantity }));
            if (addToCart.fulfilled.match(action)) {
                toast.success("Added to cart successfully!");
                router.push('/checkout');
            } else {
                toast.error(action.payload as string || "Failed to add to cart");
            }
        } catch (error) {
            toast.error("Failed to add to cart");
        } finally {
            setBuyNowLoading(false);
        }
    };

    const handleReviewSubmit = () => {
        if (!userComment.trim()) {
            toast.error('Please enter a comment');
            return;
        }
        dispatch(postRating({
            productId: combo._id,
            rating: userRating,
            comment: userComment
        }));
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-[#E47B25] to-[#B3520A] px-4 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-white">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-white font-bold text-lg">Combo Details</h1>
                </div>
            </div>

            {/* Mobile Spacer */}
            <div className="md:hidden h-[60px]" />
            {/* Breadcrumbs */}
            <div className="hidden md:block max-w-[1400px] mx-auto px-4 md:px-14 py-6">
                <div className="flex items-center gap-2 text-[10px] md:text-sm font-medium">
                    <span className="text-gray-500 cursor-pointer hover:text-[#E47B25]" onClick={() => router.push('/')}>HOME</span>
                    <ChevronRight size={14} className="text-gray-400" />
                    <span className="text-gray-500 uppercase">COMBOS</span>
                    <ChevronRight size={14} className="text-gray-400" />
                    <span className="text-[#E47B25] uppercase">{combo.name}</span>
                </div>
            </div>

            <div className="md:max-w-[1400px] md:mx-auto px-4 md:px-14">
                <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-12">

                    {/* Left Column: Image Gallery */}
                    <div className="flex flex-col items-center">
                        <div className="flex flex-col-reverse lg:flex-row w-full gap-4">
                            {/* Thumbnails */}
                            <div className="grid grid-cols-5 lg:flex lg:flex-col gap-2 md:gap-3 w-full lg:w-auto">
                                {images.map((img: string, idx: number) => (
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
                            <div className="flex-1 relative aspect-square bg-white border border-gray-100 rounded-2xl flex items-center justify-center p-8 group">
                                <Image
                                    src={images[selectedImage]}
                                    alt={combo.name}
                                    width={500}
                                    height={500}
                                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                        </div>

                        {/* Social Share (Desktop) */}
                        <div className="hidden lg:flex flex-col items-center gap-4 mt-12">
                            <span className="text-xs font-semibold text-gray-500 tracking-wider">Share Combo On:</span>
                            <div className="flex gap-4">
                                {socialIcons.map((icon, idx) => (
                                    <div key={idx} className="w-10 h-10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                        <Image src={icon.src} alt={icon.alt} width={32} height={32} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Combo Info */}
                    <div className="flex flex-col space-y-4 mt-6 lg:mt-0">
                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-[#191919] leading-tight">
                                {combo.name}
                            </h1>
                            <p className="text-lg text-[#666666]">
                                Category: <span className="text-[#191919] font-medium">{combo.categories?.[0]?.title}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-[#FFC107]">
                                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                            </div>
                            <span className="text-gray-400">|</span>
                            <span
                                className="text-sm font-medium text-gray-900 cursor-pointer hover:text-[#E47B25]"
                                onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Write Review
                            </span>
                        </div>

                        <div className="text-[#666666] font-medium">
                            SKU: <span className="text-[#666666]">{combo.sku}</span>
                        </div>

                        {/* Items in Combo */}
                        <div className="pt-2">
                            <h3 className="text-[#EE9C24] font-bold text-lg mb-2">What's inside this combo:</h3>
                            <ul className="space-y-2">
                                {combo.items?.map((item: any, idx: number) => (
                                    <li key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                        <div className="w-12 h-12 relative flex-shrink-0 bg-white rounded border border-gray-200">
                                            <Image src={item.variant?.product?.icon || item.variant?.icon || "/placeholder.png"} alt={item.productName} fill className="object-contain p-1" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{item.productName || item.variant?.product?.name}</p>
                                            <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pricing */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex flex-row justify-between items-start">
                                <div>
                                    <p className="text-xs md:text-sm text-[#191919] font-medium mb-1">Total MRP</p>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <span className="text-2xl md:text-3xl text-[#666666] line-through font-medium">₹{combo.totalMrp}</span>
                                        {combo.discountAmount > 0 && (
                                            <span className="bg-white border border-[#EE9C24] text-[#191919] text-[10px] md:text-xs font-medium px-2 py-1 md:px-4 md:py-2 rounded-lg">
                                                ₹{combo.discountAmount} Off
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs md:text-sm text-[#191919] font-medium mb-1">Combo Price:</p>
                                    <div className="flex items-baseline gap-1 md:gap-2">
                                        <span className="text-2xl md:text-4xl font-bold text-[#E47B25]">₹{combo.comboPrice}</span>
                                        <span className="text-[10px] md:text-sm text-[#666666] font-medium">(incl. gst)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-4 md:gap-6 pt-4">
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

                            <div className="flex items-center gap-2 md:gap-4 w-full">
                                <button
                                    onClick={handleBuyNow}
                                    disabled={buyNowLoading}
                                    className="flex-1 bg-gradient-to-b from-[#EE9C24] to-[#B3520A] text-white font-bold text-[13px] md:text-lg h-11 md:h-[54px] rounded-lg shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {buyNowLoading && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                                    {buyNowLoading ? 'Processing...' : 'Buy Now'}
                                </button>
                                <button className="shrink-0 bg-white border border-[#EE9C24] text-[#EE9C24] p-2 md:p-3.5 h-11 w-11 md:h-[54px] md:w-[54px] flex items-center justify-center rounded-lg shadow-sm active:scale-95 transition-all">
                                    <Heart size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabbed Info Section */}
                <div className="mt-12 border-t border-gray-100 py-8">
                    <div className="flex justify-center gap-8 md:gap-24 border-b border-gray-100 mb-8">
                        {['Description', 'Specifications', 'Applications'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-base md:text-xl font-medium transition-all relative ${activeTab === tab ? 'text-[#E47B25]' : 'text-[#333333]'}`}
                            >
                                {tab}
                                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#E47B25]" />}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[300px]">
                        {activeTab === 'Description' && (
                            <div className="space-y-8">
                                <p className="text-gray-700 leading-relaxed italic border-l-4 border-[#E47B25] pl-4">
                                    High-performance combo curated for specialized needs.
                                </p>

                                {combo.keyFeatures?.map((feature: any, idx: number) => (
                                    <div key={idx} className="space-y-3">
                                        <h3 className="text-[#EE9C24] font-bold text-xl">{feature.title}</h3>
                                        <ul className="space-y-2 list-disc pl-5">
                                            {feature.points?.map((point: string, pIdx: number) => (
                                                <li key={pIdx} className="text-gray-700">{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'Specifications' && (
                            <div className="space-y-8">
                                {combo.specification?.map((spec: any, idx: number) => (
                                    <div key={idx} className="space-y-3">
                                        <h3 className="text-[#EE9C24] font-bold text-xl">{spec.title}</h3>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <ul className="divide-y divide-gray-200">
                                                {spec.points?.map((point: string, pIdx: number) => (
                                                    <li key={pIdx} className="px-4 py-3 bg-white text-gray-700">{point}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'Applications' && (
                            <div className="space-y-4">
                                <h3 className="text-[#EE9C24] font-bold text-xl">Best Used For:</h3>
                                <ul className="space-y-2 list-disc pl-5">
                                    {combo.applications?.map((app: string, idx: number) => (
                                        <li key={idx} className="text-gray-700">{app}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Code Tab Section if exists */}
                {combo.codeTab && combo.codeTab.length > 0 && (
                    <div className="mb-20">
                        <h3 className="text-[#EE9C24] font-bold text-xl mb-4">Combo Code / Instructions</h3>
                        <div className="bg-gray-900 text-green-400 p-6 rounded-xl font-mono text-sm overflow-x-auto">
                            {combo.codeTab.map((line: string, idx: number) => (
                                <div key={idx} className="flex gap-6">
                                    <span className="text-gray-600 select-none w-8">{idx + 1}</span>
                                    <span>{line}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Write Reviews Section */}
                <div className="mt-20 border-t border-gray-100 pt-16" id="reviews-section">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 max-w-[1200px] mx-auto">
                        <div className="flex-1 space-y-10">
                            <div className="space-y-4">
                                <h3 className="text-[#EE9C24] text-3xl font-medium">Write Reviews</h3>
                                <div className="w-20 h-1.5 bg-gradient-to-r from-[#EE9C24] to-[#B3520A] rounded-full" />
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <span className="text-[#666666] font-bold text-xl ">Rate Us</span>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={32}
                                                className={`cursor-pointer transition-all hover:scale-110 ${star <= userRating ? "text-[#FFC107] fill-[#FFC107]" : "text-gray-200"}`}
                                                onClick={() => setUserRating(star)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <label className="block text-[#666666] font-medium text-xl">Your Review</label>
                                    <textarea
                                        rows={6}
                                        placeholder="Enter Your Review"
                                        value={userComment}
                                        onChange={(e) => setUserComment(e.target.value)}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-5 text-gray-700 outline-none focus:border-[#EE9C24] transition-all resize-none text-lg placeholder:text-gray-300"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={handleReviewSubmit}
                                        disabled={ratingLoading}
                                        className="flex-1 bg-gradient-to-b from-[#EE9C24] to-[#B3520A] text-white font-bold py-5 rounded-2xl shadow-xl shadow-orange-100 hover:shadow-orange-200 disabled:opacity-50 transition-all active:scale-95 text-xl"
                                    >
                                        {ratingLoading ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                    <button
                                        onClick={() => setUserComment('')}
                                        className="flex-1 bg-white border-2 border-gray-100 text-[#191919] font-bold py-5 rounded-2xl hover:bg-gray-50 transition-all text-xl"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-1/3 flex items-center justify-center">
                            <div className="w-full aspect-square border-4 border-gray-100 border-dashed rounded-[40px] flex flex-col items-center justify-center p-12 bg-gray-50 group hover:border-orange-100 transition-all">
                                <div className="text-center space-y-8">
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                        <MessageCircle size={48} className="text-[#EE9C24]" />
                                    </div>
                                    <p className="text-[#191919] font-bold text-xl leading-relaxed">Share your experience with this combo!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComboDetailPage;
