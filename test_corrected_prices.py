#!/usr/bin/env python3
"""
Test des prix corrigés (49€ exactement)
"""

import json
import os
import requests

# Clé Stripe
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', 'sk_test_YOUR_TEST_KEY_HERE')  # NEVER expose live keys!

# Prix corrigés
CORRECTED_PRICES = {
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
        "id": "price_1RiGKGG0JMtmHIL25K3BCdXs",
        "expected_amount": 49.00,
        "expected_interval": "month"
    },
    "Pro Annuel": {
        "id": "price_1RiGKHG0JMtmHIL2dd1tuPjz",
        "expected_amount": 490.00,
        "expected_interval": "year"
    }
}

def test_corrected_prices():
    """Test des prix corrigés"""
    print("🔍 Test des prix corrigés...")
    
    headers = {
        "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    all_valid = True
    
    for price_name, price_config in CORRECTED_PRICES.items():
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
        
        for price_name, price_config in CORRECTED_PRICES.items():
            if price_config["id"] in content:
                print(f"✅ {price_name} dans la config frontend")
            else:
                print(f"❌ {price_name} manquant dans la config frontend")
                all_present = False
        
        return all_present
        
    except Exception as e:
        print(f"❌ Erreur lecture config : {e}")
        return False

if __name__ == "__main__":
    print("🚀 Test des prix corrigés")
    print("=" * 40)
    
    # Tests
    test1 = test_corrected_prices()
    test2 = verify_frontend_config()
    
    print("\n" + "=" * 40)
    print("📊 RÉSULTATS")
    print("=" * 40)
    
    if test1 and test2:
        print("🎉 TOUS LES PRIX SONT CORRECTEMENT CONFIGURÉS !")
        print("\n✅ Prix Particuliers : 9.99€/mois et 99.99€/an")
        print("✅ Prix Pro : 49.00€/mois et 490.00€/an")
        print("✅ Configuration frontend mise à jour")
        
        print("\n" + "=" * 40)
        print("📊 RÉSUMÉ FINAL")
        print("=" * 40)
        print("💰 Plans Particuliers :")
        print("   - Mensuel : 9.99€/mois")
        print("   - Annuel : 99.99€/an")
        print("\n💼 Plans Professionnels :")
        print("   - Mensuel : 49.00€/mois ✅")
        print("   - Annuel : 490.00€/an ✅")
        
    else:
        print("⚠️  Certains prix nécessitent une vérification") 