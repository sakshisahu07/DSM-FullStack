import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  otpInfo: {
    code: string;
    expiresAt: string;
  } | null;
}

const isClient = typeof window !== 'undefined';
if (isClient) {
  console.log("Initializing AuthState. Local Token:", localStorage.getItem('token'));
}

const initialState: AuthState = {
  user: isClient ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  loading: false,
  error: null,
  token: isClient ? localStorage.getItem('token') : null,
  otpInfo: null,
};

export const registerLoginUser = createAsyncThunk(
  '/auth/registerLoginUser',
  async (userData: { number: string; firstName?: string; lastName?: string; email?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/registerLoginUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Something went wrong');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (payload: { number: string; otp: string }, { rejectWithValue }) => {
    try {
      console.log("Verifying OTP with payload:", payload);
      const response = await fetch(`${BASE_URL}/auth/verify-Otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Verify OTP Response:", data);

      if (!response.ok) {
        return rejectWithValue(data.message || 'OTP verification failed');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.otpInfo = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerLoginUser.fulfilled, (state, action) => {
        console.log("Register/Login Response:", action.payload);
        state.loading = false;
        state.user = action.payload.data;
        state.token = action.payload.data?.token || action.payload.token || null;
        state.otpInfo = action.payload.data?.otp || action.payload.otp || null;
        
        const receivedToken = action.payload.data?.token || action.payload.token;
        console.log("Extracted Token:", receivedToken);
        
        if (typeof window !== 'undefined' && receivedToken) {
          localStorage.setItem('user', JSON.stringify(action.payload.data || action.payload));
          localStorage.setItem('token', receivedToken);
          console.log("Token saved to localStorage");
        }
      })
      .addCase(registerLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.token = action.payload.data?.token || action.payload.token || null;
        
        const token = action.payload.data?.token || action.payload.token;
        if (typeof window !== 'undefined' && token) {
          localStorage.setItem('user', JSON.stringify(action.payload.data || action.payload));
          localStorage.setItem('token', token);
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
