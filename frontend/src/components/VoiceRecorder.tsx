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
  
  const recognitionRef = useRef<any>(null);
  const accumulatedTextRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);

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
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        accumulatedTextRef.current += ' ' + finalTranscript;
        const currentText = accumulatedTextRef.current.trim();
        onTranscriptionUpdate(currentText);
        onResult(currentText);
      } else if (interimTranscript) {
        onTranscriptionUpdate(interimTranscript);
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
    if (!isAvailable || disabled) return;
    
    accumulatedTextRef.current = '';
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      isRecordingRef.current = true;
    } catch (error) {
      console.error('Erreur démarrage reconnaissance vocale:', error);
      onError('Erreur lors du démarrage de la reconnaissance vocale');
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const stopRecording = () => {
    if (!isAvailable || !isRecording) return;
    
    try {
      recognitionRef.current.stop();
      const finalText = accumulatedTextRef.current.trim();
      if (finalText) {
        onTranscriptionComplete(finalText);
        onResult(finalText);
      }
    } catch (error) {
      console.error('Erreur arrêt reconnaissance vocale:', error);
    } finally {
      setIsRecording(false);
      isRecordingRef.current = false;
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
      <div className={`flex items-center text-red-500 ${className}`}>
        <AlertCircle className="mr-2" size={20} />
        <span>Reconnaissance vocale non supportée</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleButtonClick}
      disabled={disabled}
      className={`p-2 rounded-full transition-colors ${className} ${
        isRecording
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      aria-label={isRecording ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement'}
    >
      {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
};