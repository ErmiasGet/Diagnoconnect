import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          await SecureStore.setItemAsync('accessToken', data.data.accessToken);
          await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: Record<string, unknown>) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
};

export const patientsAPI = {
  getAll: (params?: Record<string, string>) => api.get('/patients', { params }),
  getById: (id: string) => api.get(`/patients/${id}`),
  create: (data: Record<string, unknown>) => api.post('/patients', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/patients/${id}`, data),
  search: (query: string) => api.get('/patients/search', { params: { q: query } }),
};

export const appointmentsAPI = {
  getAll: (params?: Record<string, string>) => api.get('/appointments', { params }),
  getById: (id: string) => api.get(`/appointments/${id}`),
  create: (data: Record<string, unknown>) => api.post('/appointments', data),
  cancel: (id: string) => api.patch(`/appointments/${id}/cancel`),
  complete: (id: string) => api.patch(`/appointments/${id}/complete`),
};

export const visitsAPI = {
  getAll: (params?: Record<string, string>) => api.get('/visits', { params }),
  getById: (id: string) => api.get(`/visits/${id}`),
  create: (data: Record<string, unknown>) => api.post('/visits', data),
  updateStatus: (id: string, status: string) => api.patch(`/visits/${id}/status`, { status }),
};

export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId: string) => api.get(`/chat/messages/${conversationId}`),
  sendMessage: (data: Record<string, unknown>) => api.post('/chat/messages', data),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/activity'),
};

export default api;
