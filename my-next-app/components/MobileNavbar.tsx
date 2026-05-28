"use client";
import Image from 'next/image';
import React from 'react';
// import { Home, Headphones, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import WishlistModal from './WishlistModal';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { fetchCart } from '@/redux/slices/cartSlice';
import { fetchWishlist } from '@/redux/slices/wishlistSlice';

const MobileNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

  useEffect(() => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (activeToken) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, token]);

  const navItems = [
    { label: 'Home', icon: <Image src="/home.png" alt="Home" width={20} height={20} />, href: '/' },
    { label: 'Contact', icon: <Image src="/inquiry.png" alt="contact" width={20} height={20} />, href: '/bulk-inquiry' },
    { label: 'Categories', icon: <Image src="/categories.png" alt="categories" width={20} height={20} />, href: '/allproduct' },
    { label: 'Cart', icon: <Image src="/mobilecart.png" alt="cart" width={20} height={20} />, href: '/cart' },
    { label: 'Profile', icon: <Image src="/profile.png" alt="profile" width={20} height={20} />, href: '/profile' },
  ];

  const activeIndex = navItems.findIndex(item => pathname === item.href);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[160] md:hidden block">
      <div className="relative z-[170] h-[65px] flex items-center justify-between px-2 bg-white shadow-[0_-5px_30px_rgba(0,0,0,0.08)]">
        {/* Dynamic Hump Curve */}
        <div
          className="absolute -top-6 w-[80px] h-[55px] bg-white rounded-t-full shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] transition-all duration-500 ease-out"
          style={{
            left: `${(activeIndex !== -1 ? activeIndex : 0) * 20 + 10}%`,
            transform: 'translateX(-50%)'
          }}
        />

        {navItems.map((item, idx) => {
          const isActive = pathname === item.href;

          return (
            <div
              key={idx}
              onClick={() => router.push(item.href)}
              className="relative flex-1 flex flex-col items-center justify-center cursor-pointer group"
            >
              {/* Icon Container */}
              <div className={`
                relative transition-all duration-500 ease-out z-10
                ${isActive
                  ? '-translate-y-8 scale-110 w-12 h-12 rounded-full bg-gradient-to-b from-[#EE9C24] to-[#B3520A] shadow-lg flex items-center justify-center'
                  : 'w-6 h-6 opacity-60 group-hover:opacity-100'}
              `}>
                <div className={`
                  flex items-center justify-center transition-all duration-300
                  ${isActive ? 'brightness-0 invert' : ''}
                `}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, {
                    width: item.label === 'Categories' ? (isActive ? 32 : 28) : (isActive ? 24 : 20),
                    height: item.label === 'Categories' ? (isActive ? 32 : 28) : (isActive ? 24 : 20)
                  })}
                </div>

                {/* Badge for Cart */}
                {item.label === 'Cart' && cartItems.length > 0 && (
                  <span className={`
                    absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white
                    ${isActive ? 'translate-x-1 -translate-y-1' : ''}
                  `}>
                    {cartItems.length}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`
                text-[10px] font-bold -mt-1 transition-all duration-300
                ${isActive ? 'text-[#E47B25] opacity-100' : 'text-gray-400 opacity-60'}
              `}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
      />
    </div>
  );
};

export default MobileNavbar;
