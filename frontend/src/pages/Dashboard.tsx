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
  Info,
  Zap,
  Eye,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  TrendingDown,
  PiggyBank,
  Scale,
  Lock,
  Unlock,
  Brain,
  Rocket,
  Crown,
  Heart,
  Frown,
  Smile
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'tools' | 'insights'>('chat');
  const [fiscalInsights, setFiscalInsights] = useState<any>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [consciousnessTestResult, setConsciousnessTestResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Données factices pour les outils
  const fiscalInsightsDefault = {
    tmi: userProfile?.tmi || 30,
    economiePotentielle: 2400,
    prochaineEcheance: '15 Mai 2024',
    optimisationsDisponibles: 8,
    niveauConscience: 'Intermédiaire',
    scoreOptimisation: 65
  };

  const quickTools = [
    {
      id: 'tmi-calculator',
      title: 'Calculateur TMI',
      description: 'Calculez votre taux marginal d\'imposition',
      icon: Calculator,
      color: 'from-blue-500 to-blue-600',
      action: () => handleTMICalculation()
    },
    {
      id: 'optimization-simulator',
      title: 'Simulateur d\'Optimisation',
      description: 'Découvrez vos économies potentielles',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      action: () => handleOptimizationSimulation()
    },
    {
      id: 'fiscal-alerts',
      title: 'Alertes Fiscales',
      description: 'Restez informé des changements',
      icon: Bell,
      color: 'from-orange-500 to-orange-600',
      action: () => handleFiscalAlerts()
    },
    {
      id: 'consciousness-test',
      title: 'Test de Conscience',
      description: 'Évaluez votre niveau de conscience fiscale',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      action: () => handleConsciousnessTest()
    }
  ];

  const consciousnessLevels = [
    { level: 'Débutant', description: 'Vous découvrez la fiscalité', icon: Frown, color: 'text-red-400' },
    { level: 'Intermédiaire', description: 'Vous comprenez les bases', icon: Smile, color: 'text-yellow-400' },
    { level: 'Avancé', description: 'Vous maîtrisez les optimisations', icon: Star, color: 'text-green-400' },
    { level: 'Expert', description: 'Vous êtes autonome fiscalement', icon: Crown, color: 'text-purple-400' }
  ];

  useEffect(() => {
    checkUserProfile();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'insights' && !fiscalInsights) {
      loadFiscalInsights();
    }
  }, [activeTab, fiscalInsights]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const checkUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/user-profile', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        
        if (!profile.has_completed_onboarding) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
    }
  };

  const handleOnboardingComplete = async (profileData: any) => {
    try {
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...profileData,
          has_completed_onboarding: true
        })
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        setShowOnboarding(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return;

    const newMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      attachments: selectedFiles.length > 0 ? selectedFiles : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setSelectedFiles([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/test-francis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: inputMessage,
          conversation_history: messages.slice(-5),
          user_profile: userProfile
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.answer || 'Je suis désolé, je n\'ai pas pu traiter votre demande.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Erreur lors de la communication avec Francis');
      }
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Désolé, je rencontre un problème technique. Pouvez-vous réessayer ?',
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
    logout();
    navigate('/');
  };

  const loadFiscalInsights = async () => {
    if (!user?.id) return;
    
    setIsLoadingInsights(true);
    try {
      const response = await fetch('/api/tools/fiscal-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ user_id: user.id })
      });
      
      if (response.ok) {
        const insights = await response.json();
        setFiscalInsights(insights);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleTMICalculation = async () => {
    if (!userProfile) {
      alert('Veuillez d\'abord compléter votre profil fiscal');
      return;
    }

    try {
      const response = await fetch('/api/tools/calculate-tmi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          revenus_annuels: userProfile.revenus_annuels || 50000,
          situation_familiale: userProfile.situation_familiale || 'célibataire',
          nombre_enfants: userProfile.nombre_enfants || 0,
          charges_deductibles: userProfile.charges_deductibles || 0
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Votre TMI : ${result.tmi}%\nImpôt estimé : ${result.impot_estime.toFixed(0)}€\n\nConseils :\n${result.conseils_optimisation.join('\n')}`);
      }
    } catch (error) {
      console.error('Erreur lors du calcul TMI:', error);
      alert('Erreur lors du calcul. Veuillez réessayer.');
    }
  };

  const handleOptimizationSimulation = async () => {
    if (!userProfile) {
      alert('Veuillez d\'abord compléter votre profil fiscal');
      return;
    }

    try {
      const objectifs = [];
      if (userProfile.activite_principale) objectifs.push('retraite');
      if (userProfile.patrimoine_situation && userProfile.patrimoine_situation !== 'faible') objectifs.push('immobilier');
      if (userProfile.patrimoine_situation === 'élevé') objectifs.push('transmission');

      const response = await fetch('/api/tools/simulate-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          revenus_annuels: userProfile.revenus_annuels || 50000,
          tmi_actuelle: userProfile.tmi || 30,
          situation_familiale: userProfile.situation_familiale || 'célibataire',
          objectifs: objectifs.length > 0 ? objectifs : ['retraite']
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Économie potentielle : ${result.economie_potentielle.toFixed(0)}€\n\nImpact : ${result.impact_conscience}\n\nStratégies recommandées :\n${result.strategies_recommandees.map(s => `• ${s.nom} : ${s.economie.toFixed(0)}€`).join('\n')}`);
      }
    } catch (error) {
      console.error('Erreur lors de la simulation:', error);
      alert('Erreur lors de la simulation. Veuillez réessayer.');
    }
  };

  const handleFiscalAlerts = () => {
    alert('🚨 Alertes Fiscales Actuelles :\n\n• Nouveau barème IR 2024 applicable\n• Échéance déclaration 2024 : 30 mai 2024\n• Vérifiez vos droits à la décote\n• Nouvelles règles PER 2024\n\nRestez informé pour reprendre le contrôle !');
  };

  const handleConsciousnessTest = async () => {
    // Simulation de réponses au test
    const reponses = {
      connaissance_tmi: 3,
      optimisation_active: 2,
      comprehension_mecanismes: 4,
      planification_fiscale: 2,
      independance_conseil: 3
    };

    try {
      const response = await fetch('/api/tools/consciousness-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ reponses })
      });

      if (response.ok) {
        const result = await response.json();
        setConsciousnessTestResult(result);
        alert(`Niveau de conscience : ${result.niveau_conscience}\nScore : ${result.score_total}/${result.score_maximum} (${result.pourcentage.toFixed(0)}%)\n\nRecommandations :\n${result.recommandations.join('\n')}`);
      }
    } catch (error) {
      console.error('Erreur lors du test:', error);
      alert('Erreur lors du test. Veuillez réessayer.');
    }
  };

  if (showOnboarding) {
    return <InitialProfileQuestions onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447] text-gray-100">
      {/* Header simple */}
      <header className="bg-[#1a2332]/95 backdrop-blur-lg border-b border-[#c5a572]/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative inline-flex items-center justify-center group">
              <MessageSquare className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
              <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent">
                Fiscal.ia
              </h1>
              <p className="text-xs text-gray-400">Assistant Financier Personnel</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center text-[#162238] font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm text-gray-300 hidden md:block">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
              </span>
            </div>
            <button
              onClick={() => navigate('/profil')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-[#c5a572] rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:block">Mon Profil</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:block">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation par onglets */}
      <div className="border-b border-[#c5a572]/20 bg-[#1a2332]/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'chat', label: 'Francis Chat', icon: MessageSquare },
              { id: 'tools', label: 'Outils Utiles', icon: Zap },
              { id: 'insights', label: 'Mes Insights', icon: Eye }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-[#c5a572] text-[#c5a572]'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto flex-1 flex flex-col">
        
        {/* Onglet Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col">
            {/* Welcome message si pas de messages */}
            {messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center max-w-2xl">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto relative group">
                      <MessageSquare className="w-10 h-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
                      <Euro className="w-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Bonjour ! Je suis Francis, votre assistant financier.
                  </h2>
                  <p className="text-gray-300 mb-6">
                    {userProfile?.has_completed_onboarding 
                      ? `Prêt à reprendre le contrôle de votre fiscalité ${userProfile.activite_principale ? `en tant que ${userProfile.activite_principale.toLowerCase()}` : ''} ?`
                      : 'Posez-moi toutes vos questions fiscales, je suis là pour vous aider à prendre conscience !'
                    }
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-400">
                    <span className="bg-[#1a2332]/60 px-3 py-1 rounded-full">💡 Optimisation fiscale</span>
                    <span className="bg-[#1a2332]/60 px-3 py-1 rounded-full">📊 Simulation d'impôts</span>
                    <span className="bg-[#1a2332]/60 px-3 py-1 rounded-full">🏦 Conseils patrimoniaux</span>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.length > 0 && (
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
            )}

            {/* Input area */}
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
                        aria-label="Supprimer le fichier"
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
                    placeholder="Posez votre question fiscale à Francis..."
                    className="w-full px-4 py-3 bg-[#1a2332]/80 border border-[#c5a572]/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 resize-none"
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                    aria-label="Message à Francis"
                  />
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || (!inputMessage.trim() && selectedFiles.length === 0)}
                  className="p-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-xl hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Envoyer le message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Outils */}
        {activeTab === 'tools' && (
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-[#c5a572]" />
                Outils pour Reprendre le Contrôle
              </h2>
              
              {/* Outils rapides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {quickTools.map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={tool.action}
                      className="p-6 bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-xl hover:bg-[#1a2332]/80 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${tool.color}`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-white group-hover:text-[#c5a572] transition-colors">
                            {tool.title}
                          </h3>
                          <p className="text-sm text-gray-400">{tool.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-[#c5a572] transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Test de conscience fiscale */}
              <div className="bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#c5a572]" />
                  Test de Conscience Fiscale
                </h3>
                <p className="text-gray-300 mb-4">
                  Évaluez votre niveau de conscience fiscale et découvrez comment reprendre le contrôle de votre situation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {consciousnessLevels.map((level) => {
                    const IconComponent = level.icon;
                    return (
                      <div key={level.level} className="text-center p-4 bg-[#0f1419]/50 rounded-lg">
                        <IconComponent className={`w-8 h-8 mx-auto mb-2 ${level.color}`} />
                        <h4 className="font-semibold text-white mb-1">{level.level}</h4>
                        <p className="text-xs text-gray-400">{level.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Conseils disruptifs */}
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Conseils Disruptifs
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Unlock className="w-5 h-5 text-green-400 mt-1" />
                    <div>
                      <p className="text-white font-medium">Ne soyez plus dépendant</p>
                      <p className="text-sm text-gray-400">Prenez conscience de vos droits et obligations fiscales</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-white font-medium">Voyez au-delà des apparences</p>
                      <p className="text-sm text-gray-400">Comprenez les mécanismes fiscaux cachés</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Rocket className="w-5 h-5 text-purple-400 mt-1" />
                    <div>
                      <p className="text-white font-medium">Passez à l'action</p>
                      <p className="text-sm text-gray-400">Transformez votre conscience en actions concrètes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Insights */}
        {activeTab === 'insights' && (
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Eye className="w-6 h-6 text-[#c5a572]" />
                Mes Insights Fiscaux
              </h2>
              
              {/* KPIs principaux */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Économies Potentielles</p>
                      <p className="text-2xl font-bold text-white">{fiscalInsights?.economie_potentielle || fiscalInsightsDefault.economiePotentielle}€</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Calculator className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">TMI Actuel</p>
                      <p className="text-2xl font-bold text-white">{fiscalInsights?.tmi_actuelle || fiscalInsightsDefault.tmi}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Brain className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Score Conscience</p>
                      <p className="text-2xl font-bold text-white">{fiscalInsights?.score_optimisation || fiscalInsightsDefault.scoreOptimisation}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Target className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Optimisations</p>
                      <p className="text-2xl font-bold text-white">{fiscalInsights?.optimisations_disponibles || fiscalInsightsDefault.optimisationsDisponibles}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Niveau de conscience actuel */}
              <div className="bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Votre Niveau de Conscience</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl font-bold text-[#c5a572]">{fiscalInsights?.niveau_conscience || fiscalInsightsDefault.niveauConscience}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${fiscalInsights?.score_optimisation || fiscalInsightsDefault.scoreOptimisation}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  Vous êtes sur la bonne voie pour reprendre le contrôle de votre fiscalité !
                </p>
              </div>

              {/* Prochaines actions recommandées */}
              <div className="bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/10 border border-[#c5a572]/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#c5a572]" />
                  Actions Recommandées
                </h3>
                <div className="space-y-3">
                  {fiscalInsights?.actions_recommandees ? (
                    fiscalInsights.actions_recommandees.map((action: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-[#1a2332]/40 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white">{action}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-[#1a2332]/40 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white">Complétez votre profil fiscal</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[#1a2332]/40 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white">Analyser vos revenus complémentaires</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[#1a2332]/40 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white">Explorer les optimisations disponibles</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        aria-label="Sélectionner des fichiers"
      />
    </div>
  );
} 