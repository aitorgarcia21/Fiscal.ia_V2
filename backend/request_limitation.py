
import time
from datetime import datetime, timedelta
from fastapi import HTTPException, Request
from typing import Dict, Optional
import json

# Stockage en mémoire des requêtes (en production, utilisez Redis)
request_counts: Dict[str, Dict] = {}

def check_request_limit(user_id: str, plan_type: str, request_limit: int) -> bool:
    """
    Vérifie si l'utilisateur peut faire une nouvelle requête
    
    Args:
        user_id: ID de l'utilisateur
        plan_type: Type de plan ('particulier' ou 'professionnel')
        request_limit: Limite de requêtes (-1 pour illimité)
    
    Returns:
        bool: True si la requête est autorisée
    """
    if plan_type == 'professionnel' or request_limit == -1:
        return True  # Pas de limitation pour les professionnels
    
    now = datetime.now()
    current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    if user_id not in request_counts:
        request_counts[user_id] = {
            'count': 0,
            'reset_date': current_month
        }
    
    user_data = request_counts[user_id]
    
    # Réinitialiser le compteur si on est dans un nouveau mois
    if now >= user_data['reset_date'] + timedelta(days=32):
        user_data['count'] = 0
        user_data['reset_date'] = current_month
    
    # Vérifier la limite
    if user_data['count'] >= request_limit:
        return False
    
    # Incrémenter le compteur
    user_data['count'] += 1
    return True

def get_remaining_requests(user_id: str) -> int:
    """
    Retourne le nombre de requêtes restantes pour l'utilisateur
    
    Args:
        user_id: ID de l'utilisateur
    
    Returns:
        int: Nombre de requêtes restantes (-1 pour illimité)
    """
    if user_id not in request_counts:
        return 30  # Limite par défaut pour les particuliers
    
    user_data = request_counts[user_id]
    now = datetime.now()
    current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Réinitialiser si nouveau mois
    if now >= user_data['reset_date'] + timedelta(days=32):
        return 30
    
    return max(0, 30 - user_data['count'])

async def request_limitation_middleware(request: Request, call_next):
    """
    Middleware pour limiter les requêtes selon le plan utilisateur
    """
    # Vérifier si c'est une requête vers l'API Francis
    if request.url.path.startswith("/api/francis") or request.url.path.startswith("/api/assistant"):
        # Récupérer l'utilisateur depuis le token (à adapter selon votre auth)
        user_id = request.headers.get("X-User-ID")
        
        if user_id:
            # Récupérer le plan utilisateur depuis la base de données
            # Ici vous devrez adapter selon votre système d'authentification
            plan_type = "particulier"  # À récupérer depuis la DB
            request_limit = 30  # À récupérer depuis la DB
            
            if not check_request_limit(user_id, plan_type, request_limit):
                remaining = get_remaining_requests(user_id)
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "Limite de requêtes atteinte",
                        "message": f"Vous avez atteint votre limite de {request_limit} requêtes ce mois-ci.",
                        "remaining_requests": remaining,
                        "reset_date": (datetime.now().replace(day=1) + timedelta(days=32)).isoformat()
                    }
                )
    
    response = await call_next(request)
    return response
