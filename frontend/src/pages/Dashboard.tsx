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
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'tools' | 'discovery'>('chat');
  const [showDiscoveryExtraction, setShowDiscoveryExtraction] = useState(false);
  const [discoveryTranscript, setDiscoveryTranscript] = useState('');
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [isExtractingDiscovery, setIsExtractingDiscovery] = useState(false);
  const [showTmiModal, setShowTmiModal] = useState(false);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [showConsciousnessModal, setShowConsciousnessModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [isLoadingTool, setIsLoadingTool] = useState(false);
  const [tmiResult, setTmiResult] = useState<any>(null);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [alertsResult, setAlertsResult] = useState<any>(null);
  const [testQuestions, setTestQuestions] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testReponses, setTestReponses] = useState<Record<string, string>>({});
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [showTestResults, setShowTestResults] = useState(false);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  // États pour l'enregistrement vocal
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // États pour la synthèse vocale de Francis
  const [isFrancisSpeaking, setIsFrancisSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);

  // Données factices pour les outils
  const tools = [
    {
      id: 'tmi',
      title: 'Calculateur TMI',
      description: 'Calculez votre Taux Marginal d\'Imposition',
      icon: Calculator,
      color: 'from-blue-500 to-blue-600',
      action: () => setShowTmiModal(true)
    },
    {
      id: 'consciousness',
      title: 'Test de Conscience',
      description: 'Évaluez votre niveau de conscience fiscale',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      action: () => handleConsciousnessTest()
    },
    {
      id: 'optimization',
      title: 'Simulateur d\'Optimisation',
      description: 'Découvrez vos économies potentielles',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      action: () => setShowOptimizationModal(true)
    },
    {
      id: 'alerts',
      title: 'Alertes Fiscales',
      description: 'Restez informé des opportunités',
      icon: Bell,
      color: 'from-orange-500 to-orange-600',
      action: () => setShowAlertsModal(true)
    }
  ];

  // Charger le profil utilisateur au montage
  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          const profileResponse = await fetch(`/user-profile/${userData.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUserProfile(profileData);
            if (!profileData.has_completed_onboarding) {
              setShowOnboarding(true);
            }
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    checkUserProfile();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleOnboardingComplete = async (profileData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/user-profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
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
      attachments: selectedFiles
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setSelectedFiles([]);

    // Simuler une réponse de Francis
    setTimeout(() => {
      const francisResponse: ChatMessage = {
        role: 'assistant',
        content: "Merci pour votre message ! Je suis Francis, votre assistant fiscal. Comment puis-je vous aider aujourd'hui ?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, francisResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleTmiCalculation = async () => {
    if (!tmiForm.revenu_annuel) {
      alert('Veuillez saisir votre revenu annuel');
      return;
    }

    setIsLoadingTool(true);
    try {
      const response = await fetch('/api/tools/calculate-tmi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revenus_annuels: parseFloat(tmiForm.revenu_annuel),
          situation_familiale: tmiForm.situation_familiale,
          nombre_enfants: tmiForm.nombre_enfants,
          charges_deductibles: 0
        })
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
      const response = await fetch('/api/tools/simulate-optimization', {
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
      const response = await fetch('/api/tools/consciousness-test', {
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
      const response = await fetch('/api/tools/consciousness-test', {
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
      const response = await fetch('/api/tools/fiscal-alerts', {
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
      
      // Poser la question vocale si le mode vocal est activé
      if (voiceMode) {
        const questions = [
          "Parfait ! Maintenant, parlons de vos revenus et de votre activité. Quel est votre revenu principal annuel ?",
          "Excellent ! Maintenant, décrivons votre patrimoine immobilier. Êtes-vous propriétaire de votre résidence principale ?",
          "Très bien ! Parlons maintenant de vos objectifs et projets. Quels sont vos objectifs à court terme ?",
          "Parfait ! Évaluons maintenant votre niveau de connaissance fiscale et financière. Comment évaluez-vous votre niveau ?",
          "Excellent ! Maintenant, parlons de vos besoins spécifiques. Quelles sont vos questions prioritaires ?",
          "Très bien ! Enfin, quelles optimisations souhaitez-vous explorer ?",
          "Parfait ! Votre profil de découverte est maintenant complet. Francis peut vous donner des conseils ultra-personnalisés !"
        ];
        
        if (discoveryStep + 1 < questions.length) {
          setTimeout(() => {
            speakQuestion(questions[discoveryStep + 1]);
          }, 1000);
        }
      }
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

  // Fonctions pour la synthèse vocale de Francis
  const initializeSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      const synthesis = window.speechSynthesis;
      setSpeechSynthesis(synthesis);
      return synthesis;
    }
    return null;
  };

  const speakQuestion = (question: string) => {
    if (!speechSynthesis) {
      const synthesis = initializeSpeechSynthesis();
      if (!synthesis) {
        console.error('Synthèse vocale non supportée');
        return;
      }
    }

    // Arrêter toute parole en cours
    speechSynthesis?.cancel();

    const utterance = new SpeechSynthesisUtterance(question);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9; // Vitesse légèrement plus lente
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Choisir une voix française si disponible
    const voices = speechSynthesis?.getVoices() || [];
    const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    utterance.onstart = () => {
      setIsFrancisSpeaking(true);
    };

    utterance.onend = () => {
      setIsFrancisSpeaking(false);
      // Démarrer automatiquement l'enregistrement après que Francis ait fini de parler
      if (voiceMode) {
        setTimeout(() => {
          startRecording();
        }, 500);
      }
    };

    utterance.onerror = (event) => {
      console.error('Erreur de synthèse vocale:', event);
      setIsFrancisSpeaking(false);
    };

    speechSynthesis?.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis?.cancel();
    setIsFrancisSpeaking(false);
  };

  const toggleVoiceMode = () => {
    setVoiceMode(!voiceMode);
    if (voiceMode) {
      stopSpeaking();
      stopRecording();
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
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col max-w-6xl mx-auto p-4">
        {/* Navigation des onglets améliorée */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-[#1a2332]/60 backdrop-blur-sm border border-[#c5a572]/20 rounded-xl p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'chat' 
                  ? 'bg-[#c5a572] text-[#162238] shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1a2332]/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat Francis
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tools' 
                  ? 'bg-[#c5a572] text-[#162238] shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1a2332]/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Outils
              </div>
            </button>
            <button
              onClick={() => setActiveTab('discovery')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'discovery' 
                  ? 'bg-[#c5a572] text-[#162238] shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1a2332]/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Découverte
              </div>
            </button>
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

        {/* Onglet Découverte */}
        {activeTab === 'discovery' && (
          <div className="space-y-6">
            {/* Header avec progression */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Découvrez votre potentiel fiscal</h2>
              <p className="text-gray-400 mb-4">Répondez à quelques questions pour des conseils ultra-personnalisés</p>
              
              {/* Bouton pour compléter le profil avec Francis */}
              <div className="mb-6">
                <button
                  onClick={() => setShowDiscoveryExtraction(true)}
                  className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-3 justify-center mx-auto text-lg"
                >
                  <MessageSquare className="w-6 h-6" />
                  Compléter mon profil avec Francis
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Francis vous guide vocalement et remplit automatiquement votre profil
                </p>
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
                    <h3 className="text-xl font-semibold text-white">Compléter votre profil avec Francis</h3>
                    <button
                      onClick={() => {
                        setShowDiscoveryExtraction(false);
                        setDiscoveryTranscript('');
                        setExtractionResult(null);
                        setVoiceMode(false);
                        stopSpeaking();
                        stopRecording();
                      }}
                      className="text-gray-400 hover:text-white"
                      aria-label="Fermer la modal d'extraction"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Option 1: Mode vocal Francis */}
                    <div className="bg-[#162238] rounded-lg p-4 border border-[#c5a572]/20">
                      <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#c5a572]" />
                        Mode vocal Francis (Recommandé)
                      </h4>
                      <p className="text-gray-400 mb-4">
                        Francis pose les questions à haute voix et écoute vos réponses. Le plus simple et naturel !
                      </p>
                      <button
                        onClick={() => {
                          setVoiceMode(true);
                          setShowDiscoveryExtraction(false);
                          // Démarrer la première question vocale
                          setTimeout(() => {
                            speakQuestion("Bonjour ! Je suis Francis, votre assistant fiscal. Commençons par vos informations personnelles. Quel est votre âge ?");
                          }, 500);
                        }}
                        className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-3"
                      >
                        <Mic className="w-5 h-5" />
                        Commencer avec Francis
                      </button>
                    </div>

                    {/* Option 2: Transcription manuelle */}
                    <div className="bg-[#162238] rounded-lg p-4 border border-[#c5a572]/20">
                      <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#c5a572]" />
                        Coller une transcription
                      </h4>
                      <p className="text-gray-400 mb-4">
                        Collez la transcription d'une conversation existante avec votre CGP
                      </p>
                      <textarea
                        value={discoveryTranscript}
                        onChange={(e) => setDiscoveryTranscript(e.target.value)}
                        placeholder="Collez ici la transcription complète de votre conversation avec votre CGP..."
                        className="w-full h-32 p-3 bg-[#1a2332] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none resize-none mb-4"
                      />
                      <button
                        onClick={handleDiscoveryExtraction}
                        disabled={!discoveryTranscript.trim() || isExtractingDiscovery}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isExtractingDiscovery ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Extraction en cours...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            Extraire les informations
                          </>
                        )}
                      </button>
                    </div>
                    
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
    </div>
  );
} 