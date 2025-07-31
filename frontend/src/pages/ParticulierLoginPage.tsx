import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, MessageSquare, Euro } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export function ParticulierLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard'); // Redirection vers le dashboard particulier
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <title>Francis Particulier - Connexion</title>
      <meta name="description" content="Connectez-vous à Francis Particulier pour optimiser votre fiscalité personnelle." />
      
      {/* Version Mobile */}
      <div className="block md:hidden min-h-screen bg-gradient-to-b from-[#1a2942] to-[#223c63] px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm mx-auto"
        >
          {/* Header Mobile */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c5a572] transition-colors mb-6 touch-manipulation">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-base">Retour</span>
            </Link>
            
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="relative inline-flex items-center justify-center">
                  <MessageSquare className="h-16 w-16 text-[#c5a572] transition-transform duration-300" />
                  <Euro className="h-10 w-10 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#1a2942] rounded-full p-1 transition-transform duration-300" />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent mb-2">
                Francis
              </h1>
              <p className="text-lg text-gray-300 font-medium">Particulier</p>
            </div>
          </div>

          {/* Formulaire Mobile */}
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">Connexion</h2>
              <p className="text-sm text-gray-400">Accédez à votre espace personnel</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <p className="text-red-400 text-sm text-center font-medium">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-3">
                  Adresse email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 transition-all duration-300 text-base touch-manipulation"
                    placeholder="votre@email.com"
                    autoComplete="email"
                    inputMode="email"
                    required
                  />
                  <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-3">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 transition-all duration-300 text-base touch-manipulation"
                    placeholder="Votre mot de passe"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-2 touch-manipulation"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] hover:from-[#b8956a] hover:to-[#dcc394] disabled:opacity-50 text-[#1a2942] font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg touch-manipulation min-h-[56px] shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-[#1a2942]/30 border-t-[#1a2942] rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-6 h-6" />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link 
                  to="/particulier/signup" 
                  className="text-[#c5a572] hover:text-[#e8cfa0] transition-colors font-medium touch-manipulation inline-block py-3"
                >
                  Créer un nouveau compte
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Version Desktop */}
      <div className="hidden md:block min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header Desktop */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c5a572] transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Link>
            
            <div className="flex justify-center items-center gap-3 mb-6">
              <div className="relative inline-flex items-center justify-center">
                <MessageSquare className="h-12 w-12 text-[#c5a572] transition-transform duration-300" />
                <Euro className="h-8 w-8 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#1a2942] rounded-full p-0.5 transition-transform duration-300" />
              </div>
              <span className="text-2xl bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent font-bold">
                Francis Particulier
              </span>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Connexion</h1>
          </div>

          {/* Formulaire Desktop */}
          <div className="bg-gradient-to-br from-[#223c63]/80 to-[#234876]/80 backdrop-blur-xl p-8 rounded-2xl border border-[#c5a572]/20 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-600/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email-desktop"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#1a2942]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                    placeholder="votre@email.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password-desktop"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-[#1a2942]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] hover:from-[#b8956a] hover:to-[#dcc394] disabled:opacity-50 text-[#223c63] font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#223c63]/30 border-t-[#223c63] rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <Link 
                to="/particulier/signup" 
                className="text-[#c5a572] hover:text-[#e8cfa0] transition-colors text-sm"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
