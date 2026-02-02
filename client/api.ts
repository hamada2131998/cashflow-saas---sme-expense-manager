
import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ExpenseService = {
  create: (data: any) => api.post('/expenses', data),
  updateStatus: (id: string, status: string) => api.patch(`/expenses/${id}/status`, { status }),
  getAll: (params: any) => api.get('/expenses', { params })
};

export const DashboardService = {
  getSummary: () => api.get('/dashboard/summary')
};
