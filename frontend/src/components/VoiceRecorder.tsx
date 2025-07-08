import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, CheckCircle, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptionUpdate?: (text: string) => void;
  onTranscriptionComplete?: (text: string) => void;
  onResult?: (text: string) => void; // Alias pour onTranscriptionComplete pour compatibilité
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  autoStart?: boolean;
  onListeningChange?: (isListening: boolean) => void; // Nouvelle prop pour le suivi de l'état d'écoute
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptionUpdate = () => {},
  onTranscriptionComplete = () => {},
  onError = () => {},
  disabled = false,
  className = '',
  autoStart = false,
  onResult = () => {},
  onListeningChange = () => {},
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const accumulatedTextRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);
  const lastResultRef = useRef<string>('');

  // Appeler onListeningChange lorsque l'état d'enregistrement change
  useEffect(() => {
    onListeningChange(isRecording);
  }, [isRecording, onListeningChange]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsAvailable(false);
      onError('La reconnaissance vocale n\'est pas supportée par votre navigateur');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'fr-FR';

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
        // Si on est toujours censé enregistrer, on relance la reconnaissance
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
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        // Ajouter le texte final au texte accumulé
        accumulatedTextRef.current = (accumulatedTextRef.current + ' ' + finalTranscript).trim();
        const currentText = accumulatedTextRef.current;
        lastResultRef.current = currentText;
        onTranscriptionUpdate(currentText);
        onResult(currentText);
      } else if (interimTranscript) {
        // Pour les résultats intermédiaires, on garde une trace mais on ne l'ajoute pas encore au texte accumulé
        lastResultRef.current = interimTranscript;
        onTranscriptionUpdate(accumulatedTextRef.current + (accumulatedTextRef.current ? ' ' : '') + interimTranscript);
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onError, onResult, onTranscriptionUpdate, onListeningChange]);

  useEffect(() => {
    if (autoStart && isAvailable && !disabled) {
      startRecording();
    }
  }, [autoStart, isAvailable, disabled]);

  const startRecording = () => {
    if (!isAvailable || disabled) {
      setError('La reconnaissance vocale n\'est pas disponible ou désactivée');
      return;
    }
    
    setError(null);
    setIsProcessing(true);
    
    // Ne pas effacer le texte existant pour permettre la poursuite de la dictée
    if (!accumulatedTextRef.current) {
      accumulatedTextRef.current = '';
    }
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      isRecordingRef.current = true;
      lastResultRef.current = '';
    } catch (error) {
      console.error('Erreur démarrage reconnaissance vocale:', error);
      const errorMsg = 'Erreur lors du démarrage de la reconnaissance vocale';
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
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      const finalText = accumulatedTextRef.current.trim();
      if (finalText) {
        // Ne pas appeler onTranscriptionUpdate ici pour éviter les doublons
        // avec le dernier résultat partiel
        onTranscriptionComplete(finalText);
        onResult(finalText);
      } else if (lastResultRef.current) {
        // Utiliser le dernier résultat partiel si disponible
        onTranscriptionComplete(lastResultRef.current);
        onResult(lastResultRef.current);
      }
    } catch (error) {
      console.error('Erreur arrêt reconnaissance vocale:', error);
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
      <div className="flex items-center gap-2">
        <button
          onClick={handleButtonClick}
          disabled={disabled || isProcessing}
          className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-all ${
            isRecording
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
              : 'bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] text-[#162238] hover:shadow-lg hover:shadow-[#c5a572]/30'
          } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'} ${className}`}
          aria-label={isRecording ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement'}
        >
          {isProcessing && !isRecording ? (
            <div className="w-5 h-5 border-2 border-[#162238] border-t-transparent rounded-full animate-spin"></div>
          ) : isRecording ? (
            <div className="flex items-center justify-center w-6 h-6">
              <div className="absolute w-4 h-4 bg-white rounded-full animate-ping"></div>
              <MicOff size={18} className="relative" />
            </div>
          ) : (
            <Mic size={18} />
          )}
        </button>
        
        <div className="text-sm text-gray-300">
          {isRecording ? 'Enregistrement en cours...' : 'Appuyez pour dicter'}
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-xs text-red-400 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" /> {error}
        </div>
      )}
      
      {isRecording && (
        <div className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
          •
        </div>
      )}
    </div>
  );
};