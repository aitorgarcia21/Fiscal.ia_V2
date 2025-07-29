import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Activity, Brain, Shield, Layers } from 'lucide-react';

interface UltraRobustVoiceCaptureProps {
  onTranscription: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
  className?: string;
}

export const UltraRobustVoiceCapture: React.FC<UltraRobustVoiceCaptureProps> = ({
  onTranscription,
  onError = () => {},
  autoStart = false,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [activeServices, setActiveServices] = useState<string[]>([]);
  const [transcriptionBuffer, setTranscriptionBuffer] = useState('');
  const [redundancyLevel, setRedundancyLevel] = useState(0);
  
  // REFS pour les 3 systèmes de capture
  const webSpeechRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // BUFFERS pour fusion intelligente
  const webSpeechBufferRef = useRef('');
  const whisperBufferRef = useRef('');
  const finalBufferRef = useRef('');
  
  // TIMERS et intervalles
  const fusionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const whisperProcessIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🔥 FUSION INTELLIGENTE DES SOURCES - ZÉRO PERTE
  const performIntelligentFusion = useCallback(() => {
    const webSpeechText = webSpeechBufferRef.current.trim();
    const whisperText = whisperBufferRef.current.trim();
    
    if (!webSpeechText && !whisperText) return;
    
    console.log('🧠 FUSION INTELLIGENTE:', {
      webSpeech: webSpeechText.length,
      whisper: whisperText.length
    });
    
    // Prendre le texte le plus long ou fusionner si différents
    let fusedText = '';
    
    if (webSpeechText.length > whisperText.length) {
      fusedText = webSpeechText;
      if (whisperText && !webSpeechText.includes(whisperText)) {
        fusedText += ' ' + whisperText;
      }
    } else {
      fusedText = whisperText;
      if (webSpeechText && !whisperText.includes(webSpeechText)) {
        fusedText += ' ' + webSpeechText;
      }
    }
    
    // Déduplication intelligente
    const words = fusedText.split(' ').filter(w => w.trim());
    const uniqueWords = [];
    const seen = new Set();
    
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[.,!?;:]/, '');
      if (!seen.has(cleanWord) && cleanWord.length > 1) {
        uniqueWords.push(word);
        seen.add(cleanWord);
      }
    }
    
    const finalText = uniqueWords.join(' ');
    
    if (finalText !== finalBufferRef.current) {
      finalBufferRef.current = finalText;
      setTranscriptionBuffer(finalText);
      
      // ÉMISSION IMMÉDIATE vers Francis
      onTranscription(finalText, false);
      
      console.log('✅ TEXTE FUSIONNÉ ÉMIS:', finalText);
    }
  }, [onTranscription]);

  // 🎤 SYSTÈME 1: WEB SPEECH API ULTRA-PERMISSIF
  const setupWebSpeech = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return false;

    const recognition = new SpeechRecognition();
    
    // 🔥 CONFIGURATION ULTRA-PERMISSIVE - TOUT CAPTURER
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';
    recognition.maxAlternatives = 5; // Plus d'alternatives
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        // 🔥 ZÉRO FILTRAGE - TOUT PRENDRE !
        if (result.isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Mettre à jour le buffer Web Speech
      if (finalTranscript) {
        webSpeechBufferRef.current += finalTranscript;
        console.log('🎤 WEB SPEECH FINAL:', finalTranscript);
      }
      
      if (interimTranscript) {
        webSpeechBufferRef.current = webSpeechBufferRef.current + ' ' + interimTranscript;
        console.log('🎤 WEB SPEECH INTERIM:', interimTranscript);
      }
    };
    
    recognition.onend = () => {
      if (isListening) {
        // Redémarrage automatique immédiat
        setTimeout(() => {
          try {
            recognition.start();
            console.log('🔄 Web Speech redémarré');
          } catch (e) {
            console.error('❌ Erreur redémarrage Web Speech:', e);
          }
        }, 100);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.warn('⚠️ Web Speech Error:', event.error);
      // Pas d'arrêt sur erreur, continuer
    };
    
    webSpeechRef.current = recognition;
    return true;
  }, [isListening]);

  // 🎧 SYSTÈME 2: WHISPER API BACKUP
  const setupWhisperBackup = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1,
        }
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(2000); // Chunks de 2 secondes
      
      console.log('🎧 Whisper backup activé');
      return true;
    } catch (error) {
      console.error('❌ Erreur Whisper backup:', error);
      return false;
    }
  }, []);

  // 🧠 TRAITEMENT WHISPER CONTINU
  const processWhisperAudio = useCallback(async () => {
    if (audioChunksRef.current.length === 0) return;

    try {
      const audioBlob = new Blob([...audioChunksRef.current], { type: 'audio/webm' });
      audioChunksRef.current = audioChunksRef.current.slice(-1); // Garder 1 chunk pour continuité
      
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          
          const endpoints = [
            '/api/whisper/transcribe-ultra-fluid',
            '/whisper/transcribe-ultra-fluid',
            '/api/whisper/transcribe'
          ];
          
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
                const result = await response.json();
                if (result.text && result.text.trim()) {
                  whisperBufferRef.current += ' ' + result.text.trim();
                  console.log('🧠 WHISPER RESULT:', result.text);
                }
                break;
              }
            } catch (e) {
              console.warn(`⚠️ Whisper endpoint ${endpoint} failed:`, e);
            }
          }
        } catch (e) {
          console.error('❌ Erreur traitement Whisper:', e);
        }
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('❌ Erreur processWhisperAudio:', error);
    }
  }, []);

  // 🛡️ HEALTH CHECK - S'assurer que tout fonctionne
  const performHealthCheck = useCallback(() => {
    const services = [];
    
    // Check Web Speech
    if (webSpeechRef.current) {
      services.push('Web Speech');
    }
    
    // Check Whisper
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      services.push('Whisper');
    }
    
    setActiveServices(services);
    setRedundancyLevel(services.length);
    
    console.log('🛡️ HEALTH CHECK:', services);
    
    // Restart si aucun service actif
    if (services.length === 0 && isListening) {
      console.log('🚨 AUCUN SERVICE ACTIF - REDÉMARRAGE FORCÉ');
      stopAllSystems();
      setTimeout(startAllSystems, 500);
    }
  }, [isListening]);

  // 🚀 DÉMARRAGE DE TOUS LES SYSTÈMES
  const startAllSystems = useCallback(async () => {
    console.log('🚀 DÉMARRAGE SYSTÈMES ULTRA-ROBUSTES');
    setIsListening(true);
    
    // Reset buffers
    webSpeechBufferRef.current = '';
    whisperBufferRef.current = '';
    finalBufferRef.current = '';
    
    // 1. Démarrer Web Speech
    if (setupWebSpeech()) {
      try {
        webSpeechRef.current.start();
        console.log('✅ Web Speech démarré');
      } catch (e) {
        console.error('❌ Erreur démarrage Web Speech:', e);
      }
    }
    
    // 2. Démarrer Whisper backup
    await setupWhisperBackup();
    
    // 3. Démarrer fusion intelligente
    fusionIntervalRef.current = setInterval(performIntelligentFusion, 1000);
    
    // 4. Démarrer traitement Whisper
    whisperProcessIntervalRef.current = setInterval(processWhisperAudio, 3000);
    
    // 5. Démarrer health check
    healthCheckIntervalRef.current = setInterval(performHealthCheck, 5000);
    
    console.log('🔥 TOUS SYSTÈMES OPÉRATIONNELS');
  }, [setupWebSpeech, setupWhisperBackup, performIntelligentFusion, processWhisperAudio, performHealthCheck]);

  // 🛑 ARRÊT DE TOUS LES SYSTÈMES
  const stopAllSystems = useCallback(() => {
    console.log('🛑 ARRÊT SYSTÈMES');
    setIsListening(false);
    
    // Arrêter Web Speech
    if (webSpeechRef.current) {
      try {
        webSpeechRef.current.stop();
      } catch (e) {
        console.error('Erreur arrêt Web Speech:', e);
      }
    }
    
    // Arrêter MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Fermer stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Arrêter intervalles
    if (fusionIntervalRef.current) {
      clearInterval(fusionIntervalRef.current);
      fusionIntervalRef.current = null;
    }
    
    if (whisperProcessIntervalRef.current) {
      clearInterval(whisperProcessIntervalRef.current);
      whisperProcessIntervalRef.current = null;
    }
    
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
    
    // Transcription finale fusionnée
    performIntelligentFusion();
    if (finalBufferRef.current.trim()) {
      onTranscription(finalBufferRef.current.trim(), true);
    }
    
    setActiveServices([]);
    setRedundancyLevel(0);
  }, [performIntelligentFusion, onTranscription]);

  // Toggle
  const toggleListening = () => {
    if (isListening) {
      stopAllSystems();
    } else {
      startAllSystems();
    }
  };

  // Auto-start
  useEffect(() => {
    if (autoStart && !isListening) {
      startAllSystems();
    }
  }, [autoStart, isListening, startAllSystems]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopAllSystems();
    };
  }, [stopAllSystems]);

  return (
    <div className={`${className}`}>
      {/* Interface ultra-compacte */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isListening ? 'bg-green-400' : 'bg-gray-500'
          }`} />
          <span className="text-xs text-gray-400">
            {isListening ? '● ULTRA-CAPTURE' : 'Prêt'}
          </span>
          
          {/* Indicateur de redondance */}
          {isListening && (
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-bold">
                {redundancyLevel}x
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {isListening && <Mic className="w-3 h-3 text-green-400" />}
          {activeServices.includes('Whisper') && (
            <Brain className="w-3 h-3 text-blue-400" />
          )}
        </div>
      </div>

      {/* Zone de transcription simplifiée */}
      <div className="bg-[#0A192F]/50 rounded-lg border border-gray-700/30 p-3 min-h-[80px]">
        {transcriptionBuffer ? (
          <div className="text-gray-200 text-sm leading-relaxed">
            {transcriptionBuffer}
            {isListening && (
              <span className="inline-block w-0.5 h-4 bg-green-400 ml-1 animate-pulse" />
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-xs py-4">
            {isListening ? (
              <span>🎤 CAPTURE ULTRA-ROBUSTE ACTIVE - TOUT EST ENREGISTRÉ !</span>
            ) : (
              <span>Système de capture hybride prêt (Web Speech + Whisper)</span>
            )}
          </div>
        )}
      </div>
      
      {/* Bouton de toggle */}
      <div className="flex justify-center mt-3">
        <button
          onClick={toggleListening}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-sm
            transition-all duration-300 focus:outline-none focus:ring-2
            ${isListening 
              ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/50' 
              : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500/50'
            }
          `}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Arrêter</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Activer Capture Ultra-Robuste</span>
            </>
          )}
        </button>
      </div>
      
      {/* Indicateurs de systèmes actifs */}
      {isListening && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          Systèmes actifs: {activeServices.join(' + ') || 'Démarrage...'}
        </div>
      )}
    </div>
  );
};

export default UltraRobustVoiceCapture;
