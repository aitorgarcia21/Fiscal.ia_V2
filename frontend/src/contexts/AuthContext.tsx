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
  login: (token: string, userData?: AuthUser) => Promise<void>; // userData optionnel au login, on le récupère avec checkAuthStatus
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
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

  const login = async (token: string, userData?: AuthUser) => {
    localStorage.setItem('authToken', token);
    // Si userData est fourni (par ex. par la réponse de /login), on peut l'utiliser directement
    // Sinon, checkAuthStatus va le récupérer avec /me
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
      setIsProfessional(userData.taper === 'professionnel');
      setIsLoadingAuth(false); // Peut-être déjà false, mais pour être sûr
    } else {
      await checkAuthStatus(); // Récupère les infos utilisateur complètes
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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isProfessional, isLoadingAuth, login, logout, checkAuthStatus }}>
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