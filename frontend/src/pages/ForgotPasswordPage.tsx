import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Euro, Mail, Send } from 'lucide-react';
import apiClient from '../services/apiClient';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handlePasswordResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            await apiClient('/api/auth/reset-password', {
                method: 'POST',
                data: { email },
            });
            setMessage("Si un compte est associé à cette adresse e-mail, un lien de récupération a été envoyé. Veuillez vérifier votre boîte de réception (et vos spams).");
        } catch (err: any) {
            // Pour des raisons de sécurité, on affiche le même message en cas d'erreur
            // pour ne pas révéler si un email existe ou non dans la base de données.
            setMessage("Si un compte est associé à cette adresse e-mail, un lien de récupération a été envoyé. Veuillez vérifier votre boîte de réception (et vos spams).");
            console.error("Erreur lors de la demande de réinitialisation:", err);
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
                  <h1 className="text-3xl font-bold text-white">Mot de passe oublié</h1>
                  <p className="text-gray-400 mt-2">Entrez votre email pour recevoir un lien de récupération.</p>
                </div>
                
                <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl">
                    {message ? (
                        <p className="text-green-400 text-center text-sm bg-green-900/20 p-4 rounded-lg">{message}</p>
                    ) : (
                        <form onSubmit={handlePasswordResetRequest} className="space-y-6">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className={`${inputStyles} pl-12`}
                                    placeholder="Votre adresse e-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-lg hover:from-[#e8cfa0] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Envoi en cours...' : 'Envoyer le lien de récupération'}
                                {!loading && <Send size={18} />}
                            </button>
                        </form>
                    )}
                    
                    <div className="text-center mt-6">
                        <Link to="/pro/login" className="text-sm text-gray-400 hover:text-[#c5a572] transition-colors">
                            Retour à la page de connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage; 