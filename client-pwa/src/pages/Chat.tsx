import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const user = supabase.auth.user();

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from<Message>('messages')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `client_id=eq.${user.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    setInput('');
    await supabase.from('messages').insert({ client_id: user.id, sender_id: user.id, content: input });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">Veuillez vous reconnecter</div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-dark text-white">
      <header className="p-4 border-b border-primary/30 text-lg font-bold">Messagerie sécurisée</header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.sender_id === user.id ? 'bg-primary text-dark rounded-br-none' : 'bg-[#162238] rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>
      <footer className="p-4 border-t border-primary/30 flex gap-2">
        <input
          className="flex-1 p-3 rounded-lg bg-[#162238] focus:outline-none"
          placeholder="Écrire un message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <button onClick={handleSend} className="bg-primary text-dark px-4 rounded-lg font-semibold">
          Envoyer
        </button>
      </footer>
    </div>
  );
} 