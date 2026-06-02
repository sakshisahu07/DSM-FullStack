import { AxiosError } from 'axios';

export const parseApiError = (error: any): string => {
  if (error instanceof Error && error.message === 'REQUEST_CANCELLED') {
    return 'Operation cancelled.';
  }
  
  const axiosError = error as AxiosError<{ message?: string }>;
  if (axiosError?.response?.data?.message) {
    return axiosError.response.data.message;
  }
  
  if (axiosError?.message) {
    return axiosError.message;
  }
  
  return 'An unexpected network error occurred. Please try again.';
};
