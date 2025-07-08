#!/usr/bin/env python3
"""
Création des prix Pro corrigés pour Francis (49€ exactement)
"""

import requests

# Clé Stripe
STRIPE_SECRET_KEY = "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"

def create_corrected_pro_prices():
    """Créer les prix Pro avec 49€ exactement"""
    print("🔍 Création des prix Pro corrigés...")
    
    headers = {
        "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    # Créer un produit Pro
    product_data = {
        "name": "Francis Pro",
        "description": "Abonnement Francis Pro - Interface professionnelle"
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
            print(f"✅ Produit Pro créé : {product_id}")
            
            # Créer le prix mensuel Pro (49€ exactement)
            monthly_price_data = {
                "unit_amount": 4900,  # 49.00€
                "currency": "eur",
                "recurring[interval]": "month",
                "product": product_id
            }
            
            response = requests.post(
                "https://api.stripe.com/v1/prices",
                headers=headers,
                data=monthly_price_data,
                timeout=10
            )
            
            if response.status_code == 200:
                monthly_price = response.json()
                monthly_price_id = monthly_price["id"]
                print(f"✅ Prix mensuel Pro créé : {monthly_price_id} (49.00€/mois)")
            else:
                print(f"❌ Erreur création prix mensuel Pro : {response.status_code}")
                return None
            
            # Créer le prix annuel Pro (490€ exactement)
            annual_price_data = {
                "unit_amount": 49000,  # 490.00€
                "currency": "eur",
                "recurring[interval]": "year",
                "product": product_id
            }
            
            response = requests.post(
                "https://api.stripe.com/v1/prices",
                headers=headers,
                data=annual_price_data,
                timeout=10
            )
            
            if response.status_code == 200:
                annual_price = response.json()
                annual_price_id = annual_price["id"]
                print(f"✅ Prix annuel Pro créé : {annual_price_id} (490.00€/an)")
            else:
                print(f"❌ Erreur création prix annuel Pro : {response.status_code}")
                return None
            
            return {
                "monthly": monthly_price_id,
                "annual": annual_price_id
            }
            
        else:
            print(f"❌ Erreur création produit Pro : {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur création : {e}")
        return None

if __name__ == "__main__":
    print("🚀 Création des prix Pro corrigés pour Francis")
    print("=" * 50)
    
    pro_prices = create_corrected_pro_prices()
    
    if pro_prices:
        print(f"\n✅ Prix Pro corrigés créés avec succès !")
        print(f"📋 Prix mensuel Pro : {pro_prices['monthly']} (49.00€/mois)")
        print(f"📋 Prix annuel Pro : {pro_prices['annual']} (490.00€/an)")
        print("\n📝 Actions à effectuer :")
        print("   1. Mettez à jour frontend/src/config/pricing.ts")
        print("   2. Remplacez les IDs des prix Pro")
        print("   3. Testez les paiements Pro")
    else:
        print("❌ Échec de la création des prix Pro corrigés") 