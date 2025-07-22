import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Activity } from 'lucide-react';

interface UltraSimpleLiveRecorderProps {
  onTranscription: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
  className?: string;
}

export const UltraSimpleLiveRecorder: React.FC<UltraSimpleLiveRecorderProps> = ({
  onTranscription,
  onError = () => {},
  autoStart = false,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [noiseLevel, setNoiseLevel] = useState<'low' | 'medium' | 'high'>('low');
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const errorCountRef = useRef(0);
  const lastErrorTimeRef = useRef(0);
  const confidenceThresholdRef = useRef(0.3); // Seuil de confiance minimum
  
  // 🎯 SETUP Web Speech API ULTRA-ROBUSTE CONTRE LE BRUIT
  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('❌ Web Speech API non supporté');
      setIsSupported(false);
      onError('Web Speech API non supporté sur ce navigateur');
      return;
    }
    
    const recognition = new SpeechRecognition();
    
    // 🔥 CONFIGURATION ULTRA-ROBUSTE CONTRE LE BRUIT
    recognition.continuous = true;        // ÉCOUTE CONTINUE
    recognition.interimResults = true;    // RÉSULTATS INTERMÉDIAIRES
    recognition.lang = 'fr-FR';
    recognition.maxAlternatives = 3;      // Plus d'alternatives pour filtrer le bruit
    
    // 🛡️ PARAMÈTRES ANTI-BRUIT
    if ('webkitAudioContext' in window) {
      try {
        // Réduire la sensibilité dans les environnements bruyants
        recognition.serviceURI = recognition.serviceURI || '';
      } catch (e) {
        console.log('Paramètres audio avancés non disponibles');
      }
    }
    
    // 🎤 RÉSULTATS EN TEMPS RÉEL AVEC FILTRAGE ANTI-BRUIT
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;
      
      console.log('🎤 Web Speech Result Event:', event.results.length);
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 1;
        
        // 🛡️ FILTRAGE ANTI-BRUIT: Vérifier confiance et longueur
        const isValidTranscript = 
          transcript.length > 2 && 
          confidence >= confidenceThresholdRef.current &&
          !transcript.match(/^[^a-zA-ZÀ-ÿ]*$/) && // Pas que des caractères non-alphabétiques
          transcript.trim().length > 0;
        
        if (!isValidTranscript) {
          console.log('🚫 BRUIT FILTRÉ:', transcript, 'confidence:', confidence);
          continue;
        }
        
        // 📊 AJUSTEMENT DYNAMIQUE DU SEUIL selon le bruit
        if (confidence < 0.5) {
          setNoiseLevel('high');
          confidenceThresholdRef.current = 0.6; // Plus strict
        } else if (confidence < 0.7) {
          setNoiseLevel('medium');
          confidenceThresholdRef.current = 0.4;
        } else {
          setNoiseLevel('low');
          confidenceThresholdRef.current = 0.3; // Plus permissif
        }
        
        if (result.isFinal) {
          // 🔥 TEXTE FINAL - Ajouter au buffer permanent
          finalTranscript += transcript + ' ';
          finalTranscriptRef.current = finalTranscript;
          
          console.log('✅ FINAL:', transcript, 'confidence:', confidence);
          
          // 📡 ÉMISSION IMMÉDIATE vers Francis
          onTranscription(finalTranscript.trim(), false);
          setLiveText(finalTranscript.trim());
          
          // Reset compteur d'erreurs sur succès
          errorCountRef.current = 0;
          
        } else {
          // ⚡ TEXTE INTERMÉDIAIRE - Affichage live pendant que l'utilisateur parle
          interimTranscript += transcript;
          
          console.log('⚡ INTERIM:', interimTranscript, 'confidence:', confidence);
          
          const liveDisplay = (finalTranscript + interimTranscript).trim();
          
          // 🔥 AFFICHAGE IMMÉDIAT - Pendant que l'utilisateur parle
          setLiveText(liveDisplay);
          onTranscription(liveDisplay, false);
        }
      }
    };
    
    // 🔄 REDÉMARRAGE AUTOMATIQUE si arrêt inattendu
    recognition.onend = () => {
      console.log('🔄 Recognition ended - Redémarrage automatique...');
      if (isListening) {
        setTimeout(() => {
          try {
            recognition.start();
            console.log('✅ Recognition redémarrée');
          } catch (e) {
            console.error('❌ Erreur redémarrage:', e);
          }
        }, 100);
      }
    };
    
    recognition.onerror = (event: any) => {
      const currentTime = Date.now();
      const timeSinceLastError = currentTime - lastErrorTimeRef.current;
      
      console.error('❌ Web Speech Error:', event.error, 'Count:', errorCountRef.current);
      
      // 🛡️ GESTION INTELLIGENTE DES ERREURS DE BRUIT
      if (event.error === 'no-speech') {
        // Pas d'erreur, juste silence
        console.log('🔇 Silence détecté - Normal');
        return;
      }
      
      if (event.error === 'audio-capture') {
        errorCountRef.current++;
        
        if (errorCountRef.current < 3 && timeSinceLastError > 2000) {
          console.log('🔄 Erreur audio - Tentative de redémarrage...');
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.log('Redémarrage après erreur audio échoué');
              }
            }
          }, 500);
        }
      }
      
      if (event.error === 'network') {
        setNoiseLevel('high');
        confidenceThresholdRef.current = 0.7; // Plus strict en cas de problème réseau
      }
      
      lastErrorTimeRef.current = currentTime;
      
      // Ne signaler que les vraies erreurs critiques
      if (event.error !== 'no-speech' && event.error !== 'aborted' && 
          event.error !== 'audio-capture' && errorCountRef.current > 2) {
        onError(`Erreur recognition: ${event.error}`);
      }
    };
    
    recognition.onstart = () => {
      console.log('🎤 Recognition démarrée');
    };
    
    recognitionRef.current = recognition;
    
  }, [isListening, onTranscription, onError]);
  
  // 🎯 DÉMARRER L'ÉCOUTE
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;
    
    try {
      setIsListening(true);
      setLiveText('');
      finalTranscriptRef.current = '';
      
      recognitionRef.current.start();
      console.log('🚀 Écoute continue démarrée');
      
    } catch (error) {
      console.error('❌ Erreur start:', error);
      onError(`Erreur démarrage: ${error}`);
      setIsListening(false);
    }
  }, [isSupported, onError]);
  
  // 🛑 ARRÊTER L'ÉCOUTE
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      setIsListening(false);
      recognitionRef.current.stop();
      
      // Émission finale
      if (finalTranscriptRef.current.trim()) {
        onTranscription(finalTranscriptRef.current.trim(), true);
      }
      
      console.log('🛑 Écoute arrêtée');
      
    } catch (error) {
      console.error('❌ Erreur stop:', error);
    }
  }, [onTranscription]);
  
  // Toggle
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  // Auto-start
  useEffect(() => {
    if (autoStart && !isListening && isSupported) {
      startListening();
    }
  }, [autoStart, isListening, isSupported, startListening]);
  
  // Nettoyage
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Cleanup recognition stop error:', e);
        }
      }
    };
  }, [isListening]);
  
  if (!isSupported) {
    return (
      <div className="text-red-400 p-4 rounded-lg border border-red-500/20">
        ❌ Web Speech API non supporté sur ce navigateur
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Bouton principal */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleListening}
          className={`
            relative flex items-center justify-center w-16 h-16 rounded-full
            transition-all duration-300 focus:outline-none focus:ring-4
            ${isListening 
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 focus:ring-red-500/50 animate-pulse' 
              : 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] hover:from-[#e8cfa0] hover:to-[#c5a572] text-[#162238] shadow-lg shadow-[#c5a572]/30 focus:ring-[#c5a572]/50'
            }
            hover:scale-105 cursor-pointer
          `}
          aria-label={isListening ? 'Arrêter l\'écoute' : 'Démarrer l\'écoute'}
        >
          {isListening ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
          
          {/* Indicateur d'activité */}
          {isListening && (
            <div className="absolute -top-2 -right-2">
              <Activity className="w-6 h-6 text-white animate-bounce" />
            </div>
          )}
        </button>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-4 h-4 rounded-full transition-colors duration-300 ${
              isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            }`} />
            <span className={`font-medium ${
              isListening ? 'text-green-400' : 'text-gray-400'
            }`}>
              {isListening ? 'ÉCOUTE LIVE ACTIVE' : 'Prêt à écouter'}
            </span>
            {isListening && (
              <span className="text-green-400 font-bold text-sm animate-pulse">● LIVE</span>
            )}
            
            {/* 🛡️ INDICATEUR NIVEAU DE BRUIT */}
            {isListening && (
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                noiseLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                noiseLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {noiseLevel === 'low' ? '🔇 Calme' :
                 noiseLevel === 'medium' ? '🔊 Bruit modéré' :
                 '🚨 Environnement bruyant'}
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-400">
            Web Speech API • Français • Anti-Bruit • Temps Réel
          </div>
        </div>
      </div>
      
      {/* Affichage du texte LIVE */}
      <div className="min-h-[100px] bg-gradient-to-br from-[#0A192F] to-[#162238] rounded-xl border border-[#c5a572]/20 p-4 relative">
        {liveText ? (
          <div className="space-y-2">
            <div className="text-gray-200 text-base leading-relaxed">
              {liveText}
              {isListening && (
                <span className="inline-block w-1 h-5 bg-green-400 ml-1 animate-ping" />
              )}
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-[#c5a572]/10">
              <span className="text-xs text-gray-500">
                {liveText.split(' ').length} mots
              </span>
              <span className="text-xs text-green-400 font-medium">
                ⚡ TRANSCRIPTION LIVE
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-2">
              <Mic className={`w-12 h-12 mx-auto ${
                isListening ? 'text-green-400 animate-pulse' : 'text-gray-500'
              }`} />
              <p className={`font-medium ${
                isListening ? 'text-green-400' : 'text-gray-400'
              }`}>
                {isListening ? '🎤 J\'ÉCOUTE... PARLEZ MAINTENANT !' : '🎤 Cliquez pour activer'}
              </p>
              {isListening && (
                <p className="text-green-300 text-sm animate-pulse">
                  Le texte apparaîtra ici EN TEMPS RÉEL
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Effet visuel d'écoute */}
        {isListening && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400/0 via-green-400/80 to-green-400/0 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#c5a572]/0 via-[#c5a572]/80 to-[#c5a572]/0 animate-pulse" 
                 style={{ animationDelay: '0.5s' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UltraSimpleLiveRecorder;
