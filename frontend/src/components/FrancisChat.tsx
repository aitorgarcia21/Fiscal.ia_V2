import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Mic, MicOff } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';

interface FrancisChatProps {
  onClose: () => void;
}

export const FrancisChat: React.FC<FrancisChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Bonjour ! Je suis Francis, votre assistant IA. Comment puis-je vous aider aujourd'hui ?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simuler une réponse de l'IA
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { text: "Je vais vous aider avec cela. Pourriez-vous me donner plus de détails ?", isUser: false }
      ]);
    }, 1000);
  };

  const handleVoiceResult = (text: string) => {
    setInput(text);
    // Envoyer automatiquement le message vocal
    if (text.trim()) {
      const userMessage = { text, isUser: true };
      setMessages(prev => [...prev, userMessage]);
      
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { text: "J'ai bien reçu votre message vocal. Je vais vous aider avec cela.", isUser: false }
        ]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* En-tête du chat */}
      <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bot size={20} />
          <h3 className="font-semibold">Francis - Assistant IA</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200"
          aria-label="Fermer le chat"
        >
          <X size={20} />
        </button>
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
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tapez votre message..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <VoiceRecorder 
              onResult={handleVoiceResult}
              onListeningChange={setIsListening}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!input.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
