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
  MicOff,
  Volume2
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
  const { user, logout, isProfessional } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'profile'>('chat');
  const [showDiscoveryExtraction, setShowDiscoveryExtraction] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);
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
  const [discoveryData, setDiscoveryData] = useState<any>({});
  const [questionsQuota, setQuestionsQuota] = useState<{
    questions_used: number;
    questions_remaining: number;
    quota_limit: number;
    unlimited?: boolean;
  } | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isFrancisSpeaking, setIsFrancisSpeaking] = useState(false);
  const [discoveryProgress, setDiscoveryProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  // Charger le profil utilisateur au montage
  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        if (!user?.id) {
          navigate('/');
          return;
        }

        const response = await fetch(`/user-profile/${user.id}`, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const profileData = await response.json();
          setUserProfile(profileData);
          if (!profileData.has_completed_onboarding) {
            setShowOnboarding(true);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    checkUserProfile();
    loadQuestionsQuota();
  }, [user, navigate]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleOnboardingComplete = async (profileData: any) => {
    try {
      if (!user?.id) {
        console.error('Utilisateur non authentifié : impossible d\'enregistrer le profil.');
        return;
      }
      const payload = {
        auth_user_id: user.id, // UUID Supabase Auth
        ...profileData,
      };

      const response = await fetch('/user-profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
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

    const userMessageContent = inputMessage;
    const newMessage: ChatMessage = {
      role: 'user',
      content: userMessageContent,
      timestamp: new Date(),
      attachments: selectedFiles
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setInputMessage('');
    setSelectedFiles([]);
    setIsLoading(true);

    const historyForApi = newMessages.slice(0, -1).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      const response = await apiClient<any>('/api/test-francis', {
        method: 'POST',
        data: {
          question: userMessageContent,
          conversation_history: historyForApi
        },
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.answer || "Désolé, je n'ai pas pu obtenir de réponse.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err: any) {
      console.error("Erreur lors de la communication avec Francis:", err);
      const errorMessage = err.data?.detail || err.message || "Désolé, une erreur s'est produite.";
      const errorResponse: ChatMessage = {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
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
        
        // Afficher le résultat dans une modal détaillée au lieu d'une alerte
        const resultModal = document.createElement('div');
        resultModal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        resultModal.innerHTML = `
          <div class="bg-[#1a2332] border border-[#c5a572]/20 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-white">Résultats TMI 2025</h3>
              <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div class="space-y-6">
              <!-- Résumé principal -->
              <div class="bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/10 border border-[#c5a572]/20 rounded-lg p-4">
                <div class="text-center">
                  <div class="text-3xl font-bold text-[#c5a572] mb-2">${result.tmi}%</div>
                  <div class="text-white font-medium">Taux Marginal d'Imposition</div>
                  <div class="text-gray-400 text-sm">Barème 2025</div>
                </div>
              </div>
              
              <!-- Détails du calcul -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-[#162238] rounded-lg p-4">
                  <h4 class="font-medium text-white mb-2">Revenu imposable</h4>
                  <div class="text-2xl font-bold text-[#c5a572]">${result.revenu_imposable.toLocaleString('fr-FR')}€</div>
                </div>
                <div class="bg-[#162238] rounded-lg p-4">
                  <h4 class="font-medium text-white mb-2">Impôt estimé</h4>
                  <div class="text-2xl font-bold text-[#c5a572]">${result.impot_estime.toLocaleString('fr-FR')}€</div>
                </div>
                <div class="bg-[#162238] rounded-lg p-4">
                  <h4 class="font-medium text-white mb-2">Taux moyen</h4>
                  <div class="text-2xl font-bold text-[#c5a572]">${result.taux_moyen.toFixed(1)}%</div>
                </div>
                <div class="bg-[#162238] rounded-lg p-4">
                  <h4 class="font-medium text-white mb-2">Année fiscale</h4>
                  <div class="text-2xl font-bold text-[#c5a572]">2025</div>
                </div>
              </div>
              
              <!-- Tranches applicables -->
              ${result.tranches_applicables.length > 0 ? `
                <div>
                  <h4 class="font-medium text-white mb-3">Détail des tranches</h4>
                  <div class="space-y-2">
                    ${result.tranches_applicables.map(tranche => `
                      <div class="flex justify-between items-center bg-[#162238] rounded-lg p-3">
                        <div>
                          <div class="text-white font-medium">${tranche.tranche}</div>
                          <div class="text-gray-400 text-sm">Base: ${tranche.base_imposable}</div>
                        </div>
                        <div class="text-right">
                          <div class="text-[#c5a572] font-bold">${tranche.taux}</div>
                          <div class="text-gray-400 text-sm">${tranche.impot_tranche}</div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
              
              <!-- Conseils d'optimisation -->
              <div>
                <h4 class="font-medium text-white mb-3">Conseils d'optimisation 2025</h4>
                <div class="space-y-2">
                  ${result.conseils_optimisation.map(conseil => `
                    <div class="flex items-start gap-3 bg-[#162238] rounded-lg p-3">
                      <div class="text-[#c5a572] text-lg">${conseil.split(' ')[0]}</div>
                      <div class="text-gray-300 text-sm">${conseil.substring(conseil.indexOf(' ') + 1)}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(resultModal);
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
      const response = await fetch('/user-profile/', {
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

  // Fonctions pour l'enregistrement vocal
  const startRecording = async () => {
    console.log('🎙️ startRecording appelée');
    try {
      console.log('🔐 Demande d\'accès au microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Accès au microphone accordé');
      
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        console.log('📦 Données audio reçues:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        console.log('🛑 Enregistrement arrêté, traitement des données...');
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        console.log('🎵 Blob audio créé:', audioBlob.size, 'bytes');
        setAudioChunks(chunks);
        setIsTranscribing(true);
        
        // Envoyer l'audio au backend pour transcription
        await transcribeAudio(audioBlob);
      };

      console.log('▶️ Démarrage de l\'enregistrement...');
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      console.log('✅ Enregistrement démarré avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du démarrage de l\'enregistrement:', error);
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
      // Convertir l'audio en base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));

      const response = await fetch('/api/whisper/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_base64: base64Audio,
          audio_format: 'wav',
          language: 'fr'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Si on est en mode vocal Francis, traiter la réponse
        if (voiceMode && result.text) {
          // Analyser la réponse vocale et mettre à jour les données de découverte
          await processVoiceResponse(result.text);
        }
        
        setExtractionResult({
          text: result.text,
          confiance: result.language_probability || 0.8,
          validation_notes: []
        });
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

  // Nouvelle fonction pour traiter les réponses vocales
  const processVoiceResponse = async (transcribedText: string) => {
    try {
      console.log('🧠 Traitement de la réponse:', transcribedText);
      
      // Traitement local rapide pour les réponses simples
      const text = transcribedText.toLowerCase();
      let processedResponse = transcribedText;
      
      // Extraction rapide des informations communes
      if (discoveryStep === 0) { // Âge
        const ageMatch = text.match(/(\d+)/);
        if (ageMatch) {
          updateDiscoveryData('age', ageMatch[1]);
          processedResponse = `${ageMatch[1]} ans`;
        }
      } else if (discoveryStep === 1) { // Situation familiale
        if (text.includes('marié') || text.includes('marie')) {
          updateDiscoveryData('situation_familiale', 'marie');
          processedResponse = 'Marié(e)';
        } else if (text.includes('célibataire') || text.includes('celibataire')) {
          updateDiscoveryData('situation_familiale', 'celibataire');
          processedResponse = 'Célibataire';
        }
      } else if (discoveryStep === 2) { // Enfants
        const enfantsMatch = text.match(/(\d+)/);
        if (enfantsMatch) {
          updateDiscoveryData('nombre_enfants', parseInt(enfantsMatch[1]));
          processedResponse = `${enfantsMatch[1]} enfant${parseInt(enfantsMatch[1]) > 1 ? 's' : ''}`;
        } else if (text.includes('aucun') || text.includes('pas') || text.includes('zero') || text.includes('zéro')) {
          updateDiscoveryData('nombre_enfants', 0);
          processedResponse = 'Aucun enfant';
        }
      }
      
      // Ajouter la conversation au chat pour le suivi
      setMessages(prev => [...prev, {
        role: 'user',
        content: processedResponse,
        timestamp: new Date()
      }]);

      // Passer à la question suivante rapidement
      setTimeout(() => {
        askNextVoiceQuestion();
      }, 800); // Délai très réduit pour plus de fluidité
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement de la réponse vocale:', error);
      // En cas d'erreur, continuer quand même
      setTimeout(() => {
        askNextVoiceQuestion();
      }, 1000);
    }
  };

  // Fonction pour poser la question suivante
  const askNextVoiceQuestion = () => {
    const questions = [
      "Quel est votre âge ?",
      "Parfait ! Quelle est votre situation familiale ?",
      "Combien d'enfants avez-vous à charge ?",
      "Quel est votre revenu annuel brut ?",
      "Êtes-vous propriétaire de votre résidence principale ?",
      "Quels sont vos principaux objectifs fiscaux ?"
    ];

    if (discoveryStep < questions.length - 1) {
      setDiscoveryStep(discoveryStep + 1);
      // Transition fluide avec délai réduit
      setTimeout(() => {
        speakQuestion(questions[discoveryStep + 1]);
      }, 500); // Délai réduit pour plus de fluidité
    } else {
      // Fin du parcours vocal
      speakQuestion("Parfait ! J'ai toutes les informations. Je prépare vos recommandations personnalisées...");
      setTimeout(() => {
        setVoiceMode(false);
        setShowDiscoveryExtraction(false);
        // Traiter les données complètes
        handleDiscoveryComplete();
      }, 2000); // Délai réduit
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
    console.log('🎤 speakQuestion appelée avec:', question);
    
    if (!speechSynthesis) {
      console.log('🔧 Initialisation de la synthèse vocale...');
      const synthesis = initializeSpeechSynthesis();
      if (!synthesis) {
        console.error('❌ Synthèse vocale non supportée');
        alert('La synthèse vocale n\'est pas supportée par votre navigateur.');
        return;
      }
    }

    // Arrêter toute parole en cours
    speechSynthesis?.cancel();
    console.log('🛑 Parole précédente annulée');

    const utterance = new SpeechSynthesisUtterance(question);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9; // Vitesse légèrement plus lente
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Choisir une voix française si disponible
    const voices = speechSynthesis?.getVoices() || [];
    console.log('🗣️ Voix disponibles:', voices.map(v => `${v.name} (${v.lang})`));
    const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
    if (frenchVoice) {
      utterance.voice = frenchVoice;
      console.log('✅ Voix française sélectionnée:', frenchVoice.name);
    } else {
      console.log('⚠️ Aucune voix française trouvée, utilisation de la voix par défaut');
    }

    utterance.onstart = () => {
      console.log('🎤 Francis commence à parler');
      setIsFrancisSpeaking(true);
    };

    utterance.onend = () => {
      console.log('🔇 Francis a fini de parler');
      setIsFrancisSpeaking(false);
      // Démarrer automatiquement l'enregistrement après que Francis ait fini de parler
      if (voiceMode) {
        console.log('⏰ Démarrage de l\'enregistrement dans 1 seconde...');
        setTimeout(() => {
          console.log('🎙️ Démarrage de l\'enregistrement...');
          startRecording();
        }, 1000); // Délai plus long pour laisser le temps à l'utilisateur de se préparer
      }
    };

    utterance.onerror = (event) => {
      console.error('❌ Erreur de synthèse vocale:', event);
      setIsFrancisSpeaking(false);
      // En cas d'erreur, essayer de redémarrer l'enregistrement
      if (voiceMode) {
        console.log('🔄 Tentative de redémarrage de l\'enregistrement après erreur...');
        setTimeout(() => {
          startRecording();
        }, 1000);
      }
    };

    console.log('🗣️ Lancement de la synthèse vocale...');
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

  // Fonction pour récupérer le quota de questions
  const loadQuestionsQuota = async () => {
    try {
      const response = await fetch('/api/questions/quota', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const quotaData = await response.json();
        setQuestionsQuota(quotaData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du quota:', error);
    }
  };

  // Fonction pour mettre à jour le profil utilisateur
  const updateUserProfile = async (field: string, value: any) => {
    if (!user?.id) {
      console.error('Utilisateur non authentifié');
      return;
    }

    try {
      // Mise à jour locale immédiate pour l'UI
      setUserProfile(prev => prev ? { ...prev, [field]: value } : null);

      // Sauvegarde sur Supabase
      const response = await fetch(`/user-profile/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          [field]: value
        })
      });

      if (!response.ok) {
        console.error('Erreur lors de la sauvegarde du profil');
        // Revenir à l'état précédent en cas d'erreur
        setUserProfile(prev => prev ? { ...prev, [field]: userProfile?.[field as keyof UserProfile] } : null);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      // Revenir à l'état précédent en cas d'erreur
      setUserProfile(prev => prev ? { ...prev, [field]: userProfile?.[field as keyof UserProfile] } : null);
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
            <div className="relative inline-flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
              <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
            </div>
            <span className="text-xl font-bold text-white">Francis</span>
          </div>
          <div className="flex items-center gap-4">
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
        {/* Navigation onglets */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'chat' 
                  ? 'bg-[#c5a572] text-[#162238] shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1a2332]/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <MessageSquare className="w-4 h-4" />
                  <Euro className="w-2.5 h-2.5 absolute -bottom-1 -right-1" />
                </div>
                Francis, votre copilote
              </div>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'profile' 
                  ? 'bg-[#c5a572] text-[#162238] shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1a2332]/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Mon Profil
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

        {/* Onglet Mon Profil */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Mon Profil</h2>
              <p className="text-xl text-gray-400 mb-6">Gérez vos informations personnelles et vos préférences.</p>
            </div>

            <div className="bg-gradient-to-br from-[#1a2332] to-[#162238] border border-[#c5a572]/20 rounded-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Informations Personnelles</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input 
                        type="email" 
                        value={user?.email || ''} 
                        disabled 
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-gray-400" 
                        aria-label="Email de l'utilisateur"
                      />
                    </div>
                    <div>
                      <label htmlFor="situation-familiale" className="block text-sm font-medium text-gray-300 mb-2">Situation familiale</label>
                      <select 
                        id="situation-familiale"
                        value={userProfile?.situation_familiale || 'celibataire'} 
                        onChange={(e) => updateUserProfile('situation_familiale', e.target.value)}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg"
                        aria-label="Sélectionner la situation familiale"
                      >
                        <option value="celibataire">Célibataire</option>
                        <option value="marie">Marié(e) / PACS</option>
                        <option value="veuf">Veuf(ve)</option>
                        <option value="divorce">Divorcé(e)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="nombre-enfants" className="block text-sm font-medium text-gray-300 mb-2">Nombre d'enfants</label>
                      <input 
                        id="nombre-enfants"
                        type="number" 
                        value={userProfile?.nombre_enfants || 0} 
                        onChange={(e) => updateUserProfile('nombre_enfants', parseInt(e.target.value) || 0)}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg" 
                        placeholder="0"
                        aria-label="Nombre d'enfants à charge"
                      />
                    </div>
                  </div>
                </div>

                {/* Informations fiscales */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Informations Fiscales</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="tmi" className="block text-sm font-medium text-gray-300 mb-2">TMI (%)</label>
                      <input 
                        id="tmi"
                        type="number" 
                        value={userProfile?.tmi || ''} 
                        onChange={(e) => updateUserProfile('tmi', parseFloat(e.target.value) || null)}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg" 
                        placeholder="Taux marginal d'imposition"
                        aria-label="Taux marginal d'imposition"
                      />
                    </div>
                    <div>
                      <label htmlFor="revenus-annuels" className="block text-sm font-medium text-gray-300 mb-2">Revenus annuels (€)</label>
                      <input 
                        id="revenus-annuels"
                        type="number" 
                        value={userProfile?.revenus_annuels || ''} 
                        onChange={(e) => updateUserProfile('revenus_annuels', parseFloat(e.target.value) || null)}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg" 
                        placeholder="0"
                        aria-label="Revenus annuels"
                      />
                    </div>
                    <div>
                      <label htmlFor="charges-deductibles" className="block text-sm font-medium text-gray-300 mb-2">Charges déductibles (€)</label>
                      <input 
                        id="charges-deductibles"
                        type="number" 
                        value={userProfile?.charges_deductibles || ''} 
                        onChange={(e) => updateUserProfile('charges_deductibles', parseFloat(e.target.value) || null)}
                        className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg" 
                        placeholder="0"
                        aria-label="Charges déductibles"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Quota de Questions */}
              {questionsQuota && (
                <div className="mt-6 pt-6 border-t border-[#c5a572]/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#c5a572]" />
                    Quota de Questions
                  </h3>
                  <div className="bg-[#162238] rounded-lg p-4 border border-[#c5a572]/20">
                    {questionsQuota.unlimited ? (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-white font-medium">Accès illimité (Compte Pro)</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Questions utilisées ce mois</span>
                          <span className="text-white font-medium">{questionsQuota.questions_used} / {questionsQuota.quota_limit}</span>
                        </div>
                        <div className="w-full bg-[#1a2332] rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              questionsQuota.questions_remaining > 10 
                                ? 'bg-gradient-to-r from-green-500 to-green-400' 
                                : questionsQuota.questions_remaining > 5 
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                                : 'bg-gradient-to-r from-red-500 to-red-400'
                            }`}
                            style={{ width: `${(questionsQuota.questions_used / questionsQuota.quota_limit) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Restantes</span>
                          <span className={`font-medium ${
                            questionsQuota.questions_remaining > 10 
                              ? 'text-green-400' 
                              : questionsQuota.questions_remaining > 5 
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}>
                            {questionsQuota.questions_remaining} questions
                          </span>
                        </div>
                        {questionsQuota.questions_remaining <= 5 && (
                          <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                            <p className="text-yellow-300 text-sm">
                              ⚠️ Attention : Il ne vous reste que {questionsQuota.questions_remaining} questions ce mois-ci.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-[#c5a572]/20">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Actions</h3>
                    <p className="text-gray-400 text-sm">Gérez votre compte et vos préférences</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/change-password')}
                      className="px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                      Changer le mot de passe
                    </button>
                    <button
                      onClick={() => setShowOnboarding(true)}
                      className="px-6 py-3 bg-[#162238] text-white rounded-lg hover:bg-[#1a2332] transition-all"
                    >
                      Modifier le profil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'extraction automatique */}
        {showDiscoveryExtraction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2332] border border-[#c5a572]/20 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative inline-flex items-center justify-center group">
                    <MessageSquare className="w-5 h-5 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
                    <Euro className="w-3.5 h-3.5 text-[#c5a572] absolute -bottom-1 -right-1 transition-transform group-hover:scale-110 duration-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Francis</h3>
                    <p className="text-sm text-gray-400">Votre copilote</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDiscoveryExtraction(false);
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
                {/* Mode vocal Francis uniquement */}
                <div className="bg-[#162238] rounded-lg p-4 border border-[#c5a572]/20">
                  <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    <div className="relative inline-flex items-center justify-center group">
                      <MessageSquare className="w-5 h-5 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
                      <Euro className="w-3.5 h-3.5 text-[#c5a572] absolute -bottom-1 -right-1 transition-transform group-hover:scale-110 duration-300" />
                    </div>
                    Discussion vocale avec Francis
                  </h4>
                  <p className="text-gray-400 mb-4">
                    Francis pose les questions à haute voix et écoute vos réponses. Cette approche naturelle permet une analyse plus précise de votre situation et des conseils ultra-personnalisés pour optimiser votre fiscalité.
                  </p>
                  
                  {/* Indicateurs visuels pour le mode vocal */}
                  {voiceMode && (
                    <div className="mb-4 p-3 bg-[#1a2332] rounded-lg border border-[#c5a572]/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#c5a572]">Mode vocal actif</span>
                        <div className="flex items-center gap-2">
                          {isFrancisSpeaking && (
                            <div className="flex items-center gap-1 text-blue-400">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                              <span className="text-xs">Francis parle...</span>
                            </div>
                          )}
                          {isRecording && (
                            <div className="flex items-center gap-1 text-red-400">
                              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                              <span className="text-xs">Enregistrement...</span>
                            </div>
                          )}
                          {isTranscribing && (
                            <div className="flex items-center gap-1 text-yellow-400">
                              <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-xs">Transcription...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Barre de progression du parcours vocal */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Étape {discoveryStep + 1} sur 6</span>
                          <span>{Math.round(((discoveryStep + 1) / 6) * 100)}%</span>
                        </div>
                        <div className="w-full bg-[#1a2332] rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((discoveryStep + 1) / 6) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Question actuelle */}
                      <div className="text-sm text-gray-300 bg-[#1a2332]/50 p-2 rounded">
                        <span className="font-medium text-[#c5a572]">Question actuelle :</span>
                        <p className="mt-1">
                          {discoveryStep === 0 && "Quel est votre âge ?"}
                          {discoveryStep === 1 && "Quelle est votre situation familiale ?"}
                          {discoveryStep === 2 && "Combien d'enfants avez-vous à charge ?"}
                          {discoveryStep === 3 && "Quel est votre revenu annuel brut ?"}
                          {discoveryStep === 4 && "Êtes-vous propriétaire de votre résidence principale ?"}
                          {discoveryStep === 5 && "Quels sont vos principaux objectifs fiscaux ?"}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    {!voiceMode ? (
                      <button
                        onClick={async () => {
                          console.log('🚀 Démarrage du mode vocal superfluide...');
                          
                          // Test rapide des capacités avant de commencer
                          try {
                            // Vérifier l'accès au microphone immédiatement
                            await navigator.mediaDevices.getUserMedia({ audio: true });
                            console.log('✅ Microphone OK');
                            
                            // Vérifier la synthèse vocale
                            if (!('speechSynthesis' in window)) {
                              throw new Error('Synthèse vocale non supportée');
                            }
                            console.log('✅ Synthèse vocale OK');
                            
                            // Démarrer le mode vocal
                            setVoiceMode(true);
                            setDiscoveryStep(0);
                            
                            // Message de bienvenue et démarrage automatique
                            setTimeout(() => {
                              speakQuestion("Bonjour ! Je suis Francis. Je vais vous poser quelques questions pour optimiser votre fiscalité. Commençons : quel est votre âge ?");
                            }, 100);
                            
                          } catch (error) {
                            console.error('❌ Erreur lors de l\'initialisation:', error);
                            alert('Pour utiliser le mode vocal, vous devez autoriser l\'accès au microphone. Cliquez sur "Autoriser" quand votre navigateur vous le demande.');
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-3 text-lg"
                      >
                        <Mic className="w-6 h-6" />
                        Discuter avec Francis (Mode Vocal)
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setVoiceMode(false);
                            stopSpeaking();
                            stopRecording();
                            setDiscoveryStep(0);
                          }}
                          className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-all flex items-center justify-center gap-3"
                        >
                          <MicOff className="w-5 h-5" />
                          Arrêter
                        </button>
                        <button
                          onClick={() => {
                            if (isFrancisSpeaking) {
                              stopSpeaking();
                            } else if (!isRecording) {
                              speakQuestion("Pouvez-vous répéter votre réponse ?");
                            }
                          }}
                          className="px-4 py-3 bg-[#1a2332] border border-[#c5a572]/20 text-[#c5a572] rounded-xl hover:bg-[#1a2332]/80 transition-all"
                          title="Répéter la question"
                          aria-label="Répéter la question"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
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

        {/* Modales pour les outils */}
        {/* Modal Calculateur TMI */}
        {showTmiModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2332] border border-[#c5a572]/20 rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Calculateur TMI 2025</h3>
                <button
                  onClick={() => setShowTmiModal(false)}
                  className="text-gray-400 hover:text-white"
                  title="Fermer la modal"
                  aria-label="Fermer la modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Revenu annuel (€)</label>
                  <input
                    type="number"
                    value={tmiForm.revenu_annuel}
                    onChange={(e) => setTmiForm({...tmiForm, revenu_annuel: e.target.value})}
                    className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                    placeholder="Ex: 45000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Situation familiale</label>
                  <select
                    value={tmiForm.situation_familiale}
                    onChange={(e) => setTmiForm({...tmiForm, situation_familiale: e.target.value})}
                    className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                    title="Sélectionner votre situation familiale"
                    aria-label="Situation familiale"
                  >
                    <option value="celibataire">Célibataire</option>
                    <option value="marie">Marié(e)</option>
                    <option value="pacs">PACS</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre d'enfants</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={tmiForm.nombre_enfants}
                    onChange={(e) => setTmiForm({...tmiForm, nombre_enfants: parseInt(e.target.value)})}
                    className="w-full p-3 bg-[#162238] border border-[#c5a572]/20 rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                    placeholder="0"
                  />
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
            </div>
          </div>
        )}

        {/* Modal Test de Conscience */}
        {showConsciousnessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2332] border border-[#c5a572]/20 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Test de Conscience Fiscale</h3>
                <button
                  onClick={() => setShowConsciousnessModal(false)}
                  className="text-gray-400 hover:text-white"
                  title="Fermer la modal"
                  aria-label="Fermer la modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {testQuestions && !isTestComplete ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-400">Question {currentQuestionIndex + 1} sur {Object.keys(testQuestions).length}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">
                      {(Object.values(testQuestions)[currentQuestionIndex] as any)?.question}
                    </h4>
                    
                    <div className="space-y-3">
                      {Object.entries((Object.values(testQuestions)[currentQuestionIndex] as any)?.reponses || {}).map(([key, value]: [string, any]) => (
                        <label key={key} className="flex items-center p-3 bg-[#162238] rounded-lg cursor-pointer hover:bg-[#162238]/80">
                          <input
                            type="radio"
                            name={`question_${currentQuestionIndex}`}
                            value={key}
                            checked={testReponses[Object.keys(testQuestions)[currentQuestionIndex]] === key}
                            onChange={() => handleQuestionResponse(Object.keys(testQuestions)[currentQuestionIndex], key)}
                            className="mr-3 text-[#c5a572] bg-[#162238] border-[#c5a572]/20 focus:ring-[#c5a572]"
                          />
                          <span className="text-gray-300">{value.texte}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={previousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 border border-[#c5a572]/20 text-[#c5a572] rounded-lg hover:bg-[#c5a572]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    
                    <button
                      onClick={nextQuestion}
                      disabled={!testReponses[Object.keys(testQuestions)[currentQuestionIndex]]}
                      className="px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentQuestionIndex === Object.keys(testQuestions).length - 1 ? 'Terminer' : 'Suivant'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Résultats du test */}
        {showTestResults && testResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2332] border border-[#c5a572]/20 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Résultats du Test</h3>
                <button
                  onClick={() => setShowTestResults(false)}
                  className="text-gray-400 hover:text-white"
                  title="Fermer la modal"
                  aria-label="Fermer la modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#c5a572]/20 to-[#e8cfa0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-[#c5a572]">{testResult.pourcentage}%</span>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">{testResult.niveau_conscience}</h4>
                  <p className="text-gray-400">Score: {testResult.score_total}/{testResult.score_maximum}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-white mb-2">Recommandations :</h5>
                    <ul className="space-y-2">
                      {testResult.recommandations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-[#c5a572] rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-300 text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-white mb-2">Prochaines étapes :</h5>
                    <ul className="space-y-2">
                      {testResult.prochaines_etapes.map((etape: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-[#c5a572] rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-300 text-sm">{etape}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={restartTest}
                    className="flex-1 px-4 py-2 border border-[#c5a572]/20 text-[#c5a572] rounded-lg hover:bg-[#c5a572]/10 transition-colors"
                  >
                    Recommencer
                  </button>
                  <button
                    onClick={() => setShowTestResults(false)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all font-medium"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 