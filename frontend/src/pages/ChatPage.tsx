import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, ArrowRight, MessageSquare, Euro } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis Francis, votre assistant fiscal IA. Posez-moi vos questions sur les impôts, la fiscalité ou l'optimisation de vos finances personnelles."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Appel réel à l'API Francis
      const response = await fetch('/api/test-francis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.answer || data.response || 'Je n\'ai pas pu traiter votre demande.'
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Erreur de communication avec Francis');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, une erreur s'est produite. Veuillez réessayer." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] p-4">
      <div className="max-w-4xl mx-auto bg-[#1a2942]/80 backdrop-blur-sm rounded-xl border border-[#c5a572]/20 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#c5a572]/20 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <MessageSquare className="w-10 h-10 text-[#c5a572]" />
              <Euro className="w-5 h-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2942] rounded-full p-0.5" />
            </div>
          </div>
          <button 
            onClick={() => navigate('/discover')}
            className="text-sm text-[#c5a572] hover:text-[#e8cfa0] transition-colors flex items-center"
          >
            Découvrir des utilisateurs <ArrowRight className="ml-1 w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-[70vh] overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-[#c5a572] text-[#1a2942] rounded-br-none'
                    : 'bg-[#223c63] text-white rounded-bl-none'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-6 h-6 bg-[#c5a572] rounded-full flex items-center justify-center relative">
                      <MessageSquare className="w-3.5 h-3.5 text-[#1a2942]" />
                      <Euro className="w-2.5 h-2.5 text-[#1a2942] absolute -bottom-1 -right-1 bg-[#c5a572] rounded-full p-0.5" />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-6 h-6 bg-[#1a2942] rounded-full flex items-center justify-center">
                      <UserIcon className="w-3.5 h-3.5 text-[#c5a572]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 p-4">
              <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-[#c5a572]/20">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question à Francis..."
              className="flex-1 px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#c5a572] text-[#1a2942] p-3 rounded-lg hover:bg-[#e8cfa0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
