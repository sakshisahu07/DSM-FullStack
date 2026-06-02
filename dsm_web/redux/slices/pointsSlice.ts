import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pointsService } from '../../api/pointsService';
import { parseApiError } from '../../utils/errorHandler';

interface PointsState {
  pointsBalance: number;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: PointsState = {
  pointsBalance: 0,
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchPointsBalance = createAsyncThunk(
  'points/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      return await pointsService.getPointsBalance();
    } catch (err: any) {
      if (err.message === 'REQUEST_CANCELLED') return;
      return rejectWithValue(parseApiError(err));
    }
  }
);

export const earnPointsTransaction = createAsyncThunk(
  'points/earn',
  async (amount: number, { rejectWithValue }) => {
    try {
      return await pointsService.earnPoints(amount);
    } catch (err: any) {
      return rejectWithValue(parseApiError(err));
    }
  }
);

export const redeemPointsTransaction = createAsyncThunk(
  'points/redeem',
  async ({ points, orderAmount }: { points: number; orderAmount: number }, { rejectWithValue }) => {
    try {
      return await pointsService.redeemPoints(points, orderAmount);
    } catch (err: any) {
      return rejectWithValue(parseApiError(err));
    }
  }
);

const pointsSlice = createSlice({
  name: 'points',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Points
      .addCase(fetchPointsBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPointsBalance.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload !== undefined) state.pointsBalance = action.payload;
      })
      .addCase(fetchPointsBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Earn Points
      .addCase(earnPointsTransaction.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(earnPointsTransaction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.pointsBalance += action.payload;
      })
      .addCase(earnPointsTransaction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      // Redeem Points
      .addCase(redeemPointsTransaction.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(redeemPointsTransaction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.pointsBalance -= action.payload.points_redeemed;
      })
      .addCase(redeemPointsTransaction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default pointsSlice.reducer;
