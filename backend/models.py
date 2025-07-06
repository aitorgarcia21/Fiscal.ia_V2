from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    questions = relationship("Question", back_populates="user")
    documents = relationship("Document", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    profile = relationship("UserProfile", back_populates="user", uselist=False)

class Question(Base):
    __tablename__ = "questions"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    context = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    sources = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="questions")

class Document(Base):
    __tablename__ = "documents"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)
    storage_path = Column(String, nullable=False)
    public_url = Column(String, nullable=True)
    processed = Column(Boolean, default=False)
    extracted_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="documents")

class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    payment_intent_id = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)  # En centimes
    currency = Column(String, default="eur")
    status = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="payments")

class Settings(Base):
    __tablename__ = "settings"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(Text, nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 

class UserProfile(Base):
    __tablename__ = 'user_profiles'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=True, index=True)
    
    auth_user_id = Column(String(36), unique=True, index=True, nullable=False)
    
    tmi = Column(Float, nullable=True)
    situation_familiale = Column(String, nullable=True)
    nombre_enfants = Column(Integer, nullable=True)
    residence_principale = Column(Boolean, nullable=True)
    residence_secondaire = Column(Boolean, nullable=True)
    revenus_annuels = Column(Float, nullable=True)
    charges_deductibles = Column(Float, nullable=True)
    
    # Nouveaux champs pour le profiling initial
    activite_principale = Column(String, nullable=True)
    revenus_passifs = Column(Text, nullable=True)  # JSON array as text
    revenus_complementaires = Column(Text, nullable=True)  # JSON array as text
    statuts_juridiques = Column(Text, nullable=True)  # JSON array as text
    pays_residence = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    patrimoine_immobilier = Column(Boolean, nullable=True)
    residence_fiscale = Column(String, nullable=True)
    patrimoine_situation = Column(String, nullable=True)
    has_completed_onboarding = Column(Boolean, default=False)
    
    # Champs détaillés supplémentaires pour le profil complet
    revenus_salaires = Column(Integer, nullable=True)
    revenus_bnc = Column(Integer, nullable=True)
    revenus_bic = Column(Integer, nullable=True)
    revenus_fonciers = Column(Integer, nullable=True)
    plus_values_mobilieres = Column(Integer, nullable=True)
    dividendes_recus = Column(Integer, nullable=True)
    pensions_retraite = Column(Integer, nullable=True)
    patrimoine_immobilier_valeur = Column(Integer, nullable=True)
    emprunts_immobiliers = Column(Integer, nullable=True)
    epargne_disponible = Column(Integer, nullable=True)
    assurance_vie_valeur = Column(Integer, nullable=True)
    pea_valeur = Column(Integer, nullable=True)
    actions_valeur = Column(Integer, nullable=True)
    crypto_valeur = Column(Integer, nullable=True)
    dons_realises = Column(Integer, nullable=True)
    objectifs_fiscaux = Column(Text, nullable=True)  # JSON array as text
    horizon_investissement = Column(String, nullable=True)
    tolerance_risque = Column(String, nullable=True)
    situations_specifiques = Column(Text, nullable=True)  # JSON array as text
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

    def __repr__(self):
        return f"<UserProfile(id={self.id}, auth_user_id={self.auth_user_id}, activite_principale={self.activite_principale})>" 

class RendezVousProfessionnel(Base):
    __tablename__ = 'rendez_vous_professionnels'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_professionnel = Column(String(36), nullable=False)  # UUID de l'utilisateur Supabase
    date_rdv = Column(DateTime, nullable=False)
    duree = Column(Integer, nullable=False)  # Durée en minutes
    type_rdv = Column(String, nullable=False)  # Type de rendez-vous
    statut = Column(String, nullable=False, default='en_attente')  # en_attente, confirmé, annulé
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<RendezVousProfessionnel(id={self.id}, date_rdv={self.date_rdv}, type_rdv={self.type_rdv})>" 