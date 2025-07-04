import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Euro, Mail, Lock, Eye, EyeOff, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ManualPasswordReset: React.FC = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState<'email' | 'password'>('email');

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Envoyer un email de reset avec un lien spécial
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/manual-password-reset?email=${encodeURIComponent(email)}`
            });

            if (error) {
                setError("Erreur lors de l'envoi. Vérifiez votre email et réessayez.");
            } else {
                setSuccess(true);
                setStep('password');
            }
        } catch (err: any) {
            setError("Erreur lors de l'envoi. Vérifiez votre email et réessayez.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // VRAIE TECHNIQUE : Envoyer un email de reset
            const response = await fetch('/api/auth/reset-password-manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    newPassword 
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de l\'envoi');
            }

            // Gérer les différents types de réponses
            if (result.type === 'email_sent') {
                setSuccess(true);
                setError(null);
                // Afficher un message spécial pour les emails envoyés
                setTimeout(() => {
                    window.location.href = '/login';
                }, 8000); // Plus de temps pour lire le message
            } else if (result.type === 'reset_initiated') {
                setSuccess(true);
                setError(null);
                // Afficher un message avec note
                setTimeout(() => {
                    window.location.href = '/login';
                }, 8000);
            } else {
                // Fallback
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = '/login';
                }, 5000);
            }

        } catch (err: any) {
            setError(`Erreur lors de l'envoi : ${err.message}`);
        } finally {
            setLoading(false);
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
                        {step === 'email' ? 'Réinitialisation du mot de passe' : 'Définir un nouveau mot de passe'}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {step === 'email' 
                            ? 'Entrez votre email pour recevoir un lien de récupération'
                            : 'Définissez votre nouveau mot de passe'
                        }
                    </p>
                </div>

                <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl">
                    {success && step === 'email' && (
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
                            <button
                                onClick={() => setStep('password')}
                                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-lg hover:from-[#e8cfa0] transition-all duration-300"
                            >
                                Continuer vers le changement de mot de passe
                            </button>
                        </div>
                    )}

                    {step === 'email' && !success && (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    placeholder="Votre adresse e-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={`${inputStyles} pl-12`}
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-lg hover:from-[#e8cfa0] transition-all duration-300 disabled:opacity-50"
                            >
                                {loading ? 'Envoi en cours...' : 'Envoyer le lien de récupération'}
                            </button>
                        </form>
                    )}

                    {step === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nouveau mot de passe"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className={`${inputStyles} pl-12 pr-12`}
                                    disabled={loading}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirmer le nouveau mot de passe"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className={`${inputStyles} pl-12 pr-12`}
                                    disabled={loading}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-lg hover:from-[#e8cfa0] transition-all duration-300 disabled:opacity-50"
                            >
                                {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                            </button>
                        </form>
                    )}

                    {success && step === 'password' && (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle className="h-12 w-12 text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">Email de récupération envoyé !</h3>
                            <p className="text-green-400 text-sm bg-green-900/20 p-4 rounded-lg">
                                <strong>Vérifiez votre boîte de réception !</strong>
                                <br />
                                Un email de récupération a été envoyé à <strong>{email}</strong>.
                                <br />
                                Cliquez sur le lien dans l'email pour définir votre nouveau mot de passe.
                                <br />
                                <span className="text-yellow-400">💡 Vérifiez aussi vos spams si vous ne voyez pas l'email.</span>
                            </p>
                            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                                <p className="text-blue-400 text-xs">
                                    <strong>Comment ça marche :</strong>
                                    <br />
                                    1. Cliquez sur le lien dans l'email
                                    <br />
                                    2. Vous serez redirigé vers la page de changement de mot de passe
                                    <br />
                                    3. Entrez votre nouveau mot de passe
                                    <br />
                                    4. Vous pourrez vous connecter avec votre nouveau mot de passe
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="text-center mt-6 space-y-2">
                        <Link to="/login" className="text-sm text-gray-400 hover:text-[#c5a572] transition-colors block">
                            Retour à la page de connexion
                        </Link>
                        <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-[#c5a572] transition-colors block">
                            Essayer la méthode standard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManualPasswordReset; 