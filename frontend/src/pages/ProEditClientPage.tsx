import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save, ArrowLeft, User as UserIconLucide, Home, Users as UsersGroupIcon, Calendar, Briefcase, 
  DollarSign, Target, FileText as FileTextIcon, Edit as EditIcon
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { ClientProfile } from '../types/clientProfile'; 

// Utiliser la même interface que ProCreateClientPage pour la cohérence du formulaire
// Mais tous les champs sont techniquement optionnels pour une mise à jour partielle,
// bien que le formulaire les affichera tous.
interface ClientEditFormData {
  civilite_client?: string;
  nom_client?: string; // Requis par la logique de soumission mais optionnel pour le type de mise à jour
  prenom_client?: string; // Idem
  nom_usage_client?: string;
  date_naissance_client?: string; 
  lieu_naissance_client?: string;
  nationalite_client?: string;
  numero_fiscal_client?: string;
  adresse_postale_client?: string;
  code_postal_client?: string;
  ville_client?: string;
  pays_residence_fiscale_client?: string;
  email_client?: string;
  telephone_principal_client?: string;
  telephone_secondaire_client?: string;
  situation_maritale_client?: string;
  date_mariage_pacs_client?: string; 
  regime_matrimonial_client?: string;
  nombre_enfants_a_charge_client?: number;
  details_enfants_client_json_str?: string; 
  personnes_dependantes_client?: string;
  profession_client1?: string;
  statut_professionnel_client1?: string;
  nom_employeur_entreprise_client1?: string;
  type_contrat_client1?: string;
  revenu_net_annuel_client1?: string; 
  autres_revenus_client1_json_str?: string;
  profession_client2?: string;
  statut_professionnel_client2?: string;
  nom_employeur_entreprise_client2?: string;
  type_contrat_client2?: string;
  revenu_net_annuel_client2?: string;
  autres_revenus_client2_json_str?: string;
  revenus_fonciers_annuels_bruts_foyer?: string;
  charges_foncieres_deductibles_foyer?: string;
  revenus_capitaux_mobiliers_foyer?: string;
  plus_values_mobilieres_foyer?: string;
  plus_values_immobilieres_foyer?: string;
  benefices_industriels_commerciaux_foyer?: string;
  benefices_non_commerciaux_foyer?: string;
  pensions_retraites_percues_foyer?: string;
  pensions_alimentaires_percues_foyer?: string;
  autres_revenus_foyer_details?: string;
  residence_principale_details_json_str?: string;
  residences_secondaires_details_json_str?: string;
  investissements_locatifs_details_json_str?: string;
  autres_biens_immobiliers_details_json_str?: string;
  comptes_courants_solde_total_estime?: string;
  livrets_epargne_details_json_str?: string;
  assurance_vie_details_json_str?: string;
  pea_details_json_str?: string;
  compte_titres_valeur_estimee?: string;
  epargne_retraite_details_json_str?: string;
  autres_placements_financiers_details?: string;
  valeur_entreprise_parts_sociales?: string;
  comptes_courants_associes_solde?: string;
  vehicules_valeur_estimee?: string;
  objets_art_valeur_estimee?: string;
  credits_consommation_encours_total?: string;
  autres_dettes_details?: string;
  objectifs_fiscaux_client?: string;
  objectifs_patrimoniaux_client?: string;
  horizon_placement_client?: string;
  profil_risque_investisseur_client?: string;
  notes_objectifs_projets_client?: string;
  dernier_avis_imposition_details_json_str?: string;
  tranche_marginale_imposition_estimee?: string;
  credits_reductions_impot_recurrents?: string;
  ifi_concerne_client?: string;
  notes_fiscales_client?: string;
  statut_dossier_pro?: string;
  prochain_rendez_vous_pro?: string; 
  notes_internes_pro?: string;
}

// Helper pour convertir une valeur en chaîne pour les textareas JSON, ou une chaîne vide
const toJsonStringForForm = (value: any, defaultIfEmpty: string = '{}'): string => {
  if (value === null || value === undefined) return defaultIfEmpty;
  try {
    if (typeof value === 'string') {
        // Essayer de parser pour voir si c'est un JSON valide, sinon retourner la chaîne telle quelle
        // Cela peut être utile si le backend renvoie parfois du JSON déjà stringifié dans des champs non JSONB
        JSON.parse(value);
        return value; // Déjà une chaîne JSON valide
    }
    return JSON.stringify(value, null, 2);
  } catch (e) {
    return typeof value === 'string' ? value : defaultIfEmpty;
  }
};

const defaultJsonArrayString = '[]';
const defaultJsonObjectString = '{}';

export function ProEditClientPage() {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<ClientEditFormData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setError("ID du client manquant pour la modification.");
      setInitialLoading(false);
      return;
    }
    const fetchClientData = async () => {
      setInitialLoading(true);
      try {
        const clientData = await apiClient<ClientProfile>(`/api/pro/clients/${clientId}`, { method: 'GET' });
        
        setFormData({
          civilite_client: clientData.civilite_client || 'M.',
          nom_client: clientData.nom_client || '',
          prenom_client: clientData.prenom_client || '',
          nom_usage_client: clientData.nom_usage_client || '',
          date_naissance_client: clientData.date_naissance_client ? new Date(clientData.date_naissance_client).toISOString().split('T')[0] : '',
          lieu_naissance_client: clientData.lieu_naissance_client || '',
          nationalite_client: clientData.nationalite_client || 'Française',
          numero_fiscal_client: clientData.numero_fiscal_client || '',
          adresse_postale_client: clientData.adresse_postale_client || '',
          code_postal_client: clientData.code_postal_client || '',
          ville_client: clientData.ville_client || '',
          pays_residence_fiscale_client: clientData.pays_residence_fiscale_client || 'France',
          email_client: clientData.email_client || '',
          telephone_principal_client: clientData.telephone_principal_client || '',
          telephone_secondaire_client: clientData.telephone_secondaire_client || '',
          situation_maritale_client: clientData.situation_maritale_client || 'Célibataire',
          date_mariage_pacs_client: clientData.date_mariage_pacs_client ? new Date(clientData.date_mariage_pacs_client).toISOString().split('T')[0] : '',
          regime_matrimonial_client: clientData.regime_matrimonial_client || '',
          nombre_enfants_a_charge_client: clientData.nombre_enfants_a_charge_client === null ? 0 : Number(clientData.nombre_enfants_a_charge_client),
          details_enfants_client_json_str: toJsonStringForForm(clientData.details_enfants_client, defaultJsonArrayString),
          personnes_dependantes_client: clientData.personnes_dependantes_client || '',
          profession_client1: clientData.profession_client1 || '',
          statut_professionnel_client1: clientData.statut_professionnel_client1 || '',
          nom_employeur_entreprise_client1: clientData.nom_employeur_entreprise_client1 || '',
          type_contrat_client1: clientData.type_contrat_client1 || '',
          revenu_net_annuel_client1: clientData.revenu_net_annuel_client1?.toString() || '',
          autres_revenus_client1_json_str: toJsonStringForForm(clientData.autres_revenus_client1, defaultJsonArrayString),
          profession_client2: clientData.profession_client2 || '',
          statut_professionnel_client2: clientData.statut_professionnel_client2 || '',
          nom_employeur_entreprise_client2: clientData.nom_employeur_entreprise_client2 || '',
          type_contrat_client2: clientData.type_contrat_client2 || '',
          revenu_net_annuel_client2: clientData.revenu_net_annuel_client2?.toString() || '',
          autres_revenus_client2_json_str: toJsonStringForForm(clientData.autres_revenus_client2, defaultJsonArrayString),
          revenus_fonciers_annuels_bruts_foyer: clientData.revenus_fonciers_annuels_bruts_foyer?.toString() || '',
          charges_foncieres_deductibles_foyer: clientData.charges_foncieres_deductibles_foyer?.toString() || '',
          revenus_capitaux_mobiliers_foyer: clientData.revenus_capitaux_mobiliers_foyer?.toString() || '',
          plus_values_mobilieres_foyer: clientData.plus_values_mobilieres_foyer?.toString() || '',
          plus_values_immobilieres_foyer: clientData.plus_values_immobilieres_foyer?.toString() || '',
          benefices_industriels_commerciaux_foyer: clientData.benefices_industriels_commerciaux_foyer?.toString() || '',
          benefices_non_commerciaux_foyer: clientData.benefices_non_commerciaux_foyer?.toString() || '',
          pensions_retraites_percues_foyer: clientData.pensions_retraites_percues_foyer?.toString() || '',
          pensions_alimentaires_percues_foyer: clientData.pensions_alimentaires_percues_foyer?.toString() || '',
          autres_revenus_foyer_details: clientData.autres_revenus_foyer_details || '',
          residence_principale_details_json_str: toJsonStringForForm(clientData.residence_principale_details, defaultJsonObjectString),
          residences_secondaires_details_json_str: toJsonStringForForm(clientData.residences_secondaires_details, defaultJsonArrayString),
          investissements_locatifs_details_json_str: toJsonStringForForm(clientData.investissements_locatifs_details, defaultJsonArrayString),
          autres_biens_immobiliers_details_json_str: toJsonStringForForm(clientData.autres_biens_immobiliers_details, defaultJsonArrayString),
          comptes_courants_solde_total_estime: clientData.comptes_courants_solde_total_estime?.toString() || '',
          livrets_epargne_details_json_str: toJsonStringForForm(clientData.livrets_epargne_details, defaultJsonObjectString),
          assurance_vie_details_json_str: toJsonStringForForm(clientData.assurance_vie_details, defaultJsonArrayString),
          pea_details_json_str: toJsonStringForForm(clientData.pea_details, defaultJsonObjectString),
          compte_titres_valeur_estimee: clientData.compte_titres_valeur_estimee?.toString() || '',
          epargne_retraite_details_json_str: toJsonStringForForm(clientData.epargne_retraite_details, defaultJsonArrayString),
          autres_placements_financiers_details: clientData.autres_placements_financiers_details || '',
          valeur_entreprise_parts_sociales: clientData.valeur_entreprise_parts_sociales?.toString() || '',
          comptes_courants_associes_solde: clientData.comptes_courants_associes_solde?.toString() || '',
          vehicules_valeur_estimee: clientData.vehicules_valeur_estimee?.toString() || '',
          objets_art_valeur_estimee: clientData.objets_art_valeur_estimee?.toString() || '',
          credits_consommation_encours_total: clientData.credits_consommation_encours_total?.toString() || '',
          autres_dettes_details: clientData.autres_dettes_details || '',
          objectifs_fiscaux_client: clientData.objectifs_fiscaux_client || '',
          objectifs_patrimoniaux_client: clientData.objectifs_patrimoniaux_client || '',
          horizon_placement_client: clientData.horizon_placement_client || 'Moyen terme',
          profil_risque_investisseur_client: clientData.profil_risque_investisseur_client || 'Équilibré',
          notes_objectifs_projets_client: clientData.notes_objectifs_projets_client || '',
          dernier_avis_imposition_details_json_str: toJsonStringForForm(clientData.dernier_avis_imposition_details, defaultJsonObjectString),
          tranche_marginale_imposition_estimee: clientData.tranche_marginale_imposition_estimee?.toString() || '',
          credits_reductions_impot_recurrents: clientData.credits_reductions_impot_recurrents || '',
          ifi_concerne_client: clientData.ifi_concerne_client || 'Non précisé',
          notes_fiscales_client: clientData.notes_fiscales_client || '',
          statut_dossier_pro: clientData.statut_dossier_pro || 'Actif',
          prochain_rendez_vous_pro: clientData.prochain_rendez_vous_pro ? new Date(clientData.prochain_rendez_vous_pro).toISOString().substring(0, 16) : '', // Format YYYY-MM-DDTHH:mm
          notes_internes_pro: clientData.notes_internes_pro || '',
        });
      } catch (err: any) {
        console.error("Erreur chargement données client pour édition:", err);
        setError(err.data?.detail || err.message || "Erreur lors du chargement des données du client.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchClientData();
  }, [clientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | undefined | null = value;
    if (type === 'number') {
      processedValue = value === '' ? null : parseInt(value, 10);
    } else if ((type === 'date' || name.includes('date')) && name !== 'prochain_rendez_vous_pro' ) {
        processedValue = value; 
    } else if (type === 'datetime-local' || name === 'prochain_rendez_vous_pro') {
        processedValue = value; 
    }
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!formData.nom_client || !formData.prenom_client) {
      setError("Le nom et le prénom du client sont obligatoires.");
      setIsSaving(false);
      return;
    }

    const payload: { [key: string]: any } = {};
    for (const key in formData) {
      const typedKey = key as keyof ClientEditFormData;
      let value = formData[typedKey];

      if (key.startsWith('revenu_') || 
          key.startsWith('charges_') || 
          key.startsWith('plus_values_') || 
          key.startsWith('benefices_') || 
          key.startsWith('pensions_') || 
          key.includes('_solde_') || 
          key.includes('_valeur_') || 
          key.includes('_montant_') || 
          key.includes('_total') || 
          key === 'tranche_marginale_imposition_estimee') {
        if (value === '' || value === null) value = null; 
        else value = String(value); // Garder en string pour parseFloat plus tard si besoin
      }

      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '' && !typedKey.endsWith('_json_str'))) {
        if (!(typeof value === 'string' && value.trim() === '' && typedKey.endsWith('_json_str'))) {
          payload[typedKey] = null; 
          continue;
        }
      }

      if (typedKey.endsWith('_json_str')) {
        const originalKey = typedKey.replace('_json_str', '');
        try {
          if (typeof value === 'string' && value.trim() !== '') {
            payload[originalKey] = JSON.parse(value);
          } else {
            payload[originalKey] = (originalKey.includes('details') && !originalKey.startsWith('residence_principale') && !originalKey.startsWith('pea') && !originalKey.startsWith('livrets') && !originalKey.startsWith('dernier_avis')) || originalKey.includes('secondaires') || originalKey.includes('locatifs') || originalKey.includes('autres_biens') || originalKey.includes('assurance_vie') || originalKey.includes('epargne_retraite') ? [] : {};
          }
        } catch (jsonError) {
          setError(`Format JSON incorrect pour ${originalKey.replace(/_/g, ' ')}.`);
          setIsSaving(false);
          return;
        }
      } else if (key === 'nombre_enfants_a_charge_client') {
        payload[typedKey] = Number(value) >= 0 ? Number(value) : 0;
      } else if (key.startsWith('revenu_') || key.startsWith('charges_') || key.startsWith('plus_values_') || key.startsWith('benefices_') || key.startsWith('pensions_') || key.includes('_solde_') || key.includes('_valeur_') || key.includes('_montant_') || key.includes('_total') || key === 'tranche_marginale_imposition_estimee') {
        if (value === null || value === '') {
            payload[typedKey] = null;
        } else {
            const numValue = parseFloat(String(value).replace(',', '.'));
            payload[typedKey] = isNaN(numValue) ? null : numValue;
        }
      } else {
        payload[typedKey] = value;
      }
    }

    try {
      console.log("Envoi du payload pour MàJ:", payload);
      await apiClient<ClientProfile>(`/api/pro/clients/${clientId}`, { 
        method: 'PUT', 
        data: payload 
      });
      alert('Client mis à jour avec succès !'); 
      navigate(`/pro/clients/${clientId}`);
    } catch (err: any) {
      console.error("Erreur détaillée MàJ client:", err.response?.data || err.message || err);
      setError(err.data?.detail || err.message || 'Une erreur est survenue lors de la mise à jour.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Styles Tailwind constants (identiques à ProCreateClientPage)
  const inputStyles = "w-full px-4 py-2.5 bg-[#0d1b2a]/80 border border-[#2A3F6C]/60 rounded-lg text-gray-200 focus:ring-1 focus:ring-[#c5a572] focus:border-[#c5a572] transition-colors placeholder-gray-500 disabled:opacity-50";
  const textAreaStyles = `${inputStyles} min-h-[100px] max-h-[300px] resize-y`;
  const labelStyles = "block text-sm font-medium text-gray-300 mb-1";
  const sectionHeaderStyles = "text-xl font-semibold text-white";
  const sectionSubHeaderStyles = "text-lg font-medium text-gray-200 mt-2 mb-1";
  const sectionStyles = "space-y-4 border-b border-[#2A3F6C]/30 pb-6 mb-6";
  const gridStyles = "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4";
  const buttonPrimaryStyles = "px-8 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl shadow-lg hover:shadow-[#c5a572]/30 hover:scale-105 transition-all duration-300 flex items-center gap-2 text-base disabled:opacity-70 disabled:cursor-not-allowed";

  // Le JSX complet du formulaire sera la prochaine étape.
  if (initialLoading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#101d30] to-[#0b1421] text-white">Chargement des données du client...</div>;
  if (error && !Object.keys(formData).length) return <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#101d30] to-[#0b1421] text-red-400 p-8"><p>{error}</p><button onClick={() => navigate('/pro/dashboard')} className="mt-4 px-4 py-2 bg-[#c5a572] text-[#162238] rounded-lg">Retour</button></div>;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#101d30] to-[#0b1421] text-gray-100 flex flex-col font-sans">
      <header className="bg-[#0d1b2a]/90 backdrop-blur-md border-b border-[#2A3F6C]/30 shadow-lg sticky top-0 z-40">
        <div className="h-20 max-w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate(clientId ? `/pro/clients/${clientId}` : '/pro/dashboard')}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour {clientId ? 'aux détails' : 'au tableau de bord'}
          </button>
          <div className="text-xl font-semibold text-white">Modifier le Client: {formData.prenom_client} {formData.nom_client}</div>
          <div className="w-auto sm:w-48"></div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto bg-[#162238]/70 border border-[#2A3F6C]/40 rounded-xl shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-center text-gray-300 text-lg">La logique pour charger et modifier tous les champs du formulaire est prête.</p>
            <p className="text-center text-gray-400 text-sm mt-2">Le JSX détaillé du formulaire sera ajouté ensuite.</p>
            {error && <p className="text-red-400 text-center mt-4">Erreur: {error}</p>}
            <div className="pt-6 flex justify-end">
              <button type="submit" disabled={isSaving} className={buttonPrimaryStyles}>
                {isSaving ? (
                  <><div className="w-5 h-5 border-2 border-transparent border-t-[#162238] rounded-full animate-spin mr-2"></div>Sauvegarde...</>
                ) : (
                  <><Save className="w-5 h-5 mr-2" />Enregistrer les Modifications (Logique Prête)</>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 