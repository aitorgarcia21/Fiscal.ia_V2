import pytest
import math
# Commenter les imports des stratégies non encore migrées vers ScenarioOutputDetail
from backend.strategies_fiscales import StrategiePER, StrategieLMNP, StrategieDonationIFI, StrategiePVI, StrategieDonsOeuvres, StrategieCESU, _PLAFOND_MINIMUM_PER_N1_PASS, _PLAFOND_MAX_REVENU_PRO_PER_N1_PASS_X8, get_rag_sources_text_for_strategy
from backend.questionnaire_schema import QuestionnaireCGP, Identite, RevenusCharges, Objectifs, PatrimoineImmobilier, PatrimoineFinancier, InputsPourOptimisations, DettesIFIDeductibles
from backend.calculs_fiscaux import impot_revenu_net, impot_ifi, calcul_plus_value_immobiliere # impot_ifi pour recalculer les attentes

# --- Mock de base pour RAG --- (comme dans test_scenario_builder)
FAKE_RAG_ARTICLE_STRATEGIE = {"source": "CGI Article STRAT (Mocked)", "content": "Contenu mocké strat"}

@pytest.fixture
def mock_rag_strats_enabled(monkeypatch):
    monkeypatch.setattr("backend.strategies_fiscales._RAG_SEARCH_ENABLED", True)
    monkeypatch.setattr("backend.strategies_fiscales.rag_search_function", lambda keywords, top_k=1: [FAKE_RAG_ARTICLE_STRATEGIE] * top_k)

@pytest.fixture
def mock_rag_strats_disabled(monkeypatch):
    monkeypatch.setattr("backend.strategies_fiscales._RAG_SEARCH_ENABLED", False)
    monkeypatch.setattr("backend.strategies_fiscales.rag_search_function", lambda keywords, top_k=1: [])

# --- Fixtures de données QuestionnaireCGP pour les stratégies --- 

@pytest.fixture
def client_data_base() -> QuestionnaireCGP:
    return QuestionnaireCGP(
        identite=Identite(nom="Base", prenom="Client", date_naissance="1980-01-01", situation_familiale="celibataire", enfants=0),
        revenus_charges=RevenusCharges(salaires=60000, pensions=0, revenus_locatifs=0, autres_revenus=0, charges_deductibles=0, revenu_professionnel_n1=None, disponible_fiscal_per_n=None),
        patrimoine_immobilier=PatrimoineImmobilier(residence_principale_valeur_brute=1000000, immobilier_locatif_valeur_brute=0, sci_parts_valeur_nette=0, residences_secondaires_valeur_brute=0),
        patrimoine_financier=PatrimoineFinancier(autres_actifs_ifi=100000, assurance_vie=0, compte_titres=0, crypto=0, liquidites=0),
        dettes_ifi_deductibles=DettesIFIDeductibles(emprunt_rp_capital_restant_du=50000, emprunts_rs_capital_restant_du=0, emprunts_locatif_capital_restant_du=0, autres_dettes_ifi=0),
        objectifs=Objectifs(retraite=False, reduction_ir=True, optimisation_ifi=False), # PER non applicable par défaut ici
        optimisations_specifiques=InputsPourOptimisations()
    )

# --- Tests pour StrategiePER --- 

class TestStrategiePER:
    strategy_instance = StrategiePER()

    def test_per_est_applicable_nominal(self, client_data_base):
        client_data_base_copy = client_data_base.model_copy(deep=True)
        client_data_base_copy.objectifs.retraite = True
        contexte = {"revenu_imposable_global": 60000} # RNI 2024
        assert self.strategy_instance.est_applicable(client_data_base_copy, contexte) is True

    def test_per_est_applicable_objectif_retraite_false(self, client_data_base):
        client_data_base_copy = client_data_base.model_copy(deep=True)
        client_data_base_copy.objectifs.retraite = False 
        contexte = {"revenu_imposable_global": 60000}
        assert self.strategy_instance.est_applicable(client_data_base_copy, contexte) is False
    
    def test_per_est_applicable_revenu_nul_objectif_retraite(self, client_data_base):
        client_data_base_copy = client_data_base.model_copy(deep=True)
        client_data_base_copy.objectifs.retraite = True
        contexte = {"revenu_imposable_global": 0} 
        assert self.strategy_instance.est_applicable(client_data_base_copy, contexte) is True # Toujours applicable si objectif retraite, même avec RNI 0 (car plafond PASS)

    # Test nominal (revenus 2024 = 60k, pas d'info N-1 donc plafond PER = 10% PASS 2023)
    def test_per_scenario_plafond_pass_n1(self, client_data_base, mock_rag_strats_enabled):
        client_data_base_copy = client_data_base.model_copy(deep=True)
        client_data_base_copy.objectifs.retraite = True
        # revenu_imposable_global_actuel (2024) = 60k
        client_data_base_copy.revenus_charges = RevenusCharges(salaires=60000, revenu_professionnel_n1=None, disponible_fiscal_per_n=None)
        
        ir_base_2024 = impot_revenu_net(60000, 1.0) # 11165.48
        contexte = {"revenu_imposable_global": 60000}
        
        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_base_copy, ir_base_2024, 1.0, contexte)
        assert scenario_output is not None
        # Plafond PER pour versements 2024 = _PLAFOND_MINIMUM_PER_N1_PASS (4399.20) car revenu_pro_n1 est None.
        # Versement simulé (10% de 60k = 6k) est capé à 4399.20.
        # RNI après PER = 60000 - 4399.20 = 55600.80.
        # IR sur 55600.80 = 9860.72€. Eco = 11165.48 - 9860.72 = 1304.76€.
        assert any(imp.libelle == "Versement PER annuel simulé (en 2024)" and imp.valeur_apres == "4,399.20" for imp in scenario_output.impacts_chiffres_cles)
        impact_ir = next((imp for imp in scenario_output.impacts_chiffres_cles if imp.libelle == "Impôt sur le Revenu Estimé (sur revenus 2024)"), None)
        assert impact_ir is not None; assert impact_ir.valeur_apres == "9,860.72"; assert impact_ir.variation == "-1,304.76"
        assert "Plafond PER basé sur 10% du PASS 2023 (4,399.20 €)" in scenario_output.texte_explicatif_complementaire
        assert "revenus pro 2023 non fournis ou nuls" in scenario_output.texte_explicatif_complementaire

    def test_per_scenario_plafond_revenu_n1(self, client_data_base, mock_rag_strats_enabled):
        client_data_base_copy = client_data_base.model_copy(deep=True)
        client_data_base_copy.objectifs.retraite = True
        client_data_base_copy.revenus_charges = RevenusCharges(salaires=80000, revenu_professionnel_n1=70000, disponible_fiscal_per_n=None) # RNI 2024 = 80k, Rev Pro 2023 = 70k

        ir_base_2024 = impot_revenu_net(80000, 1.0) # 17165.48
        contexte = {"revenu_imposable_global": 80000}
        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_base_copy, ir_base_2024, 1.0, contexte)
        assert scenario_output is not None
        # Plafond N-1 (10% de 70k) = 7000. Plafond PASS 2023 = 4399.20. Max des deux = 7000.
        # Versement simulé (10% de 80k = 8k) est capé à 7000.
        assert any(imp.libelle == "Versement PER annuel simulé (en 2024)" and imp.valeur_apres == "7,000.00" for imp in scenario_output.impacts_chiffres_cles)
        assert "Plafond PER basé sur 10% des revenus pro 2023 (70,000.00 €), soit 7,000.00 €" in scenario_output.texte_explicatif_complementaire

    def test_per_scenario_plafond_disponible_fiscal_limitant(self, client_data_base, mock_rag_strats_enabled):
        client_data_base_copy = client_data_base.model_copy(deep=True)
        client_data_base_copy.objectifs.retraite = True
        client_data_base_copy.revenus_charges = RevenusCharges(salaires=100000, revenu_professionnel_n1=80000, disponible_fiscal_per_n=5000)
        
        ir_base_2024 = impot_revenu_net(100000, 1.0) 
        contexte = {"revenu_imposable_global": 100000}
        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_base_copy, ir_base_2024, 1.0, contexte)
        assert scenario_output is not None
        # Plafond N-1 (10% de 80k) = 8000. Plafond PASS 2023 = 4399.20. Max = 8000.
        # Plafond final limité par disponible fiscal = 5000.
        # Versement simulé (10% de 100k = 10k) est capé à 5000.
        assert any(imp.libelle == "Versement PER annuel simulé (en 2024)" and imp.valeur_apres == "5,000.00" for imp in scenario_output.impacts_chiffres_cles)
        assert "limité par votre disponible fiscal connu de 5,000.00 €" in scenario_output.texte_explicatif_complementaire
    
    def test_per_scenario_versement_nul_plafond_disponible(self, client_data_base):
        client_data_base_copy = client_data_base.model_copy(deep=True)
        client_data_base_copy.objectifs.retraite = True
        client_data_base_copy.revenus_charges = RevenusCharges(salaires=0, revenu_professionnel_n1=50000, disponible_fiscal_per_n=5000)

        ir_base = 0; parts_fiscales = 1.0
        contexte = {"revenu_imposable_global": 0}
        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_base_copy, ir_base, parts_fiscales, contexte)
        assert scenario_output is not None
        assert "(Plafond disponible)" in scenario_output.titre_strategie
        assert any(imp.libelle == "Plafond de déduction PER estimé (pour versements 2024)" and imp.valeur_apres == "5,000.00" for imp in scenario_output.impacts_chiffres_cles)
        assert any(imp.libelle == "Versement PER simulé (pour 2024)" and imp.valeur_apres == "0.00" for imp in scenario_output.impacts_chiffres_cles)
        assert "Votre plafond de déduction PER pour les versements en 2024 est estimé à 5,000.00 €." in scenario_output.texte_explicatif_complementaire

    def test_per_scenario_rag_disabled(self, client_data_base, mock_rag_strats_disabled):
        client_data_base_copy = client_data_base.model_copy(deep=True)
        client_data_base_copy.objectifs.retraite = True
        client_data_base_copy.revenus_charges.salaires = 60000
        client_data_base_copy.revenus_charges.revenu_professionnel_n1 = None
        ir_base = 11165.48 
        parts_fiscales = 1.0
        contexte = {"revenu_imposable_global": 60000}
        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_base_copy, ir_base, parts_fiscales, contexte)
        assert scenario_output is not None
        assert scenario_output.sources_rag_text == ""

# --- Tests pour StrategieLMNP --- 

class TestStrategieLMNP:
    strategy_instance = StrategieLMNP()

    @pytest.fixture
    def client_data_lmnp(self, client_data_base: QuestionnaireCGP) -> QuestionnaireCGP:
        client_data_base_copy = client_data_base.model_copy(deep=True)
        client_data_base_copy.revenus_charges.revenus_locatifs = 15000
        client_data_base_copy.objectifs.revenus_complementaires = True 
        client_data_base_copy.objectifs.reduction_ir = True 
        return client_data_base_copy

    def test_lmnp_est_applicable(self, client_data_lmnp):
        # RNI base (client_data_base) = 60k. Loyers 15k. Contexte RGlobal = 75k.
        contexte = {"revenu_imposable_global": 75000} 
        assert self.strategy_instance.est_applicable(client_data_lmnp, contexte) is True

    def test_lmnp_est_applicable_pas_de_loyers(self, client_data_lmnp: QuestionnaireCGP):
        client_data_lmnp.revenus_charges.revenus_locatifs = 0
        contexte = {"revenu_imposable_global": 60000} # Reste des revenus de client_data_base
        assert self.strategy_instance.est_applicable(client_data_lmnp, contexte) is False

    def test_lmnp_est_applicable_pas_d_objectifs_correspondants(self, client_data_lmnp: QuestionnaireCGP):
        client_data_lmnp.objectifs.revenus_complementaires = False
        client_data_lmnp.objectifs.reduction_ir = False
        contexte = {"revenu_imposable_global": 75000}
        assert self.strategy_instance.est_applicable(client_data_lmnp, contexte) is False

    def test_lmnp_generer_scenario_detail_nominal(self, client_data_lmnp: QuestionnaireCGP, mock_rag_strats_enabled):
        # RNI hors locatif de client_data_lmnp (base sur client_data_base) = 60k (salaires)
        # Loyers = 15k.
        # RBG global (pour ir_base) = 60k + 15k = 75k.
        # IR base sur 75k (1 part) = 15665.48€.
        # LMNP: Abattement 7.5k sur 15k loyers. Base loyers imposables = 7.5k.
        # RG après LMNP = 60k (RNI hors loc) + 7.5k (loyers optimisés) = 67.5k.
        # IR après LMNP (sur 67.5k, 1 part) = 13415.48€.
        # Économie = 15665.48 - 13415.48 = 2250.00€.
        
        revenu_imposable_global_contexte = 60000 + 15000 # Simule le RGlobal calculé par scenario_builder
        ir_base_pour_strategie = impot_revenu_net(revenu_imposable_global_contexte, 1.0) # IR sur le RGlobal avant opti LMNP
        parts_fiscales = 1.0
        contexte_pour_strategie = {"revenu_imposable_global": revenu_imposable_global_contexte}

        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_lmnp, ir_base_pour_strategie, parts_fiscales, contexte_pour_strategie)
        
        assert scenario_output is not None
        assert scenario_output.titre_strategie == self.strategy_instance.nom
        assert scenario_output.description_breve == self.strategy_instance.description_strategie
        
        assert any(imp.libelle == "Revenus Locatifs Bruts Annoncés" and imp.valeur_apres == "15,000.00" for imp in scenario_output.impacts_chiffres_cles)
        assert any(imp.libelle == "Abattement Micro-BIC (50%)" and imp.valeur_apres == "7,500.00" for imp in scenario_output.impacts_chiffres_cles)
        assert any(imp.libelle == "Revenu Global Imposable (simulation avec LMNP)" and imp.valeur_apres == "67,500.00" for imp in scenario_output.impacts_chiffres_cles)
        
        impact_ir = next((imp for imp in scenario_output.impacts_chiffres_cles if imp.libelle == "Impôt sur le Revenu Estimé"), None)
        assert impact_ir is not None
        assert impact_ir.valeur_apres == "13,415.48"
        assert impact_ir.variation == "-2,250.00"

        assert len(scenario_output.avantages) >= 3
        assert "Simplicité administrative" in scenario_output.avantages[0]
        assert len(scenario_output.inconvenients_ou_points_attention) >= 3
        assert "Plafond de recettes annuelles" in scenario_output.inconvenients_ou_points_attention[0]
        assert scenario_output.texte_explicatif_complementaire is not None
        assert "régime micro-BIC" in scenario_output.texte_explicatif_complementaire
        assert "charges réelles" in scenario_output.texte_explicatif_complementaire
        assert scenario_output.sources_rag_text is not None
        assert FAKE_RAG_ARTICLE_STRATEGIE["source"] in scenario_output.sources_rag_text

    def test_lmnp_generer_scenario_detail_rag_disabled(self, client_data_lmnp: QuestionnaireCGP, mock_rag_strats_disabled):
        revenu_imposable_global_contexte = 75000 
        ir_base_pour_strategie = impot_revenu_net(revenu_imposable_global_contexte, 1.0) 
        parts_fiscales = 1.0
        contexte = {"revenu_imposable_global": revenu_imposable_global_contexte}
        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_lmnp, ir_base_pour_strategie, parts_fiscales, contexte)
        assert scenario_output is not None
        assert scenario_output.sources_rag_text == ""

# --- Tests pour StrategieDonationIFI --- 

class TestStrategieDonationIFI:
    strategy_instance = StrategieDonationIFI()

    @pytest.fixture
    def client_data_ifi_fixture(self, client_data_base: QuestionnaireCGP) -> QuestionnaireCGP:
        client_data_base_copy = client_data_base.model_copy(deep=True)
        client_data_base_copy.objectifs.optimisation_ifi = True
        client_data_base_copy.objectifs.montant_donation_envisagee = 100000
        client_data_base_copy.patrimoine_immobilier.residence_principale_valeur_brute = 2500000 
        client_data_base_copy.patrimoine_financier.autres_actifs_ifi = 200000 
        client_data_base_copy.dettes_ifi_deductibles = DettesIFIDeductibles(emprunt_rp_capital_restant_du=50000) 
        return client_data_base_copy

    def test_ifi_est_applicable_nominal(self, client_data_ifi_fixture):
        # Base IFI Nette calculée pour client_data_ifi_fixture:
        # RP Brute 2.5M -> RP Nette (après 30% abat) = 1.75M
        # Autres Actifs IFI = 0.2M. Total Actifs = 1.95M
        # Dettes RP = 50k. Base IFI Nette = 1.95M - 0.05M = 1.9M
        contexte = {"base_ifi_calculee": 1900000} 
        assert self.strategy_instance.est_applicable(client_data_ifi_fixture, contexte) is True

    def test_ifi_est_applicable_base_ifi_nette_insuffisante(self, client_data_ifi_fixture: QuestionnaireCGP):
        contexte = {"base_ifi_calculee": 1200000} # < 1.3M 
        assert self.strategy_instance.est_applicable(client_data_ifi_fixture, contexte) is False

    def test_ifi_generer_scenario_detail_nominal(self, client_data_ifi_fixture: QuestionnaireCGP, mock_rag_strats_enabled):
        ir_base = 0 
        parts_fiscales = 1.0
        base_ifi_contexte = 1900000 
        contexte_pour_strategie = {"base_ifi_calculee": base_ifi_contexte}
        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_ifi_fixture, ir_base, parts_fiscales, contexte_pour_strategie)
        
        assert scenario_output is not None
        montant_don = client_data_ifi_fixture.objectifs.montant_donation_envisagee or 0
        assert scenario_output.titre_strategie == f"{self.strategy_instance.nom_base} de {montant_don:,.0f}€"
        assert scenario_output.description_breve == self.strategy_instance.description_strategie

        impact_ifi = next((imp for imp in scenario_output.impacts_chiffres_cles if imp.libelle == "IFI Estimé"), None)
        assert impact_ifi is not None
        # IFI sur 1.9M = 6700€. Donation 100k€. Base IFI après = 1.8M€. IFI après = 6000€. Eco = 700€.
        assert impact_ifi.valeur_avant == "6,700.00"
        assert impact_ifi.valeur_apres == "6,000.00"
        assert impact_ifi.variation == "-700.00"
        
        assert len(scenario_output.avantages) >= 3
        assert "Réduction potentielle de l'IFI annuel" in scenario_output.avantages[0]
        assert len(scenario_output.inconvenients_ou_points_attention) >= 3
        assert "La donation est un acte irrévocable" in scenario_output.inconvenients_ou_points_attention[0]
        
        assert scenario_output.texte_explicatif_complementaire is not None
        assert "droits de donation" in scenario_output.texte_explicatif_complementaire
        assert "1.300.000 €" in scenario_output.texte_explicatif_complementaire # Vérifie mention du seuil IFI
        assert scenario_output.sources_rag_text is not None
        assert FAKE_RAG_ARTICLE_STRATEGIE["source"] in scenario_output.sources_rag_text

    def test_ifi_generer_scenario_detail_ifi_initial_nul(self, client_data_ifi_fixture: QuestionnaireCGP, mock_rag_strats_disabled):
        client_data_ifi_fixture.objectifs.montant_donation_envisagee = 10000
        ir_base = 0
        parts_fiscales = 1.0
        contexte_ifi_nul = {"base_ifi_calculee": 1200000} 
        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_ifi_fixture, ir_base, parts_fiscales, contexte_ifi_nul)
        assert scenario_output is None

# --- Tests pour StrategiePVI --- 

class TestStrategiePVI:
    strategy_instance = StrategiePVI()

    @pytest.fixture
    def client_data_pvi(self, client_data_base: QuestionnaireCGP) -> QuestionnaireCGP:
        client_data_base_copy = client_data_base.model_copy(deep=True)
        client_data_base_copy.optimisations_specifiques = InputsPourOptimisations(
            pvi_prix_cession_envisage=250000,
            pvi_prix_acquisition_estime=150000,
            pvi_duree_detention_estimee=10,
            # Tests avec et sans frais/travaux explicites
            pvi_appliquer_forfait_frais_acquisition=True, 
            pvi_appliquer_forfait_travaux=True 
        )
        return client_data_base_copy

    def test_pvi_est_applicable_nominal(self, client_data_pvi):
        contexte = {}
        assert self.strategy_instance.est_applicable(client_data_pvi, contexte) is True

    def test_pvi_generer_scenario_detail_nominal_forfaits(self, client_data_pvi: QuestionnaireCGP, mock_rag_strats_enabled):
        "Teste PVI avec forfaits pour frais et travaux." 
        ir_base = 0 
        parts_fiscales = 1.0
        contexte = {}
        # Prix acq initial = 150k. Forfait frais (7.5%) = 11250. Forfait travaux (15% car 10 ans > 5) = 22500.
        # Prix acq corrigé = 150000 + 11250 + 22500 = 183750.
        # PV Brute = 250000 - 183750 = 66250.
        # Abattement IR (10 ans, 30%) = 66250 * 0.30 = 19875. PV IR imposable = 66250 - 19875 = 46375.
        # Impôt IR = 46375 * 19% = 8811.25.
        # Abattement PS (10 ans, 8.25%) = 66250 * 0.0825 = 5465.625. PV PS imposable = 66250 - 5465.625 = 60784.375.
        # Impôt PS = 60784.375 * 17.2% = 10454.9125.
        # Surtaxe (PV IR 46375 < 50k) = 0.
        # Total impôt PVI = 8811.25 + 10454.9125 = 19266.1625.

        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_pvi, ir_base, parts_fiscales, contexte)
        assert scenario_output is not None
        assert scenario_output.titre_strategie == self.strategy_instance.nom
        assert scenario_output.description_breve == self.strategy_instance.description_strategie

        assert any(imp.libelle == "Prix d'acquisition corrigé retenu" and imp.valeur_apres == "183,750.00" for imp in scenario_output.impacts_chiffres_cles)
        assert any(imp.libelle == "Plus-value brute calculée" and imp.valeur_apres == "66,250.00" for imp in scenario_output.impacts_chiffres_cles)
        assert any(imp.libelle == "Surtaxe sur Plus-Value Élevée (estimation)" and imp.valeur_apres == "0.00" for imp in scenario_output.impacts_chiffres_cles)
        assert any(imp.libelle == "Total impôt sur plus-value estimé" and imp.valeur_apres == "19,266.16" for imp in scenario_output.impacts_chiffres_cles) # Arrondi
        
        assert len(scenario_output.avantages) >= 3
        assert len(scenario_output.inconvenients_ou_points_attention) >= 3
        assert scenario_output.texte_explicatif_complementaire is not None
        assert "hors résidence principale" in scenario_output.texte_explicatif_complementaire.lower()
        assert "Forfait 7.5%" in scenario_output.texte_explicatif_complementaire
        assert "Forfait 15%" in scenario_output.texte_explicatif_complementaire
        assert scenario_output.sources_rag_text is not None

    def test_pvi_frais_reels_et_surtaxe(self, client_data_pvi: QuestionnaireCGP, mock_rag_strats_enabled):
        "Teste PVI avec frais réels et déclenchement de la surtaxe." 
        assert client_data_pvi.optimisations_specifiques is not None
        client_data_pvi.optimisations_specifiques.pvi_prix_cession_envisage = 350000
        client_data_pvi.optimisations_specifiques.pvi_prix_acquisition_estime = 150000
        client_data_pvi.optimisations_specifiques.pvi_duree_detention_estimee = 7 # Forfait travaux non applicable
        client_data_pvi.optimisations_specifiques.pvi_frais_acquisition_reels = 10000
        client_data_pvi.optimisations_specifiques.pvi_appliquer_forfait_frais_acquisition = False
        client_data_pvi.optimisations_specifiques.pvi_montant_travaux_deductibles = 5000
        client_data_pvi.optimisations_specifiques.pvi_appliquer_forfait_travaux = False
        
        # Prix acq corrigé = 150k + 10k (frais réels) + 5k (travaux réels) = 165k
        # PV Brute = 350k - 165k = 185k
        # Abattement IR (7 ans): (7-5)*6% = 12%. Montant = 185k * 0.12 = 22200. PV IR imposable = 185k - 22200 = 162800.
        # Surtaxe sur 162.8k€: (100k-50k)*0.02 + (150k-100k)*0.03 + (162.8k-150k)*0.04 = 1000 + 1500 + 512 = 3012€

        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_pvi, 0, 1.0, {})
        assert scenario_output is not None
        assert any(imp.libelle == "Prix d'acquisition corrigé retenu" and imp.valeur_apres == "165,000.00" for imp in scenario_output.impacts_chiffres_cles)
        assert any(imp.libelle == "Plus-value brute calculée" and imp.valeur_apres == "185,000.00" for imp in scenario_output.impacts_chiffres_cles)
        assert any(imp.libelle == "Surtaxe sur Plus-Value Élevée (estimation)" and imp.valeur_apres == "3,012.00" for imp in scenario_output.impacts_chiffres_cles)
        assert "Frais d'acquisition considérés", f"Réels ({10000:,.2f})" in scenario_output.texte_explicatif_complementaire 
        assert "Montant des travaux considérés", f"Réels ({5000:,.2f})" in scenario_output.texte_explicatif_complementaire

# --- Tests pour StrategieDonsOeuvres --- 

class TestStrategieDonsOeuvres:
    strategy_instance = StrategieDonsOeuvres()

    @pytest.fixture
    def client_data_dons(self, client_data_base: QuestionnaireCGP) -> QuestionnaireCGP:
        client_data_base_copy = client_data_base.model_copy(deep=True)
        client_data_base_copy.objectifs.reduction_ir = True
        if client_data_base_copy.optimisations_specifiques is None:
            client_data_base_copy.optimisations_specifiques = InputsPourOptimisations()
        assert client_data_base_copy.optimisations_specifiques is not None 
        client_data_base_copy.optimisations_specifiques.don_aux_oeuvres_montant = 1000
        return client_data_base_copy

    def test_dons_est_applicable_nominal(self, client_data_dons):
        contexte = {}
        assert self.strategy_instance.est_applicable(client_data_dons, contexte) is True

    def test_dons_generer_scenario_detail_nominal(self, client_data_dons: QuestionnaireCGP, mock_rag_strats_enabled):
        # client_data_base a salaires=60k, donc RNI global contexte = 60k. IR base = 11165.48€
        ir_base = 11165.48 
        parts_fiscales = 1.0
        contexte = {"revenu_imposable_global": 60000} 

        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_dons, ir_base, parts_fiscales, contexte)
        assert scenario_output is not None
        assert scenario_output.titre_strategie == self.strategy_instance.nom
        assert scenario_output.description_breve == self.strategy_instance.description_strategie

        impact_reduction = next((imp for imp in scenario_output.impacts_chiffres_cles if imp.libelle == "Réduction d'impôt obtenue"), None)
        assert impact_reduction is not None
        assert impact_reduction.valeur_apres == "660.00" # 1000 * 66%
        
        impact_ir = next((imp for imp in scenario_output.impacts_chiffres_cles if imp.libelle == "Impôt sur le Revenu Estimé"), None)
        assert impact_ir is not None
        # IR après don = 11165.48 - 660 = 10505.48€.
        assert impact_ir.valeur_apres == "10,505.48"
        assert impact_ir.variation == "-660.00"

        assert len(scenario_output.avantages) >= 3
        assert "Réduction d'impôt directe" in scenario_output.avantages[0]
        assert len(scenario_output.inconvenients_ou_points_attention) >= 3
        assert "Plafonnement global" in scenario_output.inconvenients_ou_points_attention[0]
        assert scenario_output.texte_explicatif_complementaire is not None
        assert "66% du montant du don" in scenario_output.texte_explicatif_complementaire.lower() # Insensible à la casse
        assert scenario_output.sources_rag_text is not None

    def test_dons_generer_scenario_detail_don_plafonne(self, client_data_dons: QuestionnaireCGP, mock_rag_strats_enabled):
        assert client_data_dons.optimisations_specifiques is not None
        client_data_dons.revenus_charges.salaires = 50000 # RNI Global = 50k
        client_data_dons.optimisations_specifiques.don_aux_oeuvres_montant = 20000 
        
        ir_base = impot_revenu_net(50000, 1.0) # IR sur 50k = 8165.48€
        parts_fiscales = 1.0
        contexte = {"revenu_imposable_global": 50000}

        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_dons, ir_base, parts_fiscales, contexte)
        assert scenario_output is not None
        impact_reduction = next((imp for imp in scenario_output.impacts_chiffres_cles if imp.libelle == "Réduction d'impôt obtenue"), None)
        assert impact_reduction is not None
        # Plafond = 50000 * 20% = 10000. Réduction brute = 20000 * 66% = 13200. Réduction effective = 10000.
        assert impact_reduction.valeur_apres == "10,000.00"

    def test_dons_generer_scenario_detail_pas_de_reduction(self, client_data_dons: QuestionnaireCGP):
        assert client_data_dons.optimisations_specifiques is not None
        client_data_dons.optimisations_specifiques.don_aux_oeuvres_montant = 0
        ir_base = 11165.48
        parts_fiscales = 1.0
        contexte = {"revenu_imposable_global": 60000}
        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_dons, ir_base, parts_fiscales, contexte)
        assert scenario_output is None

# --- Tests pour StrategieCESU ---

class TestStrategieCESU:
    strategy_instance = StrategieCESU()

    @pytest.fixture
    def client_data_cesu(self, client_data_base: QuestionnaireCGP) -> QuestionnaireCGP:
        client_data_base_copy = client_data_base.model_copy(deep=True)
        client_data_base_copy.objectifs.reduction_ir = True
        if client_data_base_copy.optimisations_specifiques is None:
            client_data_base_copy.optimisations_specifiques = InputsPourOptimisations()
        assert client_data_base_copy.optimisations_specifiques is not None
        client_data_base_copy.optimisations_specifiques.emploi_domicile_depenses = 5000
        return client_data_base_copy

    def test_cesu_est_applicable_nominal(self, client_data_cesu):
        contexte = {}
        assert self.strategy_instance.est_applicable(client_data_cesu, contexte) is True

    def test_cesu_generer_scenario_detail_nominal(self, client_data_cesu: QuestionnaireCGP, mock_rag_strats_enabled):
        # RNI base de client_data_base = 60k. IR base = 11165.48€
        ir_base = 11165.48 
        parts_fiscales = 1.0
        contexte = {"revenu_imposable_global": 60000} 

        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_cesu, ir_base, parts_fiscales, contexte)
        assert scenario_output is not None
        assert scenario_output.titre_strategie == self.strategy_instance.nom
        assert scenario_output.description_breve == self.strategy_instance.description_strategie

        impact_credit = next((imp for imp in scenario_output.impacts_chiffres_cles if imp.libelle == "Crédit d'impôt obtenu (50%)"), None)
        assert impact_credit is not None
        assert impact_credit.valeur_apres == "2,500.00" 
        
        impact_ir = next((imp for imp in scenario_output.impacts_chiffres_cles if imp.libelle == "Impôt sur le Revenu Estimé"), None)
        assert impact_ir is not None
        assert impact_ir.valeur_apres == "8,665.48"
        assert impact_ir.variation == "-2,500.00 (crédit)" 

        assert len(scenario_output.avantages) >= 3
        assert "Crédit d'impôt égal à 50%" in scenario_output.avantages[0]
        assert len(scenario_output.inconvenients_ou_points_attention) >= 3
        assert "Plafonnement annuel des dépenses" in scenario_output.inconvenients_ou_points_attention[0]
        assert scenario_output.texte_explicatif_complementaire is not None
        assert "dépenses d'emploi à domicile de 5,000.00 €" in scenario_output.texte_explicatif_complementaire
        assert scenario_output.sources_rag_text is not None
        assert FAKE_RAG_ARTICLE_STRATEGIE["source"] in scenario_output.sources_rag_text

    def test_cesu_generer_scenario_detail_depenses_plafonnees(self, client_data_cesu: QuestionnaireCGP, mock_rag_strats_enabled):
        assert client_data_cesu.optimisations_specifiques is not None
        client_data_cesu.optimisations_specifiques.emploi_domicile_depenses = 15000 
        ir_base = 11165.48 
        parts_fiscales = 1.0
        contexte = {"revenu_imposable_global": 60000}
        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_cesu, ir_base, parts_fiscales, contexte)
        assert scenario_output is not None
        impact_credit = next((imp for imp in scenario_output.impacts_chiffres_cles if imp.libelle == "Crédit d'impôt obtenu (50%)"), None)
        assert impact_credit is not None
        assert impact_credit.valeur_apres == "6,000.00" 
        impact_ir = next((imp for imp in scenario_output.impacts_chiffres_cles if imp.libelle == "Impôt sur le Revenu Estimé"), None)
        assert impact_ir is not None
        assert impact_ir.valeur_apres == "5,165.48"

    def test_cesu_generer_scenario_detail_pas_de_credit(self, client_data_cesu: QuestionnaireCGP):
        assert client_data_cesu.optimisations_specifiques is not None
        client_data_cesu.optimisations_specifiques.emploi_domicile_depenses = 0
        ir_base = 11165.48
        parts_fiscales = 1.0
        contexte = {"revenu_imposable_global": 60000}
        scenario_output = self.strategy_instance.generer_scenario_detail(client_data_cesu, ir_base, parts_fiscales, contexte)
        assert scenario_output is None

# TODO: Ajouter des classes de Test pour chaque autre stratégie (LMNP, DonationIFI, PVI, DonsOeuvres, CESU)
# en suivant un modèle similaire: fixtures pour données client spécifiques, tests pour est_applicable, tests pour generer_scenario_detail (nominal, limites, RAG). 