import React, { useState } from 'react';
import { X } from 'lucide-react';
// import { supabase } from '../../lib/supabase'; // Supprimé, nous passons par notre API backend
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient'; // Utilisé pour appeler le backend
import { useAuth } from '../../contexts/AuthContext'; // Import du hook useAuth

interface AuthModalProps {
  onClose: () => void;
  mode?: 'login' | 'signup';
  // Ajout d'un callback optionnel en cas de succès pour plus de flexibilité
  onSuccess?: (data: any) => void;
  expectedRole?: 'particulier' | 'professionnel'; // Nouvelle prop
}

// L'interface AuthUser ici peut être simplifiée ou alignée avec celle de AuthContext si nécessaire
interface BackendAuthResponseUser {
    id: string;
    email: string;
    full_name?: string;
    taper?: string; // Important pour déterminer si c'est un pro
}

interface BackendAuthResponse {
    access_token: string;
    token_type: string;
    user: BackendAuthResponseUser;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, mode, onSuccess, expectedRole }) => {
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Pour l'inscription
  const [accountType, setAccountType] = useState('particulier'); // Ajout pour le type de compte
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth(); // Utilisation du contexte d'authentification

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let responseData: BackendAuthResponse;
      if (isLogin) {
        responseData = await apiClient<BackendAuthResponse>('/api/auth/login', {
          method: 'POST',
          data: { email, password },
        });
      } else {
        responseData = await apiClient<BackendAuthResponse>('/api/auth/register', {
          method: 'POST',
          data: { email, password, full_name: fullName, account_type: accountType }, // Envoyer full_name et account_type
        });
      }
      
      if (responseData && responseData.access_token && responseData.user) {
        const actualUserRole = responseData.user.taper;

        // Vérifier si le rôle réel correspond au rôle attendu, si un rôle attendu est fourni
        if (expectedRole && actualUserRole !== expectedRole) {
          if (expectedRole === 'professionnel') {
            setError("Ce compte n'est pas un compte Professionnel. Veuillez vous connecter avec un compte Professionnel pour accéder à cet espace.");
          } else if (expectedRole === 'particulier') {
            setError("Ce compte n'est pas un compte Particulier. Veuillez vous connecter avec un compte Particulier.");
          } else {
            setError("Le type de votre compte ne correspond pas à l'accès demandé.");
          }
          setIsLoading(false);
          return; // Ne pas continuer la connexion/redirection
        }

        // Si la vérification du rôle attendu passe (ou si aucun rôle n'est attendu)
        const contextUser = {
            id: responseData.user.id,
            email: responseData.user.email,
            user_metadata: { full_name: responseData.user.full_name }, // Exemple de mapping
            taper: actualUserRole
        };
        await auth.login(responseData.access_token, contextUser);
        
        onClose(); // Fermer la modale
        if (onSuccess) {
            onSuccess(responseData); // Exécuter le callback de succès si fourni
        }
        
        // Redirection automatique selon le type d'utilisateur
        if (actualUserRole === 'professionnel') {
            navigate('/pro/dashboard');
        } else {
            navigate('/dashboard');
        }

      } else {
        // Au cas où la réponse du backend n'est pas conforme à ce qui est attendu
        throw new Error("Réponse d'authentification invalide du serveur.");
      }
    } catch (err: any) {
      console.error("AuthModal Error:", err);
      setError(err.data?.detail || err.message || 'Une erreur est survenue lors de l\'authentification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-gradient-to-br from-[#1a2942] to-[#234876] rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border border-[#c5a572]/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Fermer la modale"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h2>
          <p className="text-gray-300">
            {isLogin ? 'Bienvenue ! Connectez-vous à votre espace.' : 'Créez votre compte pour accéder à nos services.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a2942]/60 border border-[#c5a572]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                  placeholder="Votre nom complet"
                  required={!isLogin}
                />
              </div>

              {/* Sélecteur de type de compte */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type de compte
                </label>
                <div className="flex items-center space-x-4">
                  <label htmlFor="particulier" className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      id="particulier"
                      name="accountType"
                      value="particulier"
                      checked={accountType === 'particulier'}
                      onChange={() => setAccountType('particulier')}
                      className="form-radio h-4 w-4 text-[#c5a572] bg-gray-700 border-gray-600 focus:ring-[#c5a572]"
                    />
                    <span className="ml-2 text-sm text-gray-200">Particulier</span>
                  </label>
                  <label htmlFor="professionnel" className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      id="professionnel"
                      name="accountType"
                      value="professionnel"
                      checked={accountType === 'professionnel'}
                      onChange={() => setAccountType('professionnel')}
                      className="form-radio h-4 w-4 text-[#c5a572] bg-gray-700 border-gray-600 focus:ring-[#c5a572]"
                    />
                    <span className="ml-2 text-sm text-gray-200">Professionnel (Patrimonia)</span>
                  </label>
                </div>
              </div>
            </>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-[#1a2942]/60 border border-[#c5a572]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[#1a2942]/60 border border-[#c5a572]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-700/20 border border-red-600/30 rounded-lg px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-bold py-3 px-4 rounded-lg hover:shadow-[#c5a572]/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'Créer un compte')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm text-[#c5a572] hover:text-[#e8cfa0] hover:underline transition-colors"
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
}; 