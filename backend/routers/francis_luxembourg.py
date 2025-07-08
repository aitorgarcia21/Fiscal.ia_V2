"""francis_luxembourg.py

API Router pour Francis Luxembourg - Assistant fiscal spécialisé sur la législation luxembourgeoise.
S'appuie sur `assistant_fiscal_simple.get_fiscal_response` avec `jurisdiction="LU"`.

Cette route est volontairement simple : la logique RAG et les embeddings sont déjà
prises en charge dans `assistant_fiscal_simple` et `mistral_luxembourg_embeddings`.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging

try:
    from assistant_fiscal_simple import get_fiscal_response
    LUX_BACKEND_AVAILABLE = True
except ImportError:
    try:
        from backend.assistant_fiscal_simple import get_fiscal_response  # type: ignore
        LUX_BACKEND_AVAILABLE = True
    except ImportError:
        LUX_BACKEND_AVAILABLE = False

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/francis-lux", tags=["Francis Luxembourg"])


class LuxQuestionRequest(BaseModel):
    question: str
    conversation_history: Optional[List[Dict]] = []


class LuxQuestionResponse(BaseModel):
    answer: str
    sources: List[str]
    confidence: float


@router.post("/ask", response_model=LuxQuestionResponse)
async def ask_francis_lux(request: LuxQuestionRequest):
    """Poser une question fiscale luxembourgeoise à Francis."""
    if not LUX_BACKEND_AVAILABLE:
        raise HTTPException(status_code=503, detail="Service Francis Luxembourg non disponible")

    try:
        result = get_fiscal_response(
            query=request.question,
            conversation_history=request.conversation_history or [],
            jurisdiction="LU",
        )
        # La fonction renvoie déjà un dict complet
        return LuxQuestionResponse(
            answer=result.get("answer", "Désolé, je ne peux pas répondre à cette question pour le moment."),
            sources=result.get("sources", []),
            confidence=result.get("confidence", 0.0),
        )
    except Exception as e:
        logger.error("Erreur dans ask_francis_lux: %s", e)
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")


@router.get("/health")
async def health_check():
    """Vérifier l'état de santé de Francis Luxembourg."""
    return {"status": "healthy" if LUX_BACKEND_AVAILABLE else "unavailable"}
