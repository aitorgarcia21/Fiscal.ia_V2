import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Mic, MicOff, CheckCircle, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptionUpdate?: (text: string) => void;
  onTranscriptionComplete?: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptionUpdate,
  onTranscriptionComplete,
  onError,
  disabled = false,
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

<<<<<<< HEAD
  const startRecording = useCallback(async () => {
    try {
      // Demander l'accès au microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      // Créer le MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Collecter les chunks audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Démarrer l'enregistrement
      mediaRecorder.start();
      
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Timer pour la durée
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Erreur démarrage enregistrement:', error);
      onError?.('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  }, [onError]);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      
      // Nettoyer le timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      // Traiter l'audio enregistré
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convertir en base64
        const arrayBuffer = await audioBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
        
        // Envoyer à Whisper
        const response = await fetch('/api/whisper/transcribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio_base64: base64Audio,
            audio_format: 'webm',
            language: 'fr'
          }),
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.text && result.text.trim()) {
            const transcribedText = result.text.trim();
            
            // Mettre à jour en temps réel si callback fourni
            onTranscriptionUpdate?.(transcribedText);
            
            // Envoyer le texte final
            onTranscriptionComplete?.(transcribedText);
          } else {
            onError?.('Aucun texte détecté dans l\'enregistrement.');
          }
        } else {
          throw new Error('Erreur lors de la transcription');
        }
        
      } catch (error) {
        console.error('Erreur traitement audio:', error);
        onError?.('Erreur lors de la transcription audio. Veuillez réessayer.');
      } finally {
        setIsProcessing(false);
        setRecordingDuration(0);
        
        // Nettoyer le stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }
    }
  }, [isRecording, onTranscriptionUpdate, onTranscriptionComplete, onError]);
=======
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsAvailable(false);
      onError?.('La reconnaissance vocale n\'est pas supportée par votre navigateur');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'fr-FR';

    recognitionRef.current.onerror = (event) => {
      console.error('Erreur reconnaissance vocale:', event.error);
      if (event.error !== 'no-speech') {
        onError?.(`Erreur: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      if (isRecordingRef.current) {
        recognitionRef.current.start(); // Redémarrer si toujours en mode enregistrement
      }
    };

    if (autoStart) {
      handleButtonClick();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [autoStart]);

  const handleButtonClick = () => {
    if (!isAvailable || disabled) return;

    if (!isRecording) {
      accumulatedTextRef.current = '';
      recognitionRef.current.start();
      setIsRecording(true);
    } else {
      recognitionRef.current.stop();
      setIsRecording(false);
      onTranscriptionComplete(accumulatedTextRef.current);
    }
  };
>>>>>>> 8417bedd ([FRANCIS] Intégration dans Dashboard Pro + correctif enregistrement vocal)

  recognitionRef.current.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript.trim() + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    onTranscriptionUpdate(accumulatedTextRef.current + finalTranscript + interimTranscript);
    
    if (finalTranscript) {
      accumulatedTextRef.current += finalTranscript;
    }
  };

  // Formatage de la durée
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
<<<<<<< HEAD
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Bouton d'enregistrement */}
      <button
        onClick={handleButtonClick}
        disabled={disabled || isProcessing}
        className={`
          relative p-6 rounded-full transition-all duration-300 shadow-lg
          ${isRecording 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
            : isProcessing
            ? 'bg-gray-500 text-white cursor-not-allowed'
            : 'bg-[#c5a572] hover:bg-[#e8cfa0] text-[#162238] hover:scale-105'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={isRecording ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"}
      >
        {isRecording ? (
          <MicOff className="w-8 h-8" />
        ) : isProcessing ? (
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </button>

      {/* Indicateurs de statut */}
      <div className="flex flex-col items-center gap-2 text-sm">
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-mono">
              {formatDuration(recordingDuration)}
            </span>
          </div>
        )}
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-blue-400">
            <CheckCircle className="w-4 h-4" />
            <span>Transcription en cours...</span>
          </div>
        )}
        
        {!isRecording && !isProcessing && (
          <div className="flex items-center gap-2 text-gray-400">
            <Mic className="w-4 h-4" />
            <span>Cliquez pour enregistrer</span>
          </div>
        )}
=======
    <div className={`flex flex-col items-center ${className}`}>
      <Button
        onClick={handleButtonClick}
        disabled={disabled}
        className={`relative w-16 h-16 rounded-full transition-all duration-300 ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
      </Button>
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span>Reconnaissance instantanée activée</span>
>>>>>>> 8417bedd ([FRANCIS] Intégration dans Dashboard Pro + correctif enregistrement vocal)
      </div>

      {/* Instructions */}
      {!isRecording && !isProcessing && (
        <div className="text-center text-xs text-gray-500 max-w-xs">
          <p>Parlez clairement pendant l'enregistrement</p>
          <p>L'enregistrement sera automatiquement transcrit</p>
        </div>
      )}
    </div>
  );
}; 