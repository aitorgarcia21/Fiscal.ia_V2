import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Building2, Target, Zap, Home, Globe, Clock, AlertTriangle, Lightbulb, Brain } from 'lucide-react';

interface ProfileSummaryProps {
  detectedProfile: any;
  profileData: any;
}

export function ProfileSummary({ detectedProfile, profileData }: ProfileSummaryProps) {
  const getProfileIcon = (profile: string) => {
    const icons = {
      dirigeant_IS: Building2,
      salarie: Target,
      independant: Zap,
      investisseur_immobilier: Home,
      expatrie: Globe,
      retraite: Clock
    };
    return icons[profile as keyof typeof icons] || Target;
  };

  const getProfileLabel = (profile: string) => {
    const labels = {
      dirigeant_IS: 'Dirigeant IS',
      salarie: 'Salarié',
      independant: 'Indépendant',
      investisseur_immobilier: 'Investisseur Immobilier',
      expatrie: 'Expatrié',
      retraite: 'Retraité'
    };
    return labels[profile as keyof typeof labels] || profile;
  };

  const getProfileDescription = (profile: string) => {
    const descriptions = {
      dirigeant_IS: 'Dirigeant de société soumise à l\'impôt sur les sociétés (SASU, SARL, SAS)',
      salarie: 'Salarié en CDI/CDD ou fonctionnaire avec revenus d\'activité',
      independant: 'Travailleur indépendant, auto-entrepreneur ou profession libérale',
      investisseur_immobilier: 'Investisseur avec patrimoine immobilier locatif significatif',
      expatrie: 'Résident fiscal à l\'étranger avec revenus de source française',
      retraite: 'Retraité percevant une pension principale ou des revenus de retraite'
    };
    return descriptions[profile as keyof typeof descriptions] || '';
  };

  const getProfileCharacteristics = (profile: string) => {
    const characteristics = {
      dirigeant_IS: [
        'Optimisation rémunération/dividendes',
        'Charges sociales dirigeant', 
        'Impôt sur les sociétés',
        'Arbitrage fiscal complexe',
        'Transmission d\'entreprise'
      ],
      salarie: [
        'Tranche marginale d\'imposition',
        'Épargne salariale disponible',
        'PER et optimisation retraite',
        'Frais professionnels',
        'Revenus complémentaires'
      ],
      independant: [
        'Régime fiscal BIC/BNC',
        'Charges sociales TNS',
        'Déductions professionnelles',
        'Épargne retraite Madelin',
        'Optimisation statut juridique'
      ],
      investisseur_immobilier: [
        'Revenus fonciers et déficits',
        'Régimes micro/réel',
        'Exposition IFI potentielle',
        'SCI et optimisation',
        'Stratégie patrimoniale'
      ],
      expatrie: [
        'Conventions fiscales internationales',
        'Revenus de source française',
        'Exit tax et plus-values',
        'Retour fiscal en France',
        'Double imposition'
      ],
      retraite: [
        'Optimisation pensions',
        'Abattements seniors',
        'Transmission patrimoine',
        'Revenus complémentaires',
        'IFI si applicable'
      ]
    };
    return characteristics[profile as keyof typeof characteristics] || [];
  };

  const primaryProfile = detectedProfile.priorite_affichage[0];
  const IconComponent = getProfileIcon(primaryProfile);

  return (
    <div className="space-y-6">
      {/* Header avec profil détecté */}
      <div className="bg-gradient-to-br from-[#1E3253] to-[#2A3F6C] p-6 rounded-xl border border-[#c5a572]/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-lg">
              <IconComponent className="w-8 h-8 text-[#162238]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{getProfileLabel(primaryProfile)}</h3>
              <p className="text-[#c5a572]">Profil fiscal principal détecté</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#c5a572]">
              {detectedProfile.score_total[primaryProfile]}%
            </div>
            <p className="text-sm text-gray-300">compatibilité</p>
          </div>
        </div>

        {/* Description du profil */}
        <div className="bg-[#101A2E]/50 p-4 rounded-lg">
          <p className="text-gray-300 text-sm">{getProfileDescription(primaryProfile)}</p>
        </div>
      </div>

      {/* Confiance de détection */}
      <div className="bg-[#101A2E]/50 p-6 rounded-lg border border-[#2A3F6C]/30">
        <h4 className="font-semibold text-white mb-4 flex items-center">
          <Brain className="w-5 h-5 text-[#c5a572] mr-2" />
          Analyse de Profil
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Confiance de détection</span>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${detectedProfile.confiance_detection}%` }}
                ></div>
              </div>
              <span className="text-[#c5a572] font-bold">{detectedProfile.confiance_detection}%</span>
            </div>
          </div>
          
          {/* Variables déterminantes */}
          {detectedProfile.variables_determinantes.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-2">Variables clés identifiées :</h5>
              <div className="space-y-1">
                {detectedProfile.variables_determinantes.map((variable: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>{variable}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profils secondaires */}
      {detectedProfile.profils_mineurs.length > 0 && (
        <div className="bg-[#101A2E]/50 p-6 rounded-lg border border-[#2A3F6C]/30">
          <h4 className="font-semibold text-white mb-4">Profils secondaires détectés</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detectedProfile.profils_mineurs.map((profile: string) => {
              const SecondaryIcon = getProfileIcon(profile);
              const score = detectedProfile.score_total[profile];
              return (
                <div key={profile} className="flex items-center space-x-3 bg-[#162238]/60 p-3 rounded-lg">
                  <SecondaryIcon className="w-6 h-6 text-[#c5a572]" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-200">{getProfileLabel(profile)}</div>
                    <div className="text-sm text-gray-400">{score}% compatibilité</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Caractéristiques du profil principal */}
      <div className="bg-[#101A2E]/50 p-6 rounded-lg border border-[#2A3F6C]/30">
        <h4 className="font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-[#c5a572] mr-2" />
          Caractéristiques de votre profil
        </h4>
        <div className="space-y-3">
          {getProfileCharacteristics(primaryProfile).map((characteristic, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 bg-[#162238]/40 rounded-lg"
            >
              <div className="w-2 h-2 bg-[#c5a572] rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-200 text-sm">{characteristic}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Données collectées */}
      <div className="bg-[#101A2E]/50 p-6 rounded-lg border border-[#2A3F6C]/30">
        <h4 className="font-semibold text-white mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 text-[#c5a572] mr-2" />
          Données de profil analysées
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {Object.entries(profileData).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            
            return (
              <div key={key} className="flex justify-between items-center p-2 bg-[#162238]/40 rounded">
                <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-gray-200 font-medium">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prochaines étapes */}
      <div className="bg-gradient-to-r from-[#c5a572]/20 to-[#e8cfa0]/20 p-6 rounded-xl border border-[#c5a572]/30">
        <h4 className="text-xl font-semibold text-white mb-3 flex items-center">
          <AlertTriangle className="w-6 h-6 text-[#c5a572] mr-2" />
          Profil détecté avec succès !
        </h4>
        <p className="text-gray-300 mb-4">
          Francis a analysé vos données et identifié votre profil fiscal avec une confiance de {detectedProfile.confiance_detection}%. 
          Vous pouvez maintenant accéder aux stratégies d'optimisation personnalisées.
        </p>
        <div className="text-sm text-gray-400">
          <strong>Profil principal :</strong> {getProfileLabel(primaryProfile)} ({detectedProfile.score_total[primaryProfile]}% de compatibilité)
        </div>
      </div>
    </div>
  );
} 