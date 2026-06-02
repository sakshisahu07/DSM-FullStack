import axiosInstance from './axiosInstance';
import { UserMembership, TransactionRecord } from '../types/membership';

export const membershipService = {
  getMyMembership: async (): Promise<UserMembership | null> => {
    const response = await axiosInstance.get('/membership/my-membership');
    return response.data.data;
  },

  purchasePlan: async (planId: string, paymentId: string): Promise<{
    membership: UserMembership;
    transaction: TransactionRecord;
    welcome_points_awarded: number;
  }> => {
    const response = await axiosInstance.post('/membership/purchase', { plan_id: planId, payment_id: paymentId });
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
};
