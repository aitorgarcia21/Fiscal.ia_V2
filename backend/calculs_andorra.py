"""backend/calculs_andorra.py
Utilitaires simples pour la fiscalité andorrane :
1. calc_igi : calcule l'IGI à partir d'un montant HT et d'un taux.
2. calc_irpf : calcule l'IRPF andorran (barème 2025).
Ces fonctions sont utilisées par les endpoints /tools/igi et /tools/irpf.
"""
from typing import Dict, Literal

# Taux IGI officiels (Llei 11/2012, texte refondu 2023)
_IGI_RATES = {
    "general": 0.045,    # 4,5 %
    "reduite": 0.01,     # 1 %
    "speciale": 0.025,   # 2,5 %
    "majoree": 0.095,    # 9,5 %
    "zero": 0.0,         # 0 % (export, intracommunautaire)
}


def calc_igi(ht: float, taux: Literal["general", "reduite", "speciale", "majoree", "zero"] = "general") -> Dict[str, float]:
    """Calcule l'IGI et le TTC.

    Paramètres
    ----------
    ht : float
        Montant hors taxe.
    taux : str
        Clé parmi 'general', 'reduite', 'speciale', 'majoree', 'zero'.
    """
    if ht < 0:
        raise ValueError("Le montant HT doit être positif.")
    if taux not in _IGI_RATES:
        raise ValueError("Taux IGI inconnu.")

    rate = _IGI_RATES[taux]
    igi = round(ht * rate, 2)
    ttc = round(ht + igi, 2)
    return {
        "ht": round(ht, 2),
        "taux": rate,
        "igi": igi,
        "ttc": ttc,
    }


# Barème IRPF Andorre 2025 (art. 83 Llei 5/2014 mod.)
_IRPF_TRANCHES = [
    (0, 24_000, 0.0),       # 0 %
    (24_000, 40_000, 0.05), # 5 %
    (40_000, float("inf"), 0.10),  # 10 %
]


def calc_irpf(revenu_net: float) -> Dict[str, float]:
    """Calcule l'IRPF andorran 2025.

    Pas de quotient familial : chaque contribuable est imposé individuellement.
    """
    if revenu_net < 0:
        raise ValueError("Le revenu doit être positif.")

    impots = 0.0
    for inf, sup, tx in _IRPF_TRANCHES:
        if revenu_net > inf:
            impots += (min(revenu_net, sup) - inf) * tx
        else:
            break
    impots = round(impots, 2)
    taux_moyen = round((impots / revenu_net) if revenu_net else 0.0, 4)

    return {
        "revenu_net": round(revenu_net, 2),
        "irpf": impots,
        "taux_moyen": taux_moyen,
    }


# Petit test manuel
if __name__ == "__main__":
    print(calc_igi(1000, "general"))
    print(calc_irpf(55_000)) 