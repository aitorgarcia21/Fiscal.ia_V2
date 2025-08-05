import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { FrancisAndorreService } from '../services/francisAndorreService';

/**
 * Page de succès après paiement Francis Andorre
 * Crée automatiquement le compte spécialisé Andorre
 */
export const FrancisAndorreSuccess: React.FC = () => {
  const [isCreatingAccount, setIsCreatingAccount] = useState(true);
  const [accountCreated, setAccountCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    createAndorreAccount();
  }, []);

  const createAndorreAccount = async () => {
    try {
      // Récupérer les données d'inscription stockées
      const signupDataStr = localStorage.getItem('andorre_signup_data');
      
      if (!signupDataStr) {
        throw new Error('Aucune donnée d\'inscription trouvée');
      }

      const signupData = JSON.parse(signupDataStr);
      setUserEmail(signupData.email);

      // Créer le compte via Supabase
      const { success, error: createError, user } = await FrancisAndorreService.createAccountAfterPayment();

      if (!success || createError) {
        throw new Error(createError || 'Erreur lors de la création du compte');
      }

      console.log('✅ Compte Francis Andorre créé:', user);
      setAccountCreated(true);

      // Redirection automatique vers Francis Andorre après 3 secondes
      setTimeout(() => {
        navigate('/analyse-ia-fiscale-andorrane');
      }, 3000);

    } catch (error: any) {
      console.error('❌ Erreur création compte Andorre:', error);
      setError(error.message || 'Erreur lors de la création du compte');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsCreatingAccount(true);
    setAccountCreated(false);
    createAndorreAccount();
  };

  const handleManualAccess = () => {
    navigate('/analyse-ia-fiscale-andorrane');
  };

  return (
    <>
      <title>Francis Andorre - Paiement Confirmé | Accès Activé</title>
      <meta name="description" content="Votre abonnement Francis Andorre est confirmé. Accès immédiat à l'IA experte en fiscalité andorrane." />
      
      <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-6">
              <Logo size="xl" showText />
              <span className="text-3xl bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg font-bold">Andorre</span>
            </div>
          </div>

          {/* Carte principale */}
          <div className="bg-[#1E3253]/80 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl text-center">
            
            {/* État de création du compte */}
            {isCreatingAccount && (
              <>
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                  Activation en cours...
                </h1>
                <p className="text-gray-300 mb-6">
                  Nous créons votre compte spécialisé Francis Andorre.
                  <br />Cela ne prendra que quelques instants.
                </p>
                {userEmail && (
                  <div className="bg-blue-600/10 rounded-lg p-4 border border-blue-500/20">
                    <p className="text-blue-400 text-sm">Compte associé :</p>
                    <p className="text-white font-medium">{userEmail}</p>
                  </div>
                )}
              </>
            )}

            {/* Succès */}
            {accountCreated && !error && (
              <>
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                  🎉 Bienvenue dans Francis Andorre !
                </h1>
                <p className="text-gray-300 mb-6">
                  Votre compte spécialisé en fiscalité andorrane a été créé avec succès.
                  <br />Vous allez être redirigé automatiquement...
                </p>
                
                {userEmail && (
                  <div className="bg-green-600/10 rounded-lg p-4 border border-green-500/20 mb-6">
                    <p className="text-green-400 text-sm">✅ Compte activé pour :</p>
                    <p className="text-white font-medium">{userEmail}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    onClick={handleManualAccess}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Accéder à Francis Andorre</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  <p className="text-gray-400 text-sm">
                    Redirection automatique dans 3 secondes...
                  </p>
                </div>
              </>
            )}

            {/* Erreur */}
            {error && !isCreatingAccount && (
              <>
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                  Erreur d'activation
                </h1>
                <p className="text-gray-300 mb-4">
                  Une erreur s'est produite lors de la création de votre compte :
                </p>
                <div className="bg-red-600/10 rounded-lg p-4 border border-red-500/20 mb-6">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={handleRetry}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Réessayer
                  </button>
                  
                  <button
                    onClick={handleManualAccess}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                  >
                    Continuer manuellement
                  </button>
                  
                  <Link 
                    to="/contact" 
                    className="block text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    Contacter le support
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-8 text-center">
            <div className="bg-[#1E3253]/60 backdrop-blur-sm p-6 rounded-xl border border-[#2A3F6C]/50">
              <h3 className="text-lg font-semibold text-white mb-4">
                Votre abonnement Francis Andorre inclut :
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Expertise fiscalité andorrane</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Calculs IRPF automatisés</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Conseils optimisation fiscale</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Support prioritaire</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FrancisAndorreSuccess;
