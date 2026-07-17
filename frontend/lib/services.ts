import apiClient from './apiClient';

export interface CreateGoalPayload {
  title: string;
  description?: string;
  goalType: "task" | "project";
  startDate?: string;
  endDate?: string;
  stakeholders?: string[];
  daysOfWeek?: number[];
  subtasks?: { title: string; deadline: string }[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (username: string, email: string, password: string) =>
    apiClient.post('/auth/register', { username, email, password }),

  getCurrentUser: () => apiClient.get<UserProfile>('/auth/me'),

  updateProfile: (data: { username?: string; avatar?: File }) => {
    const formData = new FormData();
    if (data.username) formData.append("username", data.username);
    if (data.avatar) formData.append("avatar", data.avatar);
    return apiClient.patch<UserProfile>('/auth/profile', formData);
  },

  logout: () => apiClient.post('/auth/logout'),
};

export const goalsAPI = {
  create: (data: CreateGoalPayload) =>
    apiClient.post('/goals', data),

  list: () =>
    apiClient.get('/goals'),
};

export interface FeedItem {
  id: string;
  userName: string;
  userId: string;
  goalTitle: string;
  goalId: string;
  description?: string;
  proofData: string;
  status: "pending" | "verified" | "failed";
  timestamp: string;
}

export const evidenceAPI = {
  submit: (goalId: string, file: File, subtaskId?: string) => {
    const formData = new FormData();
    formData.append("goalId", goalId);
    if (subtaskId) formData.append("subtaskId", subtaskId);
    formData.append("proof", file);
    return apiClient.post("/evidence", formData);
  },

  getFeed: () =>
    apiClient.get<FeedItem[]>("/evidence/feed"),
};

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  isCurrentUser: boolean;
}

export const friendsAPI = {
  sendRequest: (identifier: string) =>
    apiClient.post('/friends/request', { identifier }),

  acceptRequest: (id: string) =>
    apiClient.patch(`/friends/request/${id}/accept`),

  declineRequest: (id: string) =>
    apiClient.patch(`/friends/request/${id}/decline`),

  cancelRequest: (id: string) =>
    apiClient.delete(`/friends/request/${id}`),

  listFriends: () =>
    apiClient.get('/friends'),

  listRequests: () =>
    apiClient.get('/friends/requests'),

  searchUsers: (query: string) =>
    apiClient.get('/friends/search', { params: { q: query } }),

  getSuggestions: () =>
    apiClient.get('/friends/suggestions'),

  getLeaderboard: () =>
    apiClient.get<LeaderboardEntry[]>('/friends/leaderboard'),
};
