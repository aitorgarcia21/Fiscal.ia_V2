import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/Button';
import { Mic, MicOff, CheckCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptionUpdate: (text: string) => void;
  onTranscriptionComplete: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptionUpdate,
  onTranscriptionComplete,
  onError,
  disabled = false,
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const accumulatedTextRef = useRef('');
  
  // Ref to hold the latest recording state to avoid stale closures in callbacks
  const isRecordingRef = useRef(isRecording);
  isRecordingRef.current = isRecording;

  useEffect(() => {
    if (!SpeechRecognition) {
      setIsAvailable(false);
      onError?.("Reconnaissance vocale non supportée sur ce navigateur.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';

    recognition.onresult = (event: any) => {
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

    recognition.onerror = (event: any) => {
      console.error('Erreur reconnaissance vocale:', event.error);
      if (event.error !== 'no-speech') {
        onError?.(`Erreur: ${event.error}`);
      }
      // The onend event will handle the stop logic
    };
    
    recognition.onend = () => {
      // Only call onTranscriptionComplete if the user explicitly stopped it.
      // If it stops on its own, it will restart if still in recording mode.
      if (isRecordingRef.current) {
        console.log("Speech recognition service stopped, restarting...");
        recognition.start();
        } 
    };

    // Cleanup function to stop recognition when the component unmounts
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscriptionUpdate, onError]); // This effect should run only once.

  const startRecording = useCallback(() => {
    if (recognitionRef.current) {
      accumulatedTextRef.current = '';
      onTranscriptionUpdate('');
      setIsRecording(true);
      recognitionRef.current.start();
    }
  }, [onTranscriptionUpdate]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
      onTranscriptionComplete(accumulatedTextRef.current);
    }
  }, [onTranscriptionComplete]);

  const handleButtonClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

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