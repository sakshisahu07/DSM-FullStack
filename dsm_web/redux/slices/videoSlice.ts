import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from './apiConfig';


export interface Video {
  _id: string;
  categoryId: string;
  subCategoryId: string;
  title: string;
  description: string;
  duration: number;
  video: {
    url: string;
    key: string;
  };
  views: number;
  viewedBy: string[];
  createdAt: string;
  updatedAt: string;
}

interface VideoState {
  videos: Video[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: VideoState = {
  videos: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

export const fetchVideos = createAsyncThunk(
  'video/fetchVideos',
  async (params: string = '', { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}video?${params}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to fetch videos');
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const recordVideoView = createAsyncThunk(
  'video/recordVideoView',
  async (videoId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}video/${videoId}/view`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to record view');
      }
      return { videoId, views: data.views };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(recordVideoView.fulfilled, (state, action) => {
        const video = state.videos.find((v) => v._id === action.payload.videoId);
        if (video) {
          video.views = action.payload.views;
        }
      });
  },
});

export default videoSlice.reducer;
