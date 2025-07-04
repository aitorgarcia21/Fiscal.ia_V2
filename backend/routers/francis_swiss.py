"""
API Router pour Francis Suisse - Assistant fiscal spécialisé en fiscalité suisse
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging

# Imports locaux
try:
    from rag_swiss import SwissRAGSystem
    from assistant_fiscal import is_swiss_fiscal_question
    SWISS_RAG_AVAILABLE = True
except ImportError:
    SWISS_RAG_AVAILABLE = False

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/francis-swiss", tags=["Francis Suisse"])

# Initialisation du système RAG suisse
swiss_rag = None
if SWISS_RAG_AVAILABLE:
    try:
        swiss_rag = SwissRAGSystem()
        logger.info("Francis Suisse initialisé avec succès")
    except Exception as e:
        logger.error(f"Erreur initialisation Francis Suisse: {e}")
        SWISS_RAG_AVAILABLE = False

# Modèles Pydantic
class SwissQuestionRequest(BaseModel):
    question: str
    conversation_history: Optional[List[Dict]] = []

class SwissQuestionResponse(BaseModel):
    answer: str
    sources: List[str]
    confidence: float
    is_swiss_question: bool
    suggestions: Optional[List[str]] = []

@router.post("/ask", response_model=SwissQuestionResponse)
async def ask_francis_swiss(request: SwissQuestionRequest):
    """
    Poser une question fiscale suisse à Francis
    """
    try:
        if not SWISS_RAG_AVAILABLE or not swiss_rag:
            raise HTTPException(
                status_code=503, 
                detail="Service Francis Suisse non disponible"
            )
        
        # Vérifier si c'est une question fiscale suisse
        is_swiss = is_swiss_fiscal_question(request.question)
        
        if not is_swiss:
            return SwissQuestionResponse(
                answer="Cette question ne semble pas concerner la fiscalité suisse. Je suis spécialisé dans le système fiscal suisse. Pourriez-vous reformuler votre question ?",
                sources=[],
                confidence=0.0,
                is_swiss_question=False,
                suggestions=[
                    "Comment fonctionne le Pilier 3A en Suisse ?",
                    "Quelles sont les différences fiscales entre les cantons ?",
                    "Comment optimiser mes impôts en Suisse ?"
                ]
            )
        
        # Rechercher dans la base de connaissances suisse
        result = swiss_rag.answer_swiss_fiscal_question(request.question, top_k=5)
        
        # Préparer les sources
        sources = []
        if result.get('sources'):
            sources = [f"Base fiscale suisse - {source.get('chunk_id', 'N/A')}" 
                      for source in result['sources']]
        
        # Obtenir des suggestions d'optimisation
        suggestions = swiss_rag.get_swiss_tax_suggestions()
        
        return SwissQuestionResponse(
            answer=result.get('answer', 'Désolé, je ne peux pas répondre à cette question pour le moment.'),
            sources=sources,
            confidence=result.get('confidence', 0.0),
            is_swiss_question=True,
            suggestions=suggestions[:3]
        )
        
    except Exception as e:
        logger.error(f"Erreur dans ask_francis_swiss: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@router.get("/health")
async def health_check():
    """
    Vérifier l'état de santé de Francis Suisse
    """
    return {
        "status": "healthy" if SWISS_RAG_AVAILABLE and swiss_rag else "unavailable",
        "rag_available": SWISS_RAG_AVAILABLE,
        "knowledge_base_loaded": bool(swiss_rag and swiss_rag.chunks_cache) if swiss_rag else False,
        "embeddings_loaded": bool(swiss_rag and swiss_rag.embeddings_cache) if swiss_rag else False,
        "chunks_count": len(swiss_rag.chunks_cache) if swiss_rag else 0,
        "embeddings_count": len(swiss_rag.embeddings_cache) if swiss_rag else 0
    } 