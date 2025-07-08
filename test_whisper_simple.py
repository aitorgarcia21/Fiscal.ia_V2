#!/usr/bin/env python3
"""
Script de test simple pour vérifier l'enregistrement audio et la transcription Whisper.
"""

import requests
import base64
import json
import time
import os

# Configuration
API_BASE_URL = "http://localhost:8000"  # ou l'URL de votre API
TEST_AUDIO_FILE = "test_audio.wav"  # Fichier audio de test

def test_whisper_health():
    """Test de santé du service Whisper."""
    print("🔍 Test de santé Whisper...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/test-whisper")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erreur test santé: {e}")
        return False

def test_whisper_transcribe():
    """Test de transcription avec un fichier audio de test."""
    print("🎤 Test de transcription Whisper...")
    
    # Créer un fichier audio de test simple (1 seconde de silence)
    try:
        import wave
        import struct
        
        # Créer un fichier WAV simple (1 seconde de silence, 16kHz, mono)
        with wave.open(TEST_AUDIO_FILE, 'w') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(16000)  # 16kHz
            
            # 1 seconde de silence
            frames = b'\x00\x00' * 16000
            wav_file.writeframes(frames)
        
        print(f"✅ Fichier audio de test créé: {TEST_AUDIO_FILE}")
        
        # Lire le fichier et le convertir en base64
        with open(TEST_AUDIO_FILE, 'rb') as f:
            audio_data = f.read()
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        # Envoyer à l'API
        payload = {
            "audio_base64": audio_base64,
            "audio_format": "wav",
            "language": "fr"
        }
        
        print("📤 Envoi à l'API...")
        response = requests.post(f"{API_BASE_URL}/whisper/transcribe", json=payload)
        
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        # Nettoyer le fichier de test
        if os.path.exists(TEST_AUDIO_FILE):
            os.remove(TEST_AUDIO_FILE)
        
        return response.status_code == 200 and not result.get("error")
        
    except Exception as e:
        print(f"❌ Erreur test transcription: {e}")
        return False

def test_whisper_endpoint():
    """Test de l'endpoint Whisper principal."""
    print("🎯 Test endpoint Whisper principal...")
    
    try:
        # Créer un audio de test simple
        import wave
        import struct
        
        with wave.open(TEST_AUDIO_FILE, 'w') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(16000)
            
            # 2 secondes de silence
            frames = b'\x00\x00' * 32000
            wav_file.writeframes(frames)
        
        # Lire et encoder
        with open(TEST_AUDIO_FILE, 'rb') as f:
            audio_data = f.read()
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        # Test avec l'endpoint principal
        payload = {
            "audio_base64": audio_base64,
            "audio_format": "wav",
            "language": "fr"
        }
        
        print("📤 Test endpoint principal...")
        response = requests.post(f"{API_BASE_URL}/api/whisper/transcribe", json=payload)
        
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        # Nettoyer
        if os.path.exists(TEST_AUDIO_FILE):
            os.remove(TEST_AUDIO_FILE)
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Erreur test endpoint: {e}")
        return False

def main():
    """Fonction principale de test."""
    print("🚀 Test complet du service Whisper")
    print("=" * 50)
    
    tests = [
        ("Santé Whisper", test_whisper_health),
        ("Transcription simple", test_whisper_transcribe),
        ("Endpoint principal", test_whisper_endpoint)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🧪 {test_name}")
        print("-" * 30)
        
        start_time = time.time()
        success = test_func()
        duration = time.time() - start_time
        
        status = "✅ SUCCÈS" if success else "❌ ÉCHEC"
        print(f"{status} ({duration:.2f}s)")
        
        results.append((test_name, success, duration))
    
    # Résumé
    print("\n" + "=" * 50)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 50)
    
    passed = sum(1 for _, success, _ in results if success)
    total = len(results)
    
    for test_name, success, duration in results:
        status = "✅" if success else "❌"
        print(f"{status} {test_name} ({duration:.2f}s)")
    
    print(f"\n🎯 Résultat: {passed}/{total} tests réussis")
    
    if passed == total:
        print("🎉 Tous les tests sont passés ! Le service Whisper fonctionne correctement.")
    else:
        print("⚠️  Certains tests ont échoué. Vérifiez la configuration du service Whisper.")

if __name__ == "__main__":
    main() 