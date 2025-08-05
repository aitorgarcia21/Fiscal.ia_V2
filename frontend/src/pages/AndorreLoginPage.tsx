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
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    phone: ''
  });
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (!signupData.firstName || !signupData.lastName) {
      setError('Le prénom et nom sont obligatoires');
      return;
    }

    setIsLoading(true);
    
    try {
      // Stocker les données d'inscription pour après le paiement
      localStorage.setItem('andorre_signup_data', JSON.stringify({
        email,
        password,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        company: signupData.company,
        phone: signupData.phone,
        timestamp: Date.now()
      }));
      
      // Stocker l'intention d'achat Francis Andorre
      localStorage.setItem('francis_andorre_payment_intent', 'true');
      localStorage.setItem('francis_andorre_payment_timestamp', Date.now().toString());
      
      // Redirection directe vers Stripe (inscription + paiement en une étape)
      window.location.href = 'https://buy.stripe.com/14AcN5eqw2JM6pB09UgMw0a';
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la redirection vers le paiement');
      setIsLoading(false);
    }
  };

  return (
    <>
      <title>Francis Andorre - Connexion</title>
      <meta name="description" content="Connectez-vous à Francis Andorre, l'IA experte en fiscalité andorrane." />
      
      {/* Version Mobile */}
      <div className="block md:hidden min-h-screen bg-gradient-to-b from-[#0A0F1C] to-[#162238] px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm mx-auto"
        >
          {/* Header Mobile */}
          <div className="text-center mb-8">
            <Link to="/andorre" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c5a572] transition-colors mb-6 touch-manipulation">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-base">Retour</span>
            </Link>
            
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <Logo size="lg" className="w-16 h-16" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent mb-2">
                Francis
              </h1>
              <p className="text-lg text-gray-300 font-medium">Andorre</p>
            </div>
          </div>

          {/* Formulaire Mobile */}
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">
                {isSignupMode ? 'Inscription + Abonnement' : 'Connexion'}
              </h2>
              <p className="text-sm text-gray-400">
                {isSignupMode ? 'Créez votre compte et abonnez-vous (49€/mois)' : 'Accédez à votre expertise fiscale'}
              </p>
              {isSignupMode && (
                <button
                  onClick={() => setIsSignupMode(false)}
                  className="mt-2 text-[#c5a572] hover:text-[#e8cfa0] text-sm transition-colors"
                >
                  ← Retour à la connexion
                </button>
              )}
            </div>
            
            <form onSubmit={isSignupMode ? handleSignup : handleLogin} className="space-y-5">
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
                    placeholder="francis@andorre.com"
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
                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] hover:from-[#b8956a] hover:to-[#dcc394] disabled:opacity-50 text-[#0A0F1C] font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg touch-manipulation min-h-[56px] shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-[#0A0F1C]/30 border-t-[#0A0F1C] rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </>
                ) : (
                  <span>Se connecter</span>
                )}
              </button>
            </form>
            
            <div className="mt-6">
              <div className="text-center">
                <button
                  onClick={() => setIsSignupMode(true)}
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 touch-manipulation min-h-[56px] w-full shadow-lg"
                >
                  <span className="text-lg">S'abonner maintenant</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">49€/mois</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Version Desktop */}
      <div className="hidden md:flex min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#162238] to-[#1E3253] items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Header Desktop */}
          <div className="text-center mb-8">
            <Link to="/andorre" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c5a572] transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Link>
            
            <div className="flex justify-center items-center gap-3 mb-6">
              <Logo size="lg" />
              <span className="text-2xl bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent font-bold">
                Francis Andorre
              </span>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {isSignupMode ? 'Inscription + Abonnement' : 'Connexion'}
            </h1>
            <p className="text-sm text-gray-400">
              {isSignupMode ? 'Créez votre compte et abonnez-vous (49€/mois)' : 'Accédez à votre expertise fiscale'}
            </p>
            {isSignupMode && (
              <button
                onClick={() => setIsSignupMode(false)}
                className="mt-2 text-[#c5a572] hover:text-[#e8cfa0] text-sm transition-colors"
              >
                ← Retour à la connexion
              </button>
            )}
          </div>

          {/* Formulaire Desktop */}
          <div className="bg-gradient-to-br from-[#162238]/80 to-[#1E3253]/80 backdrop-blur-xl p-8 rounded-2xl border border-[#c5a572]/20 shadow-2xl">
            <form onSubmit={isSignupMode ? handleSignup : handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-600/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {isSignupMode && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first-name-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                      Prénom *
                    </label>
                    <input
                      id="first-name-desktop"
                      type="text"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({...signupData, firstName: e.target.value})}
                      className="w-full px-4 py-3 bg-[#0A0F1C]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                      placeholder="Votre prénom"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                      Nom *
                    </label>
                    <input
                      id="last-name-desktop"
                      type="text"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({...signupData, lastName: e.target.value})}
                      className="w-full px-4 py-3 bg-[#0A0F1C]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email-desktop"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0F1C]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                    placeholder="votre@email.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {isSignupMode && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                      Entreprise
                    </label>
                    <input
                      id="company-desktop"
                      type="text"
                      value={signupData.company}
                      onChange={(e) => setSignupData({...signupData, company: e.target.value})}
                      className="w-full px-4 py-3 bg-[#0A0F1C]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                      placeholder="Votre entreprise"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                      Téléphone
                    </label>
                    <input
                      id="phone-desktop"
                      type="tel"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-[#0A0F1C]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                      placeholder="Votre téléphone"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe{isSignupMode ? ' *' : ''}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password-desktop"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-[#0A0F1C]/60 border border-[#2A3F6C]/50 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/20 transition-all duration-300"
                    placeholder={isSignupMode ? "Minimum 8 caractères" : "••••••••"}
                    autoComplete={isSignupMode ? 'new-password' : 'current-password'}
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
                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] hover:from-[#b8956a] hover:to-[#dcc394] disabled:opacity-50 text-[#162238] font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#162238]/30 border-t-[#162238] rounded-full animate-spin"></div>
                    <span>{isSignupMode ? 'Redirection...' : 'Connexion...'}</span>
                  </>
                ) : (
                  <span>{isSignupMode ? 'S\'abonner et créer le compte' : 'Se connecter'}</span>
                )}
              </button>
            </form>
            
            {!isSignupMode && (
              <div className="mt-6">
                <div className="text-center">
                  <button
                    onClick={() => setIsSignupMode(true)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                  >
                    <span>S'abonner</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold">49€/mois</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};
export default AndorreLoginPage;
