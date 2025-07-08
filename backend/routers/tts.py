from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import os
import io
from elevenlabs import generate, set_api_key

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    voiceId: str = "1a3lMdKLUcfcMtvN772u"  # ID de voix par défaut pour Francis
    modelId: str = "eleven_multilingual_v2"  # Modèle par défaut

def get_elevenlabs_api_key() -> str:
    """Récupère la clé API ElevenLabs depuis les variables d'environnement"""
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="La clé API ElevenLabs n'est pas configurée"
        )
    return api_key

@router.post("/tts")
async def text_to_speech(request: TTSRequest, api_key: str = Depends(get_elevenlabs_api_key)):
    """
    Convertit le texte en parole en utilisant ElevenLabs
    """
    try:
        # Configurer la clé API ElevenLabs
        set_api_key(api_key)
        
        # Générer l'audio avec ElevenLabs
        audio = generate(
            text=request.text,
            voice=request.voiceId,
            model=request.modelId
        )
        
        # Créer un flux audio à partir des données binaires
        audio_stream = io.BytesIO(audio)
        
        # Retourner le flux audio
        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename=speech.mp3"
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération de la synthèse vocale: {str(e)}"
        )
