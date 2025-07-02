from typing import Dict, Tuple

# Plafonds et taux 2025 (simplifiés)
_GARDE_ENFANT_TAUX = 0.50
_GARDE_ENFANT_PLAFOND_DEPENSES = 3500  # par enfant de < 6 ans

_SCOLARITE_CREDIT = {
    "college": 61,
    "lycee": 153,
    "superieur": 183,
}

_MA_PRIME_RENOV_TAUX = 0.30  # simplifié

_PME_INVEST_TAUX = 0.25
_PME_INVEST_PLAFOND = 50000  # versement pris en compte (couple)


def _credit_garde_enfants(data: Dict) -> Tuple[float, Dict]:
    montants = []
    for enfant in data.get("enfants", []):
        if enfant.get("age", 0) < 6:
            dep = min(enfant.get("depenses", 0), _GARDE_ENFANT_PLAFOND_DEPENSES)
            montants.append(dep)
    credit = sum(montants) * _GARDE_ENFANT_TAUX
    return credit, {"garde_enfants": credit}


def _credit_scolarite(data: Dict) -> Tuple[float, Dict]:
    total = 0.0
    for enfant in data.get("enfants", []):
        level = enfant.get("scolarite")  # 'college', 'lycee', 'superieur'
        if level in _SCOLARITE_CREDIT:
            total += _SCOLARITE_CREDIT[level]
    return total, {"scolarite": total}


def _credit_ma_prime_renov(data: Dict) -> Tuple[float, Dict]:
    depenses = data.get("renovation_energetique", 0)
    credit = depenses * _MA_PRIME_RENOV_TAUX
    return credit, {"renov_energetique": credit}


def _credit_pme(data: Dict) -> Tuple[float, Dict]:
    versement = min(data.get("souscription_pme", 0), _PME_INVEST_PLAFOND)
    credit = versement * _PME_INVEST_TAUX
    return credit, {"pme": credit}


_CREDIT_FUNCS = [_credit_garde_enfants, _credit_scolarite, _credit_ma_prime_renov, _credit_pme]


def calculate_credits(credits_input: Dict, revenu_net: float) -> Tuple[float, Dict]:
    """Calcule le total des crédits/réductions à partir de l'input utilisateur.

    Retourne (total, details)
    """
    total = 0.0
    details: Dict[str, float] = {}
    for func in _CREDIT_FUNCS:
        c, det = func(credits_input)
        total += c
        details.update(det)
    # Ajout d'un exemple de dons (66 %) si présent dans l'input
    dons = credits_input.get("dons", 0)
    if dons:
        reduc = min(dons * 0.66, revenu_net * 0.2)
        total += reduc
        details["dons"] = reduc
    return total, details 