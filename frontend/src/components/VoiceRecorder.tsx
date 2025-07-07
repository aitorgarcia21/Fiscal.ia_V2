import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, CheckCircle, Loader } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptionUpdate: (text: string) => void;
  onTranscriptionComplete: (text: string) => void;
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
  const [accumulatedText, setAccumulatedText] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Configuration audio optimisée pour Whisper
  const audioConfig = {
    sampleRate: 16000,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };

  const startRecording = useCallback(async () => {
    try {
      // Demander l'accès au microphone avec configuration optimisée
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConfig,
        video: false
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      setAccumulatedText('');
      
      // Créer le MediaRecorder avec format optimisé pour Whisper
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Gestion des chunks audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Démarrer l'enregistrement avec chunks ultra-fréquents
      mediaRecorder.start(500); // Chunk toutes les 500ms pour plus de fluidité
      
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Timer pour la durée
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Traitement en temps réel
      startRealTimeProcessing();
      
    } catch (error) {
      console.error('Erreur démarrage enregistrement:', error);
      onError?.('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  }, [onError]);

  const startRealTimeProcessing = () => {
    // Traitement ultra-fluide toutes les 1.5 secondes
    processingTimeoutRef.current = setInterval(async () => {
      if (audioChunksRef.current.length > 0 && !isProcessing) {
        await processAudioChunks();
      }
    }, 1500);
  };

  const processAudioChunks = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Créer un blob avec les chunks accumulés
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convertir en base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
      
      // Envoyer à Whisper avec paramètres optimisés
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
          const newText = result.text.trim();
          // Afficher immédiatement le nouveau texte
          onTranscriptionUpdate(newText);
          // Accumuler pour le texte final
          const updatedText = accumulatedText + ' ' + newText;
          setAccumulatedText(updatedText);
        }
      } else {
        console.error('Erreur API Whisper:', response.status);
      }
      
      // Vider les chunks traités
      audioChunksRef.current = [];
      
    } catch (error) {
      console.error('Erreur traitement audio:', error);
      onError?.('Erreur lors du traitement audio');
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Nettoyer les timers
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      if (processingTimeoutRef.current) {
        clearInterval(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      
      // Traitement final
      if (audioChunksRef.current.length > 0) {
        await processAudioChunks();
      }
      
      // Arrêter le stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Envoyer le texte final
      const finalText = accumulatedText.trim();
      onTranscriptionComplete(finalText);
      setAccumulatedText('');
    }
  }, [isRecording, onTranscriptionComplete, accumulatedText]);

  const handleButtonClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

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
      if (processingTimeoutRef.current) {
        clearInterval(processingTimeoutRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <button
          onClick={handleButtonClick}
          disabled={disabled || isProcessing}
          className={`relative w-16 h-16 rounded-full transition-all duration-300 flex items-center justify-center ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50' 
              : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/50'
          } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <Loader className="w-8 h-8 animate-spin text-white" />
          ) : isRecording ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </button>
        
        {isRecording && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            ●
          </div>
        )}
      </div>
      
      <div className="mt-3 flex flex-col items-center gap-1">
        {isRecording && (
          <span className="text-sm text-red-400 font-mono bg-red-500/10 px-2 py-1 rounded">
            {formatDuration(recordingDuration)}
          </span>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>
            {isProcessing ? 'Traitement Whisper...' : 'Reconnaissance temps réel'}
          </span>
        </div>
        
        {accumulatedText && (
          <div className="mt-2 text-xs text-gray-300 bg-gray-800/50 px-3 py-2 rounded max-w-xs text-center transition-all duration-300">
            <div className="font-semibold text-green-400 mb-1 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Texte en direct :
            </div>
            <div className="text-white font-medium">
              "{accumulatedText.length > 150 ? accumulatedText.substring(0, 150) + '...' : accumulatedText}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 