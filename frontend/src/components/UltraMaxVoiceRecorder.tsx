import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, CheckCircle, AlertCircle, Loader2, Zap, TrendingUp, Activity } from 'lucide-react';

interface UltraMaxVoiceRecorderProps {
  onTranscriptionUpdate?: (text: string) => void;
  onTranscriptionComplete?: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  autoStart?: boolean;
  onListeningChange?: (isListening: boolean) => void;
  ultraMaxMode?: boolean; // Mode ULTRA-MAX
  performanceMode?: boolean; // Mode performance extrême
}

export const UltraMaxVoiceRecorder: React.FC<UltraMaxVoiceRecorderProps> = ({
  onTranscriptionUpdate = () => {},
  onTranscriptionComplete = () => {},
  onError = () => {},
  disabled = false,
  className = '',
  autoStart = false,
  onListeningChange = () => {},
  ultraMaxMode = true,
  performanceMode = true,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [latency, setLatency] = useState(0);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [optimizationLevel, setOptimizationLevel] = useState('ULTRA-MAX');
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const accumulatedTextRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);
  const lastResultRef = useRef<string>('');
  const streamRef = useRef<MediaStream | null>(null);
  const latencyTimerRef = useRef<number>(0);
  const performanceMetricsRef = useRef<{
    totalRequests: number;
    avgLatency: number;
    successRate: number;
    cacheHits: number;
  }>({
    totalRequests: 0,
    avgLatency: 0,
    successRate: 0,
    cacheHits: 0,
  });

  // Appeler onListeningChange lorsque l'état d'enregistrement change
  useEffect(() => {
    onListeningChange(isRecording);
  }, [isRecording, onListeningChange]);

  // Initialisation de la reconnaissance vocale native (temps réel ULTRA-MAX)
  useEffect(() => {
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

      // Calcul de la latence ULTRA-MAX
      const endTime = performance.now();
      const currentLatency = endTime - startTime;
      setLatency(currentLatency);
      setConfidence(maxConfidence);

      // Mise à jour des métriques de performance
      performanceMetricsRef.current.totalRequests++;
      performanceMetricsRef.current.avgLatency = (
        (performanceMetricsRef.current.avgLatency * (performanceMetricsRef.current.totalRequests - 1) + currentLatency) 
        / performanceMetricsRef.current.totalRequests
      );

      if (finalTranscript) {
        accumulatedTextRef.current = (accumulatedTextRef.current + ' ' + finalTranscript).trim();
        const currentText = accumulatedTextRef.current;
        lastResultRef.current = currentText;
        setCurrentTranscript(currentText);
        onTranscriptionUpdate(currentText);
        
        // Mise à jour du taux de succès
        performanceMetricsRef.current.successRate = (
          (performanceMetricsRef.current.successRate * (performanceMetricsRef.current.totalRequests - 1) + 1) 
          / performanceMetricsRef.current.totalRequests
        );
      } else if (interimTranscript) {
        const fullText = accumulatedTextRef.current + (accumulatedTextRef.current ? ' ' : '') + interimTranscript;
        lastResultRef.current = interimTranscript;
        setCurrentTranscript(fullText);
        onTranscriptionUpdate(fullText);
      }

      // Calcul du score de performance ULTRA-MAX
      const score = Math.max(0, 100 - (currentLatency / 10));
      setPerformanceScore(score);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onError, onTranscriptionUpdate, onListeningChange]);

  // Streaming vers Whisper ULTRA-MAX
  const streamToWhisperUltraMax = useCallback(async (audioBlob: Blob) => {
    try {
      const startTime = performance.now();
      
      // Convertir en base64 optimisé
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
      
      // Endpoint ULTRA-MAX
      const endpoint = ultraMaxMode ? '/api/whisper/transcribe-ultra-max' : '/api/whisper/transcribe-ultra-fluid';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_base64: base64Audio,
          audio_format: 'webm',
          language: 'fr',
          streaming: true,
          ultra_max: ultraMaxMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur Whisper ULTRA-MAX: ${response.status}`);
      }

      const result = await response.json();
      const endTime = performance.now();
      const whisperLatency = endTime - startTime;
      
      console.log(`🚀 Whisper ULTRA-MAX - Latence: ${whisperLatency.toFixed(0)}ms, Score: ${result.optimization_score || 0}%`);
      
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

      // Mise à jour des métriques ULTRA-MAX
      if (result.cache_hit) {
        performanceMetricsRef.current.cacheHits++;
      }

      return result;
    } catch (error) {
      console.error('Erreur streaming Whisper ULTRA-MAX:', error);
      onError('Erreur de transcription Whisper ULTRA-MAX');
    }
  }, [onTranscriptionUpdate, onError, ultraMaxMode]);

  // Initialisation du MediaRecorder pour streaming ULTRA-MAX
  useEffect(() => {
    const initMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
            channelCount: 1,
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
            
            // Streaming ULTRA-MAX en temps réel vers Whisper
            if (isRecordingRef.current) {
              const audioBlob = new Blob([event.data], { type: 'audio/webm' });
              await streamToWhisperUltraMax(audioBlob);
            }
          }
        };

        mediaRecorder.onstop = async () => {
          if (audioChunksRef.current.length > 0) {
            const finalBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            await streamToWhisperUltraMax(finalBlob);
          }
        };

      } catch (error) {
        console.error('Erreur initialisation MediaRecorder ULTRA-MAX:', error);
        onError('Impossible d\'accéder au microphone');
      }
    };

    initMediaRecorder();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [streamToWhisperUltraMax, onError]);

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
      // Démarrer la reconnaissance native ULTRA-MAX
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      
      // Démarrer le MediaRecorder pour streaming ULTRA-MAX
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.start(500); // Chunk toutes les 500ms pour ULTRA-MAX
      }
      
      setIsRecording(true);
      isRecordingRef.current = true;
      lastResultRef.current = '';
      setCurrentTranscript('');
      setLatency(0);
      setConfidence(0);
      setPerformanceScore(100);
      
    } catch (error) {
      console.error('Erreur démarrage enregistrement ULTRA-MAX:', error);
      const errorMsg = 'Erreur lors du démarrage de l\'enregistrement ULTRA-MAX';
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
      console.error('Erreur arrêt enregistrement ULTRA-MAX:', error);
      setError('Erreur lors de l\'arrêt de l\'enregistrement ULTRA-MAX');
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
          className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full transition-all ${
            isRecording
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse'
              : 'bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] text-[#162238] hover:shadow-lg hover:shadow-[#c5a572]/30'
          } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'} ${className}`}
          aria-label={isRecording ? 'Arrêter l\'enregistrement ULTRA-MAX' : 'Démarrer l\'enregistrement ULTRA-MAX'}
        >
          {isProcessing && !isRecording ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isRecording ? (
            <div className="flex items-center justify-center w-7 h-7">
              <div className="absolute w-5 h-5 bg-white rounded-full animate-ping"></div>
              <MicOff size={24} className="relative" />
            </div>
          ) : (
            <Mic size={24} />
          )}
        </button>
        
        <div className="flex-1">
          <div className="text-sm text-gray-300 mb-1">
            {isRecording ? 'Enregistrement ULTRA-MAX...' : 'Appuyez pour dicter ULTRA-MAX'}
          </div>
          
          {/* Indicateurs de performance ULTRA-MAX */}
          {isRecording && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${latency < 50 ? 'bg-green-400' : latency < 150 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                <span className="text-gray-400">Latence: {latency.toFixed(0)}ms</span>
              </div>
              
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${confidence > 0.9 ? 'bg-green-400' : confidence > 0.7 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                <span className="text-gray-400">Confiance: {(confidence * 100).toFixed(0)}%</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-blue-400" />
                <span className="text-gray-400">Score: {performanceScore.toFixed(0)}%</span>
              </div>
              
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-gray-400">{optimizationLevel}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-xs text-red-400 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" /> {error}
        </div>
      )}
      
      {/* Indicateur de transcription ULTRA-MAX */}
      {isRecording && currentTranscript && (
        <div className="mt-3 p-4 bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-lg">
          <div className="text-xs text-[#c5a572] mb-2 flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Transcription ULTRA-MAX en temps réel:
          </div>
          <div className="text-sm text-gray-300 whitespace-pre-wrap">
            {currentTranscript}
            <span className="inline-block w-1 h-4 bg-[#c5a572] ml-1 animate-pulse"></span>
          </div>
        </div>
      )}
      
      {/* Métriques de performance ULTRA-MAX */}
      {performanceMode && (
        <div className="mt-2 p-2 bg-[#0f172a]/60 border border-[#2a3f6c] rounded text-xs">
          <div className="flex items-center justify-between text-gray-400">
            <span>Total: {performanceMetricsRef.current.totalRequests}</span>
            <span>Cache: {performanceMetricsRef.current.cacheHits}</span>
            <span>Succès: {(performanceMetricsRef.current.successRate * 100).toFixed(0)}%</span>
            <span>Latence: {performanceMetricsRef.current.avgLatency.toFixed(0)}ms</span>
          </div>
        </div>
      )}
      
      {isRecording && (
        <div className="absolute -top-2 -right-2 flex items-center justify-center w-7 h-7 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
          ⚡
        </div>
      )}
    </div>
  );
};