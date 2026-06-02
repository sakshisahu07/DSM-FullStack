import axiosInstance from './axiosInstance';
import { MembershipPlan } from '../types/membership';

export const plansService = {
  getPlans: async (): Promise<MembershipPlan[]> => {
    const response = await axiosInstance.get('/membership/plans');
    return response.data.data;
  },

  getPlanById: async (planId: string): Promise<MembershipPlan> => {
    const response = await axiosInstance.get(`/membership/plans/${planId}`);
    return response.data.data;
  },
};
