#!/usr/bin/env python3
"""
Script de test pour Whisper
"""

import base64
import tempfile
import os
from backend.whisper_service import WhisperTranscriptionService

def test_whisper():
    """Test basique de Whisper"""
    print("🧪 Test de Whisper...")
    
    try:
        # Initialiser le service
        print("📥 Chargement du modèle Whisper...")
        whisper_service = WhisperTranscriptionService(model_size="base")
        
        # Vérifier les infos du modèle
        info = whisper_service.get_model_info()
        print(f"✅ Modèle chargé: {info}")
        
        # Créer un fichier audio de test (silence)
        print("🎵 Création d'un fichier audio de test...")
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            # Créer un fichier WAV minimal (silence de 1 seconde)
            # Header WAV simple
            sample_rate = 16000
            duration = 1  # 1 seconde
            num_samples = sample_rate * duration
            
            # Header WAV
            header = bytearray()
            header.extend(b'RIFF')
            header.extend((36 + num_samples * 2).to_bytes(4, 'little'))  # Taille du fichier
            header.extend(b'WAVE')
            header.extend(b'fmt ')
            header.extend((16).to_bytes(4, 'little'))  # Taille du format
            header.extend((1).to_bytes(2, 'little'))   # Format PCM
            header.extend((1).to_bytes(2, 'little'))   # Mono
            header.extend(sample_rate.to_bytes(4, 'little'))  # Sample rate
            header.extend((sample_rate * 2).to_bytes(4, 'little'))  # Byte rate
            header.extend((2).to_bytes(2, 'little'))   # Block align
            header.extend((16).to_bytes(2, 'little'))  # Bits per sample
            header.extend(b'data')
            header.extend((num_samples * 2).to_bytes(4, 'little'))  # Taille des données
            
            # Données audio (silence)
            audio_data = bytearray([0] * (num_samples * 2))
            
            temp_file.write(header + audio_data)
            temp_file_path = temp_file.name
        
        try:
            # Tester la transcription
            print("🎤 Test de transcription...")
            result = whisper_service.transcribe_audio_file(temp_file_path)
            
            print(f"📝 Résultat: {result}")
            
            if result['error']:
                print(f"❌ Erreur: {result['error']}")
                return False
            else:
                print("✅ Transcription réussie (même si le texte est vide pour du silence)")
                return True
                
        finally:
            # Nettoyer
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        print(f"❌ Erreur lors du test: {e}")
        return False

if __name__ == "__main__":
    success = test_whisper()
    if success:
        print("\n🎉 Test Whisper réussi !")
    else:
        print("\n💥 Test Whisper échoué !") 