import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
interface CompanyData {
    map: {
        lat: number;
        long: number;
    };
    _id: string;
    site_name: string;
    email: string;
    phone: string;
    phone1: string;
    address: string;
    gst: string;
    banner: string;
    loader: string;
    fav_icon: string;
    header_logo: string;
    footer_logo: string;
    signatory: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
    youtube: string;
    whatsapp: string;
    pinterest: string;
    googleMyBusiness: string;
    playstoreLink: string;
    footer_description: string;
    footer_about: string;
    header_link: any[];
    footer_link: any[];
    seo_keyword: string;
    seo_description: string;
    description: string;
    about_us: string;
    term_condition: string;
    privacy_policy: string;
    return_policy: string;
    refund_policy: string;
    shippingAndDelivery: string;
    theme_color: string;
    font_style: string;
    productDeliveryFee: number;
    minDelAmount: number;
    adminCharge: number;
    ONBOARDING_DATA: Array<{
        title: string;
        subtitle: string;
        color: string;
        image: string;
        _id: string;
    }>;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface CompanyState {
    data: CompanyData | null;
    loading: boolean;
    error: string | null;
}

const initialState: CompanyState = {
    data: null,
    loading: false,
    error: null,
};

export const fetchCompanyData = createAsyncThunk(
    'company/fetchCompanyData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/company`);
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch company data');
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const companySlice = createSlice({
    name: 'company',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCompanyData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCompanyData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchCompanyData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default companySlice.reducer;
