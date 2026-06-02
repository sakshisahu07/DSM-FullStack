import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchPlans } from '../redux/slices/plansSlice';

export const usePlans = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.plans);

  const getPlans = () => dispatch(fetchPlans());

  return {
    ...state,
    getPlans,
  };
};
