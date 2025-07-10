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
    <div className={`flex flex-col h-[520px] w-full max-w-sm rounded-xl shadow-2xl border border-[#e8cfa0] overflow-hidden bg-[#1a2332] ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] border-b border-[#162238]">
        <span className="font-semibold tracking-wide">Votre Copilote</span>
        <button onClick={onClose} className="text-[#162238] hover:text-red-700 transition-colors"><CloseIcon size={18} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#1a2332] text-white">
        {messages.map((m, idx) => (
          <div key={idx} className={`p-2 rounded max-w-[80%] ${m.role === 'user' ? 'bg-[#c5a572] text-[#162238] self-end' : 'bg-[#1a2942]'} ${m.error ? 'border border-red-400' : ''}`}> {m.content}</div>
        ))}
        {isLoading && <div className="text-gray-400">Francis écrit…</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-3 py-2 bg-gradient-to-r from-[#0f1419] via-[#1a2332] to-[#243447] flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 px-3 py-2 bg-[#243447] text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e8cfa0]"
          placeholder="Votre message..."
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="px-3 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg disabled:opacity-50 flex items-center gap-1 hover:shadow-lg transition-all"><Send size={16}/> <span>Envoyer</span></button>
      </div>
    </div>
  );
};

export default FrancisChat;
