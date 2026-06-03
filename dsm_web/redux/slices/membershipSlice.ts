import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { plansService } from '../../api/plansService';
import { membershipService } from '../../api/membershipService';
import { MembershipPlan, UserMembership, TransactionRecord } from '../../types/membership';
import { parseApiError } from '../../utils/errorHandler';

interface MembershipState {
  plans: MembershipPlan[];
  myMembership: UserMembership | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: MembershipState = {
  plans: [],
  myMembership: null,
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchMembershipPlans = createAsyncThunk(
  'membership/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      return await plansService.getPlans();
    } catch (err: any) {
      if (err.message === 'REQUEST_CANCELLED') return;
      return rejectWithValue(parseApiError(err));
    }
  }
);

export const fetchMyMembership = createAsyncThunk(
  'membership/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await membershipService.getMyMembership();
    } catch (err: any) {
      if (err.message === 'REQUEST_CANCELLED') return;
      return rejectWithValue(parseApiError(err));
    }
  }
);

export const purchaseMembership = createAsyncThunk(
  'membership/purchase',
  async ({ planId, paymentId, paymentMethod = 'ONLINE' }: { planId: string; paymentId: string; paymentMethod?: string }, { rejectWithValue }) => {
    try {
      return await membershipService.purchasePlan(planId, paymentId, paymentMethod);
    } catch (err: any) {
      return rejectWithValue(parseApiError(err));
    }
  }
);

export const upgradeMembership = createAsyncThunk(
  'membership/upgrade',
  async ({ newPlanId, paymentId }: { newPlanId: string; paymentId: string }, { rejectWithValue }) => {
    try {
      return await membershipService.upgradeMembership(newPlanId, paymentId);
    } catch (err: any) {
      return rejectWithValue(parseApiError(err));
    }
  }
);

export const cancelMembership = createAsyncThunk(
  'membership/cancel',
  async (_, { rejectWithValue }) => {
    try {
      return await membershipService.cancelMembership();
    } catch (err: any) {
      return rejectWithValue(parseApiError(err));
    }
  }
);

export const getActiveCoupon = createAsyncThunk(
  'membership/coupon/get',
  async (_, { rejectWithValue }) => {
    try {
      return await membershipService.getActiveCoupon();
    } catch (err: any) {
      return rejectWithValue(parseApiError(err));
    }
  }
);

export const validateCoupon = createAsyncThunk(
  'membership/coupon/validate',
  async ({ code, orderValue }: { code: string; orderValue: number }, { rejectWithValue }) => {
    try {
      return await membershipService.validateCoupon(code, orderValue);
    } catch (err: any) {
      return rejectWithValue(parseApiError(err));
    }
  }
);

export const getPointsBalance = createAsyncThunk(
  'membership/points/balance',
  async (_, { rejectWithValue }) => {
    try {
      return await membershipService.getPointsBalance();
    } catch (err: any) {
      return rejectWithValue(parseApiError(err));
    }
  }
);

export const earnPoints = createAsyncThunk(
  'membership/points/earn',
  async ({ orderId, orderValue }: { orderId: string; orderValue: number }, { rejectWithValue }) => {
    try {
      return await membershipService.earnPoints(orderId, orderValue);
    } catch (err: any) {
      return rejectWithValue(parseApiError(err));
    }
  }
);

export const redeemPoints = createAsyncThunk(
  'membership/points/redeem',
  async ({ orderId, pointsToRedeem }: { orderId: string; pointsToRedeem: number }, { rejectWithValue }) => {
    try {
      return await membershipService.redeemPoints(orderId, pointsToRedeem);
    } catch (err: any) {
      return rejectWithValue(parseApiError(err));
    }
  }
);

const membershipSlice = createSlice({
  name: 'membership',
  initialState,
  reducers: {
    clearMembershipError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans (Backwards Compatible)
      .addCase(fetchMembershipPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembershipPlans.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.plans = action.payload;
        }
      })
      .addCase(fetchMembershipPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch User Active Membership
      .addCase(fetchMyMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyMembership.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload !== undefined) {
          state.myMembership = action.payload;
        }
      })
      .addCase(fetchMyMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Purchase Plan
      .addCase(purchaseMembership.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(purchaseMembership.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.myMembership = action.payload.membership;
      })
      .addCase(purchaseMembership.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      // Upgrade Plan
      .addCase(upgradeMembership.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(upgradeMembership.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.myMembership = action.payload.membership;
      })
      .addCase(upgradeMembership.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      // Cancel Membership
      .addCase(cancelMembership.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(cancelMembership.fulfilled, (state) => {
        state.actionLoading = false;
        if (state.myMembership) {
          state.myMembership.status = 'cancelled';
        }
      })
      .addCase(cancelMembership.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMembershipError } = membershipSlice.actions;
export default membershipSlice.reducer;
