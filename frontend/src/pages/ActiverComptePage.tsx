import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Euro } from 'lucide-react';

const ActiverComptePage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/invite-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Une erreur est survenue.');
            }

            setMessage(`Un e-mail d'activation a été envoyé à ${email}. Veuillez suivre les instructions pour créer votre mot de passe.`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = "w-full bg-[#162238]/50 border border-[#2A3F6C] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c5a572]";

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                 <div className="text-center mb-8">
                    <Link to="/pro" className="inline-block">
                        <div className="relative inline-flex items-center justify-center group mb-4">
                            <MessageSquare className="h-14 w-14 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
                            <Euro className="h-8 w-8 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#1E3253] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
                        </div>
                    </Link>
                  <h1 className="text-3xl font-bold text-white">Activer Votre Compte</h1>
                   <p className="text-gray-400 mt-2">Un compte a été créé pour vous ? Entrez votre e-mail pour recevoir le lien d'activation.</p>
                </div>
                
                <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl">
                    {message ? (
                        <p className="text-green-400 text-center text-sm bg-green-900/20 p-3 rounded-lg">{message}</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && <p className="text-red-400 text-center text-sm bg-red-900/20 p-3 rounded-lg">{error}</p>}
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input 
                                    type="email" 
                                    placeholder="Votre e-mail" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    className={`${inputStyles} pl-12`}
                                />
                            </div>
                            <button 
                              type="submit" 
                              disabled={loading} 
                              className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-lg hover:from-[#e8cfa0] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading ? 'Envoi en cours...' : 'Recevoir le lien d'activation'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiverComptePage; 