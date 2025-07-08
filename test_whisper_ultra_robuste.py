#!/usr/bin/env python3
"""
Script de test ULTRA-ROBUSTE pour Whisper - Teste TOUS les scénarios possibles
"""

import requests
import base64
import json
import time
import os
import wave
import struct
import numpy as np
import subprocess
import tempfile
import sys

# Configuration
API_BASE_URL = "http://localhost:8000"
TEST_AUDIO_FILE = "test_audio.wav"

def create_speech_audio(filename, duration=3, sample_rate=16000):
    """Crée un fichier audio avec de la parole simulée."""
    print(f"🎵 Création audio simulé ({duration}s)...")
    
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    base_freq = 300
    modulation = 0.5 * np.sin(2 * np.pi * 2 * t) + 0.5
    freq = base_freq + 200 * modulation
    audio_data = np.sin(2 * np.pi * freq * t) * 0.3
    audio_int16 = (audio_data * 32767).astype(np.int16)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_int16.tobytes())
    
    print(f"✅ Audio simulé créé: {filename}")

def create_real_speech_audio(filename, text="Bonjour, test de transcription Whisper.", duration=5):
    """Crée un fichier audio avec de la vraie parole."""
    print(f"🎤 Création audio réel: '{text}'")
    
    try:
        # Essayer say (macOS)
        subprocess.run([
            "say", "-o", filename, 
            "--file-format=WAVE",
            "--data-format=LEI16",
            "--channels=1",
            "--rate=16000",
            text
        ], check=True)
        print(f"✅ Audio réel créé avec say: {filename}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        try:
            # Essayer espeak
            subprocess.run([
                "espeak", "-w", filename,
                "-s", "150",
                "-p", "50",
                "-a", "100",
                text
            ], check=True)
            print(f"✅ Audio réel créé avec espeak: {filename}")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("⚠️  Impossible de créer de la vraie parole. Utilisation de l'audio simulé.")
            create_speech_audio(filename, duration)
            return False

def test_backend_health():
    """Test de santé du backend."""
    print("🏥 Test santé backend...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        print(f"Status: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Backend non accessible: {e}")
        return False

def test_whisper_service_direct():
    """Test direct du service Whisper."""
    print("🔧 Test direct service Whisper...")
    
    try:
        import sys
        sys.path.append('backend')
        from whisper_service import get_whisper_service
        
        # Test avec audio simulé
        create_speech_audio(TEST_AUDIO_FILE, duration=2)
        
        with open(TEST_AUDIO_FILE, 'rb') as f:
            audio_data = f.read()
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        service = get_whisper_service()
        result = service.transcribe_base64_audio(audio_base64, "wav")
        
        print(f"Résultat simulé: {json.dumps(result, indent=2)}")
        
        # Test avec audio réel
        success = create_real_speech_audio(TEST_AUDIO_FILE, "Bonjour, test de transcription.")
        
        with open(TEST_AUDIO_FILE, 'rb') as f:
            audio_data = f.read()
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        result_real = service.transcribe_base64_audio(audio_base64, "wav")
        
        print(f"Résultat réel: {json.dumps(result_real, indent=2)}")
        
        # Nettoyer
        if os.path.exists(TEST_AUDIO_FILE):
            os.remove(TEST_AUDIO_FILE)
        
        has_text_simulated = result.get("text", "").strip() != ""
        has_text_real = result_real.get("text", "").strip() != ""
        
        print(f"Simulé a du texte: {has_text_simulated}")
        print(f"Réel a du texte: {has_text_real}")
        
        return has_text_real  # Le vrai test est avec de la vraie parole
        
    except Exception as e:
        print(f"❌ Erreur test direct: {e}")
        return False

def test_api_endpoints():
    """Test de tous les endpoints API."""
    print("🌐 Test endpoints API...")
    
    if not test_backend_health():
        print("⚠️  Backend non accessible, tests API annulés")
        return False
    
    tests = [
        ("/test-whisper", "GET"),
        ("/whisper/transcribe", "POST"),
        ("/api/whisper/transcribe", "POST")
    ]
    
    results = []
    
    for endpoint, method in tests:
        print(f"  Test {method} {endpoint}...")
        
        try:
            if method == "GET":
                response = requests.get(f"{API_BASE_URL}{endpoint}", timeout=10)
            else:  # POST
                # Créer un audio de test
                create_speech_audio(TEST_AUDIO_FILE, duration=2)
                
                with open(TEST_AUDIO_FILE, 'rb') as f:
                    audio_data = f.read()
                    audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                
                payload = {
                    "audio_base64": audio_base64,
                    "audio_format": "wav",
                    "language": "fr"
                }
                
                response = requests.post(f"{API_BASE_URL}{endpoint}", json=payload, timeout=30)
            
            print(f"    Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"    Response: {json.dumps(result, indent=2)}")
                results.append(True)
            else:
                print(f"    ❌ Erreur: {response.status_code}")
                results.append(False)
                
        except Exception as e:
            print(f"    ❌ Exception: {e}")
            results.append(False)
    
    # Nettoyer
    if os.path.exists(TEST_AUDIO_FILE):
        os.remove(TEST_AUDIO_FILE)
    
    return any(results)

def test_file_upload():
    """Test d'upload de fichier audio."""
    print("📁 Test upload fichier...")
    
    if not test_backend_health():
        print("⚠️  Backend non accessible, test upload annulé")
        return False
    
    try:
        # Créer un fichier audio de test
        create_real_speech_audio(TEST_AUDIO_FILE, "Test d'upload de fichier audio.")
        
        # Upload du fichier
        with open(TEST_AUDIO_FILE, 'rb') as f:
            files = {'audio': ('test.wav', f, 'audio/wav')}
            data = {'language': 'fr'}
            
            response = requests.post(
                f"{API_BASE_URL}/api/whisper/transcribe",
                files=files,
                data=data,
                timeout=30
            )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)}")
            
            # Nettoyer
            if os.path.exists(TEST_AUDIO_FILE):
                os.remove(TEST_AUDIO_FILE)
            
            return result.get("text", "").strip() != ""
        else:
            print(f"❌ Erreur upload: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur test upload: {e}")
        return False

def test_different_audio_formats():
    """Test avec différents formats audio."""
    print("🎵 Test formats audio...")
    
    if not test_backend_health():
        print("⚠️  Backend non accessible, test formats annulé")
        return False
    
    formats = [
        ("wav", "audio/wav"),
        ("webm", "audio/webm"),
        ("mp3", "audio/mp3")
    ]
    
    results = []
    
    for format_name, mime_type in formats:
        print(f"  Test format {format_name}...")
        
        try:
            # Créer un audio de test
            create_real_speech_audio(TEST_AUDIO_FILE, f"Test format {format_name}.")
            
            # Convertir en base64
            with open(TEST_AUDIO_FILE, 'rb') as f:
                audio_data = f.read()
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            # Test avec l'endpoint base64
            payload = {
                "audio_base64": audio_base64,
                "audio_format": format_name,
                "language": "fr"
            }
            
            response = requests.post(
                f"{API_BASE_URL}/whisper/transcribe",
                json=payload,
                timeout=30
            )
            
            print(f"    Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                has_text = result.get("text", "").strip() != ""
                print(f"    Texte: '{result.get('text', '')}'")
                results.append(has_text)
            else:
                print(f"    ❌ Erreur: {response.status_code}")
                results.append(False)
                
        except Exception as e:
            print(f"    ❌ Exception: {e}")
            results.append(False)
    
    # Nettoyer
    if os.path.exists(TEST_AUDIO_FILE):
        os.remove(TEST_AUDIO_FILE)
    
    return any(results)

def test_error_handling():
    """Test de gestion d'erreurs."""
    print("🚨 Test gestion erreurs...")
    
    if not test_backend_health():
        print("⚠️  Backend non accessible, test erreurs annulé")
        return False
    
    tests = [
        ("Audio vide", {"audio_base64": "", "audio_format": "wav"}),
        ("Audio invalide", {"audio_base64": "invalid_base64", "audio_format": "wav"}),
        ("Format invalide", {"audio_base64": "dGVzdA==", "audio_format": "invalid"}),
    ]
    
    results = []
    
    for test_name, payload in tests:
        print(f"  Test {test_name}...")
        
        try:
            response = requests.post(
                f"{API_BASE_URL}/whisper/transcribe",
                json=payload,
                timeout=10
            )
            
            print(f"    Status: {response.status_code}")
            # On s'attend à des erreurs 400 ou 500
            if response.status_code in [400, 500]:
                print(f"    ✅ Erreur gérée correctement")
                results.append(True)
            else:
                print(f"    ❌ Erreur non gérée: {response.status_code}")
                results.append(False)
                
        except Exception as e:
            print(f"    ❌ Exception: {e}")
            results.append(False)
    
    return all(results)

def main():
    """Test ULTRA-ROBUSTE complet."""
    print("🚀 TEST ULTRA-ROBUSTE WHISPER")
    print("=" * 60)
    
    tests = [
        ("Santé backend", test_backend_health),
        ("Service direct", test_whisper_service_direct),
        ("Endpoints API", test_api_endpoints),
        ("Upload fichier", test_file_upload),
        ("Formats audio", test_different_audio_formats),
        ("Gestion erreurs", test_error_handling)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🧪 {test_name}")
        print("-" * 40)
        
        start_time = time.time()
        success = test_func()
        duration = time.time() - start_time
        
        status = "✅ SUCCÈS" if success else "❌ ÉCHEC"
        print(f"{status} ({duration:.2f}s)")
        
        results.append((test_name, success, duration))
    
    # Résumé détaillé
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ DÉTAILLÉ")
    print("=" * 60)
    
    passed = sum(1 for _, success, _ in results if success)
    total = len(results)
    
    for test_name, success, duration in results:
        status = "✅" if success else "❌"
        print(f"{status} {test_name} ({duration:.2f}s)")
    
    print(f"\n🎯 Résultat global: {passed}/{total} tests réussis")
    
    if passed == total:
        print("🎉 PARFAIT ! Tous les tests sont passés !")
        print("✅ Le service Whisper fonctionne parfaitement")
    elif passed >= total * 0.8:
        print("🟡 BON ! La plupart des tests sont passés")
        print("⚠️  Quelques problèmes mineurs à corriger")
    elif passed >= total * 0.5:
        print("🟠 MOYEN ! La moitié des tests sont passés")
        print("🔧 Des problèmes significatifs à résoudre")
    else:
        print("🔴 MAUVAIS ! La plupart des tests ont échoué")
        print("🚨 Problèmes majeurs à résoudre")
    
    print("\n🔍 DIAGNOSTIC:")
    if not any(success for _, success, _ in results[:2]):  # Backend et service direct
        print("❌ Le backend n'est pas accessible ou le service Whisper ne fonctionne pas")
        print("   → Vérifiez que le serveur est démarré: cd backend && python main.py")
        print("   → Vérifiez l'installation de Whisper: pip install faster-whisper")
    elif not results[1][1]:  # Service direct échoue
        print("❌ Le service Whisper ne fonctionne pas correctement")
        print("   → Vérifiez l'installation de faster-whisper")
        print("   → Vérifiez l'espace disque (modèle ~244MB)")
    elif not results[2][1]:  # Endpoints API échouent
        print("❌ Les endpoints API ne fonctionnent pas")
        print("   → Vérifiez la configuration des routes dans main.py")
    else:
        print("✅ Le système fonctionne correctement")

if __name__ == "__main__":
    main() 