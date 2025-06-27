import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Assurez-vous que ce chemin est correct

const UpdatePasswordPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const hash = location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get('access_token');
        
        if (token) {
            setAccessToken(token);
        } else {
            setError("Token de récupération manquant ou invalide. Veuillez réessayer depuis l'e-mail.");
        }
    }, [location]);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) {
            setError("Session invalide. Impossible de mettre à jour le mot de passe.");
            return;
        }
        
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({ password });
        
        setLoading(false);
        if (error) {
            setError(error.message);
        } else {
            setMessage("Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.");
            setTimeout(() => navigate('/pro/login'), 5000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <div className="max-w-md w-full p-8 space-y-6 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold text-center">Choisissez votre nouveau mot de passe</h2>

                {error && <p className="text-red-500 text-center">{error}</p>}
                {message && <p className="text-green-500 text-center">{message}</p>}

                {!message && (
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                        <div>
                            <label htmlFor="new-password" className="sr-only">Nouveau mot de passe</label>
                            <input
                                id="new-password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Nouveau mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !accessToken}
                            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UpdatePasswordPage; 