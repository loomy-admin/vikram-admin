/// <reference types="vite/client" />
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Configured via environment (Automatically selects Production Render API when deployed on Vercel)
export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  ((import.meta as any).env?.PROD
    ? 'https://student-learning-app-backend-87ht.onrender.com/api'
    : 'http://localhost:5000/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 and Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: any; code?: string }>) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Token expired or invalid
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_profile');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * Extracts a friendly user-facing error message from an Axios error
 */
export function getErrorMessage(error: unknown, fallback: string = 'An unexpected error occurred'): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'The backend server took too long to respond. If hosted on Render free tier, it may be waking up from hibernation (cold starts can take 50-90s). Please try again in a moment.';
    }
    if (error.message === 'Network Error') {
      return 'Unable to reach the server. Please check your internet connection or backend status.';
    }
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.response?.status === 409) {
      return 'A conflict occurred. The record may already exist.';
    }
    if (error.response?.status === 500) {
      return 'Internal server error. Please try again later.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await apiClient.get('/health', { timeout: 10000 });
    return res.status === 200;
  } catch {
    return false;
  }
}
