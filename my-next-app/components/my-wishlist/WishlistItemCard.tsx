"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { removeFromWishlist } from '@/redux/slices/wishlistSlice';
import { addToCart } from "@/redux/slices/cartSlice";
import toast from 'react-hot-toast';

interface WishlistItemCardProps {
    item: any;
}

export default function WishlistItemCard({
    item,
}: WishlistItemCardProps) {
    const dispatch = useDispatch<AppDispatch>();
    
    // Extracting data safely from populated product/variant
    const product = item.product || {};
    const variant = item.variant || {};
    const category = item.category || {};
    
    const title = product.name || product.title || category.title || "Unknown Product";
    const description = product.description || category.description || "";
    const price = variant.finalPrice || variant.price || 0;
    const oldPrice = variant.mrp || 0;
    const image = (product.images && product.images[0]) || (product.icon && product.icon !== 'false' ? product.icon : null) || (category.icon && category.icon !== 'false' ? category.icon : null) || variant.image || "/bluetooth.png";

    return (
        <article className="card p-5 sm:p-6 md:p-8 rounded-[20px] md:rounded-[28px]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 md:gap-8">
                <div className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[170px] md:h-[170px] rounded-[18px] border border-[var(--border-light)] bg-white shrink-0 overflow-hidden">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-contain p-3 sm:p-4 md:p-5"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-heading text-xl sm:text-base md:text-lg font-semibold leading-tight">
                        {title}
                    </h3>

                    <p className="text-heading/80 text-lg sm:text-base md:text-[1rem] leading-relaxed mt-3 line-clamp-2">
                        {description}
                    </p>

                    <div className="flex items-end gap-2 sm:gap-3 mt-4">
                        <span className="text-[#E47B25] text-xl sm:text-lg font-bold leading-none">
                            {"\u20B9"}{price}
                        </span>
                        {oldPrice > price && (
                            <span className="text-muted text-lg sm:text-base line-through leading-none">
                                {"\u20B9"}{oldPrice}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mt-5">
                        <button
                            type="button"
                            onClick={async () => {
                                if (variant._id) {
                                    try {
                                        const action = await dispatch(addToCart({ variantId: variant._id, quantity: 1 }));
                                        if (addToCart.fulfilled.match(action)) {
                                            toast.success("Added to cart successfully!");
                                        } else {
                                            const errorMsg = action.payload as string || "Failed to add to cart";
                                            toast.error(errorMsg);
                                        }
                                    } catch (err) {
                                        toast.error("Failed to add to cart");
                                    }
                                }
                            }}
                            className="bg-primary-gradient text-white px-3 sm:px-5 py-1 sm:py-2 rounded-lg text-[0.7rem] sm:text-[0.9rem] font-medium transition hover:shadow-md"
                        >
                            Add To Cart
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (item._id) {
                                    dispatch(removeFromWishlist({ wishlistId: item._id }));
                                } else {
                                    const pId = item.product?._id || item.variant?.productId;
                                    const vId = item.variant?._id;
                                    dispatch(removeFromWishlist({ productId: pId, variantId: vId }));
                                }
                            }}
                            aria-label={`Remove ${title} from wishlist`}
                            className="text-[#7A7A7A] hover:text-[#BA460F] transition"
                        >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={1.75} />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

