'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Truck, MapPin, ChevronRight } from 'lucide-react';
import CancelOrderModal from './CancelOrderModal';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
}

interface Order {
  id: string;
  status: 'shipping' | 'pending' | 'arrived' | 'canceled';
  statusText: string;
  origin: string;
  originDetail?: string;
  destination: string;
  destinationDetail?: string;
  estimatedArrival: string;
  products: Product[];
  orderDate: string;
  subtotal: number;
  gst: number;
  total: number;
}

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleCancelConfirm = (reason: string) => {
    console.log(`Order ${order.id} cancelled for reason: ${reason}`);
    setIsCancelModalOpen(false);
    // In a real app, you would dispatch an action or call an API here
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-[24px] border border-gray-200 sm:border-gray-100 p-4 sm:p-6 md:p-8 shadow-sm">
      {/* Order Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-8 border-b border-gray-100 sm:border-gray-50 pb-3 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Image src="/order.png" alt="Order" width={16} height={16} className="sm:w-[20px] sm:h-[20px]" />
          <h3 className="text-xs sm:text-xl font-bold text-gray-800 tracking-tight">{order.id}</h3>
        </div>
        <div className="bg-[#fff9ef] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-[#EE9C24]">
          <span className="text-[#E47B25] text-[10px] sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#E47B25]"></span>
            {order.statusText}
          </span>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="flex flex-row items-center justify-start sm:justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-10 w-[calc(100%+2rem)] -mx-4 px-4 sm:w-full sm:mx-0 sm:px-2 overflow-x-auto no-scrollbar pb-2 pt-1">
        
        {/* Origin */}
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-3 bg-white border border-gray-800 sm:border-gray-200 rounded-full px-3.5 py-1.5 sm:px-6 sm:py-3 sm:shadow-sm justify-center">
          <Image src="/cargo.png" height={20} width={20} alt="cargo" className="w-[14px] h-[14px] sm:w-[20px] sm:h-[20px]" />
          <span className="text-[11px] sm:text-sm font-medium text-[#333333] whitespace-nowrap">
            {order.originDetail || order.origin}
          </span>
        </div>

        {/* Separator 1 */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0 justify-center">
          <Image src="/arrow1.png" alt="Line" width={30} height={30} />
        </div>
        <div className="flex sm:hidden flex-shrink-0 text-black font-bold tracking-widest text-[10px] mx-1">
          ● - - -
        </div>

        {/* Estimation */}
        <div className="flex flex-shrink-0 bg-white border border-gray-400 sm:border-gray-300 rounded-full px-3.5 py-1.5 sm:px-6 sm:py-3 sm:shadow-sm text-center text-[11px] sm:text-base whitespace-nowrap">
          Estimate arrival : <span className="text-[#333333] sm:inline block sm:ml-0 font-medium ml-1">{order.estimatedArrival}</span>
        </div>

        {/* Separator 2 */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0 justify-center">
           <Image src="/arrow2.png" alt="Line" width={30} height={30} />
        </div>
        <div className="flex sm:hidden flex-shrink-0 text-black font-bold tracking-widest text-[10px] mx-1">
          ● - - -
        </div>

        {/* Destination */}
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-3 bg-white border border-gray-400 sm:border-gray-300 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-3 sm:shadow-sm min-w-max justify-center">
          <MapPin size={20} className="text-gray-500 w-[14px] h-[14px] sm:w-[20px] sm:h-[20px]" />
          <span className="text-[11px] sm:text-sm font-medium text-[#333333] whitespace-nowrap">
            {order.destinationDetail || order.destination}
          </span>
        </div>

      </div>

      {/* Product Detail Card */}
      <div className="bg-[#FAFAFA] sm:bg-[#fdfeff] border border-gray-100 rounded-xl sm:rounded-[32px] p-3 sm:p-6 mb-4 sm:mb-8 shadow-sm text-left">
        {order.products.map((product) => (
          <div key={product.id} className="flex flex-row items-center gap-3 sm:gap-6">
            {/* Product Image */}
            <div className="w-16 h-16 sm:w-32 sm:h-32 bg-white rounded-lg sm:rounded-2xl border border-gray-100 flex items-center justify-center p-1 sm:p-2 shrink-0 overflow-hidden shadow-inner">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 text-left">
              <h4 className="text-[10px] sm:text-lg font-bold text-gray-800 mb-0.5 sm:mb-1">{product.name}</h4>
              <p className="text-[8px] sm:text-sm text-gray-400 mb-1 sm:mb-3 line-clamp-2 max-w-md leading-tight sm:leading-relaxed">
                {product.description}
              </p>
              <div className="flex items-center justify-start gap-2 sm:gap-4 mb-2 sm:mb-4">
                <span className="text-[11px] sm:text-xl font-bold text-[#E47B25]">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-[9px] sm:text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                )}
              </div>
              <button className="bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white px-5 sm:px-10 py-1 sm:py-2 rounded sm:rounded-xl text-[9px] sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 pt-2">
        <div className="text-[10px] sm:text-lg font-medium text-gray-800 w-full sm:w-auto text-left sm:text-left">
          <span className="text-[#333333] ">Total : </span>
          <span className="text-[11px] sm:text-xl text-[#333333] font-bold">₹{order.total.toLocaleString()}</span>
          <span className="text-[8px] sm:text-[12px] text-[#666666] ml-1 sm:ml-2 font-normal">including GST</span>
        </div>
        
        <div className="flex items-center justify-end sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto pb-1 sm:pb-0">
          <button 
            onClick={() => setIsCancelModalOpen(true)}
            className="flex-none px-4 py-1.5 sm:px-8 sm:py-3 border border-gray-200 text-gray-600 rounded-full text-[10px] sm:text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm ml-auto sm:ml-0"
          >
            Cancel Order
          </button>
          <button className="flex-none px-6 py-1.5 sm:px-10 sm:py-3 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white rounded-full text-[10px] sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
            {order.status === 'shipping' ? 'View All' : 'Pay now'}
          </button>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        orderId={order.id}
      />
    </div>
  );
};

export default OrderCard;
