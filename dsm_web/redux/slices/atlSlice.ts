import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from './apiConfig';


export interface AtlData {
  _id: string;
  banner: {
    url: string;
    key: string;
  };
  heading: string;
  description: string;
  subTitle: string;
  subDescription: string;
  processHeading?: string;
  processImage?: {
    url: string;
    key: string;
  };
  setupHeading?: string;
  setupImage?: {
    url: string;
    key: string;
  };
  cards: {
    icon: {
      url: string;
      key: string;
    };
    title: string;
    description: string;
    _id: string;
  }[];
  images: {
    url: string;
    key: string;
    _id: string;
  }[];
  commonFeatures: {
    heading: string;
    description: string;
  };
  setupDetails: {
    title: string;
    setupIcon: {
      url: string;
      key: string;
    };
    description: string;
    _id: string;
  }[];
  setProcess: {
    heading: string;
    processIcon: {
      url: string;
      key: string;
    };
    description: string;
    _id: string;
  }[];
}

interface AtlState {
  data: AtlData | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  success: boolean;
}

const initialState: AtlState = {
  data: null,
  loading: false,
  submitting: false,
  error: null,
  success: false,
};

export const fetchAtlData = createAsyncThunk(
  'atl/fetchAtlData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/alt/page`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to fetch ATL data');
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAtlInquiry = createAsyncThunk(
  'atl/createAtlInquiry',
  async (formData: any, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/alt/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to submit inquiry');
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const atlSlice = createSlice({
  name: 'atl',
  initialState,
  reducers: {
    resetSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAtlData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAtlData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAtlData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAtlInquiry.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAtlInquiry.fulfilled, (state) => {
        state.submitting = false;
        state.success = true;
      })
      .addCase(createAtlInquiry.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSuccess } = atlSlice.actions;

export default atlSlice.reducer;
