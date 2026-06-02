import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from './apiConfig';


interface AffiliateState {
  loading: boolean;
  error: string | null;
  otpSent: boolean;
  otpVerified: boolean;
  dashboardData: any | null;
}

const initialState: AffiliateState = {
  loading: false,
  error: null,
  otpSent: false,
  otpVerified: false,
  dashboardData: null,
};

export const sendAffiliateOtp = createAsyncThunk(
  'affiliate/sendOtp',
  async (phone: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/affiliate/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to send OTP');
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerAffiliate = createAsyncThunk(
  'affiliate/register',
  async (formData: FormData, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('No authorization token found. Please log in again.');
      }

      const response = await fetch(`${BASE_URL}/affiliate/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Registration failed');
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAffiliateDashboard = createAsyncThunk(
  'affiliate/fetchDashboard',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('No authorization token found');
      }

      const response = await fetch(`${BASE_URL}/affiliate/me/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch dashboard');
      }

      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const affiliateSlice = createSlice({
  name: 'affiliate',
  initialState,
  reducers: {
    resetAffiliateState: (state) => {
      state.loading = false;
      state.error = null;
      state.otpSent = false;
      state.otpVerified = false;
    },
    setOtpVerified: (state, action) => {
      state.otpVerified = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendAffiliateOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendAffiliateOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendAffiliateOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerAffiliate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAffiliate.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerAffiliate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAffiliateDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAffiliateDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchAffiliateDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetAffiliateState, setOtpVerified } = affiliateSlice.actions;
export default affiliateSlice.reducer;
