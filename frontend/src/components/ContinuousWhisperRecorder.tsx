import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Activity, AlertCircle } from 'lucide-react';

interface ContinuousWhisperRecorderProps {
  onTranscription: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  autoStart?: boolean;
}

export const ContinuousWhisperRecorder: React.FC<ContinuousWhisperRecorderProps> = ({
  onTranscription,
  onError = () => {},
  disabled = false,
  className = '',
  autoStart = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptBuffer, setTranscriptBuffer] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const processIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isListeningRef = useRef(false);

  // 🎯 ÉCOUTE CONTINUE - Configuration automatique
  const setupContinuousListening = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      const error = 'Microphone non supporté par ce navigateur';
      setError(error);
      onError(error);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Optimal pour Whisper
          channelCount: 1, // Mono
        }
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      // 🔄 CAPTURE CONTINUE des chunks audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && isListeningRef.current) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      
      // Démarrer l'enregistrement en boucles de 1 seconde
      mediaRecorder.start(1000); // Chunk toutes les 1 seconde
      
      console.log('🎤 Écoute continue Whisper activée');
      
    } catch (error) {
      console.error('Erreur configuration microphone:', error);
      const errorMsg = `Erreur microphone: ${error}`;
      setError(errorMsg);
      onError(errorMsg);
    }
  }, [onError]);

  // 🎯 TRAITEMENT ULTRA-FRÉQUENT avec Whisper pour affichage LIVE
  const processContinuousAudio = useCallback(async () => {
    if (audioChunksRef.current.length === 0 || !isListeningRef.current) return;

    try {
      setIsProcessing(true);
      
      // Prendre seulement les nouveaux chunks pour traitement immédiat
      const audioBlob = new Blob([...audioChunksRef.current], { type: 'audio/webm' });
      // Garder les 2 derniers chunks pour continuité, vider le reste
      audioChunksRef.current = audioChunksRef.current.slice(-2);
      
      // Convertir en base64
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          
          // 🎯 APPEL API WHISPER - Essai avec différents endpoints
          const endpoints = [
            '/api/whisper/transcribe-ultra-fluid',
            '/whisper/transcribe-ultra-fluid',
            '/api/whisper/transcribe'
          ];
          
          let result = null;
          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audio_base64: base64Audio,
                  language: 'fr'
                }),
              });
              
              if (response.ok) {
                result = await response.json();
                console.log(`✅ Whisper endpoint ${endpoint} fonctionnel`);
                break;
              }
            } catch (e) {
              console.log(`❌ Endpoint ${endpoint} non accessible`);
              continue;
            }
          }
          
          // Fallback: Utilisation de l'API Web Speech si Whisper échoue
          if (!result || result.error) {
            console.log('🔄 Fallback vers Web Speech API');
            useWebSpeechFallback();
            return;
          }
          
          const newText = (result.text || '').trim();
          if (newText && newText.length > 1) { // Seuil plus bas pour réactivité
            // Déduplication intelligente avec détection de nouveaux mots
            const newWords = newText.split(' ');
            const existingWords = transcriptBuffer.toLowerCase().split(' ');
            const uniqueNewWords = newWords.filter(word => 
              word.length > 1 && !existingWords.includes(word.toLowerCase())
            );
            
            if (uniqueNewWords.length > 0) {
              const updatedBuffer = (transcriptBuffer + ' ' + uniqueNewWords.join(' ')).trim();
              setTranscriptBuffer(updatedBuffer);
              
              // 🔥 ÉMISSION LIVE pour Francis - traitement immédiat
              onTranscription(updatedBuffer, false);
              console.log('🎤 Whisper LIVE:', uniqueNewWords.join(' '));
              
              // 🎯 ÉMISSION INTERMÉDIAIRE pour affichage temps réel
              setTimeout(() => {
                onTranscription(updatedBuffer + '...', false);
              }, 100);
            }
          }
          
        } catch (error) {
          console.error('Erreur traitement audio:', error);
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.readAsDataURL(audioBlob);
      
    } catch (error) {
      console.error('Erreur processContinuousAudio:', error);
      setIsProcessing(false);
    }
  }, [transcriptBuffer, onTranscription]);

  // 🔄 FALLBACK Web Speech pour écoute continue
  const useWebSpeechFallback = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Aucune API de reconnaissance vocale disponible');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // ÉCOUTE CONTINUE
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = transcriptBuffer;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += ' ' + transcript;
          setTranscriptBuffer(finalTranscript.trim());
          // 🔥 ÉMISSION IMMÉDIATE pour Francis
          onTranscription(finalTranscript.trim(), false);
          console.log('🎤 Web Speech Final LIVE:', transcript);
        } else {
          interimTranscript += transcript;
          const liveText = (finalTranscript + ' ' + interimTranscript).trim();
          // 🎯 AFFICHAGE LIVE pendant que l'utilisateur parle
          onTranscription(liveText, false);
          console.log('🎤 Web Speech INTERIM:', interimTranscript);
        }
      }
    };
    
    recognition.onend = () => {
      // Redémarrer automatiquement pour écoute continue
      if (isListeningRef.current) {
        setTimeout(() => recognition.start(), 100);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Erreur Web Speech:', event.error);
      if (isListeningRef.current) {
        setTimeout(() => recognition.start(), 1000);
      }
    };
    
    recognition.start();
    console.log('🎤 Fallback Web Speech activé (écoute continue)');
    
  }, [transcriptBuffer, onTranscription]);

  // 🎯 DÉMARRAGE écoute continue
  const startContinuousListening = useCallback(async () => {
    setIsListening(true);
    isListeningRef.current = true;
    setError(null);
    setTranscriptBuffer('');
    
    await setupContinuousListening();
    
    // 🔥 TRAITEMENT ULTRA-RAPIDE toutes les 800ms pour affichage LIVE
    processIntervalRef.current = setInterval(processContinuousAudio, 800);
    
  }, [setupContinuousListening, processContinuousAudio]);

  // 🛑 ARRÊT écoute continue
  const stopContinuousListening = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    
    // Arrêter le traitement
    if (processIntervalRef.current) {
      clearInterval(processIntervalRef.current);
      processIntervalRef.current = null;
    }
    
    // Arrêter MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Fermer le stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Transcription finale
    if (transcriptBuffer.trim()) {
      onTranscription(transcriptBuffer.trim(), true);
    }
    
    console.log('🛑 Écoute continue arrêtée');
    
  }, [transcriptBuffer, onTranscription]);

  // Toggle écoute
  const toggleListening = () => {
    if (isListening) {
      stopContinuousListening();
    } else {
      startContinuousListening();
    }
  };

  // Auto-start si demandé
  useEffect(() => {
    if (autoStart && !isListening && !disabled) {
      startContinuousListening();
    }
  }, [autoStart, disabled, isListening, startContinuousListening]);

  // Nettoyage à la suppression du composant
  useEffect(() => {
    return () => {
      stopContinuousListening();
    };
  }, [stopContinuousListening]);

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <button
        onClick={toggleListening}
        disabled={disabled}
        className={`
          relative flex items-center justify-center w-14 h-14 rounded-full
          transition-all duration-300 focus:outline-none focus:ring-4
          ${isListening 
            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 focus:ring-red-500/50' 
            : 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] hover:from-[#e8cfa0] hover:to-[#c5a572] text-[#162238] shadow-lg shadow-[#c5a572]/30 focus:ring-[#c5a572]/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        `}
        aria-label={isListening ? 'Arrêter l\'écoute continue' : 'Démarrer l\'écoute continue'}
      >
        {isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        
        {/* Indicateur d'activité */}
        {isListening && (
          <div className="absolute -top-1 -right-1">
            <Activity className="w-4 h-4 text-white animate-pulse" />
          </div>
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            error ? 'bg-red-500' :
            isProcessing ? 'bg-yellow-500 animate-pulse' :
            isListening ? 'bg-green-500 animate-pulse' : 
            'bg-gray-500'
          }`} />
          
          <span className="text-sm font-medium text-gray-300">
            {error ? 'Erreur' :
             isProcessing ? 'Traitement...' :
             isListening ? 'Écoute continue active' : 
             'Prêt à écouter'}
          </span>
        </div>
        
        <div className="text-xs text-gray-400 flex items-center space-x-2">
          <span>Whisper + Web Speech • Français</span>
          {isListening && (
            <span className="text-green-400 font-medium">● LIVE</span>
          )}
        </div>
      </div>
      
      {/* Affichage des erreurs */}
      {error && (
        <div className="flex items-center text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mr-1" />
          <span className="truncate max-w-48">{error}</span>
        </div>
      )}
    </div>
  );
};

export default ContinuousWhisperRecorder;
