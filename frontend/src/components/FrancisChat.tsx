import React, { useState, useRef, useEffect } from 'react';
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between p-2 bg-[#0E2444] text-[#c5a572]">
        <span>Chat Francis</span>
        <button onClick={onClose} className="text-red-400">X</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#162238] text-white">
        {messages.map((m, idx) => (
          <div key={idx} className={`p-2 rounded max-w-[80%] ${m.role === 'user' ? 'bg-[#c5a572] text-[#162238] self-end' : 'bg-[#1a2942]'} ${m.error ? 'border border-red-400' : ''}`}> {m.content}</div>
        ))}
        {isLoading && <div className="text-gray-400">Francis écrit…</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 bg-[#0E2444] flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 px-2 py-1 bg-[#162238] text-white rounded"
          placeholder="Votre message..."
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="px-3 py-1 bg-[#c5a572] text-[#162238] rounded disabled:opacity-50">Envoyer</button>
      </div>
    </div>
  );
};

export default FrancisChat;
