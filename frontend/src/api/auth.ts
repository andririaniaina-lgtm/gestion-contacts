import api, { tokenStorage } from './client';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '../types';

export const authService = {
  /**
   * Se connecter avec username + password.
   * Stocke le token dans localStorage.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login/', credentials);
    tokenStorage.set(response.data.token);
    return response.data;
  },

  /**
   * Créer un nouveau compte.
   */
  async register(data: RegisterData): Promise<{ message: string; user: User }> {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  /**
   * Se déconnecter : supprime le token côté serveur + local.
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout/');
    } finally {
      tokenStorage.remove();
    }
  },

  /**
   * Récupérer le profil de l'utilisateur connecté.
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile/');
    return response.data;
  },

  /**
   * Modifier le profil.
   */
  async updateProfile(data: Partial<User>): Promise<{ message: string; user: User }> {
    const response = await api.patch('/auth/profile/', data);
    return response.data;
  },

  /**
   * Vérifie si un token est présent localement.
   */
  isAuthenticated(): boolean {
    return !!tokenStorage.get();
  },
};