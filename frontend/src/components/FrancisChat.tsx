import React, { useState } from 'react';

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
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, input]);
    setInput('');
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between p-2 bg-[#0E2444] text-[#c5a572]">
        <span>Chat Francis (demo)</span>
        <button onClick={onClose} className="text-red-400">X</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#162238] text-white">
        {messages.map((m, idx) => (
          <div key={idx} className="bg-[#1a2942] p-2 rounded">
            {m}
          </div>
        ))}
      </div>
      <div className="p-2 bg-[#0E2444] flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 px-2 py-1 bg-[#162238] text-white rounded"
          placeholder="Votre message..."
        />
        <button onClick={handleSend} className="px-3 py-1 bg-[#c5a572] text-[#162238] rounded">Envoyer</button>
      </div>
    </div>
  );
};

export default FrancisChat;
