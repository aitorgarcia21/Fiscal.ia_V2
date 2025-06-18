import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Menu, 
  X, 
  LogOut, 
  Settings, 
  FileText, 
  Calculator, 
  TrendingUp, 
  MessageSquare,
  Euro,
  Search,
  Home,
  ChevronRight,
  Paperclip,
  Upload,
  CreditCard,
  Users,
  PieChart,
  BarChart3,
  Target,
  Wallet,
  Building2,
  Shield,
  Bell,
  Star,
  Sparkles,
  ArrowRight,
  Plus,
  Activity,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { InitialProfileQuestions } from '../components/InitialProfileQuestions';
import apiClient from '../services/apiClient';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: File[];
}

interface UserProfile {
  auth_user_id: string;
  tmi?: number;
  situation_familiale?: string;
  nombre_enfants?: number;
  residence_principale?: boolean;
  residence_secondaire?: boolean;
  revenus_annuels?: number;
  charges_deductibles?: number;
  activite_principale?: string;
  revenus_complementaires?: string[];
  statuts_juridiques?: string[];
  residence_fiscale?: string;
  patrimoine_situation?: string;
  has_completed_onboarding?: boolean;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis Francis, votre assistant fiscal intelligent. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/');
      return;
    }

    // Ne charger le profil que pour les particuliers
    if (user?.taper === 'particulier') {
      checkUserProfile();
    } else {
      setIsLoadingProfile(false);
    }
  }, [isAuthenticated, user, navigate]);

  const checkUserProfile = async () => {
    if (!user?.id) return;

    try {
      const profile = await apiClient<UserProfile>(`/api/user-profile/${user.id}`, {
        method: 'GET'
      });
      
      setUserProfile(profile);
      
      // Si c'est la première connexion (pas d'activité principale définie), montrer l'onboarding
      if (!profile.has_completed_onboarding && !profile.activite_principale) {
        setShowOnboarding(true);
      }
    } catch (error: any) {
      console.log('Profil non trouvé, première connexion détectée');
      setShowOnboarding(true);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleOnboardingComplete = async (profileData: any) => {
    if (!user?.id) return;

    try {
      const completeProfile: UserProfile = {
        auth_user_id: user.id,
        ...profileData,
        has_completed_onboarding: true
      };

      const savedProfile = await apiClient<UserProfile>(`/api/user-profile/${user.id}`, {
        method: userProfile ? 'PUT' : 'POST',
        data: completeProfile
      });

      setUserProfile(savedProfile);
      setShowOnboarding(false);

      // Message de bienvenue personnalisé
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `Parfait ! Votre profil a été enregistré. En tant que ${getProfileLabel(profileData.activite_principale)}, je peux maintenant vous proposer des conseils fiscaux personnalisés. Que souhaitez-vous optimiser en priorité ?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, welcomeMessage]);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
    }
  };

  const getProfileLabel = (activity: string) => {
    const labels: Record<string, string> = {
      'salarie_cdi': 'salarié en CDI',
      'fonctionnaire': 'fonctionnaire',
      'dirigeant_sasu': 'dirigeant de SASU',
      'dirigeant_sarl': 'dirigeant de SARL',
      'autoentrepreneur': 'auto-entrepreneur',
      'profession_liberale': 'professionnel libéral',
      'retraite': 'retraité',
      'sans_activite': 'sans activité'
    };
    return labels[activity] || activity;
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage || 'Document(s) attaché(s)',
      timestamp: new Date(),
      attachments: selectedFiles.length > 0 ? selectedFiles : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedFiles([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/test-francis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputMessage || 'J\'ai uploadé des documents, pouvez-vous les analyser ?'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.answer || data.response || 'Je n\'ai pas pu traiter votre demande.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Erreur de communication');
      }
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  // Si on charge le profil ou si l'onboarding est en cours
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#c5a572] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding && user?.taper === 'particulier') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447] p-4 sm:p-6">
        <div className="container mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-2xl blur-md opacity-60"></div>
                <div className="relative bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] p-3 rounded-2xl">
                  <Bot className="h-8 w-8 sm:h-10 sm:w-10 text-[#162238]" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent">
                  Bienvenue sur Fiscal.ia
                </h1>
                <p className="text-sm sm:text-base text-gray-400 mt-2 px-4 sm:px-0">Découvrons votre profil pour personnaliser vos conseils fiscaux</p>
              </div>
            </div>
          </div>
          
          <InitialProfileQuestions onComplete={handleOnboardingComplete} />
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'overview', icon: Home, label: 'Tableau de Bord' },
    { id: 'francis', icon: MessageSquare, label: 'Francis Chat' },
    { id: 'analysis', icon: PieChart, label: 'Mes Analyses' },
    { id: 'documents', icon: FileText, label: 'Mes Documents' },
    { id: 'profile', icon: Settings, label: 'Mon Profil' },
  ];

  // KPIs réels basés sur le profil utilisateur
  const getKpiData = () => {
    if (!userProfile) {
      return {
        profileCompletion: 0,
        activiteType: 'Non défini',
        nextAction: 'Compléter le profil'
      };
    }

    const completion = Object.values(userProfile).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length * 10; // Estimation basique

    return {
      profileCompletion: Math.min(completion, 100),
      activiteType: getProfileLabel(userProfile.activite_principale || ''),
      nextAction: userProfile.has_completed_onboarding ? 'Optimiser votre fiscalité' : 'Finaliser le profil'
    };
  };

  const kpiData = getKpiData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447] text-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#1a2332]/95 backdrop-blur-lg border-r border-[#c5a572]/20 transition-transform duration-300 ease-in-out overflow-y-auto`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 p-6 border-b border-[#c5a572]/20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-xl blur-md opacity-60"></div>
                <div className="relative bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] p-2 rounded-xl">
                  <Bot className="h-6 w-6 text-[#162238]" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent">
                  Fiscal.ia
                </h1>
                <p className="text-xs text-gray-400">Assistant Personnel</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-[#c5a572]/20 to-[#e8cfa0]/20 text-[#c5a572] border border-[#c5a572]/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Profil utilisateur */}
            <div className="p-4 border-t border-[#c5a572]/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center text-[#162238] font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-400">{kpiData.activiteType}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile Header */}
          <header className="md:hidden bg-[#1a2332]/95 backdrop-blur-lg border-b border-[#c5a572]/20 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent">
                Fiscal.ia
              </h1>
              <div className="w-10 h-10 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center text-[#162238] font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </header>

          {/* Contenu principal */}
          <main className="flex-1 overflow-auto">
            {activeTab === 'overview' && (
              <div className="p-6 space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Tableau de Bord Personnel</h2>
                  <p className="text-gray-400">Votre situation fiscale et patrimoniale</p>
                </div>

                {/* KPI Cards basées sur le profil réel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-[#1a2332]/80 to-[#243447]/80 backdrop-blur-sm border border-[#c5a572]/20 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-[#c5a572]/20 rounded-lg">
                        <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#c5a572]" />
                      </div>
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-white">{kpiData.profileCompletion}%</p>
                        <p className="text-xs sm:text-sm text-gray-400">Profil Complété</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#1a2332]/80 to-[#243447]/80 backdrop-blur-sm border border-[#c5a572]/20 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg">
                        <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-lg font-bold text-white">{kpiData.activiteType}</p>
                        <p className="text-xs sm:text-sm text-gray-400">Activité Principale</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#1a2332]/80 to-[#243447]/80 backdrop-blur-sm border border-[#c5a572]/20 rounded-xl p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white">{kpiData.nextAction}</p>
                        <p className="text-xs sm:text-sm text-gray-400">Prochaine Action</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="bg-gradient-to-br from-[#1a2332]/80 to-[#243447]/80 backdrop-blur-sm border border-[#c5a572]/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Actions Rapides</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('francis')}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-all"
                    >
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">Consulter Francis</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('analysis')}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/10 border border-[#c5a572]/30 rounded-lg hover:bg-[#c5a572]/20 transition-all"
                    >
                      <PieChart className="w-5 h-5 text-[#c5a572]" />
                      <span className="text-white font-medium">Nouvelle Analyse</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('profile')}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-all"
                    >
                      <Settings className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">Gérer le Profil</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'francis' && (
              <div className="h-full flex flex-col">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-[#1a2332]/95 to-[#243447]/95 backdrop-blur-lg border-b border-[#c5a572]/20 p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full blur-md opacity-60"></div>
                      <div className="relative w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center text-[#162238]">
                        <Bot className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Francis - Assistant Fiscal IA</h2>
                      <p className="text-sm text-gray-400">
                        {userProfile?.has_completed_onboarding 
                          ? `Conseils personnalisés pour votre profil ${kpiData.activiteType.toLowerCase()}`
                          : 'Assistant fiscal intelligent'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-2xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238]'
                              : 'bg-[#1a2332]/80 text-gray-100 border border-[#c5a572]/20'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-4">
                          {message.timestamp.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#1a2332]/80 border border-[#c5a572]/20 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="border-t border-[#c5a572]/20 p-6">
                  {selectedFiles.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 bg-[#1a2332]/60 rounded-lg p-2">
                          <Paperclip className="w-4 h-4 text-[#c5a572]" />
                          <span className="text-sm text-gray-300 flex-1">{file.name}</span>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-end gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 bg-[#1a2332]/80 border border-[#c5a572]/30 rounded-xl text-[#c5a572] hover:bg-[#c5a572]/10 transition-colors"
                      aria-label="Joindre un fichier"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Posez votre question fiscale..."
                        className="w-full px-4 py-3 bg-[#1a2332]/80 border border-[#c5a572]/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 resize-none"
                        rows={1}
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                      />
                    </div>
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() && selectedFiles.length === 0}
                      className="p-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="p-6">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-3xl font-bold text-white mb-6">Mon Profil Fiscal</h2>
                  
                  {userProfile && (
                    <div className="bg-gradient-to-br from-[#1a2332]/80 to-[#243447]/80 backdrop-blur-sm border border-[#c5a572]/20 rounded-xl p-6 space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Informations Générales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Activité Principale</label>
                            <p className="text-white bg-[#1a2332]/60 px-4 py-2 rounded-lg">
                              {getProfileLabel(userProfile.activite_principale || '')}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Situation Familiale</label>
                            <p className="text-white bg-[#1a2332]/60 px-4 py-2 rounded-lg">
                              {userProfile.situation_familiale || 'Non défini'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Résidence Fiscale</label>
                            <p className="text-white bg-[#1a2332]/60 px-4 py-2 rounded-lg">
                              {userProfile.residence_fiscale || 'Non défini'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Situation Patrimoniale</label>
                            <p className="text-white bg-[#1a2332]/60 px-4 py-2 rounded-lg">
                              {userProfile.patrimoine_situation || 'Non défini'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => setShowOnboarding(true)}
                          className="px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-lg hover:shadow-lg transition-all"
                        >
                          Modifier le Profil
                        </button>
                        <button
                          onClick={() => navigate('/profile')}
                          className="px-6 py-3 bg-[#1a2332]/80 border border-[#c5a572]/30 text-white rounded-lg hover:bg-[#c5a572]/10 transition-all"
                        >
                          Profil Détaillé
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="p-6">
                <h2 className="text-3xl font-bold text-white mb-6">Mes Analyses Fiscales</h2>
                <div className="bg-gradient-to-br from-[#1a2332]/80 to-[#243447]/80 backdrop-blur-sm border border-[#c5a572]/20 rounded-xl p-8 text-center">
                  <PieChart className="w-16 h-16 text-[#c5a572] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Analyses Personnalisées</h3>
                  <p className="text-gray-400 mb-6">
                    Vos analyses fiscales apparaîtront ici une fois générées par Francis
                  </p>
                  <button
                    onClick={() => setActiveTab('francis')}
                    className="px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Demander une Analyse
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="p-6">
                <h2 className="text-3xl font-bold text-white mb-6">Mes Documents</h2>
                <div className="bg-gradient-to-br from-[#1a2332]/80 to-[#243447]/80 backdrop-blur-sm border border-[#c5a572]/20 rounded-xl p-8 text-center">
                  <FileText className="w-16 h-16 text-[#c5a572] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Espace Documents</h3>
                  <p className="text-gray-400 mb-6">
                    Vos documents fiscaux seront stockés et organisés ici
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Ajouter un Document
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Overlay pour mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
} 