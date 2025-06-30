import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, MessageSquare, Euro, Users, User } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<'particulier' | 'professionnel'>('particulier');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Suppression de la redirection automatique - maintenant basée sur le choix utilisateur

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      // Redirection basée sur le choix de l'utilisateur
      if (accountType === 'professionnel') {
        navigate('/pro/dashboard');
      } else {
        navigate('/dashboard');
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
          <h1 className="text-3xl font-bold text-white">Connexion</h1>
          <p className="text-gray-400 mt-2">Choisissez votre type de compte et connectez-vous.</p>
        </div>
        <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && <p className="text-red-400 text-center text-sm mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}
            
            {/* Sélecteur de type de compte */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Type de compte</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType('particulier')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${
                    accountType === 'particulier'
                      ? 'bg-[#c5a572] text-[#162238] border-[#c5a572] font-semibold'
                      : 'bg-[#162238]/50 text-gray-300 border-[#2A3F6C] hover:border-[#c5a572]/50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Particulier
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('professionnel')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${
                    accountType === 'professionnel'
                      ? 'bg-[#c5a572] text-[#162238] border-[#c5a572] font-semibold'
                      : 'bg-[#162238]/50 text-gray-300 border-[#2A3F6C] hover:border-[#c5a572]/50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Professionnel
                </button>
              </div>
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${inputStyles} pl-12`} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputStyles} pl-12`} />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-lg hover:from-[#e8cfa0] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? 'Connexion...' : `Se connecter en tant que ${accountType}`}
              {accountType === 'professionnel' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </button>
          </form>
          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-[#c5a572] transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="font-semibold text-[#c5a572] hover:underline">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 