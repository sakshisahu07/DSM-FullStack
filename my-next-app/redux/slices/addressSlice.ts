import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface AddressState {
  addresses: any[];
  loading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  loading: false,
  error: null,
};

export const fetchAddresses = createAsyncThunk(
  'address/fetchAddresses',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('No authorization token found');

      const response = await fetch(`${BASE_URL}/address`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch addresses');

      return data.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const createAddress = createAsyncThunk(
  'address/createAddress',
  async (addressData: any, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('No authorization token found');

      const response = await fetch(`${BASE_URL}/address`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to create address');

      dispatch(fetchAddresses());
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default addressSlice.reducer;
