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
  Mic,
  MicOff
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

  // États pour l'extraction automatique
  const [showDiscoveryExtraction, setShowDiscoveryExtraction] = useState(false);
  const [discoveryTranscript, setDiscoveryTranscript] = useState('');
  const [isExtractingDiscovery, setIsExtractingDiscovery] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);

  // États pour l'enregistrement vocal
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);

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
      // Sauvegarder les données de découverte
      const response = await fetch('/api/user-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          discovery_data: discoveryData
        })
      });

      if (response.ok) {
        // Générer un rapport personnalisé
        const reportResponse = await fetch('/api/generate-personalized-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user?.id,
            discovery_data: discoveryData
          })
        });

        if (reportResponse.ok) {
          const report = await reportResponse.json();
          // Afficher le rapport personnalisé
          alert('Votre profil de découverte a été sauvegardé ! Francis peut maintenant vous donner des conseils ultra-personnalisés.');
          setActiveTab('chat');
          setInputMessage("Peux-tu me donner des conseils personnalisés basés sur mon profil ?");
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde, mais vous pouvez continuer à utiliser Francis.');
    }
  };

  const handleDiscoveryExtraction = async () => {
    if (!discoveryTranscript.trim()) return;
    
    setIsExtractingDiscovery(true);
    try {
      const response = await fetch('/api/extract-discovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transcript: discoveryTranscript
        })
      });

      if (response.ok) {
        const result = await response.json();
        setExtractionResult(result);
      } else {
        setExtractionResult({ error: 'Erreur lors de l\'extraction des données' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction:', error);
      setExtractionResult({ error: 'Erreur lors de l\'extraction des données' });
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

  // Fonctions pour l'enregistrement vocal
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setAudioChunks(chunks);
        setIsTranscribing(true);
        
        // Envoyer l'audio au backend pour transcription
        await transcribeAudio(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setDiscoveryTranscript(result.transcription);
        setIsTranscribing(false);
      } else {
        throw new Error('Erreur lors de la transcription');
      }
    } catch (error) {
      console.error('Erreur lors de la transcription:', error);
      setIsTranscribing(false);
      alert('Erreur lors de la transcription audio. Veuillez réessayer.');
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
              onClick={() => setActiveTab('discovery')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                activeTab === 'discovery' 
                  ? 'bg-[#c5a572] text-[#162238]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Découverte
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

        {/* Onglet Découverte */}
        {activeTab === 'discovery' && (
          <div className="space-y-6">
            {/* Header avec progression */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Découvrez votre potentiel fiscal</h2>
              <p className="text-gray-400 mb-4">Répondez à quelques questions pour des conseils ultra-personnalisés</p>
              
              {/* Boutons de dictée */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setShowDiscoveryExtraction(true)}
                    className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-3 justify-center"
                  >
                    <Mic className="w-5 h-5" />
                    Coller transcription
                  </button>
                  <button
                    onClick={() => {
                      if (isRecording) {
                        stopRecording();
                      } else {
                        startRecording();
                      }
                    }}
                    className={`px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-3 justify-center ${
                      isRecording 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Arrêter l'enregistrement
                      </>
                    ) : (
                      <>
                        <MicOff className="w-5 h-5" />
                        Enregistrer ma voix
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Collez une transcription ou enregistrez directement votre conversation
                </p>
                {isTranscribing && (
                  <div className="flex items-center justify-center gap-2 text-blue-400 mt-2">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Transcription en cours...</span>
                  </div>
                )}
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
    </div>
  );
} 