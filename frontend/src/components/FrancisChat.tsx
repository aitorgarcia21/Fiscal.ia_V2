import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Volume2, MessageSquare, Euro } from 'lucide-react';
import { speakText } from '../services/ttsService';

interface FrancisChatProps {
  onClose: () => void;
}

export const FrancisChat: React.FC<FrancisChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Bonjour ! Je suis Francis, votre assistant IA. Comment puis-je vous aider aujourd'hui ?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const userInput = input.trim();
    if (!userInput) return;

    // Ajouter le message de l'utilisateur
    const userMessage = { text: userInput, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simuler une réponse de l'IA
    const generateAIResponse = async () => {
      try {
        // Ici, vous pourriez appeler une API pour une réponse plus intelligente
        const aiResponse = `J'ai bien reçu votre message : "${userInput}". Je vais vous aider avec cela. Pourriez-vous me donner plus de détails ?`;
        
        // Mettre à jour l'interface utilisateur avec la réponse
        setMessages(prev => [
          ...prev,
          { text: aiResponse, isUser: false }
        ]);
        
              // Lecture vocale désactivée dans ce composant (réservée au chat pro)
      } catch (error) {
        console.error('Erreur lors de la génération de la réponse:', error);
        const errorMessage = "Je rencontre une difficulté pour traiter votre demande. Veuillez réessayer.";
        setMessages(prev => [...prev, { text: errorMessage, isUser: false }]);
      }
    };

    // Délai pour simuler le temps de traitement
    setTimeout(generateAIResponse, 800);
  };

  // La fonctionnalité vocale complète est désactivée dans ce composant
  // et réservée uniquement au chat pro (ProChatPage)

  return (
    <div className="flex flex-col h-full bg-white">
      {/* En-tête du chat */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2a3a54] text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="relative mr-2">
            <MessageSquare className="h-6 w-6 text-[#c5a572]" />
            <Euro className="h-4 w-4 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2332] rounded-full p-0.5" />
          </div>
          <div className="flex items-center">
            <h3 className="font-semibold text-white">Francis - Assistant IA</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                const lastMessage = messages[messages.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                  speakText(lastMessage.text);
                }
              }}
              className="p-1 text-[#c5a572] hover:text-white transition-colors"
              title="Lire le dernier message"
              disabled={!messages.length || messages[messages.length - 1]?.isUser}
            >
              <Volume2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Corps du chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser 
                  ? 'bg-blue-100 text-blue-900' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="p-4 border-t border-gray-200 bg-[#0E2444]">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tapez votre message..."
              className="w-full bg-[#1a2332] border border-[#2A3F6C]/50 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
              disabled={isSpeaking}
            />
            {isSpeaking && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-1 h-3 bg-[#c5a572] rounded-full animate-audio-wave"></div>
                  <div className="w-1 h-4 bg-[#c5a572] rounded-full animate-audio-wave animation-delay-100"></div>
                  <div className="w-1 h-3 bg-[#c5a572] rounded-full animate-audio-wave animation-delay-200"></div>
                </div>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-[#c5a572] text-[#162238] p-2 rounded-lg hover:bg-[#e8cfa0] focus:outline-none focus:ring-2 focus:ring-[#c5a572] focus:ring-offset-2 focus:ring-offset-[#0E2444] disabled:opacity-50"
            disabled={!input.trim() || isSpeaking}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
