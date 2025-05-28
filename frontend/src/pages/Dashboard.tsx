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
  Home
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, UserProfile } from '../lib/supabase';

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
  toleranceRisque: '',
  horizonInvestissement: '',
  nombreEnfants: 0,
  agesEnfants: '',
  typeRevenus: [],
  autresRevenus: '',
  situationProfessionnelle: '',
  statutFiscal: '',
  regimeImposition: '',
  investissementsExistants: [],
  projetsImmobiliers: '',
  besoinsRetraite: '',
  situationFamiliale: '',
  localisation: '',
  zoneFiscale: '',
  secteurActivite: '',
  revenusPassifs: '',
  dettes: '',
  objectifsFinanciers: [],
  contraintesFiscales: [],
  compositionPatrimoine: [],
  is_active: false,
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
      'situationFamiliale', 'nombreEnfants', 'localisation', 'zoneFiscale',
      'situationProfessionnelle', 'secteurActivite', 'regimeImposition', 'statutFiscal',
      'revenus', 'typeRevenus', 'patrimoine', 'compositionPatrimoine',
      'investissementsExistants', 'projetsImmobiliers', 'besoinsRetraite',
      'horizonInvestissement', 'toleranceRisque', 'objectifs',
      'contraintesFiscales'
    ];
    const filledFields = requiredFields.filter(field => {
      const value = profileData[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '';
    });
    return Math.round((filledFields.length / requiredFields.length) * 100);
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
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ ...currentProfileData, user_id: userId, updated_at: new Date().toISOString() });
      if (error) throw error;
      setProfileData(currentProfileData);
      const progress = calculateProgress();
      setProfileCompleted(progress > 80);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsLoading(true);
    try {
      await saveUserProfile(profileData);
      setActiveTab('chat');
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Votre profil a été mis à jour avec succès ! N'hésitez pas à me poser des questions plus ciblées maintenant." }]);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Une erreur est survenue lors de la sauvegarde de votre profil. Veuillez réessayer." }]);
    } finally {
      setIsLoading(false);
    }
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

      const response = await fetch(`${apiBaseUrl}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ question: userQuestion }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: "Erreur inconnue du serveur"}));
        throw new Error(`Erreur ${response.status}: ${errorData.detail || response.statusText}`);
      }

      const data = await response.json();
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
              <div className="relative inline-flex items-center justify-center group bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] p-2.5 rounded-xl shadow-md">
                <MessageSquare className="h-7 w-7 text-[#162238]" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Fiscal.ia</h1>
            </div>

            <nav className="flex-grow space-y-1.5">
              {[ { id: 'chat', label: 'Chat avec Francis', icon: MessageSquare }, { id: 'profile', label: 'Mon Profil Fiscal', icon: UserCircle }, { id: 'documents', label: 'Mes Documents', icon: FileText }, { id: 'analytics', label: 'Analyse & Rapports', icon: TrendingUp }, { id: 'settings', label: 'Paramètres', icon: Settings } ].map((item) => (
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
        <header className="h-20 bg-[#162238]/60 backdrop-blur-md flex items-center justify-between px-6 sm:px-8 border-b border-[#2A3F6C]/20 shadow-sm">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#c5a572] transition-colors md:hidden"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex-1">
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="h-5 w-5 text-gray-400 hover:text-[#c5a572] cursor-pointer transition-colors" />
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] flex items-center justify-center text-[#162238] font-semibold text-sm shadow-md">
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
                className="h-full max-h-[calc(100vh-10rem)] flex flex-col bg-[#162238]/70 backdrop-blur-sm rounded-xl shadow-2xl border border-[#2A3F6C]/25 overflow-hidden"
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
                        className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl shadow-md text-sm leading-relaxed ${ 
                          message.role === 'user' 
                            ? 'bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-br-lg' 
                            : 'bg-[#1E3253]/90 text-gray-100 rounded-bl-lg' 
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1.5">
                          {message.role === 'assistant' && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] flex items-center justify-center flex-shrink-0 shadow-sm">
                              <MessageSquare className="w-3.5 h-3.5 text-[#162238]" />
                            </div>
                          )}
                           <span className={`text-xs font-semibold ${message.role === 'user' ? 'text-[#162238]/90' : 'text-[#e8cfa0]'}">
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

                <div className="p-3 sm:p-4 border-t border-[#2A3F6C]/20 bg-[#101A2E]/60">
                  <form onSubmit={handleSubmit} className="flex items-center space-x-2.5">
                    <label htmlFor="file-upload-chat" className={`p-2.5 rounded-lg text-gray-400 hover:text-[#c5a572] hover:bg-[#1E3253]/80 transition-colors cursor-pointer ${isLoading || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                      className="flex-1 rounded-lg bg-[#1E3253]/50 border border-[#2A3F6C]/40 text-gray-100 placeholder-gray-500 focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] px-4 py-2.5 text-sm transition-colors shadow-inner"
                      disabled={isLoading || isUploading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !question.trim() || isUploading}
                      className="p-2.5 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#101A2E] focus:ring-[#c5a572] transition-all duration-200 transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </form>
                   {isUploading && (
                    <div className="text-xs text-center text-[#c5a572] pt-1.5">Téléchargement de {uploadedFiles.find(f=>f.status === 'processing')?.name}...</div>
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