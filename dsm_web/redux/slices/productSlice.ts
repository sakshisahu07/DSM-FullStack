import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from './apiConfig';

interface Product {
  _id: string;
  title: string;
  name?: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  image: string;
  category?: string;
  subcategory?: string;
  subCategory?: string;
  brand?: string;
  description?: string;
  ratings?: number;
  reviews?: number;
  variantId?: string;
  isHot?: boolean;
  isTrending?: boolean;
  timeLeft?: string;
  slug?: string;
  isCombo?: boolean;
}

interface ProductState {
  products: Product[];
  relatedProducts: Product[];
  currentProduct: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  relatedProducts: [],
  currentProduct: null,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params: string = '', { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const cleanBaseUrl = BASE_URL?.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

      let url = params ? `${cleanBaseUrl}/products?${params}` : `${cleanBaseUrl}/products`;
      let response = await fetch(url, { headers });
      let data = await response.json();

      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch products');

      // Handle various response structures
      let rawProducts = [];
      if (Array.isArray(data.data)) {
        rawProducts = data.data;
      } else if (data.data && typeof data.data === 'object') {
        rawProducts = data.data.products || (data.data.product ? (Array.isArray(data.data.product) ? data.data.product : [data.data.product]) : []);
      }

      if (Array.isArray(rawProducts) && rawProducts.length > 0) {
        return rawProducts.map((item: any) => {
          const p = item.product || item;
          const v = (item.variants && item.variants[0]) || (p.variants && p.variants[0]) || {};

          return {
            ...p,
            _id: p._id,
            name: p.name || p.title || 'Unnamed Product',
            title: p.title || p.name || 'Unnamed Product',
            image: (p.images && p.images[0]) || p.image || p.icon || '/images/product-image.png',
            price: v.finalPrice || p.finalPrice || p.coinPrice || p.price || 0,
            oldPrice: v.mrp || p.mrp || p.oldPrice || 0,
            discount: v.discount || p.discount || 0,
            category: p.categoryId?.title || p.category || 'Electronics',
            subCategory: p.subCategoryId?.title || p.subCategory || 'Gadgets',
            variantId: v._id || p._id,
            isHot: p.hotdeal || p.hotDeal || false,
            isTrending: p.topDeal || p.trending || false,
            slug: p.slug,
            description: p.description || ''
          };
        });
      }

      return [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const cleanBaseUrl = BASE_URL?.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
      const response = await fetch(`${cleanBaseUrl}/product/${id}/with-variants`, {
        headers
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch product');
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  'product/fetchRelatedProducts',
  async ({ categoryId, subCategoryId, limit = 10 }: { categoryId?: string, subCategoryId?: string, limit?: number }, { rejectWithValue }) => {
    try {
      const cleanBaseUrl = BASE_URL?.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
      const queryParams = new URLSearchParams();
      if (categoryId) queryParams.append('categoryId', categoryId);
      if (subCategoryId) queryParams.append('subCategoryId', subCategoryId);
      queryParams.append('limit', limit.toString());

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${cleanBaseUrl}/products/related?${queryParams.toString()}`;
      const response = await fetch(url, { headers });
      const data = await response.json();

      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch related products');

      let rawProducts = [];
      if (Array.isArray(data.data)) {
        rawProducts = data.data;
      } else if (data.data && typeof data.data === 'object') {
        rawProducts = data.data.products || (data.data.product ? (Array.isArray(data.data.product) ? data.data.product : [data.data.product]) : []);
      }

      return rawProducts.map((item: any) => {
        const p = item.product || item;
        const v = (item.variants && item.variants[0]) || (p.variants && p.variants[0]) || {};

        return {
          ...p,
          _id: p._id,
          name: p.name || p.title || 'Unnamed Product',
          title: p.title || p.name || 'Unnamed Product',
          image: (p.images && p.images[0]) || p.image || p.icon || '/images/product-image.png',
          price: v.finalPrice || p.finalPrice || p.coinPrice || p.price || 0,
          oldPrice: v.mrp || p.mrp || p.oldPrice || 0,
          discount: v.discount || p.discount || 0,
          category: p.categoryId?.title || p.category || 'Electronics',
          subCategory: p.subCategoryId?.title || p.subCategory || 'Gadgets',
          variantId: v._id || p._id,
          slug: p.slug,
          description: p.description || ''
        };
      });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.relatedProducts = action.payload;
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
