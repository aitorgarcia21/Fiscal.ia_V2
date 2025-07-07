#!/usr/bin/env python3
"""
Vérification et diagnostic de la clé Stripe
"""

import requests
import json

# Clé Stripe à tester
STRIPE_SECRET_KEY = "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"

def analyze_stripe_key():
    """Analyser la clé Stripe"""
    print("🔍 Analyse de la clé Stripe...")
    
    # Vérifier le format
    if not STRIPE_SECRET_KEY.startswith("sk_"):
        print("❌ Format de clé invalide (doit commencer par 'sk_')")
        return False
    
    # Détecter le mode
    if "test" in STRIPE_SECRET_KEY:
        print("✅ Clé de test détectée")
        mode = "test"
    elif "live" in STRIPE_SECRET_KEY:
        print("✅ Clé de production détectée")
        mode = "live"
    else:
        print("⚠️  Mode de clé indéterminé")
        mode = "unknown"
    
    print(f"📋 Clé : {STRIPE_SECRET_KEY[:20]}...")
    print(f"🎯 Mode : {mode}")
    
    return True

def test_stripe_api():
    """Test direct de l'API Stripe"""
    print("\n🔍 Test direct de l'API Stripe...")
    
    headers = {
        "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        # Test de récupération des prix
        response = requests.get(
            "https://api.stripe.com/v1/prices",
            headers=headers,
            params={"limit": 5},
            timeout=10
        )
        
        print(f"📊 Statut de réponse : {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            prices = data.get("data", [])
            print(f"✅ API accessible - {len(prices)} prix trouvés")
            
            for price in prices:
                amount = price.get("unit_amount", 0) / 100
                interval = price.get("recurring", {}).get("interval", "one-time")
                print(f"   - {price['id']}: {amount}€/{interval}")
            
            return True
        else:
            print(f"❌ Erreur API : {response.status_code}")
            print(f"   Réponse : {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur de connexion : {e}")
        return False

def test_specific_prices():
    """Test des prix spécifiques via API directe"""
    print("\n🔍 Test des prix configurés...")
    
    price_ids = [
        "price_1QVVfZGZEuLRLMp4FZd4eqCH",
        "price_1QVVh0GZEuLRLMp4qwjkFxrE"
    ]
    
    headers = {
        "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    for price_id in price_ids:
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
                print(f"✅ Prix {price_id} : {amount}€/{interval}")
            else:
                print(f"❌ Prix {price_id} introuvable (status: {response.status_code})")
                return False
                
        except Exception as e:
            print(f"❌ Erreur pour {price_id} : {e}")
            return False
    
    return True

def create_test_prices():
    """Créer des prix de test si nécessaire"""
    print("\n🔍 Création de prix de test...")
    
    headers = {
        "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    # Créer un produit de test
    product_data = {
        "name": "Francis Premium Test",
        "description": "Abonnement Francis Premium"
    }
    
    try:
        response = requests.post(
            "https://api.stripe.com/v1/products",
            headers=headers,
            data=product_data,
            timeout=10
        )
        
        if response.status_code == 200:
            product = response.json()
            product_id = product["id"]
            print(f"✅ Produit créé : {product_id}")
            
            # Créer un prix mensuel
            price_data = {
                "unit_amount": 999,  # 9.99€
                "currency": "eur",
                "recurring[interval]": "month",
                "product": product_id
            }
            
            response = requests.post(
                "https://api.stripe.com/v1/prices",
                headers=headers,
                data=price_data,
                timeout=10
            )
            
            if response.status_code == 200:
                price = response.json()
                print(f"✅ Prix mensuel créé : {price['id']}")
                return price["id"]
            else:
                print(f"❌ Erreur création prix : {response.status_code}")
                return None
        else:
            print(f"❌ Erreur création produit : {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur création : {e}")
        return None

if __name__ == "__main__":
    print("🚀 Diagnostic complet de la configuration Stripe")
    print("=" * 50)
    
    # Tests
    test1 = analyze_stripe_key()
    test2 = test_stripe_api()
    test3 = test_specific_prices()
    
    print("\n" + "=" * 50)
    print("📊 RÉSULTATS")
    print("=" * 50)
    
    if test1 and test2 and test3:
        print("🎉 Configuration Stripe complète !")
        print("\n📝 Actions à effectuer :")
        print("   1. Ajoutez STRIPE_SECRET_KEY dans Railway")
        print("   2. Testez les paiements sur le site")
    else:
        print("⚠️  Problèmes détectés")
        if not test1:
            print("   - Vérifiez le format de la clé")
        if not test2:
            print("   - Vérifiez la validité de la clé")
        if not test3:
            print("   - Créez les prix manquants")
            print("\n🔧 Solution : Créer de nouveaux prix")
            create_test = input("Créer des prix de test ? (y/n): ")
            if create_test.lower() == 'y':
                new_price_id = create_test_prices()
                if new_price_id:
                    print(f"✅ Nouveau prix créé : {new_price_id}")
                    print("📝 Mettez à jour frontend/src/config/pricing.ts") 