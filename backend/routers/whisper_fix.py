"""
🎯 WHISPER LOCAL ULTRA-PERFORMANT - SOLUTION IMMÉDIATE
Endpoints Whisper Local fonctionnels pour la reconnaissance vocale d'entretiens
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import base64
import tempfile
import os
import time
from typing import Optional, Dict, Any
import logging

# Configuration logging
logger = logging.getLogger(__name__)

# Import sécurisé de Whisper
try:
    from whisper_service import get_whisper_service
    WHISPER_AVAILABLE = True
    logger.info("✅ Service Whisper Local chargé avec succès")
except ImportError as e:
    WHISPER_AVAILABLE = False
    logger.warning(f"⚠️ Service Whisper non disponible: {e}")

# Créer le router
router = APIRouter(prefix="/whisper", tags=["whisper"])

# Modèles Pydantic
class WhisperTranscribeRequest(BaseModel):
    audio_base64: str
    audio_format: Optional[str] = "webm"
    language: Optional[str] = "fr"

class WhisperResponse(BaseModel):
    text: str
    confidence: Optional[float] = None
    processing_time: Optional[float] = None
    error: Optional[str] = None

@router.get("/health")
async def whisper_health():
    """Vérification de santé du service Whisper Local"""
    if not WHISPER_AVAILABLE:
        return {
            "status": "unavailable",
            "error": "Service Whisper non disponible",
            "message": "Installer faster-whisper pour activer la transcription"
        }
    
    try:
        service = get_whisper_service()
        health = service.check_health()
        return {
            "status": "healthy",
            "message": "Whisper Local opérationnel",
            "model_loaded": health.get("model_loaded", False),
            "cache_size": health.get("cache_size", 0)
        }
    except Exception as e:
        logger.error(f"Erreur health check Whisper: {e}")
        return {
            "status": "error",
            "error": str(e),
            "message": "Erreur lors de la vérification de santé"
        }

@router.post("/transcribe", response_model=WhisperResponse)
async def whisper_transcribe_simple(request: WhisperTranscribeRequest):
    """Transcription simple avec Whisper Local"""
    if not WHISPER_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="Service Whisper non disponible - installer faster-whisper"
        )
    
    if not request.audio_base64:
        raise HTTPException(
            status_code=400, 
            detail="Audio manquant dans la requête"
        )
    
    start_time = time.time()
    
    try:
        # Obtenir le service Whisper
        service = get_whisper_service()
        if not service:
            raise HTTPException(
                status_code=500,
                detail="Impossible d'initialiser le service Whisper"
            )
        
        # Transcription
        result = service.transcribe_base64_audio(
            request.audio_base64, 
            request.audio_format
        )
        
        if result.get("error"):
            raise HTTPException(
                status_code=500,
                detail=f"Erreur transcription: {result['error']}"
            )
        
        processing_time = time.time() - start_time
        
        return WhisperResponse(
            text=result.get("text", ""),
            confidence=result.get("confidence"),
            processing_time=processing_time,
            error=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur transcription Whisper: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne: {str(e)}"
        )

@router.post("/transcribe-ultra-fluid")
async def whisper_transcribe_ultra_fluid(request: Request):
    """
    🎯 ENDPOINT ULTRA-FLUIDE pour reconnaissance vocale temps réel
    Compatible avec le frontend existant
    """
    if not WHISPER_AVAILABLE:
        return {
            "error": "Service Whisper non disponible",
            "text": "",
            "confidence": 0
        }
    
    try:
        # Parse request body
        body = await request.json()
        audio_base64 = body.get("audio_base64", "")
        language = body.get("language", "fr")
        
        if not audio_base64:
            return {
                "error": "Audio manquant",
                "text": "",
                "confidence": 0
            }
        
        start_time = time.time()
        
        # Service Whisper Local
        service = get_whisper_service()
        if not service:
            return {
                "error": "Service Whisper non initialisé",
                "text": "",
                "confidence": 0
            }
        
        # Transcription optimisée
        result = service.transcribe_base64_audio(audio_base64, "webm")
        
        if result.get("error"):
            return {
                "error": result["error"],
                "text": "",
                "confidence": 0
            }
        
        processing_time = time.time() - start_time
        text = result.get("text", "").strip()
        
        logger.info(f"🎤 Whisper transcription: '{text}' ({processing_time:.2f}s)")
        
        return {
            "text": text,
            "confidence": result.get("confidence", 0.9),
            "processing_time": processing_time,
            "language": language,
            "model": "faster-whisper",
            "error": None
        }
        
    except Exception as e:
        logger.error(f"Erreur transcribe-ultra-fluid: {e}")
        return {
            "error": f"Erreur: {str(e)}",
            "text": "",
            "confidence": 0
        }

@router.post("/test")
async def whisper_test():
    """Test rapide du service Whisper"""
    if not WHISPER_AVAILABLE:
        return {
            "status": "unavailable",
            "message": "Installer: pip install faster-whisper"
        }
    
    try:
        service = get_whisper_service()
        info = service.get_model_info()
        return {
            "status": "available",
            "message": "Whisper Local fonctionnel",
            "model_info": info
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
