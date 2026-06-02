import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { plansService } from '../../api/plansService';
import { MembershipPlan } from '../../types/membership';
import { parseApiError } from '../../utils/errorHandler';

interface PlansState {
  list: MembershipPlan[];
  loading: boolean;
  error: string | null;
}

const initialState: PlansState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchPlans = createAsyncThunk(
  'plans/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await plansService.getPlans();
    } catch (err: any) {
      if (err.message === 'REQUEST_CANCELLED') return;
      return rejectWithValue(parseApiError(err));
    }
  }
);

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.list = action.payload;
        }
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default plansSlice.reducer;
