#!/usr/bin/env python3
"""
Test de tous les prix configurés
"""

import requests

# Clé Stripe
STRIPE_SECRET_KEY = "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"

# Tous les prix configurés
ALL_PRICES = {
    "Particulier Mensuel": {
        "id": "price_1RiGEHG0JMtmHIL2YEl2kzaH",
        "expected_amount": 9.99,
        "expected_interval": "month"
    },
    "Particulier Annuel": {
        "id": "price_1RiGEoG0JMtmHIL27nuiIWfm",
        "expected_amount": 99.99,
        "expected_interval": "year"
    },
    "Pro Mensuel": {
        "id": "price_1RiGIbG0JMtmHIL2s2VGpwxN",
        "expected_amount": 49.99,
        "expected_interval": "month"
    },
    "Pro Annuel": {
        "id": "price_1RiGIcG0JMtmHIL2G4IvpUaY",
        "expected_amount": 499.99,
        "expected_interval": "year"
    }
}

def test_all_prices():
    """Test de tous les prix"""
    print("🔍 Test de tous les prix configurés...")
    
    headers = {
        "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    all_valid = True
    
    for price_name, price_config in ALL_PRICES.items():
        try:
            response = requests.get(
                f"https://api.stripe.com/v1/prices/{price_config['id']}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                price = response.json()
                actual_amount = price.get("unit_amount", 0) / 100
                actual_interval = price.get("recurring", {}).get("interval", "one-time")
                
                # Vérifier le montant
                if abs(actual_amount - price_config["expected_amount"]) < 0.01:
                    amount_status = "✅"
                else:
                    amount_status = "❌"
                    all_valid = False
                
                # Vérifier l'intervalle
                if actual_interval == price_config["expected_interval"]:
                    interval_status = "✅"
                else:
                    interval_status = "❌"
                    all_valid = False
                
                print(f"{amount_status} {price_name}: {actual_amount}€/{actual_interval} (ID: {price_config['id']})")
                
            else:
                print(f"❌ {price_name}: Prix introuvable (status: {response.status_code})")
                all_valid = False
                
        except Exception as e:
            print(f"❌ {price_name}: Erreur - {e}")
            all_valid = False
    
    return all_valid

def verify_frontend_config():
    """Vérifier la configuration frontend"""
    print("\n🔍 Vérification de la configuration frontend...")
    
    try:
        with open("frontend/src/config/pricing.ts", "r") as f:
            content = f.read()
        
        all_present = True
        
        for price_name, price_config in ALL_PRICES.items():
            if price_config["id"] in content:
                print(f"✅ {price_name} dans la config frontend")
            else:
                print(f"❌ {price_name} manquant dans la config frontend")
                all_present = False
        
        return all_present
        
    except Exception as e:
        print(f"❌ Erreur lecture config : {e}")
        return False

def generate_summary():
    """Générer un résumé complet"""
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ COMPLET DES PRIX")
    print("=" * 60)
    
    print("💰 Plans Particuliers :")
    print("   - Mensuel : 9.99€/mois (price_1RiGEHG0JMtmHIL2YEl2kzaH)")
    print("   - Annuel : 99.99€/an (price_1RiGEoG0JMtmHIL27nuiIWfm)")
    
    print("\n💼 Plans Professionnels :")
    print("   - Mensuel : 49.99€/mois (price_1RiGIbG0JMtmHIL2s2VGpwxN)")
    print("   - Annuel : 499.99€/an (price_1RiGIcG0JMtmHIL2G4IvpUaY)")
    
    print("\n🎯 Configuration :")
    print("   - Clé Stripe : Production")
    print("   - Frontend : Mis à jour")
    print("   - Backend : Prêt")
    
    print("\n📝 Actions finales :")
    print("   1. Ajouter STRIPE_SECRET_KEY dans Railway")
    print("   2. Configurer les webhooks Stripe")
    print("   3. Tester les paiements sur https://fiscal-ia.net")

if __name__ == "__main__":
    print("🚀 Test complet de tous les prix")
    print("=" * 50)
    
    # Tests
    test1 = test_all_prices()
    test2 = verify_frontend_config()
    
    print("\n" + "=" * 50)
    print("📊 RÉSULTATS")
    print("=" * 50)
    
    if test1 and test2:
        print("🎉 TOUS LES PRIX SONT CORRECTEMENT CONFIGURÉS !")
        print("\n✅ Prix Particuliers : 9.99€/mois et 99.99€/an")
        print("✅ Prix Pro : 49.99€/mois et 499.99€/an")
        print("✅ Configuration frontend mise à jour")
        
        # Générer le résumé
        generate_summary()
    else:
        print("⚠️  Certains prix nécessitent une vérification")
        if not test1:
            print("   - Vérifiez les prix Stripe")
        if not test2:
            print("   - Vérifiez la configuration frontend") 