'use client';

import React, { useState } from 'react';
import { Check, ArrowLeft } from 'lucide-react';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderId: string;
}

const reasons = [
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Delivery time is too long",
  "Product not required anymore",
  "Payment issue",
  "Incorrect shipping address",
  "Other"
];

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({ isOpen, onClose, onConfirm, orderId }) => {
  const [selectedReason, setSelectedReason] = useState(reasons[0]);
  const [customReason, setCustomReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto no-scrollbar bg-white sm:bg-black/40 sm:backdrop-blur-[2px]">
      <div className="min-h-full flex items-start sm:items-center justify-center p-0 sm:p-6 lg:p-10">
        {/* Backdrop clickable area (behind the modal) */}
        <div className="hidden sm:block absolute inset-0" onClick={onClose} />
        
        {/* Modal Content */}
        <div className="relative bg-white w-full min-h-screen sm:min-h-0 sm:w-[50rem] sm:rounded-[40px] sm:shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col">
          
          {/* Mobile Header Gradient */}
          <div className="sm:hidden bg-gradient-to-r from-[#EE9C24] to-[#B8420E] px-4 py-4 flex flex-row items-center justify-start text-white sticky top-0 z-10 w-full shadow-sm">
            <button onClick={onClose} className="mr-4">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <span className="font-semibold text-[13px] tracking-wide">Cancel Order</span>
          </div>

          <div className="flex-1 p-4 pt-6 md:p-14 flex flex-col items-center">
            {/* Desktop Header */}
            <div className="hidden sm:inline-block mb-8 relative mx-auto text-center">
              <h2 className="text-[26px] text-gray-800 font-medium">Cancel Order</h2>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[70%] h-[3.5px] bg-[#E47B25] rounded-full"></div>
            </div>
            
            <div className="mb-6 sm:mb-10 text-left sm:text-center w-full max-w-lg mx-auto px-2 sm:px-0">
              <p className="text-gray-600 sm:font-bold text-[11px] sm:text-[14px] leading-tight sm:leading-normal">We're sorry to see you cancel your order.</p>
              <p className="text-gray-500 text-[11px] sm:text-[13px] leading-tight sm:leading-normal">Please let us know the reason so we can improve your experience.</p>
            </div>
            
            {/* Reasons List Container */}
            <div className="bg-white border border-gray-100 rounded-3xl sm:rounded-[35px] p-5 sm:p-6 md:p-10 mb-8 w-full max-w-lg mx-auto shadow-sm text-left">
              <h3 className="text-[10px] sm:text-[12px] font-bold text-gray-400 mb-4 sm:mb-6 uppercase tracking-wider px-2 sm:px-0">Check Your Reason</h3>
              
              <div className="flex flex-col">
                {reasons.map((reason, index) => (
                  <div key={reason}>
                    <div 
                      onClick={() => setSelectedReason(reason)}
                      className="flex items-center gap-4 sm:gap-5 py-3 sm:py-5 px-2 sm:px-0 cursor-pointer group"
                    >
                      <div className="flex items-center justify-center w-6 sm:w-10 shrink-0">
                        <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-[4px] sm:rounded-[5px] border-[1.5px] sm:border-2 rotate-45 flex items-center justify-center transition-all ${
                          selectedReason === reason 
                            ? 'bg-gradient-to-br from-[#EE9C24] to-[#B8420E] border-transparent shadow-sm' 
                            : 'border-gray-300 bg-white group-hover:border-orange-200'
                        }`}>
                          {selectedReason === reason && (
                            <Check size={10} className="text-white -rotate-45 sm:w-3.5 sm:h-3.5" strokeWidth={4} />
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] sm:text-[15px] font-medium sm:font-bold tracking-tight ${selectedReason === reason ? 'text-gray-800' : 'text-gray-600 hover:text-gray-800'}`}>
                        {reason}
                      </span>
                    </div>
                    {index < reasons.length - 1 && (
                      <div className="h-[1px] bg-gray-50 w-full ml-4 sm:ml-0"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Other Reason Input - Conditional */}
            {selectedReason === "Other" && (
              <div className="mb-6 sm:mb-10 relative w-full max-w-lg mx-auto">
                <div className="absolute -top-3 left-6 sm:left-8 bg-white px-3">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-700">Reason</span>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 border sm:border-2 border-orange-200 sm:border-orange-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all focus-within:border-[#EE9C24]">
                  <div className="mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 sm:w-5 sm:h-5">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </div>
                  <textarea
                    placeholder="Enter Your Reason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full bg-transparent outline-none text-[12px] sm:text-[15px] text-gray-700 placeholder:text-gray-300 resize-none h-16 sm:h-24"
                  />
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 w-full mt-auto sm:mt-0 max-w-lg mx-auto px-4 sm:px-0">
              <button 
                onClick={onClose}
                className="w-full sm:w-[220px] bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white py-3 sm:py-4 rounded-full text-[11px] sm:text-sm font-bold sm:font-black shadow-md sm:shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                Keep My Order
              </button>
              <button 
                onClick={() => onConfirm(selectedReason === "Other" ? customReason : selectedReason)}
                className="w-full sm:w-[220px] border sm:border-2 border-gray-200 sm:border-gray-100 text-gray-500 sm:text-gray-400 py-3 sm:py-4 rounded-full text-[11px] sm:text-sm font-bold sm:font-black hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 bg-white"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
