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
  UserCheck,
  Mic
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { InitialProfileQuestions } from '../components/InitialProfileQuestions';
import { Logo } from '../components/ui/Logo';
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
  const [activeTab, setActiveTab] = useState<'chat' | 'tools' | 'insights' | 'discovery'>('chat');
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

  // États pour la section découverte
  const [discoveryStep, setDiscoveryStep] = useState(0);
  const [discoveryData, setDiscoveryData] = useState({
    // Informations personnelles
    age: '',
    situation_familiale: 'celibataire',
    nombre_enfants: 0,
    residence_fiscale: 'france',
    
    // Revenus et activité
    revenus_principaux: '',
    activite_principale: 'salarie',
    revenus_complementaires: [] as string[],
    charges_deductibles: '',
    
    // Patrimoine
    residence_principale: false,
    residence_secondaire: false,
    epargne_totale: '',
    investissements: [] as string[],
    
    // Objectifs et projets
    objectifs_court_terme: [] as string[],
    objectifs_moyen_terme: [] as string[],
    objectifs_long_terme: [] as string[],
    
    // Niveau de connaissance
    niveau_connaissance_fiscale: 'debutant',
    experience_investissement: 'aucune',
    tolerance_risque: 'conservateur',
    
    // Besoins spécifiques
    besoins_specifiques: [] as string[],
    questions_prioritaires: '',
    
    // Optimisations souhaitées
    optimisations_souhaitees: [] as string[]
  });
  const [discoveryProgress, setDiscoveryProgress] = useState(0);
  
  // États pour l'extraction automatique
  const [showDiscoveryExtraction, setShowDiscoveryExtraction] = useState(false);
  const [discoveryTranscript, setDiscoveryTranscript] = useState('');
  const [isExtractingDiscovery, setIsExtractingDiscovery] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);

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

  // Fonctions pour la section découverte
  const nextDiscoveryStep = () => {
    if (discoveryStep < 7) {
      setDiscoveryStep(discoveryStep + 1);
      setDiscoveryProgress(((discoveryStep + 1) / 7) * 100);
    }
  };

  const prevDiscoveryStep = () => {
    if (discoveryStep > 0) {
      setDiscoveryStep(discoveryStep - 1);
      setDiscoveryProgress((discoveryStep / 7) * 100);
    }
  };

  const updateDiscoveryData = (field: string, value: any) => {
    setDiscoveryData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDiscoveryComplete = async () => {
    try {
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...discoveryData,
          has_completed_discovery: true
        })
      });

      if (response.ok) {
        setActiveTab('insights');
        setDiscoveryStep(0);
        setDiscoveryProgress(0);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la découverte:', error);
    }
  };

  // Fonctions pour l'extraction automatique
  const handleDiscoveryExtraction = async () => {
    if (!discoveryTranscript.trim()) return;
    
    setIsExtractingDiscovery(true);
    setExtractionResult(null);
    
    try {
      const response = await fetch('/api/pro/extract-discovery-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          transcript: discoveryTranscript
        })
      });

      if (response.ok) {
        const result = await response.json();
        setExtractionResult(result);
        
        // Appliquer automatiquement les données extraites
        if (result.extracted_data) {
          setDiscoveryData(prev => ({
            ...prev,
            ...result.extracted_data
          }));
        }
      } else {
        throw new Error('Erreur lors de l\'extraction');
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction de découverte:', error);
      setExtractionResult({
        error: 'Erreur lors de l\'extraction des données'
      });
    } finally {
      setIsExtractingDiscovery(false);
    }
  };

  const applyExtractionResult = () => {
    if (extractionResult?.extracted_data) {
      setDiscoveryData(prev => ({
        ...prev,
        ...extractionResult.extracted_data
      }));
      setShowDiscoveryExtraction(false);
      setDiscoveryTranscript('');
      setExtractionResult(null);
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
            <Logo size="md" />
          </div>
          <div className="flex items-center gap-2">
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
      <div className="flex-1 flex flex-col max-w-6xl mx-auto p-4">
        {/* Navigation des onglets améliorée */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gradient-to-br from-[#1a2332]/80 to-[#162238]/80 backdrop-blur-sm border border-[#c5a572]/20 rounded-2xl p-1.5 shadow-lg">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'chat' 
                    ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] shadow-lg shadow-[#c5a572]/20' 
                    : 'text-gray-400 hover:text-white hover:bg-[#162238]/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat Francis
                </div>
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'tools' 
                    ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] shadow-lg shadow-[#c5a572]/20' 
                    : 'text-gray-400 hover:text-white hover:bg-[#162238]/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Outils
                </div>
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'insights' 
                    ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] shadow-lg shadow-[#c5a572]/20' 
                    : 'text-gray-400 hover:text-white hover:bg-[#162238]/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Insights
                </div>
              </button>
              <button
                onClick={() => setActiveTab('discovery')}
                className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'discovery' 
                    ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] shadow-lg shadow-[#c5a572]/20' 
                    : 'text-gray-400 hover:text-white hover:bg-[#162238]/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Découverte
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Onglet Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-6 space-y-4 px-4">
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-[#c5a572]/20 to-[#e8cfa0]/20 border border-[#c5a572]/30">
                    <MessageSquare className="w-12 h-12 text-[#c5a572]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Bonjour ! Je suis Francis
                  </h2>
                  <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
                    Votre assistant fiscal intelligent. Posez-moi vos questions, je suis là pour vous aider à optimiser votre fiscalité !
                  </p>
                  
                  {/* Questions rapides améliorées */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <button
                      onClick={() => setInputMessage("Comment calculer mon TMI ?")}
                      className="group p-4 bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl hover:border-[#c5a572]/40 hover:shadow-lg hover:shadow-[#c5a572]/10 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Calculator className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Calculer mon TMI</p>
                          <p className="text-gray-400 text-sm">Taux marginal d'imposition</p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setInputMessage("Quelles optimisations pour moi ?")}
                      className="group p-4 bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl hover:border-[#c5a572]/40 hover:shadow-lg hover:shadow-[#c5a572]/10 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Mes optimisations</p>
                          <p className="text-gray-400 text-sm">Stratégies personnalisées</p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setInputMessage("Comment déclarer mes revenus ?")}
                      className="group p-4 bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl hover:border-[#c5a572]/40 hover:shadow-lg hover:shadow-[#c5a572]/10 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Déclaration 2024</p>
                          <p className="text-gray-400 text-sm">Guide étape par étape</p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setInputMessage("Quels placements fiscaux ?")}
                      className="group p-4 bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl hover:border-[#c5a572]/40 hover:shadow-lg hover:shadow-[#c5a572]/10 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PiggyBank className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Placements fiscaux</p>
                          <p className="text-gray-400 text-sm">Investissements optimisés</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] text-[#162238] shadow-lg'
                          : 'bg-gradient-to-br from-[#1a2332] to-[#162238] text-white border border-[#c5a572]/20 shadow-lg'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Zone de saisie améliorée */}
            <div className="bg-gradient-to-br from-[#1a2332]/80 to-[#162238]/80 backdrop-blur-sm border border-[#c5a572]/20 rounded-2xl p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question à Francis..."
                  className="flex-1 p-3 bg-[#162238]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:border-[#c5a572] focus:outline-none focus:ring-2 focus:ring-[#c5a572]/20 transition-all"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[#162238] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Outils */}
        {activeTab === 'tools' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Outils Fiscaux Intelligents</h2>
              <p className="text-xl text-gray-400">Optimisez votre fiscalité en quelques clics</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => setShowTmiModal(true)}
                className="group bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6 hover:border-[#c5a572]/40 hover:shadow-lg hover:shadow-[#c5a572]/10 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calculator className="w-7 h-7 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Calculateur TMI</h3>
                <p className="text-gray-400 mb-4">Calculez votre taux marginal d'imposition en 30 secondes</p>
                <div className="flex items-center text-blue-400 text-sm font-medium">
                  Commencer <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => setShowOptimizationModal(true)}
                className="group bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6 hover:border-[#c5a572]/40 hover:shadow-lg hover:shadow-[#c5a572]/10 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-7 h-7 text-green-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Simulateur d'Optimisation</h3>
                <p className="text-gray-400 mb-4">Découvrez vos économies fiscales potentielles</p>
                <div className="flex items-center text-green-400 text-sm font-medium">
                  Découvrir <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => setShowConsciousnessModal(true)}
                className="group bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6 hover:border-[#c5a572]/40 hover:shadow-lg hover:shadow-[#c5a572]/10 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Brain className="w-7 h-7 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Test de Conscience</h3>
                <p className="text-gray-400 mb-4">Évaluez votre niveau de compréhension fiscale</p>
                <div className="flex items-center text-purple-400 text-sm font-medium">
                  Tester <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => setShowAlertsModal(true)}
                className="group bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6 hover:border-[#c5a572]/40 hover:shadow-lg hover:shadow-[#c5a572]/10 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bell className="w-7 h-7 text-orange-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Alertes Fiscales</h3>
                <p className="text-gray-400 mb-4">Recevez des alertes personnalisées sur votre situation</p>
                <div className="flex items-center text-orange-400 text-sm font-medium">
                  Configurer <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
                className="group bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6 hover:border-[#c5a572]/40 hover:shadow-lg hover:shadow-[#c5a572]/10 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CreditCard className="w-7 h-7 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Connexion Bancaire</h3>
                <p className="text-gray-400 mb-4">Connectez votre compte pour une analyse précise</p>
                <div className="flex items-center text-emerald-400 text-sm font-medium">
                  Connecter <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <div className="bg-gradient-to-br from-[#c5a572]/10 to-[#e8cfa0]/10 border border-[#c5a572]/30 rounded-xl p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-[#c5a572]/20 to-[#e8cfa0]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-[#c5a572]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Plus d'outils</h3>
                <p className="text-gray-400">De nouveaux outils arrivent bientôt...</p>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Insights */}
        {activeTab === 'insights' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Analyses & Recommandations</h2>
              <p className="text-xl text-gray-400">Vos insights fiscaux personnalisés</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Analyse principale */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#c5a572]/20 to-[#e8cfa0]/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#c5a572]" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Analyse de votre situation</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-[#162238]/50 rounded-lg">
                      <span className="text-gray-400">TMI actuel</span>
                      <span className="text-white font-semibold">{fiscalInsights?.tmi || 30}%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-[#162238]/50 rounded-lg">
                      <span className="text-gray-400">Revenus annuels</span>
                      <span className="text-white font-semibold">{fiscalInsights?.revenusAnnuels || 45000}€</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-[#162238]/50 rounded-lg">
                      <span className="text-gray-400">Économies potentielles</span>
                      <span className="text-green-400 font-semibold">{fiscalInsights?.economiePotentielle || 2400}€</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Recommandations prioritaires</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-white font-medium">Optimisez votre épargne retraite</p>
                        <p className="text-gray-400 text-sm">Ouvrez un PER pour réduire votre assiette imposable</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-white font-medium">Déclarez vos frais réels</p>
                        <p className="text-gray-400 text-sm">Vous pourriez économiser jusqu'à 500€ par an</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-white font-medium">Considérez l'investissement locatif</p>
                        <p className="text-gray-400 text-sm">Avec votre profil, c'est une option intéressante</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Niveau de conscience</h3>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-purple-400">7/10</span>
                    </div>
                    <p className="text-white font-medium mb-1">Intermédiaire</p>
                    <p className="text-gray-400 text-sm">Vous avez de bonnes bases fiscales</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Prochaines échéances</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Déclaration 2024</span>
                      <span className="text-white text-sm font-medium">15 Mai 2024</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">ISF 2024</span>
                      <span className="text-white text-sm font-medium">15 Juin 2024</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Taxe foncière</span>
                      <span className="text-white text-sm font-medium">15 Oct 2024</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Objectifs 2024</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-white text-sm">Réduire le TMI de 2 points</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-white text-sm">Économiser 3000€ d'impôts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-white text-sm">Optimiser l'épargne</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Découverte */}
        {activeTab === 'discovery' && (
          <div className="space-y-6">
            {/* Header avec progression */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Découvrez votre potentiel fiscal</h2>
              <p className="text-gray-400 mb-4">Répondez à quelques questions pour des conseils ultra-personnalisés</p>
              
              {/* Bouton d'extraction automatique */}
              <div className="mb-6">
                <button
                  onClick={() => setShowDiscoveryExtraction(true)}
                  className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-3 mx-auto"
                >
                  <Mic className="w-5 h-5" />
                  Remplir automatiquement par dictée
                </button>
                <p className="text-xs text-gray-500 mt-2">Collez la transcription de votre conversation CGP-client</p>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-[#1a2332] rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${discoveryProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">Étape {discoveryStep + 1} sur 7</p>
            </div>

            {/* Modal d'extraction automatique */}
            {showDiscoveryExtraction && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-[#1a2332] border border-[#c5a572]/20 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Extraction automatique par dictée</h3>
                    <button
                      onClick={() => {
                        setShowDiscoveryExtraction(false);
                        setDiscoveryTranscript('');
                        setExtractionResult(null);
                      }}
                      className="text-gray-400 hover:text-white"
                      aria-label="Fermer la modal d'extraction"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Transcription de la conversation CGP-client
                      </label>
                      <textarea
                        value={discoveryTranscript}
                        onChange={(e) => setDiscoveryTranscript(e.target.value)}
                        placeholder="Collez ici la transcription complète de votre conversation avec votre CGP..."
                        className="w-full h-32 p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none resize-none"
                      />
                    </div>
                    
                    <button
                      onClick={handleDiscoveryExtraction}
                      disabled={!discoveryTranscript.trim() || isExtractingDiscovery}
                      className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isExtractingDiscovery ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[#162238] border-t-transparent rounded-full animate-spin" />
                          Extraction en cours...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Extraire les informations
                        </>
                      )}
                    </button>
                    
                    {/* Résultats de l'extraction */}
                    {extractionResult && (
                      <div className="mt-4 p-4 bg-[#162238] rounded-lg border border-[#c5a572]/20">
                        {extractionResult.error ? (
                          <div className="text-red-400 text-sm">
                            {extractionResult.error}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-white">Extraction réussie !</h4>
                              <span className="text-sm text-gray-400">
                                Confiance: {Math.round(extractionResult.confiance * 100)}%
                              </span>
                            </div>
                            
                            {extractionResult.validation_notes && extractionResult.validation_notes.length > 0 && (
                              <div className="text-sm text-yellow-400">
                                <p className="font-medium mb-1">Notes de validation :</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {extractionResult.validation_notes.map((note: string, index: number) => (
                                    <li key={index}>{note}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div className="flex gap-3">
                              <button
                                onClick={applyExtractionResult}
                                className="flex-1 bg-[#c5a572] text-[#162238] px-4 py-2 rounded-lg font-medium hover:bg-[#e8cfa0] transition-colors"
                              >
                                Appliquer les données
                              </button>
                              <button
                                onClick={() => setExtractionResult(null)}
                                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                              >
                                Recommencer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contenu des étapes */}
            <div className="bg-[#1a2332] border border-[#c5a572]/20 rounded-xl p-6">
              {discoveryStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#c5a572]/10">
                      <User className="w-8 h-8 text-[#c5a572]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Informations personnelles</h3>
                    <p className="text-gray-400">Commençons par vos informations de base</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Âge</label>
                      <input
                        type="number"
                        value={discoveryData.age}
                        onChange={(e) => updateDiscoveryData('age', e.target.value)}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                        placeholder="Ex: 35"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Situation familiale</label>
                      <select
                        value={discoveryData.situation_familiale}
                        onChange={(e) => updateDiscoveryData('situation_familiale', e.target.value)}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                        aria-label="Sélectionner votre situation familiale"
                      >
                        <option value="celibataire">Célibataire</option>
                        <option value="marie">Marié(e)</option>
                        <option value="pacs">PACS</option>
                        <option value="divorce">Divorcé(e)</option>
                        <option value="veuf">Veuf/Veuve</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nombre d'enfants</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={discoveryData.nombre_enfants}
                        onChange={(e) => updateDiscoveryData('nombre_enfants', parseInt(e.target.value))}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Résidence fiscale</label>
                      <select
                        value={discoveryData.residence_fiscale}
                        onChange={(e) => updateDiscoveryData('residence_fiscale', e.target.value)}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                      >
                        <option value="france">France</option>
                        <option value="etranger">Étranger</option>
                        <option value="expatrie">Expatrié</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {discoveryStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#c5a572]/10">
                      <DollarSign className="w-8 h-8 text-[#c5a572]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Revenus et activité</h3>
                    <p className="text-gray-400">Parlez-nous de vos sources de revenus</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Revenus principaux annuels (€)</label>
                      <input
                        type="number"
                        value={discoveryData.revenus_principaux}
                        onChange={(e) => updateDiscoveryData('revenus_principaux', e.target.value)}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                        placeholder="Ex: 45000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Activité principale</label>
                      <select
                        value={discoveryData.activite_principale}
                        onChange={(e) => updateDiscoveryData('activite_principale', e.target.value)}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                      >
                        <option value="salarie">Salarié</option>
                        <option value="independant">Indépendant</option>
                        <option value="chef_entreprise">Chef d'entreprise</option>
                        <option value="retraite">Retraité</option>
                        <option value="etudiant">Étudiant</option>
                        <option value="chomeur">Chômeur</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Revenus complémentaires</label>
                      <div className="space-y-2">
                        {['Location', 'Dividendes', 'Intérêts', 'Plus-values', 'Pensions', 'Aucun'].map((revenu) => (
                          <label key={revenu} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={discoveryData.revenus_complementaires.includes(revenu.toLowerCase())}
                              onChange={(e) => {
                                const newRevenus = e.target.checked
                                  ? [...discoveryData.revenus_complementaires, revenu.toLowerCase()]
                                  : discoveryData.revenus_complementaires.filter(r => r !== revenu.toLowerCase());
                                updateDiscoveryData('revenus_complementaires', newRevenus);
                              }}
                              className="mr-3 text-[#c5a572] bg-[#162238] border-[#c5a572]/20 focus:ring-[#c5a572]"
                            />
                            <span className="text-gray-300">{revenu}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Charges déductibles annuelles (€)</label>
                      <input
                        type="number"
                        value={discoveryData.charges_deductibles}
                        onChange={(e) => updateDiscoveryData('charges_deductibles', e.target.value)}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                        placeholder="Ex: 5000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {discoveryStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#c5a572]/10">
                      <Building2 className="w-8 h-8 text-[#c5a572]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Patrimoine immobilier</h3>
                    <p className="text-gray-400">Décrivez votre situation immobilière</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#162238] rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">Résidence principale</h4>
                        <p className="text-sm text-gray-400">Êtes-vous propriétaire de votre résidence principale ?</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={discoveryData.residence_principale}
                          onChange={(e) => updateDiscoveryData('residence_principale', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Propriétaire de sa résidence principale"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c5a572]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-[#162238] rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">Résidence secondaire</h4>
                        <p className="text-sm text-gray-400">Possédez-vous une résidence secondaire ?</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={discoveryData.residence_secondaire}
                          onChange={(e) => updateDiscoveryData('residence_secondaire', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Propriétaire d'une résidence secondaire"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c5a572]"></div>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Épargne totale (€)</label>
                      <input
                        type="number"
                        value={discoveryData.epargne_totale}
                        onChange={(e) => updateDiscoveryData('epargne_totale', e.target.value)}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                        placeholder="Ex: 50000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Types d'investissements</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Actions', 'Obligations', 'SCPI', 'PEA', 'Assurance-vie', 'Crypto', 'Or', 'Aucun'].map((invest) => (
                          <label key={invest} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={discoveryData.investissements.includes(invest.toLowerCase())}
                              onChange={(e) => {
                                const newInvest = e.target.checked
                                  ? [...discoveryData.investissements, invest.toLowerCase()]
                                  : discoveryData.investissements.filter(i => i !== invest.toLowerCase());
                                updateDiscoveryData('investissements', newInvest);
                              }}
                              className="mr-2 text-[#c5a572] bg-[#162238] border-[#c5a572]/20 focus:ring-[#c5a572]"
                            />
                            <span className="text-sm text-gray-300">{invest}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {discoveryStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#c5a572]/10">
                      <Target className="w-8 h-8 text-[#c5a572]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Objectifs et projets</h3>
                    <p className="text-gray-400">Quels sont vos projets à court, moyen et long terme ?</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-white mb-3">Objectifs à court terme (1-3 ans)</h4>
                      <div className="space-y-2">
                        {['Acheter un bien immobilier', 'Constituer une épargne de sécurité', 'Financer un projet personnel', 'Optimiser mes impôts', 'Aucun objectif spécifique'].map((objectif) => (
                          <label key={objectif} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={discoveryData.objectifs_court_terme.includes(objectif.toLowerCase())}
                              onChange={(e) => {
                                const newObjectifs = e.target.checked
                                  ? [...discoveryData.objectifs_court_terme, objectif.toLowerCase()]
                                  : discoveryData.objectifs_court_terme.filter(o => o !== objectif.toLowerCase());
                                updateDiscoveryData('objectifs_court_terme', newObjectifs);
                              }}
                              className="mr-3 text-[#c5a572] bg-[#162238] border-[#c5a572]/20 focus:ring-[#c5a572]"
                            />
                            <span className="text-gray-300">{objectif}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white mb-3">Objectifs à moyen terme (3-10 ans)</h4>
                      <div className="space-y-2">
                        {['Développer mon patrimoine', 'Préparer ma retraite', 'Financer les études des enfants', 'Diversifier mes investissements', 'Aucun objectif spécifique'].map((objectif) => (
                          <label key={objectif} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={discoveryData.objectifs_moyen_terme.includes(objectif.toLowerCase())}
                              onChange={(e) => {
                                const newObjectifs = e.target.checked
                                  ? [...discoveryData.objectifs_moyen_terme, objectif.toLowerCase()]
                                  : discoveryData.objectifs_moyen_terme.filter(o => o !== objectif.toLowerCase());
                                updateDiscoveryData('objectifs_moyen_terme', newObjectifs);
                              }}
                              className="mr-3 text-[#c5a572] bg-[#162238] border-[#c5a572]/20 focus:ring-[#c5a572]"
                            />
                            <span className="text-gray-300">{objectif}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white mb-3">Objectifs à long terme (10+ ans)</h4>
                      <div className="space-y-2">
                        {['Transmettre mon patrimoine', 'Assurer mon indépendance financière', 'Préparer la succession', 'Aucun objectif spécifique'].map((objectif) => (
                          <label key={objectif} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={discoveryData.objectifs_long_terme.includes(objectif.toLowerCase())}
                              onChange={(e) => {
                                const newObjectifs = e.target.checked
                                  ? [...discoveryData.objectifs_long_terme, objectif.toLowerCase()]
                                  : discoveryData.objectifs_long_terme.filter(o => o !== objectif.toLowerCase());
                                updateDiscoveryData('objectifs_long_terme', newObjectifs);
                              }}
                              className="mr-3 text-[#c5a572] bg-[#162238] border-[#c5a572]/20 focus:ring-[#c5a572]"
                            />
                            <span className="text-gray-300">{objectif}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {discoveryStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#c5a572]/10">
                      <Brain className="w-8 h-8 text-[#c5a572]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Niveau de connaissance</h3>
                    <p className="text-gray-400">Évaluez votre niveau de connaissance fiscale et financière</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">Niveau de connaissance fiscale</label>
                      <div className="space-y-2">
                        {[
                          { value: 'debutant', label: 'Débutant', desc: 'Je découvre la fiscalité' },
                          { value: 'intermediaire', label: 'Intermédiaire', desc: 'J\'ai quelques notions' },
                          { value: 'avance', label: 'Avancé', desc: 'Je maîtrise bien le sujet' },
                          { value: 'expert', label: 'Expert', desc: 'Je suis très compétent' }
                        ].map((niveau) => (
                          <label key={niveau.value} className="flex items-center p-3 bg-[#162238] rounded-lg cursor-pointer hover:bg-[#162238]/80">
                            <input
                              type="radio"
                              name="niveau_connaissance"
                              value={niveau.value}
                              checked={discoveryData.niveau_connaissance_fiscale === niveau.value}
                              onChange={(e) => updateDiscoveryData('niveau_connaissance_fiscale', e.target.value)}
                              className="mr-3 text-[#c5a572] bg-[#162238] border-[#c5a572]/20 focus:ring-[#c5a572]"
                            />
                            <div>
                              <div className="font-medium text-white">{niveau.label}</div>
                              <div className="text-sm text-gray-400">{niveau.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">Expérience en investissement</label>
                      <select
                        value={discoveryData.experience_investissement}
                        onChange={(e) => updateDiscoveryData('experience_investissement', e.target.value)}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                      >
                        <option value="aucune">Aucune expérience</option>
                        <option value="debutant">Débutant (quelques mois)</option>
                        <option value="intermediaire">Intermédiaire (1-3 ans)</option>
                        <option value="confirme">Confirmé (3-10 ans)</option>
                        <option value="expert">Expert (10+ ans)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">Tolérance au risque</label>
                      <div className="space-y-2">
                        {[
                          { value: 'conservateur', label: 'Conservateur', desc: 'Je privilégie la sécurité' },
                          { value: 'modere', label: 'Modéré', desc: 'J\'accepte un risque limité' },
                          { value: 'dynamique', label: 'Dynamique', desc: 'Je recherche la performance' },
                          { value: 'agressif', label: 'Agressif', desc: 'Je maximise le rendement' }
                        ].map((risque) => (
                          <label key={risque.value} className="flex items-center p-3 bg-[#162238] rounded-lg cursor-pointer hover:bg-[#162238]/80">
                            <input
                              type="radio"
                              name="tolerance_risque"
                              value={risque.value}
                              checked={discoveryData.tolerance_risque === risque.value}
                              onChange={(e) => updateDiscoveryData('tolerance_risque', e.target.value)}
                              className="mr-3 text-[#c5a572] bg-[#162238] border-[#c5a572]/20 focus:ring-[#c5a572]"
                            />
                            <div>
                              <div className="font-medium text-white">{risque.label}</div>
                              <div className="text-sm text-gray-400">{risque.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {discoveryStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#c5a572]/10">
                      <Lightbulb className="w-8 h-8 text-[#c5a572]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Besoins spécifiques</h3>
                    <p className="text-gray-400">Quels sont vos besoins et questions prioritaires ?</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">Besoins spécifiques</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                          'Optimisation fiscale', 'Planification retraite', 'Transmission patrimoine',
                          'Investissement immobilier', 'Gestion de l\'épargne', 'Réduction d\'impôts',
                          'Conseils juridiques', 'Aucun besoin spécifique'
                        ].map((besoin) => (
                          <label key={besoin} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={discoveryData.besoins_specifiques.includes(besoin.toLowerCase())}
                              onChange={(e) => {
                                const newBesoins = e.target.checked
                                  ? [...discoveryData.besoins_specifiques, besoin.toLowerCase()]
                                  : discoveryData.besoins_specifiques.filter(b => b !== besoin.toLowerCase());
                                updateDiscoveryData('besoins_specifiques', newBesoins);
                              }}
                              className="mr-2 text-[#c5a572] bg-[#162238] border-[#c5a572]/20 focus:ring-[#c5a572]"
                            />
                            <span className="text-sm text-gray-300">{besoin}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Questions prioritaires</label>
                      <textarea
                        value={discoveryData.questions_prioritaires}
                        onChange={(e) => updateDiscoveryData('questions_prioritaires', e.target.value)}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                        rows={4}
                        placeholder="Ex: Comment optimiser mes impôts ? Quels investissements pour ma retraite ?..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {discoveryStep === 6 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#c5a572]/10">
                      <TrendingUp className="w-8 h-8 text-[#c5a572]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Optimisations souhaitées</h3>
                    <p className="text-gray-400">Quels types d'optimisations vous intéressent le plus ?</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'reduction_impots', label: 'Réduction d\'impôts', icon: '💰' },
                        { id: 'epargne_retraite', label: 'Épargne retraite', icon: '🏦' },
                        { id: 'investissement_immobilier', label: 'Investissement immobilier', icon: '🏠' },
                        { id: 'transmission', label: 'Transmission patrimoine', icon: '👨‍👩‍👧‍👦' },
                        { id: 'optimisation_sociale', label: 'Optimisation sociale', icon: '📊' },
                        { id: 'investissement_financier', label: 'Investissement financier', icon: '📈' },
                        { id: 'defiscalisation', label: 'Défiscalisation', icon: '🎯' },
                        { id: 'conseils_personnalises', label: 'Conseils personnalisés', icon: '🎓' }
                      ].map((opti) => (
                        <label key={opti.id} className="flex items-center p-4 bg-[#162238] rounded-lg cursor-pointer hover:bg-[#162238]/80 border border-[#c5a572]/20">
                          <input
                            type="checkbox"
                            checked={discoveryData.optimisations_souhaitees.includes(opti.id)}
                            onChange={(e) => {
                              const newOptis = e.target.checked
                                ? [...discoveryData.optimisations_souhaitees, opti.id]
                                : discoveryData.optimisations_souhaitees.filter(o => o !== opti.id);
                              updateDiscoveryData('optimisations_souhaitees', newOptis);
                            }}
                            className="mr-3 text-[#c5a572] bg-[#162238] border-[#c5a572]/20 focus:ring-[#c5a572]"
                          />
                          <span className="text-2xl mr-3">{opti.icon}</span>
                          <span className="text-gray-300">{opti.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {discoveryStep === 7 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#c5a572]/10">
                      <CheckCircle className="w-8 h-8 text-[#c5a572]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Récapitulatif</h3>
                    <p className="text-gray-400">Vérifiez vos informations avant de finaliser</p>
                  </div>
                  
                  <div className="bg-[#162238] rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">Informations personnelles</h4>
                        <p className="text-sm text-gray-400">Âge: {discoveryData.age || 'Non renseigné'}</p>
                        <p className="text-sm text-gray-400">Situation: {discoveryData.situation_familiale}</p>
                        <p className="text-sm text-gray-400">Enfants: {discoveryData.nombre_enfants}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-2">Revenus</h4>
                        <p className="text-sm text-gray-400">Principaux: {discoveryData.revenus_principaux || 'Non renseigné'}€</p>
                        <p className="text-sm text-gray-400">Activité: {discoveryData.activite_principale}</p>
                        <p className="text-sm text-gray-400">Complémentaires: {discoveryData.revenus_complementaires.length}</p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-[#c5a572]/20">
                      <h4 className="font-medium text-white mb-2">Objectifs principaux</h4>
                      <div className="flex flex-wrap gap-2">
                        {discoveryData.objectifs_court_terme.slice(0, 2).map((obj, index) => (
                          <span key={index} className="px-2 py-1 bg-[#c5a572]/20 text-[#c5a572] text-xs rounded">
                            {obj}
                          </span>
                        ))}
                        {discoveryData.objectifs_moyen_terme.slice(0, 2).map((obj, index) => (
                          <span key={index} className="px-2 py-1 bg-[#c5a572]/20 text-[#c5a572] text-xs rounded">
                            {obj}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">
                      En finalisant, Francis pourra vous donner des conseils ultra-personnalisés basés sur votre profil complet !
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={prevDiscoveryStep}
                disabled={discoveryStep === 0}
                className="px-6 py-2 border border-[#c5a572]/20 text-[#c5a572] rounded-lg hover:bg-[#c5a572]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              {discoveryStep < 7 ? (
                <button
                  onClick={nextDiscoveryStep}
                  className="px-6 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all font-medium"
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={handleDiscoveryComplete}
                  className="px-6 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all font-medium"
                >
                  Finaliser ma découverte
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modale Calculateur TMI */}
      {showTmiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2332] border border-[#c5a572]/20 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Calculateur TMI</h3>
              </div>
              <button
                onClick={() => {
                  setShowTmiModal(false);
                  setTmiResult(null);
                  setTmiForm({
                    revenu_annuel: '',
                    situation_familiale: 'celibataire',
                    nombre_enfants: 0
                  });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!tmiResult ? (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-400 mb-4">
                    Calculez votre taux marginal d'imposition en quelques secondes
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Revenu annuel net imposable
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={tmiForm.revenu_annuel}
                        onChange={(e) => setTmiForm(prev => ({ ...prev, revenu_annuel: e.target.value }))}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none pr-12"
                        placeholder="Ex: 45000"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Situation familiale
                    </label>
                    <select
                      value={tmiForm.situation_familiale}
                      onChange={(e) => setTmiForm(prev => ({ ...prev, situation_familiale: e.target.value }))}
                      className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                    >
                      <option value="celibataire">Célibataire</option>
                      <option value="marie">Marié(e)</option>
                      <option value="pacs">PACS</option>
                      <option value="divorce">Divorcé(e)</option>
                      <option value="veuf">Veuf/Veuve</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre d'enfants à charge
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={tmiForm.nombre_enfants}
                      onChange={(e) => setTmiForm(prev => ({ ...prev, nombre_enfants: parseInt(e.target.value) || 0 }))}
                      className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>

                <button
                  onClick={handleTmiCalculation}
                  disabled={!tmiForm.revenu_annuel || isLoadingTool}
                  className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoadingTool ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#162238] border-t-transparent rounded-full animate-spin" />
                      Calcul en cours...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                      Calculer mon TMI
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-8 h-8 text-blue-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Résultats du calcul</h4>
                  <p className="text-gray-400">Votre taux marginal d'imposition</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#162238] to-[#1a2332] border border-[#c5a572]/20 rounded-xl p-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-400 mb-2">
                        {tmiResult.tmi}%
                      </div>
                      <p className="text-gray-400">Taux Marginal d'Imposition</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#162238] rounded-lg p-4">
                      <p className="text-sm text-gray-400">Revenu imposable</p>
                      <p className="text-lg font-semibold text-white">{tmiResult.revenu_imposable.toLocaleString()}€</p>
                    </div>
                    <div className="bg-[#162238] rounded-lg p-4">
                      <p className="text-sm text-gray-400">Taux moyen</p>
                      <p className="text-lg font-semibold text-white">{tmiResult.taux_moyen}%</p>
                    </div>
                    <div className="bg-[#162238] rounded-lg p-4">
                      <p className="text-sm text-gray-400">Impôt estimé</p>
                      <p className="text-lg font-semibold text-white">{tmiResult.impot_estime.toLocaleString()}€</p>
                    </div>
                    <div className="bg-[#162238] rounded-lg p-4">
                      <p className="text-sm text-gray-400">Tranches applicables</p>
                      <p className="text-sm font-semibold text-white">{tmiResult.tranches_applicables.length} tranche(s)</p>
                    </div>
                  </div>

                  {tmiResult.conseils_optimisation && tmiResult.conseils_optimisation.length > 0 && (
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
                      <h5 className="font-semibold text-green-400 mb-3">Conseils d'optimisation</h5>
                      <ul className="space-y-2">
                        {tmiResult.conseils_optimisation.map((conseil: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-300">{conseil}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setTmiResult(null);
                      setTmiForm({
                        revenu_annuel: '',
                        situation_familiale: 'celibataire',
                        nombre_enfants: 0
                      });
                    }}
                    className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                  >
                    Nouveau calcul
                  </button>
                  <button
                    onClick={() => setShowTmiModal(false)}
                    className="flex-1 bg-[#c5a572] text-[#162238] px-4 py-3 rounded-xl font-medium hover:bg-[#e8cfa0] transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 