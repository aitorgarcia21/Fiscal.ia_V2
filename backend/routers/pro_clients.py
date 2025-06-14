from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
import asyncio
import json

from backend.database import get_db
from backend.models_pro import ClientProfile
from backend.schemas_pro import ClientProfileCreate, ClientProfileResponse, ClientProfileUpdate, AnalysisResultSchema, AnalysisRecommendation
from backend.dependencies import supabase, verify_token
from backend.assistant_fiscal_simple import get_fiscal_response

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