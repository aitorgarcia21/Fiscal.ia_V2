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
    { role: 'assistant', content: "Bonjour ! Je suis Francis, votre assistant fiscal. Comment puis-je vous aider ?" }
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
    <div className={`flex flex-col h-[520px] w-full max-w-sm rounded-xl shadow-2xl border border-[#c5a572] overflow-hidden bg-[#1a2942] ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#1a2942] to-[#234876] text-[#c5a572] border-b border-[#c5a572]">
        <span className="font-semibold tracking-wide">Assistant Fiscal Francis</span>
        <button onClick={onClose} className="text-[#c5a572] hover:text-red-400 transition-colors"><CloseIcon size={18} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#0f1b33] text-white">
        {messages.map((m, idx) => (
          <div key={idx} className={`p-2 rounded max-w-[80%] ${m.role === 'user' ? 'bg-[#c5a572] text-[#162238] self-end' : 'bg-[#1a2942]'} ${m.error ? 'border border-red-400' : ''}`}> {m.content}</div>
        ))}
        {isLoading && <div className="text-gray-400">Francis écrit…</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-3 py-2 bg-gradient-to-r from-[#1a2942] to-[#234876] flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 px-3 py-2 bg-[#0f1b33] text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5a572]"
          placeholder="Votre message..."
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="px-3 py-2 bg-[#c5a572] text-[#1a2942] rounded-lg disabled:opacity-50 flex items-center gap-1 hover:brightness-110 transition"><Send size={16}/> <span>Envoyer</span></button>
      </div>
    </div>
  );
};

export default FrancisChat;
