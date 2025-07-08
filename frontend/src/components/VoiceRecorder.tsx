import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/Button';
import { Mic, MicOff, CheckCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptionUpdate: (text: string) => void;
  onTranscriptionComplete: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  autoStart?: boolean;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptionUpdate,
  onTranscriptionComplete,
  onError,
  disabled = false,
  className = '',
  autoStart = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const accumulatedTextRef = useRef('');
  
  // Ref to hold the latest recording state to avoid stale closures in callbacks
  const isRecordingRef = useRef(isRecording);
  isRecordingRef.current = isRecording;

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
      </div>
    </div>
  );
}; 