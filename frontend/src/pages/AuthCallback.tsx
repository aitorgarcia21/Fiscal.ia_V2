import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ErrorHandler } from '../utils/errorHandler';

export function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuthStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Récupérer les paramètres de l'URL (access_token, refresh_token, etc.)
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const searchParams = new URLSearchParams(location.search);
        
        // Vérifier s'il y a un token d'accès dans l'URL
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const tokenType = hashParams.get('token_type') || searchParams.get('token_type');
        const expiresIn = hashParams.get('expires_in') || searchParams.get('expires_in');
        
        if (accessToken && refreshToken) {
          // Configurer la session avec Supabase
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            ErrorHandler.handle(error, { logInDev: true, silent: false });
            setError('Erreur lors de l\'activation du compte');
            return;
          }

          // Actualiser l'état d'authentification
          await checkAuthStatus();

          // Rediriger vers le dashboard approprié
          const user = data.user;
          if (user) {
            // Vérifier le type de compte dans les métadonnées ou la base de données
            try {
              const { data: profile } = await supabase
                .from('profils_utilisateurs')
                .select('taper')
                .eq('user_id', user.id)
                .single();

              if (profile?.taper === 'professionnel') {
                navigate('/pro/dashboard', { replace: true });
              } else {
                navigate('/dashboard', { replace: true });
              }
            } catch (profileError) {
              ErrorHandler.handle(profileError, { logInDev: true, silent: false });
              // Redirection par défaut vers le dashboard particulier
              navigate('/dashboard', { replace: true });
            }
          } else {
            navigate('/login', { replace: true });
          }
        } else {
          // Pas de tokens valides, rediriger vers la page de connexion
          setError('Lien d\'activation invalide ou expiré');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
        }
      } catch (err) {
        ErrorHandler.handle(err, { logInDev: true, silent: false });
        setError('Une erreur est survenue lors de l\'activation');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [location, navigate, checkAuthStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Activation de votre compte en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <p className="font-medium">Erreur d'activation</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <p className="mt-4 text-sm text-gray-500">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-green-600">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="mt-4 text-gray-600">Compte activé avec succès !</p>
        <p className="text-sm text-gray-500">Redirection en cours...</p>
      </div>
    </div>
  );
} 