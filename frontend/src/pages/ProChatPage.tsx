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
  const [conversationHistory, setConversationHistory] = useState<ProMessage[][]>([]);

  const { country: jurisdiction, setCountry: setJurisdiction } = useCountry();

  // Catégories de templates
  const categories = ['all', ...new Set(PROFESSIONAL_TEMPLATES.map(t => t.category))];
  
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
          console.error(`Erreur chargement profil client ${selectedClientId}:`, err);
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
      setConversationHistory(prev => [...prev, messages]);
    }
    setMessages([{
      role: 'assistant',
      content: "Bonjour ! Je suis Francis, votre assistant fiscal professionnel. Comment puis-je vous accompagner aujourd'hui ?",
      timestamp: new Date(),
      category: 'accueil'
    }]);
    setInput('');
    setSelectedTemplate(null);
  }, [messages]);

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
          tmi: selectedClientProfile.tmi,
          situation_familiale: selectedClientProfile.situation_familiale,
          nombre_enfants: selectedClientProfile.nombre_enfants,
          residence_principale: selectedClientProfile.residence_principale,
          residence_secondaire: selectedClientProfile.residence_secondaire,
          revenus_annuels: selectedClientProfile.revenus_annuels,
          charges_deductibles: selectedClientProfile.charges_deductibles
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
      console.error('Erreur lors de l\'envoi:', error);
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
                <p className="text-xs text-[#c5a572] font-medium">Votre copilote</p>
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
        {/* Sidebar professionnelle avec templates */}
        <div className={`${isCompactMode ? 'w-16' : 'w-80'} bg-[#1a2332]/60 backdrop-blur-sm border-r border-[#c5a572]/20 flex flex-col transition-all duration-300`}>
          {/* Actions professionnelles */}
          {!isCompactMode && (
            <div className="p-4 border-b border-[#c5a572]/10">
              <div className="flex space-x-2 mb-4">
                <button 
                  onClick={startNewConversation}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] hover:shadow-lg hover:shadow-[#c5a572]/40 transition-all text-sm font-medium flex-1 justify-center"
                >
                  <Zap className="w-4 h-4" />
                  <span>Nouveau</span>
                </button>
                <button 
                  onClick={exportConversation}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#0E2444]/50 hover:bg-[#c5a572]/10 transition-colors text-sm text-gray-300 hover:text-[#c5a572]"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              
              {/* Sélection client */}
              {clients.length > 0 && (
                <div className="bg-[#162238]/50 rounded-xl p-3 border border-[#c5a572]/20 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#c5a572]" />
                      Client
                    </h3>
                  </div>
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
            </div>
          )}
          
          {/* Templates professionnels */}
          {showTemplates && !isCompactMode && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#c5a572]/10">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#c5a572]" />
                  Templates CGP
                </h3>
                
                {/* Recherche et filtres */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#0E2444] border border-[#c5a572]/30 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                    />
                  </div>
                  
                  {/* Catégories */}
                  <div className="flex flex-wrap gap-1">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                          activeCategory === category
                            ? 'bg-[#c5a572] text-[#162238]'
                            : 'bg-[#0E2444] text-gray-300 hover:bg-[#c5a572]/20'
                        }`}
                      >
                        {category === 'all' ? 'Tous' : category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Liste des templates */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredTemplates.map(template => {
                  const IconComponent = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="w-full text-left p-3 rounded-lg bg-[#162238]/50 border border-[#c5a572]/10 hover:border-[#c5a572]/30 hover:bg-[#162238]/80 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#c5a572]/20 flex items-center justify-center group-hover:bg-[#c5a572]/30 transition-colors">
                          {React.createElement(IconComponent, { className: "w-4 h-4 text-[#c5a572]" })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white mb-1 group-hover:text-[#c5a572] transition-colors">
                            {template.title}
                          </h4>
                          <p className="text-xs text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 bg-[#c5a572]/10 text-[#c5a572] text-xs rounded border border-[#c5a572]/20"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Profil client compact */}
          {selectedClientId && selectedClientProfile && !isCompactMode && (
            <div className="p-4 border-t border-[#c5a572]/10">
              <div className="bg-[#162238]/50 rounded-xl p-3 border border-[#c5a572]/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#c5a572] rounded-full"></div>
                    Profil Client
                  </h3>
                  <button
                    onClick={() => setSelectedClientId(null)}
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1.5 text-xs text-gray-300">
                  <p className="font-medium text-white truncate">
                    {selectedClientProfile.prenom_client} {selectedClientProfile.nom_client}
                  </p>
                  {selectedClientProfile.revenu_net_annuel_client1 && (
                    <p className="font-medium text-[#c5a572] flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {Number(selectedClientProfile.revenu_net_annuel_client1).toLocaleString('fr-FR')} €
                    </p>
                  )}
                  {selectedClientProfile.tranche_marginale_imposition_estimee && (
                    <p className="text-[#c5a572] font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      TMI: {selectedClientProfile.tranche_marginale_imposition_estimee}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Mode compact - boutons seulement */}
          {isCompactMode && (
            <div className="flex-1 flex flex-col items-center py-4 space-y-3">
              <button 
                onClick={startNewConversation}
                className="p-3 rounded-lg bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] hover:shadow-lg hover:shadow-[#c5a572]/40 transition-all"
                title="Nouvelle conversation"
              >
                <Zap className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowTemplates(!showTemplates)}
                className="p-3 rounded-lg bg-[#0E2444]/50 hover:bg-[#c5a572]/10 transition-colors text-gray-300 hover:text-[#c5a572]"
                title="Templates"
              >
                <BookOpen className="w-5 h-5" />
              </button>
              <button 
                onClick={exportConversation}
                className="p-3 rounded-lg bg-[#0E2444]/50 hover:bg-[#c5a572]/10 transition-colors text-gray-300 hover:text-[#c5a572]"
                title="Exporter"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Zone de chat professionnelle */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447]">
          {/* Barre d'outils professionnelle */}
          <div className="bg-[#162238]/95 backdrop-blur-sm border-b border-[#c5a572]/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#c5a572]" />
                  Francis Pro
                  {selectedClientProfile && (
                    <span className="text-sm font-normal text-gray-400">
                      • {selectedClientProfile.prenom_client} {selectedClientProfile.nom_client}
                    </span>
                  )}
                </h2>
                {selectedTemplate && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#c5a572]/10 border border-[#c5a572]/30 rounded-full">
                    {React.createElement(selectedTemplate.icon, { className: "w-4 h-4 text-[#c5a572]" })}
                    <span className="text-sm text-[#c5a572] font-medium">{selectedTemplate.title}</span>
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="text-[#c5a572] hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="p-2 rounded-lg bg-[#0E2444]/50 hover:bg-[#c5a572]/10 transition-colors text-gray-300 hover:text-[#c5a572]"
                  title="Actions rapides"
                >
                  <Zap className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsCompactMode(!isCompactMode)}
                  className="p-2 rounded-lg bg-[#0E2444]/50 hover:bg-[#c5a572]/10 transition-colors text-gray-300 hover:text-[#c5a572]"
                  title="Mode compact"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages avec interface professionnelle */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar assistant */}
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 relative inline-flex items-center justify-center group">
                    <div className="h-10 w-10 bg-[#c5a572] rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300">
                      <MessageSquare className="h-6 w-6 text-[#162238]" />
                    </div>
                    <div className="h-6 w-6 bg-[#162238] rounded-full flex items-center justify-center absolute -bottom-1 -right-1 shadow-md transition-transform group-hover:scale-110 duration-300">
                      <Euro className="h-4 w-4 text-[#c5a572]" />
                    </div>
                  </div>
                )}
                
                <div className={`max-w-[75%] ${
                  message.role === 'user' ? 'order-first' : ''
                }`}>
                  {/* En-tête du message */}
                  <div className="flex items-center gap-2 mb-2">
                    {message.role === 'assistant' && (
                      <span className="text-sm font-medium text-[#c5a572]">Francis</span>
                    )}
                    {message.role === 'user' && (
                      <span className="text-sm font-medium text-gray-300">Vous</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.category && message.category !== 'general' && (
                      <span className="px-2 py-0.5 bg-[#c5a572]/10 text-[#c5a572] text-xs rounded border border-[#c5a572]/20">
                        {message.category}
                      </span>
                    )}
                    
                    {/* Actions message */}
                    <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleBookmark(index)}
                        className={`p-1 rounded transition-colors ${
                          bookmarkedMessages.has(index)
                            ? 'text-[#c5a572]'
                            : 'text-gray-400 hover:text-[#c5a572]'
                        }`}
                        title="Marquer"
                      >
                        <Star className={`w-4 h-4 ${bookmarkedMessages.has(index) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => copyMessageContent(message.content)}
                        className="p-1 rounded text-gray-400 hover:text-[#c5a572] transition-colors"
                        title="Copier"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Contenu du message */}
                  <div className={`p-4 rounded-2xl shadow-lg group ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-br-none'
                      : message.error 
                        ? 'bg-red-700/70 text-white rounded-bl-none border border-red-600/30' 
                        : 'bg-[#162238] text-gray-100 border border-[#c5a572]/20 rounded-bl-none'
                  }`}>
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                    
                    {/* Sources */}
                    {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                      <div className="mt-4 p-3 bg-[#1a2332]/50 rounded-lg border border-[#c5a572]/10">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-[#c5a572]" />
                          <span className="text-sm font-medium text-[#c5a572]">Sources</span>
                        </div>
                        <ul className="space-y-1">
                          {message.sources.map((source, idx) => (
                            <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-[#c5a572] rounded-full mt-2 flex-shrink-0"></div>
                              <span>{source}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Avatar utilisateur */}
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#c5a572]/20 border-2 border-[#c5a572]/30 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-[#c5a572]" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Indicateur de chargement professionnel */}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="flex-shrink-0 relative inline-flex items-center justify-center group">
                  <div className="h-10 w-10 bg-[#c5a572] rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300">
                    <MessageSquare className="h-6 w-6 text-[#162238]" />
                  </div>
                  <div className="h-6 w-6 bg-[#162238] rounded-full flex items-center justify-center absolute -bottom-1 -right-1 shadow-md transition-transform group-hover:scale-110 duration-300">
                    <Euro className="h-4 w-4 text-[#c5a572]" />
                  </div>
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

          {/* Zone de saisie professionnelle révolutionnaire */}
          <div className="border-t border-[#c5a572]/20 bg-[#162238]/95 backdrop-blur-sm">
            {/* Suggestions rapides si template sélectionné */}
            {selectedTemplate && showQuickActions && (
              <div className="p-4 border-b border-[#c5a572]/10">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-400">Suggestions:</span>
                  {selectedTemplate.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setInput(`${input} ${tag}`)}
                      className="px-2 py-1 bg-[#c5a572]/10 text-[#c5a572] text-xs rounded border border-[#c5a572]/20 hover:bg-[#c5a572]/20 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-4">
              <form onSubmit={handleSend} className="max-w-5xl mx-auto">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    {/* Zone de saisie avancée */}
                    <div className="relative">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={selectedTemplate ? 
                          `Template: ${selectedTemplate.title} - Personnalisez votre question...` : 
                          "Posez votre question à Francis Pro..."
                        }
                        className="w-full p-4 pr-20 bg-[#0E2444] border border-[#c5a572]/30 rounded-xl text-gray-200 focus:outline-none focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 transition-all resize-none shadow-lg"
                        rows={input.length > 100 ? 4 : 2}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(e as any);
                          }
                        }}
                      />
                      
                      {/* Raccourcis dans la zone de saisie */}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1">
                        {input.trim() && (
                          <button
                            type="button"
                            onClick={() => setInput('')}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                            title="Effacer"
                          >
                            ✕
                          </button>
                        )}
                        <span className="text-xs text-gray-500">
                          {input.length}/1000
                        </span>
                      </div>
                    </div>
                    
                    {/* Info contextuelle */}
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <div className="flex items-center gap-4">
                        {selectedClientProfile && (
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-[#c5a572] rounded-full"></div>
                            Client: {selectedClientProfile.prenom_client} {selectedClientProfile.nom_client}
                          </span>
                        )}
                        <span>Juridiction: {jurisdiction === 'france' ? '🇫🇷 France' : jurisdiction}</span>
                      </div>
                      <span>⌘ + Entrée pour envoyer</span>
                    </div>
                  </div>
                  
                  {/* Boutons d'action */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] p-3 rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg h-12 w-12 group"
                      title="Envoyer (⌘ + Entrée)"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-[#162238] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                      )}
                    </button>
                    
                    {selectedTemplate && (
                      <button
                        type="button"
                        onClick={() => setSelectedTemplate(null)}
                        className="p-3 rounded-xl bg-[#0E2444]/50 hover:bg-red-500/20 border border-[#c5a572]/20 hover:border-red-500/30 transition-all text-gray-300 hover:text-red-400 h-12 w-12"
                        title="Supprimer template"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Actions rapides en bas */}
                {showQuickActions && !selectedTemplate && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#c5a572]/10">
                    <span className="text-xs text-gray-400">Actions rapides:</span>
                    <button
                      type="button"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="px-3 py-1 bg-[#c5a572]/10 text-[#c5a572] text-xs rounded border border-[#c5a572]/20 hover:bg-[#c5a572]/20 transition-colors flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      Templates
                    </button>
                    <button
                      type="button"
                      onClick={exportConversation}
                      className="px-3 py-1 bg-[#0E2444]/50 text-gray-300 text-xs rounded border border-[#c5a572]/20 hover:bg-[#c5a572]/10 hover:text-[#c5a572] transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Exporter
                    </button>
                    <button
                      type="button"
                      onClick={startNewConversation}
                      className="px-3 py-1 bg-[#0E2444]/50 text-gray-300 text-xs rounded border border-[#c5a572]/20 hover:bg-[#c5a572]/10 hover:text-[#c5a572] transition-colors flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      Nouveau
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 