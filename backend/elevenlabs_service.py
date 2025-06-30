import os
try:
    from elevenlabs import Voice, VoiceSettings, play, stream
    from elevenlabs.client import ElevenLabs
except ImportError:  # Bibliothèque non installée dans le contexte de test
    Voice = VoiceSettings = play = stream = None  # type: ignore
    ElevenLabs = None  # type: ignore

def get_elevenlabs_client():
    """Crée et retourne un client ElevenLabs."""
    if ElevenLabs is None:
        raise ImportError("La bibliothèque 'elevenlabs' n'est pas installée dans l'environnement.")
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise ValueError("La clé API ElevenLabs est manquante.")
    return ElevenLabs(api_key=api_key)

def text_to_speech_stream(text: str, client: ElevenLabs):
    """Génère un flux audio à partir du texte en utilisant ElevenLabs."""
    if Voice is None or VoiceSettings is None:
        raise ImportError("La bibliothèque 'elevenlabs' n'est pas disponible pour générer l'audio.")
    return client.generate(
        text=text,
        voice=Voice(
            voice_id='21m00Tcm4TlvDq8ikWAM',  # Voix pré-sélectionnée (par exemple, "Rachel")
            settings=VoiceSettings(stability=0.71, similarity_boost=0.5, style=0.0, use_speaker_boost=True)
        ),
        stream=True
    ) 