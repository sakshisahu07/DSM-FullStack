import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from './apiConfig';
export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FaqState {
  faqs: FaqItem[];
  loading: boolean;
  error: string | null;
  pagination: any | null;
}

const initialState: FaqState = {
  faqs: [],
  loading: false,
  error: null,
  pagination: null,
};

export const fetchFaqs = createAsyncThunk(
  'faq/fetchFaqs',
  async (params: string = '', { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/faq?${params}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to fetch FAQs');
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const faqSlice = createSlice({
  name: 'faq',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaqs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload.data || [];
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default faqSlice.reducer;
