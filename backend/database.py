from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Configuration de la base de données
DATABASE_URL = os.getenv("DATABASE_URL")

# Si on utilise PostgreSQL
if DATABASE_URL:
    # Pour Railway, remplacer postgres:// ou postgresql:// par postgresql+psycopg://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
    
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
else:
    # Configuration par défaut pour SQLite en local
    SQLITE_DATABASE_URL = "sqlite:///./fiscal_app.db"
    engine = create_engine(SQLITE_DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()

# Dependency pour obtenir la session de base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Métadonnées pour les tables
metadata = MetaData()

# Fonction pour créer les tables
def create_tables():
    Base.metadata.create_all(bind=engine) 