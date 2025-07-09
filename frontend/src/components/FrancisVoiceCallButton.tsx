import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  agentId: string;
}

/**
 * Button that opens a WebSocket stream with ElevenLabs Voice Agent.
 * Plays incoming audio automatically and sends mic audio is handled by ElevenLabs widget (browser asks for mic permission automatically once WS opens).
 */
export const FrancisVoiceCallButton: React.FC<Props> = ({ agentId }) => {
  const { isProfessional } = useAuth();
  const [isCalling, setIsCalling] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceBufferRef = useRef<MediaSource | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const ELEVEN_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;

  const startCall = () => {
    if (!ELEVEN_API_KEY) {
      alert('API key ElevenLabs manquante (VITE_ELEVENLABS_API_KEY)');
      return;
    }

    const ws = new WebSocket(`wss://api.elevenlabs.io/agents/${agentId}/stream`);
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => {
      // Auth header via query param fallback (ElevenLabs accepte xi-api-key header via initial HTTP upgrade)
      // Mais certains navigateurs ne permettent pas headers custom → on envoie un message auth après l'ouverture.
      ws.send(JSON.stringify({ api_key: ELEVEN_API_KEY }));
      setIsCalling(true);
    };

    ws.onmessage = (evt) => {
      if (typeof evt.data === 'string') {
        // For text debug / status
        console.log('WS text', evt.data);
        return;
      }
      // Binary audio chunk (mp3). Play via Audio element streaming.
      const blob = new Blob([evt.data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play().catch((e) => console.error('Audio play error', e));
    };

    ws.onclose = () => {
      setIsCalling(false);
    };

    ws.onerror = (err) => {
      console.error('WS error', err);
      setIsCalling(false);
    };

    wsRef.current = ws;
  };

  const endCall = () => {
    wsRef.current?.close();
    setIsCalling(false);
  };

  // Clean on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  if (!isProfessional) return null;

  return (
    <button
      className="px-4 py-2 rounded bg-blue-600 text-white shadow-md disabled:opacity-50"
      onClick={isCalling ? endCall : startCall}
      disabled={!ELEVEN_API_KEY}
    >
      {isCalling ? 'Raccrocher' : 'Appeler Francis'}
    </button>
  );
};
