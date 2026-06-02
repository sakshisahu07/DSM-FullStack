import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bulkInquiryReducer from './slices/bulkInquirySlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import companyReducer from './slices/companySlice';
import categoryReducer from './slices/categorySlice';
import comboReducer from './slices/comboSlice';
import ratingReducer from './slices/ratingSlice';
import productReducer from './slices/productSlice';
import blogReducer from './slices/blogSlice';
import projectReducer from './slices/projectSlice';
import faqReducer from './slices/faqSlice';
import careerReducer from './slices/careerSlice';
import videoReducer from './slices/videoSlice';
import atlReducer from './slices/atlSlice';
import affiliateReducer from './slices/affiliateSlice';
import walletReducer from './slices/walletSlice';
import notificationReducer from './slices/notificationSlice';
import membershipReducer from './slices/membershipSlice';
import addressReducer from './slices/addressSlice';
import orderReducer from './slices/orderSlice';
import ticketReducer from './slices/ticketSlice';
import plansReducer from './slices/plansSlice';
import couponsReducer from './slices/couponsSlice';
import pointsReducer from './slices/pointsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bulkInquiry: bulkInquiryReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    combo: comboReducer,
    rating: ratingReducer,
    company: companyReducer,
    category: categoryReducer,
    product: productReducer,
    blog: blogReducer,
    project: projectReducer,
    faq: faqReducer,
    career: careerReducer,
    video: videoReducer,
    atl: atlReducer,
    affiliate: affiliateReducer,
    wallet: walletReducer,
    notification: notificationReducer,
    membership: membershipReducer,
    address: addressReducer,
    order: orderReducer,
    tickets: ticketReducer,
    plans: plansReducer,
    coupons: couponsReducer,
    points: pointsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
