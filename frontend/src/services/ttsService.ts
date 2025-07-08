import axios from 'axios';

const ELEVENLABS_VOICE_ID = '1a3lMdKLUcfcMtvN772u';
const ELEVENLABS_MODEL_ID = 'eleven_multilingual_v2';

export const textToSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await axios.post(
      '/api/tts',
      {
        text,
        voiceId: ELEVENLABS_VOICE_ID,
        modelId: ELEVENLABS_MODEL_ID,
      },
      {
        responseType: 'blob',
      }
    );

    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Error generating speech:', error);
    return null;
  }
};

export const speakText = async (text: string, onEnd?: () => void): Promise<void> => {
  const audioUrl = await textToSpeech(text);
  if (!audioUrl) return;

  const audio = new Audio(audioUrl);
  audio.onended = () => {
    if (onEnd) onEnd();
    URL.revokeObjectURL(audioUrl); // Nettoyer l'URL après lecture
  };
  
  audio.play().catch(error => {
    console.error('Error playing audio:', error);
    if (onEnd) onEnd();
  });
};
