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

    const speakAndListen = () => {
      const synth = window.speechSynthesis;
      if (!synth) return;

      // Prononcer la question
      const utter = new SpeechSynthesisUtterance(questions[currentIndex]);
      utter.lang = 'fr-FR';
      utter.rate = 1;
      utter.onend = () => {
        // Quand la question est terminée, lancer l'écoute
        const rec = recognitionRef.current;
        if (!rec) return;

        rec.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((r: any) => r[0].transcript)
            .join(' ');
          onAnswer(currentIndex, transcript);
          rec.stop();
          setCurrentIndex((i) => i + 1);
        };
        rec.onerror = () => {
          rec.stop();
          setCurrentIndex((i) => i + 1);
        };
        rec.start();
      };

      synth.speak(utter);
    };

    speakAndListen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, currentIndex]);

  const start = () => setStarted(true);

  return { started, currentIndex, start };
} 