from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any, Dict, Optional, Union
import asyncio
import json
import uuid
from datetime import datetime

from backend.database import get_db
from backend.models_pro import ClientProfile, RendezVousProfessionnel
from backend.schemas_pro import (
    ClientProfileCreate, ClientProfileResponse, ClientProfileUpdate, 
    AnalysisResultSchema, AnalysisRecommendation,
    RendezVousCreate, RendezVousResponse, RendezVousUpdate
)
from backend.dependencies import supabase, verify_token
from backend.assistant_fiscal_simple import get_fiscal_response
from pydantic import BaseModel
from decimal import Decimal

router = APIRouter(
    prefix="/api/pro",
    tags=["Pro - Gestion Clients"],
)

async def verify_professional_user(current_user_id: str = Depends(verify_token)) -> str:
    """
    Vérifie si l'utilisateur courant est un professionnel en consultant la table profils_utilisateurs.
    Retourne l'user_id du professionnel si c'est le cas, sinon lève une HTTPException.
    """
    if not supabase:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Service Supabase non disponible")
    try:
        # print(f"Vérification du rôle pro pour user_id: {current_user_id}") # Log de débogage
        response = (
            supabase.table("profils_utilisateurs")
            .select("user_id, taper")
            .eq("user_id", current_user_id)
            .single()
            .execute()
        )
        # print(f"Réponse de Supabase pour profils_utilisateurs: {response}") # Log de débogage
        if response.data and response.data.get("taper") == "professionnel": # Assurez-vous que "professionnel" est la bonne valeur pour le rôle
            return current_user_id
        else:
            # print(f"Utilisateur {current_user_id} n'est pas un professionnel ou profil non trouvé. Data: {response.data}") # Log de débogage
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé : Réservé aux utilisateurs professionnels."
            )
    except Exception as e:
        # print(f"Exception lors de la vérification du rôle pro: {str(e)}") # Log de débogage
        # Cela peut inclure le cas où .single() ne trouve rien et lève une erreur si PostgREST retourne count=0
        # Ou une erreur de connexion à Supabase etc.
        # Gestion d'erreur améliorée si `single()` ne trouve rien (Supabase client lève une exception)
        if "PGRST116" in str(e): # Code d'erreur PostgREST pour "requested resource not found"
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Profil professionnel non trouvé ou non configuré."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, # Erreur serveur si autre chose
            detail=f"Erreur lors de la vérification du profil professionnel: {str(e)}"
        )

@router.post("/clients/", response_model=ClientProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_client_profile(
    client_profile_data: ClientProfileCreate,
    db: Session = Depends(get_db),
    professional_user_id: str = Depends(verify_professional_user)
):
    """
    Crée une nouvelle fiche client pour le professionnel authentifié.
    L'id_professionnel est automatiquement rempli avec l'ID du professionnel connecté.
    """
    
    # Assurer que l'id_professionnel dans les données correspond à l'utilisateur authentifié
    # ou mieux, l'ignorer des données d'entrée et le définir ici.
    # Pour l'instant, on suppose que ClientProfileCreate pourrait le contenir, mais on le force.
    
    db_client_profile = ClientProfile(**client_profile_data.model_dump(exclude_unset=True)) # Utiliser model_dump
    db_client_profile.id_professionnel = professional_user_id # Forcer l'ID du pro connecté
    
    db.add(db_client_profile)
    db.commit()
    db.refresh(db_client_profile)
    return db_client_profile

@router.get("/clients/", response_model=List[ClientProfileResponse])
async def list_client_profiles(
    db: Session = Depends(get_db),
    professional_user_id: str = Depends(verify_professional_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Liste les fiches clients associées au professionnel authentifié.
    """
    client_profiles = (
        db.query(ClientProfile)
        .filter(ClientProfile.id_professionnel == professional_user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return client_profiles

@router.get("/clients/{client_id}", response_model=ClientProfileResponse)
async def get_client_profile(
    client_id: int,
    db: Session = Depends(get_db),
    professional_user_id: str = Depends(verify_professional_user)
):
    """
    Récupère une fiche client spécifique par son ID.
    Vérifie que le client appartient au professionnel authentifié.
    """
    db_client_profile = (
        db.query(ClientProfile)
        .filter(ClientProfile.id == client_id, ClientProfile.id_professionnel == professional_user_id)
        .first()
    )
    if db_client_profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiche client non trouvée ou accès non autorisé.")
    return db_client_profile

@router.put("/clients/{client_id}", response_model=ClientProfileResponse)
async def update_client_profile(
    client_id: int,
    client_profile_update_data: ClientProfileUpdate,
    db: Session = Depends(get_db),
    professional_user_id: str = Depends(verify_professional_user)
):
    """
    Met à jour une fiche client spécifique.
    Vérifie que le client appartient au professionnel authentifié.
    """
    db_client_profile = (
        db.query(ClientProfile)
        .filter(ClientProfile.id == client_id, ClientProfile.id_professionnel == professional_user_id)
        .first()
    )

    if db_client_profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiche client non trouvée ou accès non autorisé pour la mise à jour.")

    update_data = client_profile_update_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_client_profile, key, value)
    
    db.commit()
    db.refresh(db_client_profile)
    return db_client_profile

@router.delete("/clients/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client_profile(
    client_id: int,
    db: Session = Depends(get_db),
    professional_user_id: str = Depends(verify_professional_user)
):
    """
    Supprime une fiche client spécifique.
    Vérifie que le client appartient au professionnel authentifié.
    """
    db_client_profile = (
        db.query(ClientProfile)
        .filter(ClientProfile.id == client_id, ClientProfile.id_professionnel == professional_user_id)
        .first()
    )

    if db_client_profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiche client non trouvée ou accès non autorisé pour la suppression.")

    db.delete(db_client_profile)
    db.commit()
    return # Retourne une réponse vide avec statut 204 comme il est d'usage pour DELETE 

def format_field_for_prompt(label: str, value: Any) -> str:
    if value is None or value == '':
        return "" # Ne pas inclure les champs vides pour alléger le prompt
    if isinstance(value, dict) or isinstance(value, list):
        return f"{label}: {json.dumps(value, ensure_ascii=False, indent=2)}\n" # Formatter le JSON
    return f"{label}: {str(value)}\n" # Convertir les autres types en string

@router.post("/clients/{client_id}/analyze", response_model=AnalysisResultSchema)
async def analyze_client_profile(
    client_id: int,
    db: Session = Depends(get_db),
    professional_user_id: str = Depends(verify_professional_user)
):
    db_client = (
        db.query(ClientProfile)
        .filter(ClientProfile.id == client_id, ClientProfile.id_professionnel == professional_user_id)
        .first()
    )
    if db_client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client non trouvé ou accès non autorisé.")

    # Construction d'un prompt détaillé pour Francis
    prompt_sections = [f"Analyse approfondie de la situation patrimoniale et fiscale pour le client : {db_client.prenom_client} {db_client.nom_client}.\n"]

    prompt_sections.append("\n--- Situation Personnelle et Familiale ---\n")
    prompt_sections.append(format_field_for_prompt("Civilité", db_client.civilite_client))
    prompt_sections.append(format_field_for_prompt("Situation Maritale", db_client.situation_maritale_client))
    prompt_sections.append(format_field_for_prompt("Date Mariage/PACS", db_client.date_mariage_pacs_client))
    prompt_sections.append(format_field_for_prompt("Régime Matrimonial", db_client.regime_matrimonial_client))
    prompt_sections.append(format_field_for_prompt("Nombre d'enfants à charge", db_client.nombre_enfants_a_charge_client))
    prompt_sections.append(format_field_for_prompt("Détails enfants", db_client.details_enfants_client)) # JSON

    prompt_sections.append("\n--- Revenus du Foyer (Client 1 : {db_client.prenom_client} {db_client.nom_client}) ---\n")
    prompt_sections.append(format_field_for_prompt("Profession C1", db_client.profession_client1))
    prompt_sections.append(format_field_for_prompt("Revenu Net Annuel C1", db_client.revenu_net_annuel_client1))
    prompt_sections.append(format_field_for_prompt("Autres revenus C1", db_client.autres_revenus_client1)) # JSON
    if db_client.profession_client2 or db_client.revenu_net_annuel_client2:
        prompt_sections.append("\n--- Revenus du Foyer (Client 2 / Conjoint) ---\n")
        prompt_sections.append(format_field_for_prompt("Profession C2", db_client.profession_client2))
        prompt_sections.append(format_field_for_prompt("Revenu Net Annuel C2", db_client.revenu_net_annuel_client2))
        prompt_sections.append(format_field_for_prompt("Autres revenus C2", db_client.autres_revenus_client2)) # JSON
    
    prompt_sections.append("\n--- Autres Revenus du Foyer Fiscal ---\n")
    prompt_sections.append(format_field_for_prompt("Revenus Fonciers Bruts", db_client.revenus_fonciers_annuels_bruts_foyer))
    prompt_sections.append(format_field_for_prompt("Charges Foncières Déductibles", db_client.charges_foncieres_deductibles_foyer))
    prompt_sections.append(format_field_for_prompt("Revenus Capitaux Mobiliers", db_client.revenus_capitaux_mobiliers_foyer))
    # ... ajouter d'autres champs de revenus ...

    prompt_sections.append("\n--- Patrimoine Immobilier ---\n")
    prompt_sections.append(format_field_for_prompt("Résidence Principale", db_client.residence_principale_details)) # JSON
    prompt_sections.append(format_field_for_prompt("Résidences Secondaires", db_client.residences_secondaires_details)) # JSON
    prompt_sections.append(format_field_for_prompt("Investissements Locatifs", db_client.investissements_locatifs_details)) # JSON
    
    prompt_sections.append("\n--- Patrimoine Financier ---\n")
    prompt_sections.append(format_field_for_prompt("Livrets Épargne", db_client.livrets_epargne_details)) # JSON
    prompt_sections.append(format_field_for_prompt("Assurance Vie", db_client.assurance_vie_details)) # JSON
    prompt_sections.append(format_field_for_prompt("PEA", db_client.pea_details)) # JSON
    prompt_sections.append(format_field_for_prompt("Compte-Titres Valeur Estimée", db_client.compte_titres_valeur_estimee))
    prompt_sections.append(format_field_for_prompt("Épargne Retraite", db_client.epargne_retraite_details)) # JSON

    prompt_sections.append("\n--- Objectifs du Client ---\n")
    prompt_sections.append(format_field_for_prompt("Objectifs Fiscaux", db_client.objectifs_fiscaux_client))
    prompt_sections.append(format_field_for_prompt("Objectifs Patrimoniaux", db_client.objectifs_patrimoniaux_client))
    prompt_sections.append(format_field_for_prompt("Horizon de Placement", db_client.horizon_placement_client))
    prompt_sections.append(format_field_for_prompt("Profil de Risque Investisseur", db_client.profil_risque_investisseur_client))

    prompt_sections.append("\n--- Informations Fiscales Existantes ---\n")
    prompt_sections.append(format_field_for_prompt("Dernier Avis d'Imposition", db_client.dernier_avis_imposition_details)) # JSON
    prompt_sections.append(format_field_for_prompt("TMI Estimée (%)", db_client.tranche_marginale_imposition_estimee))
    prompt_sections.append(format_field_for_prompt("Soumis à l'IFI", db_client.ifi_concerne_client))

    prompt_sections.append("\n--- Demande à l'IA Francis ---\n")
    prompt_sections.append("Sur la base de ces informations, veuillez fournir :\n1. Une synthèse concise des points clés et des enjeux principaux pour ce client.\n2. Une liste de 3 à 5 recommandations prioritaires d'optimisation fiscale et/ou patrimoniale, avec une brève explication pour chacune.\n3. Une liste de 2 à 3 points d'action concrets que le conseiller (moi) devrait entreprendre avec le client.\nFormatez votre réponse clairement. Ne posez pas de questions en retour, fournissez une analyse directe.")
    
    detailed_prompt = "\n".join(filter(None, prompt_sections)) # Filtrer les chaînes vides
    
    print(f"[DEBUG] Prompt pour Francis: {detailed_prompt[:500]}...") # Log de la première partie du prompt

    try:
        # Appel réel à Francis (via get_fiscal_response)
        # Le conversation_history est optionnel pour get_fiscal_response
        ia_answer, _, _ = get_fiscal_response(query=detailed_prompt)
    except Exception as e:
        print(f"Erreur lors de l'appel à get_fiscal_response: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Erreur lors de la communication avec le service d'analyse IA.")

    # Pour l'instant, on met toute la réponse de l'IA dans le summary.
    # L'extraction structurée des recommandations et actions nécessiterait un parsing plus avancé
    # ou un ajustement du prompt pour que l'IA retourne un JSON (plus complexe à garantir).
    
    # Tentative simple d'extraire des listes si l'IA suit un format
    recommendations_list = []
    action_points_list = []
    summary_text = ia_answer # Par défaut, tout est dans le résumé

    # Ce parsing est basique et dépendra fortement du format de réponse de l'IA
    # Vous devrez l'adapter ou utiliser des techniques de NLP plus robustes.
    if "Recommandations:" in ia_answer and "Points d'action:" in ia_answer:
        parts = ia_answer.split("Recommandations:")
        summary_text = parts[0].strip()
        reco_action_part = parts[1]
        if "Points d'action:" in reco_action_part:
            reco_parts = reco_action_part.split("Points d'action:")
            reco_text = reco_parts[0].strip()
            action_text = reco_parts[1].strip()
            
            recommendations_list = [AnalysisRecommendation(title=rec.strip(), details="Précisions à venir de l'IA") for rec in reco_text.split('\n') if rec.strip()] 
            action_points_list = [act.strip() for act in action_text.split('\n') if act.strip()]
    elif "Recommandations:" in ia_answer: # Seulement recommandations
        parts = ia_answer.split("Recommandations:")
        summary_text = parts[0].strip()
        reco_text = parts[1].strip()
        recommendations_list = [AnalysisRecommendation(title=rec.strip(), details="Précisions à venir de l'IA") for rec in reco_text.split('\n') if rec.strip()]

    # S'assurer qu'il y a toujours un résumé, même si le parsing échoue
    if not summary_text.strip() and ia_answer:
        summary_text = ia_answer
    elif not summary_text.strip() and not ia_answer:
        summary_text = "L'analyse n'a pas pu générer de résumé."

    # Limiter le nombre de recommandations/actions pour l'affichage
    if not recommendations_list:
        recommendations_list.append(AnalysisRecommendation(title="Analyse Générale Effectuée", details="Aucune recommandation spécifique extraite automatiquement. Consultez le résumé pour l'analyse complète."))
    if not action_points_list:
        action_points_list.append("Consulter le résumé de l'analyse pour déterminer les prochaines étapes.")

    return AnalysisResultSchema(
        summary=summary_text,
        recommendations=recommendations_list[:5], # Limiter à 5 pour l'affichage
        actionPoints=action_points_list[:3] # Limiter à 3 pour l'affichage
    ) 

# Nouveaux modèles Pydantic pour l'endpoint ask_francis
class AskFrancisRequest(BaseModel):
    query: str
    conversation_history: Optional[List[Dict[str, str]]] = None

class FrancisClientResponse(BaseModel):
    answer: str
    sources: List[str]
    confidence: float

# Fonction d'assistance pour convertir les données du client en contexte pour Francis
def _create_client_context_for_francis(client_profile: ClientProfile) -> Dict[str, Any]:
    context = {}

    def _safe_float_convert(value: Optional[Union[Decimal, str, int, float]]) -> Optional[float]:
        if value is None:
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None

    # TMI (Tranche Marginale d'Imposition)
    if client_profile.tranche_marginale_imposition_estimee is not None:
        # Supposons que c'est un nombre ou une chaîne convertible en nombre (sans '%')
        tmi_value = str(client_profile.tranche_marginale_imposition_estimee).replace('%', '').strip()
        context['tmi'] = _safe_float_convert(tmi_value)

    # Situation familiale
    if client_profile.situation_maritale_client:
        context['situation_familiale'] = client_profile.situation_maritale_client

    # Nombre d'enfants
    if client_profile.nombre_enfants_a_charge_client is not None:
        context['nombre_enfants'] = client_profile.nombre_enfants_a_charge_client

    # Revenus annuels nets (Agrégation)
    revenus_sources = [
        client_profile.revenu_net_annuel_client1,
        client_profile.revenu_net_annuel_client2,
        client_profile.revenus_fonciers_annuels_bruts_foyer, # Bruts, mais c'est ce qu'on a
        client_profile.revenus_capitaux_mobiliers_foyer,
        client_profile.plus_values_mobilieres_foyer,
        client_profile.plus_values_immobilieres_foyer,
        client_profile.benefices_industriels_commerciaux_foyer,
        client_profile.benefices_non_commerciaux_foyer,
        client_profile.pensions_retraites_percues_foyer,
        client_profile.pensions_alimentaires_percues_foyer,
    ]
    total_revenus = sum(filter(None, map(_safe_float_convert, revenus_sources)))
    if total_revenus > 0 or revenus_sources: # Mettre le champ même si c'est 0 mais qu'il y a des sources
         context['revenus_annuels'] = total_revenus
    
    # Charges déductibles annuelles
    # On n'a que les charges foncières pour l'instant
    charges_deductibles = _safe_float_convert(client_profile.charges_foncieres_deductibles_foyer)
    if charges_deductibles is not None:
        context['charges_deductibles'] = charges_deductibles

    # Propriétaire résidence principale
    # On infère du fait que les détails existent et ne sont pas "vides"
    if client_profile.residence_principale_details:
        # details peut être un str JSON ou un dict. Si str, on essaie de parser.
        # Pour une simple vérification d'existence, on peut juste voir si ce n'est pas None/vide.
        # Une logique plus fine pourrait vérifier le contenu.
        try:
            details_obj = json.loads(client_profile.residence_principale_details) if isinstance(client_profile.residence_principale_details, str) else client_profile.residence_principale_details
            if details_obj and details_obj != {}: # Non vide si c'est un objet
                 context['residence_principale'] = True
            # Si c'est une liste (peu probable pour RP) : if details_obj and details_obj != []:
        except (json.JSONDecodeError, TypeError):
            # Si ce n'est pas un JSON valide ou pas le bon type, on ne peut pas déterminer
            pass # context['residence_principale'] reste non défini ou False

    # Propriétaire résidence secondaire
    if client_profile.residences_secondaires_details:
        try:
            details_obj = json.loads(client_profile.residences_secondaires_details) if isinstance(client_profile.residences_secondaires_details, str) else client_profile.residences_secondaires_details
            # Typiquement une liste de résidences secondaires
            if isinstance(details_obj, list) and len(details_obj) > 0:
                context['residence_secondaire'] = True
        except (json.JSONDecodeError, TypeError):
            pass
            
    return context

@router.post("/clients/{client_id}/ask_francis", response_model=FrancisClientResponse)
async def ask_francis_for_client(
    client_id: int,
    request: AskFrancisRequest,
    db: Session = Depends(get_db),
    professional_user_id: str = Depends(verify_professional_user) # Assure que l'utilisateur est un pro
):
    """
    Permet à un professionnel de poser une question à Francis concernant un client spécifique.
    Le contexte du client est automatiquement extrait et fourni à Francis.
    """
    db_client_profile = (
        db.query(ClientProfile)
        .filter(ClientProfile.id == client_id, ClientProfile.id_professionnel == professional_user_id)
        .first()
    )
    if db_client_profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiche client non trouvée ou accès non autorisé.")

    # Créer le contexte pour Francis à partir des données du client
    client_context = _create_client_context_for_francis(db_client_profile)
    
    # Appeler Francis (get_fiscal_response n'est pas async, FastAPI le gère)
    try:
        answer, sources, confidence = get_fiscal_response(
            query=request.query,
            conversation_history=request.conversation_history,
            user_profile_context=client_context 
        )
        return FrancisClientResponse(answer=answer, sources=sources, confidence=confidence)
    except Exception as e:
        print(f"Erreur lors de l'appel à get_fiscal_response pour client {client_id}: {e}")
        # Imprimer le traceback complet pour le débogage serveur
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur lors de la génération de la réponse fiscale: {str(e)}") 

# Modèle pour la réponse d'une analyse IRPP (exemple)
class IRPPAnalysisResponse(BaseModel):
    revenu_brut_global: float
    revenu_net_imposable: float
    nombre_parts: float
    quotient_familial: float
    impot_brut_calcule: float
    decote_applicable: Optional[float] = None
    impot_net_avant_credits: float
    reductions_credits_impot: Optional[Dict[str, float]] = None # Exemple: {"pinel": 5000, "emploi_domicile": 1000}
    impot_final_estime: float
    taux_marginal_imposition: float
    taux_moyen_imposition: float
    notes_explicatives: Optional[List[str]] = None

# --- Fonctions de calcul IRPP 2025 (Placeholders) ---
# Ces fonctions devront être remplies avec la logique réelle et les données du CGI 2025

def _get_bareme_irpp_2025() -> List[Dict[str, float]]:
    # Exemple de structure, à remplacer par les vraies tranches et taux 2025
    # return [
    #     {"limite_inf": 0, "limite_sup": 11294, "taux": 0.0},
    #     {"limite_inf": 11294, "limite_sup": 28797, "taux": 0.11},
    #     {"limite_inf": 28797, "limite_sup": 82341, "taux": 0.30},
    #     {"limite_inf": 82341, "limite_sup": 177106, "taux": 0.41},
    #     {"limite_inf": 177106, "limite_sup": float('inf'), "taux": 0.45}
    # ]
    print("WARN: _get_bareme_irpp_2025 utilisant des données fictives!")
    return [] # Doit être rempli

def _calculate_nombre_parts(situation_maritale_client: Optional[str], nombre_enfants_a_charge: Optional[int]) -> float:
    parts = 1.0
    if situation_maritale_client and ("Marié" in situation_maritale_client or "Pacsé" in situation_maritale_client):
        parts = 2.0
    
    if nombre_enfants_a_charge:
        if nombre_enfants_a_charge == 1:
            parts += 0.5
        elif nombre_enfants_a_charge == 2:
            parts += 1.0 # 0.5 pour chaque
        elif nombre_enfants_a_charge > 2:
            parts += 1.0 + (nombre_enfants_a_charge - 2) # 0.5 pour les deux premiers, 1 pour chaque suivant
    print(f"WARN: _calculate_nombre_parts - situation: {situation_maritale_client}, enfants: {nombre_enfants_a_charge}, parts calculées (simplifié): {parts}")
    return parts # Logique simplifiée, à affiner avec les règles CGI 2025 exactes

def _calculate_revenu_net_global_imposable(client_profile: ClientProfile) -> float:
    # TODO: Implémenter le calcul détaillé du revenu net global imposable
    #       (Revenus catégoriels nets, abattements spéciaux, charges déductibles du revenu global etc.)
    #       Utiliser les champs de client_profile: revenu_net_annuel_client1, revenu_net_annuel_client2,
    #       revenus_fonciers_annuels_bruts_foyer, charges_foncieres_deductibles_foyer, etc.
    #       Appliquer l'abattement de 10% ou les frais réels pour les salaires.
    print("WARN: _calculate_revenu_net_global_imposable utilisant une logique fictive!")
    revenu_brut_global_estime = 0
    try:
        rev1 = float(client_profile.revenu_net_annuel_client1 or 0)
        rev2 = float(client_profile.revenu_net_annuel_client2 or 0)
        rev_foncier_brut = float(client_profile.revenus_fonciers_annuels_bruts_foyer or 0)
        charges_foncieres = float(client_profile.charges_foncieres_deductibles_foyer or 0)
        # Simplification extrême
        revenu_brut_global_estime = (rev1 + rev2) * 0.9 + (rev_foncier_brut - charges_foncieres) # Abattement 10% sur salaires
    except ValueError:
        pass
    return max(0, revenu_brut_global_estime) # Le revenu imposable ne peut être négatif pour ce calcul simplifié

def _apply_bareme_irpp(revenu_imposable_par_part: float, bareme: List[Dict[str, float]]) -> float:
    impot_brut = 0
    if not bareme or revenu_imposable_par_part <= 0:
        return 0.0
    
    # TODO: Implémenter l'application correcte du barème progressif 2025
    print("WARN: _apply_bareme_irpp utilisant une logique fictive/incomplète!")
    # Exemple très simplifié (NE PAS UTILISER EN PRODUCTION):
    # if revenu_imposable_par_part > bareme[0]["limite_sup"] and len(bareme) > 1:
    #     impot_brut = (revenu_imposable_par_part - bareme[0]["limite_sup"]) * bareme[1]["taux"]
    return 5000.0 # Placeholder

# --- Fin des fonctions de calcul IRPP 2025 (Placeholders) ---

@router.post("/clients/{client_id}/analyze_irpp_2025", response_model=IRPPAnalysisResponse)
async def analyze_irpp_for_client(
    client_id: int,
    db: Session = Depends(get_db),
    professional_user_id: str = Depends(verify_professional_user)
):
    db_client_profile = (
        db.query(ClientProfile)
        .filter(ClientProfile.id == client_id, ClientProfile.id_professionnel == professional_user_id)
        .first()
    )
    if db_client_profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiche client non trouvée ou accès non autorisé.")

    # 1. Calculer le nombre de parts
    nombre_parts = _calculate_nombre_parts(
        db_client_profile.situation_maritale_client,
        db_client_profile.nombre_enfants_a_charge_client
    )

    # 2. Calculer le revenu net global imposable
    revenu_net_imposable = _calculate_revenu_net_global_imposable(db_client_profile)

    # 3. Obtenir le barème IRPP 2025
    bareme_2025 = _get_bareme_irpp_2025()
    if not bareme_2025: # Si le barème n'est pas chargé/disponible
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Barème IRPP 2025 non disponible pour l'analyse.")

    # 4. Calculer le quotient familial
    quotient_familial = revenu_net_imposable / nombre_parts if nombre_parts > 0 else revenu_net_imposable

    # 5. Appliquer le barème pour obtenir l'impôt brut
    impot_brut_avant_plafonnement = _apply_bareme_irpp(quotient_familial, bareme_2025) * nombre_parts
    
    # TODO: 6. Appliquer le plafonnement du quotient familial
    # impot_brut_apres_plafonnement = ...
    impot_brut_apres_plafonnement = impot_brut_avant_plafonnement # Placeholder
    print(f"WARN: Plafonnement du quotient familial non implémenté pour client {client_id}")

    # TODO: 7. Calculer la décote
    # decote = ...
    decote_simulee = 0.0 # Placeholder
    impot_apres_decote = impot_brut_apres_plafonnement - decote_simulee
    print(f"WARN: Calcul de la décote non implémenté pour client {client_id}")

    # TODO: 8. Appliquer les réductions et crédits d'impôt
    # reductions_credits = ...
    # impot_final = impot_apres_decote - total_reductions_credits
    reductions_credits_simules = {"exemple_rc": 100.0} # Placeholder
    impot_final_estime = max(0, impot_apres_decote - sum(reductions_credits_simules.values()))
    print(f"WARN: Réductions/Crédits d'impôt non implémentés pour client {client_id}")

    # TODO: 9. Calculer TMI et Taux Moyen
    tmi_simule = 30.0 # Placeholder, devra être déterminé à partir du barème et du revenu
    taux_moyen_simule = (impot_final_estime / revenu_net_imposable * 100) if revenu_net_imposable > 0 else 0

    return IRPPAnalysisResponse(
        revenu_brut_global= _calculate_revenu_net_global_imposable(db_client_profile) + (db_client_profile.charges_foncieres_deductibles_foyer or 0), # Approximation du brut global
        revenu_net_imposable=revenu_net_imposable,
        nombre_parts=nombre_parts,
        quotient_familial=quotient_familial,
        impot_brut_calcule=impot_brut_apres_plafonnement, # Ce devrait être l'impôt après plafonnement QF
        decote_applicable=decote_simulee if decote_simulee > 0 else None,
        impot_net_avant_credits=impot_apres_decote, # Impôt après décote mais avant RICI
        reductions_credits_impot=reductions_credits_simules if sum(reductions_credits_simules.values()) > 0 else None,
        impot_final_estime=impot_final_estime,
        taux_marginal_imposition=tmi_simule,
        taux_moyen_imposition=taux_moyen_simule,
        notes_explicatives=[
            "Ceci est une simulation basée sur des données partielles et des règles de calcul simplifiées/fictives pour 2025.",
            "Le calcul complet nécessite l'intégration des barèmes, seuils, et règles détaillées du CGI 2025.",
            "Les étapes de plafonnement du quotient familial, décote, et certaines RICI ne sont pas encore implémentées."
        ]
    ) 

# --- Endpoints CRUD pour les Rendez-vous Professionnels ---

@router.post("/rendezvous", response_model=RendezVousResponse, status_code=status.HTTP_201_CREATED)
async def create_rendez_vous(
    rdv_data: RendezVousCreate,
    db: Session = Depends(get_db),
    professional_user_id: str = Depends(verify_professional_user) # Assure que l'utilisateur est un pro et récupère son ID
):
    """
    Crée un nouveau rendez-vous pour le professionnel authentifié.
    """
    # Vérifier si le client existe et appartient au professionnel (optionnel, mais bonne pratique)
    client_exists = db.query(ClientProfile).filter(
        ClientProfile.id == rdv_data.id_client,
        ClientProfile.id_professionnel == professional_user_id
    ).first()
    if not client_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Client avec ID {rdv_data.id_client} non trouvé ou non associé à ce professionnel.")

    if rdv_data.date_heure_fin < rdv_data.date_heure_debut:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La date de fin ne peut pas être antérieure à la date de début.")

    db_rdv = RendezVousProfessionnel(
        **rdv_data.model_dump(), 
        id_professionnel=uuid.UUID(professional_user_id) # professional_user_id est un str, le modèle attend un UUID
    )
    db.add(db_rdv)
    db.commit()
    db.refresh(db_rdv)
    return db_rdv

@router.get("/rendezvous", response_model=List[RendezVousResponse])
async def list_rendez_vous(
    db: Session = Depends(get_db),
    professional_user_id: str = Depends(verify_professional_user),
    skip: int = 0, 
    limit: int = 100,
    start_date: Optional[datetime] = None, # Filtre par date de début
    end_date: Optional[datetime] = None     # Filtre par date de fin
):
    """
    Liste les rendez-vous pour le professionnel authentifié.
    Permet de filtrer par plage de dates.
    """
    query = db.query(RendezVousProfessionnel).filter(RendezVousProfessionnel.id_professionnel == uuid.UUID(professional_user_id))
    
    if start_date:
        query = query.filter(RendezVousProfessionnel.date_heure_debut >= start_date)
    if end_date:
        # Pour inclure les RDV qui se terminent jusqu'à la fin de la journée end_date
        from datetime import timedelta
        query = query.filter(RendezVousProfessionnel.date_heure_fin < (end_date + timedelta(days=1)))
        # Alternative: query = query.filter(RendezVousProfessionnel.date_heure_debut <= end_date) # si on filtre sur le début

    rendez_vous_list = query.order_by(RendezVousProfessionnel.date_heure_debut.asc()).offset(skip).limit(limit).all()
    return rendez_vous_list

@router.get("/rendezvous/{rdv_id}", response_model=RendezVousResponse)
async def get_rendez_vous_by_id(
    rdv_id: uuid.UUID,
    db: Session = Depends(get_db),
    professional_user_id: str = Depends(verify_professional_user)
):
    """
    Récupère un rendez-vous spécifique par son ID.
    Vérifie que le RDV appartient au professionnel authentifié.
    """
    db_rdv = db.query(RendezVousProfessionnel).filter(
        RendezVousProfessionnel.id == rdv_id,
        RendezVousProfessionnel.id_professionnel == uuid.UUID(professional_user_id)
    ).first()
    
    if db_rdv is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rendez-vous non trouvé ou non autorisé.")
    return db_rdv

@router.put("/rendezvous/{rdv_id}", response_model=RendezVousResponse)
async def update_rendez_vous(
    rdv_id: uuid.UUID,
    rdv_update_data: RendezVousUpdate,
    db: Session = Depends(get_db),
    professional_user_id: str = Depends(verify_professional_user)
):
    """
    Met à jour un rendez-vous existant.
    Vérifie que le RDV appartient au professionnel authentifié.
    """
    db_rdv = db.query(RendezVousProfessionnel).filter(
        RendezVousProfessionnel.id == rdv_id,
        RendezVousProfessionnel.id_professionnel == uuid.UUID(professional_user_id)
    ).first()

    if db_rdv is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rendez-vous non trouvé ou non autorisé pour la mise à jour.")

    update_data = rdv_update_data.model_dump(exclude_unset=True)
    
    if "date_heure_debut" in update_data and "date_heure_fin" in update_data:
        if update_data["date_heure_fin"] < update_data["date_heure_debut"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La date de fin ne peut pas être antérieure à la date de début.")
    elif "date_heure_debut" in update_data:
        if db_rdv.date_heure_fin < update_data["date_heure_debut"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La date de fin existante ne peut pas être antérieure à la nouvelle date de début.")
    elif "date_heure_fin" in update_data:
        if update_data["date_heure_fin"] < db_rdv.date_heure_debut:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La nouvelle date de fin ne peut pas être antérieure à la date de début existante.")

    for key, value in update_data.items():
        setattr(db_rdv, key, value)
    
    db_rdv.updated_at = datetime.utcnow() # Mettre à jour manuellement updated_at car onupdate n'est pas toujours trigger par setattr
    db.commit()
    db.refresh(db_rdv)
    return db_rdv

@router.delete("/rendezvous/{rdv_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rendez_vous(
    rdv_id: uuid.UUID,
    db: Session = Depends(get_db),
    professional_user_id: str = Depends(verify_professional_user)
):
    """
    Supprime un rendez-vous.
    Vérifie que le RDV appartient au professionnel authentifié.
    """
    db_rdv = db.query(RendezVousProfessionnel).filter(
        RendezVousProfessionnel.id == rdv_id,
        RendezVousProfessionnel.id_professionnel == uuid.UUID(professional_user_id)
    ).first()

    if db_rdv is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rendez-vous non trouvé ou non autorisé pour la suppression.")

    db.delete(db_rdv)
    db.commit()
    return # FastAPI gère la réponse 204 No Content 

class ExtractClientDataRequest(BaseModel):
    transcript: str
    instructions: Optional[str] = None

class ExtractClientDataResponse(BaseModel):
    extracted_data: Dict[str, Any]
    confidence: float
    processing_time: float

@router.post("/extract-client-data", response_model=ExtractClientDataResponse)
async def extract_client_data_from_transcript(
    request: ExtractClientDataRequest,
    professional_user_id: str = Depends(verify_professional_user)
):
    """
    Extrait les informations client à partir d'un transcript vocal en utilisant l'IA.
    """
    import time
    start_time = time.time()
    
    try:
        # Construire le prompt pour l'IA
        system_prompt = """Tu es un assistant fiscal spécialisé dans l'extraction d'informations client à partir de conversations.
        
        Ta tâche est d'extraire les informations suivantes du transcript fourni :
        
        INFORMATIONS PERSONNELLES :
        - nom_client : Nom de famille
        - prenom_client : Prénom
        - email_client : Adresse email
        - telephone_principal_client : Numéro de téléphone principal
        
        INFORMATIONS PROFESSIONNELLES :
        - profession_client1 : Profession ou métier
        - revenu_net_annuel_client1 : Revenu net annuel (en euros, nombre uniquement)
        
        SITUATION FAMILIALE :
        - situation_maritale_client : Célibataire, Marié(e), Pacsé(e), Divorcé(e), Veuf/Veuve
        - nombre_enfants_a_charge_client : Nombre d'enfants à charge (nombre uniquement)
        
        ADRESSE :
        - adresse_postale_client : Adresse complète
        - code_postal_client : Code postal
        - ville_client : Ville
        
        OBJECTIFS :
        - objectifs_fiscaux_client : Objectifs fiscaux mentionnés
        - objectifs_patrimoniaux_client : Objectifs patrimoniaux mentionnés
        - notes_objectifs_projets_client : Notes et projets spécifiques
        
        RÈGLES IMPORTANTES :
        1. Retourne UNIQUEMENT un objet JSON valide
        2. Pour les champs non trouvés, utilise une chaîne vide ""
        3. Pour les nombres, retourne des chaînes (ex: "50000" pour 50000€)
        4. Sois précis mais ne devine pas si l'information n'est pas claire
        5. Normalise les formats (téléphone, email, etc.)
        
        Format de réponse attendu :
        {
          "nom_client": "",
          "prenom_client": "",
          "email_client": "",
          "telephone_principal_client": "",
          "profession_client1": "",
          "revenu_net_annuel_client1": "",
          "situation_maritale_client": "",
          "nombre_enfants_a_charge_client": "",
          "adresse_postale_client": "",
          "code_postal_client": "",
          "ville_client": "",
          "objectifs_fiscaux_client": "",
          "objectifs_patrimoniaux_client": "",
          "notes_objectifs_projets_client": ""
        }
        """
        
        user_prompt = f"""Transcript de la conversation client :
        
        {request.transcript}
        
        {request.instructions or ''}
        
        Extrais les informations client et retourne le JSON."""
        
        # Appeler l'IA pour extraire les données
        response = await get_fiscal_response(
            system_prompt=system_prompt,
            user_message=user_prompt,
            conversation_history=[]
        )
        
        # Parser la réponse JSON
        try:
            # Essayer d'extraire le JSON de la réponse
            response_text = response.get('response', '')
            
            # Chercher le JSON dans la réponse
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                extracted_data = json.loads(json_str)
            else:
                # Si pas de JSON trouvé, essayer de parser toute la réponse
                extracted_data = json.loads(response_text)
                
        except json.JSONDecodeError as e:
            # En cas d'erreur de parsing, retourner des données vides
            extracted_data = {
                "nom_client": "",
                "prenom_client": "",
                "email_client": "",
                "telephone_principal_client": "",
                "profession_client1": "",
                "revenu_net_annuel_client1": "",
                "situation_maritale_client": "",
                "nombre_enfants_a_charge_client": "",
                "adresse_postale_client": "",
                "code_postal_client": "",
                "ville_client": "",
                "objectifs_fiscaux_client": "",
                "objectifs_patrimoniaux_client": "",
                "notes_objectifs_projets_client": ""
            }
        
        processing_time = time.time() - start_time
        
        # Calculer un score de confiance basé sur la qualité des données extraites
        confidence = 0.0
        if extracted_data:
            filled_fields = sum(1 for value in extracted_data.values() if value and str(value).strip())
            total_fields = len(extracted_data)
            confidence = min(1.0, filled_fields / total_fields * 1.5)  # Bonus pour les données bien extraites
        
        return ExtractClientDataResponse(
            extracted_data=extracted_data,
            confidence=confidence,
            processing_time=processing_time
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'extraction des données : {str(e)}"
        ) 

class DiscoveryExtractionRequest(BaseModel):
    transcript: str
    client_id: Optional[int] = None

class DiscoveryExtractionResponse(BaseModel):
    extracted_data: Dict[str, Any]
    confidence: float
    processing_time: float
    validation_notes: List[str] = []
    field_confidence: Dict[str, float] = {}

@router.post("/extract-discovery-data", response_model=DiscoveryExtractionResponse)
async def extract_discovery_data_from_transcript(
    request: DiscoveryExtractionRequest,
    professional_user_id: str = Depends(verify_professional_user)
):
    """
    Extrait automatiquement les informations de découverte à partir d'une transcription
    de conversation entre un CGP et son client.
    """
    start_time = time.time()
    
    try:
        # Préparer le prompt pour l'extraction de découverte
        system_prompt = """
        Tu es un expert en extraction d'informations fiscales et patrimoniales.
        
        Tu dois extraire les informations suivantes d'une conversation entre un CGP et son client :
        
        INFORMATIONS PERSONNELLES :
        - age: âge du client (nombre)
        - situation_familiale: 'celibataire', 'marie', 'pacs', 'divorce', 'veuf'
        - nombre_enfants: nombre d'enfants à charge
        - residence_fiscale: pays de résidence fiscale
        
        REVENUS ET ACTIVITÉ :
        - revenus_principaux: revenus annuels principaux (nombre)
        - activite_principale: 'salarie', 'independant', 'retraite', 'chomeur', 'etudiant'
        - revenus_complementaires: liste des revenus complémentaires
        - charges_deductibles: charges déductibles annuelles (nombre)
        
        PATRIMOINE :
        - residence_principale: true/false si propriétaire résidence principale
        - residence_secondaire: true/false si propriétaire résidence secondaire
        - epargne_totale: montant total de l'épargne (nombre)
        - investissements: liste des types d'investissements
        
        OBJECTIFS ET PROJETS :
        - objectifs_court_terme: objectifs à moins de 2 ans
        - objectifs_moyen_terme: objectifs 2-5 ans
        - objectifs_long_terme: objectifs plus de 5 ans
        
        NIVEAU DE CONNAISSANCE :
        - niveau_connaissance_fiscale: 'debutant', 'intermediaire', 'avance', 'expert'
        - experience_investissement: 'aucune', 'faible', 'moyenne', 'elevee'
        - tolerance_risque: 'conservateur', 'equilibre', 'dynamique'
        
        BESOINS SPÉCIFIQUES :
        - besoins_specifiques: besoins particuliers mentionnés
        - questions_prioritaires: questions principales du client
        
        OPTIMISATIONS SOUHAITÉES :
        - optimisations_souhaitees: types d'optimisations recherchées
        
        RÈGLES :
        - Si une information n'est pas mentionnée, utilise des valeurs par défaut appropriées
        - Pour les montants, extrais uniquement les nombres
        - Pour les listes, sépare par des virgules
        - Sois précis et conservateur dans tes estimations
        """
        
        # Appeler Francis pour l'extraction
        answer, sources, confidence = await get_fiscal_response(
            query=f"""
            Extrais toutes les informations de découverte client de cette transcription de conversation CGP-client :
            
            TRANSCRIPTION :
            {request.transcript}
            
            Retourne uniquement un JSON valide avec toutes les informations extraites.
            """,
            conversation_history=None
        )
        
        # Parser la réponse JSON
        try:
            # Essayer d'extraire le JSON de la réponse
            json_start = answer.find('{')
            json_end = answer.rfind('}') + 1
            if json_start != -1 and json_end != 0:
                json_str = answer[json_start:json_end]
                extracted_data = json.loads(json_str)
            else:
                # Fallback : parsing manuel des informations clés
                extracted_data = parse_discovery_data_manually(request.transcript)
        except json.JSONDecodeError:
            logger.warning("Erreur parsing JSON, utilisation du fallback manuel")
            extracted_data = parse_discovery_data_manually(request.transcript)
        
        # Valider et compléter les données extraites
        validated_data = validate_and_complete_discovery_data(extracted_data)
        
        # Calculer la confiance par champ
        field_confidence = calculate_field_confidence(extracted_data, request.transcript)
        
        # Notes de validation
        validation_notes = generate_validation_notes(extracted_data, validated_data)
        
        processing_time = time.time() - start_time
        
        return DiscoveryExtractionResponse(
            extracted_data=validated_data,
            confidence=confidence,
            processing_time=processing_time,
            validation_notes=validation_notes,
            field_confidence=field_confidence
        )
        
    except Exception as e:
        logger.error(f"Erreur dans l'extraction de découverte: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'extraction des données de découverte: {str(e)}"
        )

def parse_discovery_data_manually(transcript: str) -> Dict[str, Any]:
    """Parse manuel des données de découverte en cas d'échec du JSON."""
    data = {
        "age": "",
        "situation_familiale": "celibataire",
        "nombre_enfants": 0,
        "residence_fiscale": "france",
        "revenus_principaux": "",
        "activite_principale": "salarie",
        "revenus_complementaires": [],
        "charges_deductibles": "",
        "residence_principale": False,
        "residence_secondaire": False,
        "epargne_totale": "",
        "investissements": [],
        "objectifs_court_terme": [],
        "objectifs_moyen_terme": [],
        "objectifs_long_terme": [],
        "niveau_connaissance_fiscale": "debutant",
        "experience_investissement": "aucune",
        "tolerance_risque": "conservateur",
        "besoins_specifiques": [],
        "questions_prioritaires": "",
        "optimisations_souhaitees": []
    }
    
    # Extraction manuelle basique
    transcript_lower = transcript.lower()
    
    # Âge
    import re
    age_match = re.search(r'(\d+)\s*(?:ans?|âge)', transcript_lower)
    if age_match:
        data["age"] = age_match.group(1)
    
    # Situation familiale
    if any(word in transcript_lower for word in ['marié', 'mariée', 'couple']):
        data["situation_familiale"] = "marie"
    elif any(word in transcript_lower for word in ['pacs', 'pacsé']):
        data["situation_familiale"] = "pacs"
    elif any(word in transcript_lower for word in ['divorcé', 'divorcée']):
        data["situation_familiale"] = "divorce"
    elif any(word in transcript_lower for word in ['veuf', 'veuve']):
        data["situation_familiale"] = "veuf"
    
    # Enfants
    enfants_match = re.search(r'(\d+)\s*enfant', transcript_lower)
    if enfants_match:
        data["nombre_enfants"] = int(enfants_match.group(1))
    
    # Revenus
    revenus_match = re.search(r'(\d+(?:\s*\d+)*)\s*(?:€|euros?|k|mille)', transcript_lower)
    if revenus_match:
        data["revenus_principaux"] = revenus_match.group(1).replace(' ', '')
    
    # Activité
    if any(word in transcript_lower for word in ['indépendant', 'auto-entrepreneur', 'freelance']):
        data["activite_principale"] = "independant"
    elif any(word in transcript_lower for word in ['retraité', 'retraite']):
        data["activite_principale"] = "retraite"
    elif any(word in transcript_lower for word in ['chômeur', 'chômage']):
        data["activite_principale"] = "chomeur"
    elif any(word in transcript_lower for word in ['étudiant', 'étudiante']):
        data["activite_principale"] = "etudiant"
    
    return data

def validate_and_complete_discovery_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Valide et complète les données de découverte avec des valeurs par défaut."""
    defaults = {
        "age": "",
        "situation_familiale": "celibataire",
        "nombre_enfants": 0,
        "residence_fiscale": "france",
        "revenus_principaux": "",
        "activite_principale": "salarie",
        "revenus_complementaires": [],
        "charges_deductibles": "",
        "residence_principale": False,
        "residence_secondaire": False,
        "epargne_totale": "",
        "investissements": [],
        "objectifs_court_terme": [],
        "objectifs_moyen_terme": [],
        "objectifs_long_terme": [],
        "niveau_connaissance_fiscale": "debutant",
        "experience_investissement": "aucune",
        "tolerance_risque": "conservateur",
        "besoins_specifiques": [],
        "questions_prioritaires": "",
        "optimisations_souhaitees": []
    }
    
    # Fusionner avec les valeurs par défaut
    for key, default_value in defaults.items():
        if key not in data or data[key] is None:
            data[key] = default_value
    
    return data

def calculate_field_confidence(extracted_data: Dict[str, Any], transcript: str) -> Dict[str, float]:
    """Calcule la confiance pour chaque champ extrait."""
    field_confidence = {}
    transcript_lower = transcript.lower()
    
    # Logique de calcul de confiance basée sur la présence d'informations
    for field, value in extracted_data.items():
        confidence = 0.3  # Confiance de base
        
        if field == "age" and value:
            confidence = 0.8
        elif field == "situation_familiale" and value != "celibataire":
            confidence = 0.9
        elif field == "nombre_enfants" and value > 0:
            confidence = 0.8
        elif field == "revenus_principaux" and value:
            confidence = 0.7
        elif field == "activite_principale" and value != "salarie":
            confidence = 0.8
        
        field_confidence[field] = min(confidence, 1.0)
    
    return field_confidence

def generate_validation_notes(extracted_data: Dict[str, Any], validated_data: Dict[str, Any]) -> List[str]:
    """Génère des notes de validation pour les données extraites."""
    notes = []
    
    if not extracted_data.get("age"):
        notes.append("Âge non détecté - à vérifier manuellement")
    
    if not extracted_data.get("revenus_principaux"):
        notes.append("Revenus principaux non détectés - à préciser")
    
    if extracted_data.get("situation_familiale") == "celibataire":
        notes.append("Situation familiale par défaut - à confirmer")
    
    if not extracted_data.get("objectifs_court_terme"):
        notes.append("Objectifs à court terme non identifiés")
    
    return notes 