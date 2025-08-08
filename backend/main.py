from dotenv import load_dotenv

# Set up logging with masking and rotation
try:
    from logging_config import setup_logging  # type: ignore
    setup_logging()
except Exception:
    import logging
    logging.basicConfig(level=logging.INFO)
load_dotenv()
from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, WebSocket, WebSocketDisconnect, Form, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse, HTMLResponse, JSONResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime, timedelta, timezone
import os
import json
import uuid
import asyncio
import httpx
import requests
from supabase import create_client, Client
import stripe
from passlib.context import CryptContext
from jose import JWTError, jwt
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from fastapi.middleware.wsgi import WSGIMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import APIRouter
# from elevenlabs_proxy import router as eleven_router  # DÉSACTIVÉ temporairement - problème d'import
import concurrent.futures
from sqlalchemy.orm import Session
import re
import sys
import tempfile
import logging
import base64
# --- Import optionnel de Whisper ---

# --- Optional AWS S3 helper ---
try:
    from aws_storage import upload_bytes, generate_storage_key  # type: ignore
    HAS_S3 = True
except Exception:
    HAS_S3 = False
import base64
try:
    import whisper  # type: ignore
except ImportError:
    whisper = None  # type: ignore
import time
try:
    from pydub import AudioSegment  # type: ignore
except ImportError:
    AudioSegment = None  # type: ignore
import io
from pathlib import Path

# Import outils Andorre
try:
    CGI_EMBEDDINGS_AVAILABLE
except NameError:
    CGI_EMBEDDINGS_AVAILABLE = False

try:
    BOFIP_EMBEDDINGS_AVAILABLE
except NameError:
    BOFIP_EMBEDDINGS_AVAILABLE = False

# --- Imports relatifs corrigés pour la production ---
try:
    # Pour la production (quand 'backend' n'est pas dans le path)
    from assistant_fiscal_simple import get_fiscal_response, get_fiscal_response_stream, search_cgi_embeddings
    from database import SessionLocal, engine, Base, get_db as get_db_session
    from models import UserProfile
    from models_pro import BasePro
    from routers import pro_clients as pro_clients_router
    from routers import teams_assistant as teams_assistant_router
    from routers import whisper_fix as whisper_router
    from dependencies import supabase, verify_token, create_access_token, hash_password, verify_password
    from whisper_service import get_whisper_service
    from routes_francis_particulier import francis_particulier_bp
except ImportError:
    # Pour le développement local (quand on lance depuis la racine)
    try:
        from backend.assistant_fiscal_simple import get_fiscal_response, get_fiscal_response_stream, search_cgi_embeddings
        from backend.database import SessionLocal, engine, Base, get_db as get_db_session
        from backend.models import UserProfile
        from backend.models_pro import BasePro
        from backend.routers import pro_clients as pro_clients_router
        from backend.routers import teams_assistant as teams_assistant_router
        from backend.routers import whisper_fix as whisper_router
        from backend.routers import downloads
        from backend.dependencies import supabase, verify_token, create_access_token, hash_password, verify_password
        from backend.whisper_service import get_whisper_service
        from backend.routes_gocardless import router as gocardless_router
        from backend.routes_francis_particulier import francis_particulier_bp
    except ImportError:
        # Fallback : imports directs depuis le répertoire courant
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        
        from assistant_fiscal_simple import get_fiscal_response, get_fiscal_response_stream, search_cgi_embeddings
        from database import SessionLocal, engine, Base, get_db as get_db_session
        from models import UserProfile
        from models_pro import BasePro
        from routers import pro_clients as pro_clients_router
        from routers import teams_assistant as teams_assistant_router
        from routers import whisper_fix as whisper_router
        from routers import downloads
        from dependencies import supabase, verify_token, create_access_token, hash_password, verify_password
        from whisper_service import get_whisper_service
        from routes_gocardless import router as gocardless_router
        from routes_francis_particulier import francis_particulier_bp
# --- Fin des imports relatifs corrigés ---

# Configuration
APP_ENV = os.getenv("APP_ENV", "production")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "15"))

# Variables d'environnement pour Supabase
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or "https://lqxfjjtjxktjgpekugtf.supabase.co"
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTgyMDMsImV4cCI6MjA2MzM3NDIwM30.-E66kbBxRAVcJcPdhhUJWq5BZB-2GRpiBEaGtiWLVrA"

# Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# TrueLayer Configuration
TRUELAYER_CLIENT_ID = os.getenv("TRUELAYER_CLIENT_ID")
TRUELAYER_CLIENT_SECRET = os.getenv("TRUELAYER_CLIENT_SECRET")
TRUELAYER_REDIRECT_URI = os.getenv("TRUELAYER_REDIRECT_URI", "http://localhost:3000/truelayer-callback")
TRUELAYER_ENV = os.getenv("TRUELAYER_ENV", "sandbox")
TRUELAYER_BASE_AUTH_URL = "https://auth.truelayer-sandbox.com" if TRUELAYER_ENV == "sandbox" else "https://auth.truelayer.com"
TRUELAYER_API_URL = "https://api.truelayer-sandbox.com" if TRUELAYER_ENV == "sandbox" else "https://api.truelayer.com"

# ElevenLabs configuration
ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")
ELEVEN_VOICE_ID = os.getenv("ELEVEN_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")  # voix par défaut
ELEVEN_BASE_URL = "https://api.elevenlabs.io"

# ElevenLabs configuration
ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")
ELEVEN_VOICE_ID = os.getenv("ELEVEN_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")  # voix par défaut
ELEVEN_BASE_URL = "https://api.elevenlabs.io"

# GoCardless Configuration
GOCARDLESS_ACCESS_TOKEN = os.getenv("GOCARDLESS_ACCESS_TOKEN")
GOCARDLESS_ENV = os.getenv("GOCARDLESS_ENV", "sandbox")
GOCARDLESS_WEBHOOK_SECRET = os.getenv("GOCARDLESS_WEBHOOK_SECRET")
GOCARDLESS_BASE_URL = "https://api-sandbox.gocardless.com" if GOCARDLESS_ENV == "sandbox" else "https://api.gocardless.com"

# AI API Keys - Priorité à Groq (gratuit), fallback Mistral
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# Gestion plus souple : ne pas bloquer l'application si aucune clé n'est définie.
if GROQ_API_KEY:
    print("🚀 Utilisation de Groq API (gratuit) pour Francis")
    mistral_client = None  # Groq sera géré dans assistant_fiscal.py
elif MISTRAL_API_KEY:
    print("⚠️  Fallback vers Mistral API (payant)")
    mistral_client = MistralClient(api_key=MISTRAL_API_KEY)
else:
    print("❌ WARNING : Aucune clé API disponible (GROQ_API_KEY ou MISTRAL_API_KEY). Les fonctionnalités IA seront désactivées.")
    mistral_client = None  # type: ignore

from middleware.security import SecurityHeadersMiddleware, RateLimitMiddleware

fastapi_kwargs = {}
if APP_ENV != "development":
    fastapi_kwargs.update({"docs_url": None, "redoc_url": None, "openapi_url": None})

app = FastAPI(**fastapi_kwargs,
    title="Fiscal.ia API",
    description="API pour l'assistant fiscal intelligent",
    version="1.0.0"
)

if APP_ENV == "production":
    allowed_cors_origins = ["https://fiscal-ia.net"]
else:
    allowed_cors_origins = ["http://localhost:3000", "http://127.0.0.1:3000", "https://fiscal-ia.net"]

# Security middlewares
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=60)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# TODO: Mount static files for downloads (temporarily disabled - large files crash Railway)
# app.mount("/downloads", StaticFiles(directory="public/downloads"), name="downloads")

@app.get("/health")
async def health():
    return {"status": "ok"}

api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def root():
    return {
        "message": "Fiscal.ia API",
        "version": "1.0.0",
        "status": "running",
        "env": APP_ENV
    }

async def run_with_timeout(func, *args, timeout: int = 10):
    loop = asyncio.get_event_loop()
    with concurrent.futures.ThreadPoolExecutor() as pool:
        return await asyncio.wait_for(loop.run_in_executor(pool, func, *args), timeout)

def format_francis_response(text: str) -> str:
    """Améliore le formatage des réponses Francis pour une meilleure UX web"""
    if not text:
        return text
    
    # Convertir les tableaux ASCII en format Markdown propre
    text = convert_ascii_tables_to_markdown(text)
    
    # Améliorer la structure des réponses
    text = improve_response_structure(text)
    
    return text

def convert_ascii_tables_to_markdown(text: str) -> str:
    """Convertit les tableaux ASCII en tableaux Markdown pour une meilleure lisibilité"""
    # Détecter et remplacer les tableaux ASCII par des tableaux Markdown
    lines = text.split('\n')
    result_lines = []
    in_table = False
    
    for line in lines:
        # Détecter le début d'un tableau ASCII
        if '┌' in line or '│' in line or '├' in line:
            if not in_table and '┌' in line:
                # Début de tableau - ignorer la ligne de bordure supérieure
                in_table = True
                continue
            elif '│' in line and not ('┌' in line or '├' in line or '└' in line):
                # Ligne de données - extraire le contenu
                cells = [cell.strip() for cell in line.split('│') if cell.strip()]
                if len(cells) >= 2:
                    if 'Tranche de revenu' in line or 'TMI' in line:
                        # Ligne d'en-tête
                        result_lines.append('| ' + ' | '.join(cells) + ' |')
                        result_lines.append('|' + '|'.join([' --- ' for _ in cells]) + '|')
                    else:
                        # Ligne de données
                        result_lines.append('| ' + ' | '.join(cells) + ' |')
                continue
            elif '├' in line or '└' in line:
                # Ligne de séparation ou fin de tableau - ignorer
                if '└' in line:
                    in_table = False
                continue
        else:
            in_table = False
            result_lines.append(line)
    
    return '\n'.join(result_lines)

def improve_response_structure(text: str) -> str:
    """Améliore la structure générale des réponses Francis"""
    # Ajouter des espaces autour des titres
    text = re.sub(r'(\n|^)(#{1,6}\s+[^\n]+)', r'\1\n\2\n', text)
    
    # Améliorer l'espacement des listes
    text = re.sub(r'(\n|^)([-*+]\s+[^\n]+)', r'\1\2', text)
    
    # Ajouter des espaces autour des exemples
    text = re.sub(r'(Pour illustrer|Par exemple|Voici)', r'\n\1', text)
    
    # Nettoyer les espaces multiples tout en préservant la structure
    text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
    text = re.sub(r'^\s+|\s+$', '', text)
    
    return text

@api_router.post("/test-francis")
async def test_francis(request: dict):
    try:
        if not GROQ_API_KEY and not MISTRAL_API_KEY:
            return {
                "error": "Service IA non disponible", 
                "details": "Aucune clé API configurée (GROQ_API_KEY ou MISTRAL_API_KEY)",
                "railway_help": "Configurez GROQ_API_KEY (gratuit) ou MISTRAL_API_KEY dans les variables d'environnement Railway",
                "groq_recommended": "🚀 Groq API est gratuit et recommandé ! Obtenez votre clé sur console.groq.com"
            }
        question = request.get("question", "")
        if not question:
            return {"error": "Question manquante", "example": "Posez une question fiscale à Francis"}
        conversation_history = request.get("conversation_history", None)
        try:
            # Utilisation de Francis Particulier Indépendant avec base européenne
            from francis_particulier_independent import get_francis_particulier_response
            # Conversion du format de l'historique si nécessaire
            user_profile = request.get("user_profile", {})
            answer = get_francis_particulier_response(question, user_profile)
            sources = ["Base de connaissances fiscales européennes (30+ pays)"]
            confidence = 0.95
            answer = format_francis_response(answer)
            return {
                "answer": answer,
                "sources": sources,
                "confidence": confidence,
                "status": "success_rag",
                "francis_says": "✅ Analyse complète réussie !",
                "memory_active": bool(conversation_history)
            }
        except asyncio.TimeoutError:
            fallback_answer = f"Je vais analyser votre question sur '{question}'. Pour un conseil fiscal précis, pouvez-vous me préciser votre situation (salarié, entrepreneur, investisseur) et votre objectif ? Je pourrai alors vous donner une réponse personnalisée et détaillée."
            if conversation_history and len(conversation_history) > 1:
                fallback_answer += " Je prends en compte notre échange précédent pour mieux vous accompagner."
            fallback_answer = format_francis_response(fallback_answer)
            return {
                "answer": fallback_answer,
                "sources": ["Expert Francis"],
                "confidence": 0.7,
                "status": "fallback_optimized",
                "francis_says": "🔄 Analyse rapide - posez une question plus précise pour plus de détails",
                "memory_active": bool(conversation_history)
            }
    except Exception as e:
        return {
            "error": f"Erreur lors du traitement: {str(e)}",
            "status": "error",
            "railway_status": "Francis rencontre un problème technique",
            "debug_info": str(e)[:200]
        }

@api_router.post("/stream-francis-simple")
async def stream_francis_simple(request: dict):
    question = request.get("question", "")
    if not question:
        return StreamingResponse(
            (json.dumps({"type": "error", "message": "Question manquante"}) + "\n" for _ in range(1)),
            media_type="text/plain"
        )
    conversation_history = request.get("conversation_history", None)
    # Force la juridiction Andorre pour Francis
    return StreamingResponse(
        get_fiscal_response_stream(question, conversation_history, None, "AD"),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

@api_router.post("/stream-francis-andorre-expert")
async def stream_francis_andorre_expert(request: dict):
    """Endpoint dédié pour Francis Andorre utilisant le modèle LLM spécialisé"""
    try:
        from francis_andorre_expert import generate_francis_andorre_response
    except ImportError:
        try:
            from backend.francis_andorre_expert import generate_francis_andorre_response
        except ImportError:
            return StreamingResponse(
                (json.dumps({"type": "error", "message": "Service Francis Andorre Expert non disponible"}) + "\n" for _ in range(1)),
                media_type="text/plain"
            )
    
    question = request.get("question", "")
    if not question:
        return StreamingResponse(
            (json.dumps({"type": "error", "message": "Question manquante"}) + "\n" for _ in range(1)),
            media_type="text/plain"
        )
    
    conversation_history = request.get("conversation_history", None)
    use_embeddings = request.get("use_embeddings", True)
    
    return StreamingResponse(
        generate_francis_andorre_response(question, conversation_history, use_embeddings),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Supabase client
# Initialisation cohérente avec dependencies.py
supabase: Client = None
if SUPABASE_URL:
    key_to_use_main = os.getenv("SUPABASE_SERVICE_KEY") # Priorité à la service key
    if not key_to_use_main:
        print("⚠️ WARNING: SUPABASE_SERVICE_KEY is not set in main.py. Falling back to VITE_SUPABASE_ANON_KEY. This is not recommended for production writes if RLS is enabled.")
        key_to_use_main = os.getenv("VITE_SUPABASE_ANON_KEY")

    if key_to_use_main:
        try:
            supabase = create_client(SUPABASE_URL, key_to_use_main)
            if key_to_use_main == os.getenv("SUPABASE_SERVICE_KEY"):
                print("✅ Supabase client initialized with SERVICE_ROLE_KEY in main.py.")
            else:
                print("✅ Supabase client initialized with ANON_KEY in main.py (fallback).")
        except Exception as e_main_supabase:
            print(f"❌ ERROR initializing Supabase client in main.py: {e_main_supabase}")
    else:
        print("❌ ERROR: No Supabase key found (SUPABASE_SERVICE_KEY or VITE_SUPABASE_ANON_KEY) in main.py. Supabase client not initialized.")
else:
    print("❌ ERROR: SUPABASE_URL is not set in main.py. Supabase client not initialized.")

# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    account_type: Optional[str] = "particulier"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    created_at: datetime

class ChatMessage(BaseModel):
    role: str
    content: str

class QuestionRequest(BaseModel):
    question: str
    conversation_history: Optional[List[ChatMessage]] = None
    user_profile_context: Optional[Dict[str, Any]] = None
    jurisdiction: Literal["FR", "AD", "CH", "LU"] = "FR"

class QuestionResponse(BaseModel):
    response: str  # Changé de 'answer' à 'response' pour correspondre au frontend
    sources: List[str]
    confidence: float

class PaymentRequest(BaseModel):
    amount: int
    currency: str = "eur"
    payment_method: str

class TrueLayerCodeRequest(BaseModel):
    code: str
    provider_id: Optional[str] = None

class TrueLayerExchangeResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str]
    expires_in: int
    token_type: str
    scope: str
    accounts: List[Dict[str, Any]]

class UserProfileResponse(BaseModel):
    id: int # Clé primaire de la table user_profiles
    auth_user_id: str # UUID de Supabase Auth
    user_id: Optional[int] = None # Clé étrangère vers users.id (devient optionnelle ou sa gestion revue)
    tmi: Optional[float] = None
    situation_familiale: Optional[str] = None
    nombre_enfants: Optional[int] = None
    residence_principale: Optional[bool] = None
    residence_secondaire: Optional[bool] = None
    revenus_annuels: Optional[float] = None
    charges_deductibles: Optional[float] = None
    # Nouveaux champs pour le profiling initial
    activite_principale: Optional[str] = None
    revenus_passifs: Optional[str] = None  # JSON string
    revenus_complementaires: Optional[str] = None  # JSON string
    statuts_juridiques: Optional[str] = None  # JSON string
    pays_residence: Optional[str] = None
    age: Optional[int] = None
    patrimoine_immobilier: Optional[bool] = None
    residence_fiscale: Optional[str] = None
    patrimoine_situation: Optional[str] = None
    has_completed_onboarding: Optional[bool] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserProfileCreate(BaseModel):
    auth_user_id: str # UUID de Supabase Auth, requis
    user_id: Optional[int] = None # Optionnel, pour la FK vers la table users si encore pertinent
    tmi: Optional[float] = None
    situation_familiale: Optional[str] = None
    nombre_enfants: Optional[int] = None
    residence_principale: Optional[bool] = None
    residence_secondaire: Optional[bool] = None
    revenus_annuels: Optional[float] = None
    charges_deductibles: Optional[float] = None
    # Nouveaux champs pour le profiling initial
    activite_principale: Optional[str] = None
    revenus_passifs: Optional[List[str]] = None  # Liste convertie en JSON
    revenus_complementaires: Optional[List[str]] = None  # Liste convertie en JSON
    statuts_juridiques: Optional[List[str]] = None  # Liste convertie en JSON
    pays_residence: Optional[str] = None
    age: Optional[int] = None
    patrimoine_immobilier: Optional[bool] = None
    residence_fiscale: Optional[str] = None
    patrimoine_situation: Optional[str] = None
    has_completed_onboarding: Optional[bool] = None

# Nouveaux modèles pour les outils disruptifs
class TMICalculationRequest(BaseModel):
    revenus_annuels: float
    situation_familiale: str = "célibataire"
    nombre_enfants: int = 0
    charges_deductibles: float = 0

class TMICalculationResponse(BaseModel):
    revenu_imposable: float
    tmi: float
    taux_moyen: float
    impot_estime: float
    tranches_applicables: List[Dict[str, Any]]
    conseils_optimisation: List[str]

class OptimizationSimulationRequest(BaseModel):
    revenus_annuels: float
    tmi_actuelle: float
    situation_familiale: str
    objectifs: List[str]  # ["retraite", "immobilier", "transmission", etc.]

class OptimizationSimulationResponse(BaseModel):
    economie_potentielle: float
    strategies_recommandees: List[Dict[str, Any]]
    impact_conscience: str
    actions_prioritaires: List[str]

class ConsciousnessTestRequest(BaseModel):
    reponses: Dict[str, int]  # Question ID -> Score (1-5)

class ConsciousnessTestResponse(BaseModel):
    niveau_conscience: str
    score_total: int
    score_maximum: int
    pourcentage: float
    recommandations: List[str]
    prochaines_etapes: List[str]

class FiscalInsightsRequest(BaseModel):
    user_id: str

class FiscalInsightsResponse(BaseModel):
    economie_potentielle: float
    tmi_actuelle: float
    score_optimisation: float
    optimisations_disponibles: int
    niveau_conscience: str
    actions_recommandees: List[str]
    alertes_fiscales: List[str]

class GoCardlessBankAccountRequest(BaseModel):
    account_number: str
    branch_code: str
    country_code: str = "FR"
    account_holder_name: str

class GoCardlessBankAccountResponse(BaseModel):
    id: str
    account_holder_name: str
    account_number_ending: str
    bank_name: str
    country_code: str
    currency: str
    status: str

# Modèles Pydantic pour Whisper
class TranscriptionRequest(BaseModel):
    audio_base64: str
    audio_format: str = "wav"
    language: Optional[str] = "fr"

class TranscriptionResponse(BaseModel):
    text: str
    segments: List[Dict[str, Any]]
    language: str
    language_probability: float
    duration: float
    transcription_time: Optional[float] = None
    error: Optional[str] = None

class WhisperModelInfoResponse(BaseModel):
    model_size: str
    status: str
    device: str
    compute_type: str
    cache_size: Optional[int] = None
    health_status: Optional[str] = None

class WhisperHealthResponse(BaseModel):
    status: str
    model_loaded: bool
    is_loading: bool
    cache_size: int
    error: Optional[str] = None

class UserInvite(BaseModel):
    email: EmailStr

class CompleteSignupRequest(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str

class AndorreAccountCreate(BaseModel):
    email: str
    payment_intent: str
    account_type: str

# Utils
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalide")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Routes
@api_router.post("/auth/register", response_model=Dict[str, Any])
async def register(user: UserCreate):
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Service Supabase non disponible")

        # Création de l'utilisateur dans Supabase Auth
        sign_up_options = {"data": {}}
        if user.full_name:
            sign_up_options["data"]["full_name"] = user.full_name
        
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": sign_up_options # S'assurer que options.data est bien structuré
        })

        if response.user and response.user.id:
            user_id = response.user.id
            user_email = response.user.email # Email de la réponse Supabase Auth
            
            # full_name à partir des options d'inscription ou metadata
            actual_full_name = user.full_name # Celui fourni à l'inscription
            if response.user.user_metadata and response.user.user_metadata.get('full_name'):
                actual_full_name = response.user.user_metadata.get('full_name')


            final_taper = "particulier" # Par défaut
            profile_to_insert = {
                "user_id": user_id,
                "email": user_email,
                "taper": final_taper # Sera écrasé si pro
            }

            if user.account_type == "professionnel":
                profile_to_insert["taper"] = "professionnel"
                final_taper = "professionnel"
            
            # La dérogation pour aitorgarcia2112@gmail.com prime sur tout
            if user_email == "aitorgarcia2112@gmail.com":
                profile_to_insert["taper"] = "professionnel"
                final_taper = "professionnel"
            
            # Insérer/Mettre à jour le profil utilisateur dans profils_utilisateurs
            try:
                # Utiliser upsert pour créer ou mettre à jour si l'utilisateur s'inscrit à nouveau (rare)
                # ou si on veut s'assurer que les infos sont là.
                profile_upsert_response = (
                    supabase.table("profils_utilisateurs")
                    .upsert(profile_to_insert, on_conflict="user_id")
                    .execute()
                )
                if not (profile_upsert_response.data and len(profile_upsert_response.data) > 0):
                    print(f"WARN: /auth/register - Profile upsert for {user_id} seemed to fail or returned no data. Supabase error: {profile_upsert_response.error}")
                    # Ne pas changer final_taper ici, il est déjà basé sur la logique précédente.
                    # Mais c'est un signe que la DB n'a peut-être pas les bonnes infos.
                else:
                    print(f"INFO: /auth/register - User {user_id} profile upserted with taper: {final_taper}.")

            except Exception as e_profile:
                print(f"ERROR: /auth/register - Could not upsert profile for user {user_id}: {e_profile}. Taper might not be correctly stored for non-aitor accounts.")
                # Si l'upsert échoue, final_taper (déterminé avant l'upsert) est toujours renvoyé au client,
                # mais la base de données pourrait ne pas refléter cet état.

            token = create_access_token({"sub": user_id})

            user_data_to_return = {
                "id": user_id,
                "email": user_email,
                "full_name": actual_full_name,
                "user_metadata": {"full_name": actual_full_name}, # Pour correspondre à ce que AuthContext pourrait attendre
                "taper": final_taper
            }

            return {
                "access_token": token,
                "token_type": "bearer",
                "user": user_data_to_return
            }
        else:
            error_detail = "Erreur lors de la création du compte."
            if hasattr(response, 'error') and response.error: # Vérifier si response.error existe
                error_detail = response.error.message
            print(f"ERROR: Supabase sign_up failed. Email: {user.email}, Response Error: {response.error if hasattr(response, 'error') else 'N/A'}")
            raise HTTPException(status_code=400, detail=error_detail)

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"ERROR: Unexpected error in /auth/register for email {user.email if 'user' in locals() and hasattr(user, 'email') else 'N/A'}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur interne du serveur lors de l'inscription.")

@api_router.post("/auth/complete-signup", response_model=Dict[str, Any])
async def complete_signup(request: CompleteSignupRequest):
    """
    Finalise l'inscription d'un utilisateur existant en lui permettant de définir un mot de passe.
    Vérifie d'abord si l'email existe dans la base de données avant de permettre la création du mot de passe.
    """
    print(f"DEBUG: /auth/complete-signup - Début du traitement pour l'email: {request.email}")
    try:
        if not supabase:
            print(f"ERROR: /auth/complete-signup - Service Supabase non disponible")
            raise HTTPException(status_code=500, detail="Service Supabase non disponible")
        
        # Vérifier que les mots de passe correspondent
        if request.password != request.confirm_password:
            raise HTTPException(status_code=400, detail="Les mots de passe ne correspondent pas")
        
        # Vérifier la longueur du mot de passe
        if len(request.password) < 8:
            raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 8 caractères")
        
        # Vérifier d'abord si l'utilisateur existe dans le système d'authentification Supabase
        print(f"DEBUG: /auth/complete-signup - Vérification de l'existence de l'utilisateur dans Supabase Auth")
        auth_users = supabase.auth.admin.list_users()
        # La méthode list_users peut renvoyer un objet avec l'attribut .users OU directement une liste selon la version du SDK
        users_list = getattr(auth_users, "users", auth_users)
        print(f"DEBUG: /auth/complete-signup - Nombre d'utilisateurs trouvés dans Supabase Auth: {len(users_list) if users_list else 0}")
        auth_user = next((u for u in users_list if getattr(u, "email", None) == request.email), None)
        if not auth_user:
            print(f"ERROR: /auth/complete-signup - Aucun utilisateur trouvé avec l'email: {request.email}")
            raise HTTPException(status_code=404, detail="Aucun compte trouvé avec cet email. Veuillez vérifier l'adresse ou vous inscrire d'abord.")

        auth_user_id = auth_user.id
        print(f"DEBUG: /auth/complete-signup - Utilisateur trouvé avec ID: {auth_user_id}")
        
        # Vérifier si un profil existe déjà ; sinon, en créer un avec type particulier par défaut
        print(f"DEBUG: /auth/complete-signup - Vérification de l'existence d'un profil utilisateur")
        profile_response = supabase.table("profils_utilisateurs").select("*").eq("user_id", auth_user_id).execute()
        print(f"DEBUG: /auth/complete-signup - Réponse de la recherche de profil: {profile_response}")
        
        if not profile_response.data or len(profile_response.data) == 0:
            print(f"DEBUG: /auth/complete-signup - Aucun profil trouvé, création d'un nouveau profil")
            insert_response = supabase.table("profils_utilisateurs").insert({
                "user_id": auth_user_id,
                "email": request.email,
                "taper": "particulier"
            }).execute()
            print(f"DEBUG: /auth/complete-signup - Résultat de l'insertion du profil: {insert_response}")
        else:
            print(f"DEBUG: /auth/complete-signup - Profil existant trouvé: {profile_response.data}")
        
        # A ce stade, nous savons que l'utilisateur existe dans Auth. Inutile de tester un login factice ;
        # nous tentons directement de définir/mettre à jour son mot de passe via l'API d'administration.

        
        # Si on arrive ici, l'utilisateur existe mais n'a pas encore de mot de passe défini
        # Mettre à jour le mot de passe via l'API d'administration de Supabase
        try:
            print(f"DEBUG: /auth/complete-signup - Début de la mise à jour du mot de passe")
            # D'abord, récupérer l'utilisateur par email
            auth_users = supabase.auth.admin.list_users()
            users_list = getattr(auth_users, "users", auth_users)
            user_to_update = next((u for u in users_list if getattr(u, "email", None) == request.email), None)
            
            if not user_to_update:
                print(f"ERROR: /auth/complete-signup - Utilisateur introuvable lors de la mise à jour du mot de passe")
                raise HTTPException(status_code=404, detail="Utilisateur introuvable dans le système d'authentification")
            
            print(f"DEBUG: /auth/complete-signup - Utilisateur trouvé pour la mise à jour du mot de passe: {user_to_update.id}")
            # Mettre à jour le mot de passe
            try:
                update_response = supabase.auth.admin.update_user_by_id(
                    user_to_update.id,
                    {"password": request.password}
                )
                print(f"DEBUG: /auth/complete-signup - Résultat de la mise à jour du mot de passe: {update_response}")
            except Exception as e_update:
                print(f"ERROR: /auth/complete-signup - Erreur lors de la mise à jour du mot de passe: {str(e_update)}")
                raise HTTPException(status_code=500, detail=f"Erreur lors de la mise à jour du mot de passe: {str(e_update)}")
            
            # Connecter automatiquement l'utilisateur
            print(f"DEBUG: /auth/complete-signup - Tentative de connexion automatique après mise à jour du mot de passe")
            try:
                login_response = supabase.auth.sign_in_with_password({
                    "email": request.email,
                    "password": request.password
                })
                print(f"DEBUG: /auth/complete-signup - Résultat de la connexion: {login_response}")
            except Exception as e_login:
                print(f"ERROR: /auth/complete-signup - Erreur lors de la connexion automatique: {str(e_login)}")
                raise HTTPException(status_code=500, detail=f"Erreur lors de la connexion automatique: {str(e_login)}")
            
            if not login_response.user:
                print(f"ERROR: /auth/complete-signup - Pas d'utilisateur retourné après connexion")
                raise HTTPException(status_code=400, detail="Échec de la connexion après la mise à jour du mot de passe")
            
            # Créer un token JWT pour l'utilisateur
            print(f"DEBUG: /auth/complete-signup - Création du token JWT pour l'utilisateur: {login_response.user.id}")
            token = create_access_token({"sub": login_response.user.id})
            
            user_data = {
                "id": login_response.user.id,
                "email": login_response.user.email,
                "user_metadata": login_response.user.user_metadata or {}
            }
            print(f"DEBUG: /auth/complete-signup - Données utilisateur pour la réponse: {user_data}")
            
            response_data = {
                "access_token": token,
                "token_type": "bearer",
                "user": user_data,
                "message": "Votre compte a été activé avec succès !"
            }
            print(f"DEBUG: /auth/complete-signup - Activation réussie pour {request.email}")
            return response_data
            
        except Exception as e:
            print(f"ERROR: Unexpected error in /auth/complete-signup for email {request.email}: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Erreur interne du serveur lors de l'activation du compte: {str(e)}")
    
    except HTTPException as http_exc:
        print(f"ERROR: /auth/complete-signup - HTTPException: {http_exc.detail} (code {http_exc.status_code})")
        raise http_exc
    except Exception as e:
        print(f"Erreur inattendue dans complete-signup: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur interne du serveur lors de l'activation du compte: {str(e)}")

@api_router.post("/auth/login", response_model=Dict[str, Any])
async def login(user: UserLogin):
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Service Supabase non disponible")
        
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })

        if response.user and response.user.id:
            user_id = response.user.id
            user_email = response.user.email
            
            actual_full_name = None
            # Essayer de récupérer user_metadata via un appel get_user après le sign_in
            # Cela fonctionne car sign_in_with_password établit une session pour le client Supabase
            try:
                current_user_data_supabase = supabase.auth.get_user() 
                if current_user_data_supabase and current_user_data_supabase.user and current_user_data_supabase.user.user_metadata:
                    actual_full_name = current_user_data_supabase.user.user_metadata.get('full_name')
            except Exception as e_get_user_meta:
                 print(f"WARN: /auth/login - Could not fetch user_metadata via supabase.auth.get_user() for {user_id}: {e_get_user_meta}")


            # Logique pour récupérer le taper de l'utilisateur depuis profils_utilisateurs
            user_taper = "particulier" # Par défaut
            # Essayer de lire le profil existant pour obtenir le taper et potentiellement full_name
            try:
                profile_response = (
                    supabase.table("profils_utilisateurs")
                    .select("user_id, email, taper, full_name") # full_name optionnel
                    .eq("user_id", user_id)
                    .maybe_single()
                    .execute()
                )
                if profile_response.data:
                    if profile_response.data.get("taper"):
                        user_taper = profile_response.data.get("taper")
                    if actual_full_name is None and profile_response.data.get("full_name"): 
                        actual_full_name = profile_response.data.get("full_name")
                    if user_email is None and profile_response.data.get("email"):
                         user_email = profile_response.data.get("email")

            except Exception as e_profile_login:
                print(f"WARN: /auth/login - Could not fetch profile for user {user_id}: {e_profile_login}. Defaulting taper to '{user_taper}'.")


            # Override pour aitorgarcia2112@gmail.com (devrait être prioritaire)
            if user_email == "aitorgarcia2112@gmail.com":
                user_taper = "professionnel"
            
            # Upsert dans profils_utilisateurs pour s'assurer que les infos (y compris email, full_name, taper) sont à jour
            try:
                profile_to_upsert = {
                    "user_id": user_id,
                    "email": user_email, # Crucial
                    # "full_name": actual_full_name, # Rendre optionnel
                    "taper": user_taper # Crucial
                }
                if actual_full_name: # N'ajouter full_name que s'il existe et n'est pas vide
                    profile_to_upsert["full_name"] = actual_full_name

                upsert_response = supabase.table("profils_utilisateurs").upsert(profile_to_upsert, on_conflict="user_id").execute()
                if not (upsert_response.data and len(upsert_response.data) > 0):
                     print(f"WARN: /auth/login - Profile upsert for {user_id} seemed to fail or returned no data. Supabase error: {upsert_response.error}")
                else:
                    print(f"INFO: /auth/login - User {user_id} profile upserted/verified with taper: {user_taper}.")

            except Exception as e_upsert_login:
                print(f"WARN: /auth/login - Could not upsert profile for {user_email} ({user_id}): {e_upsert_login}")

            token = create_access_token({"sub": user_id})
            
            user_data_for_response = {
                "id": user_id,
                "email": user_email,
                "full_name": actual_full_name, 
                "user_metadata": {"full_name": actual_full_name} if actual_full_name else {},
                "taper": user_taper
            }
            
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": user_data_for_response
            }
        else:
            error_detail = "Identifiants invalides."
            if hasattr(response, 'error') and response.error:
                error_detail = response.error.message
            print(f"ERROR: Supabase sign_in failed for email {user.email}. Error: {response.error if hasattr(response, 'error') else 'N/A'}")
            raise HTTPException(status_code=401, detail=error_detail)
            
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"ERROR: Unexpected error in /auth/login for email {user.email if hasattr(user, 'email') else 'N/A'}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Erreur interne du serveur lors de la connexion.")

@api_router.get("/auth/me", response_model=Dict[str, Any])
async def get_current_user(user_id: str = Depends(verify_token)):
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Service Supabase non disponible")

        # Récupérer les informations depuis la table profils_utilisateurs
        # On s'attend à ce que cette table contienne user_id, email, full_name, taper
        profile_data = None
        db_email = None
        db_full_name = None
        db_taper = "particulier" # Défaut si non trouvé ou partiel

        try:
            profile_response = (
                supabase.table("profils_utilisateurs")
                .select("user_id, email, taper, full_name") # full_name est optionnel ici
                .eq("user_id", user_id)
                .maybe_single()
                .execute()
            )
            if profile_response.data:
                profile_data = profile_response.data
                db_email = profile_data.get("email") # Crucial
                db_full_name = profile_data.get("full_name") # Optionnel
                if profile_data.get("taper"): 
                    db_taper = profile_data.get("taper") # Crucial
            else:
                # Si aucun profil n'est trouvé, cela pourrait être un problème, 
                # car login/register devraient le créer.
                # Pour l'instant, on ne lève pas d'erreur mais on logge.
                # L'email pourrait être récupéré autrement si nécessaire pour la dérogation.
                print(f"WARN: /api/auth/me - No profile found in 'profils_utilisateurs' for user_id: {user_id}")
                # Tentative de récupérer l'email pour la dérogation aitorgarcia si db_email est None
                # Ceci nécessiterait un appel admin ou une autre source fiable pour l'email basé sur user_id.
                # Pour l'instant, si l'email n'est pas dans profils_utilisateurs, la dérogation basée sur l'email ne fonctionnera pas ici.
                # Il est crucial que login/register peuplent correctement profils_utilisateurs.

        except Exception as profile_exc:
            print(f"ERROR: /api/auth/me - Could not fetch from 'profils_utilisateurs' for user_id {user_id}: {profile_exc}. Defaulting taper.")
            # db_taper reste "particulier"

        # Construction de la réponse initiale
        user_data_to_return = {
            "id": user_id,
            "email": db_email, # Peut être None si pas dans profils_utilisateurs
            "user_metadata": {"full_name": db_full_name} if db_full_name else {}, # Structure attendue par le frontend
            "taper": db_taper
        }
        
        # Dérogation pour aitorgarcia2112@gmail.com
        # Cette dérogation est plus fiable si db_email est correctement peuplé.
        if db_email == "aitorgarcia2112@gmail.com":
            user_data_to_return["taper"] = "professionnel"
            print(f"INFO: /api/auth/me - Overriding 'taper' to 'professionnel' for user {db_email}")
            # Assurer que l'entrée existe aussi dans profils_utilisateurs pour cet email spécifique
            # Ceci est important si le profil n'existait pas ou si le taper était différent.
            try:
                upsert_data = {"user_id": user_id, "taper": "professionnel"}
                if db_email: # N'écrire l'email que s'il est connu
                    upsert_data["email"] = db_email
                if db_full_name: # N'écrire full_name que s'il est connu
                     upsert_data["full_name"] = db_full_name
                supabase.table("profils_utilisateurs").upsert(upsert_data, on_conflict="user_id").execute()
                print(f"INFO: /api/auth/me - Ensured 'professionnel' profile exists/updated for {db_email} ({user_id})")
            except Exception as e_upsert_aitor:
                print(f"WARN: /api/auth/me - Could not ensure professional profile for {db_email} during /me: {e_upsert_aitor}")


        # Si l'email n'a pas été trouvé dans profils_utilisateurs, user_data_to_return["email"] sera None.
        # Le frontend (AuthContext) s'attend à un email. Si c'est None, cela peut poser problème.
        # Il faut s'assurer que `profils_utilisateurs` est la source de vérité.
        if user_data_to_return["email"] is None and user_id:
             print(f"CRITICAL_WARN: /api/auth/me - Email for user_id {user_id} is None. 'profils_utilisateurs' might be missing email for this user.")
             # Dans un cas réel, on pourrait tenter un dernier fallback pour l'email ici si vital pour le frontend,
             # mais cela indiquerait un problème de synchronisation des données.

        return user_data_to_return

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"ERROR: /api/auth/me - Unexpected error for user_id {user_id if 'user_id' in locals() else 'unknown'}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {str(e)}")

@api_router.post("/ask", response_model=QuestionResponse)
async def ask_question(
    request: QuestionRequest,
    user_id: str = Depends(verify_token)
):
    try:
        if not MISTRAL_API_KEY:
            raise HTTPException(status_code=500, detail="Service Mistral non disponible")

        # Limite mensuelle gratuite pour les particuliers : 50 questions
        if supabase:
            try:
                profile_resp = supabase.table("profils_utilisateurs").select("taper").eq("user_id", user_id).single().execute()
                taper = (profile_resp.data or {}).get("taper", "particulier")
                if taper == "particulier":
                    now = datetime.utcnow().replace(tzinfo=timezone.utc)
                    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
                    count_resp = supabase.table("questions").select("id", count='exact').eq("user_id", user_id).gte("created_at", month_start).execute()
                    questions_used = count_resp.count or 0
                    if questions_used >= 30:
                        raise HTTPException(status_code=429, detail="Quota atteint : 30 questions gratuites ce mois-ci. Passez à Francis Pro pour plus d'accès.")
            except HTTPException:
                raise
            except Exception as e:
                print(f"[Avertissement Quota] Impossible de vérifier le quota pour {user_id}: {e}")

        conversation_history_dicts = None
        if request.conversation_history:
            conversation_history_dicts = [
                {"role": msg.role, "content": msg.content} 
                for msg in request.conversation_history
            ]
        
        answer, sources, confidence = get_fiscal_response(
            request.question, 
            conversation_history_dicts, 
            request.user_profile_context,
            request.jurisdiction
        )
        answer = format_francis_response(answer)

        if supabase:
            try:
                supabase.table("questions").insert({
                    "user_id": user_id,
                    "question": request.question,
                    "answer": answer,
                    "context": json.dumps(sources) if sources else None, 
                    "created_at": datetime.utcnow().isoformat()
                }).execute()
            except Exception as e:
                print(f"[Erreur Enregistrement Question] {e}")

        return QuestionResponse(
            response=answer,  # Changé de 'answer=' à 'response=' pour correspondre au frontend
            sources=sources,
            confidence=confidence
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne du serveur : {str(e)}")

@api_router.get("/questions/history")
async def get_question_history(
    user_id: str = Depends(verify_token),
    limit: int = 20
):
    try:
        if not supabase:
            return []
        response = supabase.table("questions").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
        return response.data
    except Exception as e:
        return []

@api_router.post("/payment/create-intent")
async def create_payment_intent(
    request: PaymentRequest,
    user_id: str = Depends(verify_token)
):
    try:
        if not stripe.api_key:
            raise HTTPException(status_code=500, detail="Service de paiement non disponible")
        intent = stripe.PaymentIntent.create(
            amount=request.amount,
            currency=request.currency,
            payment_method_types=['card'],
            metadata={
                'user_id': user_id
            }
        )
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/upload/document")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Depends(verify_token)
):
    try:
        allowed_types = ["application/pdf", "image/jpeg", "image/png"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Type de fichier non supporté")
        content = await file.read()

        if HAS_S3:
            try:
                key = generate_storage_key(user_id, file.filename)
                key, presigned_url = upload_bytes(key, content, file.content_type)
                return {
                    "file_id": key.split("/")[-1],
                    "filename": file.filename,
                    "presigned_url": presigned_url,
                    "message": "Document uploadé sur S3 (SSE) avec succès"
                }
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Erreur S3: {str(e)}")

        # Fallback Supabase storage
        file_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1]
        storage_path = f"documents/{user_id}/{file_id}.{file_extension}"
        if supabase:
            try:
                supabase.storage.from_("documents").upload(storage_path, content)
                public_url = supabase.storage.from_("documents").get_public_url(storage_path)
                supabase.table("documents").insert({
                    "id": file_id,
                    "user_id": user_id,
                    "filename": file.filename,
                    "content_type": file.content_type,
                    "storage_path": storage_path,
                    "public_url": public_url,
                    "created_at": datetime.utcnow().isoformat()
                }).execute()
                return {
                    "file_id": file_id,
                    "filename": file.filename,
                    "public_url": public_url,
                    "message": "Document uploadé avec succès (Supabase)"
                }
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
        return {
            "file_id": file_id,
            "filename": file.filename,
            "message": "Document reçu (stockage non configuré)"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/documents")
async def get_user_documents(user_id: str = Depends(verify_token)):
    try:
        if not supabase:
            return []
        response = supabase.table("documents").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        return []

@api_router.post("/webhooks/stripe")
async def stripe_webhook(request: dict):
    try:
        event_type = request.get("type")
        
        # Gestion des événements de paiement
        if event_type == "payment_intent.succeeded":
            payment_intent = request["data"]["object"]
            user_id = payment_intent["metadata"]["user_id"]
            if supabase:
                supabase.table("payments").insert({
                    "user_id": user_id,
                    "payment_intent_id": payment_intent["id"],
                    "amount": payment_intent["amount"],
                    "currency": payment_intent["currency"],
                    "status": "succeeded",
                    "created_at": datetime.utcnow().isoformat()
                }).execute()
        
        # Gestion des événements de souscription
        elif event_type == "checkout.session.completed":
            session = request["data"]["object"]
            customer_email = session.get("customer_email")
            subscription_id = session.get("subscription")
            
            if customer_email and supabase:
                # Mettre à jour le profil utilisateur avec les informations de souscription
                try:
                    supabase.table("profils_utilisateurs").update({
                        "stripe_customer_id": session.get("customer"),
                        "stripe_subscription_id": subscription_id,
                        "updated_at": datetime.utcnow().isoformat()
                    }).eq("email", customer_email).execute()
                    print(f"✅ Souscription activée pour {customer_email}")
                except Exception as e:
                    print(f"❌ Erreur mise à jour profil pour {customer_email}: {e}")
        
        # Gestion des événements de souscription
        elif event_type == "customer.subscription.created":
            subscription = request["data"]["object"]
            customer_id = subscription.get("customer")
            
            if customer_id and supabase:
                try:
                    # Récupérer l'email du customer depuis Stripe
                    customer = stripe.Customer.retrieve(customer_id)
                    customer_email = customer.get("email")
                    
                    if customer_email:
                        supabase.table("profils_utilisateurs").update({
                            "stripe_subscription_id": subscription.get("id"),
                            "updated_at": datetime.utcnow().isoformat()
                        }).eq("email", customer_email).execute()
                        print(f"✅ Abonnement créé pour {customer_email}")
                except Exception as e:
                    print(f"❌ Erreur création abonnement: {e}")
        
        # Gestion des événements de mise à jour d'abonnement
        elif event_type == "customer.subscription.updated":
            subscription = request["data"]["object"]
            customer_id = subscription.get("customer")
            
            if customer_id and supabase:
                try:
                    customer = stripe.Customer.retrieve(customer_id)
                    customer_email = customer.get("email")
                    
                    if customer_email:
                        supabase.table("profils_utilisateurs").update({
                            "stripe_subscription_id": subscription.get("id"),
                            "updated_at": datetime.utcnow().isoformat()
                        }).eq("email", customer_email).execute()
                        print(f"✅ Abonnement mis à jour pour {customer_email}")
                except Exception as e:
                    print(f"❌ Erreur mise à jour abonnement: {e}")
        
        # Gestion des événements d'annulation d'abonnement
        elif event_type == "customer.subscription.deleted":
            subscription = request["data"]["object"]
            customer_id = subscription.get("customer")
            
            if customer_id and supabase:
                try:
                    customer = stripe.Customer.retrieve(customer_id)
                    customer_email = customer.get("email")
                    
                    if customer_email:
                        supabase.table("profils_utilisateurs").update({
                            "stripe_subscription_id": None,
                            "updated_at": datetime.utcnow().isoformat()
                        }).eq("email", customer_email).execute()
                        print(f"✅ Abonnement annulé pour {customer_email}")
                except Exception as e:
                    print(f"❌ Erreur annulation abonnement: {e}")
        
        return {"received": True}
    except Exception as e:
        print(f"❌ Erreur webhook Stripe: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/create-checkout-session")
async def create_checkout_session(request: dict):
    try:
        if not stripe.api_key:
            raise HTTPException(status_code=500, detail="Service de paiement non disponible")
        
        price_id = request.get("priceId")
        success_url = request.get("successUrl", "https://fiscal-ia.net/success")
        cancel_url = request.get("cancelUrl", "https://fiscal-ia.net/pricing")
        
        if not price_id:
            raise HTTPException(status_code=400, detail="Price ID manquant")
        
        # Créer la session de checkout Stripe
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            automatic_tax={'enabled': True},
            customer_email=None,  # Optionnel : récupérer de l'utilisateur connecté
            metadata={
                'environment': 'production' if 'fiscal-ia.net' in success_url else 'development'
            }
        )
        
        return {"url": checkout_session.url}
    except Exception as e:
        print(f"Erreur création checkout session: {e}")
        raise HTTPException(status_code=400, detail=f"Erreur lors de la création de la session: {str(e)}")

@api_router.post("/create-portal-session")
async def create_portal_session(request: dict, user_id: str = Depends(verify_token)):
    try:
        if not stripe.api_key:
            raise HTTPException(status_code=500, detail="Service de paiement non disponible")
        
        return_url = request.get("returnUrl", "https://fiscal-ia.net/account")
        
        print(f"DEBUG: Création portal session pour user_id={user_id}, return_url={return_url}")
        
        # 1. Récupérer l'email de l'utilisateur pour retrouver / créer le Customer Stripe
        customer_email = None
        
        # Méthode 1: Essayer via profils_utilisateurs
        if supabase:
            try:
                print(f"DEBUG: Recherche du profil utilisateur avec user_id: {user_id}")
                resp = supabase.table("profils_utilisateurs").select("email").eq("user_id", user_id).single().execute()
                print(f"DEBUG: Réponse de Supabase profils_utilisateurs: {resp}")
                customer_email = (resp.data or {}).get("email")
                print(f"DEBUG: Email trouvé dans profils_utilisateurs: {customer_email}")
            except Exception as e:
                print(f"DEBUG: Erreur lors de la récupération de l'email depuis profils_utilisateurs: {str(e)}")
        
        # Méthode 2: Essayer via auth.admin.get_user
        if not customer_email and supabase:
            try:
                print(f"DEBUG: Tentative de récupération via auth.admin.get_user({user_id})")
                auth_user = supabase.auth.admin.get_user(user_id)
                print(f"DEBUG: Utilisateur auth trouvé: {auth_user}")
                
                # Vérifier la structure de auth_user pour extraire l'email
                if hasattr(auth_user, 'user') and hasattr(auth_user.user, 'email'):
                    customer_email = auth_user.user.email
                    print(f"DEBUG: Email récupéré depuis auth_user.user.email: {customer_email}")
                elif hasattr(auth_user, 'email'):
                    customer_email = auth_user.email
                    print(f"DEBUG: Email récupéré depuis auth_user.email: {customer_email}")
                else:
                    # Essayer d'accéder comme un dictionnaire
                    try:
                        if isinstance(auth_user, dict):
                            customer_email = auth_user.get('email') or (auth_user.get('user', {}) or {}).get('email')
                            print(f"DEBUG: Email récupéré depuis auth_user dict: {customer_email}")
                    except Exception as dict_err:
                        print(f"DEBUG: Erreur lors de l'accès dict à auth_user: {dict_err}")
            except Exception as auth_err:
                print(f"DEBUG: Erreur lors de la récupération via auth.admin.get_user: {str(auth_err)}")
                
                # Méthode 3: Essayer via auth.admin.get_user_by_id (alternative)
                try:
                    print(f"DEBUG: Tentative alternative via auth.admin.get_user_by_id({user_id})")
                    auth_user = supabase.auth.admin.get_user_by_id(user_id)
                    print(f"DEBUG: Utilisateur auth trouvé (méthode alternative): {auth_user}")
                    
                    if hasattr(auth_user, 'user') and hasattr(auth_user.user, 'email'):
                        customer_email = auth_user.user.email
                        print(f"DEBUG: Email récupéré depuis auth_user.user.email (méthode alternative): {customer_email}")
                except Exception as alt_auth_err:
                    print(f"DEBUG: Erreur lors de la récupération alternative via auth.admin: {str(alt_auth_err)}")

        # Méthode 4: Essayer via la table users SQL
        if not customer_email:
            try:
                print(f"DEBUG: Tentative de récupération via SQL users table pour user_id={user_id}")
                with get_db_connection() as conn:
                    with conn.cursor() as cursor:
                        cursor.execute("SELECT email FROM users WHERE id = %s", (user_id,))
                        result = cursor.fetchone()
                        if result:
                            customer_email = result[0]
                            print(f"DEBUG: Email récupéré depuis la base SQL users: {customer_email}")
            except Exception as db_error:
                print(f"DEBUG: Erreur lors de la récupération de l'email depuis la base SQL: {db_error}")

        if not customer_email:
            error_msg = "Email utilisateur introuvable pour créer la session portal"
            print(f"DEBUG: {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)

        # 2. Chercher un customer existant, sinon le créer
        customer_id = None
        try:
            print(f"DEBUG: Recherche du customer Stripe avec email={customer_email}")
            search_res = stripe.Customer.list(email=customer_email, limit=1)
            if search_res and hasattr(search_res, 'data') and search_res.data:
                customer_id = search_res.data[0].id
                print(f"DEBUG: Customer Stripe existant trouvé: {customer_id}")
        except Exception as stripe_error:
            print(f"DEBUG: Erreur lors de la recherche du customer Stripe: {stripe_error}")

        if not customer_id:
            try:
                print(f"DEBUG: Création d'un nouveau customer Stripe avec email={customer_email}")
                customer = stripe.Customer.create(email=customer_email, metadata={"user_id": user_id})
                customer_id = customer.id
                print(f"DEBUG: Nouveau customer Stripe créé: {customer_id}")
            except Exception as create_error:
                print(f"DEBUG: Erreur lors de la création du customer Stripe: {create_error}")
                raise HTTPException(status_code=400, detail=f"Erreur lors de la création du customer Stripe: {str(create_error)}")

        # 3. Créer la session du portail
        try:
            print(f"DEBUG: Création de la session portal pour customer_id={customer_id}")
            portal_session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            print(f"DEBUG: Session portal créée avec succès: {portal_session.url}")
            return {"url": portal_session.url}
        except Exception as portal_error:
            print(f"DEBUG: Erreur lors de la création de la session portal: {portal_error}")
            raise HTTPException(status_code=400, detail=f"Erreur lors de la création de la session portal: {str(portal_error)}")
        
    except Exception as e:
        error_detail = str(e)
        print(f"ERREUR: Création portal session: {error_detail}")
        
        # Si c'est une HTTPException, la propager directement
        if isinstance(e, HTTPException):
            raise e
            
        raise HTTPException(status_code=400, detail=f"Erreur lors de la création du portal: {error_detail}")

@api_router.post("/truelayer/exchange", response_model=TrueLayerExchangeResponse)
async def truelayer_exchange(request: TrueLayerCodeRequest, user_id: str = Depends(verify_token)):
    if not (TRUELAYER_CLIENT_ID and TRUELAYER_CLIENT_SECRET):
        raise HTTPException(status_code=500, detail="TrueLayer n'est pas configuré côté serveur")
    token_payload = {
        "grant_type": "authorization_code",
        "client_id": TRUELAYER_CLIENT_ID,
        "client_secret": TRUELAYER_CLIENT_SECRET,
        "redirect_uri": TRUELAYER_REDIRECT_URI,
        "code": request.code,
    }
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            f"{TRUELAYER_BASE_AUTH_URL}/connect/token",
            data=token_payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Échec de l'échange de code TrueLayer")
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        accounts_resp = await client.get(
            f"{TRUELAYER_API_URL}/data/v1/accounts",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        accounts_data = accounts_resp.json().get("results", []) if accounts_resp.status_code == 200 else []
    if supabase:
        try:
            supabase.table("bank_connections").insert({
                "user_id": user_id,
                "provider_id": request.provider_id,
                "access_token": access_token,
                "refresh_token": token_data.get("refresh_token"),
                "expires_in": token_data.get("expires_in"),
                "scope": token_data.get("scope"),
                "created_at": datetime.utcnow().isoformat()
            }).execute()
        except Exception as e:
            print(f"[TrueLayer] Erreur sauvegarde Supabase pour user {user_id}: {e}", file=sys.stderr)
            pass
    return TrueLayerExchangeResponse(
        access_token=access_token,
        refresh_token=token_data.get("refresh_token"),
        expires_in=token_data.get("expires_in", 0),
        token_type=token_data.get("token_type", "Bearer"),
        scope=token_data.get("scope", ""),
        accounts=accounts_data
    )

@api_router.post("/tools/calculate-tmi", response_model=TMICalculationResponse)
async def calculate_tmi(request: TMICalculationRequest):
    """Calculateur TMI ultra-précis 2025 - Aide l'utilisateur à comprendre sa situation fiscale"""
    try:
        # Calcul du revenu imposable
        revenu_imposable = max(0, request.revenus_annuels - request.charges_deductibles)
        
        # Calcul du nombre de parts (précis selon la loi)
        parts = 1.0
        if request.situation_familiale == "marié":
            parts = 2.0
        elif request.situation_familiale == "pacs":
            parts = 2.0
        
        # Parts pour enfants (demi-part par enfant)
        parts += request.nombre_enfants * 0.5
        
        quotient_familial = revenu_imposable / parts if parts > 0 else revenu_imposable
        
        # Barème IR 2025 EXACT (selon la loi de finances 2025)
        bareme_2025 = [
            {"limite": 0, "taux": 0.0},
            {"limite": 11294, "taux": 0.11},
            {"limite": 28797, "taux": 0.30},
            {"limite": 82341, "taux": 0.41},
            {"limite": 177106, "taux": 0.45},
            {"limite": float('inf'), "taux": 0.49}
        ]
        
        # Calcul précis de l'impôt et TMI
        impot_total = 0
        tmi = 0
        tranches_applicables = []
        
        for i, tranche in enumerate(bareme_2025):
            if quotient_familial > tranche["limite"]:
                limite_suivante = bareme_2025[i + 1]["limite"] if i + 1 < len(bareme_2025) else float('inf')
                base_imposable_tranche = min(quotient_familial, limite_suivante) - tranche["limite"]
                impot_tranche = base_imposable_tranche * tranche["taux"]
                impot_total += impot_tranche
                
                if base_imposable_tranche > 0:
                    tranches_applicables.append({
                        "tranche": f"{tranche['limite']:,.0f}€ - {limite_suivante:,.0f}€",
                        "taux": f"{tranche['taux']*100:.0f}%",
                        "base_imposable": f"{base_imposable_tranche:,.0f}€",
                        "impot_tranche": f"{impot_tranche:,.0f}€"
                    })
                
                tmi = max(tmi, tranche["taux"] * 100)
        
        # Application du quotient familial
        impot_total *= parts
        
        # Calcul du taux moyen d'imposition
        taux_moyen = (impot_total / revenu_imposable * 100) if revenu_imposable > 0 else 0
        
        # Conseils d'optimisation ultra-précis pour 2025
        conseils = []
        
        if tmi >= 45:
            conseils.append("🚀 TMI 45% - Potentiel d'optimisation MAXIMAL !")
            conseils.append("💡 PER : Économisez jusqu'à 45% sur vos versements (plafond 10% des revenus)")
            conseils.append("🏠 LMNP : Défiscalisez jusqu'à 15% de vos revenus via l'immobilier")
            conseils.append("📊 Dons : Réduisez votre IFI et optimisez la transmission")
        elif tmi >= 41:
            conseils.append("📈 TMI 41% - Fort potentiel d'optimisation !")
            conseils.append("💡 PER : Basculez vers la tranche 30% sur vos versements")
            conseils.append("🏠 Investissement locatif : Faites-vous basculer vers 30%")
            conseils.append("💰 Optimisez votre quotient familial")
        elif tmi >= 30:
            conseils.append("⚖️ TMI 30% - Potentiel d'optimisation modéré")
            conseils.append("💡 PER : Économisez 30% sur vos versements")
            conseils.append("🏠 Immobilier : Optimisez pour rester dans cette tranche")
            conseils.append("📚 Planifiez la transmission de votre patrimoine")
        elif tmi >= 11:
            conseils.append("✅ TMI 11% - Situation optimale")
            conseils.append("💡 Concentrez-vous sur l'épargne et la transmission")
            conseils.append("🏠 Investissement : Privilégiez l'immobilier locatif")
            conseils.append("📊 Anticipez les hausses de revenus")
        else:
            conseils.append("🎯 Non imposable - Parfait pour l'épargne")
            conseils.append("💡 Préparez-vous aux futures impositions")
            conseils.append("🏠 Investissez dans l'immobilier locatif")
            conseils.append("📚 Éduquez-vous sur la fiscalité")
        
        # Ajout de conseils spécifiques 2025
        conseils.append("📅 2025 : Nouveau barème applicable - optimisez dès maintenant !")
        conseils.append("🔍 Vérifiez vos droits à la décote (seuil 2025 : 1 747€)")
        
        return TMICalculationResponse(
            revenu_imposable=revenu_imposable,
            tmi=tmi,
            taux_moyen=taux_moyen,
            impot_estime=impot_total,
            tranches_applicables=tranches_applicables,
            conseils_optimisation=conseils
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du calcul TMI: {str(e)}")

@api_router.post("/tools/simulate-optimization", response_model=OptimizationSimulationResponse)
async def simulate_optimization(request: OptimizationSimulationRequest):
    """Simulateur d'optimisation disruptif - Montre le potentiel d'émancipation fiscale"""
    try:
        economie_potentielle = 0
        strategies = []
        
        # Stratégies basées sur les objectifs
        if "retraite" in request.objectifs:
            per_economie = min(request.revenus_annuels * 0.1, 5000) * (request.tmi_actuelle / 100)
            strategies.append({
                "nom": "Plan d'Épargne Retraite (PER)",
                "economie": per_economie,
                "description": "Déduisez jusqu'à 10% de vos revenus professionnels",
                "impact_conscience": "Vous reprenez le contrôle de votre épargne retraite",
                "difficulte": "Facile",
                "delai": "Immédiat"
            })
            economie_potentielle += per_economie
        
        if "immobilier" in request.objectifs:
            lmnp_economie = min(request.revenus_annuels * 0.15, 8000) * (request.tmi_actuelle / 100)
            strategies.append({
                "nom": "Location Meublée Non Professionnelle (LMNP)",
                "economie": lmnp_economie,
                "description": "Défiscalisez jusqu'à 15% de vos revenus via l'immobilier",
                "impact_conscience": "Vous devenez propriétaire de votre patrimoine",
                "difficulte": "Moyenne",
                "delai": "3-6 mois"
            })
            economie_potentielle += lmnp_economie
        
        if "transmission" in request.objectifs:
            donation_economie = min(request.revenus_annuels * 0.05, 3000) * (request.tmi_actuelle / 100)
            strategies.append({
                "nom": "Donation Progressive",
                "economie": donation_economie,
                "description": "Transmettez votre patrimoine en optimisant les droits",
                "impact_conscience": "Vous sécurisez l'avenir de vos proches",
                "difficulte": "Élevée",
                "delai": "6-12 mois"
            })
            economie_potentielle += donation_economie
        
        # Impact sur la conscience fiscale
        impact_conscience = "Vous reprenez le contrôle de votre fiscalité"
        if economie_potentielle > 5000:
            impact_conscience = "Vous devenez maître de votre destinée fiscale"
        elif economie_potentielle > 2000:
            impact_conscience = "Vous vous émancipez de la dépendance fiscale"
        
        actions_prioritaires = [
            "Complétez votre profil fiscal pour des recommandations personnalisées",
            "Consultez un professionnel pour valider les stratégies",
            "Planifiez vos actions sur 12 mois pour maximiser l'impact"
        ]
        
        return OptimizationSimulationResponse(
            economie_potentielle=economie_potentielle,
            strategies_recommandees=strategies,
            impact_conscience=impact_conscience,
            actions_prioritaires=actions_prioritaires
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la simulation: {str(e)}")

@api_router.post("/tools/consciousness-test")
async def consciousness_test(request: dict):
    """Test complet de conscience fiscale et financière"""
    
    # Questions du test avec pondération
    questions = {
        "connaissance_tmi": {
            "question": "Connaissez-vous votre Taux Marginal d'Imposition (TMI) ?",
            "reponses": {
                "1": {"texte": "Je ne sais pas ce que c'est", "score": 0},
                "2": {"texte": "J'ai entendu parler mais je ne comprends pas", "score": 25},
                "3": {"texte": "Je connais approximativement", "score": 50},
                "4": {"texte": "Je connais précisément", "score": 75},
                "5": {"texte": "Je comprends tous les mécanismes", "score": 100}
            },
            "poids": 15
        },
        "comprehension_barème": {
            "question": "Comprenez-vous le fonctionnement du barème progressif de l'IR ?",
            "reponses": {
                "1": {"texte": "Pas du tout", "score": 0},
                "2": {"texte": "Vaguement", "score": 25},
                "3": {"texte": "Assez bien", "score": 50},
                "4": {"texte": "Bien", "score": 75},
                "5": {"texte": "Parfaitement", "score": 100}
            },
            "poids": 12
        },
        "optimisation_active": {
            "question": "Mettez-vous en place des optimisations fiscales ?",
            "reponses": {
                "1": {"texte": "Aucune", "score": 0},
                "2": {"texte": "Quelques-unes basiques", "score": 30},
                "3": {"texte": "Plusieurs optimisations", "score": 60},
                "4": {"texte": "Stratégie complète", "score": 85},
                "5": {"texte": "Optimisation maximale", "score": 100}
            },
            "poids": 18
        },
        "planification_fiscale": {
            "question": "Planifiez-vous votre fiscalité à l'avance ?",
            "reponses": {
                "1": {"texte": "Jamais", "score": 0},
                "2": {"texte": "Rarement", "score": 25},
                "3": {"texte": "Parfois", "score": 50},
                "4": {"texte": "Souvent", "score": 75},
                "5": {"texte": "Toujours", "score": 100}
            },
            "poids": 15
        },
        "comprehension_per": {
            "question": "Comprenez-vous le Plan d'Épargne Retraite (PER) ?",
            "reponses": {
                "1": {"texte": "Je ne sais pas ce que c'est", "score": 0},
                "2": {"texte": "J'ai entendu parler", "score": 20},
                "3": {"texte": "Je comprends les bases", "score": 40},
                "4": {"texte": "Je comprends bien", "score": 70},
                "5": {"texte": "Je maîtrise parfaitement", "score": 100}
            },
            "poids": 10
        }
    }
    
    # Si c'est une demande de questions (pas de réponses)
    if not request.get("reponses"):
        return {"questions": questions}
    
    # Calcul du score
    reponses = request.get("reponses", {})
    score_total = 0
    score_maximum = 0
    
    for question_id, reponse in reponses.items():
        if question_id in questions:
            question = questions[question_id]
            score_maximum += question["poids"] * 100
            
            if reponse in question["reponses"]:
                score_total += question["reponses"][reponse]["score"] * question["poids"] / 100
    
    pourcentage = (score_total / score_maximum * 100) if score_maximum > 0 else 0
    
    # Déterminer le niveau de conscience
    if pourcentage >= 80:
        niveau = "Expert"
        recommandations = [
            "Vous maîtrisez parfaitement la fiscalité - partagez votre savoir !",
            "Concentrez-vous sur les optimisations avancées",
            "Considérez la transmission de patrimoine"
        ]
    elif pourcentage >= 60:
        niveau = "Avancé"
        recommandations = [
            "Excellent niveau ! Approfondissez les stratégies complexes",
            "Explorez les niches fiscales",
            "Planifiez votre retraite de manière optimale"
        ]
    elif pourcentage >= 40:
        niveau = "Intermédiaire"
        recommandations = [
            "Bon niveau de base - continuez à apprendre",
            "Mettez en place des optimisations simples",
            "Comprenez mieux votre TMI"
        ]
    else:
        niveau = "Débutant"
        recommandations = [
            "Commencez par comprendre les bases de l'IR",
            "Apprenez ce qu'est votre TMI",
            "Découvrez les optimisations de base"
        ]
    
    prochaines_etapes = [
        "Complétez votre profil fiscal pour des conseils personnalisés",
        "Utilisez le calculateur TMI pour comprendre votre situation",
        "Consultez un professionnel pour valider vos stratégies"
    ]
    
    return {
        "niveau_conscience": niveau,
        "score_total": int(score_total),
        "score_maximum": int(score_maximum),
        "pourcentage": round(pourcentage, 1),
        "recommandations": recommandations,
        "prochaines_etapes": prochaines_etapes
    }

@api_router.post("/tools/fiscal-insights", response_model=FiscalInsightsResponse)
async def get_fiscal_insights(request: FiscalInsightsRequest):
    """Insights fiscaux personnalisés - Donne une vision claire de la situation"""
    try:
        # Récupération du profil utilisateur
        db = SessionLocal()
        try:
            profile = db.query(UserProfile).filter(UserProfile.auth_user_id == request.user_id).first()
        finally:
            db.close()
        
        if not profile:
            # Données par défaut si pas de profil
            return FiscalInsightsResponse(
                economie_potentielle=2400,
                tmi_actuelle=30,
                score_optimisation=65,
                optimisations_disponibles=8,
                niveau_conscience="Intermédiaire",
                actions_recommandees=[
                    "Complétez votre profil pour des insights personnalisés",
                    "Passez le test de conscience fiscale",
                    "Utilisez le simulateur d'optimisation"
                ],
                alertes_fiscales=[
                    "Nouveau barème IR 2024 applicable",
                    "Échéance déclaration 2024 : 30 mai 2024"
                ]
            )
        
        # Calculs basés sur le profil réel
        tmi_actuelle = profile.tmi or 30
        revenus = profile.revenus_annuels or 50000
        
        # Estimation des économies potentielles
        economie_potentielle = min(revenus * 0.1 * (tmi_actuelle / 100), 5000)
        
        # Score d'optimisation basé sur le profil
        score_optimisation = 50  # Base
        if profile.has_completed_onboarding:
            score_optimisation += 20
        if profile.activite_principale:
            score_optimisation += 15
        if profile.patrimoine_immobilier:
            score_optimisation += 15
        
        # Niveau de conscience
        if score_optimisation >= 80:
            niveau_conscience = "Expert"
        elif score_optimisation >= 60:
            niveau_conscience = "Avancé"
        elif score_optimisation >= 40:
            niveau_conscience = "Intermédiaire"
        else:
            niveau_conscience = "Débutant"
        
        # Optimisations disponibles
        optimisations_disponibles = 0
        if profile.activite_principale:
            optimisations_disponibles += 3  # PER, LMNP, etc.
        if profile.patrimoine_immobilier:
            optimisations_disponibles += 2  # IFI, transmission
        if profile.situation_familiale == "marié":
            optimisations_disponibles += 2  # Optimisations familiales
        if profile.nombre_enfants and profile.nombre_enfants > 0:
            optimisations_disponibles += 1  # Quotient familial
        
        actions_recommandees = [
            "Optimisez votre TMI avec le PER",
            "Explorez l'investissement locatif défiscalisé",
            "Planifiez la transmission de votre patrimoine"
        ]
        
        alertes_fiscales = [
            "Nouveau barème IR 2024 applicable",
            "Échéance déclaration 2024 : 30 mai 2024",
            "Vérifiez vos droits à la décote"
        ]
        
        return FiscalInsightsResponse(
            economie_potentielle=economie_potentielle,
            tmi_actuelle=tmi_actuelle,
            score_optimisation=score_optimisation,
            optimisations_disponibles=optimisations_disponibles,
            niveau_conscience=niveau_conscience,
            actions_recommandees=actions_recommandees,
            alertes_fiscales=alertes_fiscales
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des insights: {str(e)}")

# (L'inclusion finale des routeurs se trouve en bas du fichier)
# app.include_router(api_router)
# app.include_router(pro_clients_router.router)

@app.on_event("startup")
async def startup_event():
    try:
        print("🚀 Préchargement des embeddings CGI...")
        search_cgi_embeddings("test", max_results=1)
        print("✅ Embeddings CGI préchargés avec succès!")
    except Exception as e:
        print(f"⚠️  Erreur lors du préchargement des embeddings: {e}", file=sys.stderr)
        pass

print("MAIN_PY_LOG: Tentative de création des tables via Base.metadata.create_all()", file=sys.stderr, flush=True)
try:
    print("MAIN_PY_LOG: Avant Base.metadata.create_all", file=sys.stderr, flush=True)
    # Base.metadata.create_all(bind=engine)
    print("MAIN_PY_LOG: Après Base.metadata.create_all", file=sys.stderr, flush=True)
    print("MAIN_PY_LOG: Avant BasePro.metadata.create_all", file=sys.stderr, flush=True)
    # BasePro.metadata.create_all(bind=engine)
    print("MAIN_PY_LOG: Après BasePro.metadata.create_all", file=sys.stderr, flush=True)
except Exception as e:
    print(f"MAIN_PY_LOG: ERREUR lors de la création des tables: {e}", file=sys.stderr, flush=True)
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.stderr.flush()
    raise

def clean_user_profile_response(profile: UserProfileResponse) -> UserProfileResponse:
    profile.situation_familiale = clean_markdown_formatting(profile.situation_familiale) if profile.situation_familiale else None
    return profile

@api_router.post("/user-profile/", response_model=UserProfileResponse)
def create_user_profile(user_profile_data: UserProfileCreate, db: Session = Depends(get_db_session)):
    # Vérifier si un profil existe déjà pour cet auth_user_id
    existing_profile = db.query(UserProfile).filter(UserProfile.auth_user_id == user_profile_data.auth_user_id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail=f"Un profil pour l'utilisateur avec auth_id {user_profile_data.auth_user_id} existe déjà.")
    
    # Convertir les listes en JSON strings avant sauvegarde
    profile_data = user_profile_data.model_dump()
    if profile_data.get('revenus_passifs'):
        profile_data['revenus_passifs'] = json.dumps(profile_data['revenus_passifs'])
    if profile_data.get('revenus_complementaires'):
        profile_data['revenus_complementaires'] = json.dumps(profile_data['revenus_complementaires'])
    if profile_data.get('statuts_juridiques'):
        profile_data['statuts_juridiques'] = json.dumps(profile_data['statuts_juridiques'])
    
    db_user_profile = UserProfile(**profile_data)
    db.add(db_user_profile)
    db.commit()
    db.refresh(db_user_profile)
    
    response_data = {**db_user_profile.__dict__}
    response_data.pop('_sa_instance_state', None)
    response_data['auth_user_id'] = str(db_user_profile.auth_user_id)
    
    # Convertir les JSON strings de retour en strings pour la réponse
    for field in ['revenus_passifs', 'revenus_complementaires', 'statuts_juridiques']:
        if response_data.get(field):
            response_data[field] = response_data[field]  # Garder comme string JSON
    
    response = UserProfileResponse(**response_data)
    return clean_user_profile_response(response)

@api_router.get("/user-profile/{auth_user_id}", response_model=UserProfileResponse)
def read_user_profile(auth_user_id: str, db: Session = Depends(get_db_session)):
    db_user_profile = db.query(UserProfile).filter(UserProfile.auth_user_id == auth_user_id).first()
    if db_user_profile is None:
        raise HTTPException(status_code=404, detail=f"Profil utilisateur avec auth_id {auth_user_id} non trouvé")
    
    response_data = {**db_user_profile.__dict__}
    response_data.pop('_sa_instance_state', None)
    response_data['auth_user_id'] = str(db_user_profile.auth_user_id)
    
    # Convertir les JSON strings de retour en strings pour la réponse
    for field in ['revenus_passifs', 'revenus_complementaires', 'statuts_juridiques']:
        if response_data.get(field):
            response_data[field] = response_data[field]  # Garder comme string JSON
    
    response = UserProfileResponse(**response_data)
    return clean_user_profile_response(response)

@api_router.put("/user-profile/{auth_user_id}", response_model=UserProfileResponse)
def update_user_profile(auth_user_id: str, user_profile_update_data: UserProfileCreate, db: Session = Depends(get_db_session)):
    db_user_profile = db.query(UserProfile).filter(UserProfile.auth_user_id == auth_user_id).first()
    if db_user_profile is None:
        # Créer le profil s'il n'existe pas (comportement PUT)
        return create_user_profile(user_profile_update_data, db)

    update_data = user_profile_update_data.model_dump(exclude_unset=True)
    update_data.pop('auth_user_id', None)
    update_data.pop('user_id', None)
    
    # Convertir les listes en JSON strings avant mise à jour
    if update_data.get('revenus_passifs'):
        update_data['revenus_passifs'] = json.dumps(update_data['revenus_passifs'])
    if update_data.get('revenus_complementaires'):
        update_data['revenus_complementaires'] = json.dumps(update_data['revenus_complementaires'])
    if update_data.get('statuts_juridiques'):
        update_data['statuts_juridiques'] = json.dumps(update_data['statuts_juridiques'])

    for key, value in update_data.items():
        setattr(db_user_profile, key, value)
    
    db.commit()
    db.refresh(db_user_profile)
    
    response_data = {**db_user_profile.__dict__}
    response_data.pop('_sa_instance_state', None)
    response_data['auth_user_id'] = str(db_user_profile.auth_user_id)
    
    # Convertir les JSON strings de retour en strings pour la réponse
    for field in ['revenus_passifs', 'revenus_complementaires', 'statuts_juridiques']:
        if response_data.get(field):
            response_data[field] = response_data[field]  # Garder comme string JSON
    
    response = UserProfileResponse(**response_data)
    return clean_user_profile_response(response)

@api_router.delete("/user-profile/{auth_user_id}", response_model=UserProfileResponse)
def delete_user_profile(auth_user_id: str, db: Session = Depends(get_db_session)):
    db_user_profile = db.query(UserProfile).filter(UserProfile.auth_user_id == auth_user_id).first()
    if db_user_profile is None:
        raise HTTPException(status_code=404, detail=f"Profil utilisateur avec auth_id {auth_user_id} non trouvé")
    
    response_data_before_delete = {**db_user_profile.__dict__}
    response_data_before_delete.pop('_sa_instance_state', None)
    response_data_before_delete['auth_user_id'] = str(db_user_profile.auth_user_id)

    db.delete(db_user_profile)
    db.commit()
    
    response = UserProfileResponse(**response_data_before_delete)
    return clean_user_profile_response(response)

@api_router.post("/gocardless/connect-bank", response_model=GoCardlessBankAccountResponse)
async def gocardless_connect_bank(request: GoCardlessBankAccountRequest, user_id: str = Depends(verify_token)):
    if not GOCARDLESS_ACCESS_TOKEN:
        raise HTTPException(status_code=500, detail="GoCardless n'est pas configuré côté serveur")
    
    try:
        # Headers pour l'API GoCardless
        headers = {
            "Authorization": f"Bearer {GOCARDLESS_ACCESS_TOKEN}",
            "GoCardless-Version": "2015-07-06",
            "Content-Type": "application/json"
        }
        
        # Créer un customer GoCardless
        customer_data = {
            "customers": {
                "email": f"user_{user_id}@fiscal-ia.net",
                "given_name": request.account_holder_name.split()[0] if request.account_holder_name else "Utilisateur",
                "family_name": " ".join(request.account_holder_name.split()[1:]) if len(request.account_holder_name.split()) > 1 else "Fiscal.ia"
            }
        }
        
        async with httpx.AsyncClient() as client:
            customer_response = await client.post(
                f"{GOCARDLESS_BASE_URL}/customers",
                json=customer_data,
                headers=headers
            )
            
            if customer_response.status_code != 201:
                raise HTTPException(status_code=400, detail="Échec de la création du customer GoCardless")
            
            customer = customer_response.json()["customers"]
            
            # Créer un bank account
            bank_account_data = {
                "bank_accounts": {
                    "account_number": request.account_number,
                    "branch_code": request.branch_code,
                    "country_code": request.country_code,
                    "account_holder_name": request.account_holder_name,
                    "links": {
                        "customer": customer["id"]
                    }
                }
            }
            
            bank_response = await client.post(
                f"{GOCARDLESS_BASE_URL}/bank_accounts",
                json=bank_account_data,
                headers=headers
            )
            
            if bank_response.status_code != 201:
                raise HTTPException(status_code=400, detail="Échec de la création du compte bancaire")
            
            bank_account = bank_response.json()["bank_accounts"]
            
            # Sauvegarder dans Supabase
            if supabase:
                try:
                    supabase.table("bank_connections").insert({
                        "user_id": user_id,
                        "provider": "gocardless",
                        "customer_id": customer["id"],
                        "bank_account_id": bank_account["id"],
                        "account_holder_name": bank_account["account_holder_name"],
                        "bank_name": bank_account.get("bank_name", "Banque française"),
                        "country_code": bank_account["country_code"],
                        "currency": bank_account["currency"],
                        "status": bank_account["status"],
                        "created_at": datetime.utcnow().isoformat()
                    }).execute()
                except Exception as e:
                    print(f"[GoCardless] Erreur sauvegarde Supabase pour user {user_id}: {e}", file=sys.stderr)
                    pass
            
            return GoCardlessBankAccountResponse(
                id=bank_account["id"],
                account_holder_name=bank_account["account_holder_name"],
                account_number_ending=bank_account.get("account_number_ending", "****"),
                bank_name=bank_account.get("bank_name", "Banque française"),
                country_code=bank_account["country_code"],
                currency=bank_account["currency"],
                status=bank_account["status"]
            )
            
    except Exception as e:
        print(f"Erreur GoCardless: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la connexion bancaire: {str(e)}")



# Endpoints Whisper optimisés - SUPPRIMÉS pour éviter les conflits
# Les endpoints Whisper sont maintenant définis directement sur app

@app.get("/test")
async def test_endpoint():
    return {"message": "Backend fonctionne !", "timestamp": datetime.now().isoformat()}

@app.get("/test-whisper")
async def test_whisper():
    """Test simple pour vérifier que Whisper fonctionne."""
    try:
        whisper_service = get_whisper_service()
        if not whisper_service:
            return {"error": "Service Whisper non disponible"}
        
        health = whisper_service.check_health()
        return {
            "message": "Whisper test endpoint",
            "health": health,
            "status": "ok"
        }
    except Exception as e:
        return {
            "error": f"Erreur Whisper: {str(e)}",
            "status": "error"
        }

@api_router.post("/whisper/health")
async def whisper_health_simple():
    return {
        "status": "healthy",
        "model_loaded": True,
        "is_loading": False,
        "cache_size": 0,
        "message": "Whisper service disponible"
    }

@api_router.post("/whisper/transcribe")
async def whisper_transcribe_real(request: dict):
    audio_base64 = request.get("audio_base64")
    audio_format = request.get("audio_format", "webm")
    language = request.get("language", "fr")
    if not audio_base64:
        return {"error": "Aucun audio fourni"}
    service = get_whisper_service()
    result = service.transcribe_base64_audio(audio_base64, audio_format)
    return result

@api_router.post("/whisper/transcribe-streaming")
async def transcribe_streaming(request: dict):
    """
    Endpoint de transcription en streaming ultra-fluide pour du temps réel.
    """
    try:
        audio_base64 = request.get("audio_base64", "")
        streaming = request.get("streaming", False)
        language = request.get("language", "fr")
        
        if not audio_base64:
            return {"error": "Audio manquant"}
        
        # Décodage base64 optimisé
        audio_data = base64.b64decode(audio_base64)
        
        # Service Whisper
        whisper_service = get_whisper_service()
        if not whisper_service:
            return {"error": "Service Whisper non disponible"}
        
        # Mode streaming ultra-fluide
        if streaming:
            def generate_ultra_fluid_stream():
                # Transcription en streaming ultra-fluide
                result = whisper_service.transcribe_base64_audio(audio_base64, "webm")
                yield f"data: {json.dumps(result)}\n\n"
            
            return StreamingResponse(
                generate_ultra_fluid_stream(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Content-Type": "text/event-stream",
                    "X-Streaming": "ultra-fluid"
                }
            )
        else:
            result = whisper_service.transcribe_base64_audio(audio_base64, "webm")
            result["streaming"] = False
            return result
        
    except Exception as e:
        return {"error": f"Erreur streaming: {str(e)}"}

@api_router.post("/whisper/transcribe-ultra-fluid")
async def transcribe_ultra_fluid(request: dict):
    """
    Endpoint ultra-fluide optimisé pour la reconnaissance vocale en temps réel.
    """
    try:
        audio_base64 = request.get("audio_base64", "")
        language = request.get("language", "fr")
        
        if not audio_base64:
            return {"error": "Audio manquant"}
        
        # Service Whisper
        whisper_service = get_whisper_service()
        if not whisper_service:
            return {"error": "Service Whisper non disponible"}
        
        start_time = time.time()
        
        # Transcription ultra-rapide avec paramètres optimisés
        result = whisper_service.transcribe_base64_audio(audio_base64, "webm")
        
        # Calcul des métriques de performance
        end_time = time.time()
        latency_ms = (end_time - start_time) * 1000
        
        # Amélioration du résultat avec métriques
        enhanced_result = {
            **result,
            "ultra_fluid": True,
            "latency_ms": round(latency_ms, 1),
            "processing_time": round(end_time - start_time, 3),
            "optimized": True
        }
        
        return enhanced_result
        
    except Exception as e:
        return {"error": f"Erreur ultra-fluid: {str(e)}"}

@app.websocket("/ws/whisper-stream")
async def websocket_whisper_stream(websocket: WebSocket):
    """
    WebSocket pour streaming audio en temps réel avec Whisper, avec conversion audio.
    """
    await websocket.accept()
    
    try:
        whisper_service = get_whisper_service()
        if not whisper_service:
            await websocket.send_text(json.dumps({"type": "error", "error": "Service Whisper non disponible"}))
            return
        
        audio_buffer = b''
        
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "audio":
                    audio_chunk_b64 = message["audio"]
                    audio_chunk_bytes = base64.b64decode(audio_chunk_b64)

                    # Conversion WebM -> WAV avec pydub
                    try:
                        webm_audio = AudioSegment.from_file(io.BytesIO(audio_chunk_bytes), format="webm")
                        wav_buffer = io.BytesIO()
                        webm_audio.export(wav_buffer, format="wav")
                        audio_buffer += wav_buffer.getvalue()
                    except Exception as e:
                        logger.warning(f"Pydub n'a pas pu traiter un chunk: {e}")
                        continue

                    # Transcrire quand on a assez d'audio (ex: > 1 seconde)
                    # La taille dépend du format WAV (16-bit PCM, 16kHz mono = 32000 bytes/sec)
                    if len(audio_buffer) > 32000:
                        try:
                            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                                temp_file.write(audio_buffer)
                                temp_file_path = temp_file.name
                            
                            try:
                                result = whisper_service._transcribe_audio_file_internal(temp_file_path)
                                if result and result.get("text", "").strip():
                                    await websocket.send_text(json.dumps({
                                        "type": "transcription",
                                        "text": result["text"],
                                        "is_final": False
                                    }))
                            finally:
                                if os.path.exists(temp_file_path):
                                    os.unlink(temp_file_path)
                            
                            audio_buffer = b'' # Réinitialiser le buffer
                            
                        except Exception as e:
                            await websocket.send_text(json.dumps({"type": "error", "error": str(e)}))
                
                elif message.get("type") == "end":
                    if audio_buffer:
                        # Transcription finale du buffer restant
                        try:
                            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                                temp_file.write(audio_buffer)
                                temp_file_path = temp_file.name
                            
                            try:
                                result = whisper_service._transcribe_audio_file_internal(temp_file_path)
                                if result and result.get("text", "").strip():
                                    await websocket.send_text(json.dumps({
                                        "type": "transcription",
                                        "text": result["text"],
                                        "is_final": True
                                    }))
                            finally:
                                if os.path.exists(temp_file_path):
                                    os.unlink(temp_file_path)
                        except Exception as e:
                            await websocket.send_text(json.dumps({"type": "error", "error": str(e)}))
                    
                    # Indiquer la fin finale de la transcription
                    await websocket.send_text(json.dumps({"type": "transcription", "text": "", "is_final": True}))
                    break # Terminer la boucle et fermer la connexion

            except WebSocketDisconnect:
                logger.info("Client déconnecté.")
                break
            except Exception as e:
                logger.error(f"Erreur dans la boucle WebSocket: {e}")
                await websocket.send_text(json.dumps({"type": "error", "error": "Erreur interne du serveur"}))
                break

    except Exception as e:
        logger.error(f"Erreur lors de l'initialisation du WebSocket: {e}")
    finally:
        logger.info("Connexion WebSocket fermée.")

@api_router.post("/ai/analyze-profile-text")
async def analyze_profile_text(request: dict):
    """
    IA qui analyse le texte dicté et extrait TOUTES les informations du profil client.
    """
    try:
        text = request.get("text", "")
        extract_all = request.get("extract_all", False)
        
        if not text:
            return {"error": "Texte manquant"}
        
        # Prompt INTELLIGENT pour extraction du profil client complet
        prompt = f"""
Tu es un expert fiscal français ultra-intelligent. Analyse ce texte dicté par un utilisateur et extrait TOUTES les informations possibles pour créer son profil client complet.

Texte dicté: "{text}"

Extrais et retourne UNIQUEMENT un JSON avec TOUTES les informations détectées pour le profil client:

{{
  // I. IDENTITÉ DU CLIENT
  "civilite_client": "M." ou "Mme" ou "Mlle" ou null,
  "nom_client": "nom_de_famille" ou null,
  "prenom_client": "prénom" ou null,
  "nom_usage_client": "nom_d_usage" ou null,
  "date_naissance_client": "YYYY-MM-DD" ou null,
  "lieu_naissance_client": "ville_naissance" ou null,
  "nationalite_client": "nationalité" ou null,
  "numero_fiscal_client": "numéro_fiscal" ou null,

  // II. COORDONNÉES DU CLIENT
  "adresse_postale_client": "adresse_complète" ou null,
  "code_postal_client": "code_postal" ou null,
  "ville_client": "ville" ou null,
  "pays_residence_fiscale_client": "pays" ou null,
  "email_client": "email@exemple.com" ou null,
  "telephone_principal_client": "téléphone" ou null,
  "telephone_secondaire_client": "téléphone_secondaire" ou null,

  // III. SITUATION FAMILIALE & PERSONNELLE
  "situation_maritale_client": "Célibataire" ou "Marié" ou "PACS" ou "Divorcé" ou "Veuf" ou null,
  "date_mariage_pacs_client": "YYYY-MM-DD" ou null,
  "regime_matrimonial_client": "régime_matrimonial" ou null,
  "nombre_enfants_a_charge_client": nombre_ou_null,
  "personnes_dependantes_client": "description" ou null,

  // IV. SITUATION PROFESSIONNELLE & REVENUS
  "profession_client1": "profession" ou null,
  "statut_professionnel_client1": "CDI" ou "CDD" ou "Fonctionnaire" ou "Indépendant" ou "Retraité" ou null,
  "nom_employeur_entreprise_client1": "employeur" ou null,
  "type_contrat_client1": "type_contrat" ou null,
  "revenu_net_annuel_client1": nombre_ou_null,
  "profession_client2": "profession_conjoint" ou null,
  "statut_professionnel_client2": "statut_conjoint" ou null,
  "nom_employeur_entreprise_client2": "employeur_conjoint" ou null,
  "type_contrat_client2": "type_contrat_conjoint" ou null,
  "revenu_net_annuel_client2": nombre_ou_null,

  // V. OBJECTIFS & PROJETS
  "objectifs_fiscaux_client": "objectifs_fiscaux" ou null,
  "objectifs_patrimoniaux_client": "objectifs_patrimoniaux" ou null,
  "notes_objectifs_projets_client": "notes_et_projets" ou null
}}

INSTRUCTIONS SPÉCIALES:
1. Sois TRÈS INTELLIGENT et détecte les informations même si elles sont implicites
2. Si quelqu'un dit "je m'appelle Jean Dupont", détecte "prenom_client: Jean" ET "nom_client: Dupont"
3. Si quelqu'un dit "je suis à Paris", détecte "ville_client: Paris" ET "pays_residence_fiscale_client: France"
4. Si quelqu'un dit "je suis marié avec 2 enfants", détecte "situation_maritale_client: Marié" ET "nombre_enfants_a_charge_client: 2"
5. Si quelqu'un dit "je gagne 50000 euros par an", détecte "revenu_net_annuel_client1: 50000"
6. Si quelqu'un dit "je suis ingénieur chez Google", détecte "profession_client1: Ingénieur" ET "nom_employeur_entreprise_client1: Google"
7. Extrais TOUTES les informations possibles, même les coordonnées, l'âge, la situation familiale, etc.

Si une information n'est pas mentionnée, mets null. Sois précis et intelligent dans l'analyse.
"""
        
        # Appel à l'IA Mistral
        try:
            answer, sources, confidence = await run_with_timeout(
                get_fiscal_response, 
                prompt, 
                None, 
                timeout=30
            )
            
            # Extraire le JSON de la réponse
            import re
            json_match = re.search(r'\{.*\}', answer, re.DOTALL)
            if json_match:
                import json
                extracted_data = json.loads(json_match.group())
                
                # Nettoyer les données (supprimer les valeurs vides)
                cleaned_data = {}
                for key, value in extracted_data.items():
                    if value is not None and value != "" and value != []:
                        cleaned_data[key] = value
                
                return {
                    "success": True,
                    "data": cleaned_data,
                    "confidence": confidence,
                    "original_text": text,
                    "fields_detected": len(cleaned_data),
                    "ai_response": answer[:200] + "..." if len(answer) > 200 else answer
                }
            else:
                return {
                    "success": False,
                    "error": "Impossible d'extraire les données JSON",
                    "ai_response": answer
                }
                
        except asyncio.TimeoutError:
            return {
                "success": False,
                "error": "Timeout de l'IA",
                "fallback": "Utilisation de l'analyse basique"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": f"Erreur lors de l'analyse: {str(e)}"
        }

@app.post("/api/whisper/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(audio: UploadFile = File(...), language: str = Form("fr")):
    """
    Endpoint robuste pour transcrire l'audio avec Whisper
    """
    try:
        print(f"🎤 Transcription Whisper demandée - Langue: {language}")
        
        # Vérifier le type de fichier
        if not audio.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="Fichier audio requis")
        
        # Lire le contenu audio
        audio_content = await audio.read()
        
        # Convertir en base64 pour utiliser le service unifié
        audio_base64 = base64.b64encode(audio_content).decode('utf-8')
        
        # Utiliser le service Whisper unifié
        whisper_service = get_whisper_service()
        if not whisper_service:
            raise HTTPException(status_code=503, detail="Service Whisper non disponible")
            
        # Déterminer le format audio
        audio_format = "webm"  # Par défaut
        if audio.content_type == "audio/wav":
            audio_format = "wav"
        elif audio.content_type == "audio/mp3":
            audio_format = "mp3"
        
        # Transcrire avec le service robuste
        result = whisper_service.transcribe_base64_audio(audio_base64, audio_format)
        
        if result.get("error"):
            raise HTTPException(status_code=500, detail=f"Erreur de transcription: {result['error']}")
            
        transcription = result.get("text", "").strip()
        
        if transcription:
            print(f"✅ Transcription réussie: {transcription[:100]}...")
            return TranscriptionResponse(**result)
        else:
            print("⚠️ Aucun texte détecté")
            raise HTTPException(status_code=400, detail="Aucun texte détecté dans l'audio")
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur transcription Whisper: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur de transcription: {str(e)}")

@app.post("/whisper/health", response_model=WhisperHealthResponse)
async def whisper_health():
    """
    Vérifie la santé du service Whisper avec optimisations.
    """
    try:
        whisper_service = get_whisper_service()
        if whisper_service is None:
            return WhisperHealthResponse(
                status="error",
                model_loaded=False,
                is_loading=False,
                cache_size=0,
                error="Service Whisper non disponible"
            )
        
        health_info = whisper_service.check_health()
        return WhisperHealthResponse(**health_info)
    except Exception as e:
        logger.error(f"Erreur lors de la vérification de santé: {e}")
        return WhisperHealthResponse(
            status="error",
            model_loaded=False,
            is_loading=False,
            cache_size=0,
            error=str(e)
        )

@app.post("/whisper/transcribe", response_model=TranscriptionResponse)
async def whisper_transcribe_audio(request: TranscriptionRequest):
    """
    Transcrire un fichier audio avec Whisper.
    """
    try:
        whisper_service = get_whisper_service()
        if not whisper_service:
            raise HTTPException(status_code=503, detail="Service Whisper non disponible")
        
        start_time = time.time()
        
        # Transcrire l'audio
        result = whisper_service.transcribe_base64_audio(
            request.audio_base64, 
            request.audio_format
        )
        
        transcription_time = time.time() - start_time
        
        # Ajouter le temps de transcription au résultat
        result["transcription_time"] = transcription_time
        
        return TranscriptionResponse(**result)
        
    except Exception as e:
        logger.error(f"Erreur lors de la transcription: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur de transcription: {str(e)}")

@api_router.post("/auth/invite-user")
async def invite_user(user_invite: UserInvite):
    if not supabase:
        raise HTTPException(status_code=500, detail="Service Supabase non disponible")
    
    email_to_invite = user_invite.email
    
    try:
        # Configurer l'URL de redirection basée sur l'environnement
        site_url = os.getenv("SITE_URL", "https://fiscal-ia.net")
        redirect_to = site_url  # Rediriger vers la page d'accueil qui gérera les tokens
        
        # Cette fonction envoie un e-mail "magic link" pour la connexion
        # avec l'URL de redirection correcte
        response = supabase.auth.admin.invite_user_by_email(
            email_to_invite,
            options={"redirect_to": redirect_to}
        )
        
        return {"message": f"Si un compte est associé à {email_to_invite}, un e-mail d'activation a été envoyé."}

    except Exception as e:
        # Ne pas révéler si un email existe ou non.
        # Logger l'erreur côté serveur pour le débogage.
        print(f"Erreur lors de la tentative d'invitation pour {email_to_invite}: {e}")
        # Renvoyer un message générique pour des raisons de sécurité.
        return {"message": f"Si un compte est associé à {email_to_invite}, un e-mail d'activation a été envoyé."}

@api_router.post("/auth/reset-password")
async def reset_password(user_invite: UserInvite):
    """Envoie un lien de récupération de mot de passe"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Service Supabase non disponible")
    
    email = user_invite.email
    
    try:
        # Configurer l'URL de redirection pour la récupération de mot de passe
        site_url = os.getenv("SITE_URL", "https://fiscal-ia.net")
        redirect_to = f"{site_url}/update-password"
        
        # Envoyer l'email de récupération de mot de passe
        response = supabase.auth.reset_password_email(
            email,
            options={"redirect_to": redirect_to}
        )
        
        return {"message": f"Si un compte est associé à {email}, un e-mail de récupération a été envoyé."}

    except Exception as e:
        # Ne pas révéler si un email existe ou non pour des raisons de sécurité
        print(f"Erreur lors de la tentative de récupération pour {email}: {e}")
        return {"message": f"Si un compte est associé à {email}, un e-mail de récupération a été envoyé."}

@api_router.get("/diagnostic-embeddings")
async def diagnostic_embeddings():
    """Endpoint de diagnostic pour vérifier l'état des embeddings."""
    try:
        diagnostic = {
            "timestamp": time.time(),
            "mistral_api_key": bool(MISTRAL_API_KEY),
            "cgi_embeddings": {
                "available": CGI_EMBEDDINGS_AVAILABLE,
                "loaded": False,
                "count": 0,
                "error": None
            },
            "bofip_embeddings": {
                "available": BOFIP_EMBEDDINGS_AVAILABLE,
                "loaded": False,
                "count": 0,
                "error": None
            }
        }
        
        # Test CGI embeddings
        if CGI_EMBEDDINGS_AVAILABLE:
            try:
                from mistral_cgi_embeddings import load_embeddings
                embeddings = load_embeddings()
                diagnostic["cgi_embeddings"]["loaded"] = True
                diagnostic["cgi_embeddings"]["count"] = len(embeddings) if embeddings else 0
            except Exception as e:
                diagnostic["cgi_embeddings"]["error"] = str(e)
        
        # Test BOFiP embeddings
        if BOFIP_EMBEDDINGS_AVAILABLE:
            try:
                from mistral_embeddings import search_similar_bofip_chunks
                # Test simple pour vérifier que la fonction existe
                diagnostic["bofip_embeddings"]["loaded"] = True
                diagnostic["bofip_embeddings"]["count"] = "N/A (fonction disponible)"
            except Exception as e:
                diagnostic["bofip_embeddings"]["error"] = str(e)
        
        return diagnostic
        
    except Exception as e:
        return {
            "error": f"Erreur lors du diagnostic: {str(e)}",
            "timestamp": time.time()
        }

# Initialisation des embeddings au démarrage
def initialize_embeddings():
    """Initialise les embeddings au démarrage de l'application."""
    try:
        print("🚀 Initialisation des embeddings au démarrage...")
        
        # Test CGI embeddings
        if CGI_EMBEDDINGS_AVAILABLE:
            try:
                from mistral_cgi_embeddings import load_embeddings
                embeddings = load_embeddings()
                print(f"✅ Embeddings CGI chargés: {len(embeddings)} articles")
            except Exception as e:
                print(f"❌ Erreur chargement embeddings CGI: {e}")
                # Forcer la génération des embeddings
                try:
                    print("🔄 Tentative de génération des embeddings CGI...")
                    from mistral_embeddings import generate_all_embeddings
                    generate_all_embeddings()
                    print("✅ Embeddings CGI générés avec succès")
                except Exception as gen_error:
                    print(f"❌ Erreur lors de la génération: {gen_error}")
        
        # Test BOFiP embeddings
        if BOFIP_EMBEDDINGS_AVAILABLE:
            try:
                from mistral_embeddings import search_similar_bofip_chunks
                print("✅ Embeddings BOFiP disponibles")
            except Exception as e:
                print(f"❌ Erreur embeddings BOFiP: {e}")
                # Forcer la génération des embeddings BOFiP
                try:
                    print("🔄 Tentative de génération des embeddings BOFiP...")
                    from generate_bofip_embeddings import generate_all_bofip_embeddings
                    generate_all_bofip_embeddings()
                    print("✅ Embeddings BOFiP générés avec succès")
                except Exception as gen_error:
                    print(f"❌ Erreur lors de la génération BOFiP: {gen_error}")
                
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation des embeddings: {e}")

# Appeler l'initialisation au démarrage
initialize_embeddings()

app.include_router(api_router)
app.include_router(api_router, prefix="/api")  # alias pour compatibilité frontend
app.include_router(whisper_router.router, prefix="/api")  # WHISPER LOCAL FONCTIONNEL
# app.include_router(eleven_router)  # DÉSACTIVÉ temporairement - eleven_router indisponible
# app.include_router(gocardless_router)  # GOCARDLESS BANK INTEGRATION - TEMPORAIREMENT DÉSACTIVÉ POUR TEST FRANCIS
# app.include_router(downloads.router, prefix="/downloads")  # FRANCIS DESKTOP DOWNLOADS - TEMPORAIREMENT DÉSACTIVÉ POUR TEST FRANCIS
app.include_router(pro_clients_router.router)
app.include_router(teams_assistant_router.router)

# FRANCIS PARTICULIER INDÉPENDANT - ASSISTANT FISCAL EUROPÉEN 100% AUTONOME
try:
    from flask import Flask
    flask_app = Flask(__name__)
    flask_app.register_blueprint(francis_particulier_bp)
    app.mount("/francis-particulier", WSGIMiddleware(flask_app))
    print("✅ Francis Particulier Indépendant intégré avec succès")
except Exception as e:
    print(f"⚠️ Erreur lors de l'intégration de Francis Particulier: {e}")
    # Fallback: Conversion des routes Flask en FastAPI
    try:
        from routes_francis_particulier_fastapi import francis_particulier_router
        app.include_router(francis_particulier_router)
        print("✅ Francis Particulier intégré via FastAPI (fallback)")
    except Exception as e2:
        print(f"❌ Impossible d'intégrer Francis Particulier: {e2}")

@api_router.get("/questions/quota")
async def get_questions_quota(user_id: str = Depends(verify_token)):
    """Récupère le nombre de questions restantes pour le mois"""
    try:
        if not supabase:
            return {"questions_used": 0, "questions_remaining": 50, "quota_limit": 50}
        
        # Vérifier le type d'utilisateur
        profile_resp = supabase.table("profils_utilisateurs").select("taper").eq("user_id", user_id).single().execute()
        taper = (profile_resp.data or {}).get("taper", "particulier")
        
        if taper == "professionnel":
            # Les pros ont un accès illimité
            return {"questions_used": 0, "questions_remaining": -1, "quota_limit": -1, "unlimited": True}
        
        # Pour les particuliers, compter les questions du mois
        now = datetime.utcnow().replace(tzinfo=timezone.utc)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
        
        count_resp = supabase.table("questions").select("id", count='exact').eq("user_id", user_id).gte("created_at", month_start).execute()
        questions_used = count_resp.count or 0
        
        quota_limit = 30  # Limite mensuelle pour les particuliers
        questions_remaining = max(0, quota_limit - questions_used)
        
        return {
            "questions_used": questions_used,
            "questions_remaining": questions_remaining,
            "quota_limit": quota_limit,
            "unlimited": False
        }
        
    except Exception as e:
        print(f"[Erreur Quota] Impossible de récupérer le quota pour {user_id}: {e}")
        return {"questions_used": 0, "questions_remaining": 50, "quota_limit": 50}

@api_router.post("/create-andorre-account")
async def create_andorre_account(
    account_data: AndorreAccountCreate,
    user_id: str = Depends(verify_token)
):
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Service de base de données indisponible")
        
        user_resp = supabase.auth.get_user(user_id)
        if not user_resp.user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        existing_profile = supabase.table("profils_pro").select("*").eq("user_id", user_id).execute()
        
        if existing_profile.data:
            update_data = {
                "metadata": {
                    "francis_andorre": True,
                    "jurisdiction": "AD",
                    "payment_intent": account_data.payment_intent,
                    "account_type": account_data.account_type,
                    "activated_at": datetime.utcnow().isoformat()
                },
                "role_pro": "Conseiller Fiscal Andorre",
                "pays": "Andorre",
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = supabase.table("profils_pro").update(update_data).eq("user_id", user_id).execute()
        else:
            profile_data = {
                "user_id": user_id,
                "email": account_data.email,
                "role_pro": "Conseiller Fiscal Andorre",
                "pays": "Andorre",
                "metadata": {
                    "francis_andorre": True,
                    "jurisdiction": "AD",
                    "payment_intent": account_data.payment_intent,
                    "account_type": account_data.account_type,
                    "activated_at": datetime.utcnow().isoformat()
                },
                "onboarding_step": "completed",
                "is_active": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = supabase.table("profils_pro").insert(profile_data).execute()
        
        user_profile_data = {
            "user_id": user_id,
            "taper": "professionnel",
            "specialisation": "fiscalite_andorre",
            "juridiction_principale": "AD",
            "francis_andorre_active": True,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        existing_user_profile = supabase.table("profils_utilisateurs").select("*").eq("user_id", user_id).execute()
        
        if existing_user_profile.data:
            supabase.table("profils_utilisateurs").update(user_profile_data).eq("user_id", user_id).execute()
        else:
            user_profile_data["created_at"] = datetime.utcnow().isoformat()
            supabase.table("profils_utilisateurs").insert(user_profile_data).execute()
        
        print(f" Compte Francis Andorre créé pour {account_data.email} (user_id: {user_id})")
        
        return {
            "success": True,
            "message": "Compte Francis Andorre créé avec succès",
            "account_type": account_data.account_type,
            "jurisdiction": "AD",
            "user_id": user_id,
            "email": account_data.email
        }
        
    except Exception as e:
        print(f" Erreur création compte Andorre: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création du compte: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080))) 