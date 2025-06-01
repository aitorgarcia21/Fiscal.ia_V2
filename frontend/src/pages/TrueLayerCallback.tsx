import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export function TrueLayerCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [connectedBank, setConnectedBank] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const providerId = searchParams.get('provider_id');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('Connexion bancaire annulée ou échouée');
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('Code d\'autorisation manquant');
          return;
        }

        // Appeler l'API backend pour échanger le code
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://normal-trade-production.up.railway.app';
        const token = localStorage.getItem('auth_token');

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

        if (!response.ok) {
          throw new Error('Erreur lors de l\'échange du code');
        }

        const data = await response.json();
        
        if (data.accounts && data.accounts.length > 0) {
          setStatus('success');
          setConnectedBank(data.accounts[0]?.account_id || 'Compte bancaire');
          setMessage(`Connexion réussie ! ${data.accounts.length} compte(s) connecté(s)`);
          
          // Sauvegarder les données bancaires dans le localStorage temporairement
          localStorage.setItem('bank_data', JSON.stringify(data));
          
          // Rediriger vers le dashboard après 3 secondes
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Aucun compte bancaire trouvé');
        }

      } catch (error) {
        console.error('Erreur TrueLayer callback:', error);
        setStatus('error');
        setMessage('Erreur lors de la connexion bancaire');
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#101A2E] via-[#162238] to-[#1E3253] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#1E3253]/60 backdrop-blur-md rounded-xl border border-[#2A3F6C]/30 p-8 shadow-xl text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          )}
          
          {status === 'error' && (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          {status === 'loading' && 'Connexion en cours...'}
          {status === 'success' && 'Connexion réussie !'}
          {status === 'error' && 'Erreur de connexion'}
        </h1>

        <p className="text-gray-300 mb-6">
          {status === 'loading' && 'Nous configurons votre connexion bancaire sécurisée...'}
          {message}
        </p>

        {status === 'success' && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm">
              🏦 {connectedBank} connecté avec succès
            </p>
            <p className="text-gray-300 text-xs mt-2">
              Francis peut maintenant analyser vos finances !
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-sm text-gray-400 mb-6">
            Redirection automatique vers le dashboard...
          </div>
        )}

        {(status === 'error' || status === 'success') && (
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-lg hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au Dashboard</span>
          </button>
        )}
      </div>
    </div>
  );
} 