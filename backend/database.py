from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from sqlalchemy.sql import func
import sys
from sqlalchemy.ext.declarative import declarative_base
from supabase import create_client, Client
# Importer la nouvelle Base pour les modèles Pro - Inutile ici si create_all est dans main.py
# from .models_pro import Base

# Configuration Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Gestion plus souple en environnement de test / développement
if not SUPABASE_URL or not SUPABASE_KEY:
    # On est probablement en environnement local ou CI ; on désactive Supabase.
    print("❌ ERROR initializing Supabase client in database.py: variables manquantes", file=sys.stderr)
    supabase: Client | None = None  # type: ignore
else:
    print(f"DATABASE_PY_LOG: SUPABASE_URL configuré: {SUPABASE_URL}", file=sys.stderr)
    print(
        f"DATABASE_PY_LOG: SUPABASE_KEY configuré: {'*' * len(SUPABASE_KEY) if SUPABASE_KEY else 'Non configuré'}",
        file=sys.stderr,
    )

    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:  # URL invalide ou autre erreur de création
        print(f"❌ ERROR initializing Supabase client in database.py: {e}", file=sys.stderr)
        supabase = None  # type: ignore

# Configuration SQLAlchemy pour Supabase
DATABASE_URL = "postgresql://postgres.lqxfjjtjxktjgpekugtf:21AiPa01....@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"

print(f"DATABASE_PY_LOG: DATABASE_URL construit: {DATABASE_URL.replace('21AiPa01....', '********')}", file=sys.stderr)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Vérifie la connexion avant utilisation
    pool_recycle=3600,   # Recycle les connexions après 1 heure
    pool_size=5,         # Nombre de connexions dans le pool
    max_overflow=10      # Nombre maximum de connexions supplémentaires
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# La fonction create_tables() est supprimée. La création des tables sera gérée dans main.py

# Métadonnées pour les tables
# metadata = MetaData() # Peut être redondant si Base.metadata est utilisé directement

# Fonction pour créer les tables
# def create_tables():
#     # Créer les tables pour les modèles existants (ceux utilisant la Base définie dans ce fichier)
#     if 'Base' in globals() and hasattr(Base, 'metadata'): # Vérifie que Base est bien définie
#         Base.metadata.create_all(bind=engine)
#         print("DATABASE_PY_LOG: Tentative de création des tables pour Base (modèles existants).", file=sys.stderr)
#     else:
#         print("DATABASE_PY_LOG: 'Base' non trouvée ou n'a pas de metadata, tables existantes non créées par database.py.", file=sys.stderr)
#
#     # Créer les tables pour les modèles Pro
#     if 'BasePro' in globals() and hasattr(BasePro, 'metadata'): # Vérifie que BasePro est bien définie
#         BasePro.metadata.create_all(bind=engine)
#         print("DATABASE_PY_LOG: Tentative de création des tables pour BasePro (client_profiles).", file=sys.stderr)
#     else:
#         print("DATABASE_PY_LOG: 'BasePro' non trouvée ou n'a pas de metadata, tables Pro non créées.", file=sys.stderr)

# Au lieu d'une fonction create_tables() séparée, il est courant d'appeler
# create_all() directement après la définition de l'engine et des Bases,
# ou dans un événement startup de FastAPI.
# Pour l'instant, nous laissons create_tables() et elle devra être appelée
# depuis main.py (par exemple, dans un événement startup). 