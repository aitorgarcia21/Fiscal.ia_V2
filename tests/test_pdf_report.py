from backend.pdf_report import generate_pdf_report, generate_pdf_multiscenario, generate_professional_report
from backend.scenario_output import ScenarioOutputDetail, ImpactChiffre
import os
import pytest
from typing import List, Dict

def test_generate_pdf_multiscenario(tmp_path):
    scenarios = [
        {"titre": "Scénario 1 – Actuel", "contenu": "Texte scénario 1."},
        {"titre": "Scénario 2 – Optimisé", "contenu": "Texte scénario 2."},
    ]
    output_file = tmp_path / "rapport_multi.pdf"
    path_generated = generate_pdf_multiscenario(scenarios, ["CGI 197"], str(output_file))
    assert output_file.exists()
    assert output_file.stat().st_size > 0 

@pytest.fixture
def sample_scenarios_data() -> List[Dict]:
    """Crée des données de scénarios factices pour tester generate_professional_report."""
    scenario1 = ScenarioOutputDetail(
        titre_strategie="Stratégie PER - Test",
        description_breve="Simulation d'un versement PER.",
        impacts_chiffres_cles=[
            ImpactChiffre(libelle="Revenu Imposable", valeur_avant="70000.00", valeur_apres="63000.00", variation="-7000.00"),
            ImpactChiffre(libelle="Impôt Estimé", valeur_avant="15000.00", valeur_apres="12000.00", variation="-3000.00")
        ],
        avantages=["Réduction d'impôt immédiate.", "Préparation retraite."],
        inconvenients_ou_points_attention=["Fonds bloqués jusqu'à la retraite.", "Fiscalité à la sortie."],
        texte_explicatif_complementaire="Le PER est un produit d'épargne à long terme...",
        sources_rag_text="Sources : CGI Art. 163 quatervicies"
    ).model_dump()
    
    scenario2 = ScenarioOutputDetail(
        titre_strategie="Stratégie LMNP - Test",
        description_breve="Simulation LMNP micro-BIC.",
        impacts_chiffres_cles=[
            ImpactChiffre(libelle="Revenus Locatifs Bruts", valeur_apres="12000.00"),
            ImpactChiffre(libelle="Abattement Micro-BIC", valeur_apres="6000.00"),
            ImpactChiffre(libelle="IR sur Loyers (estimation)", valeur_apres="660.00", unite="€ approx.")
        ],
        avantages=["Simplicité."],
        inconvenients_ou_points_attention=["Plafonné."],
        texte_explicatif_complementaire="Le régime micro-BIC est simple à mettre en oeuvre..."
    ).model_dump()
    return [scenario1, scenario2]

def test_generate_professional_report_creation(tmp_path, sample_scenarios_data):
    """Teste la création et la non-vacuité du rapport PDF professionnel."""
    client_name = "M. John Doe (Test)"
    output_file_path = tmp_path / "professional_report.pdf"
    
    generated_path = generate_professional_report(
        output_path=str(output_file_path),
        client_name=client_name,
        scenarios_data=sample_scenarios_data
    )
    
    assert os.path.exists(generated_path), "Le rapport PDF professionnel n'a pas été créé."
    assert output_file_path.exists(), "Le chemin de sortie du rapport PDF professionnel est incorrect."
    assert os.path.getsize(generated_path) > 1000, "Le rapport PDF professionnel semble vide ou trop petit (vérifier > 1KB)."

def test_generate_professional_report_no_client_name(tmp_path, sample_scenarios_data):
    """Teste la création sans nom de client."""
    output_file_path = tmp_path / "professional_report_no_client.pdf"
    generated_path = generate_professional_report(str(output_file_path), None, sample_scenarios_data)
    assert os.path.exists(generated_path)
    assert os.path.getsize(generated_path) > 1000

def test_generate_professional_report_no_scenarios(tmp_path):
    """Teste la création avec une liste de scénarios vide."""
    output_file_path = tmp_path / "professional_report_no_scenarios.pdf"
    # La fonction devrait gérer cela gracieusement, peut-être en générant un PDF avec un message
    # ou en levant une exception spécifique si ce n'est pas un cas d'usage attendu.
    # Pour l'instant, on s'attend à ce qu'elle produise un document (même minimaliste ou avec un avertissement).
    generated_path = generate_professional_report(str(output_file_path), "Test Client", [])
    assert os.path.exists(generated_path)
    assert os.path.getsize(generated_path) > 0 # Peut être très petit, juste la page de titre 