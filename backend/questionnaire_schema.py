from pydantic import BaseModel, Field, conint, confloat
from typing import List, Optional

class Identite(BaseModel):
    nom: str = Field(..., description="Nom de famille")
    prenom: str = Field(..., description="Prénom")
    date_naissance: str = Field(..., description="Date de naissance (YYYY-MM-DD)")
    situation_familiale: str = Field(..., description="célibataire/marie/pacse/divorce/veuf")
    enfants: conint(ge=0) = 0

class RevenusCharges(BaseModel):
    salaires: confloat(ge=0) = 0
    pensions: confloat(ge=0) = 0
    revenus_locatifs: confloat(ge=0) = 0
    autres_revenus: confloat(ge=0) = 0
    charges_deductibles: confloat(ge=0) = 0
    revenu_professionnel_n1: Optional[confloat(ge=0)] = Field(None, description="Revenus professionnels nets de l\'année N-1 (pour calcul plafond PER)")
    disponible_fiscal_per_n: Optional[confloat(ge=0)] = Field(None, description="Disponible fiscal pour versements PER indiqué sur l\'avis d\'imposition N (revenus N-1)")

class PatrimoineImmobilier(BaseModel):
    residence_principale_valeur_brute: confloat(ge=0) = Field(0, description="Valeur brute de la résidence principale")
    residences_secondaires_valeur_brute: confloat(ge=0) = Field(0, description="Valeur brute totale des résidences secondaires")
    immobilier_locatif_valeur_brute: confloat(ge=0) = Field(0, description="Valeur brute totale de l'immobilier locatif (hors parts de SCI)")
    sci_parts_valeur_nette: confloat(ge=0) = Field(0, description="Valeur nette des parts de SCI soumises à l'IFI") # SCI souvent évaluées nettes de dettes

class PatrimoineFinancier(BaseModel):
    pea: confloat(ge=0) = 0
    assurance_vie: confloat(ge=0) = 0 # Uniquement la fraction taxable à l'IFI (rare)
    compte_titres: confloat(ge=0) = 0
    crypto: confloat(ge=0) = 0
    liquidites: confloat(ge=0) = 0
    autres_actifs_ifi: confloat(ge=0) = Field(0, description="Autres actifs entrant dans la base IFI (ex: objets d'art si non exonérés)")

class DettesIFIDeductibles(BaseModel):
    emprunt_rp_capital_restant_du: confloat(ge=0) = Field(0, description="Capital restant dû sur emprunt résidence principale (part déductible IFI)")
    emprunts_rs_capital_restant_du: confloat(ge=0) = Field(0, description="Total CRD sur emprunts résidences secondaires")
    emprunts_locatif_capital_restant_du: confloat(ge=0) = Field(0, description="Total CRD sur emprunts immobilier locatif (hors SCI)")
    # Les dettes des SCI sont normalement déjà déduites pour obtenir sci_parts_valeur_nette
    autres_dettes_ifi: confloat(ge=0) = Field(0, description="Autres dettes déductibles de l'IFI")

class Objectifs(BaseModel):
    retraite: bool = False
    transmission: bool = False
    reduction_ir: bool = False
    optimisation_ifi: bool = False
    revenus_complementaires: bool = False
    # Optionnel: Montant envisagé pour une donation (utilisé par StrategieDonationIFI)
    montant_donation_envisagee: Optional[confloat(ge=0)] = Field(None, description="Montant d\'une donation envisagée pour optimiser l\'IFI")

class InputsPourOptimisations(BaseModel):
    # Pour Plus-Value Immobilière
    pvi_prix_cession_envisage: Optional[confloat(ge=0)] = Field(None, description="Prix de cession envisagé pour un bien immobilier")
    pvi_prix_acquisition_estime: Optional[confloat(ge=0)] = Field(None, description="Prix d\'acquisition estimé du bien à céder")
    pvi_duree_detention_estimee: Optional[conint(ge=0)] = Field(None, description="Durée de détention estimée du bien à céder (années)")
    pvi_frais_acquisition_reels: Optional[confloat(ge=0)] = Field(None, description="Frais d\'acquisition réels payés (notaire, agence...)")
    pvi_appliquer_forfait_frais_acquisition: bool = Field(True, description="Appliquer le forfait de 7.5% pour frais d\'acquisition si frais réels non fournis ou si True")
    pvi_montant_travaux_deductibles: Optional[confloat(ge=0)] = Field(None, description="Montant des travaux déductibles réalisés sur le bien")
    pvi_appliquer_forfait_travaux: bool = Field(True, description="Appliquer le forfait de 15% pour travaux (si >5 ans détention) si travaux réels non fournis ou si True")
    # Pour Dons aux oeuvres
    don_aux_oeuvres_montant: Optional[confloat(ge=0)] = Field(None, description="Montant annuel des dons aux œuvres envisagé")
    # Pour Emploi à domicile
    emploi_domicile_depenses: Optional[confloat(ge=0)] = Field(None, description="Montant annuel des dépenses pour emploi à domicile envisagé")

class QuestionnaireCGP(BaseModel):
    identite: Identite
    revenus_charges: RevenusCharges
    patrimoine_immobilier: PatrimoineImmobilier
    patrimoine_financier: PatrimoineFinancier # Actifs financiers taxables à l'IFI
    dettes_ifi_deductibles: Optional[DettesIFIDeductibles] = Field(None, description="Dettes déductibles pour le calcul de l\'IFI")
    objectifs: Objectifs
    optimisations_specifiques: Optional[InputsPourOptimisations] = Field(None, description="Inputs spécifiques pour certaines optimisations fiscales")
    horizon: Optional[str] = Field(None, description="court/moyen/long terme")
    profil_risque: Optional[str] = Field(None, description="prudent/modere/dynamique") 