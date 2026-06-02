import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchMyMembership, purchaseMembership, upgradeMembership, cancelMembership } from '../redux/slices/membershipSlice';

export const useMembership = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.membership);

  const getMembership = () => dispatch(fetchMyMembership());
  
  const purchase = (planId: string, paymentId: string) => 
    dispatch(purchaseMembership({ planId, paymentId })).unwrap();
    
  const upgrade = (newPlanId: string, paymentId: string) => 
    dispatch(upgradeMembership({ newPlanId, paymentId })).unwrap();
    
  const cancel = () => 
    dispatch(cancelMembership()).unwrap();

  return {
    ...state,
    getMembership,
    purchase,
    upgrade,
    cancel,
  };
};
