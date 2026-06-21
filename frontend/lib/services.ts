import apiClient from './apiClient';

export interface CreateGoalPayload {
  title: string;
  description?: string;
  goalType: "task" | "project";
  startDate?: string;
  endDate?: string;
  stakeholders?: string[];
  daysOfWeek?: number[];
  subtasks?: { title: string }[];
}

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (username: string, email: string, password: string) =>
    apiClient.post('/auth/register', { username, email, password }),

  getCurrentUser: () => apiClient.get('/auth/me'),

  logout: () => apiClient.post('/auth/logout'),
};

export const goalsAPI = {
  create: (data: CreateGoalPayload) =>
    apiClient.post('/goals', data),
};
