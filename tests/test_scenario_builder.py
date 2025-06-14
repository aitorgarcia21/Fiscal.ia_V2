import pytest
import math
from backend.scenario_builder import build_simple_scenarios, build_advanced_scenarios, format_scenarios_to_text
from backend.questionnaire_schema import QuestionnaireCGP, Identite, RevenusCharges, PatrimoineImmobilier, PatrimoineFinancier, Objectifs, InputsPourOptimisations, DettesIFIDeductibles
from backend.strategies_fiscales import REGISTRE_STRATEGIES, StrategieOptimisation, StrategiePER # Pour mocker
from types import SimpleNamespace
from backend.scenario_output import ScenarioOutputDetail, ImpactChiffre # Pour créer des données de test

# Mock data for RAG search results
FAKE_RAG_ARTICLE = {"source": "CGI Article MOCK", "content": "Contenu mocké"}

@pytest.fixture
def mock_rag_active(monkeypatch):
    monkeypatch.setattr("backend.strategies_fiscales._RAG_SEARCH_ENABLED", True)
    monkeypatch.setattr("backend.strategies_fiscales.rag_search_function", lambda keywords, top_k=1: [FAKE_RAG_ARTICLE] * top_k)

@pytest.fixture
def mock_rag_disabled(monkeypatch):
    monkeypatch.setattr("backend.strategies_fiscales._RAG_SEARCH_ENABLED", False)
    monkeypatch.setattr("backend.strategies_fiscales.rag_search_function", lambda keywords, top_k=1: [])

# --- Données de Questionnaire pour les tests --- 

@pytest.fixture
def default_identite() -> Identite:
    return Identite(nom="Test", prenom="User", date_naissance="1980-01-01", situation_familiale="celibataire", enfants=0)

@pytest.fixture
def default_revenus() -> RevenusCharges:
    # RNI de base (hors locatif) = 50000 + 5000 - 2000 = 53000
    return RevenusCharges(salaires=50000, pensions=0, revenus_locatifs=0, autres_revenus=5000, charges_deductibles=2000)

@pytest.fixture
def default_patrimoine_immo() -> PatrimoineImmobilier:
    return PatrimoineImmobilier(residence_principale_valeur_brute=300000, residences_secondaires_valeur_brute=0, immobilier_locatif_valeur_brute=0, sci_parts_valeur_nette=0)

@pytest.fixture
def default_patrimoine_fin() -> PatrimoineFinancier:
    return PatrimoineFinancier(assurance_vie=50000, autres_actifs_ifi=0)

@pytest.fixture
def default_dettes_ifi() -> DettesIFIDeductibles:
    return DettesIFIDeductibles()

@pytest.fixture
def default_objectifs() -> Objectifs:
    return Objectifs(reduction_ir=True, retraite=False) # retraite=False par défaut pour tester PER conditionnellement

@pytest.fixture
def default_opti_specs() -> InputsPourOptimisations:
    return InputsPourOptimisations()

@pytest.fixture
def base_questionnaire_data(
    default_identite, default_revenus, default_patrimoine_immo, 
    default_patrimoine_fin, default_dettes_ifi, default_objectifs, default_opti_specs
) -> dict:
    q = QuestionnaireCGP(
        identite=default_identite,
        revenus_charges=default_revenus,
        patrimoine_immobilier=default_patrimoine_immo,
        patrimoine_financier=default_patrimoine_fin,
        dettes_ifi_deductibles=default_dettes_ifi,
        objectifs=default_objectifs,
        optimisations_specifiques=default_opti_specs
    )
    return q.model_dump()

# --- Tests pour build_advanced_scenarios --- 

def test_build_advanced_scenarios_situation_actuelle_only(mock_rag_disabled, base_questionnaire_data):
    base_questionnaire_data["objectifs"]["retraite"] = False
    base_questionnaire_data["revenus_charges"]["salaires"] = 0
    base_questionnaire_data["revenus_charges"]["pensions"] = 0
    base_questionnaire_data["revenus_charges"]["autres_revenus"] = 0
    base_questionnaire_data["revenus_charges"]["revenus_locatifs"] = 0 
    base_questionnaire_data["revenus_charges"]["charges_deductibles"] = 0
    scenarios = build_advanced_scenarios(base_questionnaire_data)
    assert len(scenarios) == 1 # Seul le scénario actuel
    assert scenarios[0]["titre_strategie"] == "Scénario 0 – Situation Actuelle (Base de Référence)"
    assert len(scenarios[0]["impacts_chiffres_cles"]) > 0
    assert scenarios[0]["impacts_chiffres_cles"][2]["valeur_apres"] == "0.00 €" # IR de base

def test_build_advanced_scenarios_per_applicable(mock_rag_active, base_questionnaire_data):
    base_questionnaire_data["objectifs"]["retraite"] = True
    base_questionnaire_data["revenus_charges"]["salaires"] = 60000
    base_questionnaire_data["revenus_charges"]["autres_revenus"] = 0
    base_questionnaire_data["revenus_charges"]["charges_deductibles"] = 0
    base_questionnaire_data["revenus_charges"]["revenus_locatifs"] = 0
    base_questionnaire_data["revenus_charges"]["revenu_professionnel_n1"] = None

    scenarios = build_advanced_scenarios(base_questionnaire_data)
    assert len(scenarios) == 2 # Actuel + PER
    per_scenario = next((s for s in scenarios if "PER" in s["titre_strategie"]), None)
    assert per_scenario is not None
    impact_ir_per = next((imp for imp in per_scenario["impacts_chiffres_cles"] if imp["libelle"] == "Impôt sur le Revenu Estimé"), None)
    assert impact_ir_per is not None
    # RBG 60k. IR base 11165.48€. Versement PER (plafond PASS) 4636.80€. RNI après PER 55363.20€. IR après PER 9774.44€.
    # Eco = 11165.48 - 9774.44 = 1391.04€.
    assert impact_ir_per["valeur_apres"] == "9,774.44 €"
    assert impact_ir_per["variation"] == "-1,391.04 €"

def test_build_advanced_scenarios_lmnp_applicable_per_not(mock_rag_active, base_questionnaire_data):
    "Teste que LMNP est généré si applicable, et PER n'est pas généré si non applicable."
    base_questionnaire_data["revenus_charges"]["revenus_locatifs"] = 10000
    base_questionnaire_data["objectifs"]["revenus_complementaires"] = True # Rend LMNP applicable
    base_questionnaire_data["objectifs"]["reduction_ir"] = True # Alternative pour LMNP applicable
    
    base_questionnaire_data["objectifs"]["retraite"] = False # Rend PER non applicable

    scenarios = build_advanced_scenarios(base_questionnaire_data)
    
    titles = [s["titre_strategie"] for s in scenarios]
    assert len(scenarios) == 2 # Actuel + LMNP
    assert "Scénario 0 – Situation Actuelle (Base de Référence)" in titles
    assert "Location Meublée Non Professionnelle (LMNP) - Régime Micro-BIC" in titles
    assert "Versement sur Plan d'Épargne Retraite (PER)" not in titles

    lmnp_scenario = next((s for s in scenarios if "LMNP" in s["titre_strategie"]), None)
    assert lmnp_scenario is not None
    assert len(lmnp_scenario["impacts_chiffres_cles"]) > 0 

def test_build_advanced_scenarios_all_applicable_current_registry(mock_rag_active, base_questionnaire_data):
    full_data = base_questionnaire_data.copy()
    full_data["objectifs"] = Objectifs(
        retraite=True, 
        reduction_ir=True, 
        revenus_complementaires=True, 
        optimisation_ifi=True, # Sera applicable avec le patrimoine ci-dessous
        montant_donation_envisagee=100000 
    ).model_dump()
    full_data["revenus_charges"] = RevenusCharges(
        salaires=120000, pensions=10000, revenus_locatifs=15000, 
        autres_revenus=5000, charges_deductibles=3000,
        revenu_professionnel_n1=100000, # Pour calcul PER basé sur revenu N-1
        disponible_fiscal_per_n=8000 # Pour caper le PER
    ).model_dump()
    full_data["optimisations_specifiques"] = InputsPourOptimisations(
        don_aux_oeuvres_montant=1000, 
        pvi_prix_cession_envisage=200000,
        pvi_prix_acquisition_estime=100000,
        pvi_duree_detention_estimee=10,
        emploi_domicile_depenses=2000
    ).model_dump()
    # Base IFI: RP(2.5M*0.7=1.75M) + Loc(0.5M) + SCI(0.1M) + RS(0.2M) + AutresActifs(0.05M) = 2.6M
    # Dettes: 0.2M + 0.05M = 0.25M. Base Nette = 2.35M -> IFI applicable
    full_data["patrimoine_immobilier"] = PatrimoineImmobilier(residence_principale_valeur_brute=2500000, immobilier_locatif_valeur_brute=500000, sci_parts_valeur_nette=100000, residences_secondaires_valeur_brute=200000).model_dump()
    full_data["patrimoine_financier"] = PatrimoineFinancier(autres_actifs_ifi=50000).model_dump()
    full_data["dettes_ifi_deductibles"] = DettesIFIDeductibles(emprunt_rp_capital_restant_du=200000, autres_dettes_ifi=50000).model_dump()

    scenarios = build_advanced_scenarios(full_data)
    assert len(scenarios) == 7 # Actuel + 6 stratégies
    titles = [s["titre_strategie"] for s in scenarios]
    assert "Scénario 0 – Situation Actuelle (Base de Référence)" in titles
    assert "Versement sur Plan d'Épargne Retraite (PER)" in titles
    assert "Location Meublée Non Professionnelle (LMNP) - Régime Micro-BIC" in titles
    assert any("Donation Familiale (impact IFI)" in t for t in titles)
    assert "Cession Immobilière (Plus-Value)" in titles
    assert "Dons aux Œuvres d'Intérêt Général" in titles
    assert "Crédit d'Impôt Emploi à Domicile (CESU)" in titles

# Test pour build_simple_scenarios (inchangé mais gardé pour l'exemple)
def test_build_simple_scenarios():
    client = {"revenu_imposable": 60000, "marital_status": "celibataire", "enfants": 0}
    scenarios = build_simple_scenarios(client)
    assert len(scenarios) == 2
    assert "Impôt sur le revenu estimé (barème 2025) : 11,165 €" in scenarios[0]["contenu"]
    assert "Impôt sur le revenu estimé : 8,165 €" in scenarios[1]["contenu"]
    assert "Économie d'impôt estimée : 3,000 €" in scenarios[1]["contenu"] 

def test_format_scenarios_to_text(mock_rag_active):
    scenario_actuel_dict = ScenarioOutputDetail(
        titre_strategie="Scénario 0 – Situation Actuelle (Base de Référence)",
        description_breve="Description du scénario actuel.",
        impacts_chiffres_cles=[
            ImpactChiffre(libelle="Revenu Imposable Global Calculé", valeur_apres="60,000.00"), # Pas de € ici
            ImpactChiffre(libelle="Impôt sur le Revenu de Base", valeur_apres="11,165.48")
        ],
        avantages=["Point de départ pour comparaison."],
        inconvenients_ou_points_attention=["Fiscalité actuelle sans optimisation."],
        texte_explicatif_complementaire="Explication du scénario actuel."
    ).model_dump()
    scenario_per_dict = ScenarioOutputDetail(
        titre_strategie="Versement sur Plan d'Épargne Retraite (PER)",
        description_breve="Optimisation PER.",
        impacts_chiffres_cles=[
            ImpactChiffre(libelle="Versement PER annuel simulé", valeur_apres="4,636.80"), # Basé sur Plafond PASS
            ImpactChiffre(libelle="Impôt sur le Revenu Estimé", valeur_avant="11,165.48", valeur_apres="9,774.44", variation="-1,391.04")
        ],
        avantages=["Réduction d'impôt.", "Épargne retraite."],
        inconvenients_ou_points_attention=["Fonds bloqués."],
        texte_explicatif_complementaire="Explication du PER.",
        sources_rag_text="\n\nSources légales suggérées (CGI) :\n- CGI Article MOCK (Pertinence indicative)\n"
    ).model_dump()
    scenarios_data_list = [scenario_actuel_dict, scenario_per_dict]
    report_text = format_scenarios_to_text(scenarios_data_list)
    assert "RAPPORT D'ANALYSE FISCALE ET PATRIMONIALE" in report_text
    assert "Revenu Imposable Global Calculé : Après = 60,000.00 €" in report_text # € ajouté par formateur
    assert "Impôt sur le Revenu Estimé : Avant = 11,165.48 € -> Après = 9,774.44 € (Variation : -1,391.04 €)" in report_text

    # Test avec liste vide
    assert "Aucun scénario à afficher" in format_scenarios_to_text([])
    # Test avec données invalides
    assert "Données de scénario invalides" in format_scenarios_to_text([{"titre_invalide": "test"}]) 