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
  Smile,
  Baby,
  User,
  UserCheck
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

  // Modales pour les outils
  const [showTmiModal, setShowTmiModal] = useState(false);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [showConsciousnessModal, setShowConsciousnessModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  // États pour les résultats
  const [tmiResult, setTmiResult] = useState<any>(null);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [consciousnessResult, setConsciousnessResult] = useState<any>(null);
  const [alertsResult, setAlertsResult] = useState<any>(null);
  const [isLoadingTool, setIsLoadingTool] = useState(false);

  // États pour les formulaires
  const [tmiForm, setTmiForm] = useState({
    revenu_annuel: '',
    situation_familiale: 'celibataire',
    nombre_enfants: 0
  });

  const [optimizationForm, setOptimizationForm] = useState({
    revenu_annuel: '',
    situation_familiale: 'celibataire',
    nombre_enfants: 0,
    type_optimisation: 'toutes'
  });

  const [consciousnessForm, setConsciousnessForm] = useState({
    niveau_connaissance: 'debutant',
    experience_fiscale: 'aucune',
    objectifs: 'comprendre'
  });

  const [alertsForm, setAlertsForm] = useState({
    revenu_annuel: '',
    situation_familiale: 'celibataire',
    nombre_enfants: 0,
    alertes_souhaitees: ['seuils_tmi', 'optimisations', 'changements_loi']
  });

  // États pour le test complet
  const [testQuestions, setTestQuestions] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testReponses, setTestReponses] = useState<{[key: string]: string}>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [showTestResults, setShowTestResults] = useState(false);

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
      id: 'tmi',
      title: 'Calculateur TMI',
      description: 'Calculez votre Taux Marginal d\'Imposition en 30 secondes',
      icon: Calculator,
      color: 'from-blue-500 to-blue-600',
      action: () => setShowTmiModal(true)
    },
    {
      id: 'optimization',
      title: 'Simulateur d\'Optimisation',
      description: 'Découvrez vos économies fiscales potentielles',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      action: () => setShowOptimizationModal(true)
    },
    {
      id: 'consciousness',
      title: 'Test de Conscience',
      description: 'Évaluez votre niveau de compréhension fiscale',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      action: () => setShowConsciousnessModal(true)
    },
    {
      id: 'alerts',
      title: 'Alertes Fiscales',
      description: 'Recevez des alertes personnalisées sur votre situation',
      icon: Bell,
      color: 'from-orange-500 to-orange-600',
      action: () => setShowAlertsModal(true)
    },
    {
      id: 'bank',
      title: 'Connexion Bancaire',
      description: 'Connectez votre compte bancaire pour une analyse précise',
      icon: CreditCard,
      color: 'from-emerald-500 to-emerald-600',
      action: () => {
        const clientId = import.meta.env.VITE_TRUELAYER_CLIENT_ID;
        const env = import.meta.env.VITE_TRUELAYER_ENV || 'sandbox';
        const authUrl = env === 'sandbox' 
          ? 'https://auth.truelayer-sandbox.com'
          : 'https://auth.truelayer.com';
        
        const redirectUri = `${window.location.origin}/truelayer-callback`;
        const scope = 'accounts balance transactions';
        
        const url = `${authUrl}/?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&providers=uk-ob-all uk-oauth-all`;
        
        window.location.href = url;
      }
    }
  ];

  const consciousnessLevels = [
    {
      level: 'Débutant',
      description: 'Vous commencez votre parcours',
      icon: Baby,
      color: 'text-blue-400'
    },
    {
      level: 'Intermédiaire',
      description: 'Vous avez les bases',
      icon: User,
      color: 'text-green-400'
    },
    {
      level: 'Avancé',
      description: 'Vous maîtrisez bien',
      icon: UserCheck,
      color: 'text-purple-400'
    },
    {
      level: 'Expert',
      description: 'Vous êtes autonome',
      icon: Crown,
      color: 'text-yellow-400'
    }
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

  const handleTmiCalculation = async () => {
    if (!tmiForm.revenu_annuel) {
      alert('Veuillez saisir votre revenu annuel');
      return;
    }

    setIsLoadingTool(true);
    try {
      const response = await fetch('/api/calculate-tmi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tmiForm)
      });
      
      if (response.ok) {
        const result = await response.json();
        setTmiResult(result);
        setShowTmiModal(false);
        // Afficher le résultat dans une alerte stylée
        alert(`Votre TMI : ${result.tmi}%\nRevenu imposable : ${result.revenu_imposable}€\nImpôt estimé : ${result.impot_estime}€`);
      } else {
        alert('Erreur lors du calcul');
      }
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setIsLoadingTool(false);
    }
  };

  const handleOptimizationSimulation = async () => {
    if (!optimizationForm.revenu_annuel) {
      alert('Veuillez saisir votre revenu annuel');
      return;
    }

    setIsLoadingTool(true);
    try {
      const response = await fetch('/api/simulate-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimizationForm)
      });
      
      if (response.ok) {
        const result = await response.json();
        setOptimizationResult(result);
        setShowOptimizationModal(false);
        // Afficher le résultat dans une alerte stylée
        alert(`Économies potentielles : ${result.economies_potentielles}€\nOptimisations recommandées : ${result.optimisations_recommandees.join(', ')}`);
      } else {
        alert('Erreur lors de la simulation');
      }
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setIsLoadingTool(false);
    }
  };

  // Fonction pour charger les questions du test
  const loadTestQuestions = async () => {
    try {
      const response = await fetch('/api/consciousness-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        const result = await response.json();
        setTestQuestions(result.questions);
        setCurrentQuestionIndex(0);
        setTestReponses({});
        setIsTestComplete(false);
        setTestResult(null);
        setShowTestResults(false);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
    }
  };

  // Fonction pour répondre à une question
  const handleQuestionResponse = (questionId: string, reponse: string) => {
    setTestReponses(prev => ({
      ...prev,
      [questionId]: reponse
    }));
  };

  // Fonction pour passer à la question suivante
  const nextQuestion = () => {
    if (currentQuestionIndex < Object.keys(testQuestions || {}).length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Test terminé, calculer les résultats
      calculateTestResults();
    }
  };

  // Fonction pour revenir à la question précédente
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Fonction pour calculer les résultats
  const calculateTestResults = async () => {
    setIsLoadingTool(true);
    try {
      const response = await fetch('/api/consciousness-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testReponses)
      });
      
      if (response.ok) {
        const result = await response.json();
        setTestResult(result);
        setIsTestComplete(true);
        setShowTestResults(true);
        setShowConsciousnessModal(false);
      } else {
        alert('Erreur lors du calcul des résultats');
      }
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setIsLoadingTool(false);
    }
  };

  // Fonction pour recommencer le test
  const restartTest = () => {
    setCurrentQuestionIndex(0);
    setTestReponses({});
    setIsTestComplete(false);
    setTestResult(null);
    setShowTestResults(false);
  };

  // Fonction pour ouvrir le test complet
  const handleConsciousnessTest = () => {
    loadTestQuestions();
    setShowConsciousnessModal(true);
  };

  const handleFiscalAlerts = async () => {
    if (!alertsForm.revenu_annuel) {
      alert('Veuillez saisir votre revenu annuel');
      return;
    }

    setIsLoadingTool(true);
    try {
      const response = await fetch('/api/fiscal-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertsForm)
      });
      
      if (response.ok) {
        const result = await response.json();
        setAlertsResult(result);
        setShowAlertsModal(false);
        // Afficher le résultat dans une alerte stylée
        alert(`Alertes générées : ${result.alertes.length} alertes\nProchain seuil TMI : ${result.prochain_seuil_tmi}€\nOptimisations disponibles : ${result.optimisations_disponibles}`);
      } else {
        alert('Erreur lors de la génération des alertes');
      }
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setIsLoadingTool(false);
    }
  };

  if (showOnboarding) {
    return <InitialProfileQuestions onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447] text-gray-100">
      {/* Header ultra-simple */}
      <div className="bg-[#162238] border-b border-[#c5a572]/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative inline-flex items-center justify-center group">
              <MessageSquare className="h-8 w-8 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
              <Euro className="h-6 w-6 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
            </div>
            <h1 className="text-lg font-semibold text-white">Francis</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                activeTab === 'chat' 
                  ? 'bg-[#c5a572] text-[#162238]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                activeTab === 'tools' 
                  ? 'bg-[#c5a572] text-[#162238]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Outils
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto p-4">
        {/* Onglet Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#c5a572]/10">
                    <MessageSquare className="w-8 h-8 text-[#c5a572]" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Bonjour ! Je suis Francis
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Posez-moi vos questions fiscales, je suis là pour vous aider !
                  </p>
                  
                  {/* Questions rapides */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                    <button
                      onClick={() => setInputMessage("Comment calculer mon TMI ?")}
                      className="p-3 bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-lg hover:bg-[#1a2332]/80 transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-[#c5a572]" />
                        <span className="text-sm text-gray-300">Calculer mon TMI</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setInputMessage("Quelles optimisations pour moi ?")}
                      className="p-3 bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-lg hover:bg-[#1a2332]/80 transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#c5a572]" />
                        <span className="text-sm text-gray-300">Mes optimisations</span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-[#c5a572] text-[#162238]'
                          : 'bg-[#1a2332] text-white border border-[#c5a572]/20'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Zone de saisie */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question..."
                className="flex-1 p-3 bg-[#1a2332] border border-[#c5a572]/20 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-3 bg-[#c5a572] text-[#162238] rounded-lg hover:bg-[#e8cfa0] transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#162238] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Onglet Outils */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Outils utiles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setShowTmiModal(true)}
                className="p-4 bg-[#1a2332] border border-[#c5a572]/20 rounded-lg hover:bg-[#1a2332]/80 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Calculator className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Calculateur TMI</h3>
                    <p className="text-sm text-gray-400">Calculez votre taux d'imposition</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowOptimizationModal(true)}
                className="p-4 bg-[#1a2332] border border-[#c5a572]/20 rounded-lg hover:bg-[#1a2332]/80 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Simulateur d'optimisation</h3>
                    <p className="text-sm text-gray-400">Découvrez vos économies</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowConsciousnessModal(true)}
                className="p-4 bg-[#1a2332] border border-[#c5a572]/20 rounded-lg hover:bg-[#1a2332]/80 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Test de conscience</h3>
                    <p className="text-sm text-gray-400">Évaluez votre niveau</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowAlertsModal(true)}
                className="p-4 bg-[#1a2332] border border-[#c5a572]/20 rounded-lg hover:bg-[#1a2332]/80 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Bell className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Alertes fiscales</h3>
                    <p className="text-sm text-gray-400">Restez informé</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  const clientId = import.meta.env.VITE_TRUELAYER_CLIENT_ID;
                  const env = import.meta.env.VITE_TRUELAYER_ENV || 'sandbox';
                  const authUrl = env === 'sandbox' 
                    ? 'https://auth.truelayer-sandbox.com'
                    : 'https://auth.truelayer.com';
                  
                  const redirectUri = `${window.location.origin}/truelayer-callback`;
                  const scope = 'accounts balance transactions';
                  
                  const url = `${authUrl}/?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&providers=uk-ob-all uk-oauth-all`;
                  
                  window.location.href = url;
                }}
                className="p-4 bg-[#1a2332] border border-[#c5a572]/20 rounded-lg hover:bg-[#1a2332]/80 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <CreditCard className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Connexion bancaire</h3>
                    <p className="text-sm text-gray-400">Connectez votre compte</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modales pour les outils */}
      
      {/* Modale Calculateur TMI */}
      {showTmiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#162238] border border-[#c5a572]/20 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#c5a572]" />
                Calculateur TMI
              </h3>
              <button
                onClick={() => setShowTmiModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Fermer la modale"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Revenu annuel (€)
                </label>
                <input
                  type="number"
                  value={tmiForm.revenu_annuel}
                  onChange={(e) => setTmiForm({...tmiForm, revenu_annuel: e.target.value})}
                  className="w-full p-3 bg-[#1a2332] border border-[#c5a572]/20 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:outline-none"
                  placeholder="Ex: 45000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Situation familiale
                </label>
                <select
                  value={tmiForm.situation_familiale}
                  onChange={(e) => setTmiForm({...tmiForm, situation_familiale: e.target.value})}
                  className="w-full p-3 bg-[#1a2332] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                  aria-label="Sélectionner votre situation familiale"
                >
                  <option value="celibataire">Célibataire</option>
                  <option value="marie">Marié(e)</option>
                  <option value="pacs">PACS</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre d'enfants
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={tmiForm.nombre_enfants}
                  onChange={(e) => setTmiForm({...tmiForm, nombre_enfants: parseInt(e.target.value)})}
                  className="w-full p-3 bg-[#1a2332] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                  aria-label="Nombre d'enfants"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTmiModal(false)}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleTmiCalculation}
                disabled={isLoadingTool}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all font-medium disabled:opacity-50"
              >
                {isLoadingTool ? 'Calcul...' : 'Calculer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Simulateur d'Optimisation */}
      {showOptimizationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#162238] border border-[#c5a572]/20 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#c5a572]" />
                Simulateur d'Optimisation
              </h3>
              <button
                onClick={() => setShowOptimizationModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Fermer la modale"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Revenu annuel (€)
                </label>
                <input
                  type="number"
                  value={optimizationForm.revenu_annuel}
                  onChange={(e) => setOptimizationForm({...optimizationForm, revenu_annuel: e.target.value})}
                  className="w-full p-3 bg-[#1a2332] border border-[#c5a572]/20 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:outline-none"
                  placeholder="Ex: 45000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type d'optimisation
                </label>
                <select
                  value={optimizationForm.type_optimisation}
                  onChange={(e) => setOptimizationForm({...optimizationForm, type_optimisation: e.target.value})}
                  className="w-full p-3 bg-[#1a2332] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                  aria-label="Sélectionner le type d'optimisation"
                >
                  <option value="toutes">Toutes les optimisations</option>
                  <option value="retraite">Retraite (PER, etc.)</option>
                  <option value="immobilier">Immobilier</option>
                  <option value="investissement">Investissement</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowOptimizationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleOptimizationSimulation}
                disabled={isLoadingTool}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all font-medium disabled:opacity-50"
              >
                {isLoadingTool ? 'Simulation...' : 'Simuler'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Test de Conscience */}
      {showConsciousnessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#162238] border border-[#c5a572]/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#c5a572]" />
                Test de Conscience Fiscale et Financière
              </h3>
              <button
                onClick={() => setShowConsciousnessModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Fermer la modale"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {!testQuestions ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-[#c5a572] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Chargement des questions...</p>
              </div>
            ) : (
              <>
                {/* Barre de progression */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Question {currentQuestionIndex + 1} sur {Object.keys(testQuestions).length}</span>
                    <span>{Math.round(((currentQuestionIndex + 1) / Object.keys(testQuestions).length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((currentQuestionIndex + 1) / Object.keys(testQuestions).length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Question actuelle */}
                {(() => {
                  const questionIds = Object.keys(testQuestions);
                  const currentQuestionId = questionIds[currentQuestionIndex];
                  const currentQuestion = testQuestions[currentQuestionId];
                  
                  return (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">
                          {currentQuestion.question}
                        </h4>
                        
                        <div className="space-y-3">
                          {Object.entries(currentQuestion.reponses).map(([key, reponse]: [string, any]) => (
                            <label
                              key={key}
                              className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-[#1a2332]/60 ${
                                testReponses[currentQuestionId] === key
                                  ? 'border-[#c5a572] bg-[#1a2332]/80'
                                  : 'border-[#c5a572]/20 bg-[#1a2332]/40'
                              }`}
                            >
                              <input
                                type="radio"
                                name={currentQuestionId}
                                value={key}
                                checked={testReponses[currentQuestionId] === key}
                                onChange={() => handleQuestionResponse(currentQuestionId, key)}
                                className="mt-1 text-[#c5a572] bg-[#1a2332] border-[#c5a572]/20 focus:ring-[#c5a572]"
                              />
                              <div className="flex-1">
                                <p className="text-white font-medium">{reponse.texte}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex-1 bg-gray-700 rounded-full h-1">
                                    <div 
                                      className="bg-[#c5a572] h-1 rounded-full transition-all duration-300"
                                      style={{ width: `${reponse.score}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-400">{reponse.score}%</span>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Boutons de navigation */}
                      <div className="flex justify-between pt-4">
                        <button
                          onClick={previousQuestion}
                          disabled={currentQuestionIndex === 0}
                          className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Précédent
                        </button>
                        
                        <button
                          onClick={nextQuestion}
                          disabled={!testReponses[currentQuestionId]}
                          className="px-6 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {currentQuestionIndex === Object.keys(testQuestions).length - 1 ? 'Terminer' : 'Suivant'}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}

      {/* Modale Résultats du Test */}
      {showTestResults && testResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#162238] border border-[#c5a572]/20 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#c5a572]" />
                Résultats de votre Test de Conscience Fiscale
              </h3>
              <button
                onClick={() => setShowTestResults(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Fermer la modale"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Score global */}
              <div className="bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/10 border border-[#c5a572]/20 rounded-xl p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#c5a572] mb-2">
                    {testResult.pourcentage}%
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">
                    {testResult.niveau_conscience}
                  </h4>
                  <p className="text-gray-300">{testResult.description_niveau}</p>
                </div>
              </div>

              {/* Points forts */}
              {testResult.points_forts && testResult.points_forts.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Vos Points Forts
                  </h4>
                  <div className="space-y-2">
                    {testResult.points_forts.map((point: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-white">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Axes d'amélioration */}
              {testResult.axes_amelioration && testResult.axes_amelioration.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    Axes d'Amélioration Prioritaires
                  </h4>
                  <div className="space-y-2">
                    {testResult.axes_amelioration.map((axe: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-white">{axe}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommandations */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-400" />
                  Recommandations Personnalisées
                </h4>
                <div className="space-y-3">
                  {testResult.recommandations.map((recommandation: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-[#1a2332]/40 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white">{recommandation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Détail des réponses */}
              <div className="bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#c5a572]" />
                  Détail de vos Réponses
                </h4>
                <div className="space-y-4">
                  {Object.entries(testResult.reponses_detaillees).map(([questionId, detail]: [string, any]) => (
                    <div key={questionId} className="p-4 bg-[#0f1419]/50 rounded-lg">
                      <p className="text-white font-medium mb-2">{detail.question}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{detail.reponse}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                detail.score >= 75 ? 'bg-green-400' :
                                detail.score >= 50 ? 'bg-yellow-400' :
                                detail.score >= 25 ? 'bg-orange-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${detail.score}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400">{detail.score}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={restartTest}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Recommencer le Test
                </button>
                <button
                  onClick={() => setShowTestResults(false)}
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all font-medium"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale Alertes Fiscales */}
      {showAlertsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#162238] border border-[#c5a572]/20 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#c5a572]" />
                Alertes Fiscales
              </h3>
              <button
                onClick={() => setShowAlertsModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Fermer la modale"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-300 mb-4 text-sm">
              Configurez vos alertes personnalisées pour rester informé des opportunités fiscales qui vous concernent.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Revenu annuel (€)
                </label>
                <input
                  type="number"
                  value={alertsForm.revenu_annuel}
                  onChange={(e) => setAlertsForm({...alertsForm, revenu_annuel: e.target.value})}
                  className="w-full p-3 bg-[#1a2332] border border-[#c5a572]/20 rounded-lg text-white placeholder-gray-400 focus:border-[#c5a572] focus:outline-none"
                  placeholder="Ex: 45000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Types d'alertes souhaitées
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'seuils_tmi', label: 'Seuils TMI', description: 'Quand vous changez de tranche' },
                    { value: 'optimisations', label: 'Optimisations', description: 'Nouvelles opportunités' },
                    { value: 'changements_loi', label: 'Changements de loi', description: 'Nouvelles règles fiscales' }
                  ].map((alerte) => (
                    <label key={alerte.value} className="flex items-start gap-3 p-3 bg-[#1a2332]/40 rounded-lg hover:bg-[#1a2332]/60 transition-all cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertsForm.alertes_souhaitees.includes(alerte.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAlertsForm({
                              ...alertsForm,
                              alertes_souhaitees: [...alertsForm.alertes_souhaitees, alerte.value]
                            });
                          } else {
                            setAlertsForm({
                              ...alertsForm,
                              alertes_souhaitees: alertsForm.alertes_souhaitees.filter(a => a !== alerte.value)
                            });
                          }
                        }}
                        className="mt-1 text-[#c5a572] bg-[#1a2332] border-[#c5a572]/20 rounded focus:ring-[#c5a572]"
                      />
                      <div>
                        <p className="text-white font-medium">{alerte.label}</p>
                        <p className="text-sm text-gray-400">{alerte.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAlertsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleFiscalAlerts}
                disabled={isLoadingTool}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all font-medium disabled:opacity-50"
              >
                {isLoadingTool ? 'Génération...' : 'Générer les Alertes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 