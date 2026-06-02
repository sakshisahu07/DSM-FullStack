import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchActiveCoupon, validateCouponCode, resetValidation } from '../redux/slices/couponsSlice';

export const useCoupons = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.coupons);

  const getActive = () => dispatch(fetchActiveCoupon());
  
  const validate = (code: string, amount: number) => 
    dispatch(validateCouponCode({ code, amount })).unwrap();
    
  const reset = () => dispatch(resetValidation());

  return {
    ...state,
    getActive,
    validate,
    reset,
  };
};
