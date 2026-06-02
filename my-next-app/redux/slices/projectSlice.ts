import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from './apiConfig';
export interface ProjectDetailPoint {
  _id: string;
  point: string;
}

export interface ProjectSpecification {
  _id: string;
  key: string;
  detail: string;
}

export interface ProjectHeroCard {
  _id: string;
  icon: string;
  heading: string;
  subHeading: string;
  description: string;
}

export interface ProjectHero {
  _id: string;
  pageTitle: string;
  subTitle: string;
  description: string;
  pageIcon: string;
  cards: ProjectHeroCard[];
  isActive: boolean;
}

export interface Project {
  _id: string;
  title: string;
  category: {
    _id: string;
    title: string;
    icon: string;
  };
  subCategory: {
    _id: string;
    title: string;
    icon: string | null;
  };
  projectType: string;
  icon: string;
  banner: string;
  images: string[];
  video: string | null;
  rating: number;
  totalRatings: number;
  totalViews: number;
  totalDownloads: number;
  mrp: number;
  discount: number;
  discountAmount: number;
  finalPrice: number;
  description: string;
  details: string;
  detailPoints: ProjectDetailPoint[];
  specifications: ProjectSpecification[];
  keyFeatures: string[];
  advancedFeatures: string[];
  applications: string[];
  componentUsers: string[];
  sourceCode: string;
  disable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRating {
  _id: string;
  project: string;
  user: {
    _id: string;
    email: string;
  };
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRatingSummary {
  averageRating: number;
  totalRatings: number;
}

export interface ProjectStarBreakdown {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  hero: ProjectHero | null;
  heroLoading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  
  // Ratings specifically for a project
  ratings: ProjectRating[];
  ratingsSummary: ProjectRatingSummary | null;
  starBreakdown: ProjectStarBreakdown | null;
  ratingsPagination: any | null;
  ratingsLoading: boolean;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  hero: null,
  heroLoading: false,
  pagination: null,
  
  ratings: [],
  ratingsSummary: null,
  starBreakdown: null,
  ratingsPagination: null,
  ratingsLoading: false,
};

export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (params: string = '', { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/projects?${params}`, {
        headers
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
         return rejectWithValue(data.message || 'Failed to fetch projects');
      }
      return { 
        projects: data.data,
        pagination: data.pagination 
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'project/fetchProjectById',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/project/${id}`, {
        headers
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to fetch project');
      }
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProjectRatings = createAsyncThunk(
  'project/fetchProjectRatings',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/project/${projectId}/ratings`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to fetch project ratings');
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProjectHero = createAsyncThunk(
  'project/fetchProjectHero',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/project-hero`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to fetch project hero');
      }
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.projects;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Project By Id
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Project Ratings
      .addCase(fetchProjectRatings.pending, (state) => {
        state.ratingsLoading = true;
      })
      .addCase(fetchProjectRatings.fulfilled, (state, action) => {
        state.ratingsLoading = false;
        state.ratings = action.payload.data;
        state.ratingsSummary = action.payload.summary;
        state.starBreakdown = action.payload.starBreakdown;
        state.ratingsPagination = action.payload.pagination;
      })
      .addCase(fetchProjectRatings.rejected, (state) => {
        state.ratingsLoading = false;
      })
      // Fetch Project Hero
      .addCase(fetchProjectHero.pending, (state) => {
        state.heroLoading = true;
      })
      .addCase(fetchProjectHero.fulfilled, (state, action) => {
        state.heroLoading = false;
        state.hero = action.payload;
      })
      .addCase(fetchProjectHero.rejected, (state) => {
        state.heroLoading = false;
      });
  },
});

export const { clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
