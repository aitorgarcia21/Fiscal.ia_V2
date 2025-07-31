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
      
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#162238] to-[#1E3253] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/andorre" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c5a572] transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
            
            <div className="flex justify-center items-center gap-3 mb-6">
              <Logo size="lg" />
              <span className="text-2xl bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent font-bold">Francis Andorre</span>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Connexion</h1>
          </div>

          {/* Formulaire */}
          <div className="bg-gradient-to-br from-[#162238]/80 to-[#1E3253]/80 backdrop-blur-xl p-8 rounded-2xl border border-[#c5a572]/20 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
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
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0F1C]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                    placeholder="votre@email.com"
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
                    className="w-full pl-10 pr-10 py-3 bg-[#0A0F1C]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] hover:from-[#b8956a] hover:to-[#dcc394] disabled:opacity-50 text-[#162238] font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#162238]/30 border-t-[#162238] rounded-full animate-spin"></div>
                    Connexion...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    Se connecter
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link to="/pro/signup" className="text-[#c5a572] hover:text-[#e8cfa0] transition-colors text-sm">
                  Créer un compte
                </Link>
              </div>
              
              <div className="pt-4 border-t border-gray-600/30 text-center">
                <Link 
                  to="/andorre/payment" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                >
                  <span>S'abonner</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs">49€/mois</span>
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
