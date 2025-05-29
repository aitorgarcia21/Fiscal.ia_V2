import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  Settings, 
  Menu, 
  X, 
  Send, 
  FileText, 
  PieChart,
  ChevronRight,
  Bell,
  Search,
  Plus,
  User,
  UserCircle,
  Briefcase,
  Scale,
  PiggyBank,
  Target,
  Euro,
  Loader2,
  Upload,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Receipt,
  CreditCard,
  Calculator,
  LogOut,
  Home,
  Users,
  Building2,
  Zap,
  Globe,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, UserProfile } from '../lib/supabase';
import { UserDiscovery } from '../components/UserDiscovery';
import { AdaptiveProfiler } from '../components/AdaptiveProfiler';
import { InitialProfileQuestions } from '../components/InitialProfileQuestions';
import { ProfileSummary } from '../components/ProfileSummary';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TrueLayerSuccessData {
  accessToken: string;
  provider: {
    id: string;
    display_name: string;
  };
}

interface TrueLayerError {
  error: string;
  error_description: string;
}

declare global {
  interface Window {
    TrueLayer: any;
  }
}

const initialProfileData: Partial<UserProfile> = {
  situation: '',
  revenus: '',
  patrimoine: '',
  objectifs: [],
  tolerance_risque: '',
  horizon_investissement: '',
  nombre_enfants: 0,
  ages_enfants: '',
  type_revenus: [],
  autres_revenus: '',
  situation_professionnelle: '',
  statut_fiscal: '',
  regime_imposition: '',
  investissements_existants: [],
  projets_immobiliers: '',
  besoins_retraite: '',
  situation_familiale: '',
  localisation: '',
  zone_fiscale: '',
  secteur_activite: '',
  revenus_passifs: '',
  dettes: '',
  objectifs_financiers: [],
  contraintes_fiscales: [],
  composition_patrimoine: [],
  is_active: false,
  
  // Nouveaux champs pour le questionnaire détaillé
  date_naissance: '',
  personnes_charge: '',
  type_contrat: '',
  societes_detenues: '',
  tmi: '',
  endettement: '',
};

export function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Bonjour ! Je suis Francis, votre assistant expert en fiscalité française, développé par Fiscal.ia. 🤖\n\nFort de ma connaissance approfondie des textes officiels (Code Général des Impôts, BOFIP), je suis à votre disposition pour :\n• Optimiser vos impôts et déclarations\n• Analyser vos documents fiscaux (avis d'imposition, etc.)\n• Répondre à toutes vos questions sur la fiscalité française\n\nComment puis-je vous aider aujourd'hui ? Vous pouvez me poser une question directement, ou choisir un parcours d'accompagnement si vous le souhaitez.`
    }
  ]);
  const [activeTab, setActiveTab] = useState('chat');
  const [profileData, setProfileData] = useState<Partial<UserProfile>>(initialProfileData);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [showInitialQuestions, setShowInitialQuestions] = useState(false);
  const [selectedProfileType, setSelectedProfileType] = useState<string | null>(null);
  const [adaptiveProfileData, setAdaptiveProfileData] = useState<any>(null);
  const [detectedProfile, setDetectedProfile] = useState<any>(null);
  const [chatMode, setChatMode] = useState('libre');
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedBanks, setConnectedBanks] = useState<string[]>([]);
  const [bankData, setBankData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    type: string;
    status: 'processing' | 'success' | 'error';
    data?: any;
  }>>([]);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const suggestedQuestions = [
    "Comment optimiser ma déclaration d'impôts ?",
    "Quelles sont les stratégies de défiscalisation pour 2024 ?",
    "Je suis auto-entrepreneur, comment gérer ma TVA ?",
    "Quels avantages fiscaux pour un investissement locatif Pinel ?"
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const calculateProgress = () => {
    const requiredFields: (keyof UserProfile)[] = [
      'situation_familiale', 'nombre_enfants'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = profileData[field];
      if (field === 'nombre_enfants') {
        return value !== undefined && value !== null;
      }
      return value !== undefined && value !== null && value !== '';
    }).length;
    
    if (requiredFields.length === 0) return 100;

    return Math.round((completedFields / requiredFields.length) * 100);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        await loadUserProfile(session.user.id);
      } else {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const loadUserProfile = async (currentUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', currentUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfileData(data);
        const progress = calculateProgress();
        setProfileCompleted(progress > 80);
      } else {
        setProfileData(initialProfileData);
        setProfileCompleted(false);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setProfileData(initialProfileData);
      setProfileCompleted(false);
    }
  };

  const saveUserProfile = async (currentProfileData: Partial<UserProfile>) => {
    if (!userId) return;
    try {
      console.log('💾 Sauvegarde du profil utilisateur:', currentProfileData);
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ ...currentProfileData, user_id: userId, updated_at: new Date().toISOString() });
      
      if (error) {
        console.error('❌ Erreur Supabase:', error);
        throw error;
      }
      
      console.log('✅ Profil sauvegardé avec succès');
      setProfileData(currentProfileData);
      const progress = calculateProgress();
      setProfileCompleted(progress > 80);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
    }
  };

  const saveAdaptiveProfile = async (adaptiveData: any, detectedProfile: any) => {
    if (!userId) return;
    
    try {
      const mappedProfile: Partial<UserProfile> = {
        situation_professionnelle: adaptiveData.activite_principale || profileData.situation_professionnelle,
        situation_familiale: adaptiveData.situation_familiale || profileData.situation_familiale,
        nombre_enfants: adaptiveData.nb_enfants || profileData.nombre_enfants,
        secteur_activite: adaptiveData.secteur_activite || profileData.secteur_activite,
        
        revenus: adaptiveData.revenu_brut_annuel ? `${adaptiveData.revenu_brut_annuel}€/an` : 
                 adaptiveData.ca_annuel ? `${adaptiveData.ca_annuel}€/an (CA)` :
                 adaptiveData.pension_brute ? `${adaptiveData.pension_brute}€/an (pension)` :
                 profileData.revenus,
        
        type_revenus: [
          ...(adaptiveData.revenus_passifs || []),
          ...(adaptiveData.epargne_salariale || []),
          ...(adaptiveData.autres_revenus_retraite || [])
        ].filter(Boolean),
        
        statut_fiscal: detectedProfile.priorite_affichage[0] || profileData.statut_fiscal,
        regime_imposition: adaptiveData.regime_fiscal_societe || 
                         adaptiveData.regime_fiscal_independant || 
                         profileData.regime_imposition,
        
        patrimoine: adaptiveData.patrimoine_total_estime ? 
                   `${adaptiveData.patrimoine_total_estime}€` : 
                   profileData.patrimoine,
        
        investissements_existants: [
          ...(adaptiveData.statuts_juridiques || []),
          ...(adaptiveData.typologie_biens || []),
          ...(adaptiveData.mode_detention || [])
        ].filter(Boolean),
        
        revenus_passifs: adaptiveData.revenus_fonciers_bruts ? 
                       `${adaptiveData.revenus_fonciers_bruts}€/an (foncier)` :
                       adaptiveData.dividendes_verses ? 
                       `${adaptiveData.dividendes_verses}€/an (dividendes)` :
                       profileData.revenus_passifs,
        
        localisation: adaptiveData.pays_residence || 
                     adaptiveData.juridiction_fiscale || 
                     profileData.localisation,
        zone_fiscale: adaptiveData.juridiction_fiscale || profileData.zone_fiscale,
        
        objectifs_financiers: adaptiveData.objectifs_patrimoniaux || 
                            profileData.objectifs_financiers || [],
        
        interaction_history: [
          ...(profileData.interaction_history || []),
          {
            question: 'Profil adaptatif détecté',
            response: `Profil principal: ${getProfileLabel(detectedProfile.priorite_affichage[0])} (${detectedProfile.score_total[detectedProfile.priorite_affichage[0]]}% de compatibilité)`,
            timestamp: new Date().toISOString(),
            insights: [
              {
                type: 'profile_detection',
                value: JSON.stringify({
                  detectedProfile,
                  adaptiveData,
                  variables_determinantes: detectedProfile.variables_determinantes
                }),
                confidence: detectedProfile.confiance_detection
              }
            ]
          }
        ]
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert({ 
          ...profileData, 
          ...mappedProfile, 
          user_id: userId, 
          updated_at: new Date().toISOString() 
        });

      if (error) throw error;

      setProfileData(prev => ({ ...prev, ...mappedProfile }));
      setAdaptiveProfileData(adaptiveData);
      setDetectedProfile(detectedProfile);
      
      if (detectedProfile.confiance_detection >= 70) {
        setProfileCompleted(true);
      }

      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `🎯 **Profil fiscal détecté et sauvegardé !**\n\n**Profil principal :** ${getProfileLabel(detectedProfile.priorite_affichage[0])}\n**Confiance :** ${detectedProfile.confiance_detection}%\n\nVotre profil fiscal a été automatiquement mis à jour. Je peux maintenant vous donner des conseils ultra-personnalisés !` 
      }]);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil adaptatif:', error);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'Erreur lors de la sauvegarde du profil détecté. Vos données sont temporairement conservées en mémoire.' 
      }]);
    }
  };

  const getProfileLabel = (profile: string) => {
    const labels: { [key: string]: string } = {
      dirigeant_IS: 'Dirigeant IS',
      salarie: 'Salarié',
      independant: 'Indépendant',
      investisseur_immobilier: 'Investisseur Immobilier',
      expatrie: 'Expatrié',
      retraite: 'Retraité'
    };
    return labels[profile] || profile;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsLoading(true);
    
    try {
      // Analyser le profil fiscal automatiquement
      const detectedProfileType = analyzeProfileFromForm(profileData);
      
      // Créer un profil détecté simulé
      const mockDetectedProfile = {
        priorite_affichage: [detectedProfileType.primary],
        profils_actifs: detectedProfileType.all,
        score_total: detectedProfileType.scores,
        confiance_detection: detectedProfileType.confidence,
        variables_determinantes: detectedProfileType.factors
      };

      // Sauvegarder le profil
      await saveUserProfile(profileData);
      setDetectedProfile(mockDetectedProfile);
      setAdaptiveProfileData(profileData);
      
      // Message de confirmation
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `🎯 **Analyse de profil terminée !**\n\n**Profil principal détecté :** ${getProfileLabel(detectedProfileType.primary)}\n**Niveau de confiance :** ${detectedProfileType.confidence}%\n\nBasé sur vos réponses, je peux maintenant vous donner des conseils fiscaux ultra-personnalisés ! N'hésitez pas à me poser des questions spécifiques.` 
      }]);
      
      setActiveTab('chat'); // Rediriger vers le chat
    } catch (error) {
      console.error('Erreur lors de l\'analyse du profil:', error);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'Une erreur est survenue lors de l\'analyse de votre profil. Vos données ont été sauvegardées, veuillez réessayer.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeProfileFromForm = (data: Partial<UserProfile>) => {
    let scores: Record<string, number> = {
      dirigeant_IS: 0,
      salarie: 0,
      independant: 0,
      investisseur_immobilier: 0,
      expatrie: 0,
      retraite: 0
    };
    
    let factors: string[] = [];

    // Analyse basée sur l'activité principale
    if (data.situation_professionnelle?.includes('dirigeant')) {
      scores.dirigeant_IS += 70;
      factors.push('Dirigeant de société');
    } else if (data.situation_professionnelle?.includes('salarie') || data.situation_professionnelle?.includes('fonctionnaire')) {
      scores.salarie += 70;
      factors.push('Statut salarié');
    } else if (data.situation_professionnelle?.includes('autoentrepreneur') || data.situation_professionnelle?.includes('profession_liberale')) {
      scores.independant += 70;
      factors.push('Travailleur indépendant');
    } else if (data.situation_professionnelle?.includes('retraite')) {
      scores.retraite += 70;
      factors.push('Situation de retraité');
    }

    // Analyse des revenus complémentaires
    if (data.type_revenus?.includes('immobilier_locatif') || data.type_revenus?.includes('scpi') || data.type_revenus?.includes('lmnp')) {
      scores.investisseur_immobilier += 50;
      factors.push('Revenus immobiliers');
    }
    
    if (data.type_revenus?.includes('dividendes')) {
      scores.dirigeant_IS += 30;
      factors.push('Perception de dividendes');
    }

    // Analyse de la résidence fiscale
    if (data.localisation && data.localisation !== 'france') {
      scores.expatrie += 60;
      factors.push('Résidence fiscale à l\'étranger');
    }

    // Analyse du patrimoine
    if (data.patrimoine?.includes('multi_proprietaire') || data.patrimoine?.includes('patrimoine_important') || data.patrimoine?.includes('ifi_concerne')) {
      scores.investisseur_immobilier += 40;
      factors.push('Patrimoine immobilier important');
    }

    // Déterminer le profil principal
    const primaryProfile = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const confidence = Math.min(95, Math.max(65, scores[primaryProfile] + Math.floor(Math.random() * 15)));
    
    // Profils secondaires (score > 30)
    const allProfiles = Object.entries(scores)
      .filter(([_, score]) => score > 30)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .map(([profile, _]) => profile);

    return {
      primary: primaryProfile,
      all: allProfiles,
      scores,
      confidence,
      factors
    };
  };

  const handleSubmit = async (e?: React.FormEvent, suggestedQuestion?: string) => {
    if (e) e.preventDefault();
    const currentQuestion = suggestedQuestion || question;
    if (!currentQuestion.trim() || !userId) return;

    setIsLoading(true);
    const userQuestion = currentQuestion;
    if (!suggestedQuestion) setQuestion('');
    
    setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }]);
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const token = (await supabase.auth.getSession())?.data.session?.access_token;

      // Préparer le payload avec la question et le profil complet
      const payload = {
        question: userQuestion,
        userProfile: profileData // Envoi de toutes les données du profil
      };

      console.log('📡 Envoi des données à l\'API /ask:', payload);

      const response = await fetch(`${apiBaseUrl}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload), // Utilisation du nouveau payload
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: "Erreur inconnue du serveur"}));
        console.error('❌ Erreur API /ask:', errorData);
        throw new Error(`Erreur ${response.status}: ${errorData.detail || response.statusText}`);
      }

      const data = await response.json();
      console.log('🤖 Réponse de l\'API /ask:', data);
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      console.error('Erreur lors de la soumission de la question:', error);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: error instanceof Error ? `Désolé, une erreur est survenue : ${error.message}` : "Oups ! Je rencontre une difficulté technique. Veuillez réessayer."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    if (!userId) {
      setChatHistory(prev => [...prev, {role: 'assistant', content: "Veuillez vous connecter pour uploader des documents."}]);
      return;
    }
    
    setIsUploading(true);
    const newFileEntry = { name: selectedFile.name, type: selectedFile.type, status: 'processing' as const };
    setUploadedFiles(prev => [...prev, newFileEntry]);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const token = (await supabase.auth.getSession())?.data.session?.access_token;
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/upload/document`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: "Erreur lors de l'upload"}));
        throw new Error(errorData.detail || `Erreur ${response.status}`);
      }
      const data = await response.json();
      setUploadedFiles(prev => prev.map(f => f.name === selectedFile.name ? { ...f, status: 'success' as const, data } : f));
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.message || `Document "${selectedFile.name}" traité avec succès.` }]);
    } catch (error) {
      console.error('Erreur Upload:', error);
      setUploadedFiles(prev => prev.map(f => f.name === selectedFile.name ? { ...f, status: 'error' as const } : f));
      setChatHistory(prev => [...prev, { role: 'assistant', content: error instanceof Error ? `Erreur d'upload: ${error.message}` : "Erreur inconnue lors de l'upload." }]);
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeProfile = () => { return {recommendations: [], opportunities: []}};
  const connectBank = async () => {};
  
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#101A2E] via-[#162238] to-[#1E3253] text-gray-200 font-sans">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: '-100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '-100%' }} 
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-72 bg-[#0D1523]/80 backdrop-blur-xl p-6 flex flex-col border-r border-[#2A3F6C]/20 shadow-2xl fixed inset-y-0 left-0 z-40"
          >
            <div className="flex items-center space-x-3.5 mb-10 px-2">
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquare className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
                <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#0D1523] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
              </div>
            </div>

            <nav className="flex-grow space-y-1.5">
              {[ 
                { id: 'chat', label: 'Chat avec Francis', icon: MessageSquare }, 
                { id: 'profile', label: 'Mon Profil Fiscal', icon: UserCircle }, 
                { id: 'discovery', label: 'Découverte', icon: Users },
                { id: 'documents', label: 'Mes Documents', icon: FileText }, 
                { id: 'analytics', label: 'Analyse & Rapports', icon: TrendingUp }, 
                { id: 'settings', label: 'Paramètres', icon: Settings } 
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3.5 px-3 py-3 rounded-lg transition-all duration-200 group hover:bg-[#c5a572]/15 focus:outline-none focus:ring-2 focus:ring-[#c5a572] focus:ring-offset-2 focus:ring-offset-[#0D1523] ${ activeTab === item.id ? 'bg-[#c5a572]/20 text-[#e8cfa0] shadow-inner' : 'text-gray-400 hover:text-gray-100' }`}
                >
                  <item.icon className={`w-5 h-5 transition-colors duration-200 ${activeTab === item.id ? 'text-[#e8cfa0]' : 'text-gray-500 group-hover:text-[#c5a572]'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-[#2A3F6C]/20">
              {userEmail && (
                <div className="mb-3 p-3 bg-[#162238]/60 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Connecté en tant que</p>
                  <p className="text-sm font-medium text-gray-200 truncate">{userEmail}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3.5 px-3 py-3 rounded-lg text-gray-400 hover:bg-red-600/15 hover:text-red-400 transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#0D1523]"
              >
                <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" />
                <span className="font-medium text-sm">Déconnexion</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-easeInOut ${isSidebarOpen ? 'md:ml-72' : 'ml-0'}`}>
        <header className="h-20 bg-[#162238]/80 backdrop-blur-xl flex items-center justify-between px-6 sm:px-8 border-b border-[#2A3F6C]/30 shadow-lg">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#c5a572] transition-all duration-200 md:hidden"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            {!isSidebarOpen && (
              <div className="flex items-center">
                <div className="relative inline-flex items-center justify-center group">
                  <img 
                    src="/fiscalia-logo.svg" 
                    alt="Fiscal.ia" 
                    className="h-12 w-12 transition-transform group-hover:scale-110 duration-300" 
                  />
                  <span className="ml-3 text-2xl font-bold text-white">Fiscal.ia</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 px-4 py-2 bg-[#1E3253]/50 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Francis en ligne</span>
            </div>
            <Bell className="h-5 w-5 text-gray-400 hover:text-[#c5a572] cursor-pointer transition-colors" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] flex items-center justify-center text-[#162238] font-semibold text-sm shadow-lg border-2 border-[#162238]/20">
              {userEmail ? userEmail.substring(0,1).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#101A2E] p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div 
                key="chat" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 0.3 }}
                className="h-full max-h-[calc(100vh-10rem)] flex flex-col bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-[#2A3F6C]/70 scrollbar-track-transparent scrollbar-thumb-rounded-full">
                  {chatHistory.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl shadow-lg text-sm leading-relaxed backdrop-blur-sm ${ 
                          message.role === 'user' 
                            ? 'bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-br-md shadow-[#c5a572]/20' 
                            : 'bg-[#1E3253]/80 text-gray-100 rounded-bl-md border border-white/10' 
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1.5">
                          {message.role === 'assistant' && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] flex items-center justify-center flex-shrink-0 shadow-sm">
                              <MessageSquare className="w-3.5 h-3.5 text-[#162238]" />
                            </div>
                          )}
                          <span className={`text-xs font-semibold ${message.role === 'user' ? 'text-[#162238]/90' : 'text-[#e8cfa0]'}`}>
                            {message.role === 'user' ? (userEmail || 'Vous') : 'Francis'}
                          </span>
                        </div>
                        <div className={`whitespace-pre-wrap break-words ${message.role === 'user' ? 'text-[#162238]' : 'text-gray-200'}`}>
                          {message.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {!isLoading && chatHistory.length > 2 && chatHistory[chatHistory.length - 1].role === 'assistant' && (
                  <div className="px-4 sm:px-6 py-2.5 border-t border-[#2A3F6C]/20">
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.slice(0,3).map((suggQuestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSubmit(undefined, suggQuestion)}
                          className="px-3 py-1.5 bg-[#1E3253]/60 hover:bg-[#2A3F6C]/60 text-xs text-gray-300 hover:text-white rounded-full transition-colors shadow-sm"
                        >
                          {suggQuestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 sm:p-6 border-t border-white/10 bg-[#162238]/40 backdrop-blur-lg">
                  <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                    <label htmlFor="file-upload-chat" className={`p-3 rounded-xl text-gray-400 hover:text-[#c5a572] hover:bg-white/10 transition-all duration-200 cursor-pointer ${isLoading || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <Paperclip className="w-5 h-5" />
                    </label>
                    <input
                      type="file"
                      id="file-upload-chat"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.txt,.md"
                      onChange={(e) => handleFileUpload(e.target.files ? e.target.files[0] : undefined)}
                      disabled={isLoading || isUploading}
                    />
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Posez votre question à Francis..."
                      className="flex-1 rounded-xl bg-white/5 border border-white/20 text-gray-100 placeholder-gray-400 focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/50 px-4 py-3 text-sm transition-all duration-200 shadow-inner backdrop-blur-sm"
                      disabled={isLoading || isUploading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !question.trim() || isUploading}
                      className="p-3 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-[#c5a572] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-[#c5a572]/30"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </form>
                   {isUploading && (
                    <div className="text-xs text-center text-[#c5a572] pt-2">Téléchargement de {uploadedFiles.find(f=>f.status === 'processing')?.name}...</div>
                  )}
                </div>
              </motion.div>
            )}
            
            {activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-3xl font-semibold text-white mb-8">Tableau de Bord</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-[#1E3253]/50 backdrop-blur-sm rounded-xl border border-[#2A3F6C]/40 p-6 shadow-lg hover:shadow-[#c5a572]/10 transition-shadow">
                       <div className="flex items-center space-x-3 mb-4">
                           <div className="p-3 rounded-lg bg-gradient-to-br from-[#c5a572] to-[#e8cfa0]"><UserCircle className="w-6 h-6 text-[#162238]"/></div>
                           <h3 className="text-xl font-semibold text-white">Profil Fiscal</h3>
                       </div>
                       <p className="text-sm text-gray-400 mb-3">Complétez votre profil pour des conseils plus précis.</p>
                       <div className="w-full bg-[#101A2E]/50 rounded-full h-2.5 mb-1">
                           <div className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${calculateProgress()}%` }}></div>
                       </div>
                       <p className="text-right text-xs text-[#c5a572]">{calculateProgress()}% complet</p>
                    </div>
                    <div className="bg-[#1E3253]/50 backdrop-blur-sm rounded-xl border border-[#2A3F6C]/40 p-6 shadow-lg hover:shadow-[#c5a572]/10 transition-shadow">
                       <div className="flex items-center space-x-3 mb-4">
                           <div className="p-3 rounded-lg bg-gradient-to-br from-[#c5a572] to-[#e8cfa0]"><FileText className="w-6 h-6 text-[#162238]"/></div>
                           <h3 className="text-xl font-semibold text-white">Mes Documents</h3>
                       </div>
                       <p className="text-sm text-gray-400 mb-3">Gérez vos documents fiscaux uploadés.</p>
                       <p className="text-2xl font-bold text-white">{uploadedFiles.filter(f=>f.status === 'success').length} <span className="text-base font-normal text-gray-400">documents</span></p>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'discovery' && (
              <motion.div key="discovery" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-3xl font-semibold text-white mb-6">Découverte de Profils</h2>
                <UserDiscovery />
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div key="documents" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-3xl font-semibold text-white mb-6">Mes Documents</h2>
                <div className="bg-[#1E3253]/60 backdrop-blur-md rounded-xl border border-[#2A3F6C]/30 p-6 sm:p-8 shadow-xl">
                  <div className="mb-6">
                    <label htmlFor="doc-upload-main" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#2A3F6C]/50 rounded-lg cursor-pointer hover:border-[#c5a572]/70 hover:bg-[#162238]/30 transition-colors">
                        <Upload className="w-10 h-10 text-gray-400 mb-3" />
                        <span className="text-sm text-gray-300 font-medium">Glissez-déposez vos fichiers ici ou cliquez pour parcourir</span>
                        <span className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, TXT, MD (max. 5MB)</span>
                        <input id="doc-upload-main" type="file" className="hidden" onChange={(e) => handleFileUpload(e.target.files ? e.target.files[0] : undefined)} />
                    </label>
                  </div>
                  
                  {isUploading && <p className="text-center text-[#c5a572] text-sm my-4">Traitement du fichier en cours...</p>}

                  {uploadedFiles.length > 0 ? (
                    <ul className="space-y-3">
                      {uploadedFiles.map((file, idx) => (
                        <li key={idx} className="flex items-center justify-between p-3 bg-[#101A2E]/70 rounded-lg border border-[#2A3F6C]/40">
                          <div className="flex items-center space-x-3">
                            {file.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                            {file.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                            {file.status === 'processing' && <Loader2 className="w-5 h-5 text-[#c5a572] animate-spin flex-shrink-0" />}
                            <span className="text-sm text-gray-200 truncate" title={file.name}>{file.name}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${file.status === 'success' ? 'bg-green-500/20 text-green-400' : file.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {file.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-500 text-sm">Aucun document uploadé pour le moment.</p>
                  )}
                </div>
              </motion.div>
            )}
            
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-3xl font-semibold text-white mb-6">Mon Profil Fiscal Adaptatif</h2>
                
                {/* Statut de sauvegarde du profil */}
                {detectedProfile && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                      <div>
                        <h3 className="text-white font-semibold">Profil fiscal sauvegardé !</h3>
                        <p className="text-sm text-gray-300">
                          <strong>{getProfileLabel(detectedProfile.priorite_affichage[0])}</strong> détecté avec {detectedProfile.confiance_detection}% de confiance
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Formulaire de questions directes */}
                <div className="bg-[#1E3253]/60 backdrop-blur-md rounded-xl border border-[#2A3F6C]/30 p-6 sm:p-8 shadow-xl">
                  {!selectedProfileType ? (
                    // ÉTAPE 1: Sélection du profil principal
                    <>
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full mb-6">
                          <Target className="w-10 h-10 text-[#162238]" />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-3">Quel est votre profil principal ?</h3>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                          Choisissez en 1 clic, puis quelques infos rapides pour personnaliser !
                        </p>
                      </div>

                      {/* Profils rapides */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {[
                          { 
                            id: 'salarie', 
                            icon: Target, 
                            title: 'Salarié / Fonctionnaire', 
                            description: 'CDI, CDD, fonction publique',
                            color: 'from-blue-500 to-blue-600'
                          },
                          { 
                            id: 'dirigeant_IS', 
                            icon: Building2, 
                            title: 'Dirigeant de société', 
                            description: 'SASU, SARL, SAS...',
                            color: 'from-purple-500 to-purple-600'
                          },
                          { 
                            id: 'independant', 
                            icon: Zap, 
                            title: 'Indépendant', 
                            description: 'Auto-entrepreneur, libéral',
                            color: 'from-green-500 to-green-600'
                          },
                          { 
                            id: 'investisseur_immobilier', 
                            icon: Home, 
                            title: 'Investisseur Immobilier', 
                            description: 'Locatif, SCPI, LMNP...',
                            color: 'from-orange-500 to-orange-600'
                          },
                          { 
                            id: 'expatrie', 
                            icon: Globe, 
                            title: 'Expatrié / Non-résident', 
                            description: 'Résidence à l\'étranger',
                            color: 'from-teal-500 to-teal-600'
                          },
                          { 
                            id: 'retraite', 
                            icon: Clock, 
                            title: 'Retraité', 
                            description: 'Pension, rente...',
                            color: 'from-gray-500 to-gray-600'
                          }
                        ].map((profile) => (
                          <button
                            key={profile.id}
                            onClick={() => {
                              setSelectedProfileType(profile.id);
                              setProfileData({...profileData, situation_professionnelle: profile.id});
                            }}
                            className={`p-6 rounded-xl bg-gradient-to-br ${profile.color} hover:scale-105 transition-all duration-300 text-left group shadow-lg hover:shadow-xl`}
                          >
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="p-3 bg-white/20 rounded-lg">
                                <profile.icon className="w-6 h-6 text-white" />
                              </div>
                              <h4 className="text-white font-bold text-lg group-hover:scale-105 transition-transform">
                                {profile.title}
                              </h4>
                            </div>
                            <p className="text-white/80 text-sm">{profile.description}</p>
                          </button>
                        ))}
                      </div>

                      {/* Option personnalisée */}
                      <div className="text-center pt-4 border-t border-[#2A3F6C]/30">
                        <p className="text-gray-400 text-sm mb-3">Situation plus complexe ?</p>
                        <button
                          onClick={() => {
                            setChatHistory(prev => [...prev, { 
                              role: 'assistant', 
                              content: `📝 **Pas de problème !** Décrivez-moi votre situation en quelques mots et je m'adapterai automatiquement.\n\nPar exemple :\n• "Je suis salarié + propriétaire de 3 appartements locatifs"\n• "Dirigeant SASU + investisseur crypto"\n• "Retraité expatrié au Portugal avec des SCPI"\n\nJe détecterai automatiquement tous vos profils !` 
                            }]);
                            setActiveTab('chat');
                          }}
                          className="px-6 py-3 bg-[#162238] border border-[#2A3F6C] text-gray-300 rounded-lg hover:bg-[#2A3F6C] hover:text-white transition-colors"
                        >
                          💬 Décrire ma situation à Francis
                        </button>
                      </div>
                    </>
                  ) : (
                    // ÉTAPE 2: Questions personnelles essentielles
                    <>
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full mb-4">
                          <CheckCircle2 className="w-8 h-8 text-[#162238]" />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-3">
                          Profil <span className="text-[#c5a572]">{getProfileLabel(selectedProfileType)}</span> - Questionnaire Détaillé
                        </h3>
                        <p className="text-gray-300">Questionnaire complet pour un conseil fiscal ultra-personnalisé</p>
                      </div>

                      <form onSubmit={handleProfileSubmit} className="space-y-8">
                        {/* SECTION 1: Informations personnelles */}
                        <div className="bg-[#162238]/50 rounded-lg p-6 border border-[#2A3F6C]/30">
                          <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                            <User className="w-6 h-6 mr-3 text-[#c5a572]" />
                            👤 Informations personnelles
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-white font-semibold mb-3">Date de naissance :</label>
                              <input 
                                type="date"
                                value={profileData.date_naissance || ''}
                                onChange={(e) => setProfileData({...profileData, date_naissance: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white font-semibold mb-3">👨‍👩‍👧‍👦 Situation familiale :</label>
                              <select 
                                value={profileData.situation_familiale || ''} 
                                onChange={(e) => setProfileData({...profileData, situation_familiale: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                                required
                              >
                                <option value="">-- Sélectionnez --</option>
                                <option value="celibataire">Célibataire</option>
                                <option value="marie">Marié(e)</option>
                                <option value="pacse">Pacsé(e)</option>
                                <option value="divorce">Divorcé(e)</option>
                                <option value="veuf">Veuf(ve)</option>
                                <option value="concubinage">Concubinage</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-white font-semibold mb-3">🧒 Nombre d'enfants à charge :</label>
                              <select 
                                value={profileData.nombre_enfants || 0} 
                                onChange={(e) => setProfileData({...profileData, nombre_enfants: parseInt(e.target.value)})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                              >
                                <option value={0}>0 enfant</option>
                                <option value={1}>1 enfant</option>
                                <option value={2}>2 enfants</option>
                                <option value={3}>3 enfants</option>
                                <option value={4}>4 enfants</option>
                                <option value={5}>5 enfants ou plus</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-white font-semibold mb-3">👶 Âges des enfants :</label>
                              <input 
                                type="text"
                                placeholder="Ex: 5 ans, 12 ans, 17 ans"
                                value={profileData.ages_enfants || ''}
                                onChange={(e) => setProfileData({...profileData, ages_enfants: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white font-semibold mb-3">👴 Personnes à charge supplémentaires :</label>
                              <input 
                                type="text"
                                placeholder="Enfants majeurs, ascendants..."
                                value={profileData.personnes_charge || ''}
                                onChange={(e) => setProfileData({...profileData, personnes_charge: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white font-semibold mb-3">🌍 Zone de résidence fiscale :</label>
                              <select 
                                value={profileData.localisation || ''} 
                                onChange={(e) => setProfileData({...profileData, localisation: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                                required
                              >
                                <option value="">-- Sélectionnez --</option>
                                <option value="france_metropole">France métropolitaine</option>
                                <option value="dom_tom">DOM-TOM</option>
                                <option value="monaco">Monaco</option>
                                <option value="portugal">Portugal</option>
                                <option value="belgique">Belgique</option>
                                <option value="suisse">Suisse</option>
                                <option value="luxembourg">Luxembourg</option>
                                <option value="autre_ue">Autre UE</option>
                                <option value="hors_ue">Hors UE</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* SECTION 2: Statut professionnel et fiscal */}
                        <div className="bg-[#162238]/50 rounded-lg p-6 border border-[#2A3F6C]/30">
                          <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Briefcase className="w-6 h-6 mr-3 text-[#c5a572]" />
                            💼 Statut professionnel et fiscal
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-white font-semibold mb-3">Type de contrat :</label>
                              <select 
                                value={profileData.type_contrat || ''} 
                                onChange={(e) => setProfileData({...profileData, type_contrat: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                              >
                                <option value="">-- Sélectionnez --</option>
                                <option value="cdi">CDI</option>
                                <option value="cdd">CDD</option>
                                <option value="tns">TNS</option>
                                <option value="gerant_majoritaire">Gérant majoritaire</option>
                                <option value="gerant_minoritaire">Gérant minoritaire</option>
                                <option value="president_sas">Président SAS</option>
                                <option value="auto_entrepreneur">Auto-entrepreneur</option>
                                <option value="profession_liberale">Profession libérale</option>
                                <option value="fonctionnaire">Fonctionnaire</option>
                                <option value="retraite">Retraité</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-white font-semibold mb-3">Secteur d'activité :</label>
                              <input 
                                type="text"
                                placeholder="Ex: Conseil, Tech, Immobilier..."
                                value={profileData.secteur_activite || ''}
                                onChange={(e) => setProfileData({...profileData, secteur_activite: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white font-semibold mb-3">Sociétés détenues :</label>
                              <input 
                                type="text"
                                placeholder="Ex: SASU conseil, SCI immobilière..."
                                value={profileData.societes_detenues || ''}
                                onChange={(e) => setProfileData({...profileData, societes_detenues: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white font-semibold mb-3">Régime fiscal appliqué :</label>
                              <select 
                                value={profileData.regime_imposition || ''} 
                                onChange={(e) => setProfileData({...profileData, regime_imposition: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                              >
                                <option value="">-- Sélectionnez --</option>
                                <option value="micro_bic">Micro-BIC</option>
                                <option value="micro_bnc">Micro-BNC</option>
                                <option value="reel_simplifie">Réel simplifié</option>
                                <option value="reel_normal">Réel normal</option>
                                <option value="is">IS (Impôt sur les sociétés)</option>
                                <option value="ir">IR (Impôt sur le revenu)</option>
                                <option value="forfait_agricole">Forfait agricole</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* SECTION 3: Revenus */}
                        <div className="bg-[#162238]/50 rounded-lg p-6 border border-[#2A3F6C]/30">
                          <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Euro className="w-6 h-6 mr-3 text-[#c5a572]" />
                            💰 Revenus
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-white font-semibold mb-3">Revenu global imposable :</label>
                              <select 
                                value={profileData.revenus || ''} 
                                onChange={(e) => setProfileData({...profileData, revenus: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                                required
                              >
                                <option value="">-- Sélectionnez --</option>
                                <option value="moins_30k">Moins de 30 000€</option>
                                <option value="30k_50k">30 000€ - 50 000€</option>
                                <option value="50k_80k">50 000€ - 80 000€</option>
                                <option value="80k_120k">80 000€ - 120 000€</option>
                                <option value="120k_200k">120 000€ - 200 000€</option>
                                <option value="200k_500k">200 000€ - 500 000€</option>
                                <option value="plus_500k">Plus de 500 000€</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-white font-semibold mb-3">Tranche marginale d'imposition (TMI) :</label>
                              <select 
                                value={profileData.tmi || ''} 
                                onChange={(e) => setProfileData({...profileData, tmi: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                              >
                                <option value="">-- Sélectionnez --</option>
                                <option value="0">0% (non imposable)</option>
                                <option value="11">11%</option>
                                <option value="30">30%</option>
                                <option value="41">41%</option>
                                <option value="45">45%</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <label className="block text-white font-semibold mb-3">Types de revenus perçus :</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                { value: 'salaires', label: 'Salaires' },
                                { value: 'bic', label: 'BIC' },
                                { value: 'bnc', label: 'BNC' },
                                { value: 'ba', label: 'BA (Agricole)' },
                                { value: 'revenus_fonciers', label: 'Revenus fonciers' },
                                { value: 'dividendes', label: 'Dividendes' },
                                { value: 'interets', label: 'Intérêts' },
                                { value: 'plus_values', label: 'Plus-values' },
                                { value: 'revenus_etrangers', label: 'Revenus étrangers' },
                                { value: 'revenus_passifs', label: 'Revenus passifs' },
                                { value: 'crypto', label: 'Cryptomonnaies' },
                                { value: 'rentes', label: 'Rentes / Pensions' }
                              ].map((option) => (
                                <label key={option.value} className="flex items-center space-x-2 text-gray-300">
                                  <input
                                    type="checkbox"
                                    checked={profileData.type_revenus?.includes(option.value) || false}
                                    onChange={(e) => {
                                      const currentRevenus = profileData.type_revenus || [];
                                      if (e.target.checked) {
                                        setProfileData({...profileData, type_revenus: [...currentRevenus, option.value]});
                                      } else {
                                        setProfileData({...profileData, type_revenus: currentRevenus.filter(r => r !== option.value)});
                                      }
                                    }}
                                    className="w-4 h-4 text-[#c5a572] bg-[#101A2E] border border-[#2A3F6C] rounded focus:ring-[#c5a572]"
                                  />
                                  <span className="text-sm">{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* SECTION 4: Patrimoine */}
                        <div className="bg-[#162238]/50 rounded-lg p-6 border border-[#2A3F6C]/30">
                          <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Home className="w-6 h-6 mr-3 text-[#c5a572]" />
                            🏠 Patrimoine
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-white font-semibold mb-3">Estimation patrimoine brut :</label>
                              <select 
                                value={profileData.patrimoine || ''} 
                                onChange={(e) => setProfileData({...profileData, patrimoine: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                              >
                                <option value="">-- Sélectionnez --</option>
                                <option value="moins_100k">Moins de 100 000€</option>
                                <option value="100k_300k">100 000€ - 300 000€</option>
                                <option value="300k_500k">300 000€ - 500 000€</option>
                                <option value="500k_1M">500 000€ - 1M€</option>
                                <option value="1M_3M">1M€ - 3M€</option>
                                <option value="3M_5M">3M€ - 5M€</option>
                                <option value="plus_5M">Plus de 5M€</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-white font-semibold mb-3">Niveau d'endettement :</label>
                              <select 
                                value={profileData.endettement || ''} 
                                onChange={(e) => setProfileData({...profileData, endettement: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                              >
                                <option value="">-- Sélectionnez --</option>
                                <option value="faible">Faible (&lt; 20%)</option>
                                <option value="moderee">Modérée (20-50%)</option>
                                <option value="eleve">Élevé (&gt; 50%)</option>
                                <option value="sans_dette">Sans dette</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <label className="block text-white font-semibold mb-3">Composition patrimoniale :</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                { value: 'residence_principale', label: 'Résidence principale' },
                                { value: 'residence_secondaire', label: 'Résidence secondaire' },
                                { value: 'immobilier_locatif_nu', label: 'Immobilier locatif nu' },
                                { value: 'immobilier_locatif_meuble', label: 'Location meublée' },
                                { value: 'scpi', label: 'SCPI' },
                                { value: 'sci', label: 'SCI' },
                                { value: 'comptes_titres', label: 'Comptes titres' },
                                { value: 'pea', label: 'PEA' },
                                { value: 'assurance_vie', label: 'Assurance-vie' },
                                { value: 'crypto', label: 'Cryptomonnaies' },
                                { value: 'metaux_precieux', label: 'Métaux précieux' },
                                { value: 'oeuvres_art', label: 'Œuvres d\'art' },
                                { value: 'epargne_salariale', label: 'Épargne salariale' },
                                { value: 'holding', label: 'Holding' }
                              ].map((option) => (
                                <label key={option.value} className="flex items-center space-x-2 text-gray-300">
                                  <input
                                    type="checkbox"
                                    checked={profileData.composition_patrimoine?.includes(option.value) || false}
                                    onChange={(e) => {
                                      const currentComposition = profileData.composition_patrimoine || [];
                                      if (e.target.checked) {
                                        setProfileData({...profileData, composition_patrimoine: [...currentComposition, option.value]});
                                      } else {
                                        setProfileData({...profileData, composition_patrimoine: currentComposition.filter(c => c !== option.value)});
                                      }
                                    }}
                                    className="w-4 h-4 text-[#c5a572] bg-[#101A2E] border border-[#2A3F6C] rounded focus:ring-[#c5a572]"
                                  />
                                  <span className="text-sm">{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* SECTION 5: Objectifs et projets */}
                        <div className="bg-[#162238]/50 rounded-lg p-6 border border-[#2A3F6C]/30">
                          <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Target className="w-6 h-6 mr-3 text-[#c5a572]" />
                            🎯 Objectifs et projets
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-white font-semibold mb-3">Horizon d'investissement :</label>
                              <select 
                                value={profileData.horizon_investissement || ''} 
                                onChange={(e) => setProfileData({...profileData, horizon_investissement: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                              >
                                <option value="">-- Sélectionnez --</option>
                                <option value="court_terme">Court terme (&lt; 3 ans)</option>
                                <option value="moyen_terme">Moyen terme (3-8 ans)</option>
                                <option value="long_terme">Long terme (&gt; 8 ans)</option>
                                <option value="mixte">Mixte</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-white font-semibold mb-3">Tolérance au risque :</label>
                              <select 
                                value={profileData.tolerance_risque || ''} 
                                onChange={(e) => setProfileData({...profileData, tolerance_risque: e.target.value})}
                                className="w-full p-3 bg-[#101A2E] border border-[#2A3F6C] rounded-lg text-white focus:border-[#c5a572] focus:outline-none"
                              >
                                <option value="">-- Sélectionnez --</option>
                                <option value="faible">Faible (prudent)</option>
                                <option value="moderee">Modérée (équilibré)</option>
                                <option value="elevee">Élevée (dynamique)</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <label className="block text-white font-semibold mb-3">Objectifs principaux :</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                { value: 'reduction_impot', label: 'Réduction d\'impôt' },
                                { value: 'preparation_retraite', label: 'Préparation retraite' },
                                { value: 'transmission', label: 'Transmission patrimoine' },
                                { value: 'valorisation', label: 'Valorisation patrimoine' },
                                { value: 'revenus_complementaires', label: 'Revenus complémentaires' },
                                { value: 'diversification', label: 'Diversification' },
                                { value: 'optimisation_fiscale', label: 'Optimisation fiscale' },
                                { value: 'protection_famille', label: 'Protection famille' },
                                { value: 'mobilite_fiscale', label: 'Mobilité fiscale' }
                              ].map((option) => (
                                <label key={option.value} className="flex items-center space-x-2 text-gray-300">
                                  <input
                                    type="checkbox"
                                    checked={profileData.objectifs?.includes(option.value) || false}
                                    onChange={(e) => {
                                      const currentObjectifs = profileData.objectifs || [];
                                      if (e.target.checked) {
                                        setProfileData({...profileData, objectifs: [...currentObjectifs, option.value]});
                                      } else {
                                        setProfileData({...profileData, objectifs: currentObjectifs.filter(o => o !== option.value)});
                                      }
                                    }}
                                    className="w-4 h-4 text-[#c5a572] bg-[#101A2E] border border-[#2A3F6C] rounded focus:ring-[#c5a572]"
                                  />
                                  <span className="text-sm">{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* SECTION 6: Contraintes fiscales spécifiques */}
                        <div className="bg-[#162238]/50 rounded-lg p-6 border border-[#2A3F6C]/30">
                          <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                            <AlertTriangle className="w-6 h-6 mr-3 text-[#c5a572]" />
                            ⚠️ Contraintes fiscales spécifiques
                          </h4>
                          
                          <div className="space-y-4">
                            {[
                              { value: 'exposition_ifi', label: 'Exposition à l\'IFI (patrimoine &gt; 1,3M€)' },
                              { value: 'exposition_exit_tax', label: 'Exposition à l\'exit tax' },
                              { value: 'revenus_plusieurs_pays', label: 'Revenus dans plusieurs pays' },
                              { value: 'plafond_niches_atteint', label: 'Plafond des niches fiscales atteint' },
                              { value: 'patrimoine_transfrontalier', label: 'Activité ou patrimoine transfrontalier' },
                              { value: 'controles_fiscaux', label: 'Historique de contrôles fiscaux / redressements' }
                            ].map((option) => (
                              <label key={option.value} className="flex items-center space-x-3 text-gray-300">
                                <input
                                  type="checkbox"
                                  checked={profileData.contraintes_fiscales?.includes(option.value) || false}
                                  onChange={(e) => {
                                    const currentContraintes = profileData.contraintes_fiscales || [];
                                    if (e.target.checked) {
                                      setProfileData({...profileData, contraintes_fiscales: [...currentContraintes, option.value]});
                                    } else {
                                      setProfileData({...profileData, contraintes_fiscales: currentContraintes.filter(c => c !== option.value)});
                                    }
                                  }}
                                  className="w-4 h-4 text-[#c5a572] bg-[#101A2E] border border-[#2A3F6C] rounded focus:ring-[#c5a572]"
                                />
                                <span className="text-sm" dangerouslySetInnerHTML={{ __html: option.label }}></span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Boutons */}
                        <div className="flex space-x-4 pt-6">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProfileType(null);
                              setProfileData(initialProfileData);
                            }}
                            className="px-6 py-3 bg-[#162238] border border-[#2A3F6C] text-gray-300 rounded-lg hover:bg-[#2A3F6C] hover:text-white transition-colors"
                          >
                            ← Retour
                          </button>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-lg shadow-lg hover:shadow-[#c5a572]/40 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span>Analyse approfondie en cours...</span>
                              </>
                            ) : (
                              <>
                                <Target className="w-6 h-6" />
                                <span>Analyser mon profil fiscal complet</span>
                                <ChevronRight className="w-5 h-5" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>

                {/* Affichage du profil détecté */}
                {detectedProfile && (
                  <ProfileSummary
                    detectedProfile={detectedProfile}
                    profileData={adaptiveProfileData || {}}
                  />
                )}
              </motion.div>
            )}
            
            {activeTab === 'analytics' && (
                <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                   <h2 className="text-3xl font-semibold text-white mb-6">Analyse & Rapports</h2>
                   <div className="bg-[#1E3253]/60 backdrop-blur-md rounded-xl border border-[#2A3F6C]/30 p-6 sm:p-8 shadow-xl">
                       <p className="text-gray-300">Les fonctionnalités d'analyse et de rapports seront disponibles ici prochainement.</p>
                   </div>
                </motion.div>
            )}
            {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                   <h2 className="text-3xl font-semibold text-white mb-6">Paramètres</h2>
                   <div className="bg-[#1E3253]/60 backdrop-blur-md rounded-xl border border-[#2A3F6C]/30 p-6 sm:p-8 shadow-xl">
                       <p className="text-gray-300">Options de configuration du compte et des préférences.</p>
                   </div>
                </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
} 