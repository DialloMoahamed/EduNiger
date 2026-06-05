import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const getProfile = () => api.get('/auth/profile');
export const changePassword = (data) => api.post('/auth/change-password', data);
export const getUsers = () => api.get('/auth/users');

// Élèves
export const getEleves = (params) => api.get('/eleves', { params });
export const getEleve = (id) => api.get(`/eleves/${id}`);
export const createEleve = (data) => api.post('/eleves', data);
export const updateEleve = (id, data) => api.put(`/eleves/${id}`, data);
export const deleteEleve = (id) => api.delete(`/eleves/${id}`);
export const getElevesStats = () => api.get('/eleves/stats');

// Classes
export const getClasses = () => api.get('/classes');
export const getClasse = (id) => api.get(`/classes/${id}`);
export const createClasse = (data) => api.post('/classes', data);
export const updateClasse = (id, data) => api.put(`/classes/${id}`, data);
export const deleteClasse = (id) => api.delete(`/classes/${id}`);

// Présences
export const getPresences = (params) => api.get('/presences', { params });
export const markPresences = (data) => api.post('/presences/mark', data);
export const getElevePresenceStats = (eleveId) => api.get(`/presences/eleve/${eleveId}/stats`);
export const getClassePresenceStats = (classeId, params) => api.get(`/presences/classe/${classeId}/stats`, { params });

// Notes
export const getNotes = (params) => api.get('/notes', { params });
export const createNote = (data) => api.post('/notes', data);
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const deleteNote = (id) => api.delete(`/notes/${id}`);
export const getEleveMoyenne = (eleveId, periode) => api.get(`/notes/eleve/${eleveId}/moyenne`, { params: { periode } });
export const generateBulletin = (eleveId, periode) => api.get(`/notes/bulletin/${eleveId}/${periode}`);

export default api;

// École
export const getEcole   = ()     => api.get('/ecole');
export const updateEcole = (data) => api.put('/ecole', data);
