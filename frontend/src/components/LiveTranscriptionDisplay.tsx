import React, { useEffect, useState, useRef } from 'react';
import { Mic } from 'lucide-react';

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
      {/* Statut simple */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isListening ? 'bg-green-400' : 'bg-gray-500'
          }`} />
          <span className="text-xs text-gray-400">
            {isListening ? '● LIVE' : 'Prêt'}
          </span>
        </div>
        {isListening && <Mic className="w-3 h-3 text-green-400" />}
      </div>

      {/* Zone de transcription simplifiée */}
      <div className="bg-[#0A192F]/50 rounded-lg border border-gray-700/30 p-3 min-h-[80px]">
        {hasContent ? (
          <div className="text-gray-200 text-sm leading-relaxed">
            {displayText}
            {isTyping && (
              <span className="inline-block w-0.5 h-4 bg-green-400 ml-1 animate-pulse" />
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-xs py-4">
            {isListening ? (
              <span>🎤 J'ÉCOUTE... PARLEZ MAINTENANT !</span>
            ) : (
              <span>Le texte apparaîtra ici EN TEMPS RÉEL</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTranscriptionDisplay;
