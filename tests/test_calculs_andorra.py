import math
from backend.calculs_andorra import calc_igi, calc_irpf, calc_is, calc_cass


def test_calc_igi_general():
    res = calc_igi(1000, "general")
    assert res == {"ht": 1000.0, "taux": 0.045, "igi": 45.0, "ttc": 1045.0}


def test_calc_igi_speciale():
    res = calc_igi(2000, "speciale")
    assert res["igi"] == 50.0 and res["ttc"] == 2050.0


def test_calc_irpf_55000():
    res = calc_irpf(55_000)
    assert res["irpf"] == 2300.0
    assert math.isclose(res["taux_moyen"], 0.0418, abs_tol=1e-3)


def test_calc_is_standard():
    res = calc_is(100_000, "standard")
    assert res["is"] == 10_000.0


def test_calc_is_holding():
    res = calc_is(100_000, "holding")
    assert res["is"] == 2_000.0


def test_calc_cass_plafond():
    # Au-delà du plafond, on ne cotise pas sur l'excédent
    res = calc_cass(60_000)
    assert res["assiette"] == 49_260
    assert res["part_salarie"] == round(49_260 * 0.065, 2)
    assert res["part_employeur"] == round(49_260 * 0.155, 2) 