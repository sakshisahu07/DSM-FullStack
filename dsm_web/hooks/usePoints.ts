import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchPointsBalance, earnPointsTransaction, redeemPointsTransaction } from '../redux/slices/pointsSlice';

export const usePoints = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.points);

  const getBalance = () => dispatch(fetchPointsBalance());
  
  const earn = (amount: number) => 
    dispatch(earnPointsTransaction(amount)).unwrap();
    
  const redeem = (points: number, orderAmount: number) => 
    dispatch(redeemPointsTransaction({ points, orderAmount })).unwrap();

  return {
    ...state,
    getBalance,
    earn,
    redeem,
  };
};
