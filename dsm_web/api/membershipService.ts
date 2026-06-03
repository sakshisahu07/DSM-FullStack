import axiosInstance from './axiosInstance';
import { UserMembership, TransactionRecord } from '../types/membership';

export const membershipService = {
  getMyMembership: async (): Promise<UserMembership | null> => {
    const response = await axiosInstance.get('/membership/my-membership');
    return response.data.data;
  },

  purchasePlan: async (planId: string, paymentId: string, paymentMethod: string = 'ONLINE'): Promise<{
    membership: UserMembership;
    transaction: TransactionRecord;
    welcome_points_awarded: number;
  }> => {
    const response = await axiosInstance.post('/membership/purchase', { plan_id: planId, payment_id: paymentId, payment_method: paymentMethod });
    return response.data.data;
  },

  upgradeMembership: async (newPlanId: string, paymentId: string): Promise<{
    membership: UserMembership;
    transaction: TransactionRecord;
    amount_charged: number;
  }> => {
    const response = await axiosInstance.post('/membership/upgrade', { new_plan_id: newPlanId, payment_id: paymentId });
    return response.data.data;
  },

  cancelMembership: async (): Promise<boolean> => {
    await axiosInstance.post('/membership/cancel');
    return true;
  },

  getActiveCoupon: async (): Promise<any> => {
    const response = await axiosInstance.get('/membership/coupon');
    return response.data.data;
  },

  validateCoupon: async (code: string, orderValue: number): Promise<any> => {
    const response = await axiosInstance.post('/membership/coupon/validate', { code, order_value: orderValue });
    return response.data.data;
  },

  getPointsBalance: async (): Promise<{ balance: number, history: any[] }> => {
    const response = await axiosInstance.get('/membership/points/balance');
    return response.data.data;
  },

  earnPoints: async (orderId: string, orderValue: number): Promise<any> => {
    const response = await axiosInstance.post('/membership/points/earn', { order_id: orderId, order_value: orderValue });
    return response.data.data;
  },

  redeemPoints: async (orderId: string, pointsToRedeem: number): Promise<any> => {
    const response = await axiosInstance.post('/membership/points/redeem', { order_id: orderId, points_to_redeem: pointsToRedeem });
    return response.data.data;
  },
};
