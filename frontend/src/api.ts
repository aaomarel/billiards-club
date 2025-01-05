import axios from 'axios';

const API_URL = 'http://localhost:5002/api'; // Updated port to match backend

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
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
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: { name: string; email: string; password: string; studentId: string }) =>
    api.post('/auth/register', userData),
};

export const matches = {
  getAll: () => 
    api.get('/matches'),
  
  create: (matchData: {
    type: '1v1' | '2v2';
    datetime: string;
    location: string;
    isRanked: boolean;
  }) => api.post('/matches', matchData),
  
  join: (matchId: string) =>
    api.post(`/matches/${matchId}/join`),
  
  leave: (matchId: string) =>
    api.post(`/matches/${matchId}/leave`),
    
  cancel: (matchId: string) =>
    api.post(`/matches/${matchId}/cancel`),
    
  recordResult: (matchId: string, result: {
    winners: string[];
    losers: string[];
    score?: string;
  }) => api.post(`/matches/${matchId}/result`, result),
  
  registerTeam: (matchId: string, teammateId: string) =>
    api.post(`/matches/${matchId}/register-team`, { teammateId }),
};

export const stats = {
  getLeaderboard: () =>
    api.get('/stats/leaderboard'),
    
  getUserStats: (userId: string) =>
    api.get(`/stats/user/${userId}`),
};

export default api;