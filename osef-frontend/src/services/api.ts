import axios from 'axios';
import type { AuthResponse, Event, LoginCredentials, SignupCredentials, User } from '../types/index';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),
  
  signup: (credentials: SignupCredentials) =>
    api.post<User>('/users', credentials),
};

// Users API
export const usersAPI = {
  getAll: () => api.get<User[]>('/users'),
  
  getById: (id: number) => api.get<User>(`/users/${id}`),
  
  update: (id: number, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data),
  
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Events API
export const eventsAPI = {
  getAll: () => api.get<Event[]>('/events'),
  
  getById: (id: number) => api.get<Event>(`/events/${id}`),
  
  create: (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    affectedUsers?: number[];
  }) => api.post<Event>('/events', data),
  
  update: (id: number, data: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    affectedUsers?: number[];
  }) => api.put<Event>(`/events/${id}`, data),
  
  delete: (id: number) => api.delete(`/events/${id}`),
};

export default api;

