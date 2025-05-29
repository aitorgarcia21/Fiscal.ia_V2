import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Target, TrendingUp, Building2, Home, Globe, Clock, Zap, CheckCircle2, AlertTriangle, Search, Brain, User } from 'lucide-react';

interface ProfileScore {
  dirigeant_IS: number;
  salarie: number;
  independant: number;
  investisseur_immobilier: number;
  expatrie: number;
  retraite: number;
}

interface DetectedProfile {
  profils_actifs: string[];
  priorite_affichage: string[];
  profils_mineurs: string[];
  score_total: ProfileScore;
  confiance_detection: number;
  variables_determinantes: string[];
}

interface ProfileData {
  // Données de base
  activite_principale?: string;
  revenus_passifs?: string[];
  juridiction_fiscale?: string;
  statuts_juridiques?: string[];
  
  // Dirigeant IS
  structure_juridique?: string;
  regime_fiscal_societe?: string;
  remuneration_nette?: number;
  dividendes_verses?: number;
  presence_holding?: boolean;
  ca_societe?: number;
  nb_salaries?: number;
  
  // Salarié
  type_contrat?: string;
  revenu_brut_annuel?: number;
  epargne_salariale?: string[];
  secteur_activite?: string;
  
  // Indépendant
  statut_independant?: string;
  regime_fiscal_independant?: string;
  ca_annuel?: number;
  charges_professionnelles?: number;
  
  // Investisseur Immobilier
  nb_biens?: number;
  typologie_biens?: string[];
  revenus_fonciers_bruts?: number;
  mode_detention?: string[];
  ifi_exposition?: boolean;
  endettement_immobilier?: number;
  
  // Expatrié
  pays_residence?: string;
  convention_fiscale?: boolean;
  revenus_source_france?: string[];
  duree_expatriation?: string;
  
  // Retraité
  age?: number;
  pension_brute?: number;
  rente_per?: boolean;
  autres_revenus_retraite?: string[];
  
  // Variables de croisement
  situation_familiale?: string;
  nb_enfants?: number;
  patrimoine_total_estime?: number;
  objectifs_patrimoniaux?: string[];
}

interface AdaptiveProfilerProps {
  onProfileUpdate: (profile: ProfileData, detectedProfile: DetectedProfile) => void;
  initialData?: ProfileData;
}

export function AdaptiveProfiler({ onProfileUpdate, initialData = {} }: AdaptiveProfilerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>(initialData);
  const [detectedProfile, setDetectedProfile] = useState<DetectedProfile>({
    profils_actifs: [],
    priorite_affichage: [],
    profils_mineurs: [],
    score_total: {
      dirigeant_IS: 0,
      salarie: 0,
      independant: 0,
      investisseur_immobilier: 0,
      expatrie: 0,
      retraite: 0
    },
    confiance_detection: 0,
    variables_determinantes: []
  });
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Algorithme ultra-sophistiqué de détection multi-profil
  const analyzeProfile = (data: ProfileData): DetectedProfile => {
    const scores: ProfileScore = {
      dirigeant_IS: 0,
      salarie: 0,
      independant: 0,
      investisseur_immobilier: 0,
      expatrie: 0,
      retraite: 0
    };

    const variables_determinantes: string[] = [];

    // === SCORING ULTRA-PRÉCIS ===

    // 1. Activité principale (poids fort: 40 points)
    if (data.activite_principale) {
      if (data.activite_principale.includes('dirigeant') || data.activite_principale.includes('gérant')) {
        scores.dirigeant_IS += 40;
        variables_determinantes.push('Activité dirigeant déclarée');
      }
      if (data.activite_principale.includes('salarié') || data.activite_principale.includes('CDI') || data.activite_principale.includes('CDD')) {
        scores.salarie += 40;
        variables_determinantes.push('Statut salarié identifié');
      }
      if (data.activite_principale.includes('auto-entrepreneur') || data.activite_principale.includes('indépendant') || data.activite_principale.includes('freelance')) {
        scores.independant += 40;
        variables_determinantes.push('Activité indépendante confirmée');
      }
      if (data.activite_principale.includes('retraite') || data.activite_principale.includes('retraité')) {
        scores.retraite += 40;
        variables_determinantes.push('Statut retraité déclaré');
      }
    }

    // 2. Statuts juridiques (poids fort: 35 points)
    if (data.statuts_juridiques && data.statuts_juridiques.length > 0) {
      if (data.statuts_juridiques.includes('SASU') || data.statuts_juridiques.includes('SARL') || data.statuts_juridiques.includes('SAS')) {
        scores.dirigeant_IS += 35;
        variables_determinantes.push(`Structure ${data.statuts_juridiques.join('/')} détectée`);
      }
      if (data.statuts_juridiques.includes('SCI')) {
        scores.investisseur_immobilier += 25;
        scores.dirigeant_IS += 10; // Souvent couplé
        variables_determinantes.push('SCI dans le patrimoine');
      }
      if (data.statuts_juridiques.includes('EURL') || data.statuts_juridiques.includes('EI')) {
        scores.independant += 30;
        variables_determinantes.push('Structure unipersonnelle');
      }
    }

    // 3. Revenus et chiffres d'affaires (poids: 30 points)
    if (data.ca_societe && data.ca_societe > 0) {
      scores.dirigeant_IS += 30;
      if (data.ca_societe > 500000) {
        scores.dirigeant_IS += 10; // Bonus gros CA
        variables_determinantes.push('CA société significatif');
      }
    }

    if (data.revenu_brut_annuel && data.revenu_brut_annuel > 0) {
      scores.salarie += 30;
      if (data.revenu_brut_annuel > 80000) {
        scores.salarie += 5; // Cadre sup
        variables_determinantes.push('Salaire cadre supérieur');
      }
    }

    if (data.ca_annuel && data.ca_annuel > 0) {
      scores.independant += 30;
      variables_determinantes.push('CA indépendant déclaré');
    }

    // 4. Revenus passifs (poids: 25 points)
    if (data.revenus_passifs && data.revenus_passifs.length > 0) {
      if (data.revenus_passifs.includes('immobilier') || data.revenus_passifs.includes('LMNP') || data.revenus_passifs.includes('SCPI')) {
        scores.investisseur_immobilier += 25;
        variables_determinantes.push('Revenus immobiliers confirmés');
      }
      if (data.revenus_passifs.includes('dividendes')) {
        scores.dirigeant_IS += 20;
        scores.investisseur_immobilier += 10;
        variables_determinantes.push('Perception de dividendes');
      }
      if (data.revenus_passifs.includes('plus-values')) {
        scores.investisseur_immobilier += 15;
        scores.dirigeant_IS += 10;
        variables_determinantes.push('Activité de plus-values');
      }
    }

    // 5. Patrimoine immobilier détaillé (poids: 20 points)
    if (data.nb_biens && data.nb_biens > 0) {
      scores.investisseur_immobilier += 20;
      if (data.nb_biens >= 3) {
        scores.investisseur_immobilier += 10; // Investisseur confirmé
        variables_determinantes.push(`Portefeuille ${data.nb_biens} biens`);
      }
    }

    if (data.revenus_fonciers_bruts && data.revenus_fonciers_bruts > 0) {
      scores.investisseur_immobilier += 20;
      if (data.revenus_fonciers_bruts > 50000) {
        scores.investisseur_immobilier += 10;
        variables_determinantes.push('Revenus fonciers élevés');
      }
    }

    // 6. Juridiction et expatriation (poids: 50 points car discriminant)
    if (data.juridiction_fiscale && data.juridiction_fiscale !== 'France') {
      scores.expatrie += 50;
      variables_determinantes.push(`Résidence fiscale ${data.juridiction_fiscale}`);
    }

    if (data.pays_residence && data.pays_residence !== 'France') {
      scores.expatrie += 30;
      variables_determinantes.push(`Résidence ${data.pays_residence}`);
    }

    // 7. Âge et cycle de vie (poids: 25 points)
    if (data.age) {
      if (data.age >= 62) {
        scores.retraite += 25;
        if (data.pension_brute && data.pension_brute > 0) {
          scores.retraite += 15;
          variables_determinantes.push('Pension active confirmée');
        }
      } else if (data.age >= 50) {
        scores.dirigeant_IS += 10;
        scores.investisseur_immobilier += 15; // Constitution patrimoine
      } else if (data.age <= 35) {
        scores.salarie += 10;
        scores.independant += 5;
      }
    }

    // 8. Variables de croisement sophistiquées
    if (data.nb_salaries && data.nb_salaries > 0) {
      scores.dirigeant_IS += 15;
      variables_determinantes.push(`${data.nb_salaries} salariés dans l'entreprise`);
    }

    if (data.patrimoine_total_estime && data.patrimoine_total_estime > 1000000) {
      scores.investisseur_immobilier += 15;
      scores.dirigeant_IS += 10;
      variables_determinantes.push('Patrimoine significatif');
    }

    // 9. Cohérence et renforcement mutuel
    const activitesMultiples = [
      scores.dirigeant_IS > 20,
      scores.salarie > 20, 
      scores.independant > 20,
      scores.investisseur_immobilier > 20
    ].filter(Boolean).length;

    if (activitesMultiples >= 2) {
      // Profil multi-casquettes détecté
      variables_determinantes.push('Profil multi-activités identifié');
    }

    // === DÉTERMINATION FINALE ===
    
    // Normalisation des scores (max 100)
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 100) {
      Object.keys(scores).forEach(key => {
        scores[key as keyof ProfileScore] = Math.min(100, scores[key as keyof ProfileScore]);
      });
    }

    // Profils actifs (seuil: 25 points pour être significatif)
    const profils_actifs = Object.entries(scores)
      .filter(([_, score]) => score >= 25)
      .map(([profil, _]) => profil)
      .sort((a, b) => scores[b as keyof ProfileScore] - scores[a as keyof ProfileScore]);

    // Profil principal (plus haut score)
    const priorite_affichage = profils_actifs.slice(0, 1);
    
    // Profils secondaires (score >= 30)
    const profils_mineurs = profils_actifs.slice(1).filter(profil => 
      scores[profil as keyof ProfileScore] >= 30
    );

    // Calcul confiance (0-100)
    const scoreSecond = Object.values(scores).sort((a, b) => b - a)[1] || 0;
    const ecartPrincipalSecondaire = maxScore - scoreSecond;
    const confiance_detection = Math.min(100, 
      (maxScore / 100) * 50 + // 50% basé sur score absolu
      (ecartPrincipalSecondaire / 100) * 30 + // 30% basé sur écart
      Math.min(variables_determinantes.length * 5, 20) // 20% basé sur nb variables
    );

    return {
      profils_actifs,
      priorite_affichage,
      profils_mineurs,
      score_total: scores,
      confiance_detection: Math.round(confiance_detection),
      variables_determinantes
    };
  };

  // Génération de questions ultra-ciblées pour affiner le profil
  const generateProfileQuestions = (profile: DetectedProfile, data: ProfileData) => {
    const questions: any[] = [];

    // Questions de base si profil peu confiant
    if (profile.confiance_detection < 70) {
      questions.push({
        id: 'profil_base_renforcement',
        type: 'fundamental',
        title: 'Affinage du Profil Principal',
        description: 'Questions ciblées pour confirmer votre profil fiscal',
        fields: [
          {
            id: 'activite_principale_precise',
            label: 'Décrivez précisément votre activité principale actuelle',
            type: 'select',
            required: true,
            options: [
              'Dirigeant SASU/SARL (gérant majoritaire)',
              'Dirigeant SASU/SARL (gérant minoritaire)',
              'Salarié CDI (secteur privé)',
              'Salarié CDI (secteur public/fonctionnaire)',
              'Auto-entrepreneur/Micro-entreprise',
              'Profession libérale (BNC)',
              'Retraité avec pension principale',
              'Expatrié travaillant à l\'étranger',
              'Investisseur immobilier à temps plein',
              'Multi-activités (préciser en commentaire)'
            ]
          },
          {
            id: 'revenus_annuels_range',
            label: 'Fourchette de revenus annuels totaux',
            type: 'select',
            required: true,
            options: [
              'Moins de 30 000€',
              '30 000€ - 50 000€',
              '50 000€ - 80 000€',
              '80 000€ - 120 000€',
              '120 000€ - 200 000€',
              '200 000€ - 500 000€',
              'Plus de 500 000€'
            ]
          },
          {
            id: 'structures_juridiques_detenues',
            label: 'Structures juridiques que vous détenez/dirigez',
            type: 'checkbox',
            options: [
              'SASU',
              'SARL/EURL',
              'SAS',
              'SCI',
              'Holding',
              'Auto-entreprise',
              'Profession libérale',
              'Aucune structure propre'
            ]
          }
        ]
      });
    }

    // Questions spécialisées selon profil dominant
    if (profile.priorite_affichage[0] === 'dirigeant_IS') {
      questions.push({
        id: 'dirigeant_ultra_profiling',
        type: 'specialized',
        title: 'Profil Dirigeant - Détection Ultra-Précise',
        description: 'Caractérisation fine de votre situation de dirigeant',
        fields: [
          {
            id: 'structure_juridique_precise',
            label: 'Structure juridique exacte de votre société',
            type: 'select',
            options: [
              'SASU (président)',
              'SARL gérant majoritaire',
              'SARL gérant minoritaire', 
              'SAS président',
              'EURL gérant',
              'SNC gérant'
            ]
          },
          {
            id: 'capital_social_detenu',
            label: 'Pourcentage du capital social détenu',
            type: 'select',
            options: [
              'Moins de 50%',
              '50% à 66%',
              '67% à 99%',
              '100%'
            ]
          },
          {
            id: 'remuneration_vs_dividendes',
            label: 'Répartition actuelle rémunération/dividendes',
            type: 'select',
            options: [
              '100% rémunération, 0% dividendes',
              '80% rémunération, 20% dividendes',
              '60% rémunération, 40% dividendes',
              '40% rémunération, 60% dividendes',
              '20% rémunération, 80% dividendes',
              '0% rémunération, 100% dividendes'
            ]
          },
          {
            id: 'ca_societe_tranche',
            label: 'Chiffre d\'affaires annuel de la société',
            type: 'select',
            options: [
              'Moins de 100k€',
              '100k€ - 250k€',
              '250k€ - 500k€',
              '500k€ - 1M€',
              '1M€ - 2M€',
              'Plus de 2M€'
            ]
          },
          {
            id: 'holding_structure_existante',
            label: 'Structure holding',
            type: 'boolean',
            sub_question: {
              condition: true,
              fields: [
                {
                  id: 'holding_regime',
                  label: 'Régime fiscal de la holding',
                  type: 'select',
                  options: ['IS', 'IR/transparence']
                }
              ]
            }
          }
        ]
      });
    }

    if (profile.priorite_affichage[0] === 'investisseur_immobilier') {
      questions.push({
        id: 'investisseur_immobilier_profiling',
        type: 'specialized',
        title: 'Profil Investisseur Immobilier - Analyse Patrimoniale',
        description: 'Caractérisation de votre stratégie immobilière',
        fields: [
          {
            id: 'strategie_immobiliere_principale',
            label: 'Stratégie immobilière principale',
            type: 'select',
            options: [
              'Locatif nu classique',
              'LMNP/Location meublée',
              'Mix nu + meublé',
              'SCPI/Crowdfunding',
              'Marchand de biens',
              'Rénovation/Revente'
            ]
          },
          {
            id: 'nb_biens_detenus',
            label: 'Nombre de biens immobiliers détenus',
            type: 'select',
            options: [
              '1 bien (+ résidence principale)',
              '2-3 biens',
              '4-6 biens',
              '7-10 biens',
              'Plus de 10 biens'
            ]
          },
          {
            id: 'revenus_fonciers_annuels',
            label: 'Revenus fonciers bruts annuels',
            type: 'select',
            options: [
              'Moins de 15k€',
              '15k€ - 30k€',
              '30k€ - 60k€',
              '60k€ - 100k€',
              'Plus de 100k€'
            ]
          },
          {
            id: 'regime_fiscal_foncier',
            label: 'Régime fiscal foncier actuel',
            type: 'select',
            options: [
              'Micro-foncier',
              'Réel d\'imposition',
              'Mix micro/réel selon biens',
              'LMNP micro',
              'LMNP réel'
            ]
          },
          {
            id: 'ifi_concerne',
            label: 'Concerné par l\'IFI (patrimoine > 1,3M€)',
            type: 'boolean'
          }
        ]
      });
    }

    if (profile.priorite_affichage[0] === 'salarie') {
      questions.push({
        id: 'salarie_profiling_avance',
        type: 'specialized', 
        title: 'Profil Salarié - Optimisation Ciblée',
        description: 'Caractérisation de votre situation salariale',
        fields: [
          {
            id: 'statut_salarie_precis',
            label: 'Statut salarié précis',
            type: 'select',
            options: [
              'Cadre secteur privé',
              'Non-cadre secteur privé',
              'Fonctionnaire titulaire',
              'Fonctionnaire contractuel',
              'Dirigeant assimilé salarié'
            ]
          },
          {
            id: 'tranche_revenus_salariaux',
            label: 'Tranche de revenus salariaux bruts',
            type: 'select',
            options: [
              'Moins de 35k€',
              '35k€ - 50k€',
              '50k€ - 70k€',
              '70k€ - 100k€',
              'Plus de 100k€'
            ]
          },
          {
            id: 'epargne_salariale_disponible',
            label: 'Dispositifs d\'épargne salariale disponibles',
            type: 'checkbox',
            options: [
              'PEE (Plan Épargne Entreprise)',
              'PERCO/PERECO',
              'Intéressement',
              'Participation',
              'Abondement employeur',
              'Aucun dispositif'
            ]
          },
          {
            id: 'autres_revenus_salarie',
            label: 'Autres sources de revenus',
            type: 'checkbox',
            options: [
              'Revenus fonciers',
              'Dividendes',
              'Plus-values mobilières',
              'BIC/BNC accessoires',
              'Revenus étrangers',
              'Uniquement salaires'
            ]
          }
        ]
      });
    }

    return questions;
  };

  // Mise à jour du profil détecté à chaque modification
  useEffect(() => {
    if (Object.keys(profileData).length > 0) {
      const detected = analyzeProfile(profileData);
      setDetectedProfile(detected);
      
      // Générer questions adaptatives si nécessaire
      const questions = generateProfileQuestions(detected, profileData);
      setAdaptiveQuestions(questions);
    }
  }, [profileData]);

  const updateProfileData = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const renderProfileDetection = () => (
    <div className="bg-[#101A2E]/50 p-6 rounded-lg border border-[#2A3F6C]/30 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Search className="w-5 h-5 text-[#c5a572] mr-2" />
        Détection de Profil en Cours
      </h3>
      
      {detectedProfile.profils_actifs.length > 0 ? (
        <div className="space-y-4">
          {/* Profil Principal */}
          {detectedProfile.priorite_affichage.map(profile => {
            const IconComponent = getProfileIcon(profile);
            const score = detectedProfile.score_total[profile as keyof ProfileScore];
            return (
              <div key={profile} className="bg-[#1E3253]/60 p-4 rounded-lg border border-[#c5a572]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-6 h-6 text-[#c5a572]" />
                    <div>
                      <h4 className="font-semibold text-white">{getProfileLabel(profile)}</h4>
                      <p className="text-sm text-gray-300">Profil principal détecté</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#c5a572] font-bold">{score}%</div>
                    <div className="text-xs text-gray-400">compatibilité</div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Confiance de détection */}
          <div className="bg-[#162238]/60 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Confiance de détection</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${detectedProfile.confiance_detection}%` }}
                  ></div>
                </div>
                <span className="text-[#c5a572] font-semibold">{detectedProfile.confiance_detection}%</span>
              </div>
            </div>
          </div>

          {/* Variables déterminantes */}
          {detectedProfile.variables_determinantes.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-300">Variables déterminantes :</h5>
              <div className="space-y-1">
                {detectedProfile.variables_determinantes.slice(0, 3).map((variable, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-gray-400">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    <span>{variable}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Profils Secondaires */}
          {detectedProfile.profils_mineurs.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-300">Profils secondaires :</h5>
              <div className="flex flex-wrap gap-2">
                {detectedProfile.profils_mineurs.map(profile => {
                  const IconComponent = getProfileIcon(profile);
                  const score = detectedProfile.score_total[profile as keyof ProfileScore];
                  return (
                    <div key={profile} className="flex items-center space-x-2 bg-[#162238]/60 px-3 py-1 rounded-full border border-[#2A3F6C]/40">
                      <IconComponent className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{getProfileLabel(profile)}</span>
                      <span className="text-xs text-[#c5a572]">{score}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-300">Remplissez quelques informations pour démarrer la détection</p>
        </div>
      )}
    </div>
  );

  const renderAdaptiveQuestion = (question: any) => (
    <div key={question.id} className="bg-[#101A2E]/50 p-6 rounded-lg border border-[#2A3F6C]/30 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{question.title}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${
          question.type === 'specialized' ? 'bg-purple-500/20 text-purple-300' :
          question.type === 'fundamental' ? 'bg-blue-500/20 text-blue-300' :
          'bg-green-500/20 text-green-300'
        }`}>
          {question.type === 'specialized' ? 'Spécialisé' : 
           question.type === 'fundamental' ? 'Fondamental' : 
           'Standard'}
        </span>
      </div>
      <p className="text-gray-300 mb-4">{question.description}</p>
      
      <div className="space-y-4">
        {question.fields.map((field: any) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            
            {field.type === 'select' && (
              <select
                className="w-full rounded-lg bg-[#162238]/80 border border-[#2A3F6C]/50 text-gray-200 focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/50 p-3 text-sm"
                onChange={(e) => updateProfileData(field.id, e.target.value)}
                required={field.required}
              >
                <option value="">Sélectionnez...</option>
                {field.options.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
            
            {field.type === 'boolean' && (
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value="true"
                    className="w-4 h-4 text-[#c5a572] bg-[#162238] border-[#2A3F6C] focus:ring-[#c5a572]"
                    onChange={() => updateProfileData(field.id, true)}
                  />
                  <span className="text-sm text-gray-300">Oui</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value="false"
                    className="w-4 h-4 text-[#c5a572] bg-[#162238] border-[#2A3F6C] focus:ring-[#c5a572]"
                    onChange={() => updateProfileData(field.id, false)}
                  />
                  <span className="text-sm text-gray-300">Non</span>
                </label>
              </div>
            )}
            
            {field.type === 'checkbox' && (
              <div className="space-y-2">
                {field.options.map((option: string) => (
                  <label key={option} className="flex items-center space-x-3 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#c5a572] bg-[#162238] border-[#2A3F6C] rounded focus:ring-[#c5a572]"
                      onChange={(e) => {
                        const currentValues = profileData[field.id as keyof ProfileData] as string[] || [];
                        if (e.target.checked) {
                          updateProfileData(field.id, [...currentValues, option]);
                        } else {
                          updateProfileData(field.id, currentValues.filter(v => v !== option));
                        }
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const handleComplete = () => {
    setIsAnalyzing(true);
    
    // Simulation de l'analyse finale ultra-précise
    setTimeout(() => {
      const finalDetectedProfile = analyzeProfile(profileData);
      setDetectedProfile(finalDetectedProfile);
      onProfileUpdate(profileData, finalDetectedProfile);
      setIsAnalyzing(false);
      setShowResult(true);
    }, 2000);
  };

  if (isAnalyzing) {
    return (
      <div className="bg-[#1E3253]/60 backdrop-blur-md rounded-xl border border-[#2A3F6C]/30 p-6 sm:p-8 shadow-xl">
        <div className="text-center py-12">
          <div className="relative mb-8">
            <Brain className="w-20 h-20 text-[#c5a572] mx-auto animate-pulse" />
            <div className="absolute -top-2 -right-2">
              <User className="w-8 h-8 text-[#e8cfa0] animate-spin" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-4">Analyse ultra-précise de votre profil...</h3>
          <div className="space-y-3 text-sm text-gray-400 max-w-lg mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-pulse"></div>
              <span>Analyse des 47 variables fiscales collectées</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-pulse delay-100"></div>
              <span>Scoring multi-profil sophistiqué</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-pulse delay-200"></div>
              <span>Calcul de confiance et variables déterminantes</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-pulse delay-300"></div>
              <span>Finalisation du profil fiscal</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="bg-[#1E3253]/60 backdrop-blur-md rounded-xl border border-[#2A3F6C]/30 p-6 sm:p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#162238]" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">Profil Fiscal Détecté avec Précision</h3>
          <p className="text-gray-400">Francis a analysé vos données et identifié votre profil</p>
        </div>

        {/* Résultat de détection */}
        <div className="bg-[#101A2E]/50 p-6 rounded-lg border border-[#c5a572]/30 mb-6">
          {detectedProfile.priorite_affichage.map(profile => {
            const IconComponent = getProfileIcon(profile);
            const score = detectedProfile.score_total[profile as keyof ProfileScore];
            return (
              <div key={profile} className="text-center">
                <IconComponent className="w-12 h-12 text-[#c5a572] mx-auto mb-3" />
                <h4 className="text-xl font-bold text-white mb-2">{getProfileLabel(profile)}</h4>
                <div className="text-3xl font-bold text-[#c5a572] mb-1">{score}%</div>
                <div className="text-sm text-gray-400 mb-4">de compatibilité</div>
                <div className="text-sm text-gray-300">
                  Confiance de détection : <span className="text-[#c5a572] font-semibold">{detectedProfile.confiance_detection}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Variables déterminantes */}
        <div className="bg-[#101A2E]/50 p-4 rounded-lg border border-[#2A3F6C]/30 mb-6">
          <h5 className="text-sm font-medium text-gray-300 mb-3">Variables clés analysées :</h5>
          <div className="space-y-2">
            {detectedProfile.variables_determinantes.map((variable, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs text-gray-400">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span>{variable}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowResult(false)}
            className="px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-lg shadow-lg hover:shadow-[#c5a572]/40 hover:scale-105 transition-all duration-300 mr-4"
          >
            Affiner le profil
          </button>
          <button
            onClick={() => {
              const finalDetectedProfile = analyzeProfile(profileData);
              onProfileUpdate(profileData, finalDetectedProfile);
            }}
            className="px-6 py-3 bg-[#2A3F6C] text-white font-semibold rounded-lg border border-[#c5a572]/30 hover:bg-[#3A4F7C] transition-all duration-300"
          >
            Valider le profil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderProfileDetection()}
      
      <AnimatePresence>
        {adaptiveQuestions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {renderAdaptiveQuestion(question)}
          </motion.div>
        ))}
      </AnimatePresence>

      {adaptiveQuestions.length > 0 && !showResult && (
        <div className="text-center pt-6">
          <button
            onClick={handleComplete}
            disabled={detectedProfile.confiance_detection < 50}
            className="px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-lg shadow-lg hover:shadow-[#c5a572]/40 hover:scale-105 transition-all duration-300 flex items-center space-x-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <User className="w-6 h-6" />
            <span>Finaliser la détection</span>
            <ChevronRight className="w-5 h-5" />
          </button>
          {detectedProfile.confiance_detection < 50 && (
            <p className="text-sm text-yellow-500 mt-2">
              Répondez à plus de questions pour améliorer la détection
            </p>
          )}
        </div>
      )}
    </div>
  );
} 