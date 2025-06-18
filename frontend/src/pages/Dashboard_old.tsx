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
  Plus
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: File[];
}

export function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
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

  const sidebarItems = [
    { id: 'overview', icon: Home, label: 'Tableau de Bord' },
    { id: 'francis', icon: MessageSquare, label: 'Francis Chat' },
    { id: 'bank', icon: CreditCard, label: 'Connexion Bancaire' },
    { id: 'discover', icon: Users, label: 'Découverte' },
    { id: 'analysis', icon: PieChart, label: 'Analyses Fiscales' },
    { id: 'documents', icon: FileText, label: 'Mes Documents' },
    { id: 'profile', icon: Settings, label: 'Mon Profil' },
  ];

  // Données factices pour le dashboard
  const kpiData = {
    totalEconomies: 2400,
    tmi: 30,
    nextDeadline: '15 Mai 2024',
    documentsCount: 12
  };

  const recentAnalyses = [
    { title: 'Optimisation PEL', gain: 340, status: 'completed' },
    { title: 'Défiscalisation Immobilier', gain: 1200, status: 'in-progress' },
    { title: 'Donation familiale', gain: 800, status: 'pending' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447] text-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#1a2332]/95 backdrop-blur-lg border-r border-[#c5a572]/20 transition-transform duration-300 ease-in-out overflow-y-auto`}>
          <div className="p-6 space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquare className="w-8 h-8 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
                <Euro className="w-5 h-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2332] rounded-full p-0.5" />
              </div>
              <span className="text-lg font-semibold text-[#c5a572]">Fiscal.ia</span>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-[#c5a572] text-[#1a2332] font-medium'
                      : 'text-gray-300 hover:bg-[#243447] hover:text-[#c5a572]'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {activeTab === item.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              ))}
            </nav>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Menu toggle for mobile */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden fixed top-4 left-4 z-50 bg-[#1a2332]/90 p-2 rounded-lg text-[#c5a572]"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Dashboard Overview */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">Tableau de Bord</h1>
                  <p className="text-gray-400 mt-1">Gérez votre fiscalité en toute simplicité</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Bell className="w-6 h-6 text-gray-400 hover:text-[#c5a572] cursor-pointer transition-colors" />
                  <div className="w-8 h-8 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-[#1a2332]" />
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-xl p-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Économies Totales</p>
                      <p className="text-2xl font-bold text-white">{kpiData.totalEconomies}€</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-xl p-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Calculator className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">TMI Actuel</p>
                      <p className="text-2xl font-bold text-white">{kpiData.tmi}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-xl p-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Target className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Prochaine Échéance</p>
                      <p className="text-sm font-bold text-white">{kpiData.nextDeadline}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-xl p-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <FileText className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Documents</p>
                      <p className="text-2xl font-bold text-white">{kpiData.documentsCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[#c5a572]" />
                  <span>Actions Rapides</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setActiveTab('francis')}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[#c5a572]/20 to-[#e8cfa0]/20 border border-[#c5a572]/30 rounded-lg hover:from-[#c5a572]/30 hover:to-[#e8cfa0]/30 transition-all group"
                  >
                    <MessageSquare className="w-6 h-6 text-[#c5a572] group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-medium text-white">Discuter avec Francis</p>
                      <p className="text-sm text-gray-400">Assistant fiscal IA</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </button>

                  <button 
                    onClick={() => setActiveTab('bank')}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg hover:from-blue-500/30 hover:to-blue-600/30 transition-all group"
                  >
                    <CreditCard className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-medium text-white">Connecter ma Banque</p>
                      <p className="text-sm text-gray-400">Analyse automatique</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </button>

                  <button 
                    onClick={() => setActiveTab('discover')}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg hover:from-purple-500/30 hover:to-purple-600/30 transition-all group"
                  >
                    <Users className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-medium text-white">Découvrir</p>
                      <p className="text-sm text-gray-400">Communauté & conseils</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </button>
                </div>
              </div>

              {/* Recent Analyses */}
              <div className="bg-[#1a2332]/60 border border-[#c5a572]/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-[#c5a572]" />
                    <span>Analyses Récentes</span>
                  </h2>
                  <button 
                    onClick={() => setActiveTab('analysis')}
                    className="text-[#c5a572] hover:text-[#e8cfa0] text-sm font-medium flex items-center space-x-1"
                  >
                    <span>Voir tout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {recentAnalyses.map((analysis, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#0f1419]/50 rounded-lg border border-[#c5a572]/10">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          analysis.status === 'completed' ? 'bg-green-400' :
                          analysis.status === 'in-progress' ? 'bg-yellow-400' : 'bg-gray-400'
                        }`} />
                        <div>
                          <p className="font-medium text-white">{analysis.title}</p>
                          <p className="text-sm text-gray-400">Gain potentiel: +{analysis.gain}€</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        analysis.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        analysis.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {analysis.status === 'completed' ? 'Terminé' :
                         analysis.status === 'in-progress' ? 'En cours' : 'En attente'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content */}
          {activeTab !== 'overview' && (
            <div className="p-6">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {sidebarItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-gray-400">Cette section est en cours de développement.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
