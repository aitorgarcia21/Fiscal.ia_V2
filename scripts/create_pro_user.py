#!/usr/bin/env python3
"""
Script pour créer un nouvel utilisateur professionnel
Usage: python create_pro_user.py <email> <password> <full_name>
"""

import sys
import requests
import json
from typing import Optional

def create_professional_user(email: str, password: str, full_name: str, api_url: str = "https://fiscal-ia-backend-production.up.railway.app") -> Optional[dict]:
    """
    Crée un nouvel utilisateur professionnel via l'API
    """
    try:
        # Données pour l'inscription
        user_data = {
            "email": email,
            "password": password,
            "full_name": full_name,
            "account_type": "professionnel"
        }
        
        # Appel à l'API d'inscription
        response = requests.post(
            f"{api_url}/api/auth/register",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Utilisateur professionnel créé avec succès!")
            print(f"📧 Email: {email}")
            print(f"👤 Nom: {full_name}")
            print(f"🔑 Type: professionnel")
            print(f"🆔 User ID: {result.get('user', {}).get('id', 'N/A')}")
            return result
        else:
            print(f"❌ Erreur lors de la création: {response.status_code}")
            print(f"📝 Détails: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        return None

def verify_user_creation(email: str, api_url: str = "https://fiscal-ia-backend-production.up.railway.app") -> bool:
    """
    Vérifie que l'utilisateur a été créé correctement
    """
    try:
        # Test de connexion
        login_data = {
            "email": email,
            "password": "motdepasse123"  # Utiliser le mot de passe par défaut
        }
        
        response = requests.post(
            f"{api_url}/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            user_type = result.get('user', {}).get('taper', 'inconnu')
            print(f"✅ Vérification réussie - Type d'utilisateur: {user_type}")
            return user_type == 'professionnel'
        else:
            print(f"❌ Erreur lors de la vérification: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur de vérification: {str(e)}")
        return False

def main():
    if len(sys.argv) != 4:
        print("Usage: python create_pro_user.py <email> <password> <full_name>")
        print("Exemple: python create_pro_user.py nouveau.pro@example.com motdepasse123 'Jean Dupont'")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    full_name = sys.argv[3]
    
    print("🚀 Création d'un nouvel utilisateur professionnel...")
    print(f"📧 Email: {email}")
    print(f"👤 Nom: {full_name}")
    print(f"🔑 Type: professionnel")
    print("-" * 50)
    
    # Créer l'utilisateur
    result = create_professional_user(email, password, full_name)
    
    if result:
        print("-" * 50)
        print("🔍 Vérification de la création...")
        
        # Vérifier la création
        if verify_user_creation(email):
            print("✅ Utilisateur professionnel créé et vérifié avec succès!")
            print("\n📋 Informations de connexion:")
            print(f"   URL: https://fiscal-ia-frontend-production.up.railway.app/pro/login")
            print(f"   Email: {email}")
            print(f"   Mot de passe: {password}")
        else:
            print("⚠️  Utilisateur créé mais vérification échouée")
    else:
        print("❌ Échec de la création de l'utilisateur")

if __name__ == "__main__":
    main() 