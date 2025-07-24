import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessageSquare, Euro, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import gocardlessService from '../services/gocardlessService';

export function GoCardlessCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Finalisation de la connexion bancaire...');
  const [accountsCount, setAccountsCount] = useState(0);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Récupérer les paramètres de callback
      const ref = searchParams.get('ref');
      const error = searchParams.get('error');
      
      if (error) {
        setStatus('error');
        setMessage('Connexion bancaire annulée ou échouée');
        return;
      }

      if (!ref) {
        setStatus('error');
        setMessage('Paramètres de callback manquants');
        return;
      }

      setMessage('Vérification du statut de connexion...');

      // Vérifier le statut de la requisition
      const isConnected = await gocardlessService.checkBankConnectionStatus(ref);
      
      if (isConnected) {
        setMessage('Récupération de vos comptes bancaires...');
        
        // Récupérer les comptes nouvellement connectés
        const accounts = await gocardlessService.getUserAccounts();
        setAccountsCount(accounts.length);
        
        setStatus('success');
        setMessage(`Connexion réussie ! ${accounts.length} compte(s) synchronisé(s).`);
        
        // Redirection automatique après 3 secondes
        setTimeout(() => {
          navigate('/dashboard/particulier');
        }, 3000);
      } else {
        setStatus('error');
        setMessage('La connexion bancaire n\'a pas pu être établie');
      }
    } catch (error) {
      console.error('Erreur callback GoCardless:', error);
      setStatus('error');
      setMessage('Une erreur est survenue lors de la connexion bancaire');
    }
  };

  const handleRetry = () => {
    navigate('/dashboard/particulier');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#162238] to-[#1a2332] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header avec logo Francis */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative inline-flex items-center justify-center">
              <MessageSquare className="h-12 w-12 text-[#c5a572]" />
              <Euro className="h-8 w-8 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Francis</h1>
          <p className="text-gray-400">Connexion bancaire</p>
        </div>

        {/* Carte de statut */}
        <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-8">
          <div className="text-center">
            {/* Icône de statut */}
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              {status === 'processing' && (
                <div className="w-16 h-16 bg-gradient-to-br from-[#c5a572]/20 to-[#e8cfa0]/20 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-[#c5a572] animate-spin" />
                </div>
              )}
              
              {status === 'success' && (
                <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              )}
              
              {status === 'error' && (
                <div className="w-16 h-16 bg-gradient-to-br from-red-400/20 to-red-600/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              )}
            </div>

            {/* Message de statut */}
            <h2 className="text-xl font-bold text-white mb-4">
              {status === 'processing' && 'Connexion en cours...'}
              {status === 'success' && 'Connexion réussie !'}
              {status === 'error' && 'Connexion échouée'}
            </h2>

            <p className="text-gray-400 mb-6">{message}</p>

            {/* Informations supplémentaires pour le succès */}
            {status === 'success' && accountsCount > 0 && (
              <div className="bg-[#0A192F]/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">
                    {accountsCount} compte{accountsCount > 1 ? 's' : ''} synchronisé{accountsCount > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Vos transactions seront disponibles dans quelques instants
                </p>
              </div>
            )}

            {/* Actions */}
            {status === 'success' && (
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard/particulier')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg font-medium hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all"
                >
                  Accéder à mon dashboard
                </button>
                <p className="text-sm text-gray-500">
                  Redirection automatique dans 3 secondes...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg font-medium hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all"
                >
                  Retourner au dashboard
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-3 border border-[#c5a572]/20 text-[#c5a572] rounded-lg hover:bg-[#c5a572]/10 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            )}

            {status === 'processing' && (
              <div className="flex items-center justify-center gap-2 text-[#c5a572]">
                <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
          </div>
        </div>

        {/* Note sécurité */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Connexion sécurisée via GoCardless Bank Account Data API
          </p>
        </div>
      </div>
    </div>
  );
}
