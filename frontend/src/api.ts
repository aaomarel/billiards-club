import axios from 'axios';
import { API_ENDPOINT } from './config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('No response from server'));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(error);
    }
  }
);

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  async login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  async register(userData: { name: string; email: string; password: string; studentId: string }) {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  getUsers() {
    return api.get('/auth/users');
  },
  updateAdminStatus(userId: string, makeAdmin: boolean) {
    return api.post(`/auth/${makeAdmin ? 'make-admin' : 'remove-admin'}/${userId}`);
  },
};

export const matches = {
  getAll() {
    return api.get('/matches');
  },
  create(matchData: {
    type: '1v1' | '2v2';
    datetime: string;
    location: string;
    isRanked: boolean;
  }) {
    return api.post('/matches', matchData);
  },
  join(matchId: string) {
    return api.post(`/matches/${matchId}/join`);
  },
  leave(matchId: string) {
    return api.post(`/matches/${matchId}/leave`);
  },
  cancel(matchId: string) {
    return api.post(`/matches/${matchId}/cancel`);
  },
  recordResult(matchId: string, result: {
    winners: string[];
    losers: string[];
    score?: string;
  }) {
    return api.post(`/matches/${matchId}/result`, result);
  },
  registerTeam(matchId: string, teammateId: string) {
    return api.post(`/matches/${matchId}/team`, { teammateId });
  },
};

export const stats = {
  getLeaderboard() {
    return api.get('/stats/leaderboard');
  },
  getUserStats(userId: string) {
    return api.get(`/users/${userId}/stats`);
  },
};

export default api;