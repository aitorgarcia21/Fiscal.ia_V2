from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from supabase import create_client, Client
from passlib.context import CryptContext
import os
from datetime import datetime, timedelta

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key") # MODIFIÉ pour correspondre à main.py
JWT_ALGORITHM = "HS256" # Assurez-vous que c'est le même
JWT_EXPIRATION_HOURS = 24 # Assurez-vous que c'est le même

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
# Utiliser la SERVICE_ROLE_KEY pour le backend, beaucoup plus sûr et outrepasse RLS
# Garder ANON_KEY en fallback pour dev local si SERVICE_KEY n'est pas set, mais ce n'est pas idéal.
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

# Supabase client
supabase: Client = None
if SUPABASE_URL:
    key_to_use = SUPABASE_SERVICE_KEY # Priorité à la service key
    if not key_to_use:
        print("⚠️ WARNING: SUPABASE_SERVICE_KEY is not set. Falling back to VITE_SUPABASE_ANON_KEY for Supabase client in dependencies.py. This is not recommended for production writes if RLS is enabled.")
        key_to_use = SUPABASE_ANON_KEY

    if key_to_use:
        try:
            supabase = create_client(SUPABASE_URL, key_to_use)
            if key_to_use == SUPABASE_SERVICE_KEY:
                print("✅ Supabase client initialized with SERVICE_ROLE_KEY in dependencies.py.")
            else:
                print("✅ Supabase client initialized with ANON_KEY in dependencies.py (fallback).")
        except Exception as e:
            print(f"❌ ERROR initializing Supabase client in dependencies.py: {e}")
    else:
        print("❌ ERROR: No Supabase key found (SUPABASE_SERVICE_KEY or VITE_SUPABASE_ANON_KEY). Supabase client not initialized in dependencies.py.")
else:
    print("❌ ERROR: SUPABASE_URL is not set. Supabase client not initialized in dependencies.py.")

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