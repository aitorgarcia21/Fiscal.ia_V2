import React, { useEffect, useState, useRef } from 'react';
import { Activity, Mic, Brain } from 'lucide-react';

interface LiveTranscriptionDisplayProps {
  currentTranscription: string;
  isListening: boolean;
  isProcessing?: boolean;
  className?: string;
}

export const LiveTranscriptionDisplay: React.FC<LiveTranscriptionDisplayProps> = ({
  currentTranscription,
  isListening,
  isProcessing = false,
  className = ''
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const previousTextRef = useRef('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🎯 EFFET DE FRAPPE EN TEMPS RÉEL
  useEffect(() => {
    if (currentTranscription === previousTextRef.current) return;

    const newPortion = currentTranscription.slice(previousTextRef.current.length);
    
    if (newPortion.trim()) {
      setIsTyping(true);
      
      // Effet de frappe progressif
      let currentIndex = 0;
      const typingSpeed = 30; // ms par caractère
      
      const typeText = () => {
        if (currentIndex < newPortion.length) {
          setDisplayText(prev => prev + newPortion[currentIndex]);
          currentIndex++;
          
          setTimeout(typeText, typingSpeed);
        } else {
          setIsTyping(false);
        }
      };

      typeText();
    } else {
      // Mise à jour immédiate si pas de nouveau texte
      setDisplayText(currentTranscription);
    }

    previousTextRef.current = currentTranscription;

    // Reset du timer de frappe
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);

  }, [currentTranscription]);

  // 🔄 RESET quand arrêt d'écoute
  useEffect(() => {
    if (!isListening) {
      setDisplayText('');
      setIsTyping(false);
      previousTextRef.current = '';
    }
  }, [isListening]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const hasContent = displayText.trim().length > 0;

  return (
    <div className={`relative ${className}`}>
      {/* En-tête avec statut */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            !isListening ? 'bg-gray-500' :
            isProcessing ? 'bg-yellow-500 animate-pulse' :
            isTyping ? 'bg-green-500 animate-pulse' :
            hasContent ? 'bg-blue-500' : 'bg-green-400 animate-pulse'
          }`} />
          
          <span className={`text-sm font-medium transition-colors duration-300 ${
            !isListening ? 'text-gray-400' :
            isProcessing ? 'text-yellow-400' :
            isTyping ? 'text-green-400' :
            hasContent ? 'text-blue-400' : 'text-green-400'
          }`}>
            {!isListening ? 'En attente...' :
             isProcessing ? 'Francis traite...' :
             isTyping ? 'Transcription en cours...' :
             hasContent ? 'Francis analyse' : 'Francis écoute...'}
          </span>
        </div>

        {/* Indicateurs d'activité */}
        <div className="flex items-center space-x-2">
          {isListening && (
            <Mic className={`w-4 h-4 ${isTyping ? 'text-green-400 animate-pulse' : 'text-green-500'}`} />
          )}
          {isProcessing && (
            <Brain className="w-4 h-4 text-yellow-400 animate-pulse" />
          )}
          {isTyping && (
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          )}
        </div>
      </div>

      {/* Zone de transcription live */}
      <div className="min-h-[120px] bg-gradient-to-br from-[#0A192F] to-[#162238] rounded-xl border border-[#c5a572]/20 p-4 relative overflow-hidden">
        {hasContent ? (
          <div className="space-y-2">
            {/* Texte transcrit */}
            <div className="text-gray-200 text-base leading-relaxed">
              {displayText}
              {/* Curseur de frappe */}
              {isTyping && (
                <span className="inline-block w-0.5 h-5 bg-green-400 ml-1 animate-pulse" />
              )}
            </div>
            
            {/* Indicateur de traitement Francis */}
            {isProcessing && (
              <div className="flex items-center space-x-2 pt-2 border-t border-[#c5a572]/10">
                <Brain className="w-4 h-4 text-[#c5a572] animate-pulse" />
                <span className="text-[#c5a572] text-xs font-medium animate-pulse">
                  Francis analyse et extrait les informations...
                </span>
              </div>
            )}
            
            {/* Statistiques */}
            <div className="flex justify-between items-center pt-2 border-t border-[#c5a572]/10">
              <span className="text-xs text-gray-500">
                {displayText.split(' ').length} mots transcrites
              </span>
              <span className="text-xs text-[#c5a572]">
                ● LIVE
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-2">
              {isListening ? (
                <>
                  <Mic className="w-8 h-8 text-green-400 mx-auto animate-pulse" />
                  <p className="text-green-400 font-medium">
                    🎤 Francis écoute...
                  </p>
                  <p className="text-gray-400 text-sm">
                    Parlez maintenant, la transcription apparaîtra ici en temps réel
                  </p>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8 text-gray-500 mx-auto" />
                  <p className="text-gray-400 font-medium">
                    🎤 Francis prêt à écouter
                  </p>
                  <p className="text-gray-500 text-sm">
                    Activez l'assistant vocal pour commencer la transcription live
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Effet visuel de listening */}
        {isListening && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400/0 via-green-400/60 to-green-400/0 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#c5a572]/0 via-[#c5a572]/60 to-[#c5a572]/0 animate-pulse" 
                 style={{ animationDelay: '0.5s' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTranscriptionDisplay;
