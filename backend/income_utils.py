from typing import Dict, Tuple

# Abattements et taux 2025 (simplifiés)
_MICRO_BIC_ABATTEMENT_VENTE = 0.71  # ventes / LMNP pro > we treat LMNP separately in calculs_fiscaux
_MICRO_BIC_ABATTEMENT_SERVICE = 0.50
_MICRO_BNC_ABATTEMENT = 0.34
_MICRO_FONCIER_ABATTEMENT = 0.30

_TAUX_IR_PFU = 0.128
_TAUX_PS = 0.172


def _abattement_micro_infer(brut: float, abattement: float) -> float:
    """Retourne le revenu net après abattement micro."""
    return max(0.0, brut * (1 - abattement))


def compute_revenu_net_imposable(incomes: Dict) -> Tuple[float, float]:
    """Calcule le revenu net imposable à l'IR et les taxes forfaitaires déjà liquidées (PFU).

    Parameters
    ----------
    incomes : dict
        Structure attendue : {
          "salaires": 38000,
          "dividendes": 5000,
          "dividendes_PFU": True,
          "microBIC": 20000,  # prestations de service
          "microBIC_ventes": 10000,
          "microBNC": 8000,
          "microFoncier": 12000,
        }

    Returns
    -------
    (revenu_net_imposable, taxes_forfaitaires_deja_calculees)
    """
    revenu_net = 0.0
    taxes_forfaitaires = 0.0

    # Traitements et salaires (on suppose déjà nets des 10 %)
    revenu_net += incomes.get("salaires", 0.0)

    # Revenus micro-BIC
    if "microBIC" in incomes:
        revenu_net += _abattement_micro_infer(incomes["microBIC"], _MICRO_BIC_ABATTEMENT_SERVICE)
    if "microBIC_ventes" in incomes:
        revenu_net += _abattement_micro_infer(incomes["microBIC_ventes"], _MICRO_BIC_ABATTEMENT_VENTE)

    # Micro-BNC
    if "microBNC" in incomes:
        revenu_net += _abattement_micro_infer(incomes["microBNC"], _MICRO_BNC_ABATTEMENT)

    # Micro-foncier
    if "microFoncier" in incomes:
        revenu_net += _abattement_micro_infer(incomes["microFoncier"], _MICRO_FONCIER_ABATTEMENT)

    # Dividendes
    dividendes = incomes.get("dividendes", 0.0)
    if dividendes:
        if incomes.get("dividendes_PFU", True):
            # PFU : IR 12,8 % + PS 17,2 % directement dus
            taxes_forfaitaires += dividendes * (_TAUX_IR_PFU + _TAUX_PS)
        else:
            # Barème : abattement 40 % – PS à 17,2 % hors IR
            revenu_net += dividendes * 0.6
            taxes_forfaitaires += dividendes * _TAUX_PS

    # TODO: plus-values mobilières, intérêts, etc.

    return revenu_net, taxes_forfaitaires 