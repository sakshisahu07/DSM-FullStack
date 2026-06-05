"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { addToCart } from '@/redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/redux/slices/wishlistSlice';
import toast from 'react-hot-toast';

interface Product {
  _id?: string;
  id?: string | number;
  name?: string;
  title?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  oldPrice?: number;
  rating?: number;
  category?: string;
  subcategory?: string;
  subCategory?: string;
  image: string;
  images?: string[];
  isHot?: boolean;
  discount?: string | number;
  timeLeft?: string;
  variantId?: string;
  isTrending?: boolean;
  isSpecialOffer?: boolean;
  isFlashSale?: boolean;
}

const ProductCard = ({ product }: { product: Product }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);

  const productObj = product as any;
  const pId = productObj._id || product.id?.toString();
  const vId = productObj.variantId || productObj.variant?._id || productObj.variant || pId;
  const slug = productObj.slug;
  const isCombo = productObj.isCombo;
  const images = product.images || productObj.images || [product.image];

  const isInWishlist = wishlistItems.some((item: any) =>
    (item.variant === vId) || (item.variant?._id === vId) || (item.product?._id === pId)
  );
  const wishlistId = wishlistItems.find((item: any) =>
    (item.variant === vId) || (item.variant?._id === vId) || (item.product?._id === pId)
  )?._id;
  const name = product.name || product.title || "";
  const description = product.description || "";
  const originalPrice = product.originalPrice || product.oldPrice || product.price;
  const rating = product.rating ?? productObj.avgRating ?? 0;

  const [isHovered, setIsHovered] = React.useState(false);
  const [timeLeftStr, setTimeLeftStr] = React.useState(product.timeLeft);

  const getValidImage = (img: any) => {
    if (!img || typeof img !== 'string' || img === "false" || img === "null" || img.trim() === "") {
      return "/bluetooth.png"; // Fallback placeholder
    }
    return img;
  };

  const info = productObj.flashSaleInfo || productObj.hotDealInfo || productObj.specialOfferInfo;
  const endDate = info?.endDate;

  React.useEffect(() => {
    if (!endDate) {
      setTimeLeftStr(product.timeLeft);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(endDate);
      const diffMs = end.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeftStr("Expired");
      } else {
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        const formatted = `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;
        setTimeLeftStr(formatted);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [product.timeLeft, endDate]);

  return (
    <div
      onClick={() => {
        if (isCombo && slug) {
          router.push(`/combo/${slug}`);
        } else {
          router.push(`/product/${pId}`);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full h-full bg-white rounded-[20px] md:rounded-3xl p-0 relative flex flex-col group hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer"
    >
      {/* Hot Badge (Diagonal Ribbon) */}
      {product.isHot && (
        <div className="absolute top-0 left-0 w-20 h-20 md:w-24 md:h-24 overflow-hidden z-20 pointer-events-none rounded-tl-[20px] md:rounded-tl-3xl">
          <div className="absolute top-3 left-[-35px] md:top-4 w-[140%] h-7 md:h-8 bg-gradient-to-r from-[#E47B25] to-[#B3520A] -rotate-45 flex items-center justify-center shadow-md border-y border-white/10">
            <span className="text-white text-[9px] md:text-[11px] font-black tracking-widest uppercase flex items-center gap-1 drop-shadow-md">
              <span className="w-4 h-4 md:w-5 md:h-5 flex items-center">
                <Image src="/hot.png" alt="Hot" width={20} height={20} />
              </span>
              Hot
            </span>
          </div>
        </div>
      )}

      {/* Trending Badge */}
      {product.isTrending && !product.isHot && !product.discount && (
        <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
          <div className="bg-[#E47B25] text-white text-[9px] md:text-[11px] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm font-medium">
            🔥 Trending
          </div>
        </div>
      )}

      {/* Discount Badge */}
      {(product.discount || product.isSpecialOffer) && !product.isHot && !product.isFlashSale && (
        <div className="absolute top-4 left-[-8px] z-20 drop-shadow-md">
          <div className="absolute top-full left-0 w-0 h-0 border-t-[8px] border-t-[#9c4205] border-l-[8px] border-l-transparent"></div>
          <div className="bg-gradient-to-r from-[#D26D19] to-[#B3520A] text-white text-[10px] md:text-xs font-bold px-3 md:px-4 py-1 flex items-center justify-center shadow-sm">
            <span>{typeof product.discount === 'number' ? `${product.discount}% Off` : (product.discount || "50% Off")}</span>
          </div>
        </div>
      )}

      {/* Flash Sale / Timer Badge */}
      {timeLeftStr && !product.isHot && !product.isSpecialOffer && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-white/90 backdrop-blur-sm border border-[#EE9C24] text-[#E47B25] text-[8px] md:text-[14px] px-1  py-1 md:py-1.5 flex items-center gap-2 md:gap-2 rounded-md shadow-lg">
            <Image src="/clock.png" width={14} height={14} alt="clock" className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span>{timeLeftStr}</span>
          </div>
        </div>
      )}

      {/* Wishlist Heart */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (isInWishlist) {
              dispatch(removeFromWishlist({ productId: pId, variantId: vId }));
            } else {
              dispatch(addToWishlist(vId));
            }
          }}
          className="bg-white/90 backdrop-blur-sm p-2 md:p-2.5 rounded-full shadow-lg text-[#E47B25] hover:scale-110 active:scale-95 cursor-pointer transition-all border border-gray-50 group/heart"
        >
          <Heart
            className={`h-4 w-4 md:w-5 md:h-5 transition-all duration-300 ${isInWishlist ? 'fill-[#B3520A] text-[#B3520A] scale-110' : 'fill-none hover:text-[#E47B25]'}`}
          />
        </div>
      </div>

      {/* Product Image Area */}
      <div className="relative w-full aspect-[4/3] bg-white p-2 md:p-6 flex items-center justify-center overflow-hidden rounded-t-[20px] md:rounded-t-3xl">
        {/* Main Image */}
        <Image
          src={getValidImage(product.image || images[0])}
          alt={name || "Product Image"}
          width={280}
          height={180}
          className={`object-cover w-full h-full transition-all duration-300 ${isHovered && images.length > 1 ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {/* Hover Image */}
        {images.length > 1 && (
          <Image
            src={getValidImage(images[1])}
            alt={name ? `${name} hover` : "Product Image Hover"}
            width={280}
            height={180}
            className={`absolute inset-0 object-cover w-full h-full p-2 md:p-6 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-6 pt-1 md:pt-2 flex-1 flex flex-col space-y-2 md:space-y-4 border-t border-gray-50">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
          <h3 className="text-[11px] md:text-[14px] font-bold text-[#000000] leading-tight flex-1 line-clamp-2 md:line-clamp-2">
            {name}
          </h3>
          <div className="flex gap-0.5 text-[#FFC107] pt-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className="md:w-[14px] md:h-[14px]" fill={i < rating ? "currentColor" : "none"} />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 md:gap-2">
          <span className="text-[8px] md:text-[8px] font-medium text-[#000000] border border-[#000000] px-1.5 py-0.5 md:px-1 md:py-1 rounded-[4px] md:rounded-md ">
            {product.category || "Category"}
          </span>
          <span className="text-[8px] md:text-[8px] font-medium text-[#000000] border border-[#000000] px-1.5 py-0.5 md:px-1 md:py-1 rounded-[4px] md:rounded-md ">
            {product.subcategory || "Sub"}
          </span>
        </div>

        <p className="hidden md:block text-[13px] text-[#000000] w-full md:w-[80%] line-clamp-2 font-medium leading-relaxed">
          {description}
        </p>

        <div className="flex items-end justify-between pt-1 md:pt-2 mt-auto gap-1">
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] md:text-[8px] text-[#000000] font-bold ">Price</span>
            <div className="flex flex-wrap items-baseline gap-x-1 lg:gap-x-2">
              <span className="text-[11px] md:text-[13px] lg:text-[1rem] text-[#000000] leading-none font-bold">₹{product.price}</span>
              {originalPrice > product.price && (
                <span className="text-[8px] md:text-[9px] lg:text-xs text-gray-400 line-through font-medium truncate">₹{originalPrice}</span>
              )}
            </div>
          </div>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const action = isCombo
                  ? await dispatch(addToCart({ comboId: vId, quantity: 1 }))
                  : await dispatch(addToCart({ variantId: vId, quantity: 1 }));

                if (addToCart.fulfilled.match(action)) {
                  toast.success("Added to cart successfully!");
                  router.push('/cart');
                } else {
                  const errorMsg = action.payload as string || "Failed to add to cart";
                  toast.error(errorMsg);
                }
              } catch (err) {
                toast.error("Failed to add to cart");
              }
            }}
            className="bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white px-2 py-1.5 md:px-2 md:py-1.5 lg:px-4 lg:py-2 rounded-[4px] lg:rounded-lg flex items-center justify-center gap-1 lg:gap-2 text-[8px] md:text-[8px] lg:text-xs font-bold hover:shadow-lg transition-all active:scale-95 group/btn shadow-sm whitespace-nowrap shrink-0"
          >
            <ShoppingCart size={12} className="w-3 h-3 md:w-3 md:h-3 lg:w-4 lg:h-4 shrink-0" />
            <span className="whitespace-nowrap">Add to cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;