#!/usr/bin/env python3
"""
Création des prix particuliers avec limitation à 30 requêtes
"""

import requests

# Clé Stripe
STRIPE_SECRET_KEY = "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"

def create_particulier_prices_limited():
    """Créer les prix particuliers avec limitation"""
    print("🔍 Création des prix particuliers avec limitation...")
    
    headers = {
        "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    # Créer un produit Particulier avec limitation
    product_data = {
        "name": "Francis Particulier",
        "description": "Abonnement Francis Particulier - 30 requêtes/mois"
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
            print(f"✅ Produit Particulier créé : {product_id}")
            
            # Créer le prix mensuel Particulier (9.99€)
            monthly_price_data = {
                "unit_amount": 999,  # 9.99€
                "currency": "eur",
                "recurring[interval]": "month",
                "product": product_id,
                "metadata[request_limit]": "30",
                "metadata[plan_type]": "particulier"
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
                print(f"✅ Prix mensuel Particulier créé : {monthly_price_id} (9.99€/mois - 30 requêtes)")
            else:
                print(f"❌ Erreur création prix mensuel Particulier : {response.status_code}")
                return None
            
            # Créer le prix annuel Particulier (99.99€)
            annual_price_data = {
                "unit_amount": 9999,  # 99.99€
                "currency": "eur",
                "recurring[interval]": "year",
                "product": product_id,
                "metadata[request_limit]": "360",  # 30 requêtes * 12 mois
                "metadata[plan_type]": "particulier"
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
                print(f"✅ Prix annuel Particulier créé : {annual_price_id} (99.99€/an - 360 requêtes)")
            else:
                print(f"❌ Erreur création prix annuel Particulier : {response.status_code}")
                return None
            
            return {
                "monthly": monthly_price_id,
                "annual": annual_price_id
            }
            
        else:
            print(f"❌ Erreur création produit Particulier : {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur création : {e}")
        return None

if __name__ == "__main__":
    print("🚀 Création des prix particuliers avec limitation")
    print("=" * 50)
    
    particulier_prices = create_particulier_prices_limited()
    
    if particulier_prices:
        print(f"\n✅ Prix Particuliers créés avec succès !")
        print(f"📋 Prix mensuel Particulier : {particulier_prices['monthly']} (9.99€/mois - 30 requêtes)")
        print(f"📋 Prix annuel Particulier : {particulier_prices['annual']} (99.99€/an - 360 requêtes)")
        print("\n📝 Actions à effectuer :")
        print("   1. Mettez à jour frontend/src/config/pricing.ts")
        print("   2. Configurez la limitation côté backend")
        print("   3. Testez les paiements")
    else:
        print("❌ Échec de la création des prix particuliers") 