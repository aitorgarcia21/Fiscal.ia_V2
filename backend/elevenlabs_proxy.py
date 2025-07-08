from fastapi import APIRouter, HTTPException, File, UploadFile, Request
from fastapi.responses import StreamingResponse, JSONResponse
import os
import requests

router = APIRouter()

ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")
ELEVEN_VOICE_ID = os.getenv("ELEVEN_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")
ELEVEN_BASE_URL = "https://api.elevenlabs.io"

@router.post("/eleven/tts")
async def eleven_tts(request: Request):
    """Proxy Text-to-Speech vers ElevenLabs. Body JSON: {"text": str, "voice_id"?: str}"""
    if not ELEVEN_API_KEY:
        raise HTTPException(status_code=500, detail="ELEVEN_API_KEY manquant")

    body = await request.json()
    text = body.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Champ 'text' requis")

    voice_id = body.get("voice_id", ELEVEN_VOICE_ID)
    url = f"{ELEVEN_BASE_URL}/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": ELEVEN_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.4, "similarity_boost": 0.7}
    }

    resp = requests.post(url, json=payload, headers=headers, stream=True)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return StreamingResponse(resp.iter_content(chunk_size=8192), media_type="audio/mpeg")

@router.post("/eleven/stt")
async def eleven_stt(file: UploadFile = File(...)):
    """Proxy Speech-to-Text vers ElevenLabs. multipart/form-data avec fichier audio."""
    if not ELEVEN_API_KEY:
        raise HTTPException(status_code=500, detail="ELEVEN_API_KEY manquant")

    audio_bytes = await file.read()
    url = f"{ELEVEN_BASE_URL}/v1/speech-to-text"
    headers = {"xi-api-key": ELEVEN_API_KEY}
    files = {"audio": (file.filename, audio_bytes, file.content_type or "audio/wav")}

    resp = requests.post(url, headers=headers, files=files)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return JSONResponse(content=resp.json())
