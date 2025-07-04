import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Euro, Mail, Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handlePasswordResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`
            });

            if (error) {
                setError("Erreur lors de l'envoi du lien. Veuillez réessayer.");
                console.error("Erreur Supabase:", error);
            } else {
                setSuccess(true);
            }
        } catch (err: any) {
            setError("Erreur lors de l'envoi du lien. Veuillez réessayer.");
            console.error("Erreur lors de la demande de réinitialisation:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = () => {
        setSuccess(false);
        setError(null);
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
                    <h1 className="text-3xl font-bold text-white">Mot de passe oublié</h1>
                    <p className="text-gray-400 mt-2">Entrez votre email pour recevoir un lien de récupération.</p>
                </div>
                
                <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle className="h-12 w-12 text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">Email envoyé !</h3>
                            <p className="text-green-400 text-sm bg-green-900/20 p-4 rounded-lg">
                                Un lien de récupération a été envoyé à <strong>{email}</strong>.
                                <br />
                                Vérifiez votre boîte de réception et vos spams.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={handleResendEmail}
                                    className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-lg hover:from-[#e8cfa0] transition-all duration-300"
                                >
                                    Envoyer un autre email
                                </button>
                                <Link 
                                    to="/login"
                                    className="block w-full text-center text-gray-400 hover:text-[#c5a572] transition-colors"
                                >
                                    Retour à la connexion
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}
                            
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
                                        disabled={loading}
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
                            
                            <div className="text-center mt-6 space-y-2">
                                <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-[#c5a572] transition-colors">
                                    <ArrowLeft size={16} />
                                    Retour à la page de connexion
                                </Link>
                                <Link to="/set-password" className="block text-sm text-gray-400 hover:text-[#c5a572] transition-colors">
                                    Définir un mot de passe (compte OAuth)
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage; 