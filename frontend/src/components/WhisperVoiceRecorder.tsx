import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface WhisperVoiceRecorderProps {
  onTranscriptionUpdate?: (text: string) => void;
  onTranscriptionComplete?: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  autoStart?: boolean;
  onListeningChange?: (isListening: boolean) => void;
}

export const WhisperVoiceRecorder: React.FC<WhisperVoiceRecorderProps> = ({
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

  // 🚀 INITIALISATION WHISPER BACKEND (ULTRA-PRÉCIS)
  useEffect(() => {
    console.log('🎤 Francis Voice: Initialisation Whisper Backend - Précision maximale activée!');
    setIsAvailable(true); // Whisper toujours disponible
    
    // Test de connectivité au backend Whisper
    fetch('/api/whisper/transcribe', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true }) 
    })
      .then((response) => {
        if (response.ok) {
          console.log('✅ Backend Whisper: Connexion établie');
        } else {
          console.warn('⚠️ Backend Whisper: Service en cours de démarrage...');
        }
      })
      .catch(() => {
        console.warn('⚠️ Backend Whisper: Connexion en attente...');
        // Pas d'erreur - le service peut juste être en cours de démarrage
      });
  }, []);

  // Initialisation du MediaRecorder pour capture audio
  const initMediaRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Optimal pour Whisper
        } 
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          
          // Traitement en temps quasi-réel (chunks de 3 secondes)
          if (audioChunksRef.current.length >= 3) {
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
  }, []);

  // 🎯 TRAITEMENT AUDIO WHISPER (Fonction principale)
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
          
          // Appel API Whisper backend
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
            throw new Error(`Erreur API Whisper: ${response.status}`);
          }

          const result = await response.json();
          
          if (result.error) {
            throw new Error(result.error);
          }

          // Mise à jour de la transcription
          const newText = result.text || '';
          if (newText.trim()) {
            if (isFinal) {
              accumulatedTextRef.current = (accumulatedTextRef.current + ' ' + newText).trim();
              setCurrentTranscript(accumulatedTextRef.current);
              onTranscriptionComplete(accumulatedTextRef.current);
              console.log('✅ Francis Whisper (FINAL):', accumulatedTextRef.current);
            } else {
              const tempText = (accumulatedTextRef.current + ' ' + newText).trim();
              setCurrentTranscript(tempText);
              onTranscriptionUpdate(tempText);
              console.log('🎯 Francis Whisper (TEMP):', newText);
            }
          }

          // Vider les chunks traités (garder les derniers pour continuité)
          if (!isFinal) {
            audioChunksRef.current = audioChunksRef.current.slice(-1);
          } else {
            audioChunksRef.current = [];
          }

        } catch (error) {
          console.error('Erreur traitement Whisper:', error);
          setError(`Erreur de transcription: ${error}`);
          onError(`Erreur de transcription: ${error}`);
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsDataURL(audioBlob);

    } catch (error) {
      console.error('Erreur processAudioChunks:', error);
      setIsProcessing(false);
    }
  };

  // Auto-start si demandé
  useEffect(() => {
    if (autoStart && isAvailable && !disabled) {
      startRecording();
    }
  }, [autoStart, isAvailable, disabled]);

  const startRecording = async () => {
    if (!isAvailable || disabled || isRecording) return;
    
    try {
      setError(null);
      setIsProcessing(true);
      
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
      
      // Démarrer l'enregistrement
      mediaRecorderRef.current.start(3000); // Chunks de 3 secondes
      setIsRecording(true);
      setIsProcessing(false);
      
      console.log('🎤 Francis Whisper: Enregistrement démarré');
      
    } catch (error) {
      console.error('Erreur démarrage enregistrement:', error);
      setError(`Erreur de démarrage: ${error}`);
      onError(`Erreur de démarrage: ${error}`);
      setIsRecording(false);
      setIsProcessing(false);
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
      console.log('🛑 Francis Whisper: Enregistrement arrêté');
      
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

  if (!isAvailable) {
    return (
      <div className={`flex items-center text-[#ef4444] ${className}`}>
        <AlertCircle className="mr-2" size={16} />
        <span className="text-sm">Service Whisper non disponible</span>
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
            ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
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
              'bg-gray-400'
            }`} />
            <span className="text-sm font-medium text-gray-300">
              {isRecording ? 'Francis écoute...' : 
               isProcessing ? 'Francis analyse...' : 
               'Francis prêt'}
            </span>
          </div>
          
          <div className="text-xs text-gray-400">
            Backend Whisper • Ultra-précis • Français optimisé
          </div>
        </div>
      </div>
      
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
