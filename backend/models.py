from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
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
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(Text, nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 

class UserProfile(Base):
    __tablename__ = 'user_profiles'

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
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

    def __repr__(self):
        return f"<UserProfile(id={self.id}, auth_user_id={self.auth_user_id}, tmi={self.tmi})>" 