import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Importer useAuth

// Récupérer l'URL de base de l'API depuis les variables d'environnement Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''; // Fallback à une chaîne vide si non défini

export function ProProtectedRoute() {
  const { isAuthenticated, isProfessional, isLoadingAuth } = useAuth(); // Utiliser le hook
  const location = useLocation();

  if (isLoadingAuth) {
    // État de chargement initial du contexte d'authentification
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#162238] to-[#234876] text-white">
        Vérification de l'accès en cours...
      </div>
    );
  }

  if (isAuthenticated && isProfessional) {
    return <Outlet />; // Affiche le composant enfant (la page protégée)
  }

  // Rediriger vers la page de connexion (ou la page d'accueil) si non authentifié ou non professionnel
  // Garder l'URL actuelle pour redirection après connexion
  // Si vous voulez une page de login spécifique pour les pros, vous pouvez changer le "/"
  return <Navigate to="/" state={{ from: location, showLoginPro: true }} replace />;
  // Le `showLoginPro: true` dans l'état de navigation est une suggestion.
  // Vous pourriez l'utiliser sur la page d'accueil pour ouvrir automatiquement la modale de connexion
  // avec un message indiquant que l'accès pro est requis.
} 