#!/usr/bin/env python3
"""
Script simple pour vérifier la configuration Stripe
"""

import os
import sys
import stripe
from datetime import datetime

# Configuration des variables d'environnement pour le test
os.environ.update({
    "MISTRAL_API_KEY": "7P3DuCAQzA2O9AcwQDjmDGLBt7SQp4MU",
    "TRUELAYER_CLIENT_ID": "fiscalia-d5d07d",
    "TRUELAYER_CLIENT_SECRET": "59f122a2-b8d1-491d-b5a3-6d376d295cd9",
    "TRUELAYER_ENV": "live",
    "VITE_API_BASE_URL": "https://fiscal-ia.net",
    "DATABASE_URL": "postgresql://postgres.lqxfjjtjxktjgpekugtf:postgres@aws-0-eu-west-3.pooler.supabase.com:5432/postgres",
    "SUPABASE_URL": "https://lqxfjjtjxktjgpekugtf.supabase.co",
    "SUPABASE_SERVICE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc5ODIwMywiZXhwIjoyMDYzMzc0MjAzfQ.8VWgJlJJGDmziDaRnxY-OedIXMD7DO9xgZsIxcVUVc0",
    "VITE_SUPABASE_URL": "https://lqxfjjtjxktjgpekugtf.supabase.co",
    "VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTgyMDMsImV4cCI6MjA2MzM3NDIwM30.-E66kbBxRAVcJcPdhhUJWq5BZB-2GRpiBEaGtiWLVrA",
    "JWT_SECRET": "e053030378e1f04e54e63def5b884b1ed98bc8c0185d643e451a2c5d15d55b08",
    "STRIPE_ENDPOINT_SECRET": "whsec_2bMwLAHWNeg4qOnU5p17lYBceqAeSkUy",
    "VITE_TRUELAYER_CLIENT_ID": "fiscalia-d5d07d",
    "VITE_TRUELAYER_ENV": "live",
    "TRUELAYER_REDIRECT_URI": "https://fiscal-ia.net/truelayer-callback",
    "ELEVENLABS_API_KEY": "sk_264da6b2834cab0467047726cd9c347d67504cca040d7854",
    "SITE_URL": "https://fiscal-ia.net",
    "LLM_ENDPOINT": "http://llm:11434"
})

def check_stripe_config():
    """Vérifier la configuration Stripe"""
    print("🔍 Vérification de la configuration Stripe...")
    
    # Vérifier la clé secrète Stripe
    stripe_key = os.getenv("STRIPE_SECRET_KEY")
    if not stripe_key:
        print("❌ STRIPE_SECRET_KEY non définie")
        print("   ⚠️  C'EST LA VARIABLE MANQUANTE PRINCIPALE !")
        print("   📝 Actions à effectuer:")
        print("      1. Allez sur https://dashboard.stripe.com/apikeys")
        print("      2. Copiez votre clé secrète (commence par 'sk_test_' ou 'sk_live_')")
        print("      3. Ajoutez-la dans Railway comme variable d'environnement")
        return False
    
    if not stripe_key.startswith("sk_"):
        print("❌ STRIPE_SECRET_KEY invalide (doit commencer par 'sk_')")
        return False
    
    print("✅ STRIPE_SECRET_KEY configurée")
    
    # Tester la connexion Stripe
    try:
        stripe.api_key = stripe_key
        
        # Tester la récupération des prix
        prices = stripe.Price.list(limit=5)
        print(f"✅ Connexion Stripe réussie - {len(prices.data)} prix trouvés")
        
        # Afficher les prix disponibles
        print("\n📋 Prix Stripe disponibles:")
        for price in prices.data:
            print(f"   - {price.id}: {price.unit_amount/100}€/{price.recurring.interval}")
        
        return True
        
    except stripe.error.AuthenticationError:
        print("❌ Erreur d'authentification Stripe - Vérifiez votre clé secrète")
        return False
    except stripe.error.APIConnectionError:
        print("❌ Erreur de connexion à l'API Stripe")
        return False
    except Exception as e:
        print(f"❌ Erreur Stripe: {e}")
        return False

def check_webhook_config():
    """Vérifier la configuration des webhooks"""
    print("\n🔍 Vérification de la configuration des webhooks...")
    
    webhook_secret = os.getenv("STRIPE_ENDPOINT_SECRET")
    if not webhook_secret:
        print("❌ STRIPE_ENDPOINT_SECRET non définie")
        print("   Configurez cette variable dans Railway")
        return False
    
    if not webhook_secret.startswith("whsec_"):
        print("❌ STRIPE_ENDPOINT_SECRET invalide (doit commencer par 'whsec_')")
        return False
    
    print("✅ STRIPE_ENDPOINT_SECRET configurée")
    return True

def check_pricing_config():
    """Vérifier la configuration des prix"""
    print("\n🔍 Vérification de la configuration des prix...")
    
    # Prix configurés dans le frontend
    configured_prices = [
        "price_1QVVfZGZEuLRLMp4FZd4eqCH",  # Mensuel
        "price_1QVVh0GZEuLRLMp4qwjkFxrE"   # Annuel
    ]
    
    try:
        stripe_key = os.getenv("STRIPE_SECRET_KEY")
        if not stripe_key:
            print("❌ Impossible de vérifier les prix sans STRIPE_SECRET_KEY")
            return False
            
        stripe.api_key = stripe_key
        
        for price_id in configured_prices:
            try:
                price = stripe.Price.retrieve(price_id)
                print(f"✅ Prix {price_id} trouvé: {price.unit_amount/100}€/{price.recurring.interval}")
            except stripe.error.InvalidRequestError:
                print(f"❌ Prix {price_id} introuvable - Vérifiez l'ID")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la vérification des prix: {e}")
        return False

def check_backend_endpoints():
    """Vérifier les endpoints du backend"""
    print("\n🔍 Vérification des endpoints du backend...")
    
    import requests
    
    base_url = "https://fiscal-ia-backend-production.up.railway.app"
    
    # Test de l'endpoint de santé
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Endpoint /health accessible")
        else:
            print(f"❌ Endpoint /health retourne {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Impossible d'accéder au backend: {e}")
        return False
    
    # Test de l'endpoint de création de session Stripe
    try:
        response = requests.post(
            f"{base_url}/api/create-checkout-session",
            json={
                "priceId": "price_1QVVfZGZEuLRLMp4FZd4eqCH",
                "successUrl": "https://fiscal-ia.net/success",
                "cancelUrl": "https://fiscal-ia.net/pricing"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "url" in data and data["url"].startswith("https://checkout.stripe.com"):
                print("✅ Endpoint de création de session Stripe fonctionnel")
                return True
            else:
                print("❌ Réponse invalide de l'endpoint de session")
                return False
        else:
            print(f"❌ Endpoint de session retourne {response.status_code}")
            print(f"   Réponse: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur endpoint de session: {e}")
        return False

def main():
    """Fonction principale"""
    print("🚀 Vérification de la configuration des paiements Stripe")
    print("=" * 60)
    
    # Tests
    tests = [
        ("Configuration Stripe", check_stripe_config),
        ("Configuration Webhooks", check_webhook_config),
        ("Configuration Prix", check_pricing_config),
        ("Endpoints Backend", check_backend_endpoints)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Erreur lors du test '{test_name}': {e}")
            results.append((test_name, False))
    
    # Résumé
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ DE LA VÉRIFICATION")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Résultat: {passed}/{total} tests réussis")
    
    if passed == total:
        print("🎉 Configuration des paiements complète et fonctionnelle !")
        print("\n📝 Prochaines étapes:")
        print("   1. Configurez les webhooks dans le dashboard Stripe")
        print("   2. Testez un paiement en mode test")
        print("   3. Passez en mode production quand prêt")
        return True
    else:
        print("⚠️  Certains éléments nécessitent une configuration.")
        print("\n🔧 ACTIONS PRIORITAIRES:")
        print("   1. ⚠️  AJOUTEZ STRIPE_SECRET_KEY dans Railway")
        print("   2. Créez les prix manquants dans Stripe")
        print("   3. Configurez les webhooks Stripe")
        print("\n📋 GUIDE RAPIDE:")
        print("   - Allez sur https://dashboard.stripe.com/apikeys")
        print("   - Copiez votre clé secrète")
        print("   - Ajoutez-la dans Railway comme STRIPE_SECRET_KEY")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 