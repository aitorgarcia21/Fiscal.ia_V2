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
  const recognitionRef = useRef<any>(null);
  const accumulatedTextRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);
  const isAvailable = useRef<boolean>(true);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      isAvailable.current = false;
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
        recognitionRef.current.start();
      }
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      accumulatedTextRef.current = finalTranscript || interimTranscript;
      onTranscriptionUpdate?.(accumulatedTextRef.current);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleButtonClick = () => {
    if (!isAvailable.current || disabled) return;

    if (!isRecording) {
      accumulatedTextRef.current = '';
      recognitionRef.current.start();
      setIsRecording(true);
      isRecordingRef.current = true;
    } else {
      recognitionRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
      onTranscriptionComplete(accumulatedTextRef.current);
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
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={handleButtonClick}
        disabled={disabled || !isAvailable.current}
        className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'}`}
      >
        {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
      </button>
      
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
        {isAvailable.current ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Reconnaissance vocale activée</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>Microphone non disponible</span>
          </>
        )}
      </div>
    </div>
  );
}; 