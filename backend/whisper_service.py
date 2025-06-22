import base64
import io
import tempfile
import os
from typing import Dict, Any, Optional
from faster_whisper import WhisperModel
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WhisperTranscriptionService:
    def __init__(self, model_size: str = "base"):
        """
        Initialise le service de transcription Whisper.
        
        Args:
            model_size: Taille du modèle ("tiny", "base", "small", "medium", "large")
        """
        self.model_size = model_size
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Charge le modèle Whisper."""
        try:
            logger.info(f"Chargement du modèle Whisper {self.model_size}...")
            self.model = WhisperModel(
                self.model_size,
                device="cpu",  # Utilise CPU pour Railway
                compute_type="int8"  # Optimisation pour la mémoire
            )
            logger.info(f"Modèle Whisper {self.model_size} chargé avec succès")
        except Exception as e:
            logger.error(f"Erreur lors du chargement du modèle Whisper: {e}")
            raise
    
    def transcribe_audio_file(self, audio_path: str) -> Dict[str, Any]:
        """
        Transcrit un fichier audio.
        
        Args:
            audio_path: Chemin vers le fichier audio
            
        Returns:
            Dict avec le texte transcrit et les métadonnées
        """
        try:
            if not self.model:
                self._load_model()
            
            logger.info(f"Transcription du fichier: {audio_path}")
            
            # Transcription avec Whisper
            segments, info = self.model.transcribe(
                audio_path,
                beam_size=5,
                language="fr",  # Français par défaut
                vad_filter=True,  # Filtre de détection de voix
                vad_parameters=dict(min_silence_duration_ms=500)
            )
            
            # Récupération du texte complet
            text = " ".join([segment.text for segment in segments])
            
            # Récupération des segments détaillés
            segments_data = []
            for segment in segments:
                segments_data.append({
                    "start": segment.start,
                    "end": segment.end,
                    "text": segment.text,
                    "words": [
                        {
                            "start": word.start,
                            "end": word.end,
                            "word": word.word,
                            "probability": word.probability
                        } for word in segment.words
                    ] if hasattr(segment, 'words') else []
                })
            
            return {
                "text": text,
                "segments": segments_data,
                "language": info.language,
                "language_probability": info.language_probability,
                "duration": info.duration,
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de la transcription: {e}")
            return {
                "text": "",
                "segments": [],
                "language": "fr",
                "language_probability": 0.0,
                "duration": 0.0,
                "error": str(e)
            }
    
    def transcribe_base64_audio(self, audio_base64: str, audio_format: str = "wav") -> Dict[str, Any]:
        """
        Transcrit un audio encodé en base64.
        
        Args:
            audio_base64: Audio encodé en base64
            audio_format: Format de l'audio (wav, mp3, etc.)
            
        Returns:
            Dict avec le texte transcrit et les métadonnées
        """
        try:
            # Décodage base64
            audio_data = base64.b64decode(audio_base64)
            
            # Création d'un fichier temporaire
            with tempfile.NamedTemporaryFile(suffix=f".{audio_format}", delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                # Transcription
                result = self.transcribe_audio_file(temp_file_path)
                return result
            finally:
                # Nettoyage du fichier temporaire
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            logger.error(f"Erreur lors du traitement base64: {e}")
            return {
                "text": "",
                "segments": [],
                "language": "fr",
                "language_probability": 0.0,
                "duration": 0.0,
                "error": str(e)
            }
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Retourne les informations sur le modèle Whisper.
        
        Returns:
            Dict avec les informations du modèle
        """
        return {
            "model_size": self.model_size,
            "status": "loaded" if self.model else "not_loaded",
            "device": "cpu",
            "compute_type": "int8"
        }

# Instance globale du service
_whisper_service = None

def get_whisper_service() -> WhisperTranscriptionService:
    """
    Retourne l'instance globale du service Whisper.
    
    Returns:
        Instance du service Whisper
    """
    global _whisper_service
    if _whisper_service is None:
        _whisper_service = WhisperTranscriptionService()
    return _whisper_service 