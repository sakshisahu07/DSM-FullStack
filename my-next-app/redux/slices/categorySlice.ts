import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
interface Category {
  _id: string;
  title: string;
  icon: string | null;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubCategory {
  _id: string;
  title: string;
  icon: string | null;
  category: {
    _id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Brand {
  _id: string;
  title: string;
  icon: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryState {
  categories: Category[];
  subcategories: SubCategory[];
  brands: Brand[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  subcategories: [],
  brands: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${BASE_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch categories');
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSubcategories = createAsyncThunk(
  'category/fetchSubcategories',
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${BASE_URL}/sub-category`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch subcategories');
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBrands = createAsyncThunk(
  'category/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${BASE_URL}/brand`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch brands');
      return data.data;
    } catch (error: any) {
      console.log("Brands fetch failed, might not be implemented yet");
      return [];
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.subcategories = action.payload;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
      });
  },
});

export default categorySlice.reducer;
