import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../components/ui/Logo';
import { supabase } from '../lib/supabase';

/**
 * Page de connexion Francis Andorre - Design épuré et élégant
 */
export const AndorreLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.session?.access_token || '');
        navigate('/analyse-ia-fiscale-andorrane');
      }
    } catch (error: any) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <title>Francis Andorre - Connexion</title>
      <meta name="description" content="Connectez-vous à Francis Andorre, l'IA experte en fiscalité andorrane." />
      
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#162238] to-[#1E3253] flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm sm:max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <Link to="/andorre" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c5a572] transition-colors mb-4 sm:mb-6 touch-manipulation">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm sm:text-base">Retour</span>
            </Link>
            
            <div className="flex justify-center items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Logo size="md" className="sm:w-12 sm:h-12" />
              <span className="text-lg sm:text-2xl bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent font-bold leading-tight">
                Francis Andorre
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Connexion</h1>
          </div>

          {/* Formulaire */}
          <div className="bg-gradient-to-br from-[#162238]/80 to-[#1E3253]/80 backdrop-blur-xl p-4 sm:p-8 rounded-xl sm:rounded-2xl border border-[#c5a572]/20 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-red-600/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 sm:py-3 bg-[#0A0F1C]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300 text-base touch-manipulation"
                    placeholder="votre@email.com"
                    autoComplete="email"
                    inputMode="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 sm:py-3 bg-[#0A0F1C]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300 text-base touch-manipulation"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors p-1 touch-manipulation"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] hover:from-[#b8956a] hover:to-[#dcc394] disabled:opacity-50 text-[#162238] font-bold py-3 sm:py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-base touch-manipulation min-h-[48px]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#162238]/30 border-t-[#162238] rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Connexion...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span className="text-sm sm:text-base">Se connecter</span>
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <div className="text-center">
                <Link 
                  to="/pro/signup" 
                  className="text-[#c5a572] hover:text-[#e8cfa0] transition-colors text-sm touch-manipulation inline-block py-2"
                >
                  Créer un compte
                </Link>
              </div>
              
              <div className="pt-3 sm:pt-4 border-t border-gray-600/30 text-center">
                <Link 
                  to="/andorre/payment" 
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 sm:py-2 px-4 sm:px-4 rounded-lg transition-all duration-300 text-sm touch-manipulation min-h-[44px] w-full sm:w-auto"
                >
                  <span>S'abonner</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold">49€/mois</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};
export default AndorreLoginPage;
