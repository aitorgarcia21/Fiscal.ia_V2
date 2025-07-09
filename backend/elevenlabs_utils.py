from __future__ import annotations

"""Utility wrapper for ElevenLabs STT (Speech-to-Text) and TTS (Text-to-Speech).

The SDK is lazy-imported to avoid mandatory dependency when the feature is unused.
Environment variables expected:
- ELEVEN_API_KEY : your ElevenLabs API key
- ELEVEN_VOICE_ID: (TTS) desired voice ID (defaults to "Bella" if missing)
"""

import os
import io
from functools import lru_cache
from typing import Generator

import httpx
from fastapi import HTTPException, status
from fastapi.responses import StreamingResponse

ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")
ELEVEN_VOICE_ID = os.getenv("ELEVEN_VOICE_ID", "Bella")

if not ELEVEN_API_KEY:
    # The backend should ideally refuse to start without the key when TTS/STT is used.
    # We do a runtime check later to allow the rest of the app to work without it.
    pass


@lru_cache(maxsize=1)
def _get_eleven_client():  # lazy import to keep startup fast
    try:
        from elevenlabs import ElevenLabs
    except ImportError as e:
        raise RuntimeError("elevenlabs SDK not installed. Add it to requirements.txt") from e

    if not ELEVEN_API_KEY:
        raise RuntimeError("ELEVEN_API_KEY environment variable missing")

    return ElevenLabs(api_key=ELEVEN_API_KEY)


def speech_to_text(audio_bytes: bytes, model: str | None = None, language: str = "fr") -> str:
    """Send audio to ElevenLabs STT and return transcribed text."""
    client = _get_eleven_client()

    # The SDK exposes a `speech_to_text` method; if not, fallback via REST.
    if hasattr(client, "speech_to_text"):
        response = client.speech_to_text(audio=audio_bytes, model=model or "eleven_multilingual_v2", language=language)
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="STT failed: empty response from ElevenLabs")
        return response.text

    # Manual REST fallback
    url = "https://api.elevenlabs.io/v1/speech-to-text"
    headers = {
        "xi-api-key": ELEVEN_API_KEY,
    }
    data = {
        "model": model or "eleven_multilingual_v2",
        "language": language,
    }
    files = {"audio": ("audio.webm", audio_bytes, "audio/webm")}
    with httpx.Client(timeout=60) as client_http:
        r = client_http.post(url, headers=headers, data=data, files=files)
        if r.status_code != 200:
            raise HTTPException(status_code=500, detail=f"STT failed: {r.status_code} {r.text}")
        res = r.json()
        return res.get("text", "")


def text_to_speech_stream(text: str, voice_id: str | None = None, model: str | None = None) -> StreamingResponse:
    """Return a StreamingResponse of TTS audio (mpeg)."""
    client = _get_eleven_client()

    voice = voice_id or ELEVEN_VOICE_ID
    tts_model = model or "eleven_multilingual_v2"

    # SDK streaming generator yields bytes chunks
    try:
        audio_stream: Generator[bytes, None, None] = client.generate(
            text=text,
            voice=voice,
            model=tts_model,
            stream=True,
            format="mp3",
        )
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"TTS generation error: {err}") from err

    return StreamingResponse(audio_stream, media_type="audio/mpeg")
