import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { ClientProfile } from '../types/clientProfile';
import { ChevronLeft, Save, User as UserIconLucide, Home, Users as UsersGroupIcon, Briefcase, DollarSign, Target, FileText as FileTextIcon, Edit2 as EditIcon, Brain, Mic } from 'lucide-react';
import { AIClientCreation } from '../components/pro/AIClientCreation';

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

const labelStyles = "block text-sm font-medium text-gray-300 mb-1";
const inputStyles = "block w-full px-3 py-2 bg-[#0A192F]/70 border border-[#3E5F8A]/80 rounded-md shadow-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#88C0D0] focus:border-[#88C0D0] sm:text-sm transition-colors";
const textAreaStyles = `${inputStyles} min-h-[80px]`;
const sectionContainerStyles = "pt-6 space-y-6 bg-[#0E2444]/40 p-6 rounded-xl shadow-lg border border-[#2A3F6C]/50";
const firstSectionStyles = "space-y-6 bg-[#0E2444]/40 p-6 rounded-xl shadow-lg border border-[#2A3F6C]/50";
const sectionHeaderStyles = "text-2xl font-semibold text-white mb-1";
const sectionSubHeaderStyles = "text-lg font-medium text-[#88C0D0] mt-4 mb-3 pb-1 border-b border-[#3E5F8A]/60";
const gridStyles = "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4";
const buttonPrimaryStyles = "px-6 py-3 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] font-semibold rounded-xl shadow-lg hover:shadow-[#88C0D0]/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#88C0D0] focus:ring-offset-2 focus:ring-offset-[#0A192F] transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed";

export function ProCreateClientPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<ProCreateClientFormState>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAIMode, setIsAIMode] = useState(false);

  // Vérifier si on est en mode IA
  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsAIMode(mode === 'ai');
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const parseJsonFieldData = (jsonString?: string): any | null => {
    if (!jsonString || jsonString.trim() === '') return null;
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      console.warn(`Erreur de parsing JSON pour: ${jsonString}`, err);
      setError(`Format JSON invalide. Exemple attendu : [{\"cle\": \"valeur\"}] ou {\"cle\": \"valeur\"}.`);
      throw err; 
    }
  };
  
  const convertToNumberOrNull = (value?: string | number | null): number | null => {
    if (value === '' || value === null || value === undefined) return null;
    const stringValue = String(value).replace(',', '.');
    const num = parseFloat(stringValue);
    return isNaN(num) ? null : num;
  };

  const handleClientCreated = (client: ClientProfile) => {
    navigate('/pro/dashboard');
  };

  const handleCancel = () => {
    navigate('/pro/dashboard');
  };

  // Si on est en mode IA, afficher le composant IA
  if (isAIMode) {
    return <AIClientCreation onClientCreated={handleClientCreated} onCancel={handleCancel} />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.nom_client || !formData.prenom_client) {
        setError("Le nom et le prénom du client sont obligatoires.");
        setIsLoading(false);
        return;
    }
    
    const professional_user_id = localStorage.getItem('user_id'); 
    if (!professional_user_id) {
        setError("ID du professionnel non trouvé. Veuillez vous reconnecter.");
        setIsLoading(false);
        return;
    }

    try {
        type ClientProfilePayload = Omit<ClientProfile, 'id' | 'created_at' | 'updated_at'>;

        const dataToSend: ClientProfilePayload & { id_professionnel: string } = {
            id_professionnel: professional_user_id,
            nom_client: formData.nom_client,
            prenom_client: formData.prenom_client,
            civilite_client: formData.civilite_client || null,
            email_client: formData.email_client || null,
            statut_dossier_pro: formData.statut_dossier_pro || 'Actif',
            nom_usage_client: formData.nom_usage_client || null,
            date_naissance_client: formData.date_naissance_client || null,
            lieu_naissance_client: formData.lieu_naissance_client || null,
            nationalite_client: formData.nationalite_client || null,
            numero_fiscal_client: formData.numero_fiscal_client || null,
            adresse_postale_client: formData.adresse_postale_client || null,
            code_postal_client: formData.code_postal_client || null,
            ville_client: formData.ville_client || null,
            pays_residence_fiscale_client: formData.pays_residence_fiscale_client || null,
            telephone_principal_client: formData.telephone_principal_client || null,
            telephone_secondaire_client: formData.telephone_secondaire_client || null,
            situation_maritale_client: formData.situation_maritale_client || null,
            date_mariage_pacs_client: formData.date_mariage_pacs_client || null,
            regime_matrimonial_client: formData.regime_matrimonial_client || null,
            nombre_enfants_a_charge_client: convertToNumberOrNull(formData.nombre_enfants_a_charge_client),
            personnes_dependantes_client: formData.personnes_dependantes_client || null,
            profession_client1: formData.profession_client1 || null,
            statut_professionnel_client1: formData.statut_professionnel_client1 || null,
            nom_employeur_entreprise_client1: formData.nom_employeur_entreprise_client1 || null,
            type_contrat_client1: formData.type_contrat_client1 || null,
            revenu_net_annuel_client1: convertToNumberOrNull(formData.revenu_net_annuel_client1),
            profession_client2: formData.profession_client2 || null,
            statut_professionnel_client2: formData.statut_professionnel_client2 || null,
            nom_employeur_entreprise_client2: formData.nom_employeur_entreprise_client2 || null,
            type_contrat_client2: formData.type_contrat_client2 || null,
            revenu_net_annuel_client2: convertToNumberOrNull(formData.revenu_net_annuel_client2),
            revenus_fonciers_annuels_bruts_foyer: convertToNumberOrNull(formData.revenus_fonciers_annuels_bruts_foyer),
            charges_foncieres_deductibles_foyer: convertToNumberOrNull(formData.charges_foncieres_deductibles_foyer),
            revenus_capitaux_mobiliers_foyer: convertToNumberOrNull(formData.revenus_capitaux_mobiliers_foyer),
            plus_values_mobilieres_foyer: convertToNumberOrNull(formData.plus_values_mobilieres_foyer),
            plus_values_immobilieres_foyer: convertToNumberOrNull(formData.plus_values_immobilieres_foyer),
            benefices_industriels_commerciaux_foyer: convertToNumberOrNull(formData.benefices_industriels_commerciaux_foyer),
            benefices_non_commerciaux_foyer: convertToNumberOrNull(formData.benefices_non_commerciaux_foyer),
            pensions_retraites_percues_foyer: convertToNumberOrNull(formData.pensions_retraites_percues_foyer),
            pensions_alimentaires_percues_foyer: convertToNumberOrNull(formData.pensions_alimentaires_percues_foyer),
            autres_revenus_foyer_details: formData.autres_revenus_foyer_details || null,
            comptes_courants_solde_total_estime: convertToNumberOrNull(formData.comptes_courants_solde_total_estime),
            compte_titres_valeur_estimee: convertToNumberOrNull(formData.compte_titres_valeur_estimee),
            autres_placements_financiers_details: formData.autres_placements_financiers_details || null,
            valeur_entreprise_parts_sociales: convertToNumberOrNull(formData.valeur_entreprise_parts_sociales),
            comptes_courants_associes_solde: convertToNumberOrNull(formData.comptes_courants_associes_solde),
            vehicules_valeur_estimee: convertToNumberOrNull(formData.vehicules_valeur_estimee),
            objets_art_valeur_estimee: convertToNumberOrNull(formData.objets_art_valeur_estimee),
            credits_consommation_encours_total: convertToNumberOrNull(formData.credits_consommation_encours_total),
            autres_dettes_details: formData.autres_dettes_details || null,
            objectifs_fiscaux_client: formData.objectifs_fiscaux_client || null,
            objectifs_patrimoniaux_client: formData.objectifs_patrimoniaux_client || null,
            horizon_placement_client: formData.horizon_placement_client || null,
            profil_risque_investisseur_client: formData.profil_risque_investisseur_client || null,
            notes_objectifs_projets_client: formData.notes_objectifs_projets_client || null,
            tranche_marginale_imposition_estimee: convertToNumberOrNull(formData.tranche_marginale_imposition_estimee),
            credits_reductions_impot_recurrents: formData.credits_reductions_impot_recurrents || null,
            ifi_concerne_client: formData.ifi_concerne_client || null,
            notes_fiscales_client: formData.notes_fiscales_client || null,
            prochain_rendez_vous_pro: formData.prochain_rendez_vous_pro || null,
            notes_internes_pro: formData.notes_internes_pro || null,
            details_enfants_client: parseJsonFieldData(formData.details_enfants_client_json_str),
            autres_revenus_client1: parseJsonFieldData(formData.autres_revenus_client1_json_str),
            autres_revenus_client2: parseJsonFieldData(formData.autres_revenus_client2_json_str),
            residence_principale_details: parseJsonFieldData(formData.residence_principale_details_json_str),
            residences_secondaires_details: parseJsonFieldData(formData.residences_secondaires_details_json_str),
            investissements_locatifs_details: parseJsonFieldData(formData.investissements_locatifs_details_json_str),
            autres_biens_immobiliers_details: parseJsonFieldData(formData.autres_biens_immobiliers_details_json_str),
            livrets_epargne_details: parseJsonFieldData(formData.livrets_epargne_details_json_str),
            assurance_vie_details: parseJsonFieldData(formData.assurance_vie_details_json_str),
            pea_details: parseJsonFieldData(formData.pea_details_json_str),
            epargne_retraite_details: parseJsonFieldData(formData.epargne_retraite_details_json_str),
            dernier_avis_imposition_details: parseJsonFieldData(formData.dernier_avis_imposition_details_json_str),
        };

        await apiClient<ClientProfile>('/api/pro/clients/', { method: 'POST', data: dataToSend });
        alert('Client créé avec succès !');
        navigate('/pro/dashboard');
    } catch (err: any) {
      if (!error || (error && !error.includes('JSON invalide'))) { 
        setError(err.data?.detail || err.message || 'Une erreur est survenue lors de la création du client.');
      }
      console.error("Erreur lors de la création du client handleSubmit:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] to-[#0D1F3A] text-gray-100 font-sans antialiased">
      <header className="bg-[#0D1F3A]/90 backdrop-blur-md border-b border-[#2A3F6C]/30 shadow-lg sticky top-0 z-40">
        <div className="h-20 max-w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
            Retour
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-white">Nouveau Profil Client</h1>
          <div className="w-20">{/* Placeholder */}</div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className={firstSectionStyles}>
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

            <section className={sectionContainerStyles}>
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

            <section className={sectionContainerStyles}>
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

            <section className={sectionContainerStyles}>
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
            
            <section className={sectionContainerStyles}>
              <div className="flex items-center"><DollarSign className="w-7 h-7 text-[#c5a572] mr-3" /><h2 className={sectionHeaderStyles}>Patrimoine</h2></div>
              <h3 className={sectionSubHeaderStyles}>Immobilier</h3>
              <div><label htmlFor="residence_principale_details_json_str" className={labelStyles}>Résidence Principale (JSON Object)</label><textarea id="residence_principale_details_json_str" name="residence_principale_details_json_str" value={formData.residence_principale_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='{\"adresse\": \"...\", \"valeur_estimee\": 300000, \"capital_restant_du_emprunt\": 150000, \"date_acquisition\": \"2015-01-01\"}'></textarea></div>
              <div><label htmlFor="residences_secondaires_details_json_str" className={labelStyles}>Résidences Secondaires (JSON Array)</label><textarea id="residences_secondaires_details_json_str" name="residences_secondaires_details_json_str" value={formData.residences_secondaires_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='[{"adresse": "...", "valeur_estimee": 150000}]'></textarea></div>
              <div><label htmlFor="investissements_locatifs_details_json_str" className={labelStyles}>Investissements Locatifs (JSON Array)</label><textarea id="investissements_locatifs_details_json_str" name="investissements_locatifs_details_json_str" value={formData.investissements_locatifs_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='[{"type_bien": "Appartement T2", "valeur": 120000, "loyer_annuel": 6000, "regime_fiscal": "LMNP"}]'></textarea></div>
              <div><label htmlFor="autres_biens_immobiliers_details_json_str" className={labelStyles}>Autres Biens Immobiliers (SCPI, Terrains... JSON Array)</label><textarea id="autres_biens_immobiliers_details_json_str" name="autres_biens_immobiliers_details_json_str" value={formData.autres_biens_immobiliers_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='[{"type": "SCPI", "nom": "Corum XL", "valeur": 50000}]'></textarea></div>
              
              <h3 className={sectionSubHeaderStyles}>Financier</h3>
              <div className={gridStyles}>
                <div><label htmlFor="comptes_courants_solde_total_estime" className={labelStyles}>Solde Cpt Courants Estimé</label><input id="comptes_courants_solde_total_estime" type="text" name="comptes_courants_solde_total_estime" value={formData.comptes_courants_solde_total_estime} onChange={handleChange} className={inputStyles} /></div>
                <div><label htmlFor="compte_titres_valeur_estimee" className={labelStyles}>Valeur Cpt-Titres Estimée</label><input id="compte_titres_valeur_estimee" type="text" name="compte_titres_valeur_estimee" value={formData.compte_titres_valeur_estimee} onChange={handleChange} className={inputStyles} /></div>
              </div>
              <div><label htmlFor="livrets_epargne_details_json_str" className={labelStyles}>Livrets Épargne (JSON Object)</label><textarea id="livrets_epargne_details_json_str" name="livrets_epargne_details_json_str" value={formData.livrets_epargne_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='{\"Livret A\": 22000, \"LDDS\": 12000}'></textarea></div>
              <div><label htmlFor="assurance_vie_details_json_str" className={labelStyles}>Assurances Vie (JSON Array)</label><textarea id="assurance_vie_details_json_str" name="assurance_vie_details_json_str" value={formData.assurance_vie_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='[{"contrat": "Linxea Avenir", "valeur_rachat": 75000, "date_ouverture": "2010-01-01"}]'></textarea></div>
              <div><label htmlFor="pea_details_json_str" className={labelStyles}>PEA (JSON Object)</label><textarea id="pea_details_json_str" name="pea_details_json_str" value={formData.pea_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='{\"valeur\": 150000, \"date_ouverture\": \"2012-01-01\"}'></textarea></div>
              <div><label htmlFor="epargne_retraite_details_json_str" className={labelStyles}>Épargne Retraite (PER, Madelin... JSON Array)</label><textarea id="epargne_retraite_details_json_str" name="epargne_retraite_details_json_str" value={formData.epargne_retraite_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='[{"type": "PER", "valeur": 30000}]'></textarea></div>
              <div><label htmlFor="autres_placements_financiers_details" className={labelStyles}>Autres Placements (Crypto, Crowdfunding...)</label><textarea id="autres_placements_financiers_details" name="autres_placements_financiers_details" value={formData.autres_placements_financiers_details} onChange={handleChange} className={textAreaStyles}></textarea></div>

              <h3 className={sectionSubHeaderStyles}>Professionnel (si applicable)</h3>
              <div className={gridStyles}>
                <div><label htmlFor="valeur_entreprise_parts_sociales" className={labelStyles}>Valeur Entreprise/Parts Sociales</label><input id="valeur_entreprise_parts_sociales" type="text" name="valeur_entreprise_parts_sociales" value={formData.valeur_entreprise_parts_sociales} onChange={handleChange} className={inputStyles} /></div>
                <div><label htmlFor="comptes_courants_associes_solde" className={labelStyles}>Solde Cpt Courants Associé</label><input id="comptes_courants_associes_solde" type="text" name="comptes_courants_associes_solde" value={formData.comptes_courants_associes_solde} onChange={handleChange} className={inputStyles} /></div>
              </div>

              <h3 className={sectionSubHeaderStyles}>Autres Biens & Dettes</h3>
              <div className={gridStyles}>
                <div><label htmlFor="vehicules_valeur_estimee" className={labelStyles}>Valeur Véhicules Estimée</label><input id="vehicules_valeur_estimee" type="text" name="vehicules_valeur_estimee" value={formData.vehicules_valeur_estimee} onChange={handleChange} className={inputStyles} /></div>
                <div><label htmlFor="objets_art_valeur_estimee" className={labelStyles}>Valeur Objets d'Art Estimée</label><input id="objets_art_valeur_estimee" type="text" name="objets_art_valeur_estimee" value={formData.objets_art_valeur_estimee} onChange={handleChange} className={inputStyles} /></div>
                <div><label htmlFor="credits_consommation_encours_total" className={labelStyles}>Crédits Conso. Encours</label><input id="credits_consommation_encours_total" type="text" name="credits_consommation_encours_total" value={formData.credits_consommation_encours_total} onChange={handleChange} className={inputStyles} /></div>
              </div>
              <div><label htmlFor="autres_dettes_details" className={labelStyles}>Autres Dettes (Détails)</label><textarea id="autres_dettes_details" name="autres_dettes_details" value={formData.autres_dettes_details} onChange={handleChange} className={textAreaStyles}></textarea></div>
            </section>

            <section className={sectionContainerStyles}>
              <div className="flex items-center"><Target className="w-7 h-7 text-[#c5a572] mr-3" /><h2 className={sectionHeaderStyles}>Objectifs & Projets</h2></div>
              <div><label htmlFor="objectifs_fiscaux_client" className={labelStyles}>Objectifs Fiscaux</label><textarea id="objectifs_fiscaux_client" name="objectifs_fiscaux_client" value={formData.objectifs_fiscaux_client} onChange={handleChange} className={textAreaStyles} placeholder="Ex: Réduire IRPP, préparer transmission..."></textarea></div>
              <div><label htmlFor="objectifs_patrimoniaux_client" className={labelStyles}>Objectifs Patrimoniaux</label><textarea id="objectifs_patrimoniaux_client" name="objectifs_patrimoniaux_client" value={formData.objectifs_patrimoniaux_client} onChange={handleChange} className={textAreaStyles} placeholder="Ex: Achat RP, épargne retraite..."></textarea></div>
              <div className={gridStyles}>
                <div><label htmlFor="horizon_placement_client" className={labelStyles}>Horizon de Placement</label><select id="horizon_placement_client" name="horizon_placement_client" value={formData.horizon_placement_client} onChange={handleChange} className={inputStyles}><option value="">Non défini</option><option value="Court terme">Court terme</option><option value="Moyen terme">Moyen terme</option><option value="Long terme">Long terme</option></select></div>
                <div><label htmlFor="profil_risque_investisseur_client" className={labelStyles}>Profil de Risque</label><select id="profil_risque_investisseur_client" name="profil_risque_investisseur_client" value={formData.profil_risque_investisseur_client} onChange={handleChange} className={inputStyles}><option value="">Non défini</option><option value="Prudent">Prudent</option><option value="Équilibré">Équilibré</option><option value="Dynamique">Dynamique</option><option value="Agressif">Agressif</option></select></div>
              </div>
              <div><label htmlFor="notes_objectifs_projets_client" className={labelStyles}>Notes sur Objectifs/Projets</label><textarea id="notes_objectifs_projets_client" name="notes_objectifs_projets_client" value={formData.notes_objectifs_projets_client} onChange={handleChange} className={textAreaStyles}></textarea></div>
            </section>

            <section className={sectionContainerStyles}>
              <div className="flex items-center"><FileTextIcon className="w-7 h-7 text-[#c5a572] mr-3" /><h2 className={sectionHeaderStyles}>Informations Fiscales (Référence)</h2></div>
              <div><label htmlFor="dernier_avis_imposition_details_json_str" className={labelStyles}>Dernier Avis d'Imposition (JSON Object)</label><textarea id="dernier_avis_imposition_details_json_str" name="dernier_avis_imposition_details_json_str" value={formData.dernier_avis_imposition_details_json_str} onChange={handleChange} className={textAreaStyles} placeholder='{\"annee_revenus\": 2023, \"revenu_fiscal_reference\": 60000, \"montant_impot_net\": 5000}'></textarea></div>
              <div className={gridStyles}>
                <div><label htmlFor="tranche_marginale_imposition_estimee" className={labelStyles}>TMI Estimée (%)</label><input id="tranche_marginale_imposition_estimee" type="text" name="tranche_marginale_imposition_estimee" value={formData.tranche_marginale_imposition_estimee} onChange={handleChange} placeholder="Ex: 30" className={inputStyles} /></div>
                <div><label htmlFor="ifi_concerne_client" className={labelStyles}>Soumis à l'IFI</label><select id="ifi_concerne_client" name="ifi_concerne_client" value={formData.ifi_concerne_client} onChange={handleChange} className={inputStyles}><option value="Non précisé">Non précisé</option><option value="Oui">Oui</option><option value="Non">Non</option></select></div>
              </div>
              <div><label htmlFor="credits_reductions_impot_recurrents" className={labelStyles}>Crédits/Réductions Impôt Récurrents</label><textarea id="credits_reductions_impot_recurrents" name="credits_reductions_impot_recurrents" value={formData.credits_reductions_impot_recurrents} onChange={handleChange} className={textAreaStyles} placeholder="Ex: Emploi à domicile, dons aux oeuvres..."></textarea></div>
              <div><label htmlFor="notes_fiscales_client" className={labelStyles}>Notes Fiscales Générales</label><textarea id="notes_fiscales_client" name="notes_fiscales_client" value={formData.notes_fiscales_client} onChange={handleChange} className={textAreaStyles}></textarea></div>
            </section>

            <section className="pt-6 space-y-4">
              <div className="flex items-center"><EditIcon className="w-7 h-7 text-[#c5a572] mr-3" /><h2 className={sectionHeaderStyles}>Suivi Professionnel (Interne)</h2></div>
              <div className={gridStyles}>
                <div><label htmlFor="statut_dossier_pro" className={labelStyles}>Statut du Dossier</label><select id="statut_dossier_pro" name="statut_dossier_pro" value={formData.statut_dossier_pro} onChange={handleChange} className={inputStyles}><option value="Actif">Actif</option><option value="Prospect">Prospect</option><option value="En attente informations">En attente informations</option><option value="Optimisation en cours">Optimisation en cours</option><option value="Suivi annuel">Suivi annuel</option><option value="Archivé">Archivé</option></select></div>
                <div><label htmlFor="prochain_rendez_vous_pro" className={labelStyles}>Prochain RDV</label><input id="prochain_rendez_vous_pro" type="datetime-local" name="prochain_rendez_vous_pro" value={formData.prochain_rendez_vous_pro} onChange={handleChange} className={inputStyles} /></div>
              </div>
              <div><label htmlFor="notes_internes_pro" className={labelStyles}>Notes Internes (pour vous)</label><textarea id="notes_internes_pro" name="notes_internes_pro" value={formData.notes_internes_pro} onChange={handleChange} className={textAreaStyles}></textarea></div>
            </section>

            {error && <p className="text-sm text-red-400 mt-6 text-center py-2 px-4 bg-red-900/30 rounded-md border border-red-700">{error}</p>}
            <div className="pt-8 flex justify-end">
              <button type="submit" disabled={isLoading} className={buttonPrimaryStyles}>
                {isLoading ? (
                  <><div className="w-5 h-5 border-2 border-transparent border-t-[#0A192F] rounded-full animate-spin mr-2"></div>Enregistrement...</>
                ) : (
                  <><Save className="w-5 h-5 mr-2" />Enregistrer le Client</>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}