import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';

const ActivateAccountPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await apiClient('/api/auth/activate-paid-user', {
        method: 'POST',
        data: { email, password },
      });
      setMessage('Compte activé ! Vous pouvez désormais vous connecter.');
      setTimeout(() => navigate('/'), 2500);
    } catch (err: any) {
      setError(err.data?.detail || 'Erreur lors de l’activation.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles =
    'w-full bg-[#162238]/50 border border-[#2A3F6C] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c5a572]';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] p-4">
      <div className="w-full max-w-md bg-[#1E3253]/60 backdrop-blur-md p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl text-gray-100">
        <h1 className="text-2xl font-bold text-center mb-6">Activer mon compte</h1>
        {message ? (
          <p className="text-green-400 text-center mb-4">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-400 text-center mb-4">{error}</p>}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`${inputStyles} pl-12`}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${inputStyles} pl-12`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-lg hover:from-[#e8cfa0] transition-all disabled:opacity-50"
            >
              {loading ? 'Activation...' : 'Activer mon compte'}
            </button>
          </form>
        )}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-400 hover:text-[#c5a572] transition-colors">
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActivateAccountPage; 