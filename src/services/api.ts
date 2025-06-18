import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { DuplicateBudgetOptions } from '../types';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API methods
export const api = {
  get: <T = any>(url: string, params?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.get(url, { params }),

  post: <T = any>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.post(url, data),

  put: <T = any>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.put(url, data),

  patch: <T = any>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.patch(url, data),

  delete: <T = any>(url: string): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.delete(url),
};

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    currency?: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  getProfile: () => api.get('/auth/profile'),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => api.post('/auth/change-password', data),
};

// Budget API
export const budgetAPI = {
  create: (data: {
    name: string;
    description?: string;
    color?: string;
  }) => api.post('/budgets', data),

  getAll: (params?: {
    page?: number;
    limit?: number;
    includeArchived?: boolean;
    search?: string;
  }) => api.get('/budgets', params),

  getById: (id: string) => api.get(`/budgets/${id}`),

  update: (id: string, data: {
    name?: string;
    description?: string;
    color?: string;
    isArchived?: boolean;
  }) => api.put(`/budgets/${id}`, data),

  delete: (id: string) => api.delete(`/budgets/${id}`),

  duplicate: (id: string, data : DuplicateBudgetOptions) => api.post(`/budgets/${id}/duplicate`, data),

  getSummary: (id: string) => api.get(`/budgets/${id}/summary`)
};

// Category API
export const categoryAPI = {
  create: (data: {
    budgetId: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    plannedAmount?: number;
    color?: string;
  }) => api.post('/categories', data),

  getAll: (params?: {
    budgetId?: string;
    type?: 'INCOME' | 'EXPENSE';
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => api.get('/categories', params),

  getById: (id: string) => api.get(`/categories/${id}`),

  update: (id: string, data: {
    name?: string;
    plannedAmount?: number;
    actualAmount?: number;
    color?: string;
    isActive?: boolean;
  }) => api.put(`/categories/${id}`, data),

  delete: (id: string) => api.delete(`/categories/${id}`),

  getByBudget: (budgetId: string) => api.get(`/categories/budget/${budgetId}`),

  updateActuals: () => api.post('/categories/update-actuals'),
};

// Transaction API
export const transactionAPI = {
  create: (data: {
    budgetId: string;
    categoryId: string;
    amount: number;
    description: string;
    date: string;
    isPosted?: boolean;
    receiptUrl?: string;
  }) => api.post('/transactions', data),

  getAll: (params?: {
    budgetId?: string;
    categoryId?: string;
    isPosted?: boolean;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
    sortBy?: 'date' | 'amount' | 'description' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => api.get('/transactions', params),

  getById: (id: string) => api.get(`/transactions/${id}`),

  update: (id: string, data: {
    categoryId?: string;
    amount?: number;
    description?: string;
    date?: string;
    isPosted?: boolean;
    receiptUrl?: string;
  }) => api.put(`/transactions/${id}`, data),

  delete: (id: string) => api.delete(`/transactions/${id}`),

  bulkUpdate: (data: {
    transactionIds: string[];
    updates: {
      isPosted?: boolean;
      categoryId?: string;
    };
  }) => api.patch('/transactions/bulk-update', data),

  getBudgetSummary: (budgetId: string) =>
    api.get(`/transactions/budget/${budgetId}/summary`),
};

export default api;