import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dc_token');
      localStorage.removeItem('dc_user');
      localStorage.removeItem('dc_org');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
};

export const patientsAPI = {
  getAll: (params?: Record<string, string>) => api.get('/patients', { params }),
  getById: (id: string) => api.get(`/patients/${id}`),
  create: (data: Record<string, unknown>) => api.post('/patients', data),
  search: (query: string) => api.get('/patients/search', { params: { q: query } }),
  checkIn: (id: string) => api.post(`/patients/${id}/check-in`),
};

export const visitsAPI = {
  getAll: (params?: Record<string, string>) => api.get('/visits', { params }),
  getById: (id: string) => api.get(`/visits/${id}`),
  create: (data: Record<string, unknown>) => api.post('/visits', data),
  updateStatus: (id: string, status: string) => api.patch(`/visits/${id}/status`, { status }),
};

export const appointmentsAPI = {
  getAll: (params?: Record<string, string>) => api.get('/appointments', { params }),
  verify: (id: string) => api.patch(`/appointments/${id}/verify`),
};

export const queueAPI = {
  getQueue: () => api.get('/queue'),
  callNext: () => api.post('/queue/call-next'),
  callSpecific: (id: string) => api.post(`/queue/${id}/call`),
  complete: (id: string) => api.post(`/queue/${id}/complete`),
  cancel: (id: string) => api.post(`/queue/${id}/cancel`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
