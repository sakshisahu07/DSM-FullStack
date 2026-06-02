import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from './apiConfig';


interface MembershipPlan {
  _id: string;
  name: string;
  tier: 'silver' | 'gold' | 'platinum';
  price: number;
  billing_cycle: string;
  discount_percent: number;
  points_multiplier: number;
  shipping_type: string;
  perks: string[];
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MembershipState {
  plans: MembershipPlan[];
  loading: boolean;
  error: string | null;
}

const initialState: MembershipState = {
  plans: [],
  loading: false,
  error: null,
};

export const fetchMembershipPlans = createAsyncThunk(
  'membership/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log("membershipSlice: Calling API", `${BASE_URL}/membership/plans`);
      const response = await fetch(`${BASE_URL}/membership/plans`, { 
        headers,
        cache: 'no-store'
      });
      const data = await response.json();
      console.log("membershipSlice: API Response", data);

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch membership plans');
      }

      return data.data;
    } catch (error: any) {
      console.error("membershipSlice: API Error", error);
      return rejectWithValue(error.message || 'Network error');
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
      .addCase(fetchMembershipPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembershipPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchMembershipPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMembershipError } = membershipSlice.actions;
export default membershipSlice.reducer;
