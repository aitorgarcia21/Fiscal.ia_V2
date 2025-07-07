import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { ClientProfile } from '../types/clientProfile';
import { ArrowLeft, User, Home, Users as UsersIcon, Briefcase, BarChart3, Info, Edit3, Zap, RotateCw, FileText as FileTextLtr, CheckCircle, MessageSquare, Send as SendIcon, Bot as BotIcon, TrendingUp as TrendingUpIcon, Euro, Download, FileText, FileSpreadsheet } from 'lucide-react';

// TODO: Déplacer vers un fichier de types partagés si utilisé ailleurs
interface AnalysisResult {
  summary: string;
  recommendations: string[];
  actionPoints: string[];
}

// Interface pour les messages de Francis
interface FrancisMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  error?: boolean;
}

// Interface pour la réponse de l'analyse IRPP (doit correspondre à IRPPAnalysisResponse du backend)
interface IRPPAnalysisClientResponse {
    revenu_brut_global: number;
    revenu_net_imposable: number;
    nombre_parts: number;
    quotient_familial: number;
    impot_brut_calcule: number;
    decote_applicable?: number | null;
    impot_net_avant_credits: number;
    reductions_credits_impot?: Record<string, number> | null;
    impot_final_estime: number;
    taux_marginal_imposition: number;
    taux_moyen_imposition: number;
    notes_explicatives?: string[] | null;
}

export function ProClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Nouveaux états pour l'analyse IRPP 2025
  const [isIrppAnalyzing, setIsIrppAnalyzing] = useState(false);
  const [irppAnalysisResult, setIrppAnalysisResult] = useState<IRPPAnalysisClientResponse | null>(null);
  const [irppAnalysisError, setIrppAnalysisError] = useState<string | null>(null);

  // États pour le chat avec Francis
  const [francisQuery, setFrancisQuery] = useState('');
  const [francisConversation, setFrancisConversation] = useState<FrancisMessage[]>([]);
  const [isFrancisLoading, setIsFrancisLoading] = useState(false);
  const [francisChatError, setFrancisChatError] = useState<string | null>(null);
  const francisMessagesEndRef = useRef<HTMLDivElement>(null); // Pour le défilement automatique

  // États pour les exports
  const [isExporting, setIsExporting] = useState(false);

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

  // Réinitialiser le chat de Francis et les analyses si l'ID du client change
  useEffect(() => {
    setFrancisConversation([
      {
        role: 'assistant',
        content: `Bonjour ! Vous pouvez me poser des questions spécifiques concernant ${client?.prenom_client || 'ce client'} ${client?.nom_client || ''}. J'utiliserai son profil pour affiner mes réponses.`
      }
    ]);
    setFrancisQuery('');
    setFrancisChatError(null);
    setAnalysisResult(null); // Réinitialiser l'ancienne analyse aussi
    setIrppAnalysisResult(null); // Réinitialiser l'analyse IRPP
    setIrppAnalysisError(null);
  }, [clientId, client?.prenom_client, client?.nom_client]);

  useEffect(() => {
    francisMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [francisConversation]);

  const handleLaunchAnalysis = async () => {
    if (!client) return;
    setIsAnalyzing(true);
    setIrppAnalysisResult(null); // Cacher l'analyse IRPP si on lance l'autre
    setAnalysisResult(null);
    setError(null);
    setIrppAnalysisError(null);

    try {
      const result = await apiClient<AnalysisResult>(`/api/pro/clients/${clientId}/analyze`, { method: 'POST' });
      setAnalysisResult(result);
    } catch (err: any) {
      console.error("Erreur lors du lancement de l'analyse générale:", err);
      setError(err.data?.detail || err.message || 'Une erreur est survenue lors de l\'analyse générale.');
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLaunchIrppAnalysis = async () => {
    if (!client || !clientId) return;
    setIsIrppAnalyzing(true);
    setAnalysisResult(null); // Cacher l'ancienne analyse si on lance IRPP
    setIrppAnalysisResult(null);
    setIrppAnalysisError(null);
    setError(null);

    try {
      const result = await apiClient<IRPPAnalysisClientResponse>(`/api/pro/clients/${clientId}/analyze_irpp_2025`, { method: 'POST' });
      setIrppAnalysisResult(result);
    } catch (err: any) {
      console.error("Erreur lors du lancement de l'analyse IRPP 2025:", err);
      const errorMessage = err.data?.detail || err.message || 'Une erreur est survenue lors de l\'analyse IRPP 2025.';
      setIrppAnalysisError(errorMessage);
      setIrppAnalysisResult(null);
    } finally {
      setIsIrppAnalyzing(false);
    }
  };

  const handleAskFrancisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!francisQuery.trim() || !clientId) return;

    const userMessageContent = francisQuery;
    const newUserMessage: FrancisMessage = { role: 'user', content: userMessageContent };

    setFrancisConversation(prev => [...prev, newUserMessage]);
    setFrancisQuery('');
    setIsFrancisLoading(true);
    setFrancisChatError(null);

    // Préparer l'historique pour l'API (uniquement les messages précédents, pas le message actuel de l'utilisateur qui est dans `query`)
    const historyForApi = francisConversation.map(msg => ({ role: msg.role, content: msg.content }));

    try {
      const response = await apiClient<any>(`/api/pro/clients/${clientId}/ask_francis`, {
        method: 'POST',
        data: { 
          query: userMessageContent, 
          conversation_history: historyForApi 
        },
      });

      const assistantMessage: FrancisMessage = {
        role: 'assistant',
        content: response.answer || 'Je n\'ai pas pu traiter votre demande.',
        sources: response.sources || []
      };
      setFrancisConversation(prev => [...prev, assistantMessage]);

    } catch (err: any) {
      console.error("Erreur lors de la communication avec Francis:", err);
      const errorMessage = err.data?.detail || err.message || "Désolé, une erreur s'est produite avec Francis.";
      setFrancisChatError(errorMessage);
      setFrancisConversation(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage,
        error: true 
      }]);
    } finally {
      setIsFrancisLoading(false);
    }
  };

  // Fonctions d'export
  const handleExportPDF = async () => {
    if (!clientId) return;
    setIsExporting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pro/clients/${clientId}/export-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'export PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fiche_client_${clientId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export PDF:', error);
      setError('Erreur lors de l\'export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!clientId) return;
    setIsExporting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pro/clients/${clientId}/export-excel`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'export Excel');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fiche_client_${clientId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export Excel:', error);
      setError('Erreur lors de l\'export Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    if (!clientId) return;
    setIsExporting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pro/clients/${clientId}/export-csv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'export CSV');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fiche_client_${clientId}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export CSV:', error);
      setError('Erreur lors de l\'export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  // Fonctions d'export pour les analyses
  const handleExportAnalysisPDF = async () => {
    if (!clientId) return;
    setIsExporting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pro/clients/${clientId}/export-analysis-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'export de l\'analyse PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analyse_client_${clientId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export analyse PDF:', error);
      setError('Erreur lors de l\'export de l\'analyse PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportIrppPDF = async () => {
    if (!clientId) return;
    setIsExporting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pro/clients/${clientId}/export-irpp-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'export IRPP PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analyse_irpp_client_${clientId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export IRPP PDF:', error);
      setError('Erreur lors de l\'export IRPP PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const renderDetailSection = (title: string, icon: React.ElementType, details: Record<string, any>) => {
    const filteredDetails = Object.entries(details).filter(([_, value]) => value !== null && value !== undefined && value !== '' && (typeof value !== 'object' || (typeof value ==='object' && Object.keys(value).length > 0) ) );
    
    return (
      <section className="mb-6 p-6 bg-[#0E2444]/50 rounded-xl shadow-lg border border-[#2A3F6C]/40">
        <div className="flex items-center mb-4">
          {React.createElement(icon, { className: "w-7 h-7 text-[#88C0D0] mr-3 flex-shrink-0" })}
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        {filteredDetails.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Aucune information disponible pour cette section</p>
            <p className="text-gray-500 text-xs mt-1">Les données seront affichées une fois renseignées</p>
          </div>
        ) : (
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
        )}
      </section>
    );
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A192F] to-[#0D1F3A] text-white"><div className="w-10 h-10 border-4 border-dashed border-[#88C0D0] rounded-full animate-spin"></div><span className="ml-3 text-lg">Chargement des informations...</span></div>;
  if (error && !client && !analysisResult && !irppAnalysisResult) return <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0A192F] to-[#0D1F3A] text-red-400 p-8"><p className="text-xl mb-4">{error}</p><button onClick={() => navigate('/pro/dashboard')} className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] font-semibold rounded-lg shadow-md hover:scale-105 transition-all">Retour au Tableau de Bord</button></div>;
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
                disabled={isAnalyzing || isIrppAnalyzing}
                className="px-4 py-2 bg-gradient-to-r from-[#B48EAD] to-[#A3BE8C] text-[#0A192F] font-semibold rounded-lg shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? <RotateCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isAnalyzing ? 'Analyse en cours...' : 'Analyse Générale'}
              </button>
            <button 
                onClick={handleLaunchIrppAnalysis}
                disabled={isIrppAnalyzing || isAnalyzing}
                className="px-4 py-2 bg-gradient-to-r from-[#8FBCBB] to-[#88C0D0] text-[#0A192F] font-semibold rounded-lg shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isIrppAnalyzing ? <RotateCw className="w-4 h-4 animate-spin" /> : <TrendingUpIcon className="w-4 h-4" />}
                {isIrppAnalyzing ? 'Calcul IRPP en cours...' : 'Analyser IRPP 2025'}
              </button>
            
            {/* Boutons d'export */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-3 py-2 bg-gradient-to-r from-[#E53E3E] to-[#C53030] text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                title="Exporter en PDF"
              >
                {isExporting ? <RotateCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                PDF
              </button>
              <button 
                onClick={handleExportExcel}
                disabled={isExporting}
                className="px-3 py-2 bg-gradient-to-r from-[#38A169] to-[#2F855A] text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                title="Exporter en Excel"
              >
                {isExporting ? <RotateCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                Excel
              </button>
              <button 
                onClick={handleExportCSV}
                disabled={isExporting}
                className="px-3 py-2 bg-gradient-to-r from-[#3182CE] to-[#2C5282] text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                title="Exporter en CSV"
              >
                {isExporting ? <RotateCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                CSV
              </button>
            </div>
            
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
          {error && !analysisResult && !irppAnalysisResult && (
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
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center">
                  <FileTextLtr className="w-8 h-8 text-[#A3BE8C] mr-3 flex-shrink-0" />
                  <h2 className="text-2xl font-bold text-white">Résultats de l'Analyse Détaillée</h2>
                </div>
                <button 
                  onClick={handleExportAnalysisPDF}
                  disabled={isExporting}
                  className="px-3 py-2 bg-gradient-to-r from-[#E53E3E] to-[#C53030] text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Exporter l'analyse en PDF"
                >
                  {isExporting ? <RotateCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Exporter PDF
                </button>
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

          {isIrppAnalyzing && (
            <section className="mb-8 p-6 bg-[#0E2444]/70 rounded-xl shadow-xl border border-[#3E5F8A]/60 text-center">
              <div className="flex justify-center items-center mb-4">
                <RotateCw className="w-10 h-10 text-[#8FBCBB] animate-spin mr-3" />
                <h2 className="text-2xl font-semibold text-white">Calcul de l'IRPP 2025 en cours...</h2>
              </div>
              <p className="text-gray-400">Francis prépare une estimation de l'impôt sur le revenu pour 2025 pour ce client.</p>
            </section>
          )}
          {irppAnalysisError && !isIrppAnalyzing && (
             <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-center">
              <p>Erreur lors de l'analyse IRPP : {irppAnalysisError}</p>
            </div>
          )}
          {irppAnalysisResult && !isIrppAnalyzing && (
            <section className="mb-8 p-6 bg-gradient-to-br from-[#1C3A6D] to-[#122C4A] rounded-xl shadow-2xl border border-[#8FBCBB]/50">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center">
                  <TrendingUpIcon className="w-8 h-8 text-[#8FBCBB] mr-3 flex-shrink-0" />
                  <h2 className="text-2xl font-bold text-white">Résultats de l'Analyse IRPP 2025 (Estimation)</h2>
                </div>
                <button 
                  onClick={handleExportIrppPDF}
                  disabled={isExporting}
                  className="px-3 py-2 bg-gradient-to-r from-[#E53E3E] to-[#C53030] text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Exporter l'analyse IRPP en PDF"
                >
                  {isExporting ? <RotateCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Exporter PDF
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="p-3 bg-[#0A192F]/40 rounded-md"><span className="text-gray-400">Revenu Brut Global Estimé :</span> <span className="font-semibold text-white">{irppAnalysisResult.revenu_brut_global?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span></div>
                <div className="p-3 bg-[#0A192F]/40 rounded-md"><span className="text-gray-400">Revenu Net Imposable :</span> <span className="font-semibold text-white">{irppAnalysisResult.revenu_net_imposable?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span></div>
                <div className="p-3 bg-[#0A192F]/40 rounded-md"><span className="text-gray-400">Nombre de Parts Fiscales :</span> <span className="font-semibold text-white">{irppAnalysisResult.nombre_parts?.toFixed(2)}</span></div>
                <div className="p-3 bg-[#0A192F]/40 rounded-md"><span className="text-gray-400">Quotient Familial :</span> <span className="font-semibold text-white">{irppAnalysisResult.quotient_familial?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span></div>
                <div className="p-3 bg-[#0A192F]/40 rounded-md"><span className="text-gray-400">Impôt Brut Calculé :</span> <span className="font-semibold text-white">{irppAnalysisResult.impot_brut_calcule?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span></div>
                {irppAnalysisResult.decote_applicable != null && <div className="p-3 bg-[#0A192F]/40 rounded-md"><span className="text-gray-400">Décote Applicable :</span> <span className="font-semibold text-white">{irppAnalysisResult.decote_applicable?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span></div>}
                <div className="p-3 bg-[#0A192F]/40 rounded-md"><span className="text-gray-400">Impôt Net Avant RICI :</span> <span className="font-semibold text-white">{irppAnalysisResult.impot_net_avant_credits?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span></div>
                {irppAnalysisResult.reductions_credits_impot && Object.keys(irppAnalysisResult.reductions_credits_impot).length > 0 && (
                    <div className="md:col-span-2 p-3 bg-[#0A192F]/40 rounded-md">
                        <span className="text-gray-400 block mb-1">Réductions/Crédits d'Impôt Estimés :</span>
                        <ul className="list-disc list-inside pl-4">
                            {Object.entries(irppAnalysisResult.reductions_credits_impot).map(([key, value]) => (
                                <li key={key} className="text-white"><span className="capitalize">{key.replace(/_/g, ' ')}</span>: {value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="md:col-span-2 p-3 bg-gradient-to-r from-[#8FBCBB]/20 to-[#88C0D0]/20 rounded-md mt-2">
                    <span className="text-gray-300 text-lg">Impôt Final Estimé 2025 :</span> 
                    <span className="font-bold text-xl text-white ml-2">{irppAnalysisResult.impot_final_estime?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div className="p-3 bg-[#0A192F]/40 rounded-md"><span className="text-gray-400">Taux Marginal d'Imposition :</span> <span className="font-semibold text-white">{irppAnalysisResult.taux_marginal_imposition?.toFixed(2)}%</span></div>
                <div className="p-3 bg-[#0A192F]/40 rounded-md"><span className="text-gray-400">Taux Moyen d'Imposition :</span> <span className="font-semibold text-white">{irppAnalysisResult.taux_moyen_imposition?.toFixed(2)}%</span></div>
              </div>
              {irppAnalysisResult.notes_explicatives && irppAnalysisResult.notes_explicatives.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                  <h4 className="text-md font-semibold text-gray-300 mb-2">Notes et Avertissements :</h4>
                  <ul className="list-disc list-inside pl-4 space-y-1 text-xs text-gray-400">
                    {irppAnalysisResult.notes_explicatives.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
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

          {/* Section Chat avec Francis */}
          <section className="mt-8 mb-6 p-6 bg-[#0E2444]/70 rounded-xl shadow-xl border border-[#3E5F8A]/60">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-7 h-7 text-[#c5a572] mr-3 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Consulter Francis pour {client.prenom_client} {client.nom_client}</h2>
            </div>

            {/* Zone d'affichage des messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-[#0A192F]/50 rounded-md mb-4 border border-[#2A3F6C]/30">
              {francisConversation.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 sm:p-4 rounded-lg shadow-md ${
                      message.role === 'user'
                        ? 'bg-[#c5a572] text-[#1a2942] rounded-br-none'
                        : message.error ? 'bg-red-700/70 text-white rounded-bl-none' : 'bg-[#223c63]/90 text-white rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-7 h-7 bg-[#c5a572] rounded-full flex items-center justify-center relative border-2 border-[#0A192F]">
                          <MessageSquare className="w-4 h-4 text-[#1a2942]" />
                          <Euro className="w-2.5 h-2.5 text-[#1a2942] absolute -bottom-0.5 -right-0.5 bg-[#c5a572] rounded-full p-0.5" />
                        </div>
                      )}
                      <div className="flex-grow">
                        <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{message.content}</p>
                        {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/20">
                            <p className="text-xs text-gray-300 mb-1">Sources principales :</p>
                            <ul className="list-disc list-inside pl-1 space-y-0.5">
                              {message.sources.slice(0, 3).map((source, idx) => (
                                <li key={idx} className="text-xs text-gray-400 truncate" title={source}>{source}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-7 h-7 bg-[#0A192F] rounded-full flex items-center justify-center border-2 border-[#c5a572]">
                          <User className="w-4 h-4 text-[#c5a572]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isFrancisLoading && (
                <div className="flex justify-start p-3">
                    <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 w-7 h-7 bg-[#c5a572] rounded-full flex items-center justify-center relative border-2 border-[#0A192F]">
                            <MessageSquare className="w-4 h-4 text-[#1a2942]" />
                            <Euro className="w-2.5 h-2.5 text-[#1a2942] absolute -bottom-0.5 -right-0.5 bg-[#c5a572] rounded-full p-0.5" />
                        </div>
                        <div className="flex items-center space-x-1.5 bg-[#223c63]/90 p-3 rounded-lg rounded-bl-none shadow-md">
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
              )}
              <div ref={francisMessagesEndRef} />
            </div>

            {francisChatError && (
              <div className="my-2 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
                <p>Erreur Francis : {francisChatError}</p>
              </div>
            )}

            {/* Formulaire de saisie */}
            <form onSubmit={handleAskFrancisSubmit} className="mt-2">
              <div className="flex space-x-2">
                <textarea
                  value={francisQuery}
                  onChange={(e) => setFrancisQuery(e.target.value)}
                  placeholder={`Posez une question sur ${client.prenom_client} ${client.nom_client}... (ex: Quel serait l'impact d'un investissement Pinel ?)`}
                  className="flex-1 px-4 py-3 bg-[#0A192F]/50 border border-[#c5a572]/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors resize-none"
                  rows={2}
                  disabled={isFrancisLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskFrancisSubmit(e as any); // type assertion for event
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!francisQuery.trim() || isFrancisLoading}
                  className="bg-[#c5a572] text-[#0A192F] p-3 rounded-lg hover:bg-[#e8cfa0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md h-[fit-content] self-end"
                  aria-label="Envoyer le message à Francis" 
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </section>

        </div>
      </main>
    </div>
  );
} 