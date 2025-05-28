from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
import os
import json
from datetime import datetime, timedelta
import uuid
import asyncio
import httpx
from supabase import create_client, Client
import openai
import stripe
from passlib.context import CryptContext
from jose import JWTError, jwt

# Configuration
APP_ENV = os.getenv("APP_ENV", "production")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Supabase
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

# OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# FastAPI app
app = FastAPI(
    title="Fiscal.ia API",
    description="API pour l'assistant fiscal intelligent",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, remplace par ton domaine
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

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

class QuestionRequest(BaseModel):
    question: str
    context: Optional[str] = None

class QuestionResponse(BaseModel):
    answer: str
    sources: List[str]
    confidence: float

class PaymentRequest(BaseModel):
    amount: int
    currency: str = "eur"
    payment_method: str

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
@app.get("/")
async def root():
    return {
        "message": "Fiscal.ia API",
        "version": "1.0.0",
        "status": "running",
        "env": APP_ENV
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "supabase": bool(supabase),
            "openai": bool(openai.api_key),
            "stripe": bool(stripe.api_key)
        }
    }

@app.post("/auth/register", response_model=Dict[str, Any])
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

@app.post("/auth/login", response_model=Dict[str, Any])
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

@app.get("/auth/me", response_model=Dict[str, Any])
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

@app.post("/ask", response_model=QuestionResponse)
async def ask_question(
    request: QuestionRequest,
    user_id: str = Depends(verify_token)
):
    try:
        if not openai.api_key:
            raise HTTPException(status_code=500, detail="Service OpenAI non disponible")
        
        # Préparer le prompt pour l'IA
        system_prompt = """Tu es un assistant fiscal expert français. 
        Tu aides les utilisateurs avec leurs questions fiscales en te basant sur le Code Général des Impôts français.
        Réponds de manière précise et professionnelle.
        Si tu n'es pas sûr d'une réponse, dis-le clairement."""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.question}
        ]
        
        if request.context:
            messages.insert(-1, {"role": "user", "content": f"Contexte: {request.context}"})
        
        # Appel à OpenAI
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=messages,
            max_tokens=1000,
            temperature=0.7
        )
        
        answer = response.choices[0].message.content
        
        # Sauvegarder la question/réponse en base
        if supabase:
            try:
                supabase.table("questions").insert({
                    "user_id": user_id,
                    "question": request.question,
                    "answer": answer,
                    "context": request.context,
                    "created_at": datetime.utcnow().isoformat()
                }).execute()
            except:
                pass  # Ne pas faire échouer si la sauvegarde échoue
        
        return QuestionResponse(
            answer=answer,
            sources=["Code Général des Impôts", "Documentation fiscale française"],
            confidence=0.9
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement: {str(e)}")

@app.get("/questions/history")
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

@app.post("/payment/create-intent")
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

@app.post("/upload/document")
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
                raise HTTPException(status_code=500, detail=f"Erreur upload: {str(e)}")
        
        return {
            "file_id": file_id,
            "filename": file.filename,
            "message": "Document reçu (stockage non configuré)"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/documents")
async def get_user_documents(user_id: str = Depends(verify_token)):
    try:
        if not supabase:
            return []
        
        response = supabase.table("documents").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return response.data
        
    except Exception as e:
        return []

# Webhook Stripe (optionnel)
@app.post("/webhooks/stripe")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 