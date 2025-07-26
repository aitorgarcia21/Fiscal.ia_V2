import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save, ArrowLeft, User as UserIconLucide, Home, Users as UsersGroupIcon, Calendar, Briefcase, 
  DollarSign, Target, FileText as FileTextIcon, Edit as EditIcon
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { ClientProfile } from '../types/clientProfile';
import { StepperVertical } from '../components/ui/StepperVertical'; 
import { ErrorHandler } from '../utils/errorHandler';

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
        ErrorHandler.handle(err, { logInDev: true, silent: false });
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
      ErrorHandler.handle(err, { logInDev: true, silent: false });
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
  const sectionContainerStyles = "pt-6 space-y-6 bg-[#0E2444]/40 p-6 rounded-xl shadow-lg border border-[#2A3F6C]/50";
  const firstSectionStyles = "space-y-6 bg-[#0E2444]/40 p-6 rounded-xl shadow-lg border border-[#2A3F6C]/50";
  const gridStyles = "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4";
  const buttonPrimaryStyles = "px-8 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl shadow-lg hover:shadow-[#c5a572]/30 hover:scale-105 transition-all duration-300 flex items-center gap-2 text-base disabled:opacity-70 disabled:cursor-not-allowed";

  // Le JSX complet du formulaire sera la prochaine étape.
  if (initialLoading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#101d30] to-[#0b1421] text-white">Chargement des données du client...</div>;
  if (error && !Object.keys(formData).length) return <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#101d30] to-[#0b1421] text-red-400 p-8"><p>{error}</p><button onClick={() => navigate('/pro/dashboard')} className="mt-4 px-4 py-2 bg-[#c5a572] text-[#162238] rounded-lg">Retour</button></div>;
  
  // Définition des étapes du stepper
  const steps = [
    { id: 'identite', label: 'Identité' },
    { id: 'coordonnees', label: 'Coordonnées' },
    { id: 'famille', label: 'Situation familiale' },
    { id: 'revenus', label: 'Revenus' },
    { id: 'patrimoine', label: 'Patrimoine' },
    { id: 'objectifs', label: 'Objectifs' },
    { id: 'fiscal', label: 'Fiscalité' },
    { id: 'suivi', label: 'Suivi pro' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] to-[#0D1F3A] text-gray-100 font-sans antialiased scroll-smooth">
      <header className="bg-[#0D1F3A]/90 backdrop-blur-md border-b border-[#2A3F6C]/30 shadow-lg sticky top-0 z-40">
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
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto lg:flex gap-8">
          <StepperVertical steps={steps} />
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-8">
              <section id="identite" className={firstSectionStyles}>
                <div className="flex items-center"><UserIconLucide className="w-7 h-7 text-[#c5a572] mr-3" /><h2 className={sectionHeaderStyles}>Identité</h2></div>
                <div className={gridStyles}>
                  <div><label htmlFor="civilite_client" className={labelStyles}>Civilité</label><select id="civilite_client" name="civilite_client" value={formData.civilite_client} onChange={handleChange} className={inputStyles}><option value="M.">M.</option><option value="Mme">Mme</option><option value="Mlle">Mlle</option></select></div>
                  <div></div> 
                  <div><label htmlFor="nom_client" className={labelStyles}>Nom *</label><input id="nom_client" type="text" name="nom_client" value={formData.nom_client} onChange={handleChange} required className={inputStyles} /></div>
                  <div><label htmlFor="prenom_client" className={labelStyles}>Prénom *</label><input id="prenom_client" type="text" name="prenom_client" value={formData.prenom_client} onChange={handleChange} required className={inputStyles} /></div>
                  <div><label htmlFor="nom_usage_client" className={labelStyles}>Nom d'usage</label><input id="nom_usage_client" type="text" name="nom_usage_client" value={formData.nom_usage_client} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="date_naissance_client" className={labelStyles}>Date de Naissance</label><input id="date_naissance_client" type="date" name="date_naissance_client" value={formData.date_naissance_client} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="lieu_naissance_client" className={labelStyles}>Lieu de Naissance</label><input id="lieu_naissance_client" type="text" name="lieu_naissance_client" value={formData.lieu_naissance_client} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="nationalite_client" className={labelStyles}>Nationalité</label><input id="nationalite_client" type="text" name="nationalite_client" value={formData.nationalite_client} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="numero_fiscal_client" className={labelStyles}>N° Fiscal</label><input id="numero_fiscal_client" type="text" name="numero_fiscal_client" value={formData.numero_fiscal_client} onChange={handleChange} className={inputStyles} /></div>
                </div>
              </section>

              <section id="coordonnees" className={sectionContainerStyles}>
                <div className="flex items-center"><Home className="w-7 h-7 text-[#c5a572] mr-3" /><h2 className={sectionHeaderStyles}>Coordonnées</h2></div>
                <div className={gridStyles}>
                  <div><label htmlFor="email_client" className={labelStyles}>Email</label><input id="email_client" type="email" name="email_client" value={formData.email_client} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="telephone_principal_client" className={labelStyles}>Téléphone Principal</label><input id="telephone_principal_client" type="tel" name="telephone_principal_client" value={formData.telephone_principal_client} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="telephone_secondaire_client" className={labelStyles}>Téléphone Secondaire</label><input id="telephone_secondaire_client" type="tel" name="telephone_secondaire_client" value={formData.telephone_secondaire_client} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="pays_residence_fiscale_client" className={labelStyles}>Pays de Résidence Fiscale</label><input id="pays_residence_fiscale_client" type="text" name="pays_residence_fiscale_client" value={formData.pays_residence_fiscale_client} onChange={handleChange} className={inputStyles} /></div>
                </div>
                <div><label htmlFor="adresse_postale_client" className={labelStyles}>Adresse Postale</label><input id="adresse_postale_client" type="text" name="adresse_postale_client" value={formData.adresse_postale_client} onChange={handleChange} className={inputStyles} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                  <div><label htmlFor="code_postal_client" className={labelStyles}>Code Postal</label><input id="code_postal_client" type="text" name="code_postal_client" value={formData.code_postal_client} onChange={handleChange} className={inputStyles} /></div>
                  <div className="sm:col-span-2"><label htmlFor="ville_client" className={labelStyles}>Ville</label><input id="ville_client" type="text" name="ville_client" value={formData.ville_client} onChange={handleChange} className={inputStyles} /></div>
                </div>
              </section>

              <section id="famille" className={sectionContainerStyles}>
                <div className="flex items-center"><UsersGroupIcon className="w-7 h-7 text-[#c5a572] mr-3" /><h2 className={sectionHeaderStyles}>Situation Familiale</h2></div>
                <div className={gridStyles}>
                  <div><label htmlFor="situation_maritale_client" className={labelStyles}>Situation Maritale</label><select id="situation_maritale_client" name="situation_maritale_client" value={formData.situation_maritale_client} onChange={handleChange} className={inputStyles}><option value="Célibataire">Célibataire</option><option value="Marié(e)">Marié(e)</option><option value="Pacsé(e)">Pacsé(e)</option><option value="Divorcé(e)">Divorcé(e)</option><option value="Veuf(ve)">Veuf(ve)</option></select></div>
                  <div><label htmlFor="date_mariage_pacs_client" className={labelStyles}>Date Mariage/PACS</label><input id="date_mariage_pacs_client" type="date" name="date_mariage_pacs_client" value={formData.date_mariage_pacs_client} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="regime_matrimonial_client" className={labelStyles}>Régime Matrimonial</label><input id="regime_matrimonial_client" type="text" name="regime_matrimonial_client" value={formData.regime_matrimonial_client} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="nombre_enfants_a_charge_client" className={labelStyles}>Nombre d'enfants à charge</label><input id="nombre_enfants_a_charge_client" type="number" name="nombre_enfants_a_charge_client" value={formData.nombre_enfants_a_charge_client} onChange={handleChange} min="0" className={inputStyles} /></div>
                </div>
                <div><label htmlFor="details_enfants_client_json_str" className={labelStyles}>Détails Enfants (Format JSON Array)</label><textarea id="details_enfants_client_json_str" name="details_enfants_client_json_str" value={formData.details_enfants_client_json_str} onChange={handleChange} className={textAreaStyles} placeholder='[{"prenom": "Leo", "date_naissance": "2010-05-20"}]'></textarea></div>
                <div><label htmlFor="personnes_dependantes_client" className={labelStyles}>Autres personnes dépendantes</label><textarea id="personnes_dependantes_client" name="personnes_dependantes_client" value={formData.personnes_dependantes_client} onChange={handleChange} className={textAreaStyles}></textarea></div>
              </section>

              <section id="revenus" className={sectionContainerStyles}>
                <div className="flex items-center"><Briefcase className="w-7 h-7 text-[#c5a572] mr-3" /><h2 className={sectionHeaderStyles}>Situation Professionnelle & Revenus</h2></div>
                <h3 className={sectionSubHeaderStyles}>Client Principal</h3>
                <div className={gridStyles}>
                  <div><label htmlFor="profession_client1" className={labelStyles}>Profession</label><input id="profession_client1" type="text" name="profession_client1" value={formData.profession_client1} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="statut_professionnel_client1" className={labelStyles}>Statut Pro</label><input id="statut_professionnel_client1" type="text" name="statut_professionnel_client1" value={formData.statut_professionnel_client1} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="nom_employeur_entreprise_client1" className={labelStyles}>Employeur/Entreprise</label><input id="nom_employeur_entreprise_client1" type="text" name="nom_employeur_entreprise_client1" value={formData.nom_employeur_entreprise_client1} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="type_contrat_client1" className={labelStyles}>Type Contrat</label><input id="type_contrat_client1" type="text" name="type_contrat_client1" value={formData.type_contrat_client1} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="revenu_net_annuel_client1" className={labelStyles}>Revenu Net Annuel</label><input id="revenu_net_annuel_client1" type="text" name="revenu_net_annuel_client1" value={formData.revenu_net_annuel_client1} onChange={handleChange} placeholder="Ex: 50000.00" className={inputStyles} /></div>
                </div>
                <div><label htmlFor="autres_revenus_client1_json_str" className={labelStyles}>Autres Revenus Client 1 (JSON Array)</label><textarea id="autres_revenus_client1_json_str" name="autres_revenus_client1_json_str" value={formData.autres_revenus_client1_json_str} onChange={handleChange} className={textAreaStyles} placeholder='[{"type": "Dividendes", "montant_annuel": 5000}]'></textarea></div>
                
                <h3 className={sectionSubHeaderStyles}>Conjoint / Client 2 (si applicable)</h3>
                <div className={gridStyles}>
                  <div><label htmlFor="profession_client2" className={labelStyles}>Profession</label><input id="profession_client2" type="text" name="profession_client2" value={formData.profession_client2} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="statut_professionnel_client2" className={labelStyles}>Statut Pro</label><input id="statut_professionnel_client2" type="text" name="statut_professionnel_client2" value={formData.statut_professionnel_client2} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="revenu_net_annuel_client2" className={labelStyles}>Revenu Net Annuel</label><input id="revenu_net_annuel_client2" type="text" name="revenu_net_annuel_client2" value={formData.revenu_net_annuel_client2} onChange={handleChange} placeholder="Ex: 45000.00" className={inputStyles} /></div>
                </div>
                <div><label htmlFor="autres_revenus_client2_json_str" className={labelStyles}>Autres Revenus Client 2 (JSON Array)</label><textarea id="autres_revenus_client2_json_str" name="autres_revenus_client2_json_str" value={formData.autres_revenus_client2_json_str} onChange={handleChange} className={textAreaStyles} placeholder='[{"type": "BIC", "montant_annuel": 12000}]'></textarea></div>

                <h3 className={sectionSubHeaderStyles}>Revenus Communs du Foyer</h3>
                <div className={gridStyles}>
                  <div><label htmlFor="revenus_fonciers_annuels_bruts_foyer" className={labelStyles}>R. Fonciers Bruts</label><input id="revenus_fonciers_annuels_bruts_foyer" type="text" name="revenus_fonciers_annuels_bruts_foyer" value={formData.revenus_fonciers_annuels_bruts_foyer} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="charges_foncieres_deductibles_foyer" className={labelStyles}>Charges Foncières Déductibles</label><input id="charges_foncieres_deductibles_foyer" type="text" name="charges_foncieres_deductibles_foyer" value={formData.charges_foncieres_deductibles_foyer} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="revenus_capitaux_mobiliers_foyer" className={labelStyles}>RCM (Dividendes, Intérêts)</label><input id="revenus_capitaux_mobiliers_foyer" type="text" name="revenus_capitaux_mobiliers_foyer" value={formData.revenus_capitaux_mobiliers_foyer} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="plus_values_mobilieres_foyer" className={labelStyles}>Plus-Values Mobilières</label><input id="plus_values_mobilieres_foyer" type="text" name="plus_values_mobilieres_foyer" value={formData.plus_values_mobilieres_foyer} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="plus_values_immobilieres_foyer" className={labelStyles}>Plus-Values Immobilières</label><input id="plus_values_immobilieres_foyer" type="text" name="plus_values_immobilieres_foyer" value={formData.plus_values_immobilieres_foyer} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="benefices_industriels_commerciaux_foyer" className={labelStyles}>BIC</label><input id="benefices_industriels_commerciaux_foyer" type="text" name="benefices_industriels_commerciaux_foyer" value={formData.benefices_industriels_commerciaux_foyer} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="benefices_non_commerciaux_foyer" className={labelStyles}>BNC</label><input id="benefices_non_commerciaux_foyer" type="text" name="benefices_non_commerciaux_foyer" value={formData.benefices_non_commerciaux_foyer} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="pensions_retraites_percues_foyer" className={labelStyles}>Pensions/Retraites Reçues</label><input id="pensions_retraites_percues_foyer" type="text" name="pensions_retraites_percues_foyer" value={formData.pensions_retraites_percues_foyer} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="pensions_alimentaires_percues_foyer" className={labelStyles}>Pensions Alimentaires Reçues</label><input id="pensions_alimentaires_percues_foyer" type="text" name="pensions_alimentaires_percues_foyer" value={formData.pensions_alimentaires_percues_foyer} onChange={handleChange} className={inputStyles} /></div>
                </div>
                <div><label htmlFor="autres_revenus_foyer_details" className={labelStyles}>Autres Revenus du Foyer (Détails)</label><textarea id="autres_revenus_foyer_details" name="autres_revenus_foyer_details" value={formData.autres_revenus_foyer_details} onChange={handleChange} className={textAreaStyles}></textarea></div>
              </section>

              <section id="patrimoine" className={sectionContainerStyles}>
                <div className="flex items-center"><DollarSign className="w-7 h-7 text-[#c5a572] mr-3" /><h2 className={sectionHeaderStyles}>Patrimoine</h2></div>
                <h3 className={sectionSubHeaderStyles}>Immobilier</h3>
                <div><label htmlFor="residence_principale_details_json_str" className={labelStyles}>Résidence Principale (JSON Object)</label><textarea id="residence_principale_details_json_str" name="residence_principale_details_json_str" value={formData.residence_principale_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='{"valeur_estimee": 350000, "adresse": "123 rue de la Paix", "type": "Appartement"}'></textarea></div>
                <div><label htmlFor="residences_secondaires_details_json_str" className={labelStyles}>Résidences Secondaires (JSON Array)</label><textarea id="residences_secondaires_details_json_str" name="residences_secondaires_details_json_str" value={formData.residences_secondaires_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='[{"valeur_estimee": 200000, "adresse": "456 plage", "type": "Maison"}]'></textarea></div>
                <div><label htmlFor="investissements_locatifs_details_json_str" className={labelStyles}>Investissements Locatifs (JSON Array)</label><textarea id="investissements_locatifs_details_json_str" name="investissements_locatifs_details_json_str" value={formData.investissements_locatifs_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='[{"valeur_estimee": 180000, "revenus_annuels": 12000, "type": "Appartement"}]'></textarea></div>
                <div><label htmlFor="autres_biens_immobiliers_details_json_str" className={labelStyles}>Autres Biens Immobiliers (JSON Array)</label><textarea id="autres_biens_immobiliers_details_json_str" name="autres_biens_immobiliers_details_json_str" value={formData.autres_biens_immobiliers_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='[{"valeur_estimee": 50000, "type": "Terrain"}]'></textarea></div>
                
                <h3 className={sectionSubHeaderStyles}>Placements Financiers</h3>
                <div className={gridStyles}>
                  <div><label htmlFor="comptes_courants_solde_total_estime" className={labelStyles}>Comptes Courants</label><input id="comptes_courants_solde_total_estime" type="text" name="comptes_courants_solde_total_estime" value={formData.comptes_courants_solde_total_estime} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="compte_titres_valeur_estimee" className={labelStyles}>Compte Titres</label><input id="compte_titres_valeur_estimee" type="text" name="compte_titres_valeur_estimee" value={formData.compte_titres_valeur_estimee} onChange={handleChange} className={inputStyles} /></div>
                </div>
                <div><label htmlFor="livrets_epargne_details_json_str" className={labelStyles}>Livrets d'Épargne (JSON Object)</label><textarea id="livrets_epargne_details_json_str" name="livrets_epargne_details_json_str" value={formData.livrets_epargne_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='{"livret_a": 15000, "ldds": 8000, "lepel": 12000}'></textarea></div>
                <div><label htmlFor="assurance_vie_details_json_str" className={labelStyles}>Assurance Vie (JSON Array)</label><textarea id="assurance_vie_details_json_str" name="assurance_vie_details_json_str" value={formData.assurance_vie_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='[{"contrat": "AXA", "valeur": 50000, "date_ouverture": "2015-03-15"}]'></textarea></div>
                <div><label htmlFor="pea_details_json_str" className={labelStyles}>PEA (JSON Object)</label><textarea id="pea_details_json_str" name="pea_details_json_str" value={formData.pea_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='{"valeur_totale": 25000, "date_ouverture": "2018-06-20"}'></textarea></div>
                <div><label htmlFor="epargne_retraite_details_json_str" className={labelStyles}>Épargne Retraite (JSON Array)</label><textarea id="epargne_retraite_details_json_str" name="epargne_retraite_details_json_str" value={formData.epargne_retraite_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='[{"type": "PER", "valeur": 30000, "versements_annuels": 5000}]'></textarea></div>
                <div><label htmlFor="autres_placements_financiers_details" className={labelStyles}>Autres Placements Financiers</label><textarea id="autres_placements_financiers_details" name="autres_placements_financiers_details" value={formData.autres_placements_financiers_details} onChange={handleChange} className={textAreaStyles}></textarea></div>
                
                <h3 className={sectionSubHeaderStyles}>Autres Actifs</h3>
                <div className={gridStyles}>
                  <div><label htmlFor="valeur_entreprise_parts_sociales" className={labelStyles}>Parts Sociales Entreprise</label><input id="valeur_entreprise_parts_sociales" type="text" name="valeur_entreprise_parts_sociales" value={formData.valeur_entreprise_parts_sociales} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="comptes_courants_associes_solde" className={labelStyles}>Comptes Courants Associés</label><input id="comptes_courants_associes_solde" type="text" name="comptes_courants_associes_solde" value={formData.comptes_courants_associes_solde} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="vehicules_valeur_estimee" className={labelStyles}>Véhicules</label><input id="vehicules_valeur_estimee" type="text" name="vehicules_valeur_estimee" value={formData.vehicules_valeur_estimee} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="objets_art_valeur_estimee" className={labelStyles}>Objets d'Art</label><input id="objets_art_valeur_estimee" type="text" name="objets_art_valeur_estimee" value={formData.objets_art_valeur_estimee} onChange={handleChange} className={inputStyles} /></div>
                </div>
                
                <h3 className={sectionSubHeaderStyles}>Dettes</h3>
                <div className={gridStyles}>
                  <div><label htmlFor="credits_consommation_encours_total" className={labelStyles}>Crédits Consommation</label><input id="credits_consommation_encours_total" type="text" name="credits_consommation_encours_total" value={formData.credits_consommation_encours_total} onChange={handleChange} className={inputStyles} /></div>
                </div>
                <div><label htmlFor="autres_dettes_details" className={labelStyles}>Autres Dettes</label><textarea id="autres_dettes_details" name="autres_dettes_details" value={formData.autres_dettes_details} onChange={handleChange} className={textAreaStyles}></textarea></div>
              </section>

              <section id="objectifs" className={sectionContainerStyles}>
                <div className="flex items-center"><Target className="w-7 h-7 text-[#c5a572] mr-3" /><h2 className={sectionHeaderStyles}>Objectifs & Projets</h2></div>
                <div><label htmlFor="objectifs_fiscaux_client" className={labelStyles}>Objectifs Fiscaux</label><textarea id="objectifs_fiscaux_client" name="objectifs_fiscaux_client" value={formData.objectifs_fiscaux_client} onChange={handleChange} className={textAreaStyles} placeholder="Ex: Réduire IRPP, préparer transmission..."></textarea></div>
                <div><label htmlFor="objectifs_patrimoniaux_client" className={labelStyles}>Objectifs Patrimoniaux</label><textarea id="objectifs_patrimoniaux_client" name="objectifs_patrimoniaux_client" value={formData.objectifs_patrimoniaux_client} onChange={handleChange} className={textAreaStyles} placeholder="Ex: Achat RP, épargne retraite..."></textarea></div>
                <div className={gridStyles}>
                  <div><label htmlFor="horizon_placement_client" className={labelStyles}>Horizon de Placement</label><select id="horizon_placement_client" name="horizon_placement_client" value={formData.horizon_placement_client} onChange={handleChange} className={inputStyles}><option value="Court terme">Court terme</option><option value="Moyen terme">Moyen terme</option><option value="Long terme">Long terme</option></select></div>
                  <div><label htmlFor="profil_risque_investisseur_client" className={labelStyles}>Profil de Risque</label><select id="profil_risque_investisseur_client" name="profil_risque_investisseur_client" value={formData.profil_risque_investisseur_client} onChange={handleChange} className={inputStyles}><option value="Prudent">Prudent</option><option value="Équilibré">Équilibré</option><option value="Dynamique">Dynamique</option></select></div>
                </div>
                <div><label htmlFor="notes_objectifs_projets_client" className={labelStyles}>Notes sur Objectifs/Projets</label><textarea id="notes_objectifs_projets_client" name="notes_objectifs_projets_client" value={formData.notes_objectifs_projets_client} onChange={handleChange} className={textAreaStyles}></textarea></div>
              </section>

              <section id="fiscal" className={sectionContainerStyles}>
                <div className="flex items-center"><FileTextIcon className="w-7 h-7 text-[#c5a572] mr-3" /><h2 className={sectionHeaderStyles}>Fiscalité</h2></div>
                <div><label htmlFor="dernier_avis_imposition_details_json_str" className={labelStyles}>Dernier Avis d'Imposition (JSON Object)</label><textarea id="dernier_avis_imposition_details_json_str" name="dernier_avis_imposition_details_json_str" value={formData.dernier_avis_imposition_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='{"annee_revenus": 2023, "revenu_fiscal_reference": 60000, "montant_impot_net": 5000}'></textarea></div>
                <div className={gridStyles}>
                  <div><label htmlFor="tranche_marginale_imposition_estimee" className={labelStyles}>Tranche Marginale Estimée</label><input id="tranche_marginale_imposition_estimee" type="text" name="tranche_marginale_imposition_estimee" value={formData.tranche_marginale_imposition_estimee} onChange={handleChange} className={inputStyles} /></div>
                  <div><label htmlFor="ifi_concerne_client" className={labelStyles}>Concerné par l'IFI</label><select id="ifi_concerne_client" name="ifi_concerne_client" value={formData.ifi_concerne_client} onChange={handleChange} className={inputStyles}><option value="Non précisé">Non précisé</option><option value="Oui">Oui</option><option value="Non">Non</option></select></div>
                </div>
                <div><label htmlFor="credits_reductions_impot_recurrents" className={labelStyles}>Crédits/Réductions d'Impôt Récurrents</label><textarea id="credits_reductions_impot_recurrents" name="credits_reductions_impot_recurrents" value={formData.credits_reductions_impot_recurrents} onChange={handleChange} className={textAreaStyles}></textarea></div>
                <div><label htmlFor="notes_fiscales_client" className={labelStyles}>Notes Fiscales</label><textarea id="notes_fiscales_client" name="notes_fiscales_client" value={formData.notes_fiscales_client} onChange={handleChange} className={textAreaStyles}></textarea></div>
              </section>

              <section id="suivi" className={sectionContainerStyles}>
                <div className="flex items-center"><EditIcon className="w-7 h-7 text-[#c5a572] mr-3" /><h2 className={sectionHeaderStyles}>Suivi Professionnel</h2></div>
                <div className={gridStyles}>
                  <div><label htmlFor="statut_dossier_pro" className={labelStyles}>Statut du Dossier</label><select id="statut_dossier_pro" name="statut_dossier_pro" value={formData.statut_dossier_pro} onChange={handleChange} className={inputStyles}><option value="Actif">Actif</option><option value="En attente">En attente</option><option value="Archivé">Archivé</option></select></div>
                  <div><label htmlFor="prochain_rendez_vous_pro" className={labelStyles}>Prochain Rendez-vous</label><input id="prochain_rendez_vous_pro" type="datetime-local" name="prochain_rendez_vous_pro" value={formData.prochain_rendez_vous_pro} onChange={handleChange} className={inputStyles} /></div>
                </div>
                <div><label htmlFor="notes_internes_pro" className={labelStyles}>Notes Internes</label><textarea id="notes_internes_pro" name="notes_internes_pro" value={formData.notes_internes_pro} onChange={handleChange} className={textAreaStyles}></textarea></div>
              </section>

              {error && <p className="text-red-400 text-center mt-4">Erreur: {error}</p>}
              <div className="pt-6 flex justify-end">
                <button type="submit" disabled={isSaving} className={buttonPrimaryStyles}>
                  {isSaving ? (
                    <><div className="w-5 h-5 border-2 border-transparent border-t-[#162238] rounded-full animate-spin mr-2"></div>Sauvegarde...</>
                  ) : (
                    <><Save className="w-5 h-5 mr-2" />Enregistrer les Modifications</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 