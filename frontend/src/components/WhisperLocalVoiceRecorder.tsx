import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface WhisperLocalVoiceRecorderProps {
  onTranscriptionUpdate?: (text: string) => void;
  onTranscriptionComplete?: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  autoStart?: boolean;
  onListeningChange?: (isListening: boolean) => void;
}

export const WhisperLocalVoiceRecorder: React.FC<WhisperLocalVoiceRecorderProps> = ({
  onTranscriptionUpdate = () => {},
  onTranscriptionComplete = () => {},
  onError = () => {},
  disabled = false,
  className = '',
  autoStart = false,
  onListeningChange = () => {},
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const accumulatedTextRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);

  // Appeler onListeningChange lorsque l'état d'enregistrement change
  useEffect(() => {
    onListeningChange(isRecording);
    isRecordingRef.current = isRecording;
  }, [isRecording, onListeningChange]);

  // 🎯 WHISPER LOCAL HEALTH CHECK AU STARTUP
  useEffect(() => {
    console.log('🎤 Whisper Local Voice Recorder: Vérification du service...');
    
    // Test de connectivité au backend Whisper Local
    fetch('/api/whisper/health')
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'healthy') {
          console.log('✅ Whisper Local: Service opérationnel!', data);
          setIsAvailable(true);
        } else {
          console.warn('⚠️ Whisper Local: Service non disponible', data);
          setError(data.message || 'Service non disponible');
          setIsAvailable(false);
        }
      })
      .catch((e) => {
        console.error('❌ Whisper Local: Erreur de connexion', e);
        setError('Impossible de se connecter au service Whisper Local');
        setIsAvailable(false);
        onError('Service Whisper Local non disponible');
      });
  }, [onError]);

  // Initialisation du MediaRecorder pour capture audio
  const initMediaRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Optimal pour Whisper
          channelCount: 1, // Mono pour optimiser
        } 
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          
          // 🏆 TRAITEMENT WHISPER LOCAL (chunks de 2 secondes pour réactivité)
          if (audioChunksRef.current.length >= 2) {
            processAudioChunks();
          }
        }
      };

      mediaRecorder.onstop = async () => {
        // Traitement final
        if (audioChunksRef.current.length > 0) {
          await processAudioChunks(true);
        }
      };

      mediaRecorderRef.current = mediaRecorder;

    } catch (error) {
      console.error('Erreur initialisation MediaRecorder:', error);
      setError('Impossible d\'accéder au microphone');
      onError('Impossible d\'accéder au microphone');
    }
  }, [onError]);

  // 🎯 TRAITEMENT AUDIO WHISPER LOCAL (Fonction principale)
  const processAudioChunks = async (isFinal = false) => {
    if (audioChunksRef.current.length === 0) return;

    try {
      setIsProcessing(true);

      // Convertir les chunks en blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convertir en base64 pour l'envoi
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          
          // 🎯 APPEL API WHISPER LOCAL (notre endpoint fonctionnel)
          const response = await fetch('/api/whisper/transcribe-ultra-fluid', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audio_base64: base64Audio,
              language: 'fr'
            }),
          });

          if (!response.ok) {
            throw new Error(`Erreur API Whisper Local: ${response.status}`);
          }

          const result = await response.json();
          
          if (result.error && !result.error.includes('Invalid data')) {
            throw new Error(result.error);
          }

          // Mise à jour de la transcription avec déduplication intelligente
          const newText = (result.text || '').trim();
          if (newText && newText.length > 2) {
            // Déduplication : vérifier si le nouveau texte n'est pas déjà présent
            const currentAccumulated = accumulatedTextRef.current.toLowerCase();
            const newTextLower = newText.toLowerCase();
            
            const isNewContent = isFinal || !currentAccumulated.includes(newTextLower);
            
            if (isFinal) {
              // Traitement final : consolider le texte
              if (isNewContent) {
                accumulatedTextRef.current = (accumulatedTextRef.current + ' ' + newText).trim();
              }
              setCurrentTranscript(accumulatedTextRef.current);
              onTranscriptionComplete(accumulatedTextRef.current);
              console.log('🎤 Whisper Local FINAL:', accumulatedTextRef.current);
            } else {
              // Traitement temporaire : afficher le progrès
              if (isNewContent) {
                const tempText = accumulatedTextRef.current + ' ' + newText;
                setCurrentTranscript(tempText);
                onTranscriptionUpdate(tempText.trim());
                console.log('🎤 Whisper Local TEMP:', newText);
              }
            }
          }

        } catch (error) {
          console.error('Erreur traitement audio Whisper Local:', error);
          if (isFinal) {
            setError(`Erreur: ${error}`);
            onError(`Erreur Whisper Local: ${error}`);
          }
        } finally {
          setIsProcessing(false);
          
          // Reset des chunks pour le prochain traitement
          if (!isFinal) {
            audioChunksRef.current = audioChunksRef.current.slice(-1); // Garder le dernier chunk pour continuité
          }
        }
      };
      
      reader.readAsDataURL(audioBlob);
      
    } catch (error) {
      console.error('Erreur processAudioChunks:', error);
      setError(`Erreur: ${error}`);
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    if (disabled || !isAvailable || isRecording) return;
    
    setError(null);
    
    try {
      // Initialiser le MediaRecorder si pas encore fait
      if (!mediaRecorderRef.current) {
        await initMediaRecorder();
      }
      
      if (!mediaRecorderRef.current) {
        throw new Error('Impossible d\'initialiser l\'enregistreur audio');
      }

      // Reset
      audioChunksRef.current = [];
      accumulatedTextRef.current = '';
      setCurrentTranscript('');
      
      // Démarrer l'enregistrement WHISPER LOCAL OPTIMISÉ
      mediaRecorderRef.current.start(2000); // 🎯 Chunks de 2 secondes pour réactivité maximale
      setIsRecording(true);
      
      console.log('🎤 Whisper Local: Enregistrement démarré');
      
    } catch (error) {
      console.error('Erreur démarrage enregistrement:', error);
      setError(`Erreur de démarrage: ${error}`);
      onError(`Erreur de démarrage: ${error}`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    
    try {
      setIsProcessing(true);
      
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      setIsRecording(false);
      console.log('🛑 Whisper Local: Enregistrement arrêté');
      
    } catch (error) {
      console.error('Erreur arrêt enregistrement:', error);
      setError(`Erreur d'arrêt: ${error}`);
    }
  };

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Auto-start si demandé
  useEffect(() => {
    if (autoStart && isAvailable && !disabled && !isRecording) {
      startRecording();
    }
  }, [autoStart, isAvailable, disabled]);

  if (!isAvailable) {
    return (
      <div className={`flex items-center text-[#ef4444] ${className}`}>
        <AlertCircle className="mr-2" size={16} />
        <span className="text-sm">Service Whisper Local non disponible</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <button
          onClick={handleButtonClick}
          disabled={disabled || isProcessing}
          className={`
            relative flex items-center justify-center w-12 h-12 rounded-full 
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#c5a572]/50
            ${isRecording 
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25' 
              : 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] hover:from-[#e8cfa0] hover:to-[#c5a572] text-[#162238] shadow-lg shadow-[#c5a572]/25'
            }
            ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
          `}
          aria-label={isRecording ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement'}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${
              isRecording ? 'bg-red-500 animate-pulse' : 
              isProcessing ? 'bg-yellow-500 animate-pulse' :
              'bg-green-500'
            }`} />
            <span className="text-sm font-medium text-gray-300">
              {isRecording ? 'Whisper Local écoute...' : 
               isProcessing ? 'Whisper Local traite...' : 
               'Whisper Local prêt'}
            </span>
          </div>
          
          <div className="text-xs text-gray-400">
            Whisper Local • Ultra-précis • Français natif • Zéro latence
          </div>
        </div>
      </div>
      
      {/* Transcription en cours */}
      {currentTranscript && (
        <div className="mt-2 p-2 bg-[#162238]/50 rounded text-sm text-gray-300 border border-[#c5a572]/20">
          <div className="text-xs text-[#c5a572] mb-1">Transcription:</div>
          {currentTranscript}
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-xs text-red-400 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" /> {error}
        </div>
      )}
      
      {/* Indicateur d'enregistrement */}
      {isRecording && (
        <div className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
          ●
        </div>
      )}
    </div>
  );
};
