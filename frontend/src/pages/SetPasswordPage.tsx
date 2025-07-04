import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageSquare, Euro, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const SetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isInvitation, setIsInvitation] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier si c'est une invitation
        const invite = searchParams.get('invite');
        const email = searchParams.get('email');
        
        if (invite === 'true' && email) {
          setIsInvitation(true);
          setInvitationEmail(email);
          setIsAuthenticated(false); // Pas besoin d'être connecté pour une invitation
          setIsCheckingAuth(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'authentification:', err);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [searchParams]);

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/set-password`
        }
      });
      
      if (error) {
        setError(`Erreur lors de la connexion avec ${provider}: ${error.message}`);
      }
    } catch (err: any) {
      setError(`Erreur lors de la connexion avec ${provider}: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isInvitation && invitationEmail) {
        // Pour les invitations, on doit d'abord se connecter avec l'email
        // puis définir le mot de passe
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: invitationEmail,
          password: 'temporary_password_for_invitation'
        });

        if (signInError) {
          // Si la connexion échoue, on essaie de créer un compte
          const { error: signUpError } = await supabase.auth.signUp({
            email: invitationEmail,
            password: password
          });

          if (signUpError) {
            throw new Error(signUpError.message);
          }
        } else {
          // Si la connexion réussit, on met à jour le mot de passe
          const { error: updateError } = await supabase.auth.updateUser({ password });
          if (updateError) {
            throw new Error(updateError.message);
          }
        }
      } else {
        // Pour les utilisateurs connectés normalement
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          throw new Error(error.message);
        }
      }
      
      setMessage('Votre mot de passe a été défini avec succès ! Vous allez être redirigé vers le dashboard.');
      setTimeout(() => navigate('/dashboard'), 3000);
      
    } catch (err: any) {
      setError(`Erreur lors de la définition du mot de passe: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full bg-[#162238]/50 border border-[#2A3F6C] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5a572]";

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a572] mx-auto mb-4"></div>
          <p className="text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="relative inline-flex items-center justify-center group mb-4">
              <MessageSquare className="h-14 w-14 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
              <Euro className="h-8 w-8 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#1E3253] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white">Définir un mot de passe</h1>
          <p className="text-gray-400 mt-2">
            {isAuthenticated 
              ? "Créez un mot de passe pour votre compte" 
              : "Connectez-vous d'abord pour définir un mot de passe"
            }
          </p>
        </div>
        
        <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl">
          {message && <p className="text-green-400 text-center text-sm bg-green-900/20 p-3 rounded-lg mb-4">{message}</p>}
          {error && <p className="text-red-400 text-center text-sm bg-red-900/20 p-3 rounded-lg mb-4">{error}</p>}
          
          {!isAuthenticated ? (
            <div className="space-y-4">
              <div className="bg-[#1E3253]/30 p-4 rounded-lg border border-[#2A3F6C]/30">
                <div className="flex items-center mb-3">
                  <AlertCircle className="w-5 h-5 text-[#c5a572] mr-2" />
                  <h3 className="text-sm font-semibold text-[#c5a572]">Connexion requise</h3>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Vous devez être connecté pour définir un mot de passe. 
                  Si vous avez un compte OAuth (Google/GitHub), connectez-vous d'abord.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => handleOAuthLogin('google')}
                    className="w-full bg-white text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Se connecter avec Google
                  </button>
                  <button
                    onClick={() => handleOAuthLogin('github')}
                    className="w-full bg-gray-800 text-white font-semibold py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Se connecter avec GitHub
                  </button>
                </div>
              </div>
              <div className="text-center">
                <Link to="/login" className="text-sm text-gray-400 hover:text-[#c5a572] transition-colors">
                  Retour à la page de connexion
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nouveau mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${inputStyles} pl-12 pr-12`}
                  minLength={6}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`${inputStyles} pl-12 pr-12`}
                  minLength={6}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-lg hover:from-[#e8cfa0] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Définition...' : 'Définir le mot de passe'}
              </button>
            </form>
          )}
          
          {isAuthenticated && (
            <div className="text-center mt-6">
              <Link to="/login" className="text-sm text-gray-400 hover:text-[#c5a572] transition-colors">
                Retour à la page de connexion
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetPasswordPage; 