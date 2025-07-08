import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

export function CompleteSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setMessage('');
      
      const response = await apiClient('/auth/complete-signup', {
        method: 'POST',
        data: { 
          email: email.trim(), 
          password: password,
          confirm_password: confirmPassword
        }
      });
      
      if (response.access_token) {
        // Connexion réussie, enregistrer le token et rediriger
        localStorage.setItem('token', response.access_token);
        
        // Mettre à jour le contexte d'authentification
        if (response.user && login) {
          await login(response.access_token, response.user);
          
          setMessage('Votre compte a été activé avec succès ! Redirection en cours...');
          toast.success('Compte activé avec succès !');
          
          // Rediriger vers le tableau de bord après un court délai
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error('Erreur lors de l\'activation du compte:', err);
      
      // Gestion des erreurs plus détaillée
      if (err.response) {
        // Erreur du serveur avec un statut
        if (err.response.status === 400) {
          setError(err.response.data.detail || 'Données invalides. Veuillez vérifier vos informations.');
        } else if (err.response.status === 404) {
          setError('Aucun compte trouvé avec cet email. Veuillez vous inscrire d\'abord.');
        } else {
          setError(err.response.data.detail || 'Une erreur est survenue lors de l\'activation du compte');
        }
      } else if (err.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        setError('Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.');
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        setError('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
      }
      
      toast.error('Erreur lors de l\'activation du compte');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 max-w-md w-full shadow-2xl">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-[#c5a572] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Retour
        </button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Finalisez votre inscription</h1>
          <p className="text-gray-400">Créez un mot de passe pour accéder à votre compte</p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {message && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6 flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-[#c5a572] focus:border-transparent block w-full pl-10 p-3 placeholder-gray-500"
                placeholder="votre@email.com"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-[#c5a572] focus:border-transparent block w-full pl-10 p-3 placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Minimum 8 caractères
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirmez le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white/5 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-[#c5a572] focus:border-transparent block w-full pl-10 p-3 placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-[#162238] bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] hover:from-[#d4b47d] hover:to-[#f0d9a8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c5a572] transition-all duration-200 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#162238]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </>
              ) : (
                'Créer mon mot de passe'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Vous n'avez pas encore de compte ?{' '}
            <button 
              onClick={() => navigate('/signup')} 
              className="font-medium text-[#c5a572] hover:text-[#e8cfa0] transition-colors"
            >
              S'inscrire
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CompleteSignupPage;
