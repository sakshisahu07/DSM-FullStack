import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { BASE_URL } from '../redux/slices/apiConfig';

const pendingRequests = new Map<string, AbortController>();

const getRequestKey = (config: InternalAxiosRequestConfig): string => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.data)}`;
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token & Handle Deduplication
axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Attach JWT Authorization Token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Prevent duplicate pending requests
    const requestKey = getRequestKey(config);
    if (pendingRequests.has(requestKey)) {
      const controller = pendingRequests.get(requestKey);
      controller?.abort(); // Cancel previous duplicate in-flight call
    }

    const controller = new AbortController();
    config.signal = controller.signal;
    pendingRequests.set(requestKey, controller);

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Remove pending request mapping & handle global errors
axiosInstance.interceptors.response.use(
  (response) => {
    const requestKey = getRequestKey(response.config as InternalAxiosRequestConfig);
    pendingRequests.delete(requestKey);
    return response;
  },
  (error: AxiosError) => {
    if (error.config) {
      const requestKey = getRequestKey(error.config as InternalAxiosRequestConfig);
      pendingRequests.delete(requestKey);
    }

    // Handle standard cancellation
    if (axios.isCancel(error)) {
      return Promise.reject(new Error('REQUEST_CANCELLED'));
    }

    // Global session expiration handler (401)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
