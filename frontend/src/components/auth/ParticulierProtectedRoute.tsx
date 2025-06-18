import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function ParticulierProtectedRoute() {
  const { isAuthenticated, isProfessional, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    // Optionnel: Affichez un indicateur de chargement pendant que l'état d'authentification est vérifié
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2942] to-[#234876] text-white">Vérification de l'accès...</div>;
  }

  // L'utilisateur doit être authentifié (particulier OU professionnel peuvent accéder)
  if (isAuthenticated) {
    return <Outlet />;
  }
  
  // Sinon (non authentifié), redirigez vers la page d'accueil principale
  return <Navigate to="/" replace />;
} 