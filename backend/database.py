from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from sqlalchemy.sql import func
import sys
from sqlalchemy.ext.declarative import declarative_base
# Importer la nouvelle Base pour les modèles Pro - Inutile ici si create_all est dans main.py
# from .models_pro import BasePro

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DATABASE_PY_LOG: DATABASE_URL lue depuis os.getenv: {DATABASE_URL}", file=sys.stderr)

if DATABASE_URL:
    print(f"DATABASE_PY_LOG: DATABASE_URL non vide détectée: {DATABASE_URL}", file=sys.stderr)
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
        print(f"DATABASE_PY_LOG: DATABASE_URL modifiée (était postgres://): {DATABASE_URL}", file=sys.stderr)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
        print(f"DATABASE_PY_LOG: DATABASE_URL modifiée (était postgresql://): {DATABASE_URL}", file=sys.stderr)
    else:
        print(f"DATABASE_PY_LOG: DATABASE_URL ne commence ni par postgres:// ni par postgresql://. Utilisation telle quelle: {DATABASE_URL}", file=sys.stderr)
    
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    # Base = declarative_base() # Supprimé - Base est définie dans models.py
else:
    print(f"DATABASE_PY_LOG: DATABASE_URL est VIDE ou None. Passage à SQLite.", file=sys.stderr)
    SQLITE_DATABASE_URL = "sqlite:///./fiscal_app.db"
    engine = create_engine(SQLITE_DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    # Base = declarative_base() # Supprimé - Base est définie dans models.py

# Ajout de la définition de Base ici pour résoudre l'ImportError
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