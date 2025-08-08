"""
ROUTES FASTAPI POUR FRANCIS PARTICULIER INDÉPENDANT
===================================================

Routes FastAPI pour l'assistant fiscal européen indépendant.
Intégration native avec le système FastAPI existant de Fiscal.ia.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import json
import asyncio

# Import de Francis Particulier Indépendant
from francis_particulier_independent import (
    francis_particulier,
    get_francis_particulier_response
)

# Création du router FastAPI
francis_particulier_router = APIRouter(
    prefix="/api/francis-particulier",
    tags=["Francis Particulier Indépendant"]
)

# Modèles Pydantic
class FrancisQuery(BaseModel):
    query: str
    user_profile: Optional[Dict[str, Any]] = None

class TaxCalculationRequest(BaseModel):
    country: str
    annual_income: float
    marital_status: Optional[str] = "single"

class CountryComparisonRequest(BaseModel):
    annual_income: float
    countries: Optional[List[str]] = ["FR", "DE", "CH", "AD", "LU"]

class OptimizationRequest(BaseModel):
    annual_income: float
    country: Optional[str] = "FR"
    objectives: Optional[List[str]] = ["reduce_tax"]
    assets: Optional[float] = 0
    age: Optional[int] = 30

@francis_particulier_router.post("/query")
async def francis_particulier_query(request: FrancisQuery):
    """
    Endpoint principal pour les questions fiscales particuliers
    """
    try:
        # Génération de la réponse
        response_data = francis_particulier.generate_response(
            request.query, 
            request.user_profile
        )
        
        return {
            "status": "success",
            "response": response_data["response"],
            "metadata": {
                "type": response_data.get("type", "unknown"),
                "confidence": response_data.get("confidence", 0.0),
                "analysis_method": response_data.get("analysis_method", "basic"),
                "enriched_by_llm": response_data.get("enriched_by_llm", False)
            },
            "data": {
                k: v for k, v in response_data.items() 
                if k not in ["response", "type", "confidence"]
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du traitement: {str(e)}"
        )

@francis_particulier_router.post("/calculate-tax")
async def calculate_tax(request: TaxCalculationRequest):
    """
    Endpoint pour calculs d'impôts directs
    """
    try:
        # Calcul de l'impôt
        tax_calculation = francis_particulier.knowledge_base.calculate_income_tax(
            request.country, 
            request.annual_income, 
            request.marital_status
        )
        
        if "error" in tax_calculation:
            raise HTTPException(
                status_code=400,
                detail=tax_calculation["error"]
            )
        
        return {
            "status": "success",
            "calculation": tax_calculation
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Montant invalide: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du calcul: {str(e)}"
        )

@francis_particulier_router.post("/compare-countries")
async def compare_countries(request: CountryComparisonRequest):
    """
    Endpoint pour comparaison fiscale entre pays
    """
    try:
        # Comparaison entre pays
        comparison = francis_particulier.knowledge_base.compare_countries(
            request.annual_income, 
            request.countries
        )
        
        return {
            "status": "success",
            "comparison": comparison
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Montant invalide: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la comparaison: {str(e)}"
        )

@francis_particulier_router.post("/optimization-advice")
async def optimization_advice(request: OptimizationRequest):
    """
    Endpoint pour conseils d'optimisation fiscale
    """
    try:
        profile = {
            "annual_income": request.annual_income,
            "country": request.country,
            "objectives": request.objectives,
            "assets": request.assets,
            "age": request.age
        }
        
        # Conseils d'optimisation
        advice = francis_particulier.knowledge_base.get_tax_optimization_advice(profile)
        
        return {
            "status": "success",
            "advice": advice
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Données invalides: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'optimisation: {str(e)}"
        )

@francis_particulier_router.get("/countries")
async def get_supported_countries():
    """Retourne la liste des pays supportés"""
    try:
        countries = francis_particulier.get_supported_countries()
        
        return {
            "status": "success",
            "countries": countries,
            "count": len(countries)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération: {str(e)}"
        )

@francis_particulier_router.post("/stream")
async def francis_particulier_stream(request: FrancisQuery):
    """
    Endpoint de streaming pour réponses en temps réel
    """
    try:
        async def generate_stream():
            """Générateur pour le streaming"""
            try:
                async for chunk in francis_particulier.generate_response_stream(
                    request.query, 
                    request.user_profile
                ):
                    yield f"data: {chunk}\n\n"
                    
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du streaming: {str(e)}"
        )

@francis_particulier_router.get("/health")
async def health_check():
    """Vérification de l'état du service avec monitoring avancé"""
    try:
        return francis_particulier.get_health_status()
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@francis_particulier_router.get("/analytics")
async def get_analytics():
    """Retourne les analytics et métriques de performance"""
    try:
        return {
            "status": "success",
            "analytics": francis_particulier.get_analytics_summary()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@francis_particulier_router.get("/cache/stats")
async def get_cache_stats():
    """Retourne les statistiques du cache"""
    try:
        return {
            "status": "success",
            "cache_stats": francis_particulier.get_cache_stats()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@francis_particulier_router.post("/cache/clear")
async def clear_cache():
    """Vide le cache de réponses"""
    try:
        francis_particulier.clear_cache()
        return {
            "status": "success",
            "message": "Cache vidé avec succès"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@francis_particulier_router.get("/conversation/summary")
async def get_conversation_summary():
    """Retourne un résumé de la conversation actuelle"""
    try:
        return {
            "status": "success",
            "conversation": francis_particulier.get_conversation_summary()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@francis_particulier_router.get("/conversation/export")
async def export_conversation():
    """Exporte la conversation au format JSON"""
    try:
        export_data = francis_particulier.export_conversation()
        return {
            "status": "success",
            "export": export_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

class ConfigUpdate(BaseModel):
    config: Dict[str, Any]

@francis_particulier_router.post("/config/update")
async def update_config(request: ConfigUpdate):
    """Met à jour la configuration de Francis"""
    try:
        francis_particulier.update_config(request.config)
        return {
            "status": "success",
            "message": "Configuration mise à jour",
            "new_config": francis_particulier.config
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@francis_particulier_router.get("/test")
async def test_francis():
    """Test simple de Francis Particulier"""
    try:
        test_query = "Combien d'impôt je paie avec 50000€ en France ?"
        response = get_francis_particulier_response(test_query)
        
        return {
            "status": "success",
            "test_query": test_query,
            "response": response[:200] + "..." if len(response) > 200 else response
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# Route de compatibilité avec l'ancien système Francis
@francis_particulier_router.post("/test-francis-particulier")
async def test_francis_particulier_compatibility(request: dict):
    """
    Route de compatibilité pour intégration avec l'interface existante
    Compatible avec le format utilisé par test-francis
    """
    try:
        query = request.get("message", "")
        if not query:
            raise HTTPException(status_code=400, detail="Message requis")
        
        # Génération de la réponse avec Francis Particulier
        response_data = francis_particulier.generate_response(query)
        
        # Format compatible avec l'interface existante
        return {
            "response": response_data["response"],
            "type": "francis_particulier_independent",
            "metadata": {
                "analysis_method": response_data.get("analysis_method", "basic"),
                "confidence": response_data.get("confidence", 0.0),
                "enriched_by_llm": response_data.get("enriched_by_llm", False),
                "countries_supported": len(francis_particulier.knowledge_base.countries_data)
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur Francis Particulier: {str(e)}"
        )
