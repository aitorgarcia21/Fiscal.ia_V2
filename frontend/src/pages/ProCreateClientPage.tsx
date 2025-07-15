import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { ClientProfile } from '../types/clientProfile';
import { ChevronLeft, Save, Brain, Mic, X, MessageSquare, Euro } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { UltraFluidVoiceRecorder } from '../components/UltraFluidVoiceRecorder';
import { ProfileSelector, ClientProfile as ProfileType } from '../components/ProfileSelector';
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
  const [formData, setFormData] = useState<ProCreateClientFormState>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);

  const handleProfileSelect = (profile: ProfileType) => {
    setSelectedProfile(profile);
  };

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
      // Ici on appellerait l'API pour analyser la transcription
      // et remplir automatiquement le formulaire
      console.log('Analyzing transcript:', transcript);
      
      // Simulation d'analyse
      setTimeout(() => {
        setIsAIAnalyzing(false);
        // Ici on mettrait à jour formData avec les résultats
      }, 2000);
    } catch (error) {
      setIsAIAnalyzing(false);
      console.error('Error analyzing transcript:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/pro/clients', formData);
      if (response.data.success) {
        navigate('/pro/dashboard');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la création du client');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormByProfile = () => {
    if (!selectedProfile) return null;

    switch (selectedProfile) {
      case 'particulier':
        return <ParticulierForm formData={formData} handleChange={handleChange} />;
      case 'professionnel':
        return <div className="text-center text-gray-300">Formulaire professionnel à venir</div>;
      case 'investisseur':
        return <div className="text-center text-gray-300">Formulaire investisseur à venir</div>;
      case 'entrepreneur':
        return <div className="text-center text-gray-300">Formulaire entrepreneur à venir</div>;
      default:
        return null;
    }
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

          {/* Sélecteur de profil */}
          {!selectedProfile && (
            <ProfileSelector 
              selectedProfile={selectedProfile} 
              onProfileSelect={handleProfileSelect} 
            />
          )}

          {/* Assistant vocal */}
          {selectedProfile && (
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
                        Parlez naturellement et Francis analysera votre discours pour remplir automatiquement le profil client
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowVoiceInput(!showVoiceInput)}
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
            </div>
          )}

          {/* Formulaire adaptatif */}
          {selectedProfile && (
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
          )}
        </div>
      </div>
    </div>
  );
}