import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
interface WishlistState {
  items: any[];
  loading: boolean;
  error: string | null;
}


const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('No authorization token found');

      const response = await fetch(`${BASE_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch wishlist');

      // The API returns data grouped by category name: { status: "success", data: { "ResberryPi": [...], "Sensors": [...] } }
      const rawData = data.data;
      let flattenedItems: any[] = [];

      if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
          // If it's an object with categories as keys, collect all arrays
          Object.values(rawData).forEach((categoryItems: any) => {
              if (Array.isArray(categoryItems)) {
                  flattenedItems = [...flattenedItems, ...categoryItems];
              }
          });
      } else if (Array.isArray(rawData)) {
          flattenedItems = rawData;
      } else if (data.wishlist && Array.isArray(data.wishlist)) {
          flattenedItems = data.wishlist;
      }

      return flattenedItems;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (variantId: string, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        toast.error('Please login to add to wishlist');
        return rejectWithValue('No authorization token found');
      }

      const response = await fetch(`${BASE_URL}/wishlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variant: variantId }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Failed to add to wishlist');
        return rejectWithValue(data.message || 'Failed to add to wishlist');
      }

      toast.success('Added to wishlist');
      dispatch(fetchWishlist());
      return data.data;
    } catch (error: any) {
      toast.error(error.message || 'Network error');
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (arg: string | { productId?: string; variantId?: string; wishlistId?: string }, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('No authorization token found');

      // Send both product and variant for accurate deletion, fallback to product as wishlistId if needed
      const bodyPayload: any = {};
      if (typeof arg === 'string') {
        bodyPayload.product = arg;
      } else {
        if (arg.productId) bodyPayload.product = arg.productId;
        else if (arg.wishlistId) bodyPayload.product = arg.wishlistId; // legacy fallback
        if (arg.variantId) bodyPayload.variant = arg.variantId;
      }

      const response = await fetch(`${BASE_URL}/wishlist`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Failed to remove from wishlist');
        return rejectWithValue(data.message || 'Failed to remove from wishlist');
      }

      toast.success('Removed from wishlist');
      dispatch(fetchWishlist());
      return typeof arg === 'string' ? arg : arg.wishlistId;
    } catch (error: any) {
      toast.error(error.message || 'Network error');
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

