import axios from 'axios';
import { API_ENDPOINT } from './config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login(email: string, password: string) {
    return api.post('/auth/login', { email, password });
  },
  register(userData: { name: string; email: string; password: string; studentId: string }) {
    return api.post('/auth/register', userData);
  },
  getUsers() {
    return api.get('/auth/users');
  },
  updateAdminStatus(userId: string, makeAdmin: boolean) {
    return api.patch(`/auth/users/${userId}/admin`, { isAdmin: makeAdmin });
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
    return api.post(`/matches/${matchId}/register-team`, { teammateId });
  },
};

export const stats = {
  getLeaderboard() {
    return api.get('/stats/leaderboard');
  },
  getUserStats(userId: string) {
    return api.get(`/stats/user/${userId}`);
  },
};

export default api;