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
            const hashParams = new URLSearchParams(location.hash.substring(1));
            const accessToken = hashParams.get('access_token');

            // Pour la récupération de mot de passe, Supabase place le token dans le hash.
            // Le client JS de Supabase est conçu pour le lire automatiquement.
            // On a juste besoin de vérifier que le token est là pour afficher le formulaire.
            if (accessToken) {
                // Le client Supabase va gérer l'access_token automatiquement pour la prochaine requête `updateUser`.
                setIsTokenValid(true);
            } else {
                setError("Lien invalide ou expiré. Il manque le token d'accès. Veuillez demander un nouveau lien.");
            }
        };

        handlePasswordRecovery();
    }, [location]);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Pas besoin de revérifier isTokenValid ici car le formulaire n'est affiché que si c'est bon.
        
        setLoading(true);
        setError(null);
        setMessage(null);

        // Le client Supabase a déjà l'access token de l'URL grâce au useEffect.
        // Il l'utilisera pour s'authentifier lors de l'appel updateUser.
        const { error } = await supabase.auth.updateUser({ password });
        
        setLoading(false);
        if (error) {
            setError(`Erreur: ${error.message}`);
        } else {
            setMessage("Votre mot de passe a été mis à jour avec succès ! Vous allez être redirigé vers la page de connexion.");
            setTimeout(() => navigate('/pro/login'), 4000);
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
                </div>
            </div>
        </div>
    );
};

export default UpdatePasswordPage; 