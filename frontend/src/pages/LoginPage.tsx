import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, MessageSquare, Euro, User, Briefcase, Cpu } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Déterminer le type d'utilisateur par défaut en fonction du chemin ou de la query string
const location = useLocation();
const searchParams = new URLSearchParams(location.search);
const initialUserTypeParam = (searchParams.get('type') as 'particulier' | 'professionnel' | 'andorre' | null);
const inferredFromPath: 'andorre' | null = location.pathname.startsWith('/andorre') ? 'andorre' : null;

const [userType, setUserType] = useState<'particulier' | 'professionnel'>(initialUserTypeParam as 'particulier' | 'professionnel' || 'particulier');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      // Redirection selon le type d'utilisateur sélectionné
      if (userType === 'professionnel') {
        navigate('/pro/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.data?.detail || err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "w-full bg-[#162238]/50 border border-[#2A3F6C] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c5a572]";

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
          <h1 className="text-3xl font-bold text-white">
            {userType === 'professionnel' ? 'Espace Professionnel' : 'Espace Particulier'}
          </h1>
          <p className="text-gray-400 mt-2">
            Connectez-vous pour accéder à votre tableau de bord.
          </p>
        </div>
        <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(197,165,114,0.4)] transform hover:-translate-y-1 hover:scale-105">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && <p className="text-red-400 text-center text-sm mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}
            
            {/* Sélection du type d'utilisateur */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-3">Type de compte :</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUserType('particulier')}
                  className={`flex items-center justify-center p-3 rounded-lg border transition-all duration-300 ${
                    userType === 'particulier'
                      ? 'bg-[#c5a572]/20 border-[#c5a572] text-[#c5a572] shadow-lg transform scale-105'
                      : 'bg-[#162238]/50 border-[#2A3F6C] text-gray-400 hover:border-[#c5a572]/50 hover:text-gray-300'
                  }`}
                >
                  <User className="w-4 h-4 mr-1" />
                  <span className="text-xs">Particulier</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('professionnel')}
                  className={`flex items-center justify-center p-3 rounded-lg border transition-all duration-300 ${
                    userType === 'professionnel'
                      ? 'bg-[#c5a572]/20 border-[#c5a572] text-[#c5a572] shadow-lg transform scale-105'
                      : 'bg-[#162238]/50 border-[#2A3F6C] text-gray-400 hover:border-[#c5a572]/50 hover:text-gray-300'
                  }`}
                >
                  <Briefcase className="w-4 h-4 mr-1" />
                  <span className="text-xs">Pro</span>
                </button>

              </div>
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${inputStyles} pl-12 focus:ring-4 focus:ring-[#c5a572]/30 transition-all`} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputStyles} pl-12 focus:ring-4 focus:ring-[#c5a572]/30 transition-all`} />
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full font-semibold py-3 rounded-xl shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                userType === 'andorre' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
                  : 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] hover:from-[#e8cfa0] hover:to-[#c5a572] hover:shadow-xl'
              }`}
            >
              {isLoading ? 'Connexion...' : 
                userType === 'andorre' ? '🚀 Accéder à Francis Andorre' :
                userType === 'professionnel' ? 'Se connecter (Pro)' : 'Se connecter'
              }
            </button>
          </form>


          
          <p className="text-center text-sm text-gray-400 mt-8">
            Pas encore de compte ?{' '}
            {userType === 'andorre' ? (
              <span className="font-semibold text-blue-400">Accès direct sans inscription requis</span>
            ) : (
              <Link 
                to={userType === 'professionnel' ? '/pro-signup' : '/signup'} 
                className="font-semibold text-[#c5a572] hover:underline transition-colors"
              >
                Inscrivez-vous{userType === 'professionnel' ? ' (Pro)' : ''}
              </Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 