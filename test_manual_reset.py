#!/usr/bin/env python3
"""
Script de test pour l'API de reset de mot de passe manuel
"""

import requests
import json
import sys

def test_manual_reset_api():
    """Test de l'API de reset manuel"""
    
    # URL de l'API (ajuster selon votre configuration)
    base_url = "http://localhost:8000"  # ou votre URL de production
    
    # Test 1: Reset avec email valide
    print("🧪 Test 1: Reset avec email valide")
    test_data = {
        "email": "test@example.com",
        "newPassword": "nouveau_mot_de_passe_123"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/auth/reset-password-manual",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Test 1 réussi")
        else:
            print("❌ Test 1 échoué")
            
    except Exception as e:
        print(f"❌ Erreur lors du test 1: {e}")
    
    # Test 2: Reset avec mot de passe trop court
    print("\n🧪 Test 2: Reset avec mot de passe trop court")
    test_data_short = {
        "email": "test@example.com",
        "newPassword": "123"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/auth/reset-password-manual",
            json=test_data_short,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 400:
            print("✅ Test 2 réussi (validation du mot de passe)")
        else:
            print("❌ Test 2 échoué")
            
    except Exception as e:
        print(f"❌ Erreur lors du test 2: {e}")
    
    # Test 3: Reset sans email
    print("\n🧪 Test 3: Reset sans email")
    test_data_no_email = {
        "newPassword": "nouveau_mot_de_passe_123"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/auth/reset-password-manual",
            json=test_data_no_email,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status: {response.status_code}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 400:
            print("✅ Test 3 réussi (validation des champs requis)")
        else:
            print("❌ Test 3 échoué")
            
    except Exception as e:
        print(f"❌ Erreur lors du test 3: {e}")

def test_frontend_routes():
    """Test des routes frontend"""
    print("\n🌐 Test des routes frontend")
    
    routes_to_test = [
        "/manual-password-reset",
        "/forgot-password", 
        "/set-password",
        "/login"
    ]
    
    base_url = "http://localhost:3000"  # ou votre URL frontend
    
    for route in routes_to_test:
        try:
            response = requests.get(f"{base_url}{route}")
            print(f"Route {route}: {response.status_code}")
        except Exception as e:
            print(f"Route {route}: Erreur - {e}")

if __name__ == "__main__":
    print("🚀 Test de l'API de reset manuel")
    print("=" * 50)
    
    test_manual_reset_api()
    test_frontend_routes()
    
    print("\n✅ Tests terminés")
    print("\n📋 Instructions:")
    print("1. Démarrez le backend: python backend/main.py")
    print("2. Démarrez le frontend: npm run dev")
    print("3. Testez la page: http://localhost:3000/manual-password-reset")
    print("4. Vérifiez que le lien est accessible depuis /login") 