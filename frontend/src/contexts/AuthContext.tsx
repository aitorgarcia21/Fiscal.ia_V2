import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '../services/apiClient'; // apiClient gère déjà le token

interface AuthUser {
  id: string;
  email: string;
  user_metadata?: any; // Peut contenir full_name, etc.
  taper?: string; // 'professionnel' ou autre rôle
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isProfessional: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  signup: (email: string, password: string, fullName: string, accountType: 'particulier' | 'professionnel') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isProfessional, setIsProfessional] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const checkAuthStatus = useCallback(async () => {
    setIsLoadingAuth(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsProfessional(false);
      setIsLoadingAuth(false);
      return;
    }

    try {
      // apiClient ajoute déjà le token, donc pas besoin de le remettre ici
      const userData = await apiClient<AuthUser>(`/api/auth/me`, { method: 'GET' });
      setUser(userData);
      setIsAuthenticated(true);
      setIsProfessional(userData.taper === 'professionnel');
    } catch (error) {
      console.error("Erreur checkAuthStatus: ", error);
      localStorage.removeItem('authToken'); // Token invalide ou expiré
      setUser(null);
      setIsAuthenticated(false);
      setIsProfessional(false);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient<{ access_token: string, user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        data: { email, password },
      });
      if (response && response.access_token && response.user) {
        localStorage.setItem('authToken', response.access_token);
        setUser(response.user);
        setIsAuthenticated(true);
        setIsProfessional(response.user.taper === 'professionnel');
      } else {
        throw new Error("La réponse du serveur est invalide.");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error; // Propage l'erreur pour que le composant de connexion puisse la gérer
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
    setIsProfessional(false);
    // Optionnel: rediriger vers la page d'accueil ou de connexion
    // window.location.href = '/';
  };

  const signup = async (email: string, password: string, fullName: string, accountType: 'particulier' | 'professionnel') => {
    try {
      const response = await apiClient<{ access_token: string, user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        data: { email, password, full_name: fullName, account_type: accountType },
      });
      if (response && response.access_token && response.user) {
        localStorage.setItem('authToken', response.access_token);
        setUser(response.user);
        setIsAuthenticated(true);
        setIsProfessional(response.user.taper === 'professionnel');
      } else {
        throw new Error("La réponse du serveur est invalide.");
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isProfessional, isLoadingAuth, login, logout, checkAuthStatus, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 