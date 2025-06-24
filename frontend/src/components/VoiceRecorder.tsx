import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/Button';
import { Mic, MicOff, Volume2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  autoTranscribe?: boolean;
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
  className = '',
  autoTranscribe = true
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [whisperStatus, setWhisperStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    checkWhisperStatus();
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const checkWhisperStatus = useCallback(async () => {
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
      
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          checkWhisperStatus();
        }, Math.pow(2, retryCount) * 1000);
      }
    }
  }, [retryCount]);

  const analyzeAudioLevel = useCallback((stream: MediaStream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    const source = audioContextRef.current.createMediaStreamSource(stream);
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateLevel = () => {
      if (analyserRef.current && isRecording) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      }
    };
    
    updateLevel();
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
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
        
        if (autoTranscribe && blob.size > 0) {
          setTimeout(() => transcribeAudio(blob), 100);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioLevel(0);
      
      analyzeAudioLevel(stream);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      onError?.('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  }, [autoTranscribe, analyzeAudioLevel, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isRecording]);

  const transcribeAudio = useCallback(async (blob?: Blob) => {
    const audioToTranscribe = blob || audioBlob;
    if (!audioToTranscribe) return;
    
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await audioToTranscribe.arrayBuffer();
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
        onError?.('Je n\'ai pas entendu de parole claire. Pouvez-vous parler plus fort ou plus longtemps ?');
      }
      
    } catch (error) {
      console.error('Erreur lors de la transcription:', error);
      onError?.(error instanceof Error ? error.message : 'Erreur lors de la transcription. Réessayez dans quelques secondes.');
    } finally {
      setIsProcessing(false);
      setAudioBlob(null);
      setRecordingTime(0);
    }
  }, [audioBlob, onTranscriptionComplete, onError]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleButtonClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const isWhisperReady = whisperStatus === 'ready';
  const isButtonDisabled = disabled || isProcessing;

  const audioLevelPercent = Math.min((audioLevel / 128) * 100, 100);
  const pulseSize = 16 + (audioLevelPercent * 0.5);

  return (
    <div className={`voice-recorder ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Button
            onClick={handleButtonClick}
            disabled={isButtonDisabled}
            className={`relative w-16 h-16 rounded-full transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-[#c5a572] hover:bg-[#e8cfa0] text-[#1a2942]'
            } ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>
          
          {isRecording && (
            <div 
              className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping"
              style={{
                transform: `scale(${pulseSize / 16})`,
                opacity: audioLevelPercent / 100
              }}
            />
          )}
        </div>

        <div className="text-center space-y-2">
          {isRecording && (
            <div className="flex items-center justify-center gap-2 text-sm text-[#c5a572]">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>Enregistrement en cours... {formatTime(recordingTime)}</span>
            </div>
          )}
          
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-sm text-[#c5a572]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Francis écoute et analyse...</span>
            </div>
          )}
          
          {whisperStatus === 'loading' && (
            <div className="flex items-center justify-center gap-2 text-sm text-yellow-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Initialisation de Francis...</span>
            </div>
          )}
          
          {whisperStatus === 'error' && (
            <div className="flex items-center justify-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>Francis temporairement indisponible</span>
            </div>
          )}
          
          {whisperStatus === 'ready' && !isRecording && !isProcessing && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Francis prêt à vous écouter</span>
            </div>
          )}
        </div>

        {!autoTranscribe && audioBlob && !isRecording && !isProcessing && (
          <Button
            onClick={() => transcribeAudio()}
            className="bg-[#c5a572] hover:bg-[#e8cfa0] text-[#1a2942] px-4 py-2 rounded-lg transition-colors"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Transcrire
          </Button>
        )}
      </div>
    </div>
  );
}; 