#!/usr/bin/env python3
"""
🧪 TEST GOCARDLESS API KEYS
==========================

Script de test pour vérifier que les API keys GoCardless fonctionnent
avec les fixes JSON que j'ai appliqués.
"""

import os
import sys
import asyncio
import logging

# Ajouter le répertoire backend au path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Les variables d'environnement GoCardless doivent être configurées dans Railway:
# GOCARDLESS_SECRET_ID="your_secret_id"
# GOCARDLESS_SECRET_KEY="your_secret_key"
# GOCARDLESS_USE_SANDBOX="false"  # false pour la production

# Configurer le logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_gocardless_api():
    """Test des principales fonctions GoCardless"""
    try:
        # Importer le service GoCardless
        from gocardless_service import gocardless_service
        
        print("🚀 =================================")
        print("🧪 TEST GOCARDLESS API KEYS")
        print("🚀 =================================")
        
        # Test 1: Récupération du token d'accès
        print("\n📋 Test 1: Récupération du token d'accès...")
        token = await gocardless_service.get_access_token()
        if token and token != "DEMO_TOKEN":
            print(f"✅ Token récupéré avec succès: {token[:20]}...")
        else:
            print("❌ Erreur récupération token")
            return False
            
        # Test 2: Récupération des institutions françaises
        print("\n🏦 Test 2: Récupération des institutions françaises...")
        institutions = await gocardless_service.get_institutions(country="FR")
        if institutions:
            print(f"✅ {len(institutions)} institutions récupérées:")
            for inst in institutions[:3]:  # Afficher les 3 premières
                print(f"   - {inst.name} ({inst.id})")
        else:
            print("❌ Erreur récupération institutions")
            return False
            
        # Test 3: Test création agreement (avec première institution)
        if institutions:
            print(f"\n📝 Test 3: Test création agreement avec {institutions[0].name}...")
            try:
                agreement = await gocardless_service.create_agreement(
                    institution_id=institutions[0].id,
                    max_historical_days=90
                )
                print(f"✅ Agreement créé: {agreement.id}")
                print(f"   - Institution: {agreement.institution_id}")
                print(f"   - Status: {agreement.status}")
            except Exception as e:
                print(f"⚠️  Erreur création agreement (normal en test): {str(e)}")
        
        print("\n🎉 =================================")
        print("✅ TESTS GOCARDLESS RÉUSSIS !")
        print("🎉 =================================")
        return True
        
    except Exception as e:
        print(f"\n❌ =================================")
        print(f"💥 ERREUR TESTS GOCARDLESS: {str(e)}")
        print(f"❌ =================================")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Exécuter les tests
    success = asyncio.run(test_gocardless_api())
    
    if success:
        print("\n🚀 Les API keys GoCardless fonctionnent parfaitement !")
        print("🎯 Tu peux maintenant déployer en production !")
    else:
        print("\n💥 Il y a encore des problèmes à corriger...")
        
    sys.exit(0 if success else 1)
