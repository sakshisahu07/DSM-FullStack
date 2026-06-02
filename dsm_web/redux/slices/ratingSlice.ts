import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from './apiConfig';
interface RatingState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: RatingState = {
  loading: false,
  success: false,
  error: null,
};

export const postRating = createAsyncThunk(
  'rating/postRating',
  async (ratingData: { productId: string; rating: number; comment: string }, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}rating`, {
        method: 'POST',
        headers,
        body: JSON.stringify(ratingData),
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to submit rating');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    resetRatingStatus: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postRating.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(postRating.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(postRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetRatingStatus } = ratingSlice.actions;
export default ratingSlice.reducer;
