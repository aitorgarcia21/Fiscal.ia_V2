from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from supabase import create_client, Client
from passlib.context import CryptContext
import os
from datetime import datetime, timedelta

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-very-secret-key-that-should-be-long-and-random") # Assurez-vous que c'est le même que dans main.py ou via .env
JWT_ALGORITHM = "HS256" # Assurez-vous que c'est le même
JWT_EXPIRATION_HOURS = 24 # Assurez-vous que c'est le même

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

# Supabase client
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized in dependencies.py.")
    except Exception as e:
        print(f"❌ ERROR initializing Supabase client in dependencies.py: {e}")
else:
    print("⚠️ WARNING: SUPABASE_URL or SUPABASE_KEY is not set. Supabase client not initialized in dependencies.py.")

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Token Handling
security_bearer = HTTPBearer()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security_bearer)):
    if not JWT_SECRET:
        print("❌ ERROR: JWT_SECRET is not configured in dependencies.py.")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Configuration de sécurité incomplète.")
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide : identifiant utilisateur manquant.")
        return user_id
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide ou expiré.")
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erreur interne lors de la vérification du token.") 