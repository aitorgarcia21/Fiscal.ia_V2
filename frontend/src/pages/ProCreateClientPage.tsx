import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { ClientProfile } from '../types/clientProfile';
import { ChevronLeft, Save, Brain, Mic, X, MessageSquare, Euro, User, Mail, Users, Briefcase, Target, Play, ArrowRight, Check, TrendingUp } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { UltraFluidVoiceRecorder } from '../components/UltraFluidVoiceRecorder';

import { ParticulierForm } from '../components/profile-forms/ParticulierForm';

interface ProCreateClientFormState {
  nom_client: string;
  prenom_client: string;
  civilite_client: string;
  email_client: string;
  statut_dossier_pro: string;
  nom_usage_client: string;
  date_naissance_client: string;
  lieu_naissance_client: string;
  nationalite_client: string;
  numero_fiscal_client: string;
  adresse_postale_client: string;
  code_postal_client: string;
  ville_client: string;
  pays_residence_fiscale_client: string;
  telephone_principal_client: string;
  telephone_secondaire_client: string;
  situation_maritale_client: string;
  date_mariage_pacs_client: string;
  regime_matrimonial_client: string;
  nombre_enfants_a_charge_client: string;
  personnes_dependantes_client: string;
  profession_client1: string;
  statut_professionnel_client1: string;
  nom_employeur_entreprise_client1: string;
  type_contrat_client1: string;
  revenu_net_annuel_client1: string;
  profession_client2: string;
  statut_professionnel_client2: string;
  nom_employeur_entreprise_client2: string;
  type_contrat_client2: string;
  revenu_net_annuel_client2: string;
  revenus_fonciers_annuels_bruts_foyer: string;
  charges_foncieres_deductibles_foyer: string;
  revenus_capitaux_mobiliers_foyer: string;
  plus_values_mobilieres_foyer: string;
  plus_values_immobilieres_foyer: string;
  benefices_industriels_commerciaux_foyer: string;
  benefices_non_commerciaux_foyer: string;
  pensions_retraites_percues_foyer: string;
  pensions_alimentaires_percues_foyer: string;
  autres_revenus_foyer_details: string;
  comptes_courants_solde_total_estime: string;
  compte_titres_valeur_estimee: string;
  autres_placements_financiers_details: string;
  valeur_entreprise_parts_sociales: string;
  comptes_courants_associes_solde: string;
  vehicules_valeur_estimee: string;
  objets_art_valeur_estimee: string;
  credits_consommation_encours_total: string;
  autres_dettes_details: string;
  objectifs_fiscaux_client: string;
  objectifs_patrimoniaux_client: string;
  horizon_placement_client: string;
  profil_risque_investisseur_client: string;
  notes_objectifs_projets_client: string;
  tranche_marginale_imposition_estimee: string;
  credits_reductions_impot_recurrents: string;
  ifi_concerne_client: string;
  notes_fiscales_client: string;
  prochain_rendez_vous_pro: string;
  notes_internes_pro: string;
  details_enfants_client_json_str: string;
  autres_revenus_client1_json_str: string;
  autres_revenus_client2_json_str: string;
  residence_principale_details_json_str: string;
  residences_secondaires_details_json_str: string;
  investissements_locatifs_details_json_str: string;
  autres_biens_immobiliers_details_json_str: string;
  livrets_epargne_details_json_str: string;
  assurance_vie_details_json_str: string;
  pea_details_json_str: string;
  epargne_retraite_details_json_str: string;
  dernier_avis_imposition_details_json_str: string;
}

const initialFormData: ProCreateClientFormState = {
  nom_client: '',
  prenom_client: '',
  civilite_client: 'M.',
  email_client: '',
  statut_dossier_pro: 'Actif',
  nom_usage_client: '',
  date_naissance_client: '',
  lieu_naissance_client: '',
  nationalite_client: '',
  numero_fiscal_client: '',
  adresse_postale_client: '',
  code_postal_client: '',
  ville_client: '',
  pays_residence_fiscale_client: '',
  telephone_principal_client: '',
  telephone_secondaire_client: '',
  situation_maritale_client: 'Célibataire',
  date_mariage_pacs_client: '',
  regime_matrimonial_client: '',
  nombre_enfants_a_charge_client: '0',
  personnes_dependantes_client: '',
  profession_client1: '',
  statut_professionnel_client1: '',
  nom_employeur_entreprise_client1: '',
  type_contrat_client1: '',
  revenu_net_annuel_client1: '',
  profession_client2: '',
  statut_professionnel_client2: '',
  nom_employeur_entreprise_client2: '',
  type_contrat_client2: '',
  revenu_net_annuel_client2: '',
  revenus_fonciers_annuels_bruts_foyer: '',
  charges_foncieres_deductibles_foyer: '',
  revenus_capitaux_mobiliers_foyer: '',
  plus_values_mobilieres_foyer: '',
  plus_values_immobilieres_foyer: '',
  benefices_industriels_commerciaux_foyer: '',
  benefices_non_commerciaux_foyer: '',
  pensions_retraites_percues_foyer: '',
  pensions_alimentaires_percues_foyer: '',
  autres_revenus_foyer_details: '',
  comptes_courants_solde_total_estime: '',
  compte_titres_valeur_estimee: '',
  autres_placements_financiers_details: '',
  valeur_entreprise_parts_sociales: '',
  comptes_courants_associes_solde: '',
  vehicules_valeur_estimee: '',
  objets_art_valeur_estimee: '',
  credits_consommation_encours_total: '',
  autres_dettes_details: '',
  objectifs_fiscaux_client: '',
  objectifs_patrimoniaux_client: '',
  horizon_placement_client: '',
  profil_risque_investisseur_client: '',
  notes_objectifs_projets_client: '',
  tranche_marginale_imposition_estimee: '',
  credits_reductions_impot_recurrents: '',
  ifi_concerne_client: 'Non précisé',
  notes_fiscales_client: '',
  prochain_rendez_vous_pro: '',
  notes_internes_pro: '',
  details_enfants_client_json_str: '',
  autres_revenus_client1_json_str: '',
  autres_revenus_client2_json_str: '',
  residence_principale_details_json_str: '',
  residences_secondaires_details_json_str: '',
  investissements_locatifs_details_json_str: '',
  autres_biens_immobiliers_details_json_str: '',
  livrets_epargne_details_json_str: '',
  assurance_vie_details_json_str: '',
  pea_details_json_str: '',
  epargne_retraite_details_json_str: '',
  dernier_avis_imposition_details_json_str: '',
};

const buttonPrimaryStyles = "px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl shadow-lg hover:shadow-[#c5a572]/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#c5a572] focus:ring-offset-2 focus:ring-offset-[#162238] transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed";

export function ProCreateClientPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedProfile = searchParams.get('profile') || 'generaliste';
  
  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboardingStorage = localStorage.getItem('francis_onboarding_seen');
    if (!hasSeenOnboardingStorage) {
      setShowOnboarding(true);
      setHasSeenOnboarding(false);
    } else {
      setHasSeenOnboarding(true);
    }
  }, []);
  
  // Handle onboarding completion
  const completeOnboarding = () => {
    localStorage.setItem('francis_onboarding_seen', 'true');
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
    setOnboardingStep(0);
  };
  
  // Navigate onboarding steps
  const nextOnboardingStep = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      completeOnboarding();
    }
  };
  
  const prevOnboardingStep = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const [formData, setFormData] = useState<ProCreateClientFormState>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [autoStartVoice, setAutoStartVoice] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [isOptimizationAnalyzing, setIsOptimizationAnalyzing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<string>('');

  // Onboarding states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Onboarding steps
  const onboardingSteps = [
    {
      title: "Bienvenue dans Francis ! ",
      description: "Découvrez comment Francis peut révolutionner votre création de profils clients grâce à l'intelligence artificielle.",
      icon: <Brain className="w-8 h-8 text-[#c5a572]" />,
      highlight: null
    },
    {
      title: 'Transcription vocale intelligente',
      description: 'Francis écoute et transcrit votre entretien avec le client en temps réel. Parlez naturellement pendant votre rendez-vous.',
      icon: <Mic className="w-6 h-6 text-[#c5a572]" />,
      highlight: "voice-input"
    },
    {
      title: 'Création du profil complet',
      description: 'Francis extrait automatiquement toutes les informations et remplit le formulaire pour vous. Plus de 25 champs détectés ! Il établit le profil complet de votre client.',
      icon: <Target className="w-6 h-6 text-[#c5a572]" />,
      highlight: "form-fields"
    },
    {
      title: 'Optimisation fiscale intelligente',
      description: 'Après la création du profil, Francis analyse le profil complet et propose des optimisations fiscales sur mesure.',
      icon: <TrendingUp className="w-6 h-6 text-[#c5a572]" />,
      highlight: "optimization-results"
    },
    {
      title: " Prêt à commencer !",
      description: "Vous maîtrisez maintenant Francis ! Essayez dès maintenant avec un vrai cas client.",
      icon: <Check className="w-8 h-8 text-[#c5a572]" />,
      highlight: null
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVoiceTranscription = (text: string) => {
    setTranscript(text);
  };

  const handleFinalTranscription = (text: string) => {
    setTranscript(text);
  };

  const handleVoiceError = (error: string) => {
    console.error('Voice error:', error);
  };

  const processTranscript = async () => {
    if (!transcript.trim()) return;
    
    setIsAIAnalyzing(true);
    try {
      // Créer un prompt pour Francis pour analyser la transcription
      const analysisPrompt = `Analysez cette transcription d'un entretien client et extrayez les informations suivantes au format JSON :

Transcription: "${transcript}"

Extrayez et structurez les informations suivantes :
- Informations personnelles (nom, prénom, civilité, âge, situation familiale, nombre d'enfants, profession, etc.)
- Informations financières (revenus, patrimoine, investissements, etc.)
- Objectifs et projets

Répondez uniquement avec un objet JSON valide contenant les champs détectés, sans texte additionnel.`;
      
      const response = await fetch('/api/test-francis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: analysisPrompt })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse');
      }
      
      const result = await response.json();
      
      // Tenter d'extraire un JSON de la réponse de Francis
      let extractedData: Partial<ProCreateClientFormState> = {};
      try {
        // Chercher un JSON dans la réponse (sans flag 's' pour compatibilité)
        const jsonMatch = result.response.match(/\{[^}]+\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log('Pas de JSON valide détecté, extraction manuelle...');
        
        // === VALIDATION STRICTE POUR ÉVITER LES FAUX POSITIFS ===
        
        // Vérifier si la transcription contient au moins des éléments exploitables
        const minWords = 10;
        const words = transcript.trim().split(/\s+/);
        const hasUsefulContent = transcript.length > 50 && words.length >= minWords;
        
        // Vérifier si c'est vraiment un entretien client (mots-clés contextuels)
        const clientKeywords = ['client', 'fiscale', 'revenus', 'situation', 'famille', 'profession', 'domicile', 'contact'];
        const identityKeywords = ['appelle', 'nom', 'prénom', 'âge', 'marié', 'enfant', 'travaille', 'habite'];
        const allKeywords = [...clientKeywords, ...identityKeywords];
        
        const foundKeywords = allKeywords.filter(keyword => 
          transcript.toLowerCase().includes(keyword)
        ).length;
        
        const hasClientContext = foundKeywords >= 2;
        
        let extractedData: any = {};
        
        if (hasUsefulContent && hasClientContext) {
          // === EXTRACTION SÉCURISÉE AVEC VALIDATION CONTEXTUELLE ===
          const text = transcript.toLowerCase();
          
          // Détecter nom et prénom - AVEC CONTEXTE STRICT
          const nomPrenomPatterns = [
            /(?:je m'appelle|mon nom est|je suis)\s+([a-zA-ZÀ-ÿ-]{2,})\s+([a-zA-ZÀ-ÿ-]{2,})/i,
            /(?:moi c'est|c'est)\s+([a-zA-ZÀ-ÿ-]{2,})\s+([a-zA-ZÀ-ÿ-]{2,})(?:\s|,|\.|$)/i
          ];
          
          for (const pattern of nomPrenomPatterns) {
            const match = transcript.match(pattern);
            if (match && match[1].length >= 2 && match[2].length >= 2) {
              extractedData.prenom_client = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
              extractedData.nom_client = match[2].toUpperCase();
              break;
            }
          }
          
          // Email - PATTERN STRICT
          const emailMatch = transcript.match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/i);
          if (emailMatch) {
            extractedData.email_client = emailMatch[1];
          }
          
          // Téléphone - PATTERN STRICT FRANÇAIS
          const telMatch = transcript.match(/\b(0[1-9](?:[\s.-]?\d{2}){4})\b/);
          if (telMatch) {
            extractedData.telephone_principal_client = telMatch[1].replace(/[\s.-]/g, '');
          }
          
          // Âge - AVEC CONTEXTE
          const ageMatch = transcript.match(/(?:j'ai|âgé de|age de)\s*(\d{1,2})\s*ans?/i);
          if (ageMatch) {
            const age = parseInt(ageMatch[1]);
            if (age >= 16 && age <= 100) { // Validation réaliste
              const currentYear = new Date().getFullYear();
              const birthYear = currentYear - age;
              extractedData.date_naissance_client = `${birthYear}-01-01`;
            }
          }
          
          // Code postal et ville - PATTERN STRICT
          const codePostalMatch = transcript.match(/\b(\d{5})\s+([a-zA-ZÀ-ÿ\s-]{2,})(?:\s|,|\.|$)/i);
          if (codePostalMatch && codePostalMatch[2].trim().length >= 2) {
            extractedData.code_postal_client = codePostalMatch[1];
            extractedData.ville_client = codePostalMatch[2].trim();
          }
        } else {
          // Transcription trop courte ou sans contexte client
          console.log('⚠️ Transcription rejetée: contenu insuffisant ou hors contexte client');
          extractedData = {}; // Aucune extraction
        }
      }
      
      // Mettre à jour les champs du formulaire avec les données extraites
      if (Object.keys(extractedData).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...extractedData
        }));
      }
      
      setIsAIAnalyzing(false);
      
      // Montrer un message de succès
      console.log('Analyse terminée, champs remplis:', extractedData);
      
      // Déclencher automatiquement l'analyse d'optimisation fiscale
      if (Object.keys(extractedData).length > 0) {
        setTimeout(() => {
          analyzeOptimizationOpportunities();
        }, 1000); // Petite pause pour que l'user voit l'auto-fill
      }
      
    } catch (error) {
      setIsAIAnalyzing(false);
      console.error('Error analyzing transcript:', error);
      setError('Erreur lors de l\'analyse avec Francis');
    }
  };

  // Fonction d'analyse d'optimisation fiscale
  const analyzeOptimizationOpportunities = async () => {
    setIsOptimizationAnalyzing(true);
    
    try {
      // Construire un profil complet du client à partir des données du formulaire
      const clientProfile = {
        nom: formData.nom_client,
        prenom: formData.prenom_client,
        situation_maritale: formData.situation_maritale_client,
        nombre_enfants: formData.nombre_enfants_a_charge_client,
        profession: formData.profession_client1,
        statut_professionnel: formData.statut_professionnel_client1,
        revenus_annuels: formData.revenu_net_annuel_client1,
        revenus_conjoint: formData.revenu_net_annuel_client2,
        revenus_fonciers: formData.revenus_fonciers_annuels_bruts_foyer,
        epargne: formData.comptes_courants_solde_total_estime,
        objectifs_fiscaux: formData.objectifs_fiscaux_client,
        objectifs_patrimoniaux: formData.objectifs_patrimoniaux_client,
        notes: formData.notes_internes_pro
      };
      
      // Créer un prompt d'analyse d'optimisation fiscale
      const optimizationPrompt = `Tu es Francis, expert fiscal français. Analyse ce profil client complet et propose des optimisations fiscales personnalisées et des leads fiscaux.

PROFIL CLIENT:
- Nom: ${clientProfile.nom} ${clientProfile.prenom}
- Situation: ${clientProfile.situation_maritale}, ${clientProfile.nombre_enfants} enfants
- Profession: ${clientProfile.profession} (${clientProfile.statut_professionnel})
- Revenus annuels: ${clientProfile.revenus_annuels}€
- Revenus conjoint: ${clientProfile.revenus_conjoint}€
- Revenus fonciers: ${clientProfile.revenus_fonciers}€
- Épargne: ${clientProfile.epargne}€
- Objectifs fiscaux: ${clientProfile.objectifs_fiscaux}
- Objectifs patrimoniaux: ${clientProfile.objectifs_patrimoniaux}
- Notes: ${clientProfile.notes}

ANALYSE DEMANDÉE:
1. OPTIMISATIONS FISCALES IMMÉDIATES (niches fiscales, réductions d'impôts, optimisation revenus)
2. LEADS FISCAUX (investissements recommandés, stratégies patrimoniales)
3. OPPORTUNITÉS SPÉCIFIQUES selon sa profession et situation
4. RECOMMANDATIONS PRIORITAIRES avec montants d'économies estimés

Réponds de manière structurée et professionnelle, avec des conseils concrets et chiffrés.`;
      
      const response = await fetch('/api/test-francis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: optimizationPrompt
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse d\'optimisation');
      }
      
      const result = await response.json();
      setOptimizationResults(result.response || 'Analyse terminée');
      
    } catch (error) {
      console.error('Error analyzing optimization opportunities:', error);
      setOptimizationResults('Erreur lors de l\'analyse d\'optimisation fiscale');
    } finally {
      setIsOptimizationAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient('/pro/clients', { data: formData });
      if (response && (response as any).success) {
        navigate('/pro/dashboard');
      }
    } catch (error: any) {
      setError(error.data?.detail || error.message || 'Erreur lors de la création du client');
    } finally {
      setIsLoading(false);
    }
  };

  // Render onboarding overlay
  const renderOnboarding = () => {
    if (!showOnboarding) return null;
    
    const currentStep = onboardingSteps[onboardingStep];
    const isLastStep = onboardingStep === onboardingSteps.length - 1;
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#162238] rounded-2xl max-w-2xl w-full mx-4 border border-[#c5a572]/30 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#c5a572]/20">
            <div className="flex items-center gap-3">
              {currentStep.icon}
              <h2 className="text-xl font-bold text-white">{currentStep.title}</h2>
            </div>
            <button
              onClick={completeOnboarding}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#c5a572]/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {currentStep.description}
            </p>
            
            {/* Demo content based on step */}
            {onboardingStep === 1 && (
              <div className="bg-[#0E2444] rounded-xl p-4 border border-[#c5a572]/20 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center">
                    <Mic className="w-4 h-4 text-[#162238]" />
                  </div>
                  <span className="text-[#c5a572] font-medium">Exemple d'entretien client :</span>
                </div>
                <p className="text-sm text-gray-300 italic">
                  "Bonjour M. Dupont, pouvez-vous me parler de votre situation ? — Je m'appelle Jean Dupont, 
                  je suis dentiste, je gagne 50000 euros par an, je suis marié avec deux enfants, 
                  j'ai une maison qui vaut 300000 euros..."
                </p>
              </div>
            )}
            
            {onboardingStep === 2 && (
              <div className="bg-[#0E2444] rounded-xl p-4 border border-[#c5a572]/20 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Nom: Jean Dupont</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Profession: Dentiste</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Revenus: 50000€</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Situation: Marié(e)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Enfants: 2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Patrimoine: 300000€</span>
                  </div>
                </div>
              </div>
            )}
            
            {onboardingStep === 3 && (
              <div className="bg-[#0E2444] rounded-xl p-4 border border-[#c5a572]/20 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-[#162238]" />
                  </div>
                  <span className="text-[#c5a572] font-medium">Recommandations Francis :</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-[#c5a572] mt-0.5 flex-shrink-0" />
                    <span>Optimisation PERP pour dentistes (-2000€ d'impôts)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-[#c5a572] mt-0.5 flex-shrink-0" />
                    <span>Investissement locatif Pinel (-1500€ d'impôts)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-[#c5a572] mt-0.5 flex-shrink-0" />
                    <span>Défiscalisation via SCI familiale</span>
                  </li>
                </ul>
              </div>
            )}
            
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Étape {onboardingStep + 1} sur {onboardingSteps.length}</span>
                <span className="text-sm text-[#c5a572]">{Math.round(((onboardingStep + 1) / onboardingSteps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-[#0E2444] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((onboardingStep + 1) / onboardingSteps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-[#c5a572]/20">
            <button
              onClick={prevOnboardingStep}
              disabled={onboardingStep === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>
            
            <button
              onClick={completeOnboarding}
              className="text-sm text-gray-400 hover:text-[#c5a572] transition-colors"
            >
              Passer l'introduction
            </button>
            
            <button
              onClick={nextOnboardingStep}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
            >
              {isLastStep ? 'Commencer !' : 'Suivant'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFormByProfile = () => {
    // Formulaire généraliste unique (sans sélection de profil)
    return (
      <div className="space-y-8">
        {/* Informations personnelles */}
        <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/30">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-[#c5a572]" />
            Informations personnelles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Civilité</label>
              <select
                name="civilite_client"
                value={formData.civilite_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
              >
                <option value="">Sélectionner</option>
                <option value="M">Monsieur</option>
                <option value="Mme">Madame</option>
                <option value="Mlle">Mademoiselle</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nom de famille</label>
              <input
                type="text"
                name="nom_client"
                value={formData.nom_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="Nom de famille"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
              <input
                type="text"
                name="prenom_client"
                value={formData.prenom_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="Prénom"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nom d'usage</label>
              <input
                type="text"
                name="nom_usage_client"
                value={formData.nom_usage_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="Nom d'usage (si différent)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date de naissance</label>
              <input
                type="date"
                name="date_naissance_client"
                value={formData.date_naissance_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Lieu de naissance</label>
              <input
                type="text"
                name="lieu_naissance_client"
                value={formData.lieu_naissance_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="Ville, Pays"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nationalité</label>
              <input
                type="text"
                name="nationalite_client"
                value={formData.nationalite_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="Nationalité"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Numéro fiscal</label>
              <input
                type="text"
                name="numero_fiscal_client"
                value={formData.numero_fiscal_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="Numéro fiscal (13 chiffres)"
              />
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/30">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#c5a572]" />
            Coordonnées
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email_client"
                value={formData.email_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="email@exemple.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone principal</label>
              <input
                type="tel"
                name="telephone_principal_client"
                value={formData.telephone_principal_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="06 12 34 56 78"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone secondaire</label>
              <input
                type="tel"
                name="telephone_secondaire_client"
                value={formData.telephone_secondaire_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="Téléphone secondaire (optionnel)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Adresse postale</label>
              <input
                type="text"
                name="adresse_postale_client"
                value={formData.adresse_postale_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="Numéro et rue"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Code postal</label>
              <input
                type="text"
                name="code_postal_client"
                value={formData.code_postal_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="75001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ville</label>
              <input
                type="text"
                name="ville_client"
                value={formData.ville_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="Paris"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pays de résidence fiscale</label>
              <input
                type="text"
                name="pays_residence_fiscale_client"
                value={formData.pays_residence_fiscale_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="France"
              />
            </div>
          </div>
        </div>

        {/* Situation familiale */}
        <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/30">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#c5a572]" />
            Situation familiale
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Situation maritale</label>
              <select
                name="situation_maritale_client"
                value={formData.situation_maritale_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
              >
                <option value="">Sélectionner</option>
                <option value="Célibataire">Célibataire</option>
                <option value="Marié(e)">Marié(e)</option>
                <option value="Pacsé(e)">Pacsé(e)</option>
                <option value="Divorcé(e)">Divorcé(e)</option>
                <option value="Veuf/Veuve">Veuf/Veuve</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date de mariage/PACS</label>
              <input
                type="date"
                name="date_mariage_pacs_client"
                value={formData.date_mariage_pacs_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Régime matrimonial</label>
              <select
                name="regime_matrimonial_client"
                value={formData.regime_matrimonial_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
              >
                <option value="">Sélectionner</option>
                <option value="Séparation de biens">Séparation de biens</option>
                <option value="Communauté réduite aux acquêts">Communauté réduite aux acquêts</option>
                <option value="Communauté universelle">Communauté universelle</option>
                <option value="Participation aux acquêts">Participation aux acquêts</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre d'enfants à charge</label>
              <input
                type="number"
                name="nombre_enfants_a_charge_client"
                value={formData.nombre_enfants_a_charge_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="0"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Personnes dépendantes</label>
              <input
                type="number"
                name="personnes_dependantes_client"
                value={formData.personnes_dependantes_client}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Activité professionnelle */}
        <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/30">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#c5a572]" />
            Activité professionnelle
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Profession</label>
              <input
                type="text"
                name="profession_client1"
                value={formData.profession_client1}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="Profession"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Statut professionnel</label>
              <select
                name="statut_professionnel_client1"
                value={formData.statut_professionnel_client1}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
              >
                <option value="">Sélectionner</option>
                <option value="Salarié">Salarié</option>
                <option value="Fonctionnaire">Fonctionnaire</option>
                <option value="Indépendant">Indépendant</option>
                <option value="Retraité">Retraité</option>
                <option value="Sans activité">Sans activité</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Employeur/Entreprise</label>
              <input
                type="text"
                name="nom_employeur_entreprise_client1"
                value={formData.nom_employeur_entreprise_client1}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="Nom de l'employeur ou entreprise"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type de contrat</label>
              <select
                name="type_contrat_client1"
                value={formData.type_contrat_client1}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
              >
                <option value="">Sélectionner</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Intérim">Intérim</option>
                <option value="Stage">Stage</option>
                <option value="Alternance">Alternance</option>
                <option value="Libéral">Libéral</option>
                <option value="Auto-entrepreneur">Auto-entrepreneur</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Revenu net annuel (€)</label>
              <input
                type="number"
                name="revenu_net_annuel_client1"
                value={formData.revenu_net_annuel_client1}
                onChange={handleChange}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="50000"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Notes et objectifs */}
        <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/30">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#c5a572]" />
            Objectifs et notes
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Objectifs fiscaux</label>
              <textarea
                name="objectifs_fiscaux_client"
                value={formData.objectifs_fiscaux_client}
                onChange={handleChange}
                rows={3}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="Objectifs fiscaux du client..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Objectifs patrimoniaux</label>
              <textarea
                name="objectifs_patrimoniaux_client"
                value={formData.objectifs_patrimoniaux_client}
                onChange={handleChange}
                rows={3}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="Objectifs patrimoniaux du client..."
              />
              </div>
            
              <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes internes</label>
              <textarea
                name="notes_internes_pro"
                value={formData.notes_internes_pro}
                onChange={handleChange}
                rows={4}
                className="w-full bg-[#0E2444] border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
                placeholder="Notes internes pour le professionnel..."
              />
              </div>
            </div>
          </div>
      </div>
    );
  };
          
  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#234876] to-[#162238] text-gray-100">
      {/* Header */}
      <header className="bg-[#162238]/90 backdrop-blur-lg border-b border-[#2A3F6C]/50 shadow-lg">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/pro/dashboard')}
              className="flex items-center gap-2 text-gray-300 hover:text-[#c5a572] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour
            </button>
            <div className="h-6 w-px bg-[#2A3F6C]"></div>
            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-[#c5a572]" />
                <Euro className="h-6 w-6 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#162238] rounded-full p-0.5" />
              </div>
              <span className="text-lg font-bold text-white">Francis</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Titre */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Nouveau client
            </h1>
            <p className="text-gray-300">
              Créez un nouveau profil client avec Francis
            </p>
          </div>



          {/* Assistant vocal */}
          {(
            <div className="mb-8 rounded-xl overflow-hidden border border-[#c5a572]/20 shadow-xl bg-gradient-to-br from-[#162238] to-[#1a2332]">
              <div className="bg-gradient-to-r from-[#0E2444] to-[#162238] p-6 border-b border-[#c5a572]/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#c5a572]/20 to-[#e8cfa0]/10 rounded-xl border border-[#c5a572]/30">
                      <Mic className="w-6 h-6 text-[#c5a572]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Assistant Francis</h3>
                      <p className="text-sm text-gray-300 mt-1">
                        Francis écoute votre entretien client et remplit automatiquement le profil en temps réel
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {hasSeenOnboarding && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowOnboarding(true);
                          setOnboardingStep(0);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-[#c5a572] transition-colors border border-[#c5a572]/20 rounded-lg hover:bg-[#c5a572]/10"
                        title="Revoir l'introduction Francis"
                      >
                        <Play className="w-4 h-4" />
                        Guide
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (!showVoiceInput) {
                          setAutoStartVoice(true);
                        }
                        setShowVoiceInput(!showVoiceInput);
                      }}
                      className={`inline-flex items-center gap-3 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                        showVoiceInput 
                          ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] hover:shadow-lg hover:shadow-[#c5a572]/40' 
                          : 'bg-[#1a2332] text-white hover:bg-[#223c63] border border-[#c5a572]/30 hover:border-[#c5a572]/50'
                      }`}
                    >
                    {showVoiceInput ? (
                      <>
                        <X className="w-4 h-4" />
                        Fermer l'assistant
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Activer Francis
                      </>
                    )}
                    </button>
                  </div>
                </div>
              </div>

              {showVoiceInput && (
                <div className="bg-gradient-to-br from-[#0E2444] to-[#162238] p-6 border-t border-[#c5a572]/20">
                    <div className="max-w-5xl mx-auto">
                    <div className="mb-6">
                        <UltraFluidVoiceRecorder
                          onTranscriptionUpdate={handleVoiceTranscription}
                          onTranscriptionComplete={handleFinalTranscription}
                          onError={handleVoiceError}
                          className="mb-0"
                          streamingMode={true}
                          realTimeMode={true}
                          autoStart={autoStartVoice}
                          onListeningChange={(isListening) => {
                            if (isListening && autoStartVoice) {
                              setAutoStartVoice(false); // Reset flag after auto-start
                            }
                          }}
                        />
                      </div>

                    <div className="bg-[#1a2332] rounded-xl border border-[#c5a572]/20 p-5 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#c5a572] animate-pulse"></div>
                            <span className="text-sm font-medium text-[#c5a572]">Assistant actif</span>
                          </div>
                          <div className="text-xs text-gray-400">• En écoute continue</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setTranscript('')}
                          className="text-xs text-gray-400 hover:text-[#c5a572] transition-colors px-3 py-1 rounded-lg hover:bg-[#c5a572]/10 border border-[#c5a572]/20"
                          >
                          Effacer
                          </button>
                        </div>
                      <div className="bg-[#0E2444] rounded-lg p-4 min-h-[120px] max-h-[250px] overflow-y-auto border border-[#c5a572]/20">
                        <p className="text-sm whitespace-pre-wrap text-gray-200 leading-relaxed">
                          {transcript || "Parlez maintenant pour que Francis commence à écouter..."}
                        </p>
                        </div>
                      
                      {transcript && (
                        <div className="mt-4 flex justify-center">
                          <button
                            type="button"
                            onClick={processTranscript}
                            disabled={isAIAnalyzing}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isAIAnalyzing ? (
                              <>
                                <div className="w-4 h-4 border-2 border-transparent border-t-[#162238] rounded-full animate-spin"></div>
                                Analyse en cours...
                              </>
                            ) : (
                              <>
                                <Brain className="w-4 h-4" />
                                Analyser avec Francis
                </>
              )}
                          </button>
            </div>
                      )}
                </div>
                </div>
                </div>
              )}
              
              {/* Résultats d'optimisation fiscale */}
              {optimizationResults && (
                <div className="mt-6 p-6 bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/10 rounded-xl border border-[#c5a572]/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-[#162238]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#c5a572]">
                      Analyse Francis - Optimisations & Leads Fiscaux
                    </h3>
                  </div>
                  
                  <div className="bg-[#0E2444] rounded-lg p-4 border border-[#c5a572]/20">
                    <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {isOptimizationAnalyzing ? (
                        <div className="flex items-center gap-2 text-[#c5a572]">
                          <div className="w-4 h-4 border-2 border-transparent border-t-[#c5a572] rounded-full animate-spin"></div>
                          <span>Francis analyse votre profil pour identifier les optimisations fiscales...</span>
                        </div>
                      ) : (
                        optimizationResults
                      )}
                    </div>
                  </div>
                  
                  {!isOptimizationAnalyzing && (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={analyzeOptimizationOpportunities}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-medium rounded-lg hover:shadow-lg transition-all duration-300 text-sm"
                      >
                        <Brain className="w-4 h-4" />
                        Nouvelle analyse
                      </button>
                    </div>
                  )}
                </div>
              )}
              
                </div>
          )}

          {/* Formulaire généraliste */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {renderFormByProfile()}
              
              {error && (
                <p className="text-sm text-red-400 mt-6 text-center py-2 px-4 bg-red-900/30 rounded-md border border-red-700">
                  {error}
                </p>
              )}
              
              <div className="pt-8 flex justify-end">
                <button type="submit" disabled={isLoading} className={buttonPrimaryStyles}>
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-transparent border-t-[#162238] rounded-full animate-spin mr-2"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Enregistrer le client
                    </>
                  )}
                </button>
              </div>
            </form>
        </div>
      </div>
      
      {/* Onboarding Overlay */}
      {renderOnboarding()}
    </div>
  );
}