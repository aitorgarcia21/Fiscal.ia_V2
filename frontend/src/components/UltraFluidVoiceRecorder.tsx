import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UltraFluidVoiceRecorderProps {
  onTranscriptionUpdate?: (text: string) => void;
  onTranscriptionComplete?: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  autoStart?: boolean;
  onListeningChange?: (isListening: boolean) => void;
  streamingMode?: boolean; // Mode streaming vers Whisper
  realTimeMode?: boolean; // Mode temps réel avec Web Speech API
}

export const UltraFluidVoiceRecorder: React.FC<UltraFluidVoiceRecorderProps> = ({
  onTranscriptionUpdate = () => {},
  onTranscriptionComplete = () => {},
  onError = () => {},
  disabled = false,
  className = '',
  autoStart = false,
  onListeningChange = () => {},
  streamingMode = true,
  realTimeMode = true,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [latency, setLatency] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const accumulatedTextRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);
  const lastResultRef = useRef<string>('');
  const streamRef = useRef<MediaStream | null>(null);
  const latencyTimerRef = useRef<number>(0);

  // Appeler onListeningChange lorsque l'état d'enregistrement change
  useEffect(() => {
    onListeningChange(isRecording);
  }, [isRecording, onListeningChange]);

  // Initialisation de la reconnaissance vocale native (temps réel)
  useEffect(() => {
    if (!realTimeMode) return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsAvailable(false);
      onError('La reconnaissance vocale native n\'est pas supportée');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'fr-FR';
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onerror = (event: any) => {
      console.error('Erreur reconnaissance vocale:', event.error);
      if (event.error !== 'no-speech') {
        onError(`Erreur: ${event.error}`);
      }
      setIsRecording(false);
      isRecordingRef.current = false;
    };

    recognitionRef.current.onend = () => {
      if (isRecordingRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Erreur de relance de la reconnaissance:', error);
          setIsRecording(false);
          isRecordingRef.current = false;
        }
      }
    };

    recognitionRef.current.onresult = (event: any) => {
      const startTime = performance.now();
      
      let interimTranscript = '';
      let finalTranscript = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence || 0;
        maxConfidence = Math.max(maxConfidence, confidence);
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Calcul de la latence
      const endTime = performance.now();
      const currentLatency = endTime - startTime;
      setLatency(currentLatency);
      setConfidence(maxConfidence);

      if (finalTranscript) {
        accumulatedTextRef.current = (accumulatedTextRef.current + ' ' + finalTranscript).trim();
        const currentText = accumulatedTextRef.current;
        lastResultRef.current = currentText;
        setCurrentTranscript(currentText);
        onTranscriptionUpdate(currentText);
      } else if (interimTranscript) {
        const fullText = accumulatedTextRef.current + (accumulatedTextRef.current ? ' ' : '') + interimTranscript;
        lastResultRef.current = interimTranscript;
        setCurrentTranscript(fullText);
        onTranscriptionUpdate(fullText);
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [realTimeMode, onError, onTranscriptionUpdate, onListeningChange]);

  // Streaming vers Whisper (mode ultra-fluide)
  const streamToWhisper = useCallback(async (audioBlob: Blob) => {
    try {
      const startTime = performance.now();
      
      // Convertir en base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
      
      // Envoyer à Whisper avec optimisations
      const response = await fetch('/api/whisper/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_base64: base64Audio,
          audio_format: 'webm',
          language: 'fr',
          streaming: true, // Indicateur de streaming
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur Whisper: ${response.status}`);
      }

      const result = await response.json();
      const endTime = performance.now();
      const whisperLatency = endTime - startTime;
      
      console.log(`🎤 Whisper streaming - Latence: ${whisperLatency.toFixed(0)}ms, Confiance: ${result.language_probability || 0}`);
      
      if (result.text) {
        // Fusion intelligente avec le texte natif
        const whisperText = result.text.trim();
        const nativeText = accumulatedTextRef.current;
        
        // Si le texte Whisper est plus long, l'utiliser
        if (whisperText.length > nativeText.length * 0.8) {
          accumulatedTextRef.current = whisperText;
          setCurrentTranscript(whisperText);
          onTranscriptionUpdate(whisperText);
        }
      }

      return result;
    } catch (error) {
      console.error('Erreur streaming Whisper:', error);
      onError('Erreur de transcription Whisper');
    }
  }, [onTranscriptionUpdate, onError]);

  // Initialisation du MediaRecorder pour streaming
  useEffect(() => {
    if (!streamingMode) return;

    const initMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
          } 
        });
        
        streamRef.current = stream;
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
          audioBitsPerSecond: 16000,
        });
        
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            
            // Streaming en temps réel vers Whisper
            if (streamingMode && isRecordingRef.current) {
              const audioBlob = new Blob([event.data], { type: 'audio/webm' });
              await streamToWhisper(audioBlob);
            }
          }
        };

        mediaRecorder.onstop = async () => {
          if (audioChunksRef.current.length > 0) {
            const finalBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            await streamToWhisper(finalBlob);
          }
        };

      } catch (error) {
        console.error('Erreur initialisation MediaRecorder:', error);
        onError('Impossible d\'accéder au microphone');
      }
    };

    initMediaRecorder();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [streamingMode, streamToWhisper, onError]);

  useEffect(() => {
    if (autoStart && isAvailable && !disabled) {
      startRecording();
    }
  }, [autoStart, isAvailable, disabled]);

  const startRecording = () => {
    if (!isAvailable || disabled) {
      setError('La reconnaissance vocale n\'est pas disponible');
      return;
    }
    
    setError(null);
    setIsProcessing(true);
    latencyTimerRef.current = performance.now();
    
    try {
      // Démarrer la reconnaissance native
      if (realTimeMode && recognitionRef.current) {
        recognitionRef.current.start();
      }
      
      // Démarrer le MediaRecorder pour streaming
      if (streamingMode && mediaRecorderRef.current) {
        mediaRecorderRef.current.start(1000); // Chunk toutes les secondes
      }
      
      setIsRecording(true);
      isRecordingRef.current = true;
      lastResultRef.current = '';
      setCurrentTranscript('');
      setLatency(0);
      setConfidence(0);
      
    } catch (error) {
      console.error('Erreur démarrage enregistrement:', error);
      const errorMsg = 'Erreur lors du démarrage de l\'enregistrement';
      setError(errorMsg);
      onError(errorMsg);
      setIsRecording(false);
      isRecordingRef.current = false;
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    if (!isAvailable || !isRecording) {
      setIsProcessing(false);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Arrêter la reconnaissance native
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      // Arrêter le MediaRecorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      const finalText = accumulatedTextRef.current.trim();
      if (finalText) {
        onTranscriptionComplete(finalText);
      } else if (lastResultRef.current) {
        onTranscriptionComplete(lastResultRef.current);
      }
      
    } catch (error) {
      console.error('Erreur arrêt enregistrement:', error);
      setError('Erreur lors de l\'arrêt de l\'enregistrement');
    } finally {
      setIsRecording(false);
      isRecordingRef.current = false;
      setIsProcessing(false);
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
        <span className="text-sm">Reconnaissance vocale non disponible</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <button
          onClick={handleButtonClick}
          disabled={disabled || isProcessing}
          className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full transition-all ${
            isRecording
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
              : 'bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] text-[#162238] hover:shadow-lg hover:shadow-[#c5a572]/30'
          } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'} ${className}`}
          aria-label={isRecording ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement'}
        >
          {isProcessing && !isRecording ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isRecording ? (
            <div className="flex items-center justify-center w-6 h-6">
              <div className="absolute w-4 h-4 bg-white rounded-full animate-ping"></div>
              <MicOff size={20} className="relative" />
            </div>
          ) : (
            <Mic size={20} />
          )}
        </button>
        
        <div className="flex-1">
          <div className="text-sm text-gray-300 mb-1">
            {isRecording ? 'Enregistrement ultra-fluide...' : 'Appuyez pour dicter'}
          </div>
          
          {/* Indicateurs de performance en temps réel */}
          {isRecording && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${latency < 100 ? 'bg-green-400' : latency < 300 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                <span className="text-gray-400">Latence: {latency.toFixed(0)}ms</span>
              </div>
              
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${confidence > 0.8 ? 'bg-green-400' : confidence > 0.6 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                <span className="text-gray-400">Confiance: {(confidence * 100).toFixed(0)}%</span>
              </div>
              
              {streamingMode && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                  <span className="text-gray-400">Streaming Whisper</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-xs text-red-400 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" /> {error}
        </div>
      )}
      
      {/* Indicateur de transcription en cours */}
      {isRecording && currentTranscript && (
        <div className="mt-3 p-3 bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-lg">
          <div className="text-xs text-[#c5a572] mb-1">Transcription en temps réel:</div>
          <div className="text-sm text-gray-300 whitespace-pre-wrap">
            {currentTranscript}
            <span className="inline-block w-1 h-4 bg-[#c5a572] ml-1 animate-pulse"></span>
          </div>
        </div>
      )}
      
      {isRecording && (
        <div className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
          •
        </div>
      )}
    </div>
  );
};