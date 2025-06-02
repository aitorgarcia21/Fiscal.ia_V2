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
from assistant_fiscal_simple import get_fiscal_response, get_fiscal_response_stream
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from fastapi.middleware.wsgi import WSGIMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import APIRouter
import concurrent.futures

# Configuration
APP_ENV = os.getenv("APP_ENV", "production")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Variables d'environnement pour Supabase
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or "https://lqxfjjtjxktjgpekugtf.supabase.co"
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTgyMDMsImV4cCI6MjA2MzM3NDIwM30.-E66kbBxRAVcJcPdhhUJWq5BZB-2GRpiBEaGtiWLVrA"
# print(f"DEBUG: SUPABASE_URL = {SUPABASE_URL}") # NETTOYAGE
# print(f"DEBUG: SUPABASE_KEY IS SET = {bool(SUPABASE_KEY)}") # NETTOYAGE

# Test de connectivité Supabase
# if SUPABASE_URL: # NETTOYAGE - Section entière commentée pour la prod
#     try:
#         print(f"DEBUG: Test de l'API Supabase...")
#         headers = {"apikey": SUPABASE_KEY} if SUPABASE_KEY else {}
#         response = httpx.get(f"{SUPABASE_URL}/rest/v1/", headers=headers, timeout=10.0)
#         print(f"DEBUG: API Supabase - Status: {response.status_code}")
#         
#         if response.status_code == 200:
#             print("✅ Connexion Supabase réussie !")
#         elif response.status_code == 401:
#             print("❌ ERREUR: Clé API Supabase invalide")
#         else:
#             print(f"⚠️  Réponse inattendue de Supabase: {response.status_code}")
#             
#     except Exception as e:
#         print(f"❌ ERREUR de connexion Supabase: {e}")
# else:
#     print("❌ ERREUR: SUPABASE_URL non défini")

# Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# -----------------------------
# TrueLayer Configuration
# -----------------------------
TRUELAYER_CLIENT_ID = os.getenv("TRUELAYER_CLIENT_ID")
TRUELAYER_CLIENT_SECRET = os.getenv("TRUELAYER_CLIENT_SECRET")
TRUELAYER_REDIRECT_URI = os.getenv("TRUELAYER_REDIRECT_URI", "http://localhost:3000/truelayer-callback")
TRUELAYER_ENV = os.getenv("TRUELAYER_ENV", "sandbox")  # 'live' ou 'sandbox'

TRUELAYER_BASE_AUTH_URL = "https://auth.truelayer-sandbox.com" if TRUELAYER_ENV == "sandbox" else "https://auth.truelayer.com"
TRUELAYER_API_URL = "https://api.truelayer-sandbox.com" if TRUELAYER_ENV == "sandbox" else "https://api.truelayer.com"

# -----------------------------

# Mistral
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
# print(f"DEBUG: MISTRAL_API_KEY IS SET = {bool(MISTRAL_API_KEY)}") # NETTOYAGE
if not MISTRAL_API_KEY:
    raise ValueError("MISTRAL_API_KEY doit être défini dans les variables d'environnement pour que l'application fonctionne.")
client = MistralClient(api_key=MISTRAL_API_KEY)

# FastAPI app
app = FastAPI(
    title="Fiscal.ia API",
    description="API pour l'assistant fiscal intelligent",
    version="1.0.0"
)

# ==========================================
# CONFIGURATION CORS - FORCE REBUILD v3.0
# ==========================================
# Configuration CORS complètement refactorisée pour forcer rebuild Railway
# print("🔧 CORS Configuration v3.0 - Rebuild forcé") # NETTOYAGE

# Logique de détermination des origines CORS refactorisée
if APP_ENV == "production":
    # PRODUCTION: Strictement fiscal-ia.net seulement
    allowed_cors_origins = ["https://fiscal-ia.net"]
    # cors_mode = "PRODUCTION_STRICT" # Non utilisé plus loin
    # print(f"🚀 CORS v3.0: Environment={APP_ENV}") # NETTOYAGE
    # print(f"🎯 CORS v3.0: Origins={allowed_cors_origins}") # NETTOYAGE
    # print(f"🔒 CORS v3.0: Mode={cors_mode}") # NETTOYAGE
else:
    # DÉVELOPPEMENT: Mode permissif local + fiscal-ia.net
    allowed_cors_origins = ["http://localhost:3000", "http://127.0.0.1:3000", "https://fiscal-ia.net"]
    # cors_mode = "DEV_PERMISSIVE" # Non utilisé plus loin
    # print(f"🚀 CORS v3.0: Environment={APP_ENV}") # NETTOYAGE
    # print(f"🎯 CORS v3.0: Origins={allowed_cors_origins}") # NETTOYAGE
    # print(f"🔓 CORS v3.0: Mode={cors_mode}") # NETTOYAGE

# Application du middleware CORS refactorisé
# print("🔧 CORS v3.0: Application du middleware...") # NETTOYAGE
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
# print("✅ CORS v3.0: Middleware appliqué avec succès") # NETTOYAGE

# Health check endpoint for Railway deployment
@app.get("/health")
async def health():
    # Simplifié au maximum pour éviter tout problème potentiel
    return {"status": "ok"}

# Mount the API router
api_router = APIRouter(prefix="/api")

# Move all routes to api_router
@api_router.get("/")
async def root():
    return {
        "message": "Fiscal.ia API",
        "version": "1.0.0",
        "status": "running",
        "env": APP_ENV
    }

async def run_with_timeout(func, *args, timeout: int = 10):
    """Exécute une fonction bloquante dans un thread avec timeout asynchrone."""
    loop = asyncio.get_event_loop()
    with concurrent.futures.ThreadPoolExecutor() as pool:
        return await asyncio.wait_for(loop.run_in_executor(pool, func, *args), timeout)

# Test Francis endpoint (no auth required for testing) - RAILWAY ULTRA OPTIMIZED
@api_router.post("/test-francis")
async def test_francis(request: dict):
    # print("[DEBUG] Appel reçu sur /api/test-francis avec payload:", request) # Peut être gardé si utile
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

        # Récupérer l'historique de conversation s'il est fourni
        conversation_history = request.get("conversation_history", None)

        # print(f"🤖 Francis traite la question: {question}") # Peut être gardé
        if conversation_history:
            # print(f"📖 Avec historique de {len(conversation_history)} messages") # Peut être gardé
            pass # Ajout d'un pass pour corriger l'indentation
        
        # RÉPONSES RAPIDES ÉTENDUES pour Railway (éviter tous les timeouts)
        question_lower = question.lower().strip()

        # Les réponses rapides par mots-clés ont été désactivées pour laisser le moteur RAG répondre de manière complète.
        
        # Appel du moteur RAG avec un timeout raisonnable (15 s)
        # print("[RAG] Appel au moteur RAG avec timeout 15 s") # Peut être gardé
        try:
            # Timeout augmenté pour laisser plus de temps au RAG
            answer, sources, confidence = await run_with_timeout(get_fiscal_response, question, conversation_history, timeout=30)
            # print("[SUCCESS] get_fiscal_response terminé sous 30s") # Peut être gardé
            return {
                "answer": answer,
                "sources": sources,
                "confidence": confidence,
                "status": "success_rag",
                "francis_says": "✅ Analyse complète réussie !",
                "memory_active": bool(conversation_history)
            }
        except asyncio.TimeoutError:
            # print("[FALLBACK] Timeout 30s - Réponse de secours") # Peut être gardé
            # Réponse de secours intelligente basée sur le contexte
            fallback_answer = f"Je vais analyser votre question sur '{question}'. Pour un conseil fiscal précis, pouvez-vous me préciser votre situation (salarié, entrepreneur, investisseur) et votre objectif ? Je pourrai alors vous donner une réponse personnalisée et détaillée."
            
            if conversation_history and len(conversation_history) > 1:
                fallback_answer += " Je prends en compte notre échange précédent pour mieux vous accompagner."
            
            return {
                "answer": fallback_answer,
                "sources": ["Expert Francis"],
                "confidence": 0.7,
                "status": "fallback_optimized",
                "francis_says": "🔄 Analyse rapide - posez une question plus précise pour plus de détails",
                "memory_active": bool(conversation_history)
            }
        
    except Exception as e:
        # print(f"❌ Erreur Francis: {str(e)}") # Peut être gardé
        return {
            "error": f"Erreur lors du traitement: {str(e)}",
            "status": "error",
            "railway_status": "Francis rencontre un problème technique",
            "debug_info": str(e)[:200]
        }

# Nouveau endpoint streaming : utilise le système RAG complet avec get_fiscal_response_stream
@api_router.post("/stream-francis-simple")
async def stream_francis_simple(request: dict):
    # print("[DEBUG] Appel RAG sur /api/stream-francis-simple avec payload:", request) # Peut être gardé

    question = request.get("question", "")
    if not question:
        return StreamingResponse(
            (json.dumps({
                "type": "error",
                "message": "Question manquante"
            }) + "\n" for _ in range(1)),
            media_type="text/plain"
        )

    conversation_history = request.get("conversation_history", None)

    # Streaming directement depuis get_fiscal_response_stream
    return StreamingResponse(
        get_fiscal_response_stream(question, conversation_history),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    created_at: datetime

class ChatMessage(BaseModel):
    role: str  # 'user' ou 'assistant'
    content: str

class QuestionRequest(BaseModel):
    question: str
    conversation_history: Optional[List[ChatMessage]] = None

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
            raise HTTPException(status_code=500, detail="Service non disponible")
        
        # Créer l'utilisateur avec Supabase Auth
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": {
                "data": {
                    "full_name": user.full_name
                }
            }
        })
        
        if response.user:
            token = create_access_token({"sub": response.user.id})
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "id": response.user.id,
                    "email": response.user.email,
                    "full_name": user.full_name
                }
            }
        else:
            raise HTTPException(status_code=400, detail="Erreur lors de la création du compte")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/auth/login", response_model=Dict[str, Any])
async def login(user: UserLogin):
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Service non disponible")
        
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        
        if response.user:
            token = create_access_token({"sub": response.user.id})
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "id": response.user.id,
                    "email": response.user.email
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Identifiants invalides")
            
    except Exception as e:
        raise HTTPException(status_code=401, detail="Identifiants invalides")

@api_router.get("/auth/me", response_model=Dict[str, Any])
async def get_current_user(user_id: str = Depends(verify_token)):
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Service non disponible")
        
        response = supabase.auth.get_user()
        if response.user:
            return {
                "id": response.user.id,
                "email": response.user.email,
                "user_metadata": response.user.user_metadata
            }
        else:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/ask", response_model=QuestionResponse)
async def ask_question(
    request: QuestionRequest,
    user_id: str = Depends(verify_token)
):
    try:
        if not MISTRAL_API_KEY:
            raise HTTPException(status_code=500, detail="Service Mistral non disponible")

        # Convertir l'historique de conversation en format dict
        conversation_history = None
        if request.conversation_history:
            conversation_history = [
                {"role": msg.role, "content": msg.content} 
                for msg in request.conversation_history
            ]

        answer, sources, confidence = get_fiscal_response(request.question, conversation_history)
        
        # Sauvegarde en base (optionnel, si vous voulez garder l'historique des questions/réponses)
        if supabase:
            try:
                # Adapter le contexte sauvegardé si nécessaire. Pour l'instant, on peut omettre ou stocker les sources.
                supabase.table("questions").insert({
                    "user_id": user_id,
                    "question": request.question,
                    "answer": answer,
                    "context": json.dumps(sources) if sources else None,  # Stocker les sources en JSON
                    "created_at": datetime.utcnow().isoformat()
                }).execute()
            except Exception as e:
                # print(f"Erreur lors de la sauvegarde de la question en base: {e}") # Peut être gardé
                pass # Ne pas bloquer la réponse à l'utilisateur pour une erreur de sauvegarde

        return QuestionResponse(
            answer=answer,
            sources=sources,
            confidence=confidence
        )

    except Exception as e:
        # Logguer l'erreur côté serveur
        # print(f"Erreur inattendue dans /ask endpoint: {str(e)}") # Peut être gardé
        # Retourner une erreur générique à l'utilisateur
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
        # Vérifier le type de fichier
        allowed_types = ["application/pdf", "image/jpeg", "image/png"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Type de fichier non supporté")
        
        # Lire le contenu du fichier
        content = await file.read()
        
        # Générer un nom unique
        file_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1]
        storage_path = f"documents/{user_id}/{file_id}.{file_extension}"
        
        # Uploader vers Supabase Storage (si configuré)
        if supabase:
            try:
                response = supabase.storage.from_("documents").upload(storage_path, content)
                public_url = supabase.storage.from_("documents").get_public_url(storage_path)
                
                # Sauvegarder les métadonnées en base
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
                # print(f"Erreur lors de la sauvegarde de la question en base: {e}") # Peut être gardé
                pass # Ne pas bloquer la réponse à l'utilisateur pour une erreur de sauvegarde
        
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

# Webhook Stripe (optionnel)
@api_router.post("/webhooks/stripe")
async def stripe_webhook(request: dict):
    try:
        # Traiter les événements Stripe
        event_type = request.get("type")
        
        if event_type == "payment_intent.succeeded":
            payment_intent = request["data"]["object"]
            user_id = payment_intent["metadata"]["user_id"]
            
            # Mettre à jour le statut de l'utilisateur, débloquer des fonctionnalités, etc.
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
    """Échange le code d'autorisation TrueLayer contre un token et renvoie la liste des comptes de l'utilisateur."""
    if not (TRUELAYER_CLIENT_ID and TRUELAYER_CLIENT_SECRET):
        raise HTTPException(status_code=500, detail="TrueLayer n'est pas configuré côté serveur")

    # 1) Échange du code contre un access_token / refresh_token
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
            print("❌ TrueLayer token exchange error: ", token_resp.text)
            raise HTTPException(status_code=400, detail="Échec de l'échange de code TrueLayer")

        token_data = token_resp.json()
        access_token = token_data.get("access_token")

        # 2) Récupération des comptes avec l'access_token
        accounts_resp = await client.get(
            f"{TRUELAYER_API_URL}/data/v1/accounts",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        accounts_data = accounts_resp.json().get("results", []) if accounts_resp.status_code == 200 else []

    # 3) (Optionnel) Sauvegarde en base
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
            # Ne pas bloquer si la table n'existe pas encore
            print("[TrueLayer] Erreur sauvegarde Supabase:", e)
            pass

    return TrueLayerExchangeResponse(
        access_token=access_token,
        refresh_token=token_data.get("refresh_token"),
        expires_in=token_data.get("expires_in", 0),
        token_type=token_data.get("token_type", "Bearer"),
        scope=token_data.get("scope", ""),
        accounts=accounts_data
    )

# Mount the API router finally
app.include_router(api_router)

# Précharger les embeddings CGI au démarrage
@app.on_event("startup")
async def startup_event():
    """Précharge les embeddings CGI au démarrage pour de meilleures performances."""
    try:
        from assistant_fiscal_simple import search_cgi_embeddings
        print("🚀 Préchargement des embeddings CGI...")
        # Faire une recherche bidon pour forcer le chargement du cache
        search_cgi_embeddings("test", max_results=1)
        print("✅ Embeddings CGI préchargés avec succès!")
    except Exception as e:
        print(f"⚠️  Erreur lors du préchargement des embeddings: {e}")
        # On continue même si les embeddings ne se chargent pas

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 