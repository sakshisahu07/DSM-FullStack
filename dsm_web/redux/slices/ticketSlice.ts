import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BASE_URL } from './apiConfig';

/* ── Types ── */
export interface TicketMessage {
  _id?: string;
  sender: 'USER' | 'ADMIN';
  text: string;
  time: string;
}

export interface Ticket {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'completed';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

interface TicketState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}

const initialState: TicketState = {
  tickets: [],
  selectedTicket: null,
  loading: false,
  actionLoading: false,
  error: null,
  pagination: null,
};

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

/* ── Thunks ── */

export const fetchMyTickets = createAsyncThunk(
  'tickets/fetchMyTickets',
  async (
    params: { page?: number; limit?: number; status?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const { page = 1, limit = 20, status } = params;
      let url = `${BASE_URL}/tickets?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Failed to fetch tickets');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

export const fetchTicketById = createAsyncThunk(
  'tickets/fetchTicketById',
  async (ticketId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/ticket/${ticketId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Failed to fetch ticket');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

export const createTicket = createAsyncThunk(
  'tickets/createTicket',
  async (
    payload: { title: string; description: string; category: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${BASE_URL}/ticket`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Failed to create ticket');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

export const addMessage = createAsyncThunk(
  'tickets/addMessage',
  async (
    { ticketId, text }: { ticketId: string; text: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${BASE_URL}/ticket/${ticketId}/message`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Failed to send message');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

export const deleteTicket = createAsyncThunk(
  'tickets/deleteTicket',
  async (ticketId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/ticket/${ticketId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Failed to delete ticket');
      return ticketId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

/* ── Slice ── */
const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearSelectedTicket(state) {
      state.selectedTicket = null;
    },
    clearError(state) {
      state.error = null;
    },
    // Optimistic update: append message to selectedTicket
    appendMessageOptimistic(
      state,
      action: PayloadAction<{ ticketId: string; message: TicketMessage }>
    ) {
      const { ticketId, message } = action.payload;
      if (state.selectedTicket?._id === ticketId) {
        state.selectedTicket.messages.push(message);
      }
      const t = state.tickets.find((t) => t._id === ticketId);
      if (t) t.messages.push(message);
    },
  },
  extraReducers: (builder) => {
    /* fetchMyTickets */
    builder
      .addCase(fetchMyTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTickets.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        const raw = payload.data?.tickets ?? payload.data ?? [];
        state.tickets = Array.isArray(raw) ? raw : [];
        state.pagination = payload.data?.pagination ?? null;
      })
      .addCase(fetchMyTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    /* fetchTicketById */
    builder
      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTicket = action.payload.data ?? action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    /* createTicket */
    builder
      .addCase(createTicket.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.actionLoading = false;
        const newTicket = action.payload.data ?? action.payload;
        if (newTicket?._id) {
          state.tickets.unshift(newTicket);
        }
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    /* addMessage */
    builder
      .addCase(addMessage.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addMessage.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated: Ticket = action.payload.data ?? action.payload;
        if (updated?._id) {
          // Replace in list
          state.tickets = state.tickets.map((t) =>
            t._id === updated._id ? updated : t
          );
          // Replace selectedTicket if open
          if (state.selectedTicket?._id === updated._id) {
            state.selectedTicket = updated;
          }
        }
      })
      .addCase(addMessage.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    /* deleteTicket */
    builder
      .addCase(deleteTicket.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.actionLoading = false;
        const id = action.payload;
        state.tickets = state.tickets.filter((t) => t._id !== id);
        if (state.selectedTicket?._id === id) {
          state.selectedTicket = null;
        }
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedTicket, clearError, appendMessageOptimistic } =
  ticketSlice.actions;
export default ticketSlice.reducer;
