from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from decimal import Decimal # Pour les champs Numeric
import uuid

# Schéma de base pour ClientProfile, la plupart des champs sont optionnels ici
# car il sera utilisé pour la création (où certains sont requis) et la mise à jour (où tout est optionnel)
# et comme base pour la réponse (où les champs auto-générés sont ajoutés)
class ClientProfileBase(BaseModel):
    # I. IDENTITÉ DU CLIENT
    civilite_client: Optional[str] = None
    nom_client: Optional[str] = None # Sera requis dans Create
    prenom_client: Optional[str] = None # Sera requis dans Create
    nom_usage_client: Optional[str] = None
    date_naissance_client: Optional[date] = None
    lieu_naissance_client: Optional[str] = None
    nationalite_client: Optional[str] = None
    numero_fiscal_client: Optional[str] = None

    # II. COORDONNÉES DU CLIENT
    adresse_postale_client: Optional[str] = None
    code_postal_client: Optional[str] = None
    ville_client: Optional[str] = None
    pays_residence_fiscale_client: Optional[str] = None
    email_client: Optional[EmailStr] = None
    telephone_principal_client: Optional[str] = None
    telephone_secondaire_client: Optional[str] = None

    # III. SITUATION FAMILIALE & PERSONNELLE
    situation_maritale_client: Optional[str] = None
    date_mariage_pacs_client: Optional[date] = None
    regime_matrimonial_client: Optional[str] = None
    nombre_enfants_a_charge_client: Optional[int] = None
    details_enfants_client: Optional[Any] = None  # JSONB - Peut être List[Dict[str, Any]] ou un modèle plus strict
    personnes_dependantes_client: Optional[str] = None

    # IV. SITUATION PROFESSIONNELLE & REVENUS DU FOYER FISCAL
    profession_client1: Optional[str] = None
    statut_professionnel_client1: Optional[str] = None
    nom_employeur_entreprise_client1: Optional[str] = None
    type_contrat_client1: Optional[str] = None
    revenu_net_annuel_client1: Optional[Decimal] = None
    autres_revenus_client1: Optional[Any] = None # JSONB
    profession_client2: Optional[str] = None
    statut_professionnel_client2: Optional[str] = None
    nom_employeur_entreprise_client2: Optional[str] = None
    type_contrat_client2: Optional[str] = None
    revenu_net_annuel_client2: Optional[Decimal] = None
    autres_revenus_client2: Optional[Any] = None # JSONB
    revenus_fonciers_annuels_bruts_foyer: Optional[Decimal] = None
    charges_foncieres_deductibles_foyer: Optional[Decimal] = None
    revenus_capitaux_mobiliers_foyer: Optional[Decimal] = None
    plus_values_mobilieres_foyer: Optional[Decimal] = None
    plus_values_immobilieres_foyer: Optional[Decimal] = None
    benefices_industriels_commerciaux_foyer: Optional[Decimal] = None
    benefices_non_commerciaux_foyer: Optional[Decimal] = None
    pensions_retraites_percues_foyer: Optional[Decimal] = None
    pensions_alimentaires_percues_foyer: Optional[Decimal] = None
    autres_revenus_foyer_details: Optional[str] = None

    # V. PATRIMOINE DU FOYER FISCAL
    residence_principale_details: Optional[Any] = None # JSONB
    residences_secondaires_details: Optional[Any] = None # JSONB (Liste)
    investissements_locatifs_details: Optional[Any] = None # JSONB (Liste)
    autres_biens_immobiliers_details: Optional[Any] = None # JSONB (Liste)
    comptes_courants_solde_total_estime: Optional[Decimal] = None
    livrets_epargne_details: Optional[Any] = None # JSONB
    assurance_vie_details: Optional[Any] = None # JSONB (Liste)
    pea_details: Optional[Any] = None # JSONB
    compte_titres_valeur_estimee: Optional[Decimal] = None
    epargne_retraite_details: Optional[Any] = None # JSONB (Liste)
    autres_placements_financiers_details: Optional[str] = None
    valeur_entreprise_parts_sociales: Optional[Decimal] = None
    comptes_courants_associes_solde: Optional[Decimal] = None
    vehicules_valeur_estimee: Optional[Decimal] = None
    objets_art_valeur_estimee: Optional[Decimal] = None
    credits_consommation_encours_total: Optional[Decimal] = None
    autres_dettes_details: Optional[str] = None

    # VI. OBJECTIFS & PROJETS DU CLIENT
    objectifs_fiscaux_client: Optional[str] = None
    objectifs_patrimoniaux_client: Optional[str] = None
    horizon_placement_client: Optional[str] = None
    profil_risque_investisseur_client: Optional[str] = None
    notes_objectifs_projets_client: Optional[str] = None

    # VII. INFORMATIONS FISCALES EXISTANTES (Référence)
    dernier_avis_imposition_details: Optional[Any] = None # JSONB
    tranche_marginale_imposition_estimee: Optional[Decimal] = None
    credits_reductions_impot_recurrents: Optional[str] = None
    ifi_concerne_client: Optional[str] = None # Oui, Non, NSP
    notes_fiscales_client: Optional[str] = None

    # VIII. SUIVI PAR LE PROFESSIONNEL
    statut_dossier_pro: Optional[str] = None
    prochain_rendez_vous_pro: Optional[datetime] = None
    notes_internes_pro: Optional[str] = None

    class Config:
        from_attributes = True # anciennement orm_mode = True
        # Pour Pydantic V2, la sérialisation de Decimal est gérée nativement.
        # Si vous utilisez Pydantic V1 avec Decimal, il faudrait json_encoders.

# Schéma pour la création d'un ClientProfile
class ClientProfileCreate(ClientProfileBase):
    nom_client: str
    prenom_client: str
    id_professionnel: str # L'ID de l'utilisateur Pro (de Supabase Auth, typiquement UUID en string)

# Schéma pour la mise à jour d'un ClientProfile (tous les champs sont optionnels)
class ClientProfileUpdate(ClientProfileBase):
    pass # Hérite de tous les champs optionnels de ClientProfileBase

# Schéma pour la réponse API (inclut les champs auto-générés comme id, created_at, updated_at)
class ClientProfileResponse(ClientProfileBase):
    id: int
    id_professionnel: str # Répété pour être sûr qu'il est dans la réponse
    created_at: datetime
    updated_at: datetime

    # Si vous voulez des réponses plus structurées pour les champs JSONB
    # vous pouvez définir des sous-modèles Pydantic ici.
    # Par exemple pour details_enfants_client:
    # details_enfants_client: Optional[List[EnfantDetail]] = None
    # où EnfantDetail serait un autre BaseModel. 

# Nouveau schéma pour la réponse de l'analyse client
class AnalysisRecommendation(BaseModel):
    title: str
    details: str
    # icon: Optional[str] = None # L'icône est gérée côté frontend pour l'instant

class AnalysisResultSchema(BaseModel):
    summary: str
    recommendations: List[AnalysisRecommendation] # Utiliser un sous-modèle pour plus de structure
    actionPoints: List[str]

    class Config:
        from_attributes = True 

# -------------------------------------------------------------
# Schéma combiné : profil client + analyse IA (pour création)
# -------------------------------------------------------------

class ClientProfileWithAnalysisResponse(BaseModel):
    client: ClientProfileResponse
    analysis: AnalysisResultSchema

    class Config:
        from_attributes = True

# --- Schémas Pydantic pour les Rendez-vous Professionnels ---
class RendezVousBase(BaseModel):
    id_client: int
    titre: str
    description: Optional[str] = None
    date_heure_debut: datetime
    date_heure_fin: datetime
    lieu: Optional[str] = None
    statut: Optional[str] = 'Confirmé'
    notes_rdv: Optional[str] = None

class RendezVousCreate(RendezVousBase):
    # id_professionnel sera ajouté par le backend à partir de l'utilisateur authentifié
    pass

class RendezVousUpdate(BaseModel):
    # Tous les champs sont optionnels pour la mise à jour partielle
    id_client: Optional[int] = None
    titre: Optional[str] = None
    description: Optional[str] = None
    date_heure_debut: Optional[datetime] = None
    date_heure_fin: Optional[datetime] = None
    lieu: Optional[str] = None
    statut: Optional[str] = None
    notes_rdv: Optional[str] = None

class RendezVousResponse(RendezVousBase):
    id: uuid.UUID # Utilisation de uuid.UUID si votre ID est de ce type
    id_professionnel: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True # Était orm_mode = True dans Pydantic v1 