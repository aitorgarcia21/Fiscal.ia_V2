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
      className={`px-5 py-2.5 rounded-lg ${isCalling 
        ? 'bg-red-600 text-white border-2 border-red-400 animate-pulse' 
        : 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] border-2 border-[#e8cfa0]/50'} 
        font-medium shadow-md hover:shadow-lg hover:shadow-[#c5a572]/30 transition-all duration-200 
        flex items-center gap-2 disabled:opacity-50 relative overflow-hidden group`}
      onClick={isCalling ? endCall : startCall}
      disabled={!ELEVEN_API_KEY}
    >
      <div className={`absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${isCalling ? 'hidden' : ''}`}></div>
      {isCalling ? (
        <>
          <div className="relative z-10 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Raccrocher</span>
          </div>
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-400 animate-ping"></span>
        </>
      ) : (
        <>
          <div className="relative z-10 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Appeler votre copilote</span>
          </div>
        </>
      )}
    </button>
  );
};
