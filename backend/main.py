from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any, Generator
import os
import json
from datetime import datetime, timedelta
import uuid
import asyncio
import httpx
from supabase import create_client, Client
import stripe
from passlib.context import CryptContext
from jose import JWTError, jwt
from assistant_fiscal_simple import get_fiscal_response, get_fiscal_response_stream, search_cgi_embeddings
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from fastapi.middleware.wsgi import WSGIMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import APIRouter
import concurrent.futures
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base, get_db as get_db_session
from models import UserProfile
from models_pro import BasePro
from routers import pro_clients as pro_clients_router
from dependencies import supabase, verify_token, create_access_token, hash_password, verify_password
import re
import sys

# Configuration
APP_ENV = os.getenv("APP_ENV", "production")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

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

# Mistral
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise ValueError("MISTRAL_API_KEY doit être défini dans les variables d'environnement pour que l'application fonctionne.")
mistral_client = MistralClient(api_key=MISTRAL_API_KEY)

app = FastAPI(
    title="Fiscal.ia API",
    description="API pour l'assistant fiscal intelligent",
    version="1.0.0"
)

if APP_ENV == "production":
    allowed_cors_origins = ["https://fiscal-ia.net"]
else:
    allowed_cors_origins = ["http://localhost:3000", "http://127.0.0.1:3000", "https://fiscal-ia.net"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

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

def clean_markdown_formatting(text: str) -> str:
    text = text.replace('*', '') if text else text
    if not text:
        return text
    text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
    text = text.replace('**', '').replace('*', '')
    text = re.sub(r'^\s*-\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+\.\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s+', ' ', text)
    return text

@api_router.post("/test-francis")
async def test_francis(request: dict):
    try:
        if not MISTRAL_API_KEY:
            return {
                "error": "Service Mistral non disponible", 
                "details": "MISTRAL_API_KEY non configurée",
                "railway_help": "Configurez MISTRAL_API_KEY dans les variables d'environnement Railway"
            }
        question = request.get("question", "")
        if not question:
            return {"error": "Question manquante", "example": "Posez une question fiscale à Francis"}
        conversation_history = request.get("conversation_history", None)
        try:
            answer, sources, confidence = await run_with_timeout(get_fiscal_response, question, conversation_history, timeout=30)
            answer = clean_markdown_formatting(answer)
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
            fallback_answer = clean_markdown_formatting(fallback_answer)
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
    return StreamingResponse(
        get_fiscal_response_stream(question, conversation_history),
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

class QuestionResponse(BaseModel):
    answer: str
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

# Utils
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
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
        conversation_history_dicts = None
        if request.conversation_history:
            conversation_history_dicts = [
                {"role": msg.role, "content": msg.content} 
                for msg in request.conversation_history
            ]
        answer, sources, confidence = get_fiscal_response(
            request.question, 
            conversation_history_dicts, 
            request.user_profile_context
        )
        answer = clean_markdown_formatting(answer)
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
                pass 
        return QuestionResponse(
            answer=answer,
            sources=sources,
            confidence=confidence
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne du serveur lors du traitement de la question.")

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
        file_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1]
        storage_path = f"documents/{user_id}/{file_id}.{file_extension}"
        if supabase:
            try:
                response = supabase.storage.from_("documents").upload(storage_path, content)
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
                    "message": "Document uploadé avec succès"
                }
            except Exception as e:
                pass
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
        return {"received": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

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

app.include_router(api_router)
app.include_router(pro_clients_router.router)

@app.on_event("startup")
async def startup_event():
    try:
        print("🚀 Préchargement des embeddings CGI...")
        search_cgi_embeddings("test", max_results=1)
        print("✅ Embeddings CGI préchargés avec succès!")
    except Exception as e:
        print(f"⚠️  Erreur lors du préchargement des embeddings: {e}", file=sys.stderr)
        pass

print("MAIN_PY_LOG: Tentative de création des tables via Base.metadata.create_all()", file=sys.stderr)
Base.metadata.create_all(bind=engine) 
BasePro.metadata.create_all(bind=engine)

def clean_user_profile_response(profile: UserProfileResponse) -> UserProfileResponse:
    profile.situation_familiale = clean_markdown_formatting(profile.situation_familiale) if profile.situation_familiale else None
    return profile

@app.post("/user-profile/", response_model=UserProfileResponse)
def create_user_profile(user_profile_data: UserProfileCreate, db: Session = Depends(get_db_session)):
    # Vérifier si un profil existe déjà pour cet auth_user_id
    existing_profile = db.query(UserProfile).filter(UserProfile.auth_user_id == user_profile_data.auth_user_id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail=f"Un profil pour l'utilisateur avec auth_id {user_profile_data.auth_user_id} existe déjà.")
    
    # Créer l'instance UserProfile. user_profile_data contient auth_user_id.
    # Si user_profile_data.user_id (Integer) est fourni, il sera utilisé pour la FK.
    # Sinon, UserProfile.user_id (Integer) sera NULL (car nullable=True dans le modèle).
    db_user_profile = UserProfile(**user_profile_data.model_dump())
    db.add(db_user_profile)
    db.commit()
    db.refresh(db_user_profile)
    
    response_data = {**db_user_profile.__dict__}
    response_data.pop('_sa_instance_state', None)
    # Assurer que auth_user_id est bien une chaîne dans la réponse si ce n'est pas déjà le cas
    response_data['auth_user_id'] = str(db_user_profile.auth_user_id)
    response = UserProfileResponse(**response_data)
    return clean_user_profile_response(response)

@app.get("/user-profile/{auth_user_id}", response_model=UserProfileResponse) # Paramètre de chemin changé en auth_user_id: str
def read_user_profile(auth_user_id: str, db: Session = Depends(get_db_session)):
    db_user_profile = db.query(UserProfile).filter(UserProfile.auth_user_id == auth_user_id).first()
    if db_user_profile is None:
        raise HTTPException(status_code=404, detail=f"Profil utilisateur avec auth_id {auth_user_id} non trouvé")
    
    response_data = {**db_user_profile.__dict__}
    response_data.pop('_sa_instance_state', None)
    response_data['auth_user_id'] = str(db_user_profile.auth_user_id)
    response = UserProfileResponse(**response_data)
    return clean_user_profile_response(response)

@app.put("/user-profile/{auth_user_id}", response_model=UserProfileResponse) # Paramètre de chemin changé
def update_user_profile(auth_user_id: str, user_profile_update_data: UserProfileCreate, db: Session = Depends(get_db_session)):
    db_user_profile = db.query(UserProfile).filter(UserProfile.auth_user_id == auth_user_id).first()
    if db_user_profile is None:
        # Option: créer le profil s'il n'existe pas (comportement PUT)
        # Pour cela, il faudrait s'assurer que user_profile_update_data.auth_user_id est bien auth_user_id du path
        # ou si l'auth_user_id du payload est différent de celui du path (déjà vérifié plus haut si on crée)
        # Pour l'instant, suivons le comportement strict : lever 404 si non trouvé
        raise HTTPException(status_code=404, detail=f"Profil utilisateur avec auth_id {auth_user_id} non trouvé. Utilisez POST pour créer un nouveau profil.")

    update_data = user_profile_update_data.model_dump(exclude_unset=True)
    # S'assurer de ne pas essayer de mettre à jour auth_user_id via le payload si ce n'est pas l'intention
    # ou si l'auth_user_id du payload est différent de celui du path (déjà vérifié plus haut si on crée)
    update_data.pop('auth_user_id', None) # On ne modifie pas l'auth_user_id via un PUT sur cette ressource
    update_data.pop('user_id', None) # Idem pour l'ID entier, sa gestion est plus complexe

    for key, value in update_data.items():
        setattr(db_user_profile, key, value)
    
    db.commit()
    db.refresh(db_user_profile)
    
    response_data = {**db_user_profile.__dict__}
    response_data.pop('_sa_instance_state', None)
    response_data['auth_user_id'] = str(db_user_profile.auth_user_id)
    response = UserProfileResponse(**response_data)
    return clean_user_profile_response(response)

@app.delete("/user-profile/{auth_user_id}", response_model=UserProfileResponse) # Paramètre de chemin changé
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080))) 