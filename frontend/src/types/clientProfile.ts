// import { Decimal } from 'decimal.js'; // SUPPRIMÉ: Non utilisé

// Ce type doit correspondre au schéma Pydantic ClientProfileResponse du backend
export interface ClientProfile {
  id: number;
  id_professionnel: string;
  created_at: string; // ou Date
  updated_at: string; // ou Date

  // I. IDENTITÉ DU CLIENT
  civilite_client?: string | null;
  nom_client: string;
  prenom_client: string;
  nom_usage_client?: string | null;
  date_naissance_client?: string | null; // format YYYY-MM-DD
  lieu_naissance_client?: string | null;
  nationalite_client?: string | null;
  numero_fiscal_client?: string | null;

  // II. COORDONNÉES DU CLIENT
  adresse_postale_client?: string | null;
  code_postal_client?: string | null;
  ville_client?: string | null;
  pays_residence_fiscale_client?: string | null;
  email_client?: string | null;
  telephone_principal_client?: string | null;
  telephone_secondaire_client?: string | null;

  // III. SITUATION FAMILIALE & PERSONNELLE
  situation_maritale_client?: string | null;
  date_mariage_pacs_client?: string | null; // format YYYY-MM-DD
  regime_matrimonial_client?: string | null;
  nombre_enfants_a_charge_client?: number | null;
  details_enfants_client?: any | null;  // JSONB - Peut être List<Dict<string, any>> ou un modèle plus strict
  personnes_dependantes_client?: string | null;

  // IV. SITUATION PROFESSIONNELLE & REVENUS DU FOYER FISCAL
  profession_client1?: string | null;
  statut_professionnel_client1?: string | null;
  nom_employeur_entreprise_client1?: string | null;
  type_contrat_client1?: string | null;
  revenu_net_annuel_client1?: string | number | null;
  autres_revenus_client1?: any | null; // JSONB
  profession_client2?: string | null;
  statut_professionnel_client2?: string | null;
  nom_employeur_entreprise_client2?: string | null;
  type_contrat_client2?: string | null;
  revenu_net_annuel_client2?: string | number | null;
  autres_revenus_client2?: any | null; // JSONB
  revenus_fonciers_annuels_bruts_foyer?: string | number | null;
  charges_foncieres_deductibles_foyer?: string | number | null;
  revenus_capitaux_mobiliers_foyer?: string | number | null;
  plus_values_mobilieres_foyer?: string | number | null;
  plus_values_immobilieres_foyer?: string | number | null;
  benefices_industriels_commerciaux_foyer?: string | number | null;
  benefices_non_commerciaux_foyer?: string | number | null;
  pensions_retraites_percues_foyer?: string | number | null;
  pensions_alimentaires_percues_foyer?: string | number | null;
  autres_revenus_foyer_details?: string | null;

  // V. PATRIMOINE DU FOYER FISCAL
  residence_principale_details?: any | null; // JSONB
  residences_secondaires_details?: any | null; // JSONB (Liste)
  investissements_locatifs_details?: any | null; // JSONB (Liste)
  autres_biens_immobiliers_details?: any | null; // JSONB (Liste)
  comptes_courants_solde_total_estime?: string | number | null;
  livrets_epargne_details?: any | null; // JSONB
  assurance_vie_details?: any | null; // JSONB (Liste)
  pea_details?: any | null; // JSONB
  compte_titres_valeur_estimee?: string | number | null;
  epargne_retraite_details?: any | null; // JSONB (Liste)
  autres_placements_financiers_details?: string | null;
  valeur_entreprise_parts_sociales?: string | number | null;
  comptes_courants_associes_solde?: string | number | null;
  vehicules_valeur_estimee?: string | number | null;
  objets_art_valeur_estimee?: string | number | null;
  credits_consommation_encours_total?: string | number | null;
  autres_dettes_details?: string | null;

  // VI. OBJECTIFS & PROJETS DU CLIENT
  objectifs_fiscaux_client?: string | null;
  objectifs_patrimoniaux_client?: string | null;
  horizon_placement_client?: string | null;
  profil_risque_investisseur_client?: string | null;
  notes_objectifs_projets_client?: string | null;

  // VII. INFORMATIONS FISCALES EXISTANTES (Référence)
  dernier_avis_imposition_details?: any | null; // JSONB
  tranche_marginale_imposition_estimee?: string | number | null;
  credits_reductions_impot_recurrents?: string | null;
  ifi_concerne_client?: string | null; // Oui, Non, NSP
  notes_fiscales_client?: string | null;

  // VIII. SUIVI PAR LE PROFESSIONNEL
  statut_dossier_pro?: string | null;
  prochain_rendez_vous_pro?: string | null; // DateTime
  notes_internes_pro?: string | null;
} 