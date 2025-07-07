#!/usr/bin/env python3
"""
Test simple de la clé Stripe
"""

import stripe

# Clé Stripe
STRIPE_SECRET_KEY = "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"

def test_stripe_key():
    """Test simple de la clé Stripe"""
    print("🔍 Test de la clé Stripe...")
    
    try:
        # Configuration
        stripe.api_key = STRIPE_SECRET_KEY
        
        # Test simple - récupérer les prix
        prices = stripe.Price.list(limit=5)
        
        print(f"✅ Connexion réussie !")
        print(f"📊 {len(prices.data)} prix trouvés")
        
        # Afficher les prix
        for price in prices.data:
            amount = price.unit_amount / 100 if price.unit_amount else 0
            interval = price.recurring.interval if hasattr(price, 'recurring') and price.recurring else "one-time"
            print(f"   - {price.id}: {amount}€/{interval}")
        
        return True
        
    except stripe.error.AuthenticationError as e:
        print(f"❌ Erreur d'authentification : {e}")
        return False
    except stripe.error.APIConnectionError as e:
        print(f"❌ Erreur de connexion : {e}")
        return False
    except Exception as e:
        print(f"❌ Erreur inattendue : {e}")
        return False

def test_specific_prices():
    """Test des prix spécifiques"""
    print("\n🔍 Test des prix configurés...")
    
    price_ids = [
        "price_1QVVfZGZEuLRLMp4FZd4eqCH",
        "price_1QVVh0GZEuLRLMp4qwjkFxrE"
    ]
    
    try:
        stripe.api_key = STRIPE_SECRET_KEY
        
        for price_id in price_ids:
            try:
                price = stripe.Price.retrieve(price_id)
                amount = price.unit_amount / 100 if price.unit_amount else 0
                interval = price.recurring.interval if hasattr(price, 'recurring') and price.recurring else "one-time"
                print(f"✅ Prix {price_id} : {amount}€/{interval}")
            except stripe.error.InvalidRequestError:
                print(f"❌ Prix {price_id} introuvable")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur : {e}")
        return False

if __name__ == "__main__":
    print("🚀 Test simple de la configuration Stripe")
    print("=" * 40)
    
    # Tests
    test1 = test_stripe_key()
    test2 = test_specific_prices()
    
    print("\n" + "=" * 40)
    print("📊 RÉSULTATS")
    print("=" * 40)
    
    if test1 and test2:
        print("🎉 Configuration Stripe OK !")
        print("\n📝 Actions à effectuer :")
        print("   1. Ajoutez STRIPE_SECRET_KEY dans Railway")
        print("   2. Testez les paiements sur le site")
    else:
        print("⚠️  Problèmes détectés")
        if not test1:
            print("   - Vérifiez la clé Stripe")
        if not test2:
            print("   - Créez les prix manquants dans Stripe") 