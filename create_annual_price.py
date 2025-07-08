#!/usr/bin/env python3
"""
Création d'un prix annuel pour Francis
"""

import requests

# Clé Stripe
STRIPE_SECRET_KEY = "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"

def create_annual_price():
    """Créer un prix annuel"""
    print("🔍 Création d'un prix annuel...")
    
    headers = {
        "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    # Utiliser le produit existant ou en créer un nouveau
    product_id = "prod_SdXIX1s5vbgSpU"  # Produit créé précédemment
    
    # Créer un prix annuel
    price_data = {
        "unit_amount": 9999,  # 99.99€
        "currency": "eur",
        "recurring[interval]": "year",
        "product": product_id
    }
    
    try:
        response = requests.post(
            "https://api.stripe.com/v1/prices",
            headers=headers,
            data=price_data,
            timeout=10
        )
        
        if response.status_code == 200:
            price = response.json()
            print(f"✅ Prix annuel créé : {price['id']}")
            print(f"   Montant : {price['unit_amount']/100}€")
            print(f"   Intervalle : {price['recurring']['interval']}")
            return price["id"]
        else:
            print(f"❌ Erreur création prix : {response.status_code}")
            print(f"   Réponse : {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur création : {e}")
        return None

if __name__ == "__main__":
    print("🚀 Création d'un prix annuel pour Francis")
    print("=" * 40)
    
    annual_price_id = create_annual_price()
    
    if annual_price_id:
        print(f"\n✅ Prix annuel créé avec succès !")
        print(f"📋 ID : {annual_price_id}")
        print("\n📝 Actions à effectuer :")
        print("   1. Mettez à jour frontend/src/config/pricing.ts")
        print("   2. Remplacez l'ID du prix annuel")
        print("   3. Testez les paiements")
    else:
        print("❌ Échec de la création du prix annuel") 