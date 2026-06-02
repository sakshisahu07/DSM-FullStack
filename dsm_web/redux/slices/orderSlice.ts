import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from './apiConfig';


interface OrderState {
  currentOrder: any | null;
  orders: any[];
  pagination: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  currentOrder: null,
  orders: [],
  pagination: null,
  loading: false,
  error: null,
};

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData: any, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      console.log("DSM WEB DEBUG: Sending createOrder request with Authorization token:", token);

      if (!token) {
        console.warn("DSM WEB DEBUG: No token found in Redux state or localStorage for createOrder!");
        return rejectWithValue('No authorization token found');
      }

      const response = await fetch(`${BASE_URL}/order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to create order');

      return data.data; // this should include razorpayOrderId for ONLINE payments
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'order/verifyPayment',
  async (paymentData: any, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('No authorization token found');

      const response = await fetch(`${BASE_URL}/order/verify-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Payment verification failed');

      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const initiatePayment = createAsyncThunk(
  'order/initiatePayment',
  async (orderId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('No authorization token found');

      const response = await fetch(`${BASE_URL}/order/${orderId}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Payment initiation failed');

      return data.data; // contains orderId, razorpayOrderId, amount, prefill
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (params: { page?: number; limit?: number; status?: string } | undefined, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      console.log("DSM WEB DEBUG: Sending API request with Authorization token:", token);

      if (!token) {
        console.warn("DSM WEB DEBUG: No token found in Redux state or localStorage!");
        return rejectWithValue('No authorization token found');
      }

      const page = params?.page || 1;
      const limit = params?.limit || 50;
      const statusQuery = params?.status && params.status !== 'all' ? `&status=${params.status.toUpperCase()}` : '';

      const response = await fetch(`${BASE_URL}/order?page=${page}&limit=${limit}${statusQuery}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch orders');

      return data.data; // { orders: [...], pagination: {...} }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      console.log("DSM WEB DEBUG: fetchOrderById with token:", token);

      if (!token) return rejectWithValue('No authorization token found');

      const response = await fetch(`${BASE_URL}/order/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch order details');

      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async (payload: { orderId: string; reason: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      console.log("DSM WEB DEBUG: Sending cancelOrder request with Authorization token:", token);

      if (!token) {
        console.warn("DSM WEB DEBUG: No token found in Redux state or localStorage for cancelOrder!");
        return rejectWithValue('No authorization token found');
      }

      const response = await fetch(`${BASE_URL}/order/${payload.orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: payload.reason }),
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to cancel order');

      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (updated) {
          state.orders = state.orders.map(o => o._id === updated._id ? { ...o, status: 'CANCELLED' } : o);
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
