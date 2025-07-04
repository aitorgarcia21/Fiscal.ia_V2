import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageSquare, Euro, KeyRound, Eye, EyeOff } from 'lucide-react';

const UpdatePasswordPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [debugInfo, setDebugInfo] = useState<string>('');

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handlePasswordRecovery = async () => {
            // Vérifier les paramètres d'URL (pour les liens de récupération)
            const urlParams = new URLSearchParams(location.search);
            const accessToken = urlParams.get('access_token');
            const refreshToken = urlParams.get('refresh_token');
            
            // Vérifier aussi le hash (ancienne méthode)
            const hashParams = new URLSearchParams(location.hash.substring(1));
            const hashAccessToken = hashParams.get('access_token');
            const hashRefreshToken = hashParams.get('refresh_token');

            // Utiliser le token qui est disponible
            const finalAccessToken = accessToken || hashAccessToken;
            const finalRefreshToken = refreshToken || hashRefreshToken;

            if (finalAccessToken && finalRefreshToken) {
                try {
                    // Définir la session avec les tokens
                    const { error } = await supabase.auth.setSession({
                        access_token: finalAccessToken,
                        refresh_token: finalRefreshToken
                    });

                    if (error) {
                        console.error('Erreur lors de la définition de la session:', error);
                        setError("Erreur lors de la validation du lien. Veuillez demander un nouveau lien.");
                    } else {
                        setIsTokenValid(true);
                        setDebugInfo(`Session établie avec succès. Token: ${finalAccessToken.substring(0, 20)}...`);
                    }
                } catch (err) {
                    console.error('Erreur lors de la définition de la session:', err);
                    setError("Erreur lors de la validation du lien. Veuillez demander un nouveau lien.");
                }
            } else {
                setError("Lien invalide ou expiré. Il manque les tokens d'accès. Veuillez demander un nouveau lien.");
            }
        };

        handlePasswordRecovery();
    }, [location]);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }
        
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({ password });
            
            if (error) {
                setError(`Erreur: ${error.message}`);
            } else {
                setMessage("Votre mot de passe a été mis à jour avec succès ! Vous allez être redirigé vers la page de connexion.");
                setTimeout(() => navigate('/login'), 4000);
            }
        } catch (err: any) {
            setError('Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.');
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
                  <h1 className="text-3xl font-bold text-white">Créer un nouveau mot de passe</h1>
                </div>
                
                <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl">
                    {message && <p className="text-green-400 text-center text-sm bg-green-900/20 p-3 rounded-lg">{message}</p>}
                    {error && <p className="text-red-400 text-center text-sm bg-red-900/20 p-3 rounded-lg">{error}</p>}
                    
                    {/* Debug info - à supprimer en production */}
                    {debugInfo && (
                        <details className="mb-4">
                            <summary className="text-yellow-400 cursor-pointer text-xs">Debug Info (cliquez pour voir)</summary>
                            <pre className="text-xs text-gray-400 bg-gray-900/50 p-2 rounded mt-2 overflow-auto max-h-40">
                                {debugInfo}
                            </pre>
                        </details>
                    )}

                    {!message && isTokenValid && (
                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    id="new-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className={`${inputStyles} pl-12 pr-12`}
                                    placeholder="Nouveau mot de passe"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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

                    {!isTokenValid && !error && (
                        <div className="text-center">
                            <p className="text-gray-400">Validation du lien en cours...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdatePasswordPage; 