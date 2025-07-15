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

  // Fonction pour nettoyer le cache
  const clearCache = () => {
    localStorage.removeItem('pro_clients_cache');
    localStorage.removeItem('pro_clients_cache_timestamp');
    // Nettoyer tous les caches de profils clients
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('client_profile_')) {
        localStorage.removeItem(key);
      }
    });
  };

  // Charger la liste des clients du professionnel au montage avec cache et optimisations
  useEffect(() => {
    const fetchClients = async () => {
      if (isAuthenticated && isProfessional) {
        setIsLoadingClients(true);
        try {
          // Vérifier le cache local d'abord
          const cachedClients = localStorage.getItem('pro_clients_cache');
          const cacheTimestamp = localStorage.getItem('pro_clients_cache_timestamp');
          
          // Utiliser le cache si il a moins de 5 minutes
          if (cachedClients && cacheTimestamp) {
            const cacheAge = Date.now() - parseInt(cacheTimestamp);
            if (cacheAge < 5 * 60 * 1000) { // 5 minutes
              setClients(JSON.parse(cachedClients));
              setIsLoadingClients(false);
              return;
            }
          }
          
          const response = await apiClient<ClientProfile[]>('/api/pro/clients/');
          const clientsData = response || [];
          
          // Mettre en cache les données
          localStorage.setItem('pro_clients_cache', JSON.stringify(clientsData));
          localStorage.setItem('pro_clients_cache_timestamp', Date.now().toString());
          
          setClients(clientsData);
        } catch (err) {
          console.error("Erreur chargement des clients pour le chat pro:", err);
          setClients([]);
        }
        setIsLoadingClients(false);
      }
    };
    fetchClients();
  }, [isAuthenticated, isProfessional]);

  // Charger le profil complet dès qu'un client est sélectionné avec cache
  useEffect(() => {
    const fetchClientProfile = async () => {
      if (selectedClientId) {
        setIsLoadingClientProfile(true);
        try {
          // Vérifier le cache local d'abord
          const cachedProfile = localStorage.getItem(`client_profile_${selectedClientId}`);
          const cacheTimestamp = localStorage.getItem(`client_profile_timestamp_${selectedClientId}`);
          
          // Utiliser le cache si il a moins de 2 minutes
          if (cachedProfile && cacheTimestamp) {
            const cacheAge = Date.now() - parseInt(cacheTimestamp);
            if (cacheAge < 2 * 60 * 1000) { // 2 minutes
              setSelectedClientProfile(JSON.parse(cachedProfile));
              setIsLoadingClientProfile(false);
              return;
            }
          }
          
          const profile = await apiClient<ClientProfile>(`/api/pro/clients/${selectedClientId}`, { method: 'GET' });
          
          // Mettre en cache les données
          localStorage.setItem(`client_profile_${selectedClientId}`, JSON.stringify(profile));
          localStorage.setItem(`client_profile_timestamp_${selectedClientId}`, Date.now().toString());
          
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
    
    // Optimisation: limiter le nombre de messages pour éviter les problèmes de mémoire
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      // Garder seulement les 50 derniers messages
      return newMessages.slice(-50);
    });
    
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
      
      // Optimisation: limiter le nombre de messages pour éviter les problèmes de mémoire
      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        // Garder seulement les 50 derniers messages
        return newMessages.slice(-50);
      });
      
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
      // Optimisation: limiter le nombre de messages pour éviter les problèmes de mémoire
      setMessages(prev => {
        const newMessages = [...prev, { 
          role: 'assistant' as const, 
          content: errorMessage,
          error: true 
        }];
        // Garder seulement les 50 derniers messages
        return newMessages.slice(-50);
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Optimisation du scroll automatique avec debouncing
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // Debouncing pour éviter les scrolls trop fréquents
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Initialiser la reconnaissance vocale avec optimisations de performance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'fr-FR';

        let finalTranscript = '';
        let isProcessing = false; // Éviter les traitements multiples
        
        recognitionRef.current.onresult = (event) => {
          if (isProcessing) return; // Éviter les conflits
          
          // Réinitialiser le transcript final si c'est un nouveau résultat
          if (event.results[0].isFinal) {
            finalTranscript = '';
          }
          
          // Mettre à jour le transcript en cours avec debouncing
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');
          
          setInput(transcript);
          
          // Si c'est un résultat final, traiter l'entrée avec un délai pour éviter les doublons
          if (event.results[0].isFinal) {
            finalTranscript = transcript;
            isProcessing = true;
            
            // Délai pour éviter les traitements multiples
            setTimeout(() => {
              processVoiceInput(finalTranscript);
              isProcessing = false;
            }, 100);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Erreur de reconnaissance vocale:', event.error);
          setIsListening(false);
          isProcessing = false;
          
          // Gestion d'erreur améliorée avec retry automatique
          if (isCallActive && event.error !== 'no-speech') {
            speakText("Je n'ai pas bien compris. Pouvez-vous répéter ?")
              .then(() => {
                if (recognitionRef.current) {
                  setTimeout(() => {
                    recognitionRef.current.start();
                  }, 1000); // Délai avant redémarrage
                }
              });
          }
        };
        
        recognitionRef.current.onend = () => {
          // Redémarrer automatiquement l'écoute si l'appel est toujours actif
          if (isCallActive && recognitionRef.current && !isProcessing) {
            setTimeout(() => {
              if (recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 500); // Délai pour éviter les redémarrages trop rapides
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
      {/* Header moderne et compact */}
      <div className="bg-[#162238]/95 backdrop-blur-sm border-b border-[#c5a572]/20 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquare className="h-8 w-8 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
                <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Francis</h1>
                <p className="text-xs text-[#c5a572] font-medium">Copilote IA</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-[#1a2332] border border-[#c5a572]/30 hover:bg-[#223c63] transition-colors"
              title="Retour"
            >
              <ArrowLeft className="w-4 h-4 text-[#c5a572]" />
            </button>
          </div>
        </div>
      </div>

      {/* Layout principal avec sidebar et chat */}
      <div className="flex-1 flex">
        {/* Sidebar pour la sélection client et profil */}
        <div className="w-80 bg-[#1a2332]/60 backdrop-blur-sm border-r border-[#c5a572]/20 p-4 space-y-4">
          {/* Sélection client */}
          {clients.length > 0 && (
            <div className="bg-[#162238]/50 rounded-xl p-4 border border-[#c5a572]/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Client sélectionné</h3>
                <button
                  onClick={() => {
                    clearCache();
                    const fetchClients = async () => {
                      setIsLoadingClients(true);
                      try {
                        const response = await apiClient<ClientProfile[]>('/api/pro/clients/');
                        const clientsData = response || [];
                        localStorage.setItem('pro_clients_cache', JSON.stringify(clientsData));
                        localStorage.setItem('pro_clients_cache_timestamp', Date.now().toString());
                        setClients(clientsData);
                      } catch (err) {
                        console.error("Erreur chargement des clients:", err);
                        setClients([]);
                      }
                      setIsLoadingClients(false);
                    };
                    fetchClients();
                  }}
                  className="p-1 text-gray-400 hover:text-[#c5a572] transition-colors"
                  title="Rafraîchir"
                >
                  🔄
                </button>
              </div>
                              <select 
                  value={selectedClientId || ''}
                  onChange={(e) => setSelectedClientId(e.target.value ? parseInt(e.target.value) : null)}
                  disabled={isLoadingClients || isLoading}
                  className="w-full px-3 py-2 bg-[#0E2444] border border-[#c5a572]/30 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                  aria-label="Sélectionner un client"
                >
                <option value="">Général</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.prenom_client} {client.nom_client}
                  </option>
                ))}
              </select>
              {isLoadingClients && <p className="text-xs text-gray-500 mt-2">Chargement...</p>}
            </div>
          )}

          {/* Profil client sélectionné */}
          {selectedClientId && selectedClientProfile && (
            <div className="bg-[#162238]/50 rounded-xl p-4 border border-[#c5a572]/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#c5a572]" />
                  Profil
                </h3>
                <button
                  onClick={() => setSelectedClientId(null)}
                  className="text-xs text-gray-400 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-xs text-gray-300">
                <p className="font-medium text-white">{selectedClientProfile.prenom_client} {selectedClientProfile.nom_client}</p>
                {selectedClientProfile.email_client && <p>📧 {selectedClientProfile.email_client}</p>}
                {selectedClientProfile.telephone_principal_client && <p>📞 {selectedClientProfile.telephone_principal_client}</p>}
                {selectedClientProfile.situation_maritale_client && <p>👥 {selectedClientProfile.situation_maritale_client}</p>}
                {selectedClientProfile.revenu_net_annuel_client1 && (
                  <p className="font-medium text-[#c5a572]">
                    💰 {Number(selectedClientProfile.revenu_net_annuel_client1).toLocaleString('fr-FR')} €
                  </p>
                )}
                {selectedClientProfile.tranche_marginale_imposition_estimee && (
                  <p className="text-[#c5a572] font-medium">
                    📊 TMI: {selectedClientProfile.tranche_marginale_imposition_estimee}%
                  </p>
                )}
                <button
                  onClick={() => navigate(`/pro/clients/${selectedClientId}`)}
                  className="w-full mt-3 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] text-xs font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Voir fiche complète
                </button>
              </div>
            </div>
          )}

          {/* Indicateur de chargement profil */}
          {selectedClientId && isLoadingClientProfile && (
            <div className="bg-[#162238]/50 rounded-xl p-4 border border-[#c5a572]/20">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#c5a572]"></div>
                <span className="text-xs text-gray-400">Chargement du profil...</span>
              </div>
            </div>
          )}
        </div>

        {/* Zone de chat principale */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[75%] p-4 rounded-2xl shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-br-none'
                      : message.error ? 'bg-red-700/70 text-white rounded-bl-none' : 'bg-[#162238] text-gray-100 border border-[#c5a572]/20 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center group">
                        <MessageSquare className="h-6 w-6 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
                        <Euro className="h-4 w-4 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      {message.role === 'assistant' && !message.error && (
                        <button
                          onClick={() => speakText(message.content)}
                          className="mt-2 p-1 rounded-full hover:bg-[#1a2332]/50 transition-colors"
                          title="Lire le message"
                        >
                          <Volume2 className="w-4 h-4 text-[#c5a572]" />
                        </button>
                      )}
                      {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                        <div className="mt-3 p-2 bg-[#1a2332]/50 rounded-lg border border-[#c5a572]/10">
                          <span className="text-xs font-medium text-[#c5a572] mb-1 block">Sources:</span>
                          <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                            {message.sources.map((source, idx) => (
                              <li key={idx}>{source}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#c5a572]/20">
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
                  <div className="flex-shrink-0 relative inline-flex items-center justify-center group">
                    <MessageSquare className="h-7 w-7 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
                    <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
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

          {/* Zone de saisie moderne */}
          <div className="border-t border-[#c5a572]/20 bg-[#162238]/90 p-4">
            <form onSubmit={handleSend} className="max-w-4xl mx-auto">
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
                    className="w-full p-4 pr-12 bg-[#0E2444] border border-[#c5a572]/30 rounded-xl text-gray-200 focus:outline-none focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 transition-all resize-none"
                    rows={2}
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
                      <span className="text-xs text-gray-400">{isListening ? 'En écoute...' : 'En attente...'}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2">
                  <button
                    type="button"
                    onClick={toggleVoiceCall}
                    className={`p-3 rounded-xl flex items-center justify-center shadow-lg h-[48px] w-[48px] transition-all ${
                      isCallActive 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] hover:shadow-[#c5a572]/40'
                    }`}
                    aria-label={isCallActive ? "Terminer l'appel" : "Démarrer un appel vocal"}
                  >
                    {isCallActive ? <PhoneOff className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] p-3 rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg h-[48px] w-[48px]"
                    aria-label="Envoyer le message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {isCallActive && (
                <div className="mt-4 flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm ${
                      isListening 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-[#1a2332] hover:bg-[#223c63] text-white border border-[#c5a572]/30'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
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
                    className="px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Envoyer</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}