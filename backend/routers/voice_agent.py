from fastapi import APIRouter, Header, HTTPException, status, Depends
from pydantic import BaseModel
import hmac
import hashlib
import os
from typing import List, Dict, Any

# Essayer d'abord les imports absolus pour le déploiement
try:
    from backend.dependencies import verify_token  # reuse auth if needed, though agent will call anonymously
    from backend.assistant_fiscal_simple import get_fiscal_response
except ImportError:
    # Fallback aux imports relatifs pour le développement local
    try:
        from ..dependencies import verify_token
        from ..assistant_fiscal_simple import get_fiscal_response
    except ImportError:
        # Dernier fallback aux imports directs
        from dependencies import verify_token
        from assistant_fiscal_simple import get_fiscal_response

router = APIRouter(prefix="/api", tags=["voice_agent"])

ELEVEN_AGENT_SECRET = os.getenv("ELEVEN_AGENT_SECRET", "")

class AgentMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class AgentRequest(BaseModel):
    text: str
    history: List[AgentMessage] | None = None
    jurisdiction: str | None = "FR"

class AgentResponse(BaseModel):
    response: str


def verify_signature(body: bytes, signature: str):
    if not ELEVEN_AGENT_SECRET:
        raise HTTPException(status_code=500, detail="Agent secret not configured")
    expected = hmac.new(ELEVEN_AGENT_SECRET.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/voice-agent", response_model=AgentResponse)
async def voice_agent_endpoint(
    request: AgentRequest,
    x_elevenlabs_signature: str = Header(""),
):
    # Verify signature
    # Note: FastAPI already parsed body, but we need raw body for HMAC; we circumvent by re-serializing
    import json
    body_bytes = json.dumps(request.dict()).encode()
    if not verify_signature(body_bytes, x_elevenlabs_signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")

    # Call Francis LLM
    try:
        answer, sources, _ = await get_fiscal_response(
            question=request.text,
            conversation_history=request.history or [],
            jurisdiction=request.jurisdiction or "FR",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Francis error: {e}")

    return AgentResponse(response=answer)
