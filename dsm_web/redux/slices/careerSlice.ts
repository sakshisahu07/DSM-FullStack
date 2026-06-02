import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from './apiConfig';
export interface Job {
  _id: string;
  title: string;
  jobType: string;
  workMode: string;
  city: string;
  address: string;
  description: string;
  roleOverview: string;
  responsibilities: string[];
  skills: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CareerState {
  jobs: Job[];
  currentJob: Job | null;
  loading: boolean;
  error: string | null;
  applyLoading: boolean;
  applySuccess: boolean;
  applyError: string | null;
}

const initialState: CareerState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  applyLoading: false,
  applySuccess: false,
  applyError: null,
};

export const fetchJobs = createAsyncThunk(
  'career/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}jobs`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to fetch jobs');
      }
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchJobById = createAsyncThunk(
  'career/fetchJobById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}job/${id}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to fetch job');
      }
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const applyJob = createAsyncThunk(
  'career/applyJob',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}apply`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to apply job');
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const careerSlice = createSlice({
  name: 'career',
  initialState,
  reducers: {
    clearApplyStatus: (state) => {
      state.applyLoading = false;
      state.applySuccess = false;
      state.applyError = null;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload || [];
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Job By Id
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Apply Job
      .addCase(applyJob.pending, (state) => {
        state.applyLoading = true;
        state.applySuccess = false;
        state.applyError = null;
      })
      .addCase(applyJob.fulfilled, (state) => {
        state.applyLoading = false;
        state.applySuccess = true;
      })
      .addCase(applyJob.rejected, (state, action) => {
        state.applyLoading = false;
        state.applyError = action.payload as string;
      });
  },
});

export const { clearApplyStatus, clearCurrentJob } = careerSlice.actions;
export default careerSlice.reducer;
