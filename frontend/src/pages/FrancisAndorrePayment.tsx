import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Euro, Shield, Zap, Globe } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

/**
 * Page de paiement dédiée à Francis Andorre
 * Redirige vers le lien Stripe et gère la création du compte spécialisé après paiement
 */
export const FrancisAndorrePayment: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  // Récupérer l'email de l'utilisateur connecté si disponible
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserEmail(userData.email || '');
      } catch (e) {
        console.log('Pas d\'utilisateur connecté');
      }
    }
  }, []);

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Stocker l'email pour la création du compte après paiement
      if (userEmail) {
        localStorage.setItem('francis_andorre_email', userEmail);
      }
      
      // Stocker l'intention d'achat Francis Andorre
      localStorage.setItem('francis_andorre_payment_intent', 'true');
      localStorage.setItem('francis_andorre_payment_timestamp', Date.now().toString());
      
      // Redirection vers le lien Stripe externe
      window.location.href = 'https://buy.stripe.com/14AcN5eqw2JM6pB09UgMw0a';
      
    } catch (error) {
      console.error('Erreur lors de la redirection vers le paiement:', error);
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Expertise Fiscalité Andorrane",
      description: "IA spécialisée dans les lois fiscales andorranes (IRPF, IGI, etc.)"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Réponses Instantanées",
      description: "Calculs et conseils fiscaux en temps réel pour vos clients andorrans"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Conformité Garantie",
      description: "Basé sur la législation andorrane officielle mise à jour"
    },
    {
      icon: <Euro className="w-6 h-6" />,
      title: "ROI Immédiat",
      description: "Économisez des heures de recherche fiscale pour chaque client"
    }
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <title>Francis Andorre - Abonnement | IA Fiscalité Andorrane Expert</title>
      <meta name="description" content="Abonnez-vous à Francis Andorre, l'IA experte en fiscalité andorrane. Calculs IRPF, optimisation fiscale, conseils personnalisés pour résidents andorrans." />
      <meta name="keywords" content="abonnement francis andorre, fiscalité andorre, IRPF andorre, impôts andorre, optimisation fiscale andorre" />
      
      <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/andorre" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c5a572] transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Retour à la page Andorre
            </Link>
            
            <div className="flex justify-center items-center gap-4 mb-6">
              <Logo size="xl" showText />
              <span className="text-3xl bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg font-bold">Andorre</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Abonnement Francis Andorre
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              L'intelligence artificielle experte en fiscalité andorrane pour les conseillers en gestion de patrimoine
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Fonctionnalités */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Pourquoi choisir Francis Andorre ?
              </h2>
              
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-[#1E3253]/60 backdrop-blur-sm rounded-xl border border-[#2A3F6C]/50">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Témoignage */}
              <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 p-6 rounded-xl border border-blue-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    JM
                  </div>
                  <div>
                    <p className="text-gray-300 italic mb-2">
                      "Francis Andorre m'a fait gagner 80% de temps sur mes dossiers andorrans. 
                      Les calculs IRPF sont instantanés et parfaitement justes."
                    </p>
                    <p className="text-blue-400 font-medium">Jean-Marc L., CGP spécialisé Andorre</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte de paiement */}
            <div className="lg:sticky lg:top-8">
              <div className="bg-[#1E3253]/80 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/50 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    49€<span className="text-xl text-gray-400">/mois</span>
                  </div>
                  <p className="text-gray-400">Accès complet à Francis Andorre</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Expertise fiscalité andorrane complète</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Calculs IRPF et IGI automatisés</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Conseils optimisation fiscale</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Mises à jour législatives automatiques</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Support prioritaire</span>
                  </div>
                </div>

                {userEmail && (
                  <div className="mb-6 p-4 bg-blue-600/10 rounded-lg border border-blue-500/20">
                    <p className="text-blue-400 text-sm mb-2">Compte associé :</p>
                    <p className="text-white font-medium">{userEmail}</p>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Redirection en cours...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      S'abonner à Francis Andorre
                    </>
                  )}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-xs">
                    Paiement sécurisé par Stripe • Annulation possible à tout moment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FrancisAndorrePayment;
