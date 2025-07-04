import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signup(email, password, fullName, 'particulier');
      navigate('/dashboard'); // Redirection vers le dashboard particulier
    } catch (err: any) {
      setError(err.data?.detail || err.message || 'Erreur lors de l\'inscription.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "w-full bg-[#162238]/50 border border-[#2A3F6C] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c5a572]";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-[#e8cfa0] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-white text-center mb-8">Créer un compte Particulier</h1>
        <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(197,165,114,0.4)]">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && <p className="text-red-400 text-center text-sm mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="text" placeholder="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={`${inputStyles} pl-12 focus:ring-4 focus:ring-[#c5a572]/30 transition-all`} />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${inputStyles} pl-12 focus:ring-4 focus:ring-[#c5a572]/30 transition-all`} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputStyles} pl-12 focus:ring-4 focus:ring-[#c5a572]/30 transition-all`} />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-lg hover:from-[#e8cfa0] transition-all duration-300 disabled:opacity-50">
              {isLoading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-8">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-semibold text-[#c5a572] hover:underline">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 