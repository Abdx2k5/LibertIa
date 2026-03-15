import axios from 'axios';
/**
 * Service API - Wrapper Axios pour Libertia
 * 
 * Rôle : Centraliser tous les appels vers le backend
 * - Ajoute automatiquement le token JWT dans les requêtes
 * - Gère les erreurs globales (401 → redirection login)
 * - URL de base configurée via .env (VITE_API_URL)
 * 
 * Utilisation dans les composants :
 *   import api from '../services/api'
 *   const res = await api.get('/voyages')
 *   const res = await api.post('/auth/login', data)
 * 
 * author Nada
 * date Mars 2026
 */

// L'URL du backend (server) - utilise import.meta.env pour Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajoute le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Gère les erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;