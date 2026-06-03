export interface MembershipPlan {
  _id: string;
  name: string;
  tier: 'silver' | 'gold' | 'platinum';
  price: number;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  discount_percent: number;
  points_multiplier: number;
  shipping_type: 'standard' | 'express' | 'next-day';
  perks: string[];
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserMembership {
  _id: string;
  user_id: string | any;
  plan_id: MembershipPlan;
  planId?: MembershipPlan;
  start_date: string;
  expiry_date: string;
  endDate?: string;
  status: 'active' | 'expired' | 'cancelled';
  coupon_code: string;
  createdAt?: string;
}

export interface CouponValidationResult {
  coupon_code: string;
  discount_percent: number;
  original_price: number;
  amount_saved: number;
  discounted_price: number;
}

export interface ActiveCouponInfo {
  coupon_code: string | null;
  discount_percent: number;
}

export interface PointsRedeemResult {
  points_redeemed: number;
  discount_applied: number;
  final_price: number;
}

export interface TransactionRecord {
  _id: string;
  customerId: string;
  amount: number;
  planId: string;
  paymentId: string;
  paymentGateway: 'RAZORPAY';
  paymentStatus: 'success' | 'failed' | 'pending';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  paymentMethod: string;
  createdAt: string;
}
