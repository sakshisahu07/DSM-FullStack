'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchOrderById } from '@/redux/slices/orderSlice';
import { X, Calendar, MapPin, CreditCard, Receipt, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export default function OrderDetailsModal({ isOpen, onClose, orderId }: OrderDetailsModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { currentOrder, loading, error } = useSelector((state: RootState) => state.order);

  useEffect(() => {
    if (isOpen && orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, isOpen, orderId]);

  if (!isOpen) return null;

  // Timeline helpers
  const steps = ['ORDERED', 'SHIPPED', 'ARRIVING', 'DELIVERED'];
  const getStepIndex = (status: string) => steps.indexOf(status);
  const activeIndex = currentOrder ? getStepIndex(currentOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 sm:p-8 md:p-10 flex flex-col text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold tracking-wider text-gray-400 uppercase">ORDER DETAILS</span>
            <h2 className="text-lg sm:text-2xl font-black text-gray-800 flex items-center gap-2">
              Order #{orderId.substring(0, 12)}...
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-[#E47B25] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm font-semibold animate-pulse">Loading dynamic order details from database...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-red-500 font-bold text-lg">Error Loading Order</p>
            <p className="text-gray-500 max-w-md text-sm">{error}</p>
            <button 
              onClick={() => dispatch(fetchOrderById(orderId))}
              className="px-6 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-700 font-bold transition-all text-sm"
            >
              Retry
            </button>
          </div>
        ) : currentOrder ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Timeline Progress */}
            {currentOrder.status === 'CANCELLED' ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 sm:p-6 flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
                <div className="text-left">
                  <h4 className="font-bold text-red-800 text-sm sm:text-base">Order Cancelled</h4>
                  <p className="text-xs text-red-600 mt-0.5">
                    Reason: {currentOrder.cancellationReason || 'Requested by customer.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#fdfeff] border border-gray-100 rounded-2xl p-4 sm:p-8 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 tracking-wider mb-6">DELIVERY STATUS TRACKER</h3>
                
                {/* Timeline Row */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-2">
                  {steps.map((step, idx) => {
                    const isDone = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;
                    return (
                      <React.Fragment key={step}>
                        <div className="flex items-center gap-3 md:flex-col md:gap-2 md:w-32 text-left md:text-center shrink-0">
                          {/* Node Icon */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isDone 
                              ? 'bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white shadow-md shadow-[#E47B25]/20 scale-105' 
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                          }`}>
                            {isDone ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                          </div>
                          
                          {/* Label */}
                          <div className="text-left md:text-center">
                            <span className={`block text-xs font-bold tracking-tight uppercase ${
                              isDone ? 'text-gray-800' : 'text-gray-400'
                            }`}>
                              {step === 'ARRIVING' ? 'OUT FOR DELIVERY' : step}
                            </span>
                            {isCurrent && (
                              <span className="inline-block px-2 py-0.5 bg-[#fff9ef] border border-[#EE9C24] text-[#E47B25] rounded-full text-[9px] font-bold mt-0.5">
                                ACTIVE
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Connector Line */}
                        {idx < steps.length - 1 && (
                          <div className={`hidden md:block flex-1 h-1 rounded-full transition-colors ${
                            idx < activeIndex ? 'bg-[#E47B25]' : 'bg-gray-100'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Split Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-5 sm:p-6 text-left">
                <h4 className="text-[10px] font-black tracking-wider text-gray-400 uppercase mb-4 flex items-center gap-2">
                  <MapPin size={14} className="text-[#E47B25]" /> SHIPPING ADDRESS
                </h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <p className="font-bold text-sm text-gray-800 mb-1">
                    {currentOrder.customerSnapshot?.firstName || 'Customer'} {currentOrder.customerSnapshot?.lastName || ''}
                  </p>
                  <p>{currentOrder.address?.street}</p>
                  <p>{currentOrder.address?.city}, {currentOrder.address?.state}</p>
                  <p>{currentOrder.address?.country} - <span className="font-mono font-bold text-gray-800">{currentOrder.address?.pincode}</span></p>
                  <p className="pt-2 text-gray-400">Phone: {currentOrder.customerSnapshot?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-5 sm:p-6 text-left">
                <h4 className="text-[10px] font-black tracking-wider text-gray-400 uppercase mb-4 flex items-center gap-2">
                  <CreditCard size={14} className="text-[#E47B25]" /> PAYMENT SUMMARY
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-bold text-gray-800">{currentOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      currentOrder.paymentStatus === 'PAID' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {currentOrder.paymentStatus}
                    </span>
                  </div>
                  {currentOrder.walletDiscount > 0 && (
                    <div className="flex justify-between text-orange-600 font-medium">
                      <span>Wallet Discount</span>
                      <span>-₹{currentOrder.walletDiscount}</span>
                    </div>
                  )}
                  {currentOrder.couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Coupon ({currentOrder.couponCode})</span>
                      <span>-₹{currentOrder.couponDiscount}</span>
                    </div>
                  )}
                  <div className="h-[1px] bg-gray-100 my-1" />
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-800">Grand Total</span>
                    <span className="font-black text-[#E47B25] text-base">₹{currentOrder.orderTotal?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Items Listing */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 text-left">
              <h4 className="text-[10px] font-black tracking-wider text-gray-400 uppercase mb-4 flex items-center gap-2">
                <Receipt size={14} className="text-[#E47B25]" /> ITEMS ORDERED
              </h4>
              <div className="space-y-4">
                {currentOrder.product?.map((item: any, idx: number) => {
                  const isCombo = item.itemType === 'combo';
                  const name = isCombo ? item.comboId?.name || 'Combo Pack' : item.productId?.name || 'Product';
                  const desc = isCombo ? 'Curated Bundle Offer' : (item.variantId?.size ? `Size: ${item.variantId.size}` : 'Component Item');
                  const image = isCombo ? item.comboId?.icon || '/placeholder.png' : item.productId?.icon || '/placeholder.png';
                  
                  return (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50/30 border border-gray-100 p-3 rounded-2xl">
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 bg-white border border-gray-100 rounded-xl flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-inner">
                        <img 
                          src={image} 
                          alt={name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 text-left">
                        <h5 className="font-bold text-xs sm:text-sm text-gray-800 leading-tight">{name}</h5>
                        <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
                      </div>

                      {/* Quantity & Pricing */}
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">Qty: {item.quantity}</span>
                        <span className="font-bold text-xs sm:text-sm text-gray-800 block mt-0.5">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invoices & Actions Footer */}
            {(currentOrder.invoiceUrl || currentOrder.cancellationInvoiceUrl) && (
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-3xl p-5 sm:p-6 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <FileText size={16} className="text-[#E47B25]" /> PDF Invoices Available
                  </h4>
                  <p className="text-xs text-gray-400">Download offical invoices for tax and payment records.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {currentOrder.invoiceUrl && (
                    <a 
                      href={currentOrder.invoiceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-2 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Receipt size={12} /> Commercial Invoice
                    </a>
                  )}
                  {currentOrder.cancellationInvoiceUrl && (
                    <a 
                      href={currentOrder.cancellationInvoiceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-2 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-bold hover:bg-red-200 transition-all flex items-center gap-2"
                    >
                      <X size={12} /> Cancellation Invoice
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-sm">No data available for this order.</div>
        )}
      </div>
    </div>
  );
}
