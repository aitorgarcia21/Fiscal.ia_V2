import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

/**
 * Page de connexion dédiée exclusivement à Francis Andorre.
 * Optimisée SEO pour la fiscalité andorrane.
 */
export const AndorreLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      // Redirection directe vers Francis Andorre
      navigate('/analyse-ia-fiscale-andorrane', { replace: true });
    } catch (err: any) {
      setError(
        err.message === 'Invalid login credentials' 
          ? 'Email ou mot de passe incorrect.'
          : 'Une erreur s\'est produite lors de la connexion.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "w-full px-4 py-3 bg-[#0F1419]/80 border border-[#2A3F6C] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] transition-all duration-300";

  return (
    <>
      {/* SEO Meta Tags */}
      <title>Francis Andorre - Connexion | IA Fiscalité Andorrane Expert</title>
      <meta name="description" content="Accédez à Francis Andorre, l'intelligence artificielle experte en fiscalité andorrane. Calculs IRPF, optimisation fiscale, conseils personnalisés pour résidents andorrans." />
      <meta name="keywords" content="fiscalité andorre, IRPF andorre, impôts andorre, optimisation fiscale andorre, résidence fiscale andorre, IA fiscal, expert fiscal andorran" />
      <meta property="og:title" content="Francis Andorre - Expert IA en Fiscalité Andorrane" />
      <meta property="og:description" content="L'IA qui révolutionne la fiscalité andorrane pour les conseillers en patrimoine et gestionnaires" />
      <meta property="og:type" content="website" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://fiscal-ia-v2-production.up.railway.app/andorre/login" />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link to="/andorre" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c5a572] transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Retour à la page Andorre
            </Link>
            <div className="flex justify-center mb-6">
              <Logo size="xl" showText />
              <span className="ml-3 text-2xl bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg font-semibold">Andorre</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Accès Francis Andorre
            </h1>
            <p className="text-gray-400 mt-2">
              Connectez-vous pour accéder à l'expertise IA en fiscalité andorrane.
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className={`${inputStyles} pl-12 focus:ring-4 focus:ring-blue-500/30`} 
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="password" 
                  placeholder="Mot de passe" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className={`${inputStyles} pl-12 focus:ring-4 focus:ring-blue-500/30`} 
                />
              </div>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none"
              >
                {isLoading ? 'Connexion en cours...' : 'Accéder à Francis Andorre'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm mb-4">
                Pas encore de compte ?{' '}
                <Link to="/pro/signup" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  Créer un compte professionnel
                </Link>
              </p>
              
              {/* Lien vers l'abonnement Francis Andorre */}
              <div className="pt-4 border-t border-gray-600/30">
                <p className="text-gray-400 text-sm mb-3">
                  Accès premium à Francis Andorre
                </p>
                <Link 
                  to="/andorre/payment" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg text-sm"
                >
                  <span>S'abonner à Francis Andorre</span>
                  <span className="text-blue-200">49€/mois</span>
                </Link>
                <p className="text-gray-500 text-xs mt-2">
                  Expertise IA complète en fiscalité andorrane
                </p>
              </div>
            </div>
          </div>


        </div>
      </div>
    </>
  );
};

export default AndorreLoginPage;
