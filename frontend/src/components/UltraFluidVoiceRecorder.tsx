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
    
    // 🚀 PARAMÈTRES ULTRA-OPTIMISÉS POUR LE FRANÇAIS BUSINESS
    recognitionRef.current.continuous = true;           // ÉCOUTE CONTINUE
    recognitionRef.current.interimResults = true;       // Feedback temps réel
    recognitionRef.current.lang = 'fr-FR';              // Français France
    recognitionRef.current.maxAlternatives = 1;         // Une seule alternative
    
    // 🎯 OPTIMISATIONS SPÉCIFIQUES FRANÇAIS
    // Pas de grammaires spécifiques - utilisation du comportement par défaut
    
    // 🔧 PARAMÈTRES DE QUALITÉ
    if ('serviceURI' in recognitionRef.current) {
      recognitionRef.current.serviceURI = undefined; // Service par défaut
    }
    
    console.log('🎤 Francis Voice: Configuration ultra-fluide activée');

    recognitionRef.current.onerror = (event: any) => {
      console.log('🔧 Francis Voice: Erreur détectée:', event.error);
      
      // 🛡️ GESTION SIMPLE DES ERREURS
      const minorErrors = ['no-speech', 'aborted'];
      
      if (minorErrors.includes(event.error)) {
        console.log('⚠️ Francis Voice: Erreur mineure ignorée:', event.error);
        // Pas de relance automatique pour éviter les boucles
        return;
      }
      
      // Erreur majeure - arrêter et signaler
      const errorMessage = `Erreur de reconnaissance: ${event.error}`;
      setError(errorMessage);
      onError(errorMessage);
      setIsRecording(false);
      isRecordingRef.current = false;
      setIsProcessing(false);
    };

    recognitionRef.current.onend = () => {
      console.log('🔄 Francis Voice: Session terminée, relance automatique...');
      
      if (isRecordingRef.current) {
        // 🚀 RELANCE ULTRA-RAPIDE avec retry intelligent
        let retryCount = 0;
        const maxRetries = 3;
        
        const attemptRestart = () => {
          try {
            if (recognitionRef.current && isRecordingRef.current) {
              recognitionRef.current.start();
              console.log(`✅ Francis Voice: Relance réussie (tentative ${retryCount + 1})`);
            }
          } catch (error) {
            retryCount++;
            console.warn(`⚠️ Francis Voice: Échec relance (tentative ${retryCount}):`, error);
            
            if (retryCount < maxRetries && isRecordingRef.current) {
              // Retry avec délai progressif
              setTimeout(attemptRestart, retryCount * 200);
            } else {
              console.error('❌ Francis Voice: Échec définitif de relance');
              setIsRecording(false);
              isRecordingRef.current = false;
              onError('Impossible de maintenir l\'enregistrement continu');
            }
          }
        };
        
        // Démarrer la première tentative immédiatement
        setTimeout(attemptRestart, 50); // Délai minimal pour éviter les conflits
      }
    };

    recognitionRef.current.onresult = (event: any) => {
      const startTime = performance.now();
      
      let finalTranscript = '';
      let interimTranscript = '';
      
      // 🎯 TRAITEMENT SIMPLE ET EFFICACE des résultats
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript?.trim() || '';
        const confidence = result[0]?.confidence || 0;
        
        if (result.isFinal && transcript.length > 0) {
          finalTranscript += transcript + ' ';
          console.log(`✅ Francis Voice (FINAL): "${transcript}" | Confiance: ${(confidence * 100).toFixed(1)}%`);
        } else if (transcript.length > 0) {
          interimTranscript += transcript + ' ';
          console.log(`🎯 Francis Voice (TEMP): "${transcript}"`);
        }
      }

      // Calcul de la latence
      const endTime = performance.now();
      const currentLatency = endTime - startTime;
      setLatency(currentLatency);
      setConfidence(1.0); // Confiance fixe pour simplifier

      // 🎯 MISE À JOUR INTELLIGENTE - Toujours garder le texte le plus complet
      if (finalTranscript) {
        const newFinalText = finalTranscript.trim();
        accumulatedTextRef.current = (accumulatedTextRef.current + ' ' + newFinalText).trim();
        const currentText = accumulatedTextRef.current;
        lastResultRef.current = currentText;
        setCurrentTranscript(currentText);
        onTranscriptionUpdate(currentText);
        console.log(`🎤 Francis Voice: Texte accumulé total: "${currentText}"`);
      } else if (interimTranscript) {
        const fullText = accumulatedTextRef.current + (accumulatedTextRef.current ? ' ' : '') + interimTranscript;
        lastResultRef.current = interimTranscript;
        setCurrentTranscript(fullText);
        onTranscriptionUpdate(fullText);
        // Ne pas logger les intermédiaires pour éviter le spam
      }
      
      // 📊 STATISTIQUES DE CAPTURE
      if (finalTranscript || interimTranscript) {
        const totalLength = (accumulatedTextRef.current + ' ' + (finalTranscript || interimTranscript)).length;
        console.log(`📊 Francis Voice: Longueur totale capturée: ${totalLength} caractères`);
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
            // 🚀 PARAMÈTRES AUDIO ULTRA-OPTIMISÉS pour capture complète
            echoCancellation: true,           // Suppression écho
            noiseSuppression: false,          // DÉSACTIVÉ pour garder toute la voix
            autoGainControl: true,            // Gain automatique
            sampleRate: 48000,                // Qualité maximale (48kHz au lieu de 16kHz)
            channelCount: 1,                  // Mono pour optimiser
            // Paramètres optimisés pour capture complète (paramètres standards uniquement)
          } 
        });
        
        streamRef.current = stream;
        
        const mediaRecorder = new MediaRecorder(stream, {
          // 🎯 CONFIGURATION ULTRA-FLUIDE MediaRecorder
          mimeType: 'audio/webm;codecs=opus',
          audioBitsPerSecond: 128000,           // Qualité élevée (128kbps au lieu de 16kbps)
          bitsPerSecond: 128000,                // Débit global élevé
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

        
        <div className="flex-1">

          

        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-xs text-red-400 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" /> {error}
        </div>
      )}
      
      {/* Transcription cachée - affichage géré par le composant parent */}
      
      {isRecording && (
        <div className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
          •
        </div>
      )}
    </div>
  );
};