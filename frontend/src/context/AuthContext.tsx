import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authService, tokenStorage } from '../api';
import type { LoginCredentials, RegisterData, User } from '../types';

// ============================================================
// TYPES DU CONTEXTE
// ============================================================

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Au démarrage : si un token existe, on récupère le profil
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.get();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch {
        // Token invalide → on nettoie
        tokenStorage.remove();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  };

  const register = async (data: RegisterData) => {
    await authService.register(data);
    // Enchaîne sur un login automatique
    await login({ username: data.username, password: data.password });
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================
// HOOK
// ============================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un <AuthProvider>');
  }
  return context;
}