import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from './apiConfig';

interface WalletBalance {
  userId: string;
  balance: number;
  coins: number;
  referralBalance: number;
  coinConversionRate: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Transaction {
  _id: string;
  userId: string;
  type: string;
  bucket: string;
  amount: number;
  credit: boolean;
  orderId?: string | null;
  referredUserId?: string | null;
  description?: string;
  balanceAfter?: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface WalletState {
  balance: WalletBalance | null;
  transactions: Transaction[];
  loading: boolean;
  historyLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balance: null,
  transactions: [],
  loading: false,
  historyLoading: false,
  error: null,
};

// Fetch Wallet Balance
export const fetchWallet = createAsyncThunk(
  'wallet/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return rejectWithValue('No token found');

      const response = await fetch(`${BASE_URL}/wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch wallet');
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Fetch Wallet Transactions
export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return rejectWithValue('No token found');

      const response = await fetch(`${BASE_URL}/wallet/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch transactions');
      return data.data.data; // Response has nested data: { data: [], pagination: {} }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Wallet
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default walletSlice.reducer;
