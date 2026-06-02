import React, { useState } from 'react';
import { useCoupons } from '../../hooks/useCoupons';

export const CouponValidation: React.FC = () => {
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  
  const { validatedCoupon, validationLoading, validationError, validate, reset } = useCoupons();

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !amount) return;
    try {
      await validate(code, Number(amount));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = () => {
    setCode('');
    setAmount('');
    reset();
  };

  return (
    <div className="w-full">
      <h4 className="text-sm font-bold text-gray-800 mb-3">Check Out Coupon Calculator</h4>
      
      {!validatedCoupon ? (
        <form onSubmit={handleValidate} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ENTER CODE"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:border-orange-400 uppercase"
              required
            />
            <input
              type="number"
              placeholder="Order Value (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
              className="w-28 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
              required
            />
          </div>
          
          {validationError && <p className="text-xs text-red-500 font-semibold">{validationError}</p>}
          
          <button
            type="submit"
            disabled={validationLoading}
            className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50"
          >
            {validationLoading ? 'Validating code...' : 'Validate and Apply'}
          </button>
        </form>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-emerald-600 font-bold uppercase">Success applied!</span>
            <button onClick={handleClear} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Clear</button>
          </div>
          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span>Original Amount:</span>
              <span className="line-through font-semibold">₹{validatedCoupon.original_price}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Coupon Discount ({validatedCoupon.discount_percent}%):</span>
              <span>- ₹{validatedCoupon.amount_saved}</span>
            </div>
            <div className="flex justify-between text-sm font-black border-t border-dashed border-emerald-200 pt-2 text-slate-800">
              <span>Final Checkout Cost:</span>
              <span>₹{validatedCoupon.discounted_price}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
