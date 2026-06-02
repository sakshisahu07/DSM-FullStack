import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from './apiConfig';

interface CartState {
  items: any[];
  summary: any;
  loading: boolean;
  error: string | null;
  cartId: string | null;
}

const initialState: CartState = {
  items: [],
  summary: null,
  loading: false,
  error: null,
  cartId: null,
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (pincode: string | undefined | null, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('No authorization token found');
      }

      const url = pincode ? `${BASE_URL}/cart?pincode=${pincode}` : `${BASE_URL}/cart`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch cart');
      }

      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId: string, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('No authorization token found');
      }

      const response = await fetch(`${BASE_URL}/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to remove item');
      }

      // Refresh cart after removal
      dispatch(fetchCart());
      return itemId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const increaseQuantity = createAsyncThunk(
  'cart/increaseQuantity',
  async ({ itemId, currentQuantity }: { itemId: string; currentQuantity: number }, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('No authorization token found');

      const response = await fetch(`${BASE_URL}/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: currentQuantity + 1 }),
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to increase quantity');

      dispatch(fetchCart());
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const decreaseQuantity = createAsyncThunk(
  'cart/decreaseQuantity',
  async ({ itemId, currentQuantity }: { itemId: string; currentQuantity: number }, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('No authorization token found');

      const response = await fetch(`${BASE_URL}/cart/${itemId}/decrease`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to decrease quantity');

      dispatch(fetchCart());
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ variantId, comboId, quantity }: { variantId?: string; comboId?: string; quantity: number }, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('No authorization token found');

      const itemPayload: any = { quantity };
      if (comboId) {
        itemPayload.comboId = comboId;
      } else if (variantId) {
        itemPayload.variantId = variantId;
      }

      const response = await fetch(`${BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [itemPayload]
        }),
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to add to cart');

      dispatch(fetchCart());
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code: string, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('No authorization token found');

      const response = await fetch(`${BASE_URL}/cart/apply-coupon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to apply coupon');

      dispatch(fetchCart());
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('No authorization token found');

      const response = await fetch(`${BASE_URL}/cart/remove-coupon`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to remove coupon');

      dispatch(fetchCart());
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);


const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.summary = null;
      state.cartId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.summary = action.payload.summary;
        state.cartId = action.payload.cartId;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;