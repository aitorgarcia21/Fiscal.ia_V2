import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Euro, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

const InvitationPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [invitationLink, setInvitationLink] = useState<string | null>(null);

    const handleSendInvitation = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        setInvitationLink(null);

        try {
            const response = await fetch('/api/auth/send-invitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de l\'envoi');
            }

            if (result.type === 'invitation_sent') {
                setSuccess(true);
                setError(null);
            } else if (result.type === 'invitation_link') {
                setSuccess(true);
                setInvitationLink(result.invitation_link);
            }

        } catch (err: any) {
            setError(`Erreur lors de l'envoi : ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (invitationLink) {
            navigator.clipboard.writeText(invitationLink);
            alert('Lien copié dans le presse-papiers !');
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
                        Envoyer une invitation
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Invitez un utilisateur créé manuellement à définir son mot de passe
                    </p>
                </div>

                <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl">
                    {success && !invitationLink && (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle className="h-12 w-12 text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">Invitation envoyée !</h3>
                            <p className="text-green-400 text-sm bg-green-900/20 p-4 rounded-lg">
                                Un email d'invitation a été envoyé à <strong>{email}</strong>.
                                <br />
                                L'utilisateur peut maintenant créer son mot de passe.
                            </p>
                        </div>
                    )}

                    {success && invitationLink && (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle className="h-12 w-12 text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">Lien d'invitation généré !</h3>
                            <p className="text-green-400 text-sm bg-green-900/20 p-4 rounded-lg">
                                Copiez ce lien et envoyez-le manuellement à <strong>{email}</strong> :
                            </p>
                            <div className="bg-gray-800 p-3 rounded-lg">
                                <p className="text-xs text-gray-300 break-all">{invitationLink}</p>
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-lg hover:from-[#e8cfa0] transition-all duration-300"
                            >
                                Copier le lien
                            </button>
                        </div>
                    )}

                    {!success && (
                        <form onSubmit={handleSendInvitation} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    placeholder="Email de l'utilisateur"
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
                                {loading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
                            </button>
                        </form>
                    )}

                    <div className="text-center mt-6 space-y-2">
                        <Link to="/login" className="text-sm text-gray-400 hover:text-[#c5a572] transition-colors block">
                            Retour à la page de connexion
                        </Link>
                        <Link to="/manual-password-reset" className="text-sm text-gray-400 hover:text-[#c5a572] transition-colors block">
                            Reset manuel pour utilisateurs existants
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvitationPage; 