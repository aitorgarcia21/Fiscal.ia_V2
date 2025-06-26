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
  const [liveText, setLiveText] = useState('');
  const [isLiveTranscribing, setIsLiveTranscribing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const accumulatedTextRef = useRef('');

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
      
      // Créer le WebSocket pour le streaming
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/whisper-stream`;
      websocketRef.current = new WebSocket(wsUrl);
      
      websocketRef.current.onopen = () => {
        console.log('WebSocket connecté pour streaming');
        setIsLiveTranscribing(true);
      };
      
      websocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'transcription' && data.text) {
            setLiveText(data.text);
            if (data.is_final) {
              onTranscriptionComplete(data.text);
            }
          } else if (data.type === 'error') {
            onError?.(data.error);
          }
        } catch (e) {
          console.error('Erreur parsing WebSocket:', e);
        }
      };
      
      websocketRef.current.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
        onError?.('Erreur de connexion streaming');
      };
      
      // Démarrer l'enregistrement audio
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      accumulatedTextRef.current = '';
      setLiveText('');
      
      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0 && websocketRef.current?.readyState === WebSocket.OPEN) {
          // Convertir en base64 et envoyer via WebSocket
          const arrayBuffer = await event.data.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const base64Audio = btoa(String.fromCharCode(...Array.from(uint8Array)));
          
          websocketRef.current.send(JSON.stringify({
            type: 'audio',
            audio: base64Audio
          }));
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        // Envoyer signal de fin
        if (websocketRef.current?.readyState === WebSocket.OPEN) {
          websocketRef.current.send(JSON.stringify({ type: 'end' }));
        }
        
        stream.getTracks().forEach(track => track.stop());
        setIsLiveTranscribing(false);
      };
      
      // Démarrer l'enregistrement avec des chunks fréquents
      mediaRecorderRef.current.start(500); // Chunk toutes les 500ms
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
  }, [analyzeAudioLevel, onTranscriptionComplete, onError]);

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
      
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
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
      
      // Essayer d'abord le streaming en temps réel
      try {
        const streamResponse = await fetch('/api/whisper/transcribe-streaming', {
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
        
        if (streamResponse.ok) {
          const reader = streamResponse.body?.getReader();
          if (reader) {
            let accumulatedText = '';
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    if (data.text && !data.is_final) {
                      accumulatedText += data.text + ' ';
                      // Mettre à jour en temps réel
                      onTranscriptionComplete(accumulatedText.trim());
                    } else if (data.is_final) {
                      // Transcription finale
                      if (accumulatedText.trim()) {
                        onTranscriptionComplete(accumulatedText.trim());
                      } else {
                        onError?.('Je n\'ai pas entendu de parole claire. Pouvez-vous parler plus fort ou plus longtemps ?');
                      }
                      return;
                    }
                  } catch (e) {
                    console.error('Erreur parsing streaming:', e);
                  }
                }
              }
            }
            return;
          }
        }
      } catch (streamError) {
        console.log('Streaming non disponible, fallback vers transcription normale');
      }
      
      // Fallback vers la transcription normale
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
          
          {isLiveTranscribing && liveText && (
            <div className="bg-[#1a2942] p-3 rounded-lg border border-[#c5a572] max-w-md">
              <div className="text-xs text-[#c5a572] mb-1">Transcription en temps réel :</div>
              <div className="text-sm text-white">{liveText}</div>
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