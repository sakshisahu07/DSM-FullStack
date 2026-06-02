import axiosInstance from './axiosInstance';
import { PointsRedeemResult } from '../types/membership';

export const pointsService = {
  getPointsBalance: async (): Promise<number> => {
    const response = await axiosInstance.get('/membership/points/balance');
    return response.data.data.points_balance;
  },

  earnPoints: async (transactionAmount: number): Promise<number> => {
    const response = await axiosInstance.post('/membership/points/earn', {
      transaction_amount: transactionAmount,
    });
    return response.data.data.points_earned;
  },

  redeemPoints: async (points: number, orderAmount: number): Promise<PointsRedeemResult> => {
    const response = await axiosInstance.post('/membership/points/redeem', {
      points,
      order_amount: orderAmount,
    });
    return response.data.data;
  },
};
