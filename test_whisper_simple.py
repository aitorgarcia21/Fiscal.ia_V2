#!/usr/bin/env python3
"""
Script de test simple pour vérifier l'enregistrement audio et la transcription Whisper.
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

# Configuration
API_BASE_URL = "http://localhost:8000"  # ou l'URL de votre API
TEST_AUDIO_FILE = "test_audio.wav"  # Fichier audio de test

def create_speech_audio(filename, duration=3, sample_rate=16000):
    """Crée un fichier audio avec de la parole simulée (sinusoïde modulée)."""
    print(f"🎵 Création d'un fichier audio avec parole simulée ({duration}s)...")
    
    # Générer une sinusoïde modulée pour simuler de la parole
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    
    # Fréquence de base pour la parole (200-800 Hz)
    base_freq = 300
    # Modulation pour simuler des syllabes
    modulation = 0.5 * np.sin(2 * np.pi * 2 * t) + 0.5
    # Fréquence modulée
    freq = base_freq + 200 * modulation
    
    # Générer l'onde audio
    audio_data = np.sin(2 * np.pi * freq * t) * 0.3
    
    # Convertir en 16-bit PCM
    audio_int16 = (audio_data * 32767).astype(np.int16)
    
    # Créer le fichier WAV
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_int16.tobytes())
    
    print(f"✅ Fichier audio créé: {filename} ({duration}s, {sample_rate}Hz)")

def create_real_speech_audio(filename, text="Bonjour, ceci est un test de transcription audio avec Whisper.", duration=5):
    """Crée un fichier audio avec de la vraie parole en utilisant say (macOS) ou espeak."""
    print(f"🎤 Création d'un fichier audio avec vraie parole: '{text}'")
    
    try:
        # Essayer d'abord avec say (macOS)
        subprocess.run([
            "say", "-o", filename, 
            "--file-format=WAVE",
            "--data-format=LEI16",
            "--channels=1",
            "--rate=16000",
            text
        ], check=True)
        print(f"✅ Fichier audio créé avec say: {filename}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        try:
            # Essayer avec espeak
            subprocess.run([
                "espeak", "-w", filename,
                "-s", "150",  # Vitesse
                "-p", "50",   # Pitch
                "-a", "100",  # Amplitude
                text
            ], check=True)
            print(f"✅ Fichier audio créé avec espeak: {filename}")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("⚠️  Impossible de créer de la vraie parole. Utilisation de l'audio simulé.")
            create_speech_audio(filename, duration)
            return False

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
    """Test de transcription avec un fichier audio de test contenant de la parole simulée."""
    print("🎤 Test de transcription Whisper...")
    
    try:
        # Créer un fichier audio avec de la parole simulée
        create_speech_audio(TEST_AUDIO_FILE, duration=3)
        
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
        # Créer un audio avec parole simulée
        create_speech_audio(TEST_AUDIO_FILE, duration=2)
        
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

def test_whisper_service_direct():
    """Test direct du service Whisper sans passer par l'API."""
    print("🔧 Test direct du service Whisper...")
    
    try:
        # Importer le service directement
        import sys
        sys.path.append('backend')
        from whisper_service import get_whisper_service
        
        # Créer un audio de test avec vraie parole
        success = create_real_speech_audio(TEST_AUDIO_FILE, "Bonjour, test de transcription.")
        
        # Lire le fichier
        with open(TEST_AUDIO_FILE, 'rb') as f:
            audio_data = f.read()
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        # Utiliser le service directement
        service = get_whisper_service()
        result = service.transcribe_base64_audio(audio_base64, "wav")
        
        print(f"Résultat direct: {json.dumps(result, indent=2)}")
        
        # Nettoyer
        if os.path.exists(TEST_AUDIO_FILE):
            os.remove(TEST_AUDIO_FILE)
        
        # Vérifier si on a du texte (même si c'est vide, c'est normal pour l'audio simulé)
        has_text = result.get("text", "").strip() != ""
        print(f"Texte transcrit: '{result.get('text', '')}'")
        print(f"Langue détectée: {result.get('language', 'N/A')}")
        print(f"Probabilité langue: {result.get('language_probability', 0):.2f}")
        
        return success and has_text
        
    except Exception as e:
        print(f"❌ Erreur test direct: {e}")
        return False

def test_whisper_model_info():
    """Test des informations du modèle Whisper."""
    print("📊 Test des informations du modèle...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/test-whisper")
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Model info: {json.dumps(result, indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erreur test model info: {e}")
        return False

def test_with_real_audio():
    """Test avec un vrai fichier audio contenant de la parole."""
    print("🎵 Test avec vrai fichier audio...")
    
    try:
        # Créer un fichier audio avec de la vraie parole
        text = "Bonjour, je suis Francis, votre assistant fiscal. Comment puis-je vous aider aujourd'hui?"
        success = create_real_speech_audio(TEST_AUDIO_FILE, text)
        
        if not success:
            print("⚠️  Impossible de créer de la vraie parole. Test annulé.")
            return False
        
        # Importer le service directement
        import sys
        sys.path.append('backend')
        from whisper_service import get_whisper_service
        
        # Lire le fichier
        with open(TEST_AUDIO_FILE, 'rb') as f:
            audio_data = f.read()
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        # Utiliser le service directement
        service = get_whisper_service()
        result = service.transcribe_base64_audio(audio_base64, "wav")
        
        print(f"Texte original: '{text}'")
        print(f"Texte transcrit: '{result.get('text', '')}'")
        print(f"Langue détectée: {result.get('language', 'N/A')}")
        print(f"Probabilité langue: {result.get('language_probability', 0):.2f}")
        print(f"Durée audio: {result.get('duration', 0):.2f}s")
        print(f"Temps transcription: {result.get('transcription_time', 0):.2f}s")
        
        # Nettoyer
        if os.path.exists(TEST_AUDIO_FILE):
            os.remove(TEST_AUDIO_FILE)
        
        has_text = result.get("text", "").strip() != ""
        if has_text:
            print("✅ Transcription réussie avec de la vraie parole !")
        else:
            print("❌ Aucun texte transcrit, même avec de la vraie parole.")
        
        return has_text
        
    except Exception as e:
        print(f"❌ Erreur test vrai audio: {e}")
        return False

def main():
    """Fonction principale de test."""
    print("🚀 Test complet du service Whisper")
    print("=" * 50)
    
    tests = [
        ("Santé Whisper", test_whisper_health),
        ("Informations modèle", test_whisper_model_info),
        ("Service direct", test_whisper_service_direct),
        ("Vrai audio", test_with_real_audio),
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
        print("\n🔍 Conseils de débogage:")
        print("1. Vérifiez que le serveur backend est démarré")
        print("2. Vérifiez que Whisper est installé: pip install faster-whisper")
        print("3. Vérifiez les logs du serveur pour les erreurs")
        print("4. Testez avec un vrai fichier audio contenant de la parole")
        print("5. Si le serveur n'est pas démarré, lancez: cd backend && python main.py")

if __name__ == "__main__":
    main() 