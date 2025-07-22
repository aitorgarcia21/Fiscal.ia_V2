import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { ClientProfile } from '../types/clientProfile';
import { ChevronLeft, Save, Brain, Mic, X, MessageSquare, Euro, User, Mail, Users, Briefcase, Target, Play, ArrowRight, Check, TrendingUp } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { UltraSimpleLiveRecorder } from '../components/UltraSimpleLiveRecorder';
import { useVoiceFiller } from '../hooks/useVoiceFiller';
import { ProfileStatusPanel } from '../components/ProfileStatusPanel';
import { clientDataEncryption } from '../utils/ClientDataEncryption';

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
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
    setOnboardingStep(0);
    localStorage.setItem('francis-onboarding-seen', 'true');
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

  // 🎤 FRANCIS TRANSCRIPTION & AUTO-FILLING
  const [currentTranscription, setCurrentTranscription] = useState<string>('');
  const [transcriptionHistory, setTranscriptionHistory] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  const { profile: voiceProfile, suggestions: voiceSuggestions, handleTranscript } = useVoiceFiller({});

  const handleTranscriptionUpdate = useCallback((text: string) => {
    setCurrentTranscription(text);
    // Traitement en temps réel pour extraction d'entités
    handleTranscript(text);
  }, [handleTranscript]);

  const handleTranscriptionComplete = useCallback((finalText: string) => {
    if (finalText.trim()) {
      setTranscriptionHistory(prev => [...prev, finalText]);
      // Traitement final pour extraction d'entités
      handleTranscript(finalText);
      setCurrentTranscription('');
    }
  }, [handleTranscript]);

  const handleVoiceError = useCallback((error: string) => {
    console.error('Erreur transcription Francis:', error);
    setError(`Erreur transcription: ${error}`);
  }, []);

  // 🤖 FRANCIS: Synchronisation profil vocal → formulaire ULTRA-RÉACTIVE
  useEffect(() => {
    console.log('🔄 Francis Sync Check:', { 
      voiceProfileExists: !!voiceProfile, 
      voiceProfileKeys: Object.keys(voiceProfile || {}),
      voiceProfileContent: voiceProfile 
    });
    
    if (voiceProfile && Object.keys(voiceProfile).length > 0) {
      console.log('🚀 FRANCIS REMPLISSAGE AUTO-FORMULAIRE !', voiceProfile);
      
      setFormData(prev => {
        const updated = { ...prev };
        let changesApplied: string[] = [];
        
        // 🎯 MAPPING ULTRA-INTELLIGENT des champs du profil vocal vers le formulaire
        if (voiceProfile.nom_client && voiceProfile.nom_client.trim()) {
          updated.nom_client = voiceProfile.nom_client.trim();
          changesApplied.push(`nom: ${voiceProfile.nom_client}`);
        }
        
        if (voiceProfile.prenom_client && voiceProfile.prenom_client.trim()) {
          updated.prenom_client = voiceProfile.prenom_client.trim();
          changesApplied.push(`prénom: ${voiceProfile.prenom_client}`);
        }
        
        if (voiceProfile.email_client && voiceProfile.email_client.trim()) {
          updated.email_client = voiceProfile.email_client.trim();
          changesApplied.push(`email: ${voiceProfile.email_client}`);
        }
        
        if (voiceProfile.numero_fiscal_client && voiceProfile.numero_fiscal_client.trim()) {
          updated.numero_fiscal_client = voiceProfile.numero_fiscal_client.trim();
          changesApplied.push(`numéro fiscal: ${voiceProfile.numero_fiscal_client}`);
        }
        
        // 💒 SITUATION MARITALE - MAPPING INTELLIGENT
        if (voiceProfile.situation_maritale_client && voiceProfile.situation_maritale_client.trim()) {
          const situationValue = voiceProfile.situation_maritale_client.trim();
          updated.situation_maritale_client = situationValue;
          changesApplied.push(`situation: ${situationValue}`);
        }
        
        if (voiceProfile.regime_matrimonial_client && voiceProfile.regime_matrimonial_client.trim()) {
          updated.regime_matrimonial_client = voiceProfile.regime_matrimonial_client.trim();
          changesApplied.push(`régime: ${voiceProfile.regime_matrimonial_client}`);
        }
        
        // 👶 ENFANTS - CONVERSION INTELLIGENTE
        if (voiceProfile.nombre_enfants_a_charge_client !== undefined && voiceProfile.nombre_enfants_a_charge_client !== null) {
          const enfantsValue = Number(voiceProfile.nombre_enfants_a_charge_client);
          if (!isNaN(enfantsValue) && enfantsValue >= 0) {
            updated.nombre_enfants_a_charge_client = enfantsValue.toString();
            changesApplied.push(`enfants: ${enfantsValue}`);
          }
        }
        
        // 💰 REVENUS - CONVERSION INTELLIGENTE
        if (voiceProfile.revenu_net_annuel_client1 !== undefined && voiceProfile.revenu_net_annuel_client1 !== null) {
          const revenuValue = Number(voiceProfile.revenu_net_annuel_client1);
          if (!isNaN(revenuValue) && revenuValue > 0) {
            updated.revenu_net_annuel_client1 = revenuValue.toString();
            changesApplied.push(`revenu: ${revenuValue}€`);
          }
        }
        
        // 💼 PROFESSION
        if (voiceProfile.profession_client1 && voiceProfile.profession_client1.trim()) {
          updated.profession_client1 = voiceProfile.profession_client1.trim();
          changesApplied.push(`profession: ${voiceProfile.profession_client1}`);
        }
        
        // 📞 TÉLÉPHONE
        if (voiceProfile.telephone_principal_client && voiceProfile.telephone_principal_client.trim()) {
          updated.telephone_principal_client = voiceProfile.telephone_principal_client.trim();
          changesApplied.push(`téléphone: ${voiceProfile.telephone_principal_client}`);
        }
        
        // 🏠 ADRESSE
        if (voiceProfile.adresse_postale_client && voiceProfile.adresse_postale_client.trim()) {
          updated.adresse_postale_client = voiceProfile.adresse_postale_client.trim();
          changesApplied.push(`adresse: ${voiceProfile.adresse_postale_client}`);
        }
        
        if (changesApplied.length > 0) {
          console.log('✅ FRANCIS A REMPLI AUTOMATIQUEMENT:', changesApplied);
          console.log('📋 FORMULAIRE MIS À JOUR:', updated);
        } else {
          console.log('⚠️ FRANCIS: Aucun champ valide trouvé à remplir');
        }
        
        return updated;
      });
    } else {
      console.log('🔍 Francis: Pas de données de profil vocal à synchroniser');
    }
  }, [voiceProfile]);

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
      title: "ÉTAPE 1 : Bienvenue dans Francis !",
      description: "Découvrez comment Francis peut révolutionner votre création de profils clients grâce à l'intelligence artificielle.",
      icon: <Brain className="w-8 h-8 text-[#c5a572]" />,
      highlight: null
    },
    {
      title: 'ÉTAPE 2 : Transcription vocale intelligente',
      description: 'Francis écoute et transcrit votre entretien avec le client en temps réel. Parlez naturellement pendant votre rendez-vous.',
      icon: <Mic className="w-6 h-6 text-[#c5a572]" />,
      highlight: "voice-input"
    },
    {
      title: 'ÉTAPE 3 : Création du profil complet',
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
    handleTranscript(text);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 🔒 CHIFFREMENT MILITAIRE AES-256 DES DONNÉES SENSIBLES
      console.log('🔒 Chiffrement des données client avec AES-256...');
      const encryptedFormData = clientDataEncryption.encryptClientData(formData);
      
      // Log des données masquées pour debug (sans exposer les vraies données)
      const maskedData = clientDataEncryption.maskSensitiveData(formData);
      console.log('📊 Données masquées pour debug:', maskedData);
      
      // Envoi des données chiffrées vers l'API
      const response = await apiClient('/pro/clients', { data: encryptedFormData });
      
      if (response && (response as any).success) {
        console.log('✅ Client créé avec succès - données protégées par chiffrement AES-256');
        navigate('/pro/dashboard');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la création du client:', error);
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
                      Activer l'assistant
                    </>
                  )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Voice Input UI - This will expand when showVoiceInput is true */}
            {showVoiceInput && (
              <div className="p-6 space-y-6">
                {/* Step-by-Step Interview Progress */}
                <div className="bg-gradient-to-r from-[#0E2444] to-[#162238] rounded-xl p-6 border border-[#c5a572]/30">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                      <h4 className="text-[#c5a572] font-bold text-lg">🎤 Francis - Copilote Actif</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-[#c5a572] font-semibold">Étape 2/6</div>
                      <div className="text-gray-400 text-sm">Situation familiale</div>
                    </div>
                  </div>
                  
                  {/* Progress Steps */}
                  <div className="grid grid-cols-6 gap-2 mb-6">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">✓</div>
                      <span className="text-xs text-green-400 mt-1">Identité</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-[#c5a572] rounded-full flex items-center justify-center text-white text-sm font-bold animate-pulse">2</div>
                      <span className="text-xs text-[#c5a572] mt-1">Famille</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-sm font-bold">3</div>
                      <span className="text-xs text-gray-400 mt-1">Revenus</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-sm font-bold">4</div>
                      <span className="text-xs text-gray-400 mt-1">Patrimoine</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-sm font-bold">5</div>
                      <span className="text-xs text-gray-400 mt-1">Objectifs</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-sm font-bold">📊</div>
                      <span className="text-xs text-gray-400 mt-1">Synthèse</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Status Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Live Field Filling */}
                  <div className="bg-[#0E2444] rounded-xl p-5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <h5 className="text-green-400 font-semibold text-sm">✅ Rempli automatiquement</h5>
                    </div>
                    <div className="space-y-2 text-sm">
                      {formData.nom_client && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Nom :</span>
                          <span className="text-green-400 font-medium">{formData.prenom_client} {formData.nom_client}</span>
                        </div>
                      )}
                      {formData.situation_maritale_client && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Situation :</span>
                          <span className="text-green-400 font-medium">{formData.situation_maritale_client}</span>
                        </div>
                      )}
                      {formData.nombre_enfants_a_charge_client && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Enfants :</span>
                          <span className="text-green-400 font-medium">{formData.nombre_enfants_a_charge_client}</span>
                        </div>
                      )}
                      {formData.profession_client1 && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Profession :</span>
                          <span className="text-green-400 font-medium">{formData.profession_client1}</span>
                        </div>
                      )}
                      {!formData.nom_client && !formData.situation_maritale_client && !formData.nombre_enfants_a_charge_client && (
                        <div className="text-gray-400 text-center py-2 italic text-xs">
                          En attente de transcription...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Missing Critical Info */}
                  <div className="bg-[#0E2444] rounded-xl p-5 border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                      <h5 className="text-orange-400 font-semibold text-sm">⚠️ Informations manquantes</h5>
                    </div>
                    <div className="space-y-2 text-sm">
                      {!formData.date_naissance_client && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span className="text-gray-300">Date de naissance</span>
                        </div>
                      )}
                      {!formData.details_enfants_client_json_str && formData.nombre_enfants_a_charge_client && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span className="text-gray-300">Âge des enfants</span>
                        </div>
                      )}
                      {!formData.regime_matrimonial_client && formData.situation_maritale_client === 'Marié(e)' && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span className="text-gray-300">Régime matrimonial</span>
                        </div>
                      )}
                      {!formData.email_client && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-gray-300">Email</span>
                        </div>
                      )}
                      {!formData.telephone_principal_client && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-gray-300">Téléphone</span>
                        </div>
                      )}
                      {!formData.profession_client1 && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span className="text-gray-300">Profession</span>
                        </div>
                      )}
                      {/* Si aucune info manquante */}
                      {formData.date_naissance_client && formData.email_client && formData.telephone_principal_client && formData.profession_client1 && (formData.situation_maritale_client !== 'Marié(e)' || formData.regime_matrimonial_client) && (
                        <div className="text-green-400 text-center py-2 italic text-xs">
                          ✓ Profil complet pour cette étape
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Smart Suggestions */}
                  <div className="bg-[#0E2444] rounded-xl p-5 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                      <h5 className="text-blue-400 font-semibold text-sm">💡 Suggestions Francis</h5>
                    </div>
                    <div className="space-y-2 text-xs text-gray-300">
                      {!formData.details_enfants_client_json_str && formData.nombre_enfants_a_charge_client && (
                        <p>"Demandez l'âge des enfants pour calculer les réductions d'impôts"</p>
                      )}
                      {!formData.regime_matrimonial_client && formData.situation_maritale_client === 'Marié(e)' && (
                        <p>"Explorez le régime matrimonial pour optimiser la fiscalité"</p>
                      )}
                      {!formData.date_naissance_client && (
                        <p>"La date de naissance est essentielle pour les calculs fiscaux"</p>
                      )}
                      {!formData.profession_client1 && (
                        <p>"Identifiez la profession pour les optimisations spécifiques"</p>
                      )}
                      {formData.profession_client1 && formData.profession_client1.toLowerCase().includes('libéral') && (
                        <p>"Profession libérale : explorez PERP et loi Madelin"</p>
                      )}
                      {formData.nombre_enfants_a_charge_client && parseInt(formData.nombre_enfants_a_charge_client) >= 3 && (
                        <p>"Famille nombreuse : quotient familial avantageux"</p>
                      )}
                      {/* Suggestions par défaut si aucune spécifique */}
                      {!formData.nombre_enfants_a_charge_client && !formData.situation_maritale_client && !formData.profession_client1 && (
                        <div className="text-gray-400 text-center py-2 italic">
                          En attente d'informations pour générer des suggestions...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Transcription */}
                <div className="bg-[#0E2444] rounded-xl p-5 border border-[#c5a572]/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Mic className="w-5 h-5 text-[#c5a572]" />
                    <h5 className="text-[#c5a572] font-semibold">🎤 Transcription en temps réel</h5>
                  </div>
                  <div className="bg-[#162238] rounded-lg p-4 border border-[#c5a572]/10">
                    {/* 🎤 VRAIE TRANSCRIPTION LIVE */}
                    {isListening ? (
                      <div className="space-y-3">
                        {/* 🔥 TRANSCRIPTION LIVE QUI FONCTIONNE VRAIMENT */}
                        <div className="text-center mb-4">
                          <p className="text-lg font-medium text-green-400 mb-2">
                            FRANCIS ÉCOUTE EN TEMPS RÉEL
                          </p>
                          <p className="text-sm text-gray-300">
                            Le texte apparaît instantanément pendant que vous parlez
                          </p>
                        </div>
                        
                        {/* Historique des transcriptions complétées */}
                        {transcriptionHistory.length > 0 && (
                          <div className="bg-[#0A192F] rounded-xl p-4 border border-[#c5a572]/10 mb-4">
                            <div className="text-[#c5a572] text-sm font-medium mb-3 flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#c5a572] rounded-full"></div>
                              Transcriptions complétées ({transcriptionHistory.length})
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {transcriptionHistory.slice(-5).map((text, index) => (
                                <div key={index} className="bg-[#162238] rounded-lg p-3 border border-[#c5a572]/5">
                                  <p className="text-gray-300 text-sm">"{text}"</p>
                                  <div className="text-xs text-gray-500 mt-1 text-right">
                                    #{transcriptionHistory.length - transcriptionHistory.slice(-5).length + index + 1}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#c5a572]/10">
                          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`}></div>
                          <span className={`text-xs font-medium ${isListening ? 'text-green-400' : 'text-blue-400'}`}>
                            {isListening ? 'Francis analyse et remplit automatiquement' : 'Francis prêt à écouter et analyser'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-center py-4 italic text-sm">
                        🎤 Francis prêt à écouter
                        <br />
                        <span className="text-xs">Cliquez sur "Activer l'assistant" pour commencer</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Step Guidance */}
                <div className="bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/5 rounded-xl p-5 border border-[#c5a572]/30">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-[#c5a572]" />
                    <h5 className="text-[#c5a572] font-semibold">🎯 Prochaine étape recommandée</h5>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    "Parfait ! Maintenant explorons la situation professionnelle et les revenus pour identifier les optimisations fiscales possibles."
                  </p>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#c5a572] text-[#162238] rounded-lg font-medium text-sm hover:bg-[#e8cfa0] transition-colors">
                    <TrendingUp className="w-4 h-4" />
                    Passer à l'étape 3 : Revenus
                  </button>
                </div>
                
                {/* 🎤 COMPOSANT TRANSCRIPTION FRANCIS */}
                <div className="bg-[#0E2444] rounded-xl p-5 border border-[#c5a572]/20">

                  <UltraSimpleLiveRecorder
                    onTranscription={(text, isFinal) => {
                      console.log('🎤 TRANSCRIPTION REÇUE:', text, isFinal ? 'FINAL' : 'LIVE');
                      if (isFinal) {
                        handleTranscriptionComplete(text);
                      } else {
                        handleTranscriptionUpdate(text);
                      }
                    }}
                    onError={handleVoiceError}
                    autoStart={autoStartVoice}
                    className="w-full"
                  />
                  
                  {/* Suggestions vocales */}
                  {voiceSuggestions.length > 0 && (
                    <div className="mt-4 p-3 bg-[#162238] rounded-lg border border-orange-500/20">
                      <div className="text-orange-400 text-xs font-medium mb-2">⚠️ Suggestions Francis :</div>
                      <ul className="space-y-1">
                        {voiceSuggestions.map((suggestion, index) => (
                          <li key={index} className="text-gray-300 text-xs flex items-center gap-2">
                            <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form wrapper */}
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