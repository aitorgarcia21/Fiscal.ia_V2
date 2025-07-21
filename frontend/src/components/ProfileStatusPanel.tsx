import React from 'react';
import { ClientProfile } from '../types/clientProfile';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ProfileStatusPanelProps {
  profile: Partial<ClientProfile>;
  suggestions: string[];
}

interface FieldStatus {
  label: string;
  value: any;
}

const requiredFields: Array<keyof ClientProfile> = [
  'nom_client',
  'prenom_client',
  'numero_fiscal_client',
  'date_naissance_client',
  'situation_maritale_client',
];

const fieldLabels: Record<keyof ClientProfile, string> = {
  id: 'ID',
  id_professionnel: 'ID Pro',
  created_at: 'Created',
  updated_at: 'Updated',
  civilite_client: 'Civilité',
  nom_client: 'Nom',
  prenom_client: 'Prénom',
  nom_usage_client: 'Nom usage',
  date_naissance_client: 'Date naissance',
  lieu_naissance_client: 'Lieu naissance',
  nationalite_client: 'Nationalité',
  numero_fiscal_client: 'N° fiscal',
  adresse_postale_client: 'Adresse',
  code_postal_client: 'CP',
  ville_client: 'Ville',
  pays_residence_fiscale_client: 'Pays résidence fiscale',
  email_client: 'Email',
  telephone_principal_client: 'Téléphone',
  telephone_secondaire_client: 'Téléphone (2)',
  situation_maritale_client: 'Situation maritale',
  date_mariage_pacs_client: 'Date mariage/PACS',
  regime_matrimonial_client: 'Régime matrimonial',
  nombre_enfants_a_charge_client: 'Enfants à charge',
  details_enfants_client: 'Détails enfants',
  personnes_dependantes_client: 'Personnes dépendantes',
  profession_client1: 'Profession 1',
  statut_professionnel_client1: 'Statut pro 1',
  nom_employeur_entreprise_client1: 'Employeur 1',
  type_contrat_client1: 'Type contrat 1',
  revenu_net_annuel_client1: 'Revenu annuel 1',
  autres_revenus_client1: 'Autres revenus 1',
  profession_client2: 'Profession 2',
  statut_professionnel_client2: 'Statut pro 2',
  nom_employeur_entreprise_client2: 'Employeur 2',
  type_contrat_client2: 'Type contrat 2',
  revenu_net_annuel_client2: 'Revenu annuel 2',
  autres_revenus_client2: 'Autres revenus 2',
  revenus_fonciers_annuels_bruts_foyer: 'Revenus fonciers',
  charges_foncieres_deductibles_foyer: 'Charges foncières',
  revenus_capitaux_mobiliers_foyer: 'RCM',
  plus_values_mobilieres_foyer: 'PV mobilières',
  plus_values_immobilieres_foyer: 'PV immobilières',
  benefices_industriels_commerciaux_foyer: 'BIC',
  benefices_non_commerciaux_foyer: 'BNC',
  pensions_retraites_percues_foyer: 'Pensions retraités',
  pensions_alimentaires_percues_foyer: 'Pensions alim.',
  autres_revenus_foyer_details: 'Autres revenus',
  residence_principale_details: 'Résidence principale',
  residences_secondaires_details: 'Résidences secondaires',
  investissements_locatifs_details: 'Invest. locatifs',
  autres_biens_immobiliers_details: 'Autres biens imm.',
  comptes_courants_solde_total_estime: 'CC Solde',
  livrets_epargne_details: 'Livrets épargne',
  assurance_vie_details: 'Ass. vie',
  pea_details: 'PEA',
  compte_titres_valeur_estimee: 'Compte titres',
  epargne_retraite_details: 'Épargne retraite',
  autres_placements_financiers_details: 'Autres placements',
  valeur_entreprise_parts_sociales: 'Parts sociales',
  comptes_courants_associes_solde: 'CCA Solde',
  vehicules_valeur_estimee: 'Véhicules',
  objets_art_valeur_estimee: 'Objets d\'art',
  credits_consommation_encours_total: 'Crédits conso',
  autres_dettes_details: 'Autres dettes',
  objectifs_fiscaux_client: 'Objectifs fiscaux',
  objectifs_patrimoniaux_client: 'Objectifs patrimoniaux',
  horizon_placement_client: 'Horizon placement',
  profil_risque_investisseur_client: 'Profil risque',
  notes_objectifs_projets_client: 'Notes objectifs',
  dernier_avis_imposition_details: 'Dernier avis',
  tranche_marginale_imposition_estimee: 'TMI estimée',
  credits_reductions_impot_recurrents: 'Crédits Impôt',
  ifi_concerne_client: 'IFI ?',
  notes_fiscales_client: 'Notes fiscales',
  statut_dossier_pro: 'Statut dossier',
  prochain_rendez_vous_pro: 'Prochain RDV',
  notes_internes_pro: 'Notes internes',
};

export const ProfileStatusPanel: React.FC<ProfileStatusPanelProps> = ({ profile, suggestions }) => {
  const status: FieldStatus[] = requiredFields.map(field => ({
    label: fieldLabels[field] || (field as string),
    value: profile[field] ?? null,
  }));

  return (
    <div className="bg-[#0E2444] rounded-xl p-4 border border-[#c5a572]/30 text-sm text-gray-200 space-y-4 w-full">
      <h3 className="text-[#c5a572] font-semibold">État du profil client</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {status.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-2">
            {value ? (
              <CheckCircle size={16} className="text-green-400" />
            ) : (
              <XCircle size={16} className="text-red-400" />
            )}
            <span>{label}</span>
          </div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 text-yellow-400">
            <AlertTriangle size={16} />
            <span>Suggestions</span>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {suggestions.map(s => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
