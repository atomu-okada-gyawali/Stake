// Environment variables for API configuration
export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  FRIENDS: {
    BASE: "/friends",
    REQUEST: "/friends/request",
    ACCEPT: (id: string) => `/friends/request/${id}/accept`,
    DECLINE: (id: string) => `/friends/request/${id}/decline`,
    CANCEL: (id: string) => `/friends/request/${id}`,
    REQUESTS: "/friends/requests",
    SEARCH: "/friends/search",
    SUGGESTIONS: "/friends/suggestions",
  },
};
