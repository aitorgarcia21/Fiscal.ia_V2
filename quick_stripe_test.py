#!/usr/bin/env python3
"""
Test rapide de la configuration Stripe avec la clé fournie
"""

import os
import sys
import stripe
import requests

# Configuration avec la clé Stripe
STRIPE_SECRET_KEY = "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"

def test_stripe_connection():
    """Test de connexion à Stripe"""
    print("🔍 Test de connexion à Stripe...")
    
    try:
        stripe.api_key = STRIPE_SECRET_KEY
        
        # Test de récupération des prix
        prices = stripe.Price.list(limit=10)
        print(f"✅ Connexion réussie ! {len(prices.data)} prix trouvés")
        
        print("\n📋 Prix disponibles :")
        for price in prices.data:
            if hasattr(price, 'recurring') and price.recurring:
                print(f"   - {price.id}: {price.unit_amount/100}€/{price.recurring.interval}")
            else:
                print(f"   - {price.id}: {price.unit_amount/100}€ (one-time)")
        
        return True
        
    except stripe.error.AuthenticationError:
        print("❌ Erreur d'authentification - Vérifiez la clé")
        return False
    except Exception as e:
        print(f"❌ Erreur : {e}")
        return False

def test_backend_with_stripe():
    """Test du backend avec la clé Stripe"""
    print("\n🔍 Test du backend avec Stripe...")
    
    # Configuration des variables pour le test
    os.environ["STRIPE_SECRET_KEY"] = STRIPE_SECRET_KEY
    os.environ["STRIPE_ENDPOINT_SECRET"] = "whsec_2bMwLAHWNeg4qOnU5p17lYBceqAeSkUy"
    
    base_url = "https://fiscal-ia-backend-production.up.railway.app"
    
    try:
        # Test de santé
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Backend accessible")
        else:
            print(f"❌ Backend retourne {response.status_code}")
            return False
        
        # Test de création de session
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
                print("✅ Endpoint de session fonctionnel")
                print(f"   URL de checkout : {data['url']}")
                return True
            else:
                print("❌ Réponse invalide")
                return False
        else:
            print(f"❌ Endpoint retourne {response.status_code}")
            print(f"   Réponse : {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur backend : {e}")
        return False

def test_configured_prices():
    """Test des prix configurés"""
    print("\n🔍 Test des prix configurés...")
    
    configured_prices = [
        "price_1QVVfZGZEuLRLMp4FZd4eqCH",  # Mensuel
        "price_1QVVh0GZEuLRLMp4qwjkFxrE"   # Annuel
    ]
    
    try:
        stripe.api_key = STRIPE_SECRET_KEY
        
        for price_id in configured_prices:
            try:
                price = stripe.Price.retrieve(price_id)
                print(f"✅ Prix {price_id} trouvé : {price.unit_amount/100}€/{price.recurring.interval}")
            except stripe.error.InvalidRequestError:
                print(f"❌ Prix {price_id} introuvable")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur vérification prix : {e}")
        return False

def main():
    """Test principal"""
    print("🚀 Test rapide de la configuration Stripe")
    print("=" * 50)
    
    tests = [
        ("Connexion Stripe", test_stripe_connection),
        ("Prix configurés", test_configured_prices),
        ("Backend avec Stripe", test_backend_with_stripe)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Erreur test '{test_name}' : {e}")
            results.append((test_name, False))
    
    # Résumé
    print("\n" + "=" * 50)
    print("📊 RÉSULTATS")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n🎯 {passed}/{total} tests réussis")
    
    if passed == total:
        print("🎉 Configuration Stripe complète et fonctionnelle !")
        print("\n📝 Prochaines étapes :")
        print("   1. Testez un paiement réel")
        print("   2. Configurez les webhooks")
        print("   3. Surveillez les métriques")
    else:
        print("⚠️  Certains tests ont échoué")
        print("   Vérifiez la configuration selon le guide STRIPE_SETUP_GUIDE.md")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 