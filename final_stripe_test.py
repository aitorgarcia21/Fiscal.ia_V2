#!/usr/bin/env python3
"""
Test final de la configuration Stripe avec les nouveaux prix
"""

import requests
import os

# Configuration
STRIPE_SECRET_KEY = "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"

# Nouveaux prix créés
NEW_PRICES = {
    "monthly": "price_1RiGEHG0JMtmHIL2YEl2kzaH",
    "annual": "price_1RiGEoG0JMtmHIL27nuiIWfm"
}

def test_new_prices():
    """Test des nouveaux prix"""
    print("🔍 Test des nouveaux prix créés...")
    
    headers = {
        "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    for price_type, price_id in NEW_PRICES.items():
        try:
            response = requests.get(
                f"https://api.stripe.com/v1/prices/{price_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                price = response.json()
                amount = price.get("unit_amount", 0) / 100
                interval = price.get("recurring", {}).get("interval", "one-time")
                print(f"✅ Prix {price_type} ({price_id}) : {amount}€/{interval}")
            else:
                print(f"❌ Prix {price_type} introuvable")
                return False
                
        except Exception as e:
            print(f"❌ Erreur pour {price_type} : {e}")
            return False
    
    return True

def test_backend_integration():
    """Test de l'intégration backend"""
    print("\n🔍 Test de l'intégration backend...")
    
    base_url = "https://fiscal-ia-backend-production.up.railway.app"
    
    # Test avec le nouveau prix mensuel
    try:
        response = requests.post(
            f"{base_url}/api/create-checkout-session",
            json={
                "priceId": NEW_PRICES["monthly"],
                "successUrl": "https://fiscal-ia.net/success",
                "cancelUrl": "https://fiscal-ia.net/pricing"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "url" in data and data["url"].startswith("https://checkout.stripe.com"):
                print("✅ Endpoint de session fonctionnel avec nouveau prix")
                print(f"   URL de checkout : {data['url']}")
                return True
            else:
                print("❌ Réponse invalide de l'endpoint")
                return False
        else:
            print(f"❌ Endpoint retourne {response.status_code}")
            print(f"   Réponse : {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur backend : {e}")
        return False

def test_frontend_config():
    """Test de la configuration frontend"""
    print("\n🔍 Vérification de la configuration frontend...")
    
    try:
        with open("frontend/src/config/pricing.ts", "r") as f:
            content = f.read()
            
        # Vérifier que les nouveaux prix sont dans la config
        if NEW_PRICES["monthly"] in content:
            print("✅ Prix mensuel dans la config frontend")
        else:
            print("❌ Prix mensuel manquant dans la config")
            return False
            
        if NEW_PRICES["annual"] in content:
            print("✅ Prix annuel dans la config frontend")
        else:
            print("❌ Prix annuel manquant dans la config")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Erreur lecture config : {e}")
        return False

def generate_summary():
    """Générer un résumé de la configuration"""
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ DE LA CONFIGURATION STRIPE")
    print("=" * 60)
    
    print(f"🔑 Clé Stripe : {STRIPE_SECRET_KEY[:20]}...")
    print(f"🎯 Mode : Production")
    
    print("\n💰 Prix configurés :")
    print(f"   - Mensuel : {NEW_PRICES['monthly']} (9.99€/mois)")
    print(f"   - Annuel : {NEW_PRICES['annual']} (99.99€/an)")
    
    print("\n🌐 URLs importantes :")
    print(f"   - Backend : https://fiscal-ia-backend-production.up.railway.app")
    print(f"   - Frontend : https://fiscal-ia.net")
    print(f"   - Webhook : https://fiscal-ia-backend-production.up.railway.app/api/webhooks/stripe")
    
    print("\n📝 Variables d'environnement à configurer dans Railway :")
    print(f"   STRIPE_SECRET_KEY={STRIPE_SECRET_KEY}")
    print(f"   STRIPE_ENDPOINT_SECRET=whsec_2bMwLAHWNeg4qOnU5p17lYBceqAeSkUy")

if __name__ == "__main__":
    print("🚀 Test final de la configuration Stripe")
    print("=" * 50)
    
    # Tests
    tests = [
        ("Nouveaux prix", test_new_prices),
        ("Intégration backend", test_backend_integration),
        ("Configuration frontend", test_frontend_config)
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
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print("\n" + "=" * 50)
    print("📊 RÉSULTATS FINAUX")
    print("=" * 50)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n🎯 {passed}/{total} tests réussis")
    
    if passed == total:
        print("🎉 CONFIGURATION STRIPE COMPLÈTE ET FONCTIONNELLE !")
        print("\n📝 Actions finales :")
        print("   1. Ajoutez STRIPE_SECRET_KEY dans Railway")
        print("   2. Configurez les webhooks dans le dashboard Stripe")
        print("   3. Testez un paiement réel sur https://fiscal-ia.net")
        print("   4. Surveillez les métriques dans le dashboard Stripe")
        
        # Générer le résumé
        generate_summary()
    else:
        print("⚠️  Certains tests ont échoué")
        print("   Vérifiez la configuration selon le guide STRIPE_SETUP_GUIDE.md") 