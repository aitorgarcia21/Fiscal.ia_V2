import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function TrueLayerCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const providerId = searchParams.get('provider_id');

      if (error) {
        setStatus('error');
        setMessage(`Erreur TrueLayer: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('Code d\'autorisation manquant');
        return;
      }

      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setStatus('error');
          setMessage('Token d\'authentification manquant');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/truelayer/exchange`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            code,
            provider_id: providerId
          })
        });

        if (response.ok) {
          const data = await response.json();
          setStatus('success');
          setMessage('Compte bancaire connecté avec succès !');
          
          // Rediriger vers le dashboard après 2 secondes
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          const errorData = await response.json();
          setStatus('error');
          setMessage(errorData.detail || 'Erreur lors de la connexion bancaire');
        }
      } catch (error) {
        console.error('Erreur TrueLayer callback:', error);
        setStatus('error');
        setMessage('Erreur de connexion au serveur');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] flex items-center justify-center p-4">
      <div className="bg-[#1a2942]/80 backdrop-blur-sm rounded-xl border border-[#c5a572]/20 p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-12 h-12 text-[#c5a572] mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-white mb-2">Connexion en cours...</h2>
            <p className="text-gray-400">Nous connectons votre compte bancaire</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Connexion réussie !</h2>
            <p className="text-gray-400 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirection vers le dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Erreur de connexion</h2>
            <p className="text-gray-400 mb-4">{message}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-[#c5a572] text-[#1a2942] rounded-lg hover:bg-[#e8cfa0] transition-colors"
            >
              Retour au dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
} 