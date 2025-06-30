from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from backend.calculs_fiscaux import (
    nombre_parts, impot_revenu_net, impot_ifi,
    calcul_plus_value_immobiliere, calcul_reduction_don_oeuvre,
    calcul_credit_impot_emploi_domicile, _TAUX_FORFAIT_FRAIS_ACQUISITION_PVI, _TAUX_FORFAIT_TRAVAUX_PVI
)
from backend.questionnaire_schema import QuestionnaireCGP, InputsPourOptimisations
from backend.scenario_output import ScenarioOutputDetail, ImpactChiffre

# --- Constantes pour la simulation PER --- 
# Pour les versements effectués en 2024 (déductibles des revenus 2024, imposés en 2025),
# les plafonds sont basés sur les revenus et le PASS de N-1 (2023).
_PASS_2023_POUR_PER_2024 = 43992.0  # Pour versements 2024, impactant impôt 2025
_PLAFOND_MINIMUM_PER_N1_PASS = round(_PASS_2023_POUR_PER_2024 * 0.10, 2)  # 10% PASS N-1 (2023)
_PLAFOND_MAX_REVENU_PRO_PER_N1_PASS_X8 = round((_PASS_2023_POUR_PER_2024 * 8) * 0.10, 2) # 10% de 8xPASS N-1 (2023)

# Tentative d'import pour RAG (comme dans scenario_builder)
_RAG_SEARCH_ENABLED = False
rag_search_function = None
try:
    from backend.assistant_fiscal import search_similar_cgi_articles
    rag_search_function = search_similar_cgi_articles
    _RAG_SEARCH_ENABLED = True
except ImportError:
    pass  # RAG restera désactivé
except Exception:
    pass  # Autres erreurs d'import

def get_rag_sources_text_for_strategy(keywords: str, top_k: int = 1) -> str:
    if not _RAG_SEARCH_ENABLED or not rag_search_function:
        return ""
    try:
        articles = rag_search_function(keywords, top_k=top_k)
        if articles:
            sources_list = [
                f"- {art.get('source', 'Article non trouvé')} (Pertinence indicative)"
                for art in articles
            ]
            return "\n\nSources légales suggérées (CGI) :\n" + "\n".join(sources_list)
    except Exception:  # Erreur silencieuse pour ne pas bloquer la génération
        pass
    return ""

class StrategieOptimisation(ABC):
    nom: str = "Stratégie non définie"
    description_strategie: str = "Description générale de la stratégie fiscale."
    rag_keywords: Optional[str] = None

    @abstractmethod
    def est_applicable(self, client_data: QuestionnaireCGP, contexte: Dict) -> bool:
        """Vérifie si la stratégie est applicable au profil client."""
        pass

    @abstractmethod
    def generer_scenario_detail(self, client_data: QuestionnaireCGP, ir_base: float, parts_fiscales: float, contexte: Dict) -> Optional[ScenarioOutputDetail]:
        """Génère le titre et le contenu textuel du scénario si applicable."""
        pass

class StrategiePER(StrategieOptimisation):
    nom = "Versement sur Plan d'Épargne Retraite (PER)"
    description_strategie = "Optimisation de l'impôt sur le revenu par déduction des versements effectués sur un Plan d'Épargne Retraite (PER)."
    rag_keywords = "Plan Epargne Retraite déduction fiscale article 163 quatervicies CGI"

    def est_applicable(self, client_data: QuestionnaireCGP, contexte: Dict) -> bool:
        revenu_imposable_global = contexte.get("revenu_imposable_global", 0)
        return client_data.objectifs.retraite and revenu_imposable_global >= 0

    def generer_scenario_detail(self, client_data: QuestionnaireCGP, ir_base: float, parts_fiscales: float, contexte: Dict) -> Optional[ScenarioOutputDetail]:
        revenu_imposable_global_actuel = contexte.get("revenu_imposable_global", 0)
        revenu_pro_n1 = client_data.revenus_charges.revenu_professionnel_n1
        disponible_fiscal_avis = client_data.revenus_charges.disponible_fiscal_per_n

        plafond_option_revenu_n1 = 0.0
        texte_calcul_plafond = f"Plafond PER de base (10% du PASS 2023: {_PASS_2023_POUR_PER_2024:,.2f} €) : {_PLAFOND_MINIMUM_PER_N1_PASS:,.2f} €."

        if revenu_pro_n1 is not None and revenu_pro_n1 > 0:
            plafond_option_revenu_n1 = min(round(revenu_pro_n1 * 0.10, 2), _PLAFOND_MAX_REVENU_PRO_PER_N1_PASS_X8)
            texte_calcul_plafond = f"Plafond PER basé sur 10% des revenus professionnels 2023 ({revenu_pro_n1:,.2f} €), soit {plafond_option_revenu_n1:,.2f} € (capé à {_PLAFOND_MAX_REVENU_PRO_PER_N1_PASS_X8:,.2f} €, soit 10% de 8 fois le PASS 2023)."
        
        plafond_epargne_retraite_calcule = max(plafond_option_revenu_n1, _PLAFOND_MINIMUM_PER_N1_PASS)
        if plafond_option_revenu_n1 > 0 and plafond_option_revenu_n1 > _PLAFOND_MINIMUM_PER_N1_PASS:
            texte_calcul_plafond += f" Ce plafond ({plafond_option_revenu_n1:,.2f} €) est retenu car supérieur à 10% du PASS 2023 ({_PLAFOND_MINIMUM_PER_N1_PASS:,.2f} €)."
        elif not (revenu_pro_n1 is not None and revenu_pro_n1 > 0):
             texte_calcul_plafond = f"Plafond PER basé sur 10% du PASS 2023 ({_PLAFOND_MINIMUM_PER_N1_PASS:,.2f} €), car revenus professionnels 2023 non fournis ou nuls."

        plafond_final_deduction_per = plafond_epargne_retraite_calcule
        if disponible_fiscal_avis is not None and disponible_fiscal_avis >= 0:
            plafond_final_deduction_per = min(plafond_epargne_retraite_calcule, disponible_fiscal_avis)
            texte_calcul_plafond += f" Limité par votre disponible fiscal connu (mentionné sur l'avis d'imposition des revenus 2023) de {disponible_fiscal_avis:,.2f} €, le plafond de déduction effectif pour des versements en 2024 est de {plafond_final_deduction_per:,.2f} €."
        else:
            texte_calcul_plafond += f" Le plafond de déduction effectif pour des versements en 2024 (impactant l'impôt 2025) est donc de {plafond_final_deduction_per:,.2f} €. (Disponible fiscal de l'avis d'imposition des revenus 2023 non renseigné pour les versements 2024)."

        versement_per_envisage = min(round(revenu_imposable_global_actuel * 0.10, 2), plafond_final_deduction_per)
        versement_per_envisage = round(max(0, versement_per_envisage), 2)

        if versement_per_envisage == 0:
            if plafond_final_deduction_per > 0:
                 texte_explicatif_aucun_versement = (
                    f"Votre plafond de déduction PER pour les versements en 2024 (calculé sur la base des revenus/PASS 2023) est estimé à {plafond_final_deduction_per:,.2f} €. "
                    f"Cependant, la simulation actuelle (basée sur 10% de votre revenu global 2024 de {revenu_imposable_global_actuel:,.2f} €) suggère un versement de 0.00 € en 2024. "
                    "Vous pourriez envisager un versement jusqu'à votre plafond pour optimiser davantage votre impôt 2025 (sur revenus 2024)."
                 )
                 return ScenarioOutputDetail(
                    titre_strategie=f"{self.nom} (Plafond disponible pour versements 2024)",
                    description_breve=self.description_strategie,
                    impacts_chiffres_cles=[
                        ImpactChiffre(libelle="Plafond de déduction PER estimé (pour versements 2024, basé sur revenus/PASS 2023)", valeur_apres=f"{plafond_final_deduction_per:,.2f}"),
                        ImpactChiffre(libelle="Versement PER simulé (en 2024, pour impôt 2025)", valeur_apres="0.00")
                    ],
                    texte_explicatif_complementaire=texte_explicatif_aucun_versement,
                    avantages=["Information sur le plafond de déduction PER disponible pour les versements en 2024 (impactant l'impôt 2025)."],
                    inconvenients_ou_points_attention=["Aucun versement n'est simulé dans ce scénario basé sur 10% du revenu imposable 2024."],
                    sources_rag_text=get_rag_sources_text_for_strategy(self.rag_keywords) if self.rag_keywords else None
                )
            return None # Pas de versement et pas de plafond, donc pas de scénario pertinent

        rev_apres_per = round(revenu_imposable_global_actuel - versement_per_envisage, 2)
        ir_apres_per = impot_revenu_net(rev_apres_per, parts_fiscales)
        economie_ir = round(ir_base - ir_apres_per, 2)
            
        impacts = [
            ImpactChiffre(libelle="Plafond de déduction PER effectif (pour versements 2024, basé sur revenus/PASS 2023)", valeur_apres=f"{plafond_final_deduction_per:,.2f}"),
            ImpactChiffre(libelle="Versement PER annuel simulé (en 2024)", valeur_apres=f"{versement_per_envisage:,.2f}"),
            ImpactChiffre(libelle="Revenu Imposable Global (base 2024, pour impôt 2025)", valeur_avant=f"{revenu_imposable_global_actuel:,.2f}", valeur_apres=f"{rev_apres_per:,.2f}"),
            ImpactChiffre(libelle="Impôt sur le Revenu Estimé (sur revenus 2024, impôt 2025)", valeur_avant=f"{ir_base:,.2f}", valeur_apres=f"{ir_apres_per:,.2f}", variation=f"-{economie_ir:,.2f}"),
        ]
        avantages = [
            "Réduction de l'impôt sur le revenu 2025 (calculé sur les revenus 2024) grâce à la déduction des versements effectués en 2024.",
            "Constitution d'une épargne pour la retraite, potentiellement avec une gestion pilotée.",
            "Possibilité de déblocage anticipé pour l'acquisition de la résidence principale ou en cas d'accidents de la vie (conditions spécifiques).",
        ]
        inconvenients = [
            "Sommes investies principalement bloquées jusqu'à l'âge de la retraite (sauf cas de déblocage anticipé).",
            "Fiscalité appliquée à la sortie (sur le capital et/ou les rentes), dépendant du type de PER et des options choisies.",
            "Plafonds de déduction légaux à respecter ; la simulation utilise une estimation de ces plafonds basée sur les informations fournies (revenus N-1, PASS N-1, disponible fiscal N-1).",
        ]
        texte_explicatif_final = (
            f"Un versement de {versement_per_envisage:,.2f} € effectué en 2024 sur un Plan d'Épargne Retraite (PER) pourrait réduire votre impôt sur le revenu estimé pour 2025 (calculé sur vos revenus de 2024) d'environ {economie_ir:,.2f} €. "
            f"Ce montant de versement est une suggestion (correspondant à 10% de votre revenu imposable global 2024, soit {revenu_imposable_global_actuel:,.2f} €), et est plafonné par votre disponible fiscal PER pour les versements en 2024.\\n"
            f"Détail du calcul de votre plafond de déduction PER pour les versements 2024 (basé sur les revenus professionnels 2023 et le PASS 2023 de {_PASS_2023_POUR_PER_2024:,.2f} €) : {texte_calcul_plafond}\\n"
            "Il est crucial de vérifier le montant exact de votre 'Plafond Épargne Retraite' indiqué sur votre dernier avis d'imposition (généralement celui des revenus 2023, reçu en 2024) pour confirmer le maximum déductible pour vos versements en 2024. "
            "Les sommes issues des versements volontaires déduits du revenu imposable seront fiscalisées à la sortie du PER (imposition du capital ou de la rente selon les modalités choisies)."
        )
        rag_text = get_rag_sources_text_for_strategy(self.rag_keywords) if self.rag_keywords else None
        return ScenarioOutputDetail(
            titre_strategie=self.nom,
            description_breve=self.description_strategie,
            impacts_chiffres_cles=impacts,
            avantages=avantages,
            inconvenients_ou_points_attention=inconvenients,
            texte_explicatif_complementaire=texte_explicatif_final,
            sources_rag_text=rag_text
        )

class StrategieLMNP(StrategieOptimisation):
    nom = "Location Meublée Non Professionnelle (LMNP) - Régime Micro-BIC"
    description_strategie = "Simulation de l'imposition des revenus de location meublée sous le régime simplifié Micro-BIC, avec abattement forfaitaire de 50% sur les recettes."
    rag_keywords = "Location Meublée Non Professionnelle micro BIC article 50-0 CGI"

    def est_applicable(self, client_data: QuestionnaireCGP, contexte: Dict) -> bool:
        return (client_data.revenus_charges.revenus_locatifs > 0 and
                (client_data.objectifs.revenus_complementaires or client_data.objectifs.reduction_ir))

    def generer_scenario_detail(self, client_data: QuestionnaireCGP, ir_base: float, parts_fiscales: float, contexte: Dict) -> Optional[ScenarioOutputDetail]:
        revenus_locatifs_bruts = client_data.revenus_charges.revenus_locatifs
        revenu_imposable_global_contexte = contexte.get("revenu_imposable_global", 0)
        
        abattement_micro_bic = revenus_locatifs_bruts * 0.50
        revenus_locatifs_imposables_micro = revenus_locatifs_bruts - abattement_micro_bic
        rev_global_apres_lmnp = revenu_imposable_global_contexte - revenus_locatifs_bruts + revenus_locatifs_imposables_micro
        ir_apres_lmnp = impot_revenu_net(rev_global_apres_lmnp, parts_fiscales)
        economie_ir = ir_base - ir_apres_lmnp 

        impacts = [
            ImpactChiffre(libelle="Revenus Locatifs Bruts Annoncés", valeur_apres=f"{revenus_locatifs_bruts:,.2f}"),
            ImpactChiffre(libelle="Abattement Micro-BIC (50%)", valeur_apres=f"{abattement_micro_bic:,.2f}", variation=f"sur base locative de {revenus_locatifs_bruts:,.2f}"),
            ImpactChiffre(libelle="Revenus Locatifs Imposables (Micro-BIC)", valeur_apres=f"{revenus_locatifs_imposables_micro:,.2f}"),
            ImpactChiffre(libelle="Revenu Global Imposable (simulation avec LMNP)", valeur_avant=f"{revenu_imposable_global_contexte:,.2f}", valeur_apres=f"{rev_global_apres_lmnp:,.2f}"),
            ImpactChiffre(libelle="Impôt sur le Revenu Estimé", valeur_avant=f"{ir_base:,.2f}", valeur_apres=f"{ir_apres_lmnp:,.2f}", variation=f"-{economie_ir:,.2f}")
        ]
        
        avantages = [
            "Simplicité administrative et comptable majeure : pas de tenue de comptabilité complexe ni de liasse fiscale à déposer.",
            "Abattement forfaitaire de 50% sur les recettes brutes, ce qui est souvent plus avantageux que l'abattement de 30% du régime micro-foncier applicable aux locations nues.",
            "Idéal pour les bailleurs dont les charges réelles (intérêts d'emprunt, taxes, petites réparations, assurance, etc.) sont inférieures à 50% des recettes.",
            "Permet de démarrer une activité de location meublée avec peu de contraintes administratives."
        ]
        inconvenients = [
            "L'abattement est forfaitaire, impossible de déduire les charges réelles si elles dépassent 50% des recettes.",
            f"Non applicable si les recettes dépassent {SEUIL_MICRO_BIC_LMNP:,} € (seuil pour les revenus 2024, potentiellement actualisé pour 2025).",
            "Les amortissements du bien et du mobilier ne sont pas déductibles en Micro-BIC."
        ]
        
        texte_explicatif = (
            f"Ce scénario évalue l'option pour le régime Micro-BIC pour vos revenus locatifs meublés de {revenus_locatifs_bruts:,.2f} € bruts annuels (base revenus 2024). "
            f"Avec un abattement forfaitaire de 50%, votre revenu net imposable issu de cette activité serait de {revenu_net_lmnp_micro:,.2f} €. "
            f"L'impact sur votre impôt 2025 (sur revenus 2024) est estimé à {economie_ir:,.2f} € par rapport à une situation où ces revenus ne seraient pas encore déclarés ou seraient traités différemment. "
            f"Le seuil de recettes pour bénéficier du régime Micro-BIC est de {SEUIL_MICRO_BIC_LMNP:,} € pour les revenus 2024 (imposition 2025). Ce seuil est susceptible d'être réévalué annuellement. "
            "Si vos charges réelles (y compris amortissements comptables) sont supérieures à 50% de vos recettes brutes, le régime réel simplifié pourrait être plus avantageux. "
            "Ce calcul suppose que les revenus LMNP n'étaient pas encore inclus dans le revenu global fourni, ou qu'ils sont optimisés via ce régime."
        )
        
        rag_text = get_rag_sources_text_for_strategy(self.rag_keywords) if self.rag_keywords else None

        return ScenarioOutputDetail(
            titre_strategie=self.nom,
            description_breve=self.description_strategie,
            impacts_chiffres_cles=impacts,
            avantages=avantages,
            inconvenients_ou_points_attention=inconvenients,
            texte_explicatif_complementaire=texte_explicatif,
            sources_rag_text=rag_text
        )

class StrategieDonationIFI(StrategieOptimisation):
    nom = "Donation temporaire d'usufruit pour réduire l'IFI"
    description_strategie = "Réduction de l'IFI en réalisant une donation temporaire de l'usufruit d'un bien immobilier."
    rag_keywords = "IFI donation temporaire usufruit article 968 CGI"

    def est_applicable(self, client_data: QuestionnaireCGP, contexte: Dict) -> bool:
        patrimoine_net_taxable_ifi = contexte.get("patrimoine_net_taxable_ifi_avant_strategie", 0)
        return (client_data.objectifs.transmission_anticipee and
                client_data.patrimoine_financier_immobilier.biens_immobiliers is not None and
                len(client_data.patrimoine_financier_immobilier.biens_immobiliers) > 0 and
                patrimoine_net_taxable_ifi >= _SEUIL_IFI) # Le seuil d'imposition à l'IFI

    def generer_scenario_detail(self, client_data: QuestionnaireCGP, ir_base: float, parts_fiscales: float, contexte: Dict) -> Optional[ScenarioOutputDetail]:
        bien_a_donner = None
        if client_data.patrimoine_financier_immobilier.biens_immobiliers:
            biens_eligibles = [
                b for b in client_data.patrimoine_financier_immobilier.biens_immobiliers 
                if b.valeur_actuelle > 0 and not b.est_residence_principale
            ]
            if biens_eligibles:
                biens_eligibles.sort(key=lambda b: b.valeur_actuelle, reverse=True)
                bien_a_donner = biens_eligibles[0]

        if not bien_a_donner:
            return None

        valeur_bien_concerne = bien_a_donner.valeur_actuelle
        DUREE_USUFRUIT_TEMPORAIRE = 10 
        COEFF_USUFRUIT_TEMPORAIRE = 0.23 
        valeur_usufruit_temporaire = round(valeur_bien_concerne * COEFF_USUFRUIT_TEMPORAIRE * (DUREE_USUFRUIT_TEMPORAIRE / 10), 2)

        patrimoine_ifi_initial = contexte.get("patrimoine_net_taxable_ifi_avant_strategie", 0)
        ifi_initial = impot_ifi(patrimoine_ifi_initial)

        patrimoine_ifi_apres_donation = round(patrimoine_ifi_initial - valeur_usufruit_temporaire, 2)
        ifi_apres_donation = impot_ifi(patrimoine_ifi_apres_donation)
        economie_ifi = round(ifi_initial - ifi_apres_donation, 2)

        if economie_ifi <= 0: 
            return None

        impacts = [
            ImpactChiffre(libelle=f"Valeur du bien concerné ('{bien_a_donner.description_bien}')", valeur_apres=f"{valeur_bien_concerne:,.2f}"),
            ImpactChiffre(libelle=f"Valeur de l'usufruit temporaire donné (pour {DUREE_USUFRUIT_TEMPORAIRE} ans)", valeur_apres=f"{valeur_usufruit_temporaire:,.2f}"),
            ImpactChiffre(libelle="Patrimoine net taxable à l'IFI (base 2025)", valeur_avant=f"{patrimoine_ifi_initial:,.2f}", valeur_apres=f"{patrimoine_ifi_apres_donation:,.2f}"),
            ImpactChiffre(libelle="IFI estimé (pour 2025)", valeur_avant=f"{ifi_initial:,.2f}", valeur_apres=f"{ifi_apres_donation:,.2f}", variation=f"-{economie_ifi:,.2f}"),
        ]
        avantages = [
            f"Réduction de l'assiette taxable à l'IFI de {valeur_usufruit_temporaire:,.2f} € pendant {DUREE_USUFRUIT_TEMPORAIRE} ans.",
            "Permet d'aider un proche (le donataire de l'usufruit) qui percevra les revenus du bien ou l'occupera.",
            "Le donateur récupère la pleine propriété du bien à l'issue de la période de donation temporaire, sans fiscalité supplémentaire.",
            "Peut permettre de sortir de l'IFI ou de réduire significativement son montant."
        ]
        inconvenients = [
            "Le donateur se dessaisit des revenus ou de l'usage du bien pendant la durée de la donation.",
            "Formalisme notarié obligatoire, engendrant des frais.",
            "La donation doit être réelle et non fictive (le donataire doit exercer les prérogatives de l'usufruitier).",
            f"Durée minimale de 3 ans pour que l'opération soit reconnue fiscalement pour l'IFI. Simulation faite sur {DUREE_USUFRUIT_TEMPORAIRE} ans."
        ]
        texte_explicatif = (
            f"En réalisant une donation temporaire de l'usufruit de votre bien '{bien_a_donner.description_bien}' (valeur {valeur_bien_concerne:,.2f} €) pour une durée de {DUREE_USUFRUIT_TEMPORAIRE} ans, "
            f"la valeur de cet usufruit ({valeur_usufruit_temporaire:,.2f} €) sortirait de votre base taxable à l'IFI. "
            f"Votre IFI 2025 pourrait ainsi être réduit d'environ {economie_ifi:,.2f} €. "
            "Cette stratégie est particulièrement adaptée si vous souhaitez aider un enfant ou un autre proche en lui transférant les revenus ou l'usage d'un bien tout en optimisant votre IFI. "
            f"Le barème IFI utilisé pour cette simulation est celui de 2024, applicable pour l'IFI 2025 (sur le patrimoine au 1er janvier 2025). L'IFI est dû si le patrimoine net taxable excède 1,3 M€, avec un calcul dès 800 000 €."
        )
        rag_text = get_rag_sources_text_for_strategy(self.rag_keywords) if self.rag_keywords else None
        return ScenarioOutputDetail(
            titre_strategie=self.nom,
            description_breve=self.description_strategie,
            impacts_chiffres_cles=impacts,
            avantages=avantages,
            inconvenients_ou_points_attention=inconvenients,
            texte_explicatif_complementaire=texte_explicatif,
            sources_rag_text=rag_text
        )

class StrategiePVI(StrategieOptimisation):
    nom = "Calcul de la Plus-Value Immobilière (PVI) et de son imposition"
    description_strategie = "Estimation de l'impôt sur la plus-value immobilière en cas de cession d'un bien (hors résidence principale)."
    rag_keywords = "plus-value immobilière PVI article 150 U CGI abattement durée détention"

    def est_applicable(self, client_data: QuestionnaireCGP, contexte: Dict) -> bool:
        return (client_data.objectifs.optimiser_fiscalite_cession_immo is True and
                client_data.cession_immobiliere_envisagee is not None and
                client_data.cession_immobiliere_envisagee.prix_cession_estime > 0 and
                client_data.cession_immobiliere_envisagee.prix_acquisition_initial > 0)

    def generer_scenario_detail(self, client_data: QuestionnaireCGP, ir_base: float, parts_fiscales: float, contexte: Dict) -> Optional[ScenarioOutputDetail]:
        details_cession = client_data.cession_immobiliere_envisagee
        if not details_cession:
            return None

        resultat_pvi = calcul_plus_value_immobiliere(
            prix_cession=details_cession.prix_cession_estime,
            prix_acquisition=details_cession.prix_acquisition_initial,
            date_acquisition=details_cession.date_acquisition,
            date_cession_envisagee=details_cession.date_cession_envisagee,
            frais_acquisition_reels=details_cession.frais_acquisition_reels,
            montant_travaux_reels=details_cession.montant_travaux_deductibles_reels,
            est_residence_principale=False 
        )

        if resultat_pvi.plus_value_brute <= 0 or resultat_pvi.impot_total_pvi <=0:
             if resultat_pvi.plus_value_brute > 0:
                 texte_explicatif_nopvi = (
                    f"Pour la cession envisagée de votre bien (acquis le {details_cession.date_acquisition.strftime('%d/%m/%Y')} à {details_cession.prix_acquisition_initial:,.2f} €, cédé le {details_cession.date_cession_envisagee.strftime('%d/%m/%Y')} à {details_cession.prix_cession_estime:,.2f} €), "
                    f"la plus-value brute est estimée à {resultat_pvi.plus_value_brute:,.2f} €. "
                    f"Après abattements pour durée de détention ({resultat_pvi.duree_detention_annees} années), la plus-value imposable à l'IR est de {resultat_pvi.plus_value_nette_imposable_ir:,.2f} € et aux Prélèvements Sociaux de {resultat_pvi.plus_value_nette_imposable_ps:,.2f} €. "
                    "Dans ce cas, l'impôt total sur la plus-value serait de 0.00 € (exonération totale après abattements)."
                 )
                 return ScenarioOutputDetail(
                    titre_strategie=f"{self.nom} (Exonération)",
                    description_breve=self.description_strategie,
                    impacts_chiffres_cles=[
                        ImpactChiffre(libelle="Prix de cession estimé", valeur_apres=f"{details_cession.prix_cession_estime:,.2f}"),
                        ImpactChiffre(libelle="Prix d'acquisition corrigé", valeur_apres=f"{resultat_pvi.prix_acquisition_corrige:,.2f}"),
                        ImpactChiffre(libelle="Plus-value brute", valeur_apres=f"{resultat_pvi.plus_value_brute:,.2f}"),
                        ImpactChiffre(libelle="Durée de détention (années)", valeur_apres=str(resultat_pvi.duree_detention_annees)),
                        ImpactChiffre(libelle="Impôt total sur la plus-value", valeur_apres="0.00"),
                    ],
                    avantages=["Exonération totale de l'impôt sur la plus-value grâce à la durée de détention."],
                    inconvenients_ou_points_attention=["Vérifier les conditions exactes d'exonération.", "Les calculs sont basés sur les dates et montants fournis."],
                    texte_explicatif_complementaire=texte_explicatif_nopvi,
                    sources_rag_text=get_rag_sources_text_for_strategy(self.rag_keywords) if self.rag_keywords else None
                )
             return None


        impacts = [
            ImpactChiffre(libelle="Prix de cession estimé", valeur_apres=f"{details_cession.prix_cession_estime:,.2f}"),
            ImpactChiffre(libelle="Prix d'acquisition corrigé (frais, travaux)", valeur_apres=f"{resultat_pvi.prix_acquisition_corrige:,.2f}"),
            ImpactChiffre(libelle="Plus-value brute", valeur_apres=f"{resultat_pvi.plus_value_brute:,.2f}"),
            ImpactChiffre(libelle="Durée de détention (années)", valeur_apres=str(resultat_pvi.duree_detention_annees)),
            ImpactChiffre(libelle="Abattement pour durée de détention (IR)", valeur_apres=f"{resultat_pvi.abattement_ir_pourcentage*100:.2f}%"),
            ImpactChiffre(libelle="Abattement pour durée de détention (PS)", valeur_apres=f"{resultat_pvi.abattement_ps_pourcentage*100:.2f}%"),
            ImpactChiffre(libelle="Plus-value nette imposable à l'IR", valeur_apres=f"{resultat_pvi.plus_value_nette_imposable_ir:,.2f}"),
            ImpactChiffre(libelle="Plus-value nette imposable aux PS", valeur_apres=f"{resultat_pvi.plus_value_nette_imposable_ps:,.2f}"),
            ImpactChiffre(libelle="Impôt sur le revenu sur PVI (19%)", valeur_apres=f"{resultat_pvi.impot_ir_sur_pvi:,.2f}"),
            ImpactChiffre(libelle="Prélèvements sociaux sur PVI (17.2%)", valeur_apres=f"{resultat_pvi.prelevements_sociaux_sur_pvi:,.2f}"),
            ImpactChiffre(libelle="Surtaxe sur plus-values élevées", valeur_apres=f"{resultat_pvi.surtaxe_pvi:,.2f}"),
            ImpactChiffre(libelle="Impôt total sur la plus-value", valeur_apres=f"{resultat_pvi.impot_total_pvi:,.2f}"),
            ImpactChiffre(libelle="Prix de cession net d'impôt PVI", valeur_apres=f"{details_cession.prix_cession_estime - resultat_pvi.impot_total_pvi:,.2f}"),
        ]
        avantages = [
            "Permet d'anticiper le coût fiscal d'une cession immobilière.",
            "Met en évidence l'impact de la durée de détention sur l'imposition.",
            "Permet d'évaluer l'opportunité de réaliser des travaux déductibles ou de différer la cession pour optimiser."
        ]
        inconvenients = [
            "L'impôt peut être significatif, réduisant le produit net de la vente.",
            "Complexité des règles de calcul (frais déductibles, travaux, abattements, surtaxe).",
            "La simulation est basée sur la législation en vigueur à la date de cession envisagée (hypothèse : législation actuelle maintenue)."
        ]
        
        explication_frais_travaux = "Le prix d'acquisition a été majoré des frais d'acquisition "
        if details_cession.frais_acquisition_reels is not None:
            explication_frais_travaux += f"réels ({details_cession.frais_acquisition_reels:,.2f} €) "
        else:
            explication_frais_travaux += "forfaitaires (7.5%) "
        
        explication_frais_travaux += "et des dépenses de travaux "
        if details_cession.montant_travaux_deductibles_reels is not None:
            explication_frais_travaux += f"réelles ({details_cession.montant_travaux_deductibles_reels:,.2f} €)."
        elif resultat_pvi.duree_detention_annees > 5 : 
            explication_frais_travaux += "forfaitaires (15% du prix d'acquisition, car détention > 5 ans)."
        else:
            explication_frais_travaux += "(aucun montant réel fourni et détention < 5 ans, donc pas de forfait travaux de 15%)."

        texte_explicatif = (
            f"Pour la cession envisagée de votre bien immobilier (acquis le {details_cession.date_acquisition.strftime('%d/%m/%Y')} pour {details_cession.prix_acquisition_initial:,.2f} €, cédé le {details_cession.date_cession_envisagee.strftime('%d/%m/%Y')} pour {details_cession.prix_cession_estime:,.2f} €), l'estimation de l'impôt sur la plus-value est la suivante :\\n"
            f"- {explication_frais_travaux}\\n"
            f"- Plus-value brute : {resultat_pvi.plus_value_brute:,.2f} €.\\n"
            f"- Durée de détention : {resultat_pvi.duree_detention_annees} années, ouvrant droit à un abattement de {resultat_pvi.abattement_ir_pourcentage*100:.2f}% pour l'IR et {resultat_pvi.abattement_ps_pourcentage*100:.2f}% pour les prélèvements sociaux.\\n"
            f"- Plus-value nette imposable à l'IR : {resultat_pvi.plus_value_nette_imposable_ir:,.2f} € (Impôt IR correspondant : {resultat_pvi.impot_ir_sur_pvi:,.2f} € au taux de 19%).\\n"
            f"- Plus-value nette imposable aux Prélèvements Sociaux : {resultat_pvi.plus_value_nette_imposable_ps:,.2f} € (Prélèvements sociaux correspondants : {resultat_pvi.prelevements_sociaux_sur_pvi:,.2f} € au taux de 17.2%).\\n"
            f"- Surtaxe sur les plus-values immobilières élevées : {resultat_pvi.surtaxe_pvi:,.2f} € (si applicable).\\n"
            f"L'impôt total sur cette plus-value immobilière serait d'environ {resultat_pvi.impot_total_pvi:,.2f} €. Le prix de cession net d'impôt PVI serait de {details_cession.prix_cession_estime - resultat_pvi.impot_total_pvi:,.2f} €.\\n"
            f"Ces calculs sont basés sur la législation fiscale actuelle pour une cession en {details_cession.date_cession_envisagee.year} et ne concernent pas la résidence principale (qui est exonérée)."
        )
        rag_text = get_rag_sources_text_for_strategy(self.rag_keywords) if self.rag_keywords else None
        return ScenarioOutputDetail(
            titre_strategie=self.nom,
            description_breve=self.description_strategie,
            impacts_chiffres_cles=impacts,
            avantages=avantages,
            inconvenients_ou_points_attention=inconvenients,
            texte_explicatif_complementaire=texte_explicatif,
            sources_rag_text=rag_text
        )

class StrategieDonsOeuvres(StrategieOptimisation):
    nom = "Dons à des organismes d'intérêt général ou reconnus d'utilité publique"
    description_strategie = "Réduction de l'impôt sur le revenu grâce aux dons effectués à certains organismes."
    rag_keywords = "dons réduction impôt article 200 CGI article 238 bis CGI"

    def est_applicable(self, client_data: QuestionnaireCGP, contexte: Dict) -> bool:
        return client_data.objectifs.philanthropie is True

    def generer_scenario_detail(self, client_data: QuestionnaireCGP, ir_base: float, parts_fiscales: float, contexte: Dict) -> Optional[ScenarioOutputDetail]:
        DON_SIMULE_STANDARD = 1000 
        DON_SIMULE_AIDE_PERSONNES = 500 

        revenu_imposable_global = contexte.get("revenu_imposable_global", 0)

        reduction_max_don_standard = round(revenu_imposable_global * 0.20, 2)
        don_effectivement_eligible_standard = min(DON_SIMULE_STANDARD, reduction_max_don_standard / 0.66 if reduction_max_don_standard > 0 else 0)
        don_effectivement_eligible_standard = round(min(DON_SIMULE_STANDARD, don_effectivement_eligible_standard if don_effectivement_eligible_standard > 0 else DON_SIMULE_STANDARD),2)

        reduction_ir_don_standard = 0
        if don_effectivement_eligible_standard > 0 :
             reduction_ir_don_standard = round(don_effectivement_eligible_standard * 0.66, 2)
        
        ir_apres_don_standard = round(max(0, ir_base - reduction_ir_don_standard),2)
        economie_ir_standard = round(ir_base - ir_apres_don_standard, 2)

        PLAFOND_DON_AIDE_PERSONNES = 1000 
        TAUX_REDUC_AIDE_PERSONNES = 0.75
        
        don_effectivement_eligible_aide = round(min(DON_SIMULE_AIDE_PERSONNES, PLAFOND_DON_AIDE_PERSONNES),2)
        reduction_ir_don_aide = 0
        if don_effectivement_eligible_aide > 0:
            reduction_ir_don_aide = round(don_effectivement_eligible_aide * TAUX_REDUC_AIDE_PERSONNES, 2)

        ir_apres_don_aide = round(max(0, ir_base - reduction_ir_don_aide),2)
        economie_ir_aide = round(ir_base - ir_apres_don_aide, 2)
        
        if economie_ir_aide > economie_ir_standard and don_effectivement_eligible_aide > 0:
            titre = f"{self.nom} (focus aide aux personnes en difficulté)"
            don_simule = don_effectivement_eligible_aide
            reduction_impot = reduction_ir_don_aide
            economie_finale = economie_ir_aide
            ir_final = ir_apres_don_aide
            type_don = "aide aux personnes en difficulté (taux 75%)"
            plafond_specifique = f"Plafond de versement pour le taux à 75%: {PLAFOND_DON_AIDE_PERSONNES} € (pour dons jusqu'en 2026)."
            texte_explicatif_specificites = (f"Les dons aux organismes d'aide aux personnes en difficulté ouvrent droit à une réduction d'impôt de {TAUX_REDUC_AIDE_PERSONNES*100:.0f}% des sommes versées, "
                                             f"retenues dans la limite de {PLAFOND_DON_AIDE_PERSONNES} € pour les revenus 2024 (imposition 2025). Au-delà, le taux de 66% s'applique dans la limite de 20% du revenu imposable.")
        elif don_effectivement_eligible_standard > 0:
            titre = f"{self.nom} (organismes d'intérêt général)"
            don_simule = don_effectivement_eligible_standard
            reduction_impot = reduction_ir_don_standard
            economie_finale = economie_ir_standard
            ir_final = ir_apres_don_standard
            type_don = "intérêt général (taux 66%)"
            plafond_specifique = f"Plafond global de réduction : 20% de votre revenu imposable 2024 ({revenu_imposable_global:,.2f} €), soit {reduction_max_don_standard:,.2f} € de dons maximum éligibles à 66% (soit {reduction_max_don_standard*0.66:,.2f} € de réduction max)." # Corrected an error in calculation display here
            texte_explicatif_specificites = (f"Les dons aux organismes d'intérêt général ouvrent droit à une réduction d'impôt de 66% des sommes versées, "
                                             f"retenues dans la limite de 20% de votre revenu imposable ({reduction_max_don_standard:,.2f} € pour vos revenus 2024).")
        else: 
            return None

        if economie_finale <=0:
            return None

        impacts = [
            ImpactChiffre(libelle=f"Montant du don simulé (en 2024, type: {type_don})", valeur_apres=f"{don_simule:,.2f}"),
            ImpactChiffre(libelle="Réduction d'impôt obtenue", valeur_apres=f"{reduction_impot:,.2f}"),
            ImpactChiffre(libelle="Impôt sur le Revenu Estimé (sur revenus 2024, impôt 2025)", valeur_avant=f"{ir_base:,.2f}", valeur_apres=f"{ir_final:,.2f}", variation=f"-{economie_finale:,.2f}"),
        ]
        avantages = [
            "Soutien à des causes d'intérêt général ou à des personnes en difficulté.",
            "Réduction directe de l'impôt sur le revenu dû au titre de l'année des versements (impôt N+1 sur revenus N).",
            "Possibilité de reporter l'excédent de dons (si dépassement du plafond de 20% du revenu imposable) sur les 5 années suivantes."
        ]
        inconvenients = [
            "Nécessité de conserver les reçus fiscaux émis par les organismes bénéficiaires.",
            "La réduction d'impôt ne peut excéder l'impôt dû (pas de restitution du surplus).",
            "Plafonds de déductibilité à respecter (20% du revenu imposable pour le taux de 66%, et plafond spécifique de 1000€ pour le taux de 75%)."
        ]
        texte_explicatif = (
            f"En effectuant un don de {don_simule:,.2f} € en 2024 à un organisme éligible ({type_don}), vous pourriez bénéficier d'une réduction de votre impôt sur le revenu 2025 (sur revenus 2024) d'environ {reduction_impot:,.2f} €. "
            f"Votre impôt passerait ainsi de {ir_base:,.2f} € à {ir_final:,.2f} €. "
            f"{texte_explicatif_specificites} {plafond_specifique} "
            "Les taux et plafonds mentionnés sont ceux applicables pour les dons effectués en 2024 (imposition 2025)."
        )
        rag_text = get_rag_sources_text_for_strategy(self.rag_keywords) if self.rag_keywords else None
        return ScenarioOutputDetail(
            titre_strategie=titre,
            description_breve=self.description_strategie,
            impacts_chiffres_cles=impacts,
            avantages=avantages,
            inconvenients_ou_points_attention=inconvenients,
            texte_explicatif_complementaire=texte_explicatif,
            sources_rag_text=rag_text
        )

class StrategieCESU(StrategieOptimisation):
    nom = "Crédit d'impôt pour l'emploi d'un salarié à domicile (CESU)"
    description_strategie = "Bénéfice d'un crédit d'impôt pour les dépenses engagées pour l'emploi d'un salarié à domicile."
    rag_keywords = "CESU crédit impôt emploi domicile article 199 sexdecies CGI"

    def est_applicable(self, client_data: QuestionnaireCGP, contexte: Dict) -> bool:
        return client_data.objectifs.optimiser_charges_quotidiennes is True

    def generer_scenario_detail(self, client_data: QuestionnaireCGP, ir_base: float, parts_fiscales: float, contexte: Dict) -> Optional[ScenarioOutputDetail]:
        PLAFOND_DEPENSES_BASE = 12000
        MAJORATION_ENFANT_A_CHARGE = 1500 
        PLAFOND_MAX_TOTAL = 15000 
        TAUX_CREDIT_IMPOT = 0.50

        depenses_cesu_simulees = client_data.depenses_credits_impots.depenses_service_personne_annuel or 0
        
        if depenses_cesu_simulees == 0:
            depenses_cesu_simulees = 3000 

        plafond_applicable = PLAFOND_DEPENSES_BASE
        nb_enfants_a_charge = client_data.situation_foyer_fiscal.nombre_enfants_a_charge or 0
        plafond_applicable += nb_enfants_a_charge * MAJORATION_ENFANT_A_CHARGE
        plafond_applicable = min(plafond_applicable, PLAFOND_MAX_TOTAL)
        
        depenses_retenues = min(depenses_cesu_simulees, plafond_applicable)
        credit_impot_calcule = round(depenses_retenues * TAUX_CREDIT_IMPOT, 2)

        if credit_impot_calcule <= 0:
            if client_data.depenses_credits_impots.depenses_service_personne_annuel is None or client_data.depenses_credits_impots.depenses_service_personne_annuel == 0:
                return None

        ir_apres_cesu = round(max(0, ir_base - credit_impot_calcule),2) 
        # economie_reelle_ou_restitution = credit_impot_calcule 

        impacts = [
            ImpactChiffre(libelle="Dépenses annuelles pour services à la personne simulées (en 2024)", valeur_apres=f"{depenses_cesu_simulees:,.2f}"),
            ImpactChiffre(libelle="Plafond de dépenses applicable à votre foyer (estimation)", valeur_apres=f"{plafond_applicable:,.2f}"),
            ImpactChiffre(libelle="Dépenses retenues pour le crédit d'impôt", valeur_apres=f"{depenses_retenues:,.2f}"),
            ImpactChiffre(libelle="Crédit d'impôt calculé (50% des dépenses retenues)", valeur_apres=f"{credit_impot_calcule:,.2f}"),
            ImpactChiffre(libelle="Impôt sur le Revenu Estimé (sur revenus 2024, avant CI)", valeur_avant=f"{ir_base:,.2f}"),
            ImpactChiffre(libelle="Impôt sur le Revenu Estimé (sur revenus 2024, après CI)", valeur_apres=f"{ir_apres_cesu:,.2f}", variation=f"-{credit_impot_calcule:,.2f} (ou restitution si IR nul)"),
        ]
        avantages = [
            "Réduction de l'impôt sur le revenu à hauteur de 50% des dépenses engagées, ou restitution si le crédit d'impôt excède l'impôt dû.",
            "Large éventail de services éligibles (garde d'enfants, assistance aux personnes âgées ou handicapées, entretien de la maison, etc.).",
            "Simplicité d'utilisation avec le Chèque Emploi Service Universel (CESU)."
        ]
        inconvenients = [
            "Plafonds de dépenses annuelles à respecter (12 000 €, majoré sous conditions, jusqu'à 15 000 € ou 20 000 € dans certains cas).",
            "Nécessité de justifier les dépenses (factures, attestation CESU).",
            "Certaines aides (comme l'APA ou la PCH) perçues pour financer ces services doivent être déduites des dépenses déclarées."
        ]
        texte_explicatif = (
            f"En engageant {depenses_cesu_simulees:,.2f} € de dépenses pour des services à la personne en 2024, vous pourriez bénéficier d'un crédit d'impôt de {credit_impot_calcule:,.2f} € sur votre impôt 2025. "
            f"Ce montant est calculé sur la base des dépenses retenues de {depenses_retenues:,.2f} €, après application d'un plafond estimé à {plafond_applicable:,.2f} € pour votre foyer fiscal. "
            f"Si votre impôt est inférieur à {credit_impot_calcule:,.2f} €, l'excédent vous sera restitué. "
            "Les plafonds de dépenses (actuellement 12 000 € de base, majorables) et le taux de 50% sont ceux en vigueur pour les dépenses 2024 (impôt 2025). "
        )
        if client_data.depenses_credits_impots.depenses_service_personne_annuel is None or client_data.depenses_credits_impots.depenses_service_personne_annuel == 0:
             texte_explicatif += "La simulation est basée sur une dépense indicative de 3000€. Renseignez vos dépenses réelles pour une estimation personnalisée."

        rag_text = get_rag_sources_text_for_strategy(self.rag_keywords) if self.rag_keywords else None
        return ScenarioOutputDetail(
            titre_strategie=self.nom,
            description_breve=self.description_strategie,
            impacts_chiffres_cles=impacts,
            avantages=avantages,
            inconvenients_ou_points_attention=inconvenients,
            texte_explicatif_complementaire=texte_explicatif,
            sources_rag_text=rag_text
        )

# Registre des stratégies à instancier et à utiliser
REGISTRE_STRATEGIES: List[StrategieOptimisation] = []
 