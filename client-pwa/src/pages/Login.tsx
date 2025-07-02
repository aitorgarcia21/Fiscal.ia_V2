import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/chat');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-dark text-white">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Connexion</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input type="email" placeholder="Email" className="w-full p-3 rounded-lg bg-[#162238]" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" placeholder="Mot de passe" className="w-full p-3 rounded-lg bg-[#162238]" value={password} onChange={e=>setPassword(e.target.value)} />
        <button onClick={handleLogin} className="w-full bg-primary px-4 py-3 rounded-lg font-semibold text-dark">Se connecter</button>
      </div>
    </div>
  );
} 