import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from './apiConfig';
interface BulkInquiryState {
  loading: boolean;
  error: string | null;
  success: boolean;
  inquiryData: any | null;
  cities: any[];
  states: any[];
  countries: any[];
  categories: any[];
}

const initialState: BulkInquiryState = {
  loading: false,
  error: null,
  success: false,
  inquiryData: null,
  cities: [],
  states: [],
  countries: [],
  categories: [],
};

const getCleanToken = (token: string | null) => {
  if (!token || token === 'null' || token === 'undefined') return null;
  return token;
};

export const fetchCountries = createAsyncThunk(
  'bulkInquiry/fetchCountries',
  async (token: string | null, { rejectWithValue }) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      const cleanToken = getCleanToken(token);
      if (cleanToken) {
        headers['Authorization'] = `Bearer ${cleanToken}`;
      }
      const response = await fetch(`${BASE_URL}/countries?limit=150`, { headers });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch countries');
      return Array.isArray(data.data) ? data.data : (data.data?.data || []);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchStates = createAsyncThunk(
  'bulkInquiry/fetchStates',
  async (payload: { token: string | null; countryId: string }, { rejectWithValue }) => {
    try {
      if (!payload.countryId) {
        return [];
      }
      const headers: any = {
        'Content-Type': 'application/json',
      };
      const cleanToken = getCleanToken(payload.token);
      if (cleanToken) {
        headers['Authorization'] = `Bearer ${cleanToken}`;
      }
      const response = await fetch(`${BASE_URL}/states?countryId=${payload.countryId}&limit=150`, { headers });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch states');
      return Array.isArray(data.data) ? data.data : (data.data?.data || []);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchCities = createAsyncThunk(
  'bulkInquiry/fetchCities',
  async (payload: { token: string | null; stateId?: string }, { rejectWithValue }) => {
    try {
      if (!payload.stateId) {
        return [];
      }
      const headers: any = {
        'Content-Type': 'application/json',
      };
      const cleanToken = getCleanToken(payload.token);
      if (cleanToken) {
        headers['Authorization'] = `Bearer ${cleanToken}`;
      }
      let url = `${BASE_URL}/cities?limit=150`;
      if (payload.stateId) {
        url += `&stateId=${payload.stateId}`;
      }
      const response = await fetch(url, { headers });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch cities');
      return Array.isArray(data.data) ? data.data : (data.data?.data || []);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'bulkInquiry/fetchCategories',
  async (token: string | null, { rejectWithValue }) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      const cleanToken = getCleanToken(token);
      if (cleanToken) {
        headers['Authorization'] = `Bearer ${cleanToken}`;
      }

      const response = await fetch(`${BASE_URL}/categories`, {
        headers
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch categories');
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const submitBulkInquiry = createAsyncThunk(
  'bulkInquiry/submit',
  async (payload: {
    inquiryData: {
      userId: string;
      number: string;
      products: string[];
      country: string;
      state: string;
      city: string;
      pincode: string;
      message: string;
    };
    token?: string;
  }, { rejectWithValue, getState }) => {
    try {
      // Priority: 1. Payload Token, 2. State Token, 3. localStorage Token
      let finalToken = payload.token;
      
      if (!finalToken) {
        const state = getState() as any;
        finalToken = state.auth?.token;
      }
      
      if (!finalToken && typeof window !== 'undefined') {
        finalToken = localStorage.getItem('token') || undefined;
      }

      if (!finalToken) {
        console.error("Bulk Inquiry Error: No token found in payload, state, or localStorage");
        return rejectWithValue('Not authorized, no token');
      }

      const response = await fetch(`${BASE_URL}/bulk-inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${finalToken}`,
        },
        body: JSON.stringify(payload.inquiryData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Bulk Inquiry Error Response:", data);
        return rejectWithValue(data.message || 'Failed to submit inquiry');
      }

      console.log("Bulk Inquiry Success Response:", data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const bulkInquirySlice = createSlice({
  name: 'bulkInquiry',
  initialState,
  reducers: {
    resetInquiryStatus: (state) => {
      state.success = false;
      state.error = null;
      state.inquiryData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitBulkInquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitBulkInquiry.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.inquiryData = action.payload.data;
      })
      .addCase(submitBulkInquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.countries = action.payload;
      })
      .addCase(fetchStates.pending, (state) => {
        state.states = [];
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.states = action.payload;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.states = [];
        state.error = action.payload as string;
      })
      .addCase(fetchCities.pending, (state) => {
        state.cities = [];
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.cities = [];
        state.error = action.payload as string;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { resetInquiryStatus } = bulkInquirySlice.actions;
export default bulkInquirySlice.reducer;
