import axios from 'axios';

// URL de base de notre API Django
const API_BASE_URL = 'https://gestion-contacts-api.onrender.com/api';

// Clé utilisée pour stocker le token dans localStorage
const TOKEN_KEY = 'auth_token';

// ============================================================
// CLIENT AXIOS
// ============================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// INTERCEPTEUR DE REQUÊTE
// Ajoute automatiquement le token à chaque requête
// ============================================================

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// ============================================================
// INTERCEPTEUR DE RÉPONSE
// Si on reçoit 401 (token invalide/expiré), on déconnecte
// ============================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Rediriger vers login seulement si on n'y est pas déjà
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================
// HELPERS TOKEN
// ============================================================

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
};

export default api;