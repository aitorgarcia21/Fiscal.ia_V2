import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Shield, Crown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../components/ui/Logo';
import { supabase } from '../lib/supabase';

/**
 * Page de connexion Francis Andorre - Design ultra-premium révolutionnaire
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
        // Stocker les informations utilisateur
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.session?.access_token || '');
        
        // Redirection vers Francis Andorre
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
      <title>Francis Andorre - Connexion | IA Fiscalité Andorrane Expert</title>
      <meta name="description" content="Connectez-vous à Francis Andorre, l'IA experte en fiscalité andorrane. Accès sécurisé à votre assistant fiscal spécialisé." />
      <meta name="keywords" content="connexion francis andorre, login fiscalité andorre, accès IA fiscale andorre" />
      
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#162238] to-[#1E3253] overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 opacity-30">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5a572' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-[#c5a572]/5 via-transparent to-[#e8cfa0]/5 pointer-events-none"></div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Section gauche - Présentation */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden lg:block space-y-8"
            >
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-4 mb-6 justify-center lg:justify-start">
                  <Logo size="xl" showText />
                  <div className="flex items-center gap-2">
                    <span className="text-3xl bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent font-bold">Francis</span>
                    <Crown className="w-8 h-8 text-[#c5a572]" />
                  </div>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                  L'Excellence
                  <br />
                  <span className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent">
                    Fiscale Andorrane
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Rejoignez l'élite des conseillers patrimoniaux qui révolutionnent leur pratique avec Francis Andorre.
                </p>
              </div>

              {/* Features premium */}
              <div className="space-y-4">
                {[
                  {
                    icon: <Zap className="w-6 h-6" />,
                    title: "Expertise IA Avancée",
                    description: "Calculs IRPF instantanés et optimisation fiscale automatisée"
                  },
                  {
                    icon: <Shield className="w-6 h-6" />,
                    title: "Conformité Garantie",
                    description: "Jurisprudence actualisée et veille réglementaire permanente"
                  },
                  {
                    icon: <Crown className="w-6 h-6" />,
                    title: "Service Premium",
                    description: "Support prioritaire et mises à jour exclusives"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#162238]/60 to-[#1E3253]/60 backdrop-blur-sm rounded-xl border border-[#c5a572]/20"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-lg flex items-center justify-center text-[#162238]">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Section droite - Formulaire de connexion */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-md mx-auto lg:mx-0"
            >
              {/* Header mobile */}
              <div className="lg:hidden text-center mb-8">
                <Link to="/andorre" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c5a572] transition-colors mb-6">
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la page Andorre
                </Link>
                
                <div className="flex justify-center items-center gap-4 mb-6">
                  <Logo size="lg" showText />
                  <span className="text-2xl bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent font-bold">Francis</span>
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-2">
                  Connexion Francis Andorre
                </h1>
                <p className="text-gray-400">
                  Accédez à votre assistant IA en fiscalité andorrane
                </p>
              </div>

              {/* Retour desktop */}
              <div className="hidden lg:block mb-6">
                <Link to="/andorre" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c5a572] transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la page Andorre
                </Link>
              </div>

              {/* Formulaire premium */}
              <div className="bg-gradient-to-br from-[#162238]/80 via-[#1E3253]/80 to-[#2A3F6C]/80 backdrop-blur-xl p-8 rounded-3xl border border-[#c5a572]/20 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-[#162238]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Connexion Sécurisée</h2>
                  <p className="text-gray-400 text-sm">Accès à votre espace Francis Andorre</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-600/10 border border-red-500/20 rounded-xl p-4"
                    >
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    </motion.div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-3">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[#0A0F1C]/60 border border-[#2A3F6C]/50 rounded-xl text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 transition-all duration-300 text-lg"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-3">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-[#0A0F1C]/60 border border-[#2A3F6C]/50 rounded-xl text-white placeholder-gray-400 focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 transition-all duration-300 text-lg"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] hover:from-[#b8956a] hover:to-[#dcc394] disabled:from-gray-600 disabled:to-gray-700 text-[#162238] font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-2xl disabled:transform-none flex items-center justify-center gap-3 text-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-[#162238]/30 border-t-[#162238] rounded-full animate-spin"></div>
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        <Crown className="w-6 h-6" />
                        Accéder à Francis Andorre
                      </>
                    )}
                  </motion.button>
                </form>
                
                <div className="mt-8 space-y-6">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">
                      Pas encore de compte ?{' '}
                      <Link to="/pro/signup" className="text-[#c5a572] hover:text-[#e8cfa0] transition-colors font-semibold">
                        Créer un compte professionnel
                      </Link>
                    </p>
                  </div>
                  
                  {/* Section abonnement premium */}
                  <div className="pt-6 border-t border-gray-600/30">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a572]/20 to-[#e8cfa0]/20 px-4 py-2 rounded-full border border-[#c5a572]/30">
                        <Crown className="w-4 h-4 text-[#c5a572]" />
                        <span className="text-[#c5a572] font-semibold text-sm">Accès Premium</span>
                      </div>
                    </div>
                    
                    <Link 
                      to="/andorre/payment" 
                      className="group block w-full bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl text-center"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                        <span>S'abonner à Francis Andorre</span>
                        <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                          49€/mois
                        </div>
                      </div>
                    </Link>
                    
                    <p className="text-gray-500 text-xs mt-3 text-center">
                      ✨ Expertise IA complète • 🛡️ Conformité garantie • 👑 Support premium
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};
export default AndorreLoginPage;
