"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Star, Trash2, ChevronLeft, ChevronRight, Plus, X, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { removeFromWishlist } from '@/redux/slices/wishlistSlice';
import { addToCart } from '@/redux/slices/cartSlice';
import toast from 'react-hot-toast';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistModal: React.FC<WishlistModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((state: RootState) => state.wishlist);

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    items.forEach(item => {
      const category = item.product?.category?.title || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    return groups;
  }, [items]);

  const categories = Object.keys(groupedItems);

  if (!isOpen) return null;

  const handleRemove = (wishlistId: string, productId?: string, variantId?: string) => {
    if (wishlistId) {
      dispatch(removeFromWishlist({ wishlistId }));
    } else if (productId) {
      dispatch(removeFromWishlist({ productId, variantId }));
    }
  };

  const handleAddToCart = async (variantId: string) => {
    try {
      const action = await dispatch(addToCart({ variantId, quantity: 1 }));
      if (addToCart.fulfilled.match(action)) {
        toast.success('Added to cart successfully!');
        return true;
      } else {
        const errorMsg = action.payload as string || 'Failed to add to cart';
        toast.error(errorMsg);
        return false;
      }
    } catch (err) {
      toast.error('Failed to add to cart');
      return false;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex justify-end bg-black/40  transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className={`bg-white w-full md:w-[70%] lg:w-[60%] h-full md:h-full pb-[65px] md:pb-0 shadow-2xl flex flex-col transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Matching SS */}
        <div className="p-4 md:p-8 border border-[#E47B25] flex items-center justify-between relative bg-white">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={onClose}
              className="md:w-12 md:h-12 w-8 h-8 flex items-center justify-center rounded-full md:border md:border-[#E47B25]/30 text-[#E47B25] hover:bg-[#E47B25]/5 transition-all"
            >
              <ArrowLeft size={20} className="md:w-6 md:h-6" />
            </button>

            <div className="flex flex-col">
              <h2 className="text-lg md:text-2xl font-bold text-[#0D0C0D] ">Wishlist</h2>
              <p className="text-[#666666] text-[10px] md:text-sm font-medium">Your favorites, all in one place.</p>
            </div>
          </div>

          <div className="md:w-12 md:h-12 w-10 h-10 flex items-center justify-center rounded-full border border-[#E47B25] relative bg-white group cursor-pointer hover:bg-[#E47B25]/5 transition-colors">
            <Heart size={24} className="text-[#E47B25] md:w-6 md:h-6" />
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white text-[8px] md:text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
              {items.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-10 no-scrollbar bg-white">
          {categories.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Heart size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Your wishlist is empty</h3>
              <p className="text-sm text-gray-500 mt-1">Explore our products and add some favorites!</p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category} className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between  pb-2">
                  <span className="text-xs md:text-md font-medium text-[#0D0C0D]">Category</span>
                  <span className="text-xs md:text-md font-medium text-[#0D0C0D]">{category}</span>
                </div>

                <div className="relative">
                  {/* Category Nav Arrows - Responsive */}
                  <button className="absolute -left-2 md:-left-7 top-1/2 -translate-y-1/2 z-10 w-6 h-6 md:w-6 md:h-6 flex items-center justify-center bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                    <ChevronLeft size={12} className="md:w-4 md:h-4" />
                  </button>
                  <button className="absolute -right-2 md:-right-7 top-1/2 -translate-y-1/2 z-10 w-6 h-6 md:w-6 md:h-6 flex items-center justify-center bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                    <ChevronRight size={12} className="md:w-4 md:h-4" />
                  </button>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {groupedItems[category].map((item: any) => {
                      const product = item.product || {};
                      const variant = item.variant || {};
                      
                      // Robust data extraction
                      const title = product.name || product.title || product.productName || 'Product';
                      const description = product.description || product.shortDescription || "";
                      
                      // Image extraction - handle string, array of strings, or variant images
                      const image = (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) || 
                                    product.icon || 
                                    (typeof product.image === 'string' && product.image) || 
                                    variant.image || 
                                    '/bluetooth.png';
                      
                      const salePrice = variant.finalPrice || variant.salePrice || product.salePrice || product.price || 0;
                      const price = variant.mrp || variant.price || product.mrp || product.price || 0;
                      
                      const itemCategory = (typeof product.category === 'object' ? product.category?.title : product.category) || category || 'Other';

                      return (
                        <div
                          key={item._id}
                          className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-2 md:p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow relative"
                        >
                          {/* Remove button */}
                          <button
                            onClick={() => handleRemove(item._id, product._id || item.product?._id, variant._id)}
                            className="absolute top-2 right-2 z-10 p-1 bg-white border border-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors shadow-sm"
                          >
                            <Trash2 size={12} className="md:w-3.5 md:h-3.5" />
                          </button>

                          {/* Image */}
                          <div className="aspect-square flex items-center justify-center mb-2 md:mb-4 p-2 md:p-4 bg-white">
                            <Image
                              src={image}
                              alt={title}
                              width={140}
                              height={140}
                              className="object-contain"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex flex-col flex-1">
                            <div className="flex flex-col mb-1 md:mb-2">
                              <h4 className="text-[10px] md:text-[14px] font-bold text-gray-900 line-clamp-2 pr-1">{title}</h4>
                              <div className="flex items-center text-yellow-400 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={8} className="md:w-2.5 md:h-2.5" fill="currentColor" stroke="none" />
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-2">
                              <span className="text-[7px] md:text-[9px] font-bold text-gray-400 border border-gray-200 px-1.5 md:px-2 py-0.5 rounded whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
                                {itemCategory}
                              </span>
                            </div>

                            <p className="text-[8px] md:text-[11px] text-gray-500 line-clamp-2 mb-2 md:mb-4 leading-tight md:leading-relaxed font-medium">
                              {description}
                            </p>

                            <div className="mt-auto flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-[7px] md:text-[10px] text-gray-400 font-bold leading-none">Price</span>
                                  <div className="flex items-baseline gap-1 md:gap-1.5">
                                    <span className="text-[11px] md:text-[15px] font-black text-gray-900 leading-none">₹{salePrice}</span>
                                    {price > salePrice && (
                                      <span className="text-[8px] md:text-[10px] text-gray-400 line-through font-bold leading-none">₹{price}</span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleAddToCart(variant._id || product.variants?.[0]?._id || product._id)}
                                  className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white rounded shadow-sm hover:opacity-90 transition-opacity"
                                >
                                  <ShoppingCart size={10} className="md:w-3.5 md:h-3.5" />
                                </button>
                              </div>
                              <button 
                                onClick={async () => {
                                  const success = await handleAddToCart(variant._id || product.variants?.[0]?._id || product._id);
                                  if (success) {
                                    onClose();
                                    router.push('/checkout');
                                  }
                                }}
                                className="w-full py-1.5 md:py-2 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white text-[8px] md:text-[11px] font-black rounded shadow-md hover:opacity-90 transition-opacity uppercase"
                              >
                                Buy Now
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer - Matching SS */}
        <div className="p-4 md:p-8 border-t bg-white flex flex-col items-center gap-3 md:gap-4">
          <button
            onClick={onClose}
            className="w-full max-w-md py-3 md:py-4 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white font-black text-[10px] md:text-sm rounded-lg md:rounded-xl shadow-lg hover:shadow-[#EE9C24] transition-all flex items-center justify-center gap-2"
          >
            <Plus size={14} className="md:w-[18px] md:h-[18px]" strokeWidth={3} />
            ADD MORE PRODUCT
          </button>
          <p className="text-[10px] md:text-sm font-bold text-gray-500">
            Total {items.length} items in Your List
          </p>
        </div>
      </div>
    </div>
  );
};

export default WishlistModal;
