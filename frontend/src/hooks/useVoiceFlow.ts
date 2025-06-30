import { useEffect, useRef, useState } from 'react';

interface VoiceFlowOptions {
  questions: string[];
  onAnswer: (index: number, text: string) => void;
  autoStart?: boolean;
}

/**
 * Hook minimal pour un flux vocal continu :
 * 1. Lit chaque question via SpeechSynthesis.
 * 2. Active SpeechRecognition pour capter la réponse.
 * 3. À la fin de la réponse (silence), déclenche onAnswer et passe à la suivante.
 *
 * Ce prototype se base sur lʼAPI Web Speech (Chrome). Il faudra un fallback si non supporté.
 */
export function useVoiceFlow({ questions, onAnswer, autoStart = false }: VoiceFlowOptions) {
  const [started, setStarted] = useState(autoStart);
  const [currentIndex, setCurrentIndex] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialiser SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;

    const rec: SpeechRecognition = new SpeechRecognition();
    rec.lang = 'fr-FR';
    rec.interimResults = false;
    rec.continuous = false;

    recognitionRef.current = rec;
  }, []);

  // Démarrer le flux si besoin
  useEffect(() => {
    if (!started) return;
    if (currentIndex >= questions.length) return;

    const speakAndListen = async () => {
      const text = questions[currentIndex];

      // Construire l'URL de l'API (similaire au helper utilisé ailleurs)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fiscal-ia-backend.up.railway.app';
      const buildUrl = (endpoint: string): string => {
        let base = API_BASE_URL.replace(/\/+$/, '');
        let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        if (base.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
          cleanEndpoint = cleanEndpoint.slice(4);
        }
        return `${base}${cleanEndpoint}`;
      };

      let audioPlayed = false;
      try {
        const response = await fetch(buildUrl('/api/tts'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) throw new Error('TTS API error');

        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        await new Promise<void>((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(url);
            resolve();
          };
          audio.onerror = () => resolve(); // Fallback sur erreur
          audio.play();
        });

        audioPlayed = true;
      } catch (error) {
        console.warn('TTS distant indisponible, fallback SpeechSynthesis', error);
      }

      // Fallback local si le TTS distant n'a pas fonctionné
      if (!audioPlayed) {
        const synth = window.speechSynthesis;
        if (synth) {
          await new Promise<void>((resolve) => {
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = 'fr-FR';
            utter.rate = 1;
            utter.onend = () => resolve();
            synth.speak(utter);
          });
        }
      }

      // Après la lecture (quelle qu'elle soit), lancer l'écoute
      const rec = recognitionRef.current;
      if (rec) {
        rec.onresult = (event) => {
          const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join(' ');
          onAnswer(currentIndex, transcript);
          rec.stop();
          setCurrentIndex((i) => i + 1);
        };
        rec.onerror = () => {
          rec.stop();
          setCurrentIndex((i) => i + 1);
        };
        rec.start();
      }
    };

    speakAndListen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, currentIndex]);

  const start = () => setStarted(true);

  return { started, currentIndex, start };
} 