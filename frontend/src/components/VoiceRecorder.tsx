import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

interface TranscriptionResponse {
  text: string;
  segments: any[];
  language: string;
  language_probability: number;
  duration: number;
  error?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptionComplete,
  onError,
  disabled = false,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [whisperStatus, setWhisperStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Vérifier le statut de Whisper au montage
  useEffect(() => {
    checkWhisperStatus();
  }, []);

  const checkWhisperStatus = async () => {
    try {
      setWhisperStatus('loading');
      const response = await fetch('/api/whisper/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setWhisperStatus(data.status === 'healthy' ? 'ready' : 'loading');
      } else {
        setWhisperStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut Whisper:', error);
      setWhisperStatus('error');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Timer pour afficher la durée d'enregistrement
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      onError?.('Impossible d\'accéder au microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    
    try {
      // Convertir le blob en base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode(...Array.from(uint8Array)));
      
      const response = await fetch('/api/whisper/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_base64: base64Audio,
          audio_format: 'webm',
          language: 'fr'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result: TranscriptionResponse = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.text.trim()) {
        onTranscriptionComplete(result.text);
      } else {
        onError?.('Aucun texte détecté dans l\'enregistrement');
      }
      
    } catch (error) {
      console.error('Erreur lors de la transcription:', error);
      onError?.(error instanceof Error ? error.message : 'Erreur lors de la transcription');
    } finally {
      setIsProcessing(false);
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const isWhisperReady = whisperStatus === 'ready';
  const isButtonDisabled = disabled || !isWhisperReady || isProcessing;

  return (
    <div className={`voice-recorder ${className}`}>
      <div className="flex flex-col items-center gap-4">
        {/* Bouton d'enregistrement */}
        <Button
          onClick={handleButtonClick}
          disabled={isButtonDisabled}
          className={`relative w-16 h-16 rounded-full transition-all duration-300 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          } ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? (
            <div className="w-4 h-4 bg-white rounded-sm" />
          ) : (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
        </Button>

        {/* Indicateurs de statut */}
        <div className="text-center">
          {isRecording && (
            <div className="text-sm text-gray-600">
              Enregistrement en cours... {formatTime(recordingTime)}
            </div>
          )}
          
          {isProcessing && (
            <div className="text-sm text-blue-600">
              Transcription en cours...
            </div>
          )}
          
          {whisperStatus === 'loading' && (
            <div className="text-sm text-yellow-600">
              Initialisation de Whisper...
            </div>
          )}
          
          {whisperStatus === 'error' && (
            <div className="text-sm text-red-600">
              Whisper non disponible
            </div>
          )}
        </div>

        {/* Bouton de transcription */}
        {audioBlob && !isRecording && !isProcessing && (
          <Button
            onClick={transcribeAudio}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Transcrire l'audio
          </Button>
        )}
      </div>
    </div>
  );
}; 