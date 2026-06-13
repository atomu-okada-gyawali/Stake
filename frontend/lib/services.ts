import apiClient from './apiClient';

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (fullName: string, email: string, password: string) =>
    apiClient.post('/auth/register', { fullName, email, password }),

  getCurrentUser: () => apiClient.get('/auth/me'),

  logout: () => apiClient.post('/auth/logout'),
};
