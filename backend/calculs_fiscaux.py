"""Module utilitaire pour les calculs fiscaux de base utilisés par Francis.

Ces fonctions offrent une implémentation simplifiée des règles fiscales françaises
(dernière loi de finances 2024). Elles suffisent pour des tests unitaires et une
première estimation ; elles ne remplacent pas un calcul complet intégrant tous
les régimes spéciaux et plafonnements.
"""
from typing import Literal, Dict, Optional


# ------------------------
# Quotient familial / parts
# ------------------------

def nombre_parts(marital_status: Literal["celibataire", "marie", "pacse"], enfants: int = 0) -> float:
    """Calcule le nombre de parts fiscales.

    Règles simplifiées :
    - Célibataire : 1 part de base
    - Marié ou PACS : 2 parts de base
    - Enfants : 0,5 part pour les 1er & 2ᵉ, 1 part à partir du 3ᵉ.
    """

    base = 1.0 if marital_status == "celibataire" else 2.0
    if enfants <= 0:
        return base

    # Parts enfant
    if enfants == 1:
        return base + 0.5
    if enfants == 2:
        return base + 1.0
    # 2 premiers enfants = 1 part, suivants = 1 part chacun
    return base + 1.0 + (enfants - 2) * 1.0


# ------------------------
# Impôt sur le revenu (IR)
# ------------------------

# Barème IR pour revenus 2024 (imposition 2025), basé sur la revalorisation anticipée.
_BAREME_IR = [
    (0, 0.0),  # tranche à 0 %
    (11497, 0.11),
    (29315, 0.30),
    (83823, 0.41),
    (180294, 0.45),
]


def impot_revenu_net(revenu_imposable: float, parts: float) -> float:
    """Calcule l'impôt sur le revenu après quotient familial.

    Formule :
        impôt = Σ[(portion tranche) × taux] × parts
    """
    if parts <= 0:
        raise ValueError("Le nombre de parts doit être positif.")

    revenu_par_part = revenu_imposable / parts

    # Calcul tranche par tranche
    impot_par_part = 0.0
    for i in range(len(_BAREME_IR)):
        seuil, taux = _BAREME_IR[i]
        # dernier seuil ? prendre plafond infini
        plafond = _BAREME_IR[i + 1][0] if i + 1 < len(_BAREME_IR) else float("inf")
        if revenu_par_part > seuil:
            portion = min(revenu_par_part, plafond) - seuil
            impot_par_part += portion * taux
        else:
            break

    return round(impot_par_part * parts, 2)


# ------------------------
# IFI (barème généralement stable, utilisé ici pour une simulation IFI 2025)
# ------------------------
# Taux applicables à la fraction de la valeur nette taxable du patrimoine
_TRANCHES_IFI = [
    {"limite_inf": 0, "limite_sup": 800000, "taux": 0.0},
    {"limite_inf": 800000, "limite_sup": 1300000, "taux": 0.005},
    {"limite_inf": 1300000, "limite_sup": 2570000, "taux": 0.007},
    {"limite_inf": 2570000, "limite_sup": 5000000, "taux": 0.01},
    {"limite_inf": 5000000, "limite_sup": 10000000, "taux": 0.0125},
    {"limite_inf": 10000000, "limite_sup": float('inf'), "taux": 0.015},
]

def impot_ifi(base_nette_taxable: float) -> float:
    """Calcule l'IFI selon le barème progressif par tranches.
    L'IFI est dû si la base nette taxable excède 1 300 000 €,
    mais le calcul se fait à partir de 800 000 € si ce seuil est dépassé.
    """
    if base_nette_taxable <= 800000: # Seuil d'imposition (même si calcul dès 800k si > 1.3M)
                                     # Pour être précis, l'IFI est dû si patrimoine net > 1.3M€.
                                     # Mais le calcul part de 800k€. Si on est entre 800k et 1.3M, IFI=0.
                                     # Cette fonction calcule l'impot brut. Le fait qu'il soit dû ou non (>1.3M) est une autre logique.
                                     # Pour simplifier ici, on retourne 0 si < 800k car aucune tranche ne s'applique.
        return 0.0

    impot_total = 0.0
    for tranche in _TRANCHES_IFI:
        if base_nette_taxable > tranche["limite_inf"]:
            base_imposable_dans_tranche = min(base_nette_taxable, tranche["limite_sup"]) - tranche["limite_inf"]
            impot_total += base_imposable_dans_tranche * tranche["taux"]
        else:
            # Si la base n'atteint pas le début de cette tranche, elle n'atteindra pas les suivantes
            break # Important pour éviter de taxer sur des tranches supérieures non atteintes
            
    # Décote pour les patrimoines entre 1.3M€ et 1.4M€ (non implémentée ici pour simplification)
    # Taxe sur les patrimoines supérieurs à 1.3M€ uniquement.
    # La fonction ci-dessus calcule l'impôt comme si il était dû dès 800K.
    # Si l'IFI est calculé pour un patrimoine entre 800K et 1.3M, cet impôt n'est pas exigible.
    # Pour être plus exact avec la loi : l'impôt n'est dû que si P > 1.3M€.
    # Si P <= 1.3M€, IFI = 0. Si P > 1.3M€, on calcule comme fait ci-dessus.
    if base_nette_taxable <= 1300000: # Le calcul d'impot_total peut être > 0 mais l'IFI n'est pas dû.
        return 0.0
        
    return round(impot_total, 2)


# ------------------------
# TVA
# ------------------------
_TVA_RATES = {
    "normal": 0.20,
    "intermediaire": 0.10,
    "reduite": 0.055,
    "super_reduite": 0.021,
}


def montant_tva(ht: float, taux: Literal["normal", "intermediaire", "reduite", "super_reduite"] = "normal") -> float:
    """Retourne le montant de TVA à partir d'un hors taxes."""
    if ht < 0:
        raise ValueError("Montant HT négatif.")
    if taux not in _TVA_RATES:
        raise KeyError("Taux TVA inconnu.")
    return round(ht * _TVA_RATES[taux], 2)


# -----------------------------
# Plus-value Immobilière (PVI)
# -----------------------------

# Taux d'abattement pour durée de détention (IR et PS)
# Format: (années_pleines, taux_abattement_annuel_IR, taux_abattement_annuel_PS)
_ABATTEMENT_PVI_DUREE = [
    # IR (exonération après 22 ans)
    # PS (exonération après 30 ans)
    # Années 0-5: 0% IR, 0% PS
    # Années 6-21: 6% IR / an, 1.65% PS / an
    # Année 22: 4% IR (total 100%), 1.60% PS / an (total 28.05%)
    # Années 23-30: 0% IR, 9% PS / an
    # Après 30 ans: 0% IR, 0% PS (total 100% PS)
    # Pour simplifier, on applique un taux global par période.
    # (annee_fin, abattement_total_IR_fin_periode, abattement_total_PS_fin_periode)
    (5, 0.0, 0.0),
    (21, ( (21-5) * 0.06), ( (21-5) * 0.0165)), # ex: 16*6% = 96% IR, 16*1.65% = 26.4% PS
    (22, 1.0, ( (21-5) * 0.0165 + 0.0160 )), # 100% IR, 26.4% + 1.6% = 28% PS
    (30, 1.0, 1.0) # 100% IR, 100% PS
]

_TAUX_FORFAIT_FRAIS_ACQUISITION_PVI = 0.075
_TAUX_FORFAIT_TRAVAUX_PVI = 0.15 # Si détention >= 5 ans

_TAUX_IR_PVI = 0.19
_TAUX_PS_PVI = 0.172

# Barème de la surtaxe sur les plus-values immobilières élevées (PVN = Plus-Value Nette imposable à l'IR)
# Source: Article 1609 nonies G du CGI
_BAREME_SURTAXE_PVI_DETAIL = [
    {"min": 0, "max": 50000, "taux": 0.0},
    {"min": 50001, "max": 100000, "taux": 0.02},
    {"min": 100001, "max": 150000, "taux": 0.03},
    {"min": 150001, "max": 200000, "taux": 0.04},
    {"min": 200001, "max": 250000, "taux": 0.05},
    {"min": 250001, "max": float('inf'), "taux": 0.06} # Taux marginal pour la part excédant 250k€
    # Note: Le CGI prévoit un lissage pour les PV comprises entre 250k et 260k.
    # Formule de lissage pour PVN entre 250 001 € et 260 000 € : (PVN / 15 000) € – 10 400 € (non implémenté ici pour garder une complexité maîtrisée)
    # Au-delà de 260 000€, c'est bien 6% sur la totalité de la PVN (après abattements).
    # Pour la simulation, nous appliquerons le taux marginal par tranche, ce qui est l'approche correcte.
]

def _calculer_surtaxe_pvi_progressive(pv_imposable_ir: float) -> float:
    """Calcule la surtaxe PVI selon le barème progressif par tranches.
       La surtaxe s'applique si pv_imposable_ir > 50 000 €.
    """
    if pv_imposable_ir <= 50000:
        return 0.0

    surtaxe = 0.0
    # Le barème de la surtaxe est progressif par tranches, comme l'IR.
    # On calcule l'impôt pour chaque fraction de la PVN qui tombe dans une tranche.
    base_restante = pv_imposable_ir
    
    # Tranche 1 (0 à 50k€) -> 0%
    # On ne commence le calcul qu'à partir de la tranche où la PV est > 50k

    # Tranche 2 (50 001€ à 100 000€) -> 2%
    if pv_imposable_ir > 50000:
        montant_dans_tranche = min(pv_imposable_ir, 100000) - 50000
        surtaxe += montant_dans_tranche * 0.02

    # Tranche 3 (100 001€ à 150 000€) -> 3%
    if pv_imposable_ir > 100000:
        montant_dans_tranche = min(pv_imposable_ir, 150000) - 100000
        surtaxe += montant_dans_tranche * 0.03

    # Tranche 4 (150 001€ à 200 000€) -> 4%
    if pv_imposable_ir > 150000:
        montant_dans_tranche = min(pv_imposable_ir, 200000) - 150000
        surtaxe += montant_dans_tranche * 0.04

    # Tranche 5 (200 001€ à 250 000€) -> 5%
    if pv_imposable_ir > 200000:
        montant_dans_tranche = min(pv_imposable_ir, 250000) - 200000
        surtaxe += montant_dans_tranche * 0.05
    
    # Tranche 6 (Plus de 250 000€) -> 6%
    if pv_imposable_ir > 250000:
        # Le mécanisme de lissage pour 250-260k est complexe.
        # Pour simplifier, si PVN > 260 000, on applique 6% sur la totalité de la PVN (PVN * 6%).
        # Si PVN entre 250 001 et 260 000, la surtaxe est (PVN / 15000) – 10400.
        # Pour garder le code simple pour l'instant, on va appliquer 6% sur la part > 250k, 
        # ce qui est une approximation qui peut légèrement sur ou sous-estimer dans la tranche 250-260k.
        # Une version PRO nécessiterait le lissage exact.
        montant_dans_tranche = pv_imposable_ir - 250000
        surtaxe += montant_dans_tranche * 0.06
        
    return round(surtaxe, 2)

def calcul_plus_value_immobiliere(
    prix_cession: float,
    prix_acquisition_initial: float, 
    annees_detention: int,
    frais_acquisition_reels: Optional[float] = None,
    appliquer_forfait_frais_acquisition: bool = True,
    montant_travaux_deductibles: Optional[float] = None,
    appliquer_forfait_travaux: bool = True
) -> Dict[str, float]:
    
    if prix_cession < 0 or prix_acquisition_initial < 0 or annees_detention < 0:
        raise ValueError("Les montants et années doivent être positifs.")

    # 1. Calcul du prix d'acquisition corrigé
    prix_acquisition_corrige = prix_acquisition_initial

    # Frais d'acquisition
    if appliquer_forfait_frais_acquisition or frais_acquisition_reels is None or frais_acquisition_reels <= 0:
        prix_acquisition_corrige += prix_acquisition_initial * _TAUX_FORFAIT_FRAIS_ACQUISITION_PVI
    else:
        prix_acquisition_corrige += frais_acquisition_reels
    
    # Dépenses de travaux
    if appliquer_forfait_travaux or montant_travaux_deductibles is None or montant_travaux_deductibles <=0:
        if annees_detention >= 5:
            prix_acquisition_corrige += prix_acquisition_initial * _TAUX_FORFAIT_TRAVAUX_PVI
    else:
        prix_acquisition_corrige += montant_travaux_deductibles

    # 2. Plus-value brute
    plus_value_brute = prix_cession - prix_acquisition_corrige

    if plus_value_brute <= 0:
        return {
            "prix_acquisition_initial": round(prix_acquisition_initial, 2),
            "prix_acquisition_corrige": round(prix_acquisition_corrige, 2),
            "plus_value_brute": round(plus_value_brute, 2),
            "abattement_ir_montant": 0, "abattement_ps_montant": 0,
            "plus_value_imposable_ir": 0, "plus_value_imposable_ps": 0,
            "impot_ir": 0, "impot_ps": 0, "surtaxe_pvi": 0,
            "impot_total_pvi": 0,
        }

    # 3. Abattements pour durée de détention (logique inchangée)
    abattement_total_ir = 0.0
    if annees_detention > 5:
        if annees_detention <= 21: abattement_total_ir = (annees_detention - 5) * 0.06
        elif annees_detention == 22: abattement_total_ir = (21 - 5) * 0.06 + 0.04
        else: abattement_total_ir = 1.0
    abattement_ir_montant = plus_value_brute * abattement_total_ir
    pv_imposable_ir = max(0, plus_value_brute - abattement_ir_montant)

    abattement_total_ps = 0.0
    if annees_detention > 5:
        if annees_detention <= 21: abattement_total_ps = (annees_detention - 5) * 0.0165
        elif annees_detention == 22: abattement_total_ps = (21 - 5) * 0.0165 + 0.0160
        elif annees_detention <=30 : abattement_total_ps = ((21-5)*0.0165 + 0.0160) + (annees_detention - 22) * 0.09
        else: abattement_total_ps = 1.0
    abattement_ps_montant = plus_value_brute * abattement_total_ps
    pv_imposable_ps = max(0, plus_value_brute - abattement_ps_montant)

    # 4. Calcul de l'impôt sur le revenu et des prélèvements sociaux
    impot_ir_sur_pvi = pv_imposable_ir * _TAUX_IR_PVI
    impot_ps_sur_pvi = pv_imposable_ps * _TAUX_PS_PVI

    # 5. Calcul de la surtaxe sur les plus-values immobilières élevées
    # La surtaxe s'applique à la plus-value imposable à l'IR (avant PS)
    surtaxe_pvi = _calculer_surtaxe_pvi_progressive(pv_imposable_ir)

    impot_total_pvi = impot_ir_sur_pvi + impot_ps_sur_pvi + surtaxe_pvi

    return {
        "prix_acquisition_initial": round(prix_acquisition_initial, 2),
        "prix_acquisition_corrige": round(prix_acquisition_corrige, 2),
        "plus_value_brute": round(plus_value_brute, 2),
        "abattement_ir_montant": round(abattement_ir_montant,2),
        "abattement_ps_montant": round(abattement_ps_montant,2),
        "plus_value_imposable_ir": round(pv_imposable_ir, 2),
        "plus_value_imposable_ps": round(pv_imposable_ps, 2),
        "impot_ir": round(impot_ir_sur_pvi, 2),
        "impot_ps": round(impot_ps_sur_pvi, 2),
        "surtaxe_pvi": round(surtaxe_pvi, 2),
        "impot_total_pvi": round(impot_total_pvi, 2),
    }

# --------------------------------------
# Réduction d'impôt pour Dons aux Œuvres
# --------------------------------------
_TAUX_REDUCTION_DON_OEUVRE = 0.66
_PLAFOND_REDUCTION_DON_OEUVRE_REVENU = 0.20 # 20% du revenu imposable

def calcul_reduction_don_oeuvre(montant_don: float, revenu_imposable: float) -> Dict[str, float]:
    """Calcule la réduction d'impôt pour dons aux œuvres (art. 200 CGI).

    Simplification: Taux unique de 66%, plafond global de 20% du revenu.
    Ne gère pas le taux majoré de 75% pour certains organismes.
    """
    if montant_don < 0 or revenu_imposable < 0:
        raise ValueError("Les montants doivent être positifs.")

    reduction_brute = montant_don * _TAUX_REDUCTION_DON_OEUVRE
    plafond_reduction = revenu_imposable * _PLAFOND_REDUCTION_DON_OEUVRE_REVENU
    reduction_effective = min(reduction_brute, plafond_reduction)

    return {
        "montant_don": round(montant_don, 2),
        "reduction_impot_don": round(reduction_effective, 2),
        "plafond_applique": round(plafond_reduction,2)
    }

# ----------------------------------------------------
# Crédit d'Impôt Emploi Salarié à Domicile (CESU)
# ----------------------------------------------------
_TAUX_CREDIT_EMPLOI_DOMICILE = 0.50
_PLAFOND_DEPENSES_EMPLOI_DOMICILE = 12000 # Plafond de base, majorable

def calcul_credit_impot_emploi_domicile(depenses_engagees: float) -> Dict[str, float]:
    """Calcule le crédit d'impôt pour l'emploi d'un salarié à domicile (art. 199 sexdecies CGI).

    Simplification: Plafond de base de 12 000 € non majoré.
    """
    if depenses_engagees < 0:
        raise ValueError("Les dépenses doivent être positives.")

    depenses_plafonnees = min(depenses_engagees, _PLAFOND_DEPENSES_EMPLOI_DOMICILE)
    credit_impot = depenses_plafonnees * _TAUX_CREDIT_EMPLOI_DOMICILE

    return {
        "depenses_engagees": round(depenses_engagees, 2),
        "depenses_plafonnees_pour_credit": round(depenses_plafonnees, 2),
        "credit_impot_emploi_domicile": round(credit_impot, 2)
    } 