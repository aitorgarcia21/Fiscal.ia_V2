from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
import io
import tempfile
import os
from typing import List, Dict, Any, Optional
import json
from datetime import datetime
from pydantic import BaseModel
import asyncio

# Import optionnel de Whisper
try:
    import whisper
except ImportError:
    whisper = None

router = APIRouter(prefix="/api/pro/teams-assistant", tags=["teams-assistant"])

# Modèle Whisper pour la transcription
whisper_model = None

def get_whisper_model():
    global whisper_model
    if whisper_model is None and whisper is not None:
        whisper_model = whisper.load_model("base")
    return whisper_model

class TeamsAnalysisRequest(BaseModel):
    transcription: str
    context: str = "teams-meeting"
    platform: str = "teams"
    meeting_topic: Optional[str] = None
    participants_count: Optional[int] = None

class TeamsSuggestion(BaseModel):
    type: str  # "question", "optimization", "risk", "action"
    content: str
    priority: str = "medium"  # "high", "medium", "low"
    category: str = "general"

@router.post("/transcribe")
async def transcribe_teams_audio(
    audio: UploadFile = File(...),
    platform: str = Form("teams"),
    timestamp: str = Form(...)
):
    """Transcrit l'audio de la réunion Teams"""
    try:
        # Sauvegarder l'audio temporairement
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        # Transcription avec Whisper optimisé pour Teams
        model = get_whisper_model()
        result = model.transcribe(
            temp_file_path, 
            language="fr",
            task="transcribe",
            verbose=False
        )
        
        # Nettoyer le fichier temporaire
        os.unlink(temp_file_path)
        
        return {
            "transcription": result["text"],
            "confidence": result.get("confidence", 0.0),
            "language": result.get("language", "fr"),
            "timestamp": timestamp,
            "platform": platform
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur transcription Teams: {str(e)}")

@router.post("/analyze")
async def analyze_teams_conversation(request: TeamsAnalysisRequest):
    """Analyse la conversation Teams et génère des suggestions spécialisées"""
    try:
        # Analyser le contexte de la conversation Teams
        analysis_prompt = f"""
        Analyse cette transcription de réunion Microsoft Teams et génère des suggestions utiles pour le professionnel fiscal :
        
        Transcription : {request.transcription}
        
        Contexte : {request.context}
        Plateforme : {request.platform}
        Sujet de réunion : {request.meeting_topic or "Non spécifié"}
        Nombre de participants : {request.participants_count or "Non spécifié"}
        
        Génère des suggestions dans ces catégories :
        
        1. QUESTIONS FISCALES À POSER :
        - Questions spécifiques pour clarifier la situation fiscale
        - Points à approfondir concernant les revenus, investissements, etc.
        
        2. OPPORTUNITÉS D'OPTIMISATION :
        - Crédits d'impôt applicables
        - Stratégies de défiscalisation
        - Optimisations patrimoniales
        
        3. RISQUES À IDENTIFIER :
        - Points de vigilance fiscale
        - Situations à clarifier
        - Dangers potentiels
        
        4. ACTIONS PRIORITAIRES :
        - Prochaines étapes recommandées
        - Documents à demander
        - Analyses à effectuer
        
        Format : Liste simple, phrases courtes et directes, maximum 3 suggestions par catégorie.
        """
        
        # Utiliser l'API Francis pour l'analyse
        from backend.assistant_fiscal import ask_francis
        
        response = await ask_francis(
            query=analysis_prompt,
            conversation_history=[],
            jurisdiction="FR"
        )
        
        # Parser la réponse pour extraire les suggestions par catégorie
        suggestions = parse_teams_suggestions(response.get("answer", ""))
        
        return {
            "suggestions": suggestions,
            "context": request.context,
            "timestamp": datetime.now().isoformat(),
            "meeting_topic": request.meeting_topic
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur analyse Teams: {str(e)}")

def parse_teams_suggestions(response_text: str) -> List[TeamsSuggestion]:
    """Parse la réponse de Francis pour extraire les suggestions structurées"""
    suggestions = []
    
    # Diviser par catégories
    categories = {
        "questions": "QUESTIONS FISCALES À POSER",
        "optimizations": "OPPORTUNITÉS D'OPTIMISATION", 
        "risks": "RISQUES À IDENTIFIER",
        "actions": "ACTIONS PRIORITAIRES"
    }
    
    lines = response_text.split('\n')
    current_category = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Détecter les catégories
        for cat_key, cat_name in categories.items():
            if cat_name.lower() in line.lower():
                current_category = cat_key
                break
        
        # Détecter les suggestions (commencent par des puces ou des tirets)
        if line.startswith(('•', '-', '*', '1.', '2.', '3.')) and current_category:
            content = line.lstrip('•-*123456789. ').strip()
            if content:
                suggestions.append(TeamsSuggestion(
                    type=current_category,
                    content=content,
                    priority="high" if current_category in ["risks", "actions"] else "medium",
                    category=current_category
                ))
    
    return suggestions[:12]  # Limiter à 12 suggestions max

@router.post("/real-time-assist")
async def teams_real_time_assist(
    current_topic: str,
    client_context: Optional[Dict[str, Any]] = None,
    meeting_duration: Optional[int] = None
):
    """Assistance en temps réel pendant la réunion Teams"""
    try:
        prompt = f"""
        Le professionnel discute actuellement de : {current_topic}
        
        Contexte client : {json.dumps(client_context, ensure_ascii=False) if client_context else "Non disponible"}
        Durée de réunion : {meeting_duration or 0} minutes
        
        Fournis 2-3 suggestions immédiates et spécifiques pour :
        1. Questions précises à poser maintenant
        2. Points fiscaux à clarifier immédiatement
        3. Opportunités à saisir dans cette réunion
        
        Réponse courte, directe et actionable.
        """
        
        from backend.assistant_fiscal import ask_francis
        
        response = await ask_francis(
            query=prompt,
            conversation_history=[],
            jurisdiction="FR"
        )
        
        return {
            "suggestions": response.get("answer", "").split('\n')[:3],
            "topic": current_topic,
            "timestamp": datetime.now().isoformat(),
            "meeting_duration": meeting_duration
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur assistance temps réel Teams: {str(e)}")

@router.post("/meeting-summary")
async def generate_teams_meeting_summary(
    transcription: str,
    meeting_duration: int,
    participants: List[str] = [],
    meeting_topic: Optional[str] = None
):
    """Génère un résumé de la réunion Teams"""
    try:
        summary_prompt = f"""
        Génère un résumé professionnel de cette réunion Teams :
        
        Sujet : {meeting_topic or "Réunion client"}
        Durée : {meeting_duration} minutes
        Participants : {', '.join(participants) if participants else "Non spécifiés"}
        
        Transcription : {transcription}
        
        Crée un résumé structuré avec :
        1. Points clés discutés
        2. Décisions prises
        3. Actions à suivre
        4. Questions en suspens
        5. Prochaines étapes
        
        Format : Professionnel et concis.
        """
        
        from backend.assistant_fiscal import ask_francis
        
        response = await ask_francis(
            query=summary_prompt,
            conversation_history=[],
            jurisdiction="FR"
        )
        
        return {
            "summary": response.get("answer", ""),
            "meeting_topic": meeting_topic,
            "duration": meeting_duration,
            "participants": participants,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur génération résumé Teams: {str(e)}")

@router.get("/health")
async def teams_assistant_health():
    """Vérification de l'état de l'assistant Teams"""
    return {
        "status": "healthy",
        "service": "teams-assistant",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "transcription",
            "analysis", 
            "real-time-assist",
            "meeting-summary"
        ]
    } 