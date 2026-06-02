import axiosInstance from './axiosInstance';
import { ActiveCouponInfo, CouponValidationResult } from '../types/membership';

export const couponsService = {
  getActiveCoupon: async (): Promise<ActiveCouponInfo> => {
    const response = await axiosInstance.get('/membership/coupon');
    return response.data.data;
  },

  validateCoupon: async (couponCode: string, orderAmount: number): Promise<CouponValidationResult> => {
    const response = await axiosInstance.post('/membership/coupon/validate', {
      coupon_code: couponCode,
      order_amount: orderAmount,
    });
    return response.data.data;
  },
};
