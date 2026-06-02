import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1";

export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("dsm_token");
  if (!token || token === "undefined") return {};
  return { "Authorization": `Bearer ${token}` };
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("dsm_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle common errors like 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("dsm_token");
      // Optional: redirect to login
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("dsm_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Handle FormData (don't set Content-Type)
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("dsm_token");
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
    return response;
  }

  // Check for non-standard unauthorized responses (200 OK with success:false)
  const clone = response.clone();
  try {
    const json = await clone.json();
    if (json.success === false && (json.message?.toLowerCase().includes("token") || json.message?.toLowerCase().includes("authorized"))) {
      localStorage.removeItem("dsm_token");
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
  } catch (e) {
    // Not JSON or other error
  }

  return response;
};

