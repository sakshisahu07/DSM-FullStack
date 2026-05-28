import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
interface ComboState {
  combos: any[];
  currentCombo: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: ComboState = {
  combos: [],
  currentCombo: null,
  loading: false,
  error: null,
};

export const fetchCombos = createAsyncThunk(
  'combo/fetchCombos',
  async (params: string = '', { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/combo?${params}`, {
        headers
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch combos');
      return data.data.combos;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchComboById = createAsyncThunk(
  'combo/fetchComboById',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${BASE_URL}/combo/${id}`, { headers });
      const data = await response.json();
      
      if (!response.ok) {
        // Fallback: If direct ID fetch fails, try searching in the list
        const listResponse = await fetch(`${BASE_URL}/combo`, { headers });
        const listData = await listResponse.json();
        const combo = listData.data.combos.find((c: any) => 
          c._id === id || 
          c.slug?.toLowerCase() === id.toLowerCase()
        );
        if (combo) return combo;
        return rejectWithValue(data.message || 'Failed to fetch combo detail');
      }
      return data.data; 
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Keep slug fetch for SEO but prefer ID internally if slug fails
export const fetchComboBySlug = createAsyncThunk(
  'combo/fetchComboBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${BASE_URL}/combo?search=${slug}`, { headers });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch combo detail');
      
      let combo = data.data.combos.find((c: any) => 
        c.slug?.toLowerCase() === slug.toLowerCase() || 
        c._id === slug
      );

      if (!combo) {
        // Fallback: Fetch full list and look for the slug
        const fallbackResponse = await fetch(`${BASE_URL}/combo`, { headers });
        const fallbackData = await fallbackResponse.json();
        combo = fallbackData.data.combos.find((c: any) => 
          c.slug?.toLowerCase() === slug.toLowerCase() || 
          c._id === slug
        );
      }

      if (!combo) return rejectWithValue('Combo not found even in full list');
      return combo;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const comboSlice = createSlice({
  name: 'combo',
  initialState,
  reducers: {
    clearCurrentCombo: (state) => {
      state.currentCombo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCombos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCombos.fulfilled, (state, action) => {
        state.loading = false;
        state.combos = action.payload;
      })
      .addCase(fetchCombos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchComboBySlug.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComboBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCombo = action.payload;
      })
      .addCase(fetchComboBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchComboById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComboById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCombo = action.payload;
      })
      .addCase(fetchComboById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentCombo } = comboSlice.actions;
export default comboSlice.reducer;
