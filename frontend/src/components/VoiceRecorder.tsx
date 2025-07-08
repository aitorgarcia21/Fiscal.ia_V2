import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, CheckCircle, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptionUpdate?: (text: string) => void;
  onTranscriptionComplete?: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  autoStart?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptionUpdate = () => {},
  onTranscriptionComplete = () => {},
  onError = () => {},
  disabled = false,
  className = '',
  autoStart = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const accumulatedTextRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);

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
        recognitionRef.current.start();
      }
    };

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
      
      if (finalTranscript) {
        accumulatedTextRef.current += finalTranscript;
        onTranscriptionUpdate(accumulatedTextRef.current);
      } else if (interimTranscript) {
        onTranscriptionUpdate(accumulatedTextRef.current + interimTranscript);
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
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        isRecordingRef.current = true;
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        onError('Erreur lors du démarrage de la reconnaissance vocale');
        setIsRecording(false);
        isRecordingRef.current = false;
      }
    } else {
      recognitionRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
      onTranscriptionComplete(accumulatedTextRef.current);
    }
  };

  if (!isAvailable) {
    return (
      <div className={`flex flex-col items-center text-red-400 ${className}`}>
        <MicOff className="w-8 h-8" />
        <span className="text-sm mt-2">Reconnaissance vocale non disponible</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={handleButtonClick}
        disabled={disabled}
        className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
          isRecording 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
      </button>
      
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span>Reconnaissance vocale {isRecording ? 'active' : 'prête'}</span>
      </div>
    </div>
  );
};