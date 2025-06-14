import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { ClientProfile } from '../types/clientProfile';
import { ArrowLeft, User, Home, Users as UsersIcon, Briefcase, BarChart3, Info, Edit3, Zap, RotateCw, FileText as FileTextLtr, CheckCircle } from 'lucide-react';

// TODO: Déplacer vers un fichier de types partagés si utilisé ailleurs
interface AnalysisResult {
  summary: string;
  recommendations: string[];
  actionPoints: string[];
}

export function ProClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!clientId) {
      setError("ID du client manquant.");
      setIsLoading(false);
      return;
    }

    const fetchClientDetails = async () => {
      setIsLoading(true);
      setError(null);
      setAnalysisResult(null);
      try {
        const response = await apiClient<ClientProfile>(`/api/pro/clients/${clientId}`, { method: 'GET' });
        setClient(response);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des détails du client:", err);
        setError(err.data?.detail || err.message || 'Erreur de chargement des détails du client.');
      }
      setIsLoading(false);
    };

    fetchClientDetails();
  }, [clientId]);

  const handleLaunchAnalysis = async () => {
    if (!client) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const result = await apiClient<AnalysisResult>(`/api/pro/clients/${clientId}/analyze`, { method: 'POST' });
      setAnalysisResult(result);
    } catch (err: any) {
      console.error("Erreur lors du lancement de l'analyse:", err);
      setError(err.data?.detail || err.message || 'Une erreur est survenue lors de l\'analyse.');
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderDetailSection = (title: string, icon: React.ElementType, details: Record<string, any>) => {
    const filteredDetails = Object.entries(details).filter(([_, value]) => value !== null && value !== undefined && value !== '' && (typeof value !== 'object' || (typeof value ==='object' && Object.keys(value).length > 0) ) );
    if (filteredDetails.length === 0) return null;

    return (
      <section className="mb-6 p-6 bg-[#0E2444]/50 rounded-xl shadow-lg border border-[#2A3F6C]/40">
        <div className="flex items-center mb-4">
          {React.createElement(icon, { className: "w-7 h-7 text-[#88C0D0] mr-3 flex-shrink-0" })}
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          {filteredDetails.map(([key, value]) => {
            let displayValue = value;
            if (typeof value === 'boolean') displayValue = value ? 'Oui' : 'Non';
            if (typeof value === 'object' && value !== null) {
                displayValue = (<pre className="text-xs bg-[#0A192F]/50 p-2 rounded-md overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>);
            } else if (key.toLowerCase().includes('date') && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                try {
                    displayValue = new Date(value).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
                } catch (e) { /* Gérer date invalide si nécessaire */ }
            } else if (typeof value === 'number') {
                displayValue = value.toLocaleString('fr-FR');
            }

            return (
              <div key={key} className="py-2 border-b border-[#2A3F6C]/20 last:border-b-0 md:border-b-0 md:[&:nth-child(2n)]:border-l md:[&:nth-child(2n)]:pl-3 md:[&:nth-child(2n-1)]:pr-3 md:border-b-[#2A3F6C]/20">
                <span className="block text-xs font-medium text-gray-400 capitalize mb-0.5">{key.replace(/_/g, ' ').replace(/client[12]?/g, '').replace(/json str/gi, '(JSON)').trim()}: </span>
                <span className="text-gray-200 whitespace-pre-wrap break-words">{String(displayValue)}</span>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A192F] to-[#0D1F3A] text-white"><div className="w-10 h-10 border-4 border-dashed border-[#88C0D0] rounded-full animate-spin"></div><span className="ml-3 text-lg">Chargement des informations...</span></div>;
  if (error && !client && !analysisResult) return <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0A192F] to-[#0D1F3A] text-red-400 p-8"><p className="text-xl mb-4">{error}</p><button onClick={() => navigate('/pro/dashboard')} className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] font-semibold rounded-lg shadow-md hover:scale-105 transition-all">Retour au Tableau de Bord</button></div>;
  if (!client) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A192F] to-[#0D1F3A] text-white">Client non trouvé.</div>;

  const identiteDetails = { civilite_client: client.civilite_client, nom_client: client.nom_client, prenom_client: client.prenom_client, nom_usage_client: client.nom_usage_client, date_naissance_client: client.date_naissance_client, lieu_naissance_client: client.lieu_naissance_client, nationalite_client: client.nationalite_client, numero_fiscal_client: client.numero_fiscal_client };
  const coordonneesDetails = { email_client: client.email_client, telephone_principal_client: client.telephone_principal_client, telephone_secondaire_client: client.telephone_secondaire_client, adresse_postale_client: client.adresse_postale_client, code_postal_client: client.code_postal_client, ville_client: client.ville_client, pays_residence_fiscale_client: client.pays_residence_fiscale_client };
  const situationFamilialeDetails = { situation_maritale_client: client.situation_maritale_client, date_mariage_pacs_client: client.date_mariage_pacs_client, regime_matrimonial_client: client.regime_matrimonial_client, nombre_enfants_a_charge_client: client.nombre_enfants_a_charge_client, details_enfants_client: client.details_enfants_client, personnes_dependantes_client: client.personnes_dependantes_client };
  const revenusDetails = { profession_client1: client.profession_client1, statut_professionnel_client1: client.statut_professionnel_client1, nom_employeur_entreprise_client1: client.nom_employeur_entreprise_client1, type_contrat_client1: client.type_contrat_client1, revenu_net_annuel_client1: client.revenu_net_annuel_client1, autres_revenus_client1: client.autres_revenus_client1, profession_client2: client.profession_client2, statut_professionnel_client2: client.statut_professionnel_client2, nom_employeur_entreprise_client2: client.nom_employeur_entreprise_client2, type_contrat_client2: client.type_contrat_client2, revenu_net_annuel_client2: client.revenu_net_annuel_client2, autres_revenus_client2: client.autres_revenus_client2, revenus_fonciers_annuels_bruts_foyer: client.revenus_fonciers_annuels_bruts_foyer, charges_foncieres_deductibles_foyer: client.charges_foncieres_deductibles_foyer, revenus_capitaux_mobiliers_foyer: client.revenus_capitaux_mobiliers_foyer, plus_values_mobilieres_foyer: client.plus_values_mobilieres_foyer, plus_values_immobilieres_foyer: client.plus_values_immobilieres_foyer, benefices_industriels_commerciaux_foyer: client.benefices_industriels_commerciaux_foyer, benefices_non_commerciaux_foyer: client.benefices_non_commerciaux_foyer, pensions_retraites_percues_foyer: client.pensions_retraites_percues_foyer, pensions_alimentaires_percues_foyer: client.pensions_alimentaires_percues_foyer, autres_revenus_foyer_details: client.autres_revenus_foyer_details };
  const patrimoineDetails = { residence_principale_details: client.residence_principale_details, residences_secondaires_details: client.residences_secondaires_details, investissements_locatifs_details: client.investissements_locatifs_details, autres_biens_immobiliers_details: client.autres_biens_immobiliers_details, comptes_courants_solde_total_estime: client.comptes_courants_solde_total_estime, livrets_epargne_details: client.livrets_epargne_details, assurance_vie_details: client.assurance_vie_details, pea_details: client.pea_details, compte_titres_valeur_estimee: client.compte_titres_valeur_estimee, epargne_retraite_details: client.epargne_retraite_details, autres_placements_financiers_details: client.autres_placements_financiers_details, valeur_entreprise_parts_sociales: client.valeur_entreprise_parts_sociales, comptes_courants_associes_solde: client.comptes_courants_associes_solde, vehicules_valeur_estimee: client.vehicules_valeur_estimee, objets_art_valeur_estimee: client.objets_art_valeur_estimee, credits_consommation_encours_total: client.credits_consommation_encours_total, autres_dettes_details: client.autres_dettes_details };
  const objectifsDetails = { objectifs_fiscaux_client: client.objectifs_fiscaux_client, objectifs_patrimoniaux_client: client.objectifs_patrimoniaux_client, horizon_placement_client: client.horizon_placement_client, profil_risque_investisseur_client: client.profil_risque_investisseur_client, notes_objectifs_projets_client: client.notes_objectifs_projets_client };
  const fiscaliteDetails = { dernier_avis_imposition_details: client.dernier_avis_imposition_details, tranche_marginale_imposition_estimee: client.tranche_marginale_imposition_estimee, credits_reductions_impot_recurrents: client.credits_reductions_impot_recurrents, ifi_concerne_client: client.ifi_concerne_client, notes_fiscales_client: client.notes_fiscales_client };
  const suiviProDetails = { statut_dossier_pro: client.statut_dossier_pro, prochain_rendez_vous_pro: client.prochain_rendez_vous_pro ? new Date(client.prochain_rendez_vous_pro).toLocaleString('fr-FR', {dateStyle: 'medium', timeStyle: 'short'}) : 'Non défini', notes_internes_pro: client.notes_internes_pro };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] to-[#0D1F3A] text-gray-100 flex flex-col font-sans">
      <header className="bg-[#0A192F]/95 backdrop-blur-lg border-b border-[#2A3F6C]/30 shadow-lg sticky top-0 z-40">
        <div className="h-20 max-w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/pro/dashboard')}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour Dashboard
          </button>
          <div className="text-xl font-semibold text-white truncate px-4">
            Client : {client.prenom_client} {client.nom_client}
          </div>
          <div className="flex items-center gap-3">
            <button 
                onClick={handleLaunchAnalysis}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-gradient-to-r from-[#B48EAD] to-[#A3BE8C] text-[#0A192F] font-semibold rounded-lg shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? <RotateCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isAnalyzing ? 'Analyse en cours...' : 'Lancer l\'Analyse'}
              </button>
            <button 
              onClick={() => navigate(`/pro/clients/${clientId}/edit`)}
              className="px-4 py-2 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] font-semibold rounded-lg shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <Edit3 className="w-4 h-4" />
              Modifier
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {error && !analysisResult && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-center">
              <p>{error}</p>
            </div>
          )}

          {isAnalyzing && (
            <section className="mb-8 p-6 bg-[#0E2444]/70 rounded-xl shadow-xl border border-[#3E5F8A]/60 text-center">
              <div className="flex justify-center items-center mb-4">
                <RotateCw className="w-10 h-10 text-[#88C0D0] animate-spin mr-3" />
                <h2 className="text-2xl font-semibold text-white">Analyse Patrimoniale & Fiscale en cours...</h2>
              </div>
              <p className="text-gray-400">Francis examine attentivement le profil de votre client pour identifier les meilleures stratégies d\'optimisation.</p>
            </section>
          )}

          {analysisResult && !isAnalyzing && (
            <section className="mb-8 p-6 bg-gradient-to-br from-[#15305D]/70 to-[#0E2444]/70 rounded-xl shadow-2xl border border-[#88C0D0]/50">
              <div className="flex items-center mb-5">
                <FileTextLtr className="w-8 h-8 text-[#A3BE8C] mr-3 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-white">Résultats de l'Analyse Détaillée</h2>
              </div>
              <div className="bg-[#0A192F]/50 p-4 rounded-md mb-6">
                <h3 className="text-lg font-semibold text-[#88C0D0] mb-2">Synthèse Globale :</h3>
                <p className="text-gray-200 whitespace-pre-line text-sm">{analysisResult.summary}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#88C0D0] mb-3">Pistes de Recommandations :</h3>
                <ul className="space-y-2 list-disc list-inside pl-2 text-sm">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-300">{rec}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#88C0D0] mb-3">Plan d'Action Suggéré :</h3>
                <ul className="space-y-2 list-disc list-inside pl-2 text-sm">
                  {analysisResult.actionPoints.map((act, index) => (
                    <li key={index} className="text-gray-300">{act}</li>
                  ))}
                </ul>
              </div>
               {error && (
                <div className="mt-6 p-3 bg-red-900/40 border border-red-700/60 rounded-md text-red-300 text-sm">
                  <p>Erreur pendant l'analyse : {error}</p>
                </div>
              )}
            </section>
          )}

          {renderDetailSection("Identité", User, identiteDetails)}
          {renderDetailSection("Coordonnées", Home, coordonneesDetails)}
          {renderDetailSection("Situation Familiale", UsersIcon, situationFamilialeDetails)}
          {renderDetailSection("Revenus & Situation Professionnelle", Briefcase, revenusDetails)}
          {renderDetailSection("Patrimoine", BarChart3, patrimoineDetails)}
          {renderDetailSection("Objectifs & Projets", Info, objectifsDetails)}
          {renderDetailSection("Informations Fiscales", FileTextLtr, fiscaliteDetails)}
          {renderDetailSection("Suivi Professionnel", Edit3, suiviProDetails)}

        </div>
      </main>
    </div>
  );
} 