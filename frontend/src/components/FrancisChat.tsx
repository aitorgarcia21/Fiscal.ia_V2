import React, { useState, useRef, useEffect } from 'react';
import { X as CloseIcon, Send } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

interface FrancisChatProps {
  onClose?: () => void;
  className?: string;
}

/**
 * Placeholder floating chat component for Francis assistant.
 * Provides minimal UI: header with close, body placeholder.
 */
export const FrancisChat: React.FC<FrancisChatProps> = ({ onClose, className = '' }) => {
  const [input, setInput] = useState('');
  interface ChatMessage { role: 'user' | 'assistant'; content: string; error?: boolean }
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Bonjour ! Je suis Francis, votre copilote. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isProfessional } = useAuth();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const question = input.trim();
    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const resp = await apiClient<any>('/api/ask', {
        method: 'POST',
        data: {
          question,
          conversation_history: messages.map(m => ({ role: m.role, content: m.content }))
        }
      });
      const assistantMsg: ChatMessage = { role: 'assistant', content: resp.answer || '…' };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('FrancisChat error', err);
      setMessages(prev => [...prev, { role: 'assistant', content: err.data?.detail || 'Erreur', error: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (!isProfessional) return null; // safety

  return (
    <div className={`flex flex-col h-[520px] w-full max-w-sm rounded-xl shadow-2xl border border-[#c5a572]/30 overflow-hidden bg-[#0f1419] ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#162238] to-[#243447] border-b border-[#c5a572]/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center">
            <span className="text-[#162238] font-bold">C</span>
          </div>
          <span className="font-semibold tracking-wide text-white">Votre copilote Francis</span>
        </div>
        <button onClick={onClose} className="text-[#c5a572] hover:text-red-500 transition-colors"><CloseIcon size={18} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#0f1419] text-white">
        {messages.map((m, idx) => (
          <div key={idx} className={`p-3 rounded-lg shadow-md max-w-[85%] ${
            m.role === 'user' 
              ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] self-end rounded-br-none ml-auto' 
              : 'bg-[#1a2332]/90 border border-[#c5a572]/30 rounded-bl-none mr-auto'
          } ${m.error ? 'border border-red-400' : ''}`}>
            {m.content}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-1.5 bg-[#1a2332]/90 border border-[#c5a572]/30 p-3 rounded-lg rounded-bl-none shadow-md max-w-[85%] mr-auto">
            <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-gradient-to-r from-[#162238] to-[#243447] flex gap-2 border-t border-[#c5a572]/30">
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#243447] text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5a572] border border-[#c5a572]/30 shadow-inner"
            placeholder="Posez votre question à votre copilote..."
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-[#c5a572] rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-[#c5a572] rounded-full animate-pulse delay-100"></div>
              <div className="w-1.5 h-1.5 bg-[#c5a572] rounded-full animate-pulse delay-200"></div>
            </div>
          )}
        </div>
        <button 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()} 
          className="px-4 py-2.5 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg disabled:opacity-50 flex items-center gap-1.5 hover:shadow-lg transition-all border-2 border-[#e8cfa0]/50 font-medium"
        >
          <Send size={16}/> <span>Envoyer</span>
        </button>
      </div>
    </div>
  );
};

export default FrancisChat;
