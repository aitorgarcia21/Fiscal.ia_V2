from typing import Dict, List
from .calculs_fiscaux import nombre_parts, impot_revenu_net, impot_ifi, calcul_plus_value_immobiliere, calcul_reduction_don_oeuvre, calcul_credit_impot_emploi_domicile
from .questionnaire_schema import QuestionnaireCGP, Identite, RevenusCharges, PatrimoineImmobilier, Objectifs # Import du schéma Pydantic
from .strategies_fiscales import REGISTRE_STRATEGIES, ScenarioOutputDetail, ImpactChiffre # Import du registre des stratégies et ScenarioOutputDetail, ImpactChiffre
# Attempt to import RAG search function
# This might require assistant_fiscal.py to be importable without side effects
# or a refactoring of the search function into a more neutral module.
_RAG_SEARCH_ENABLED = False
rag_search_function = None
try:
    from .assistant_fiscal import search_similar_cgi_articles
    rag_search_function = search_similar_cgi_articles
    _RAG_SEARCH_ENABLED = True
    print("INFO: RAG search function loaded for scenario builder.")
except ImportError as e:
    print(f"WARNING: RAG search function could not be loaded for scenario builder: {e}. Scenarios will not include RAG sources.")
except Exception as e:
    # Catch any other exception during import, like missing Mistral API key if assistant_fiscal tries to init client globally
    print(f"WARNING: Error loading RAG search function: {e}. Scenarios will not include RAG sources.")


def build_simple_scenarios(client_data: Dict) -> List[Dict]:
    """Construit deux scénarios : situation actuelle vs. versement PER 10 k€.

    Args:
        client_data (dict): {
            "revenu_imposable": float,
            "marital_status": "celibataire"|"marie"|"pacse",
            "enfants": int,
        }

    Returns:
        List[Dict]: liste de scénarios avec titre et contenu textuel.
    """

    rev = client_data.get("revenu_imposable", 0)
    marital = client_data.get("marital_status", "celibataire")
    enfants = client_data.get("enfants", 0)

    parts = nombre_parts(marital, enfants)
    imp_base = impot_revenu_net(rev, parts)

    # Scénario 1 : actuel
    contenu1 = (
        f"Revenu imposable : {rev:,.0f} €\n"
        f"Nombre de parts : {parts}\n"
        f"Impôt sur le revenu estimé (barème 2025) : {imp_base:,.0f} €"
    )

    # Scénario 2 : versement PER 10 k€ (hypothèse)
    versement_per = 10000
    rev_opt = rev - versement_per
    imp_opt = impot_revenu_net(rev_opt, parts)
    economie = imp_base - imp_opt

    contenu2 = (
        f"Revenu imposable après versement PER 10 000 € : {rev_opt:,.0f} €\n"
        f"Impôt sur le revenu estimé : {imp_opt:,.0f} €\n"
        f"Économie d'impôt estimée : {economie:,.0f} €"
    )

    return [
        {"titre": "Scénario actuel", "contenu": contenu1},
        {"titre": "Scénario PER 10 k€", "contenu": contenu2},
    ]

def _get_rag_sources_text(keywords: str, top_k: int = 1) -> str:
    if not _RAG_SEARCH_ENABLED or not rag_search_function:
        return ""
    try:
        articles = rag_search_function(keywords, top_k=top_k)
        if articles:
            sources_text = "\n\nSources légales suggérées (CGI) :\n"
            for art in articles:
                sources_text += f"- {art.get('source', 'Article non trouvé')} (Pertinence indicative)\n"
            return sources_text
    except Exception as e:
        print(f"ERROR: RAG search failed during scenario building: {e}")
    return ""

# ==========================================================
# Fonction avancée – plusieurs optimisations patrimoniales
# ==========================================================


def build_advanced_scenarios(questionnaire_data_dict: Dict) -> List[Dict]:
    """Construit dynamiquement les scénarios d'optimisation basés sur les stratégies applicables.
    Prend un dictionnaire de données du questionnaire et le valide avec Pydantic.
    """
    try:
        client_profile = QuestionnaireCGP(**questionnaire_data_dict)
    except Exception as e:
        print(f"Erreur de validation du questionnaire Pydantic : {e}")
        # Retourner une liste avec un objet ScenarioOutputDetail d'erreur
        error_detail = ScenarioOutputDetail(
            titre_strategie="Erreur de Données Client",
            description_breve="Les données client fournies ne sont pas valides ou sont incomplètes.",
            applicable=False, # Non applicable car erreur
            impacts_chiffres_cles=[ImpactChiffre(libelle="Erreur", valeur_apres=str(e))]
        )
        return [error_detail.model_dump()] # Retourner comme dict pour l'instant, ou adapter le type de retour global

    revenu_imposable_global_calc = (
        client_profile.revenus_charges.salaires +
        client_profile.revenus_charges.pensions +
        client_profile.revenus_charges.autres_revenus +
        client_profile.revenus_charges.revenus_locatifs - 
        client_profile.revenus_charges.charges_deductibles
    )
    parts_fiscales = nombre_parts(
        client_profile.identite.situation_familiale, 
        client_profile.identite.enfants
    )
    ir_base = impot_revenu_net(revenu_imposable_global_calc, parts_fiscales)

    # Le type de retour de build_advanced_scenarios doit être cohérent.
    # Si les stratégies retournent ScenarioOutputDetail, alors cette fonction devrait retourner List[ScenarioOutputDetail]
    # ou List[Dict] si on convertit .model_dump() à chaque fois.
    # Pour l'instant, on va supposer qu'on retourne List[Dict] pour correspondre aux tests existants.
    scenarios_details: List[ScenarioOutputDetail] = [] 

    # Scénario 0: Situation actuelle - Converti en ScenarioOutputDetail
    impacts_actuel = [
        ImpactChiffre(libelle="Revenu Imposable Global Calculé", valeur_apres=f"{revenu_imposable_global_calc:,.2f} €"),
        ImpactChiffre(libelle="Parts Fiscales", valeur_apres=f"{parts_fiscales:.1f}", unite=""),
        ImpactChiffre(libelle="Impôt sur le Revenu de Base (avant optimisations)", valeur_apres=f"{ir_base:,.2f} €")
    ]
    scenario_actuel_detail = ScenarioOutputDetail(
        titre_strategie="Scénario 0 – Situation Actuelle (Base de Référence)",
        description_breve=f"Situation fiscale de {client_profile.identite.prenom} {client_profile.identite.nom} basée sur les informations fournies, avant toute optimisation.",
        impacts_chiffres_cles=impacts_actuel
    )
    scenarios_details.append(scenario_actuel_detail)
    
    base_ifi_calculee = 0
    if client_profile.patrimoine_immobilier:
        base_ifi_calculee += client_profile.patrimoine_immobilier.residence_principale_valeur_brute * 0.7 
        base_ifi_calculee += client_profile.patrimoine_immobilier.residences_secondaires_valeur_brute
        base_ifi_calculee += client_profile.patrimoine_immobilier.immobilier_locatif_valeur_brute
        base_ifi_calculee += client_profile.patrimoine_immobilier.sci_parts_valeur_nette
    if client_profile.patrimoine_financier:
        base_ifi_calculee += client_profile.patrimoine_financier.autres_actifs_ifi
    total_dettes_ifi = 0
    if client_profile.dettes_ifi_deductibles:
        total_dettes_ifi += client_profile.dettes_ifi_deductibles.emprunt_rp_capital_restant_du
        total_dettes_ifi += client_profile.dettes_ifi_deductibles.emprunts_rs_capital_restant_du
        total_dettes_ifi += client_profile.dettes_ifi_deductibles.emprunts_locatif_capital_restant_du
        total_dettes_ifi += client_profile.dettes_ifi_deductibles.autres_dettes_ifi
    base_ifi_calculee_nette = max(0, base_ifi_calculee - total_dettes_ifi)
    
    contexte_strategies = {
        "revenu_imposable_global": revenu_imposable_global_calc, 
        "base_ifi_calculee": base_ifi_calculee_nette, 
        "parts_fiscales": parts_fiscales,
        "ir_base_avant_opti": ir_base 
    }

    for strategie_instance in REGISTRE_STRATEGIES:
        if strategie_instance.est_applicable(client_profile, contexte_strategies):
            # Correction de l'appel de méthode
            scenario_genere_detail = strategie_instance.generer_scenario_detail(
                client_profile, ir_base, parts_fiscales, contexte_strategies 
            )
            if scenario_genere_detail:
                scenarios_details.append(scenario_genere_detail)
    
    # Convertir List[ScenarioOutputDetail] en List[Dict] pour la sortie et les tests actuels
    return [s.model_dump() for s in scenarios_details]

# Laisser build_simple_scenarios si elle est toujours utilisée ailleurs ou pour des tests simples.
# Elle devra être adaptée si elle doit consommer un QuestionnaireCGP complet. 

def format_scenarios_to_text(scenarios_data: List[Dict]) -> str:
    report_text = "RAPPORT D'ANALYSE FISCALE ET PATRIMONIALE\n"
    report_text += "==================================================\n\n"
    if not scenarios_data or not isinstance(scenarios_data, list):
        return "Aucun scénario à afficher ou données invalides."
    for i, scenario_dict in enumerate(scenarios_data):
        if not isinstance(scenario_dict, dict) or not scenario_dict.get('titre_strategie'):
            report_text += f"SCÉNARIO {i} : Données de scénario invalides ou titre manquant.\n\n"
            continue
        report_text += f"--- SCÉNARIO {i} : {scenario_dict.get('titre_strategie', 'N/A')} ---\n"
        report_text += f"{scenario_dict.get('description_breve', 'Pas de description.')}\n\n"
        report_text += "Impacts Chiffrés Clés :\n"
        impacts = scenario_dict.get('impacts_chiffres_cles', [])
        if impacts:
            for impact in impacts:
                libelle = impact.get('libelle', '?')
                val_avant_raw = impact.get('valeur_avant')
                val_apres_raw = impact.get('valeur_apres', '?')
                variation_raw = impact.get('variation')
                unite = impact.get('unite', '€')
                ligne_impact = f"  - {libelle} : "
                if val_avant_raw is not None:
                    ligne_impact += f"Avant = {val_avant_raw} {unite} -> "
                ligne_impact += f"Après = {val_apres_raw} {unite}"
                if variation_raw is not None:
                    # Pour les variations comme "(x.x%)" ou "(crédit)", on n'ajoute pas l'unité €
                    if "(" in str(variation_raw) and ")" in str(variation_raw):
                        ligne_impact += f" (Variation : {variation_raw})"
                    else:
                        ligne_impact += f" (Variation : {variation_raw} {unite})"
                report_text += ligne_impact + "\n"
        else:
            report_text += "  (Aucun impact chiffré à afficher)\n"
        report_text += "\n"
        avantages = scenario_dict.get('avantages', [])
        if avantages:
            report_text += "Avantages :\n"
            for avantage in avantages: report_text += f"  - {avantage}\n"
        else: report_text += "  (Aucun avantage listé)\n"
        report_text += "\n"
        inconvenients = scenario_dict.get('inconvenients_ou_points_attention', [])
        if inconvenients:
            report_text += "Inconvénients ou Points d'Attention :\n"
            for inconvenient in inconvenients: report_text += f"  - {inconvenient}\n"
        else: report_text += "  (Aucun inconvénient listé)\n"
        report_text += "\n"
        texte_explicatif = scenario_dict.get('texte_explicatif_complementaire')
        if texte_explicatif: report_text += f"Explications Complémentaires :\n{texte_explicatif}\n\n"
        sources_rag = scenario_dict.get('sources_rag_text')
        if sources_rag: report_text += sources_rag 
        report_text += "--------------------------------------------------\n\n"
    return report_text 