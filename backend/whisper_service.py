import base64
import io
import tempfile
import os
import time
from typing import Dict, Any, Optional
from faster_whisper import WhisperModel
import logging
from functools import lru_cache

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WhisperTranscriptionService:
    def __init__(self, model_size: str = "base"):
        """
        Initialise le service de transcription Whisper avec optimisations.
        
        Args:
            model_size: Taille du modèle ("tiny", "base", "small", "medium", "large")
        """
        self.model_size = model_size
        self.model = None
        self._is_loading = False
        self._load_start_time = None
        self._last_health_check = 0
        self._health_status = "unknown"
        
        # Optimisations pour Railway
        self._model_cache = {}
        self._transcription_cache = {}
    
    def _load_model(self):
        """Charge le modèle Whisper avec optimisations."""
        if self._is_loading:
            logger.info("Modèle déjà en cours de chargement...")
            return
            
        try:
            self._is_loading = True
            self._load_start_time = time.time()
            logger.info(f"Chargement du modèle Whisper {self.model_size}...")
            
            # Optimisations pour Railway
            self.model = WhisperModel(
                self.model_size,
                device="cpu",  # Utilise CPU pour Railway
                compute_type="int8",  # Optimisation pour la mémoire
                download_root="/tmp/whisper_models",  # Cache local
                local_files_only=False  # Permet le téléchargement si nécessaire
            )
            
            load_time = time.time() - self._load_start_time
            logger.info(f"Modèle Whisper {self.model_size} chargé avec succès en {load_time:.2f}s")
            self._health_status = "healthy"
            
        except Exception as e:
            logger.error(f"Erreur lors du chargement du modèle Whisper: {e}")
            self._health_status = "error"
            raise
        finally:
            self._is_loading = False
    
    def _ensure_model_loaded(self):
        """S'assure que le modèle est chargé."""
        if self.model is None and not self._is_loading:
            self._load_model()
        elif self._is_loading:
            # Attendre que le chargement soit terminé
            while self._is_loading:
                time.sleep(0.1)
    
    def _get_cache_key(self, audio_data: bytes) -> str:
        """Génère une clé de cache pour l'audio."""
        import hashlib
        return hashlib.md5(audio_data).hexdigest()
    
    @lru_cache(maxsize=100)
    def _cached_transcribe(self, cache_key: str, audio_path: str) -> Dict[str, Any]:
        """Transcription avec cache pour éviter les doublons."""
        return self._transcribe_audio_file_internal(audio_path)
    
    def _transcribe_audio_file_internal(self, audio_path: str) -> Dict[str, Any]:
        """
        Transcription interne optimisée.
        
        Args:
            audio_path: Chemin vers le fichier audio
            
        Returns:
            Dict avec le texte transcrit et les métadonnées
        """
        try:
            self._ensure_model_loaded()
            
            if not self.model:
                raise Exception("Modèle Whisper non disponible")
            
            start_time = time.time()
            logger.info(f"Transcription du fichier: {audio_path}")
            
            # Transcription avec Whisper optimisée
            segments, info = self.model.transcribe(
                audio_path,
                beam_size=3,  # Réduit pour plus de vitesse
                language="fr",  # Français par défaut
                vad_filter=True,  # Filtre de détection de voix
                vad_parameters=dict(
                    min_silence_duration_ms=300,  # Plus sensible
                    speech_pad_ms=100  # Padding pour éviter les coupures
                ),
                condition_on_previous_text=False,  # Plus rapide
                temperature=0.0  # Déterministe pour la cohérence
            )
            
            # Récupération du texte complet avec nettoyage
            text_segments = []
            segments_data = []
            
            for segment in segments:
                clean_text = segment.text.strip()
                if clean_text:
                    text_segments.append(clean_text)
                    segments_data.append({
                        "start": segment.start,
                        "end": segment.end,
                        "text": clean_text,
                        "words": [
                            {
                                "start": word.start,
                                "end": word.end,
                                "word": word.word,
                                "probability": word.probability
                            } for word in segment.words
                        ] if hasattr(segment, 'words') else []
                    })
            
            text = " ".join(text_segments)
            transcription_time = time.time() - start_time
            
            logger.info(f"Transcription terminée en {transcription_time:.2f}s - {len(text)} caractères")
            
            return {
                "text": text,
                "segments": segments_data,
                "language": info.language,
                "language_probability": info.language_probability,
                "duration": info.duration,
                "transcription_time": transcription_time,
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
                "transcription_time": 0.0,
                "error": str(e)
            }
    
    def transcribe_audio_file(self, audio_path: str) -> Dict[str, Any]:
        """
        Transcrit un fichier audio avec cache.
        
        Args:
            audio_path: Chemin vers le fichier audio
            
        Returns:
            Dict avec le texte transcrit et les métadonnées
        """
        try:
            # Vérifier le cache
            with open(audio_path, 'rb') as f:
                audio_data = f.read()
            
            cache_key = self._get_cache_key(audio_data)
            
            # Utiliser le cache si disponible
            if cache_key in self._transcription_cache:
                logger.info("Utilisation du cache pour la transcription")
                return self._transcription_cache[cache_key]
            
            # Transcription normale
            result = self._transcribe_audio_file_internal(audio_path)
            
            # Mettre en cache si succès
            if not result.get("error") and result.get("text"):
                self._transcription_cache[cache_key] = result
                # Limiter la taille du cache
                if len(self._transcription_cache) > 50:
                    # Supprimer les plus anciens
                    oldest_key = next(iter(self._transcription_cache))
                    del self._transcription_cache[oldest_key]
            
            return result
            
        except Exception as e:
            logger.error(f"Erreur lors de la transcription: {e}")
            return {
                "text": "",
                "segments": [],
                "language": "fr",
                "language_probability": 0.0,
                "duration": 0.0,
                "transcription_time": 0.0,
                "error": str(e)
            }
    
    def transcribe_base64_audio(self, audio_base64: str, audio_format: str = "wav") -> Dict[str, Any]:
        """
        Transcrit un audio encodé en base64 avec optimisations.
        
        Args:
            audio_base64: Audio encodé en base64
            audio_format: Format de l'audio (wav, mp3, etc.)
            
        Returns:
            Dict avec le texte transcrit et les métadonnées
        """
        try:
            # Décodage base64
            audio_data = base64.b64decode(audio_base64)
            
            # Vérifier le cache
            cache_key = self._get_cache_key(audio_data)
            if cache_key in self._transcription_cache:
                logger.info("Utilisation du cache pour la transcription base64")
                return self._transcription_cache[cache_key]
            
            # Création d'un fichier temporaire
            with tempfile.NamedTemporaryFile(suffix=f".{audio_format}", delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                # Transcription
                result = self._transcribe_audio_file_internal(temp_file_path)
                
                # Mettre en cache si succès
                if not result.get("error") and result.get("text"):
                    self._transcription_cache[cache_key] = result
                    # Limiter la taille du cache
                    if len(self._transcription_cache) > 50:
                        oldest_key = next(iter(self._transcription_cache))
                        del self._transcription_cache[oldest_key]
                
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
                "transcription_time": 0.0,
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
            "status": "loaded" if self.model else ("loading" if self._is_loading else "not_loaded"),
            "device": "cpu",
            "compute_type": "int8",
            "cache_size": len(self._transcription_cache),
            "health_status": self._health_status
        }
    
    def check_health(self) -> Dict[str, Any]:
        """
        Vérifie la santé du service Whisper.
        
        Returns:
            Dict avec le statut de santé
        """
        current_time = time.time()
        
        # Éviter les vérifications trop fréquentes
        if current_time - self._last_health_check < 5:  # 5 secondes
            return {
                "status": self._health_status,
                "model_loaded": self.model is not None,
                "is_loading": self._is_loading,
                "cache_size": len(self._transcription_cache)
            }
        
        self._last_health_check = current_time
        
        try:
            if self.model is None and not self._is_loading:
                self._load_model()
            
            if self.model:
                self._health_status = "healthy"
            else:
                self._health_status = "loading" if self._is_loading else "error"
                
        except Exception as e:
            logger.error(f"Erreur lors de la vérification de santé: {e}")
            self._health_status = "error"
        
        return {
            "status": self._health_status,
            "model_loaded": self.model is not None,
            "is_loading": self._is_loading,
            "cache_size": len(self._transcription_cache)
        }

# Instance globale du service avec chargement lazy
_whisper_service = None

def get_whisper_service() -> WhisperTranscriptionService:
    """
    Retourne l'instance globale du service Whisper avec chargement lazy.
    
    Returns:
        Instance du service Whisper
    """
    global _whisper_service
    if _whisper_service is None:
        _whisper_service = WhisperTranscriptionService()
    return _whisper_service

def transcribe_audio_file(audio_path: str) -> str:
    """
    Fonction simple pour transcrire un fichier audio.
    
    Args:
        audio_path: Chemin vers le fichier audio
        
    Returns:
        Texte transcrit
    """
    try:
        service = get_whisper_service()
        result = service.transcribe_audio_file(audio_path)
        
        if result.get("error"):
            logger.error(f"Erreur de transcription: {result['error']}")
            return ""
        
        return result.get("text", "")
        
    except Exception as e:
        logger.error(f"Erreur lors de la transcription: {e}")
        return "" 