#!/usr/bin/env python3
"""
Configuration de la limitation des requêtes pour les utilisateurs particuliers
"""

import os
import sys
from datetime import datetime, timedelta
import json

def create_limitation_middleware():
    """Créer un middleware pour limiter les requêtes"""
    middleware_code = '''
import time
from datetime import datetime, timedelta
from fastapi import HTTPException, Request
from typing import Dict, Optional
import json

# Stockage en mémoire des requêtes (en production, utilisez Redis)
request_counts: Dict[str, Dict] = {}

def check_request_limit(user_id: str, plan_type: str, request_limit: int) -> bool:
    """
    Vérifie si l'utilisateur peut faire une nouvelle requête
    
    Args:
        user_id: ID de l'utilisateur
        plan_type: Type de plan ('particulier' ou 'professionnel')
        request_limit: Limite de requêtes (-1 pour illimité)
    
    Returns:
        bool: True si la requête est autorisée
    """
    if plan_type == 'professionnel' or request_limit == -1:
        return True  # Pas de limitation pour les professionnels
    
    now = datetime.now()
    current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    if user_id not in request_counts:
        request_counts[user_id] = {
            'count': 0,
            'reset_date': current_month
        }
    
    user_data = request_counts[user_id]
    
    # Réinitialiser le compteur si on est dans un nouveau mois
    if now >= user_data['reset_date'] + timedelta(days=32):
        user_data['count'] = 0
        user_data['reset_date'] = current_month
    
    # Vérifier la limite
    if user_data['count'] >= request_limit:
        return False
    
    # Incrémenter le compteur
    user_data['count'] += 1
    return True

def get_remaining_requests(user_id: str) -> int:
    """
    Retourne le nombre de requêtes restantes pour l'utilisateur
    
    Args:
        user_id: ID de l'utilisateur
    
    Returns:
        int: Nombre de requêtes restantes (-1 pour illimité)
    """
    if user_id not in request_counts:
        return 30  # Limite par défaut pour les particuliers
    
    user_data = request_counts[user_id]
    now = datetime.now()
    current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Réinitialiser si nouveau mois
    if now >= user_data['reset_date'] + timedelta(days=32):
        return 30
    
    return max(0, 30 - user_data['count'])

async def request_limitation_middleware(request: Request, call_next):
    """
    Middleware pour limiter les requêtes selon le plan utilisateur
    """
    # Vérifier si c'est une requête vers l'API Francis
    if request.url.path.startswith("/api/francis") or request.url.path.startswith("/api/assistant"):
        # Récupérer l'utilisateur depuis le token (à adapter selon votre auth)
        user_id = request.headers.get("X-User-ID")
        
        if user_id:
            # Récupérer le plan utilisateur depuis la base de données
            # Ici vous devrez adapter selon votre système d'authentification
            plan_type = "particulier"  # À récupérer depuis la DB
            request_limit = 30  # À récupérer depuis la DB
            
            if not check_request_limit(user_id, plan_type, request_limit):
                remaining = get_remaining_requests(user_id)
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "Limite de requêtes atteinte",
                        "message": f"Vous avez atteint votre limite de {request_limit} requêtes ce mois-ci.",
                        "remaining_requests": remaining,
                        "reset_date": (datetime.now().replace(day=1) + timedelta(days=32)).isoformat()
                    }
                )
    
    response = await call_next(request)
    return response
'''
    
    return middleware_code

def create_database_functions():
    """Créer les fonctions SQL pour gérer les limites"""
    sql_functions = '''
-- Fonction pour vérifier les limites de requêtes
CREATE OR REPLACE FUNCTION check_user_request_limit(
    p_user_id UUID,
    p_plan_type TEXT DEFAULT 'particulier'
) RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    request_limit INTEGER;
    current_month DATE;
BEGIN
    -- Déterminer la limite selon le plan
    IF p_plan_type = 'professionnel' THEN
        request_limit := -1; -- Illimité
    ELSE
        request_limit := 30; -- Particulier
    END IF;
    
    -- Si illimité, autoriser
    IF request_limit = -1 THEN
        RETURN TRUE;
    END IF;
    
    -- Obtenir le mois actuel
    current_month := DATE_TRUNC('month', CURRENT_DATE);
    
    -- Compter les requêtes du mois actuel
    SELECT COALESCE(COUNT(*), 0)
    INTO current_count
    FROM user_requests
    WHERE user_id = p_user_id
    AND created_at >= current_month;
    
    -- Vérifier la limite
    RETURN current_count < request_limit;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour incrémenter le compteur de requêtes
CREATE OR REPLACE FUNCTION increment_user_request(
    p_user_id UUID
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_requests (user_id, created_at)
    VALUES (p_user_id, NOW());
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les requêtes restantes
CREATE OR REPLACE FUNCTION get_remaining_requests(
    p_user_id UUID,
    p_plan_type TEXT DEFAULT 'particulier'
) RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
    request_limit INTEGER;
    current_month DATE;
BEGIN
    -- Déterminer la limite selon le plan
    IF p_plan_type = 'professionnel' THEN
        RETURN -1; -- Illimité
    ELSE
        request_limit := 30; -- Particulier
    END IF;
    
    -- Obtenir le mois actuel
    current_month := DATE_TRUNC('month', CURRENT_DATE);
    
    -- Compter les requêtes du mois actuel
    SELECT COALESCE(COUNT(*), 0)
    INTO current_count
    FROM user_requests
    WHERE user_id = p_user_id
    AND created_at >= current_month;
    
    -- Retourner les requêtes restantes
    RETURN GREATEST(0, request_limit - current_count);
END;
$$ LANGUAGE plpgsql;
'''
    
    return sql_functions

def create_migration_file():
    """Créer le fichier de migration pour la table user_requests"""
    migration_content = '''
-- Migration pour ajouter la table user_requests
-- Date: ''' + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + '''

-- Créer la table user_requests
CREATE TABLE IF NOT EXISTS user_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    request_type TEXT DEFAULT 'chat',
    metadata JSONB DEFAULT '{}'
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_requests_user_id ON user_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_requests_created_at ON user_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_user_requests_user_created ON user_requests(user_id, created_at);

-- RLS (Row Level Security)
ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour user_requests
CREATE POLICY "Users can view their own requests" ON user_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own requests" ON user_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ajouter la colonne plan_type à user_profiles si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'plan_type') THEN
        ALTER TABLE user_profiles ADD COLUMN plan_type TEXT DEFAULT 'particulier';
    END IF;
END $$;

-- Ajouter la colonne request_limit à user_profiles si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'request_limit') THEN
        ALTER TABLE user_profiles ADD COLUMN request_limit INTEGER DEFAULT 30;
    END IF;
END $$;
'''
    
    return migration_content

def main():
    """Fonction principale"""
    print("🔧 Configuration de la limitation des requêtes")
    print("=" * 50)
    
    # Créer le middleware
    middleware_file = "backend/request_limitation.py"
    with open(middleware_file, "w") as f:
        f.write(create_limitation_middleware())
    print(f"✅ Middleware créé : {middleware_file}")
    
    # Créer les fonctions SQL
    sql_file = "backend/migrations/add_request_limitation.sql"
    with open(sql_file, "w") as f:
        f.write(create_database_functions())
    print(f"✅ Fonctions SQL créées : {sql_file}")
    
    # Créer la migration
    migration_file = "backend/migrations/create_user_requests_table.sql"
    with open(migration_file, "w") as f:
        f.write(create_migration_file())
    print(f"✅ Migration créée : {migration_file}")
    
    print("\n📋 Configuration terminée !")
    print("\n📝 Actions à effectuer :")
    print("   1. Exécutez la migration SQL sur votre base de données")
    print("   2. Intégrez le middleware dans votre app FastAPI")
    print("   3. Testez la limitation avec un utilisateur particulier")
    print("   4. Vérifiez que les professionnels n'ont pas de limitation")

if __name__ == "__main__":
    main() 