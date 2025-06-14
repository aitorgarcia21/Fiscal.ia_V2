import math
import pytest
from backend.calculs_fiscaux import (
    nombre_parts,
    impot_revenu_net,
    impot_ifi,
    montant_tva,
    calcul_plus_value_immobiliere,
    calcul_reduction_don_oeuvre,
    calcul_credit_impot_emploi_domicile,
)


def test_nombre_parts():
    assert nombre_parts("celibataire", 0) == 1
    assert nombre_parts("marie", 0) == 2
    assert nombre_parts("pacse", 1) == 2.5
    assert nombre_parts("marie", 2) == 3
    assert nombre_parts("marie", 4) == 5  # 2 parts base + 1 + 2 enfants sup.


def test_impot_revenu_net():
    parts = nombre_parts("marie", 2)  # 3 parts
    imp = impot_revenu_net(60000, parts)
    # Valeur attendue calculée manuellement (~2 806 €)
    assert math.isclose(imp, 2806, abs_tol=10)


def test_impot_ifi():
    assert impot_ifi(0) == 0
    assert math.isclose(impot_ifi(1500000), 3900, abs_tol=1)  # tranche composite


def test_montant_tva():
    assert montant_tva(100, "normal") == 20
    assert montant_tva(100, "reduite") == 5.5
    with pytest.raises(ValueError):
        montant_tva(-50)
    with pytest.raises(KeyError):
        montant_tva(100, "invalide")


def test_calcul_plus_value_immobiliere():
    # Cas 1: Moins de 5 ans de détention -> pas d'abattement
    pvi1 = calcul_plus_value_immobiliere(200000, 100000, 3)
    assert math.isclose(pvi1["plus_value_brute"], 100000)
    assert math.isclose(pvi1["abattement_ir"], 0)
    assert math.isclose(pvi1["abattement_ps"], 0)
    assert math.isclose(pvi1["impot_total_pvi"], 36200) # 100k * (19% + 17.2%)

    # Cas 2: 10 ans de détention -> abattements partiels
    # IR: (10-5) * 6% = 30% d'abattement
    # PS: (10-5) * 1.65% = 8.25% d'abattement
    pvi2 = calcul_plus_value_immobiliere(200000, 100000, 10)
    assert math.isclose(pvi2["plus_value_brute"], 100000)
    assert math.isclose(pvi2["abattement_ir"], 30000)  # 100k * 30%
    assert math.isclose(pvi2["plus_value_imposable_ir"], 70000)
    assert math.isclose(pvi2["impot_ir"], 13300)       # 70k * 19%
    assert math.isclose(pvi2["abattement_ps"], 8250) # 100k * 8.25%
    assert math.isclose(pvi2["plus_value_imposable_ps"], 91750)
    assert math.isclose(pvi2["impot_ps"], 15781)    # 91.75k * 17.2%
    assert math.isclose(pvi2["impot_total_pvi"], 13300 + 15781)

    # Cas 3: 22 ans de détention -> Exonération IR, abattement PS partiel
    # IR: 100% d'abattement
    # PS: ((21-5)*0.0165 + 0.0160) = 26.4% + 1.6% = 28% d'abattement
    pvi3 = calcul_plus_value_immobiliere(300000, 150000, 22)
    assert math.isclose(pvi3["plus_value_brute"], 150000)
    assert math.isclose(pvi3["abattement_ir"], 150000) # 100%
    assert math.isclose(pvi3["impot_ir"], 0)
    assert math.isclose(pvi3["abattement_ps"], 150000 * 0.28)
    pv_imposable_ps3 = 150000 * (1-0.28)
    assert math.isclose(pvi3["impot_ps"], pv_imposable_ps3 * 0.172)

    # Cas 4: 30 ans de détention -> Exonération totale
    pvi4 = calcul_plus_value_immobiliere(200000, 100000, 30)
    assert math.isclose(pvi4["impot_total_pvi"], 0)

    # Cas 5: Pas de plus-value
    pvi5 = calcul_plus_value_immobiliere(100000, 120000, 10)
    assert math.isclose(pvi5["plus_value_brute"], -20000)
    assert math.isclose(pvi5["impot_total_pvi"], 0)

    with pytest.raises(ValueError):
        calcul_plus_value_immobiliere(-1, 1, 1)


def test_calcul_reduction_don_oeuvre():
    # Cas 1: Don simple, pas de plafonnement
    don1 = calcul_reduction_don_oeuvre(1000, 60000)
    assert math.isclose(don1["montant_don"], 1000)
    assert math.isclose(don1["reduction_impot_don"], 660) # 1000 * 66%
    assert math.isclose(don1["plafond_applique"], 12000) # 60000 * 20%

    # Cas 2: Don plafonné par les 20% du revenu
    don2 = calcul_reduction_don_oeuvre(30000, 50000) # Don 30k, Plafond 10k (50k * 20%)
    assert math.isclose(don2["montant_don"], 30000)
    assert math.isclose(don2["reduction_impot_don"], 10000) # Plafonné à 10k
    assert math.isclose(don2["plafond_applique"], 10000)

    # Cas 3: Don nul
    don3 = calcul_reduction_don_oeuvre(0, 50000)
    assert math.isclose(don3["reduction_impot_don"], 0)

    with pytest.raises(ValueError):
        calcul_reduction_don_oeuvre(-100, 50000)


def test_calcul_credit_impot_emploi_domicile():
    # Cas 1: Dépenses inférieures au plafond
    cesu1 = calcul_credit_impot_emploi_domicile(10000)
    assert math.isclose(cesu1["depenses_engagees"], 10000)
    assert math.isclose(cesu1["depenses_plafonnees_pour_credit"], 10000)
    assert math.isclose(cesu1["credit_impot_emploi_domicile"], 5000) # 10000 * 50%

    # Cas 2: Dépenses supérieures au plafond
    cesu2 = calcul_credit_impot_emploi_domicile(15000)
    assert math.isclose(cesu2["depenses_engagees"], 15000)
    assert math.isclose(cesu2["depenses_plafonnees_pour_credit"], 12000) # Plafonné
    assert math.isclose(cesu2["credit_impot_emploi_domicile"], 6000) # 12000 * 50%

    # Cas 3: Dépenses nulles
    cesu3 = calcul_credit_impot_emploi_domicile(0)
    assert math.isclose(cesu3["credit_impot_emploi_domicile"], 0)

    with pytest.raises(ValueError):
        calcul_credit_impot_emploi_domicile(-100) 