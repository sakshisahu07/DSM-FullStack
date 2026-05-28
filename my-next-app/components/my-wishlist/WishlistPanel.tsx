"use client";

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchWishlist } from '@/redux/slices/wishlistSlice';
import WishlistItemCard from "./WishlistItemCard";
import Link from 'next/link';

export default function WishlistPanel() {
    const dispatch = useDispatch<AppDispatch>();
    const { items, loading, error } = useSelector((state: RootState) => state.wishlist);
    const { token } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
        if (activeToken) {
            dispatch(fetchWishlist());
        }
    }, [dispatch, token]);

    if (!token && (typeof window !== 'undefined' && !localStorage.getItem('token'))) {
        return (
            <section className="card p-5 sm:p-6 md:p-8 lg:p-10 rounded-[20px] md:rounded-[28px] text-center">
                <h2 className="text-xl font-semibold mb-4">Please Login</h2>
                <p className="text-muted mb-6">You need to be logged in to view your wishlist.</p>
                <Link href="/login" className="bg-primary-gradient text-white px-6 py-2 rounded-lg font-medium">
                    Login Now
                </Link>
            </section>
        );
    }

    return (
        <section className="card p-5 sm:p-6 md:p-8 lg:p-10 rounded-[20px] md:rounded-[28px]">
            <div className="mb-6 md:mb-8">
                <h2 className="text-heading text-2xl sm:text-3xl font-semibold">
                    My Wish List
                </h2>
                <div className="w-36 sm:w-44 h-1 bg-primary-gradient rounded-full mt-4" />
            </div>

            <div className="space-y-5 md:space-y-7">
                {loading && (
                    <div className="flex flex-col items-center py-20 animate-pulse">
                        <div className="w-12 h-12 border-4 border-[#EE9C24] border-t-[#EE9C24] rounded-full animate-spin mb-4" />
                        <p className="text-muted">Loading your wishlist...</p>
                    </div>
                )}
                
                {!loading && items.length === 0 && (
                    <div className="text-center py-20 flex flex-col items-center">
                        <div className="w-16 h-16 bg-[#EE9C24] rounded-full flex items-center justify-center mb-4 text-[#EE9C24]">
                             {/* Heart icon placeholder */}
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</p>
                        <p className="text-muted mb-6">Looks like you haven't added anything to your wishlist yet.</p>
                        <Link href="/allproduct" className="bg-primary-gradient text-white px-6 py-2 rounded-lg font-medium">
                            Explore Products
                        </Link>
                    </div>
                )}
                
                {error && !loading && (
                    <div className="text-center py-10">
                        <p className="text-red-500 mb-4">Error: {error}</p>
                        <button 
                            onClick={() => dispatch(fetchWishlist())}
                            className="text-[#EE9C24] font-medium hover:underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}
                
                {items.map((item: any) => (
                    <WishlistItemCard key={item._id} item={item} />
                ))}
            </div>
        </section>
    );
}

