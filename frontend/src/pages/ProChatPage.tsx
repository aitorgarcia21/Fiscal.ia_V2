import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, ArrowRight, MessageSquare, Euro, Briefcase, Users, ArrowLeft, Mic, MicOff, Volume2 } from 'lucide-react'; // Ajout icônes vocaux
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import { ClientProfile } from '../types/clientProfile'; // Pour la sélection client future
import { useCountry, Country } from '../contexts/CountryContext';


interface ProMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  error?: boolean;
}

// Pourrait être utilisé si on sélectionne un client
interface ClientContextForFrancis {
  tmi?: number | null;
  situation_familiale?: string | null;
  nombre_enfants?: number | null;
  residence_principale?: boolean | null;
  residence_secondaire?: boolean | null;
  revenus_annuels?: number | null;
  charges_deductibles?: string | number | null; // Modifié pour correspondre à ce qu'on a dans ClientProfile
}

export function ProChatPage() {
  const [messages, setMessages] = useState<ProMessage[]>([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis Francis, votre assistant financier personnel ! Comment puis-je vous aider aujourd'hui ?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, isProfessional } = useAuth(); // isProfessional sera utile

  // États pour la sélection de client (à développer)
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [selectedClientProfile, setSelectedClientProfile] = useState<ClientProfile | null>(null);
  const [isLoadingClientProfile, setIsLoadingClientProfile] = useState(false);

  const { country: jurisdiction, setCountry: setJurisdiction } = useCountry();

  // Charger la liste des clients du professionnel au montage
  useEffect(() => {
    const fetchClients = async () => {
      if (isAuthenticated && isProfessional) {
        setIsLoadingClients(true);
        try {
          const response = await apiClient<ClientProfile[]>('/api/pro/clients/');
          setClients(response || []);
        } catch (err) {
          console.error("Erreur chargement des clients pour le chat pro:", err);
          setClients([]);
        }
        setIsLoadingClients(false);
      }
    };
    fetchClients();
  }, [isAuthenticated, isProfessional]);

  // Charger le profil complet dès qu'un client est sélectionné
  useEffect(() => {
    const fetchClientProfile = async () => {
      if (selectedClientId) {
        setIsLoadingClientProfile(true);
        try {
          const profile = await apiClient<ClientProfile>(`/api/pro/clients/${selectedClientId}`, { method: 'GET' });
          setSelectedClientProfile(profile);
        } catch (err) {
          console.error('Erreur chargement du profil client:', err);
          setSelectedClientProfile(null);
        }
        setIsLoadingClientProfile(false);
      } else {
        setSelectedClientProfile(null);
      }
    };
    fetchClientProfile();
  }, [selectedClientId]);

  // --------------------------------------------------
  // VOICE RECORDING HELPERS
  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recordedChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        try {
          const text = await uploadAudioSTT(blob);
          setInput(text);
          // Auto-send transcription
          setTimeout(() => {
            const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent;
            handleSend(fakeEvent);
          }, 0);
        } catch (err) {
          console.error('Erreur STT:', err);
        }
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Erreur accès micro:', err);
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording(); else startRecording();
  };
  // --------------------------------------------------

  const uploadAudioSTT = async (blob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');
    const res = await apiClient<{ text: string }>('/api/stt', {
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.text;
  };

  const speakAssistant = async (text: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error('Erreur TTS');
      const audioBlob = await res.blob();
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error('Erreur TTS:', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ProMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    let endpoint = '/api/ask'; // Endpoint par défaut (comme pour les particuliers)
    let payload: any = {
      question: currentInput,
      // L'historique est constitué des messages précédents avant le nouveau message utilisateur
      conversation_history: messages.map(msg => ({ role: msg.role, content: msg.content })),
      jurisdiction
    };

    if (selectedClientId) {
      endpoint = `/api/pro/clients/${selectedClientId}/ask_francis`;
      // Le payload pour cet endpoint spécifique (query, conversation_history) est différent
      // conversation_history est attendu à la racine par get_fiscal_response
      payload = {
        query: currentInput,
        conversation_history: messages.map(msg => ({ role: msg.role, content: msg.content })),
        jurisdiction
      };
      // Le contexte client sera géré par le backend pour cet endpoint
    } else {
      // Pour l'endpoint /api/ask, on pourrait vouloir envoyer un user_profile_context
      // si Francis pour pro sans client sélectionné doit avoir le contexte du pro lui-même.
      // Pour l'instant, on envoie sans contexte utilisateur spécifique si aucun client n'est choisi.
      // payload.user_profile_context = { ... } // à définir si besoin
    }

    try {
      // apiClient gère déjà l'authentification via le token stocké
      const responseData = await apiClient<any>(endpoint, { 
        method: 'POST',
        data: payload,
      });

      const assistantMessage: ProMessage = {
        role: 'assistant',
        // La réponse de /api/ask et /api/pro/clients/.../ask_francis a la même structure attendue ici
        content: responseData.answer || 'Je n\'ai pas pu traiter votre demande.',
        sources: responseData.sources || []
      };
      setMessages(prev => [...prev, assistantMessage]);
      // Lecture audio de la réponse
      await speakAssistant(assistantMessage.content);
    } catch (error: any) {
      console.error('Erreur lors de l_envoi du message (ProChatPage):', error);
      const errorMessage = error.data?.detail || error.message || "Désolé, une erreur s'est produite. Veuillez réessayer.";
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage,
        error: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] to-[#0D1F3A] p-4 flex flex-col">
      <div className="w-full md:max-w-4xl mx-auto bg-[#0A192F]/90 backdrop-blur-md md:rounded-xl md:border md:border-[#2A3F6C]/40 overflow-hidden flex flex-col shadow-2xl flex-grow">
        {/* Header */}
        <div className="bg-[#162238] border-b border-[#c5a572]/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquare className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
                <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Chat Pro</h1>
                <p className="text-sm text-gray-400">Assistant pour vos clients</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              
            </div>
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-[#0E2444]/50 border border-[#c5a572]/30 hover:bg-[#0E2444]/70 hover:border-[#c5a572]/50 transition-all duration-200"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5 text-[#c5a572]" />
            </button>
          </div>
        </div>

        {/* Zone de sélection de client (placeholder, à améliorer) */}
        {clients.length > 0 && (
          <div className="p-3 border-b border-[#2A3F6C]/30 bg-[#0E2444]/50">
            <label htmlFor="client-select" className="text-xs text-gray-400 mr-2">Question pour le client :</label>
            <select 
              id="client-select"
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(e.target.value ? parseInt(e.target.value) : null)}
              disabled={isLoadingClients || isLoading}
              className="px-3 py-1.5 bg-[#162238] border border-[#c5a572]/30 rounded-md text-sm text-gray-200 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] min-w-[200px]"
            >
              <option value="">Général (sans client spécifique)</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.prenom_client} {client.nom_client}
                </option>
              ))}
            </select>
            {isLoadingClients && <span className='text-xs text-gray-500 ml-2'>Chargement clients...</span>}
          </div>
        )}

        {/* Corps principal du composant */}
        <div className="flex flex-col lg:flex-row flex-grow">
          {/* Zone de chat */}
          <div className="flex flex-col flex-grow">
            {/* Messages (similaire à ChatPage) */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 sm:p-4 rounded-lg shadow-md ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-br-none'
                        : message.error ? 'bg-red-700/70 text-white rounded-bl-none' : 'bg-[#1a2332]/80 text-gray-100 border border-[#c5a572]/20 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 relative inline-flex items-center justify-center">
                          <MessageSquare className="w-7 h-7 text-[#c5a572]" />
                          <Euro className="w-4 h-4 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#162238] rounded-full p-0.5" />
                        </div>
                      )}
                      <div className='flex-grow'>
                        <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{message.content}</p>
                        {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-white/20">
                            <p className="text-xs text-gray-300 mb-1">Sources principales :</p>
                            <ul className="list-disc list-inside pl-1 space-y-0.5">
                                {message.sources.slice(0, 3).map((source, idx) => (
                                <li key={idx} className="text-xs text-gray-400 truncate" title={source}>{source}</li>
                                ))}
                            </ul>
                            </div>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-7 h-7 bg-[#162238] rounded-full flex items-center justify-center border-2 border-[#c5a572]">
                          <UserIcon className="w-4 h-4 text-[#c5a572]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start p-3">
                    <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 relative inline-flex items-center justify-center">
                            <MessageSquare className="w-7 h-7 text-[#c5a572]" />
                            <Euro className="w-4 h-4 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#162238] rounded-full p-0.5" />
                        </div>
                        <div className="flex items-center space-x-1.5 bg-[#1a2332]/80 border border-[#c5a572]/20 p-3 rounded-lg rounded-bl-none shadow-md">
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input (similaire à ChatPage) */}
            <form onSubmit={handleSend} className="p-3 md:p-4 border-t border-[#2A3F6C]/30 bg-[#0E2444]/60 sticky bottom-0">
               <div className="flex gap-2 w-full items-end">
                <button type="button" onClick={toggleRecording} className={`p-2 rounded-lg ${isRecording ? 'bg-red-600' : 'bg-[#c5a572]'}`} title={isRecording ? 'Arrêter' : 'Parler'}>
                  {isRecording ? <MicOff className="text-white w-5 h-5" /> : <Mic className="text-[#162238] w-5 h-5" />}
                </button>
                <textarea // Utilisation de textarea pour questions plus longues
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedClientId ? `Question pour ${clients.find(c=>c.id === selectedClientId)?.prenom_client || 'ce client'}...` : "Posez votre question à Francis..."}
                  className="flex-1 px-4 py-3 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors resize-none"
                  rows={2}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e as any); // type assertion for event
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] p-3 rounded-lg hover:shadow-lg hover:shadow-[#c5a572]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md h-[fit-content] self-end"
                  aria-label="Envoyer le message" 
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Panneau latéral d'aperçu client */}
          {selectedClientId && (
            <aside className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-[#2A3F6C]/30 bg-[#0E2444]/60 flex flex-col">
              <div className="p-4 border-b border-[#2A3F6C]/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Users className="w-5 h-5 text-[#c5a572]" />
                  <span>Profil Client</span>
                </div>
                <button
                  className="text-sm text-gray-400 hover:text-red-400"
                  onClick={() => setSelectedClientId(null)}
                >
                  Annuler
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 text-gray-200 text-sm">
                {isLoadingClientProfile && <p>Chargement du profil...</p>}
                {!isLoadingClientProfile && selectedClientProfile && (
                  <>
                    <p className="font-semibold text-lg text-white mb-2">{selectedClientProfile.prenom_client} {selectedClientProfile.nom_client}</p>
                    {selectedClientProfile.email_client && <p><span className="text-gray-400">Email:</span> {selectedClientProfile.email_client}</p>}
                    {selectedClientProfile.telephone_principal_client && <p><span className="text-gray-400">Téléphone:</span> {selectedClientProfile.telephone_principal_client}</p>}
                    {selectedClientProfile.situation_maritale_client && <p><span className="text-gray-400">Situation familiale:</span> {selectedClientProfile.situation_maritale_client}</p>}
                    {selectedClientProfile.revenu_net_annuel_client1 && <p><span className="text-gray-400">Revenus annuels (C1):</span> {Number(selectedClientProfile.revenu_net_annuel_client1).toLocaleString('fr-FR')} €</p>}
                    {selectedClientProfile.tranche_marginale_imposition_estimee && <p><span className="text-gray-400">TMI estimée:</span> {selectedClientProfile.tranche_marginale_imposition_estimee}%</p>}
                    <button
                      onClick={() => navigate(`/pro/clients/${selectedClientId}`)}
                      className="mt-4 w-full py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                      Voir fiche complète
                    </button>
                  </>
                )}
                {!isLoadingClientProfile && !selectedClientProfile && <p className="text-gray-400">Aucun détail trouvé pour ce client.</p>}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
} 