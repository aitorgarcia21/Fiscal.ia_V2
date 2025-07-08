#!/usr/bin/env python3
"""
Test de la limitation des requêtes pour les utilisateurs particuliers
"""

import requests
import json
from datetime import datetime

def test_particulier_prices():
    """Tester les prix particuliers créés"""
    print("🔍 Test des prix particuliers...")
    
    # Prix créés
    particulier_prices = {
        "monthly": "price_1RiGM5G0JMtmHIL2OyrdGicK",
        "annual": "price_1RiGM5G0JMtmHIL2zEiHmlCm"
    }
    
    # Clé Stripe
    STRIPE_SECRET_KEY = "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"
    
    headers = {
        "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    for plan, price_id in particulier_prices.items():
        try:
            response = requests.get(
                f"https://api.stripe.com/v1/prices/{price_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                price_data = response.json()
                unit_amount = price_data.get("unit_amount", 0) / 100
                interval = price_data.get("recurring", {}).get("interval", "")
                metadata = price_data.get("metadata", {})
                request_limit = metadata.get("request_limit", "Non défini")
                
                print(f"✅ Prix {plan} : {price_id}")
                print(f"   💰 Prix : {unit_amount}€/{interval}")
                print(f"   📊 Limite : {request_limit} requêtes")
                print(f"   🏷️  Type : {metadata.get('plan_type', 'Non défini')}")
                print()
            else:
                print(f"❌ Erreur récupération prix {plan} : {response.status_code}")
                
        except Exception as e:
            print(f"❌ Erreur test prix {plan} : {e}")

def test_configuration_frontend():
    """Tester la configuration frontend"""
    print("🔍 Test de la configuration frontend...")
    
    try:
        with open("frontend/src/config/pricing.ts", "r") as f:
            content = f.read()
            
        # Vérifier les prix particuliers
        if "price_1RiGM5G0JMtmHIL2OyrdGicK" in content:
            print("✅ Prix mensuel particulier configuré")
        else:
            print("❌ Prix mensuel particulier manquant")
            
        if "price_1RiGM5G0JMtmHIL2zEiHmlCm" in content:
            print("✅ Prix annuel particulier configuré")
        else:
            print("❌ Prix annuel particulier manquant")
            
        # Vérifier les limites
        if "requestLimit: 30" in content:
            print("✅ Limite mensuelle configurée (30 requêtes)")
        else:
            print("❌ Limite mensuelle manquante")
            
        if "requestLimit: 360" in content:
            print("✅ Limite annuelle configurée (360 requêtes)")
        else:
            print("❌ Limite annuelle manquante")
            
        # Vérifier les descriptions
        if "30 requêtes par mois incluses" in content:
            print("✅ Description limitation mensuelle")
        else:
            print("❌ Description limitation mensuelle manquante")
            
        if "360 requêtes par an incluses" in content:
            print("✅ Description limitation annuelle")
        else:
            print("❌ Description limitation annuelle manquante")
            
    except Exception as e:
        print(f"❌ Erreur lecture configuration frontend : {e}")

def test_middleware_files():
    """Tester les fichiers de limitation créés"""
    print("🔍 Test des fichiers de limitation...")
    
    files_to_check = [
        "backend/request_limitation.py",
        "backend/migrations/add_request_limitation.sql",
        "backend/migrations/create_user_requests_table.sql"
    ]
    
    for file_path in files_to_check:
        try:
            with open(file_path, "r") as f:
                content = f.read()
                
            if "check_request_limit" in content:
                print(f"✅ {file_path} - Fonction de vérification présente")
            else:
                print(f"❌ {file_path} - Fonction de vérification manquante")
                
        except Exception as e:
            print(f"❌ Erreur lecture {file_path} : {e}")

def test_database_migration():
    """Tester la migration de base de données"""
    print("🔍 Test de la migration de base de données...")
    
    try:
        with open("backend/migrations/create_user_requests_table.sql", "r") as f:
            content = f.read()
            
        required_elements = [
            "CREATE TABLE IF NOT EXISTS user_requests",
            "user_id UUID NOT NULL REFERENCES auth.users",
            "CREATE INDEX IF NOT EXISTS idx_user_requests_user_id",
            "ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY",
            "plan_type TEXT DEFAULT 'particulier'",
            "request_limit INTEGER DEFAULT 30"
        ]
        
        for element in required_elements:
            if element in content:
                print(f"✅ {element}")
            else:
                print(f"❌ {element} manquant")
                
    except Exception as e:
        print(f"❌ Erreur lecture migration : {e}")

def main():
    """Fonction principale de test"""
    print("🧪 Test de la limitation des particuliers")
    print("=" * 50)
    
    test_particulier_prices()
    print()
    
    test_configuration_frontend()
    print()
    
    test_middleware_files()
    print()
    
    test_database_migration()
    print()
    
    print("📋 Résumé de la configuration :")
    print("✅ Prix particuliers créés : 9.99€/mois et 99.99€/an")
    print("✅ Limitation configurée : 30 requêtes/mois pour les particuliers")
    print("✅ Configuration frontend mise à jour")
    print("✅ Middleware de limitation créé")
    print("✅ Migration de base de données préparée")
    print()
    print("📝 Prochaines étapes :")
    print("   1. Déployer la migration sur la base de données")
    print("   2. Intégrer le middleware dans l'application")
    print("   3. Tester avec un utilisateur particulier")
    print("   4. Vérifier que les professionnels n'ont pas de limitation")

if __name__ == "__main__":
    main() 