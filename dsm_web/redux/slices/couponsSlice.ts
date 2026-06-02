import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { couponsService } from '../../api/couponsService';
import { ActiveCouponInfo, CouponValidationResult } from '../../types/membership';
import { parseApiError } from '../../utils/errorHandler';

interface CouponsState {
  activeCoupon: ActiveCouponInfo | null;
  validatedCoupon: CouponValidationResult | null;
  loading: boolean;
  validationLoading: boolean;
  error: string | null;
  validationError: string | null;
}

const initialState: CouponsState = {
  activeCoupon: null,
  validatedCoupon: null,
  loading: false,
  validationLoading: false,
  error: null,
  validationError: null,
};

export const fetchActiveCoupon = createAsyncThunk(
  'coupons/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      return await couponsService.getActiveCoupon();
    } catch (err: any) {
      if (err.message === 'REQUEST_CANCELLED') return;
      return rejectWithValue(parseApiError(err));
    }
  }
);

export const validateCouponCode = createAsyncThunk(
  'coupons/validate',
  async ({ code, amount }: { code: string; amount: number }, { rejectWithValue }) => {
    try {
      return await couponsService.validateCoupon(code, amount);
    } catch (err: any) {
      return rejectWithValue(parseApiError(err));
    }
  }
);

const couponsSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    clearValidationError: (state) => {
      state.validationError = null;
    },
    resetValidation: (state) => {
      state.validatedCoupon = null;
      state.validationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Active Coupon
      .addCase(fetchActiveCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveCoupon.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.activeCoupon = action.payload;
      })
      .addCase(fetchActiveCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Validate Coupon
      .addCase(validateCouponCode.pending, (state) => {
        state.validationLoading = true;
        state.validationError = null;
      })
      .addCase(validateCouponCode.fulfilled, (state, action) => {
        state.validationLoading = false;
        state.validatedCoupon = action.payload;
      })
      .addCase(validateCouponCode.rejected, (state, action) => {
        state.validationLoading = false;
        state.validationError = action.payload as string;
      });
  },
});

export const { clearValidationError, resetValidation } = couponsSlice.actions;
export default couponsSlice.reducer;
