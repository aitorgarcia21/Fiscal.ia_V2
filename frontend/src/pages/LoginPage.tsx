import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, MessageSquare, Euro } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [jurisdiction, setJurisdiction] = useState<'FR' | 'AD'>(localStorage.getItem('jurisdiction') as 'FR' | 'AD' || 'FR');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      localStorage.setItem('jurisdiction', jurisdiction);
      await login(email, password);
      navigate('/dashboard');
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
          <h1 className="text-3xl font-bold text-white">Espace Particulier</h1>
          <p className="text-gray-400 mt-2">Connectez-vous pour accéder à votre tableau de bord.</p>
        </div>
        <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(197,165,114,0.4)]">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && <p className="text-red-400 text-center text-sm mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${inputStyles} pl-12 focus:ring-4 focus:ring-[#c5a572]/30 transition-all`} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputStyles} pl-12 focus:ring-4 focus:ring-[#c5a572]/30 transition-all`} />
            </div>
            <div className="mb-4 text-gray-300 text-sm">
              <label htmlFor="jurisdiction-select" className="block mb-1">Juridiction fiscale :</label>
              <select
                id="jurisdiction-select"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value as 'FR' | 'AD')}
                aria-label="Sélection de la juridiction fiscale"
                className="w-full bg-[#162238]/50 border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:outline-none"
              >
                <option className="text-black" value="FR">France</option>
                <option className="text-black" value="AD">Andorre</option>
              </select>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-lg hover:from-[#e8cfa0] transition-all duration-300 disabled:opacity-50">
              {isLoading ? 'Connexion...' : 'Se connecter'}
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