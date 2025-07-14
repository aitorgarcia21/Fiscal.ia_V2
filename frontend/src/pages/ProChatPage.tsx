import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, ArrowRight, MessageSquare, Euro, Briefcase, Users, ArrowLeft, Mic, MicOff, Phone, PhoneOff, Volume2 } from 'lucide-react';
import { speakText } from '../services/ttsService';
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
      content: "Bonjour ! Je suis Francis, votre copilote. Comment puis-je vous aider aujourd'hui ?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, isProfessional } = useAuth();

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ProMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    
    // Si en mode appel, arrêter l'écoute pendant le traitement
    if (isCallActive && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

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
        content: responseData.answer || 'Je n\'ai pas pu traiter votre demande.',
        sources: responseData.sources || []
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Lire la réponse avec la synthèse vocale si en mode appel
      if (isCallActive && assistantMessage.content) {
        speakText(assistantMessage.content, () => {
          // Redémarrer l'écoute après la fin de la lecture
          if (recognitionRef.current) {
            recognitionRef.current.start();
            setIsListening(true);
          }
        });
      }
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

  // Initialiser la reconnaissance vocale
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'fr-FR';

        let finalTranscript = '';
        
        recognitionRef.current.onresult = (event) => {
          // Réinitialiser le transcript final si c'est un nouveau résultat
          if (event.results[0].isFinal) {
            finalTranscript = '';
          }
          
          // Mettre à jour le transcript en cours
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');
          
          setInput(transcript);
          
          // Si c'est un résultat final, traiter l'entrée
          if (event.results[0].isFinal) {
            finalTranscript = transcript;
            processVoiceInput(finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Erreur de reconnaissance vocale:', event.error);
          setIsListening(false);
          
          // Ne pas arrêter complètement l'appel en cas d'erreur,
          // mais laisser l'utilisateur réessayer
          if (isCallActive) {
            speakText("Je n'ai pas bien compris. Pouvez-vous répéter ?")
              .then(() => {
                if (recognitionRef.current) {
                  recognitionRef.current.start();
                }
              });
          }
        };
        
        recognitionRef.current.onend = () => {
          // Redémarrer automatiquement l'écoute si l'appel est toujours actif
          if (isCallActive && recognitionRef.current) {
            recognitionRef.current.start();
          } else {
            setIsListening(false);
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startCall = () => {
    if (isCallActive) {
      // Arrêter l'appel
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsCallActive(false);
      setIsListening(false);
      return;
    }

    try {
      // Vérifier si la reconnaissance vocale est disponible
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Désolé, la reconnaissance vocale n'est pas disponible sur votre navigateur. Veuillez utiliser un navigateur compatible comme Chrome ou Edge.",
          error: true
        }]);
        return;
      } else {
        alert("La reconnaissance vocale n'est pas supportée par votre navigateur");
      }
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'appel:', error);
    }
  };

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
      setIsListening(!isListening);
    }
  };

  const processVoiceInput = async (transcript: string) => {
    if (!transcript.trim()) return;
    
    // Ajouter le message de l'utilisateur au chat
    const userMessage: ProMessage = { role: 'user', content: transcript };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Envoyer la transcription à l'API
      const endpoint = selectedClientId 
        ? `/api/pro/clients/${selectedClientId}/ask_francis` 
        : '/api/ask';
      
      const response = await apiClient(endpoint, {
        method: 'POST',
        data: {
          query: transcript,
          conversation_history: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          jurisdiction
        }
      });
      
      // Ajouter la réponse de Francis au chat
      const assistantMessage: ProMessage = {
        role: 'assistant',
        content: response.answer || 'Je n\'ai pas pu traiter votre demande.',
        sources: response.sources || []
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Lire la réponse avec la synthèse vocale
      await speakText(assistantMessage.content);
      
      // Redémarrer l'écoute après la lecture
      if (isCallActive && recognitionRef.current) {
        recognitionRef.current.start();
      }
      
    } catch (error) {
      console.error('Erreur lors du traitement de la réponse vocale:', error);
      const errorMessage = error.data?.detail || error.message || "Désolé, une erreur s'est produite.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage, error: true }]);
    }
  };

  const toggleVoiceCall = async () => {
    if (isCallActive) {
      // Arrêter l'appel
      console.log('Arrêt de la conversation vocale');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsCallActive(false);
      setIsListening(false);
      
      // Message de fin d'appel
      await speakText("Fin de la conversation. Vous pouvez continuer à discuter par écrit.");
      
    } else {
      // Démarrer l'appel
      console.log('Démarrage de la conversation vocale');
      
      if (!recognitionRef.current) {
        alert("La reconnaissance vocale n'est pas supportée par votre navigateur");
        return;
      }
      
      try {
        // Message d'accueil
        await speakText("Bonjour, je suis Francis. Comment puis-je vous aider aujourd'hui ?");
        
        // Démarrer l'écoute
        recognitionRef.current.start();
        setIsCallActive(true);
        setIsListening(true);
        
      } catch (error) {
        console.error('Erreur lors du démarrage de la conversation vocale:', error);
        alert('Impossible de démarrer la conversation vocale. Veuillez réessayer.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447] text-gray-100">
      {/* Header cohérent avec le dashboard pro */}
      <div className="bg-[#162238] border-b border-[#c5a572]/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo Francis (bulle + euro) */}
            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquare className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
                <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Francis</h1>
                <p className="text-sm text-[#c5a572] font-medium">Votre copilote</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-[#1a2332] border border-[#c5a572]/30 hover:bg-[#223c63] transition-colors"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5 text-[#c5a572]" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal cohérent avec le dashboard pro */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Zone de sélection de client */}
          {clients.length > 0 && (
            <div className="bg-[#1a2332]/60 backdrop-blur-sm border border-[#c5a572]/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Sélection du client</h2>
                  <p className="text-gray-400">Choisissez un client pour un conseil personnalisé</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label htmlFor="client-select" className="text-sm text-gray-300">Question pour le client :</label>
                <select 
                  id="client-select"
                  value={selectedClientId || ''}
                  onChange={(e) => setSelectedClientId(e.target.value ? parseInt(e.target.value) : null)}
                  disabled={isLoadingClients || isLoading}
                  className="px-4 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-gray-200 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] min-w-[250px]"
                >
                  <option value="">Général (sans client spécifique)</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.prenom_client} {client.nom_client}
                    </option>
                  ))}
                </select>
                {isLoadingClients && <span className='text-sm text-gray-500'>Chargement clients...</span>}
              </div>
            </div>
          )}

          {/* Zone de chat principale */}
          <div className="bg-[#1a2332]/60 backdrop-blur-sm border border-[#c5a572]/20 rounded-xl overflow-hidden">
            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 h-[500px]">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-4 rounded-2xl shadow-lg ${
                      message.role === 'user'
                        ? 'bg-[#c5a572]/90 text-[#162238] rounded-br-none'
                        : message.error ? 'bg-red-700/70 text-white rounded-bl-none' : 'bg-[#162238] text-gray-100 border border-[#c5a572]/20 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center">
                          <div className="relative">
                            <MessageSquare className="w-5 h-5 text-[#c5a572]" />
                            <Euro className="w-3 h-3 text-[#c5a572] absolute -bottom-1 -right-1" />
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{message.content}</p>
                        {message.role === 'assistant' && !message.error && (
                          <button
                            onClick={() => speakText(message.content)}
                            className="ml-2 p-1 rounded-full hover:bg-gray-700/50 transition-colors"
                            title="Lire le message"
                          >
                            <Volume2 className="w-4 h-4 text-gray-400 hover:text-[#c5a572]" />
                          </button>
                        )}
                        {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                          <div className="mt-2 text-xs text-gray-400">
                            <span>Sources:</span>
                            <ul className="list-disc pl-5 mt-1">
                              {message.sources.map((source, idx) => (
                                <li key={idx}>{source}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-[#c5a572]" />
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
<Euro className="w-4 h-4 text-[#c5a572] absolute -bottom-1 -right-1" />
</div>
                        <div className="flex items-center space-x-1.5 bg-[#162238] border border-[#c5a572]/20 p-3 rounded-lg rounded-bl-none shadow-md">
                            <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <form onSubmit={handleSend} className="p-6 border-t border-[#c5a572]/20 bg-[#162238]/90">
              <div className="flex space-x-4">
                <div className="relative flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isCallActive 
                      ? "Parlez maintenant..." 
                      : selectedClientId 
                        ? `Question pour ${clients.find(c=>c.id === selectedClientId)?.prenom_client || 'ce client'}...` 
                        : "Posez votre question fiscale..."}
                    className="w-full p-4 pr-12 bg-[#0E2444] border border-[#c5a572]/30 rounded-xl text-gray-200 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] resize-none"
                    rows={3}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e as any);
                      }
                    }}
                  />
                  {isCallActive && (
                    <div className="absolute right-4 bottom-4 flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                      <span className="text-sm text-gray-400">{isListening ? 'En écoute...' : 'En attente...'}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button
                    type="button"
                    onClick={toggleVoiceCall}
                    className={`p-4 rounded-xl flex items-center justify-center shadow-lg h-[56px] w-[56px] transition-all ${
                      isCallActive 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] hover:shadow-[#c5a572]/40'
                    }`}
                    aria-label={isCallActive ? "Terminer l'appel" : "Démarrer un appel vocal"}
                  >
                    {isCallActive ? <PhoneOff className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] p-4 rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg h-[56px] w-[56px]"
                    aria-label="Envoyer le message"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              {isCallActive && (
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`px-6 py-3 rounded-xl flex items-center space-x-2 ${
                      isListening 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-[#1a2332] hover:bg-[#223c63] text-white border border-[#c5a572]/30'
                    }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    <span>{isListening ? 'Arrêter' : 'Parler'}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (input.trim()) {
                        const e = new Event('submit') as any;
                        handleSend(e);
                      }
                    }}
                    disabled={!input.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <Send className="w-5 h-5" />
                    <span>Envoyer</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Panneau latéral d'aperçu client */}
          {selectedClientId && (
            <div className="bg-[#1a2332]/60 backdrop-blur-sm border border-[#c5a572]/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
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
              <div className="space-y-3 text-gray-200 text-sm">
                {isLoadingClientProfile && <p>Chargement du profil...</p>}
                {!isLoadingClientProfile && selectedClientProfile && (
                  <>
                    <p className="font-semibold text-lg text-white mb-3">{selectedClientProfile.prenom_client} {selectedClientProfile.nom_client}</p>
                    {selectedClientProfile.email_client && <p><span className="text-gray-400">Email:</span> {selectedClientProfile.email_client}</p>}
                    {selectedClientProfile.telephone_principal_client && <p><span className="text-gray-400">Téléphone:</span> {selectedClientProfile.telephone_principal_client}</p>}
                    {selectedClientProfile.situation_maritale_client && <p><span className="text-gray-400">Situation familiale:</span> {selectedClientProfile.situation_maritale_client}</p>}
                    {selectedClientProfile.revenu_net_annuel_client1 && <p><span className="text-gray-400">Revenus annuels (C1):</span> {Number(selectedClientProfile.revenu_net_annuel_client1).toLocaleString('fr-FR')} €</p>}
                    {selectedClientProfile.tranche_marginale_imposition_estimee && <p><span className="text-gray-400">TMI estimée:</span> {selectedClientProfile.tranche_marginale_imposition_estimee}%</p>}
                    <button
                      onClick={() => navigate(`/pro/clients/${selectedClientId}`)}
                      className="mt-4 w-full py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      Voir fiche complète
                    </button>
                  </>
                )}
                {!isLoadingClientProfile && !selectedClientProfile && <p className="text-gray-400">Aucun détail trouvé pour ce client.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}