import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Bot, User as UserIcon, ArrowRight, MessageSquare, Euro, Briefcase, Users, ArrowLeft,
  Search, History, Download, BookOpen, Zap, Clock, Star, Filter, Settings, 
  FileText, Calculator, TrendingUp, Building2, Home, DollarSign, PieChart,
  Bookmark, Copy, Share2, MoreVertical, ChevronDown, Command, Maximize2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import { ClientProfile } from '../types/clientProfile';
import { useCountry, Country } from '../contexts/CountryContext';
import { ErrorHandler } from '../utils/errorHandler';
import { Logo } from '../components/ui/Logo';

interface ProMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  error?: boolean;
  timestamp: Date;
  clientId?: number;
  category?: string;
  bookmarked?: boolean;
}

interface ClientContextForFrancis {
  tmi?: number | null;
  situation_familiale?: string | null;
  nombre_enfants?: number | null;
  residence_principale?: boolean | null;
  residence_secondaire?: boolean | null;
  revenus_annuels?: number | null;
  charges_deductibles?: string | number | null;
}

interface QuestionTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  question: string;
  icon: React.ComponentType;
  color: string;
  tags: string[];
}

// Templates de questions professionnelles CGP
const PROFESSIONAL_TEMPLATES: QuestionTemplate[] = [
  {
    id: 'tmi-calculation',
    title: 'Calcul TMI',
    description: 'Calculer le taux marginal d\'imposition',
    category: 'Fiscalité',
    question: 'Quel est le TMI pour un revenu imposable de [MONTANT]€ en 2025 ?',
    icon: Calculator,
    color: '#c5a572',
    tags: ['TMI', 'impôt', 'barème']
  },
  {
    id: 'succession-strategy',
    title: 'Stratégie Succession',
    description: 'Optimisation fiscale succession',
    category: 'Succession',
    question: 'Quelle stratégie de transmission recommandez-vous pour un patrimoine de [MONTANT]€ avec [NB_ENFANTS] enfants ?',
    icon: Users,
    color: '#88C0D0',
    tags: ['succession', 'transmission', 'optimisation']
  },
  {
    id: 'lmnp-analysis',
    title: 'Analyse LMNP',
    description: 'Loueur meublé non professionnel',
    category: 'Immobilier',
    question: 'Analysez l\'opportunité LMNP pour un investissement de [MONTANT]€ avec un rendement brut de [RENDEMENT]%',
    icon: Building2,
    color: '#81A1C1',
    tags: ['LMNP', 'immobilier', 'défiscalisation']
  },
  {
    id: 'asset-allocation',
    title: 'Allocation d\'Actifs',
    description: 'Répartition patrimoniale optimale',
    category: 'Gestion',
    question: 'Proposez une allocation d\'actifs pour un client de [ÂGE] ans avec [MONTANT]€ et un profil [PROFIL_RISQUE]',
    icon: PieChart,
    color: '#A3BE8C',
    tags: ['allocation', 'gestion', 'diversification']
  },
  {
    id: 'tax-optimization',
    title: 'Optimisation Fiscale',
    description: 'Réduction d\'impôt et niches fiscales',
    category: 'Fiscalité',
    question: 'Quelles sont les meilleures niches fiscales pour réduire l\'IR d\'un client dans la tranche à [TMI]% ?',
    icon: TrendingUp,
    color: '#EBCB8B',
    tags: ['réduction', 'niche fiscale', 'IR']
  },
  {
    id: 'sasu-vs-eirl',
    title: 'SASU vs EIRL',
    description: 'Comparaison statuts juridiques',
    category: 'Entreprise',
    question: 'Comparez SASU et EIRL pour un CA prévisionnel de [MONTANT]€ avec extraction de [EXTRACTION]€',
    icon: Briefcase,
    color: '#D08770',
    tags: ['SASU', 'EIRL', 'statut juridique']
  }
];

interface ConversationHistory {
  id: string;
  clientId?: number;
  clientName?: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: ProMessage[];
}

export function ProChatPage() {
  // États principaux du chat
  const [messages, setMessages] = useState<ProMessage[]>([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis Francis, votre assistant fiscal professionnel. Comment puis-je vous accompagner aujourd'hui ?",
      timestamp: new Date(),
      category: 'accueil'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // États pour l'historique et les clients
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<ClientProfile | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string>('default');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, isProfessional } = useAuth();

  // États clients
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [selectedClientProfile, setSelectedClientProfile] = useState<ClientProfile | null>(null);
  const [isLoadingClientProfile, setIsLoadingClientProfile] = useState(false);

  // États interface professionnelle
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showHistory, setShowHistory] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Set<number>>(new Set());
  const [conversationHistoryList, setConversationHistoryList] = useState<ConversationHistory[]>([]);

  const { country: jurisdiction, setCountry: setJurisdiction } = useCountry();

  // Catégories de templates
  const categories = ['all', ...Array.from(new Set(PROFESSIONAL_TEMPLATES.map(t => t.category)))];
  
  // Templates filtrés
  const filteredTemplates = PROFESSIONAL_TEMPLATES.filter(template => {
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
          ErrorHandler.handle(err, { logInDev: true, silent: false });
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
          const cacheKey = `client_profile_${selectedClientId}`;
          const cachedProfile = localStorage.getItem(cacheKey);
          const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
          
          // Utiliser le cache si il a moins de 10 minutes
          if (cachedProfile && cacheTimestamp) {
            const cacheAge = Date.now() - parseInt(cacheTimestamp);
            if (cacheAge < 10 * 60 * 1000) { // 10 minutes
              setSelectedClientProfile(JSON.parse(cachedProfile));
              setIsLoadingClientProfile(false);
              return;
            }
          }
          
          const response = await apiClient<ClientProfile>(`/api/pro/clients/${selectedClientId}`);
          
          // Mettre en cache le profil
          localStorage.setItem(cacheKey, JSON.stringify(response));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
          
          setSelectedClientProfile(response);
        } catch (err) {
          ErrorHandler.handle(err, { logInDev: true, silent: false });
          setSelectedClientProfile(null);
        }
        setIsLoadingClientProfile(false);
      } else {
        setSelectedClientProfile(null);
      }
    };
    fetchClientProfile();
  }, [selectedClientId]);

  // Fonctions professionnelles avancées
  const handleTemplateSelect = useCallback((template: QuestionTemplate) => {
    setSelectedTemplate(template);
    setInput(template.question);
    setShowTemplates(false);
  }, []);

  const toggleBookmark = useCallback((messageIndex: number) => {
    setBookmarkedMessages(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(messageIndex)) {
        newBookmarks.delete(messageIndex);
      } else {
        newBookmarks.add(messageIndex);
      }
      return newBookmarks;
    });
  }, []);

  const copyMessageContent = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    // Optionnel: ajouter une notification toast
  }, []);

  const exportConversation = useCallback(() => {
    const conversationText = messages.map(m => 
      `[${m.timestamp.toLocaleString()}] ${m.role.toUpperCase()}: ${m.content}`
    ).join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-francis-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages]);

  const startNewConversation = useCallback(() => {
    if (messages.length > 1) {
      const conversationTitle = messages[1]?.content.slice(0, 50) + '...' || 'Nouvelle conversation';
      const newConversation: ConversationHistory = {
        id: currentConversationId,
        clientId: selectedClientId || undefined,
        clientName: selectedClientProfile?.nom_client || 'Client général',
        title: conversationTitle,
        lastMessage: messages[messages.length - 1]?.content.slice(0, 100) + '...' || '',
        timestamp: new Date(),
        messages: messages
      };
      setConversationHistoryList(prev => [newConversation, ...prev.slice(0, 9)]);
    }
    setMessages([{
      role: 'assistant',
      content: "Bonjour ! Je suis Francis, votre assistant fiscal professionnel. Comment puis-je vous accompagner aujourd'hui ?",
      timestamp: new Date(),
      category: 'accueil'
    }]);
    setInput('');
    setSelectedTemplate(null);
    setCurrentConversationId(Date.now().toString());
  }, [messages, currentConversationId, selectedClientId, selectedClientProfile]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ProMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      clientId: selectedClientId || undefined,
      category: selectedTemplate?.category || 'general'
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setSelectedTemplate(null);
    setIsLoading(true);

    try {
      let clientContext: ClientContextForFrancis | null = null;
      
      if (selectedClientId && selectedClientProfile) {
        clientContext = {
          tmi: typeof selectedClientProfile.tranche_marginale_imposition_estimee === 'number' ? selectedClientProfile.tranche_marginale_imposition_estimee : Number(selectedClientProfile.tranche_marginale_imposition_estimee) || 0,
          situation_familiale: selectedClientProfile.situation_maritale_client,
          nombre_enfants: selectedClientProfile.nombre_enfants_a_charge_client || 0,
          residence_principale: selectedClientProfile.residence_principale_details ? true : false,
          residence_secondaire: selectedClientProfile.residences_secondaires_details ? true : false,
          revenus_annuels: typeof selectedClientProfile.revenu_net_annuel_client1 === 'number' ? selectedClientProfile.revenu_net_annuel_client1 : Number(selectedClientProfile.revenu_net_annuel_client1) || 0,
          charges_deductibles: typeof selectedClientProfile.charges_foncieres_deductibles_foyer === 'number' ? selectedClientProfile.charges_foncieres_deductibles_foyer : Number(selectedClientProfile.charges_foncieres_deductibles_foyer) || 0
        };
      }

      const response = await apiClient<{
        response: string;
        sources?: string[];
      }>('/api/ask', {
        method: 'POST',
        data: {
          question: input,
          jurisdiction,
          client_context: clientContext
        }
      });

      const assistantMessage: ProMessage = {
        role: 'assistant',
        content: response.response,
        sources: response.sources,
        timestamp: new Date(),
        clientId: selectedClientId || undefined,
        category: selectedTemplate?.category || 'general'
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      ErrorHandler.handle(error, { logInDev: true, silent: false });
      const errorMessage: ProMessage = {
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
        error: true,
        timestamp: new Date(),
        category: 'error'
      };
      setMessages([...newMessages, errorMessage]);
    }

    setIsLoading(false);
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



  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447] text-gray-100">
      {/* Header Francis Pro simplifié et harmonisé */}
      <div className="bg-[#162238]/95 backdrop-blur-sm border-b border-[#c5a572]/20 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Francis Pro officiel (identique aux headers du site) */}
            <Logo size="md" />
            <div>
              <h1 className="text-xl font-bold text-white">Francis</h1>
              <p className="text-sm text-[#c5a572] font-medium">Pro</p>
            </div>
            {selectedClientProfile && (
              <div className="ml-4 px-3 py-1 bg-[#c5a572]/10 rounded-full border border-[#c5a572]/30">
                <span className="text-sm text-[#c5a572]">
                  {selectedClientProfile.prenom_client} {selectedClientProfile.nom_client}
                </span>
              </div>
            )}
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

      {/* Layout principal simplifié */}
      <div className="flex-1 flex">
        {/* Sidebar ultra-simplifiée */}
        <div className="w-80 bg-[#1a2332]/60 backdrop-blur-sm border-r border-[#c5a572]/20 flex flex-col">
          {/* Sidebar simple avec client */}
          <div className="p-6">
            {/* Sélection client simplifiée */}
            {clients.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#c5a572]" />
                  Client
                </h3>
                <select 
                  value={selectedClientId || ''}
                  onChange={(e) => setSelectedClientId(e.target.value ? parseInt(e.target.value) : null)}
                  disabled={isLoadingClients || isLoading}
                  className="w-full px-3 py-2 bg-[#0E2444] border border-[#c5a572]/30 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                >
                  <option value="">Général</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.prenom_client} {client.nom_client}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Historique des conversations */}
            {conversationHistoryList.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-[#c5a572]" />
                    Historique
                  </h3>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-xs text-[#c5a572] hover:text-white transition-colors"
                  >
                    {showHistory ? 'Masquer' : 'Voir tout'}
                  </button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(showHistory ? conversationHistoryList : conversationHistoryList.slice(0, 3)).map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => {
                        setMessages(conversation.messages);
                        setCurrentConversationId(conversation.id);
                        if (conversation.clientId) {
                          setSelectedClientId(conversation.clientId);
                        }
                      }}
                      className="w-full text-left p-3 rounded-lg bg-[#0E2444]/50 border border-[#c5a572]/20 hover:border-[#c5a572]/40 hover:bg-[#0E2444]/80 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#c5a572] font-medium truncate">
                          {conversation.clientName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(conversation.timestamp).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="text-sm text-white font-medium truncate mb-1 group-hover:text-[#c5a572] transition-colors">
                        {conversation.title}
                      </h4>
                      <p className="text-xs text-gray-400 truncate">
                        {conversation.lastMessage}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Actions simples */}
            <div className="space-y-3">
              <button 
                onClick={startNewConversation}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] hover:shadow-lg hover:shadow-[#c5a572]/40 transition-all font-medium"
              >
                <Zap className="w-4 h-4" />
                Nouvelle conversation
              </button>
            </div>
          </div>

        </div>

        {/* Zone de chat ultra-simplifiée */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447]">
          {/* Barre de chat avec logo Francis officiel */}
          <div className="bg-[#162238]/95 backdrop-blur-sm border-b border-[#c5a572]/20 p-4">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <h2 className="text-lg font-semibold text-white">
                Francis Pro
              </h2>
            </div>
          </div>

          {/* Messages ultra-simplifiés */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 mr-3 mt-1">
                    <Logo size="sm" />
                  </div>
                )}
                <div className={`max-w-[80%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-[#c5a572] text-[#162238]'
                    : 'bg-[#162238] text-white border border-[#c5a572]/20'
                }`}>
                  <div className="text-sm mb-1 opacity-70">
                    {message.role === 'user' ? 'Vous' : 'Francis'}
                  </div>
                  <div>
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Indicateur de chargement avec logo officiel Francis */}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="flex-shrink-0 mt-1">
                  <Logo size="sm" />
                </div>
                <div className="max-w-[75%]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-[#c5a572]">Francis</span>
                    <span className="text-xs text-gray-400">en train d'écrire...</span>
                  </div>
                  <div className="p-4 rounded-2xl rounded-bl-none bg-[#162238] border border-[#c5a572]/20 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <span className="text-sm text-gray-400 ml-2">Francis analyse votre demande...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            

            
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie ultra-simple */}
          <div className="border-t border-[#c5a572]/20 bg-[#162238]/95 p-4">
            <form onSubmit={handleSend} className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question à Francis Pro..."
                className="flex-1 p-3 bg-[#0E2444] border border-[#c5a572]/30 rounded-lg text-gray-200 focus:outline-none focus:border-[#c5a572] resize-none"
                rows={2}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e as any);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-[#c5a572] text-[#162238] px-6 py-3 rounded-lg hover:bg-[#d4b875] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? '...' : 'Envoyer'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 