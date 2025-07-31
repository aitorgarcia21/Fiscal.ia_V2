import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, MessageSquare, Euro } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export function ParticulierSignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsLoading(true);
    
    try {
      await signup(
        formData.email,
        formData.password,
        `${formData.firstName} ${formData.lastName}`,
        'particulier'
      );
      
      // Redirection vers le dashboard particulier
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <title>Francis Particulier - Créer un compte</title>
      <meta name="description" content="Créez votre compte Francis Particulier pour optimiser votre fiscalité personnelle." />
      
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
              <h2 className="text-xl font-semibold text-white mb-1">Créer un compte</h2>
              <p className="text-sm text-gray-400">Rejoignez Francis Particulier</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <p className="text-red-400 text-sm text-center font-medium">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-300 mb-2">
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 transition-all duration-300 text-base touch-manipulation"
                    placeholder="Jean"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-300 mb-2">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 transition-all duration-300 text-base touch-manipulation"
                    placeholder="Dupont"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 transition-all duration-300 text-base touch-manipulation"
                    placeholder="jean.dupont@email.com"
                    autoComplete="email"
                    inputMode="email"
                    required
                  />
                  <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 transition-all duration-300 text-base touch-manipulation"
                    placeholder="Min. 8 caractères"
                    autoComplete="new-password"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 transition-all duration-300 text-base touch-manipulation"
                    placeholder="Répétez le mot de passe"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-2 touch-manipulation"
                    aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-6 h-6" />
                    <span>Créer mon compte</span>
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <Link 
                to="/particulier/login" 
                className="text-[#c5a572] hover:text-[#e8cfa0] transition-colors font-medium touch-manipulation inline-block py-3"
              >
                Déjà un compte ? Se connecter
              </Link>
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
          className="w-full max-w-2xl"
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
            
            <h1 className="text-2xl font-bold text-white mb-2">Créer un compte</h1>
            <p className="text-gray-400">Rejoignez Francis Particulier</p>
          </div>

          {/* Formulaire Desktop */}
          <div className="bg-gradient-to-br from-[#223c63]/80 to-[#234876]/80 backdrop-blur-xl p-8 rounded-2xl border border-[#c5a572]/20 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-600/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="firstName-desktop"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-[#1a2942]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                      placeholder="Jean"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                    Nom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="lastName-desktop"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-[#1a2942]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email-desktop"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-[#1a2942]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                    placeholder="jean.dupont@email.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="password-desktop"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 bg-[#1a2942]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                      placeholder="Min. 8 caractères"
                      autoComplete="new-password"
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
                <div>
                  <label htmlFor="confirmPassword-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmer
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="confirmPassword-desktop"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 bg-[#1a2942]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                      placeholder="Répétez"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
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
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    <span>Créer mon compte</span>
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <Link 
                to="/particulier/login" 
                className="text-[#c5a572] hover:text-[#e8cfa0] transition-colors text-sm"
              >
                Déjà un compte ? Se connecter
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
