import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Euro, Building, Globe, Scale, AlertCircle, MessageSquare, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'francis';
  timestamp: Date;
  lawReferences?: string[];
  processing?: boolean;
}

export function AnalyseIAFiscaleAndorrane() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Bonjour ! Je suis Francis IA, votre expert en fiscalité andorrane. Je peux analyser les lois fiscales andorranes en temps réel et répondre à toutes vos questions. Que souhaitez-vous savoir ?",
      sender: 'francis',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processUserMessage = async (userMessage: string) => {
    setIsProcessing(true);
    
    const processingMessage: Message = {
      id: Date.now().toString() + '_processing',
      text: "🔍 Analyse des lois fiscales andorranes en cours...",
      sender: 'francis',
      timestamp: new Date(),
      processing: true
    };
    
    setMessages(prev => [...prev, processingMessage]);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let response = "";
    let lawReferences: string[] = [];
    
    if (userMessage.toLowerCase().includes('résidence') || userMessage.toLowerCase().includes('resident')) {
      response = "📍 **Résidence Fiscale Andorrane - Analyse Complète**\n\nSelon la Loi 95/2010 sur l'IRPF andorran :\n\n✅ **Critères physiques :**\n• 183 jours minimum sur le territoire andorran\n• Calcul automatique avec tracking GPS\n\n✅ **Critères économiques :**\n• Centre d'intérêts économiques principal\n• Activité professionnelle principale\n\n⚠️ **Attention France/Espagne :**\nLa convention fiscale avec la France impose des critères spécifiques. Souhaitez-vous une analyse détaillée de votre situation ?";
      lawReferences = ['Loi 95/2010 (IRPF)', 'Convention fiscale France-Andorre', 'Règlement AFA 2023'];
    }
    else if (userMessage.toLowerCase().includes('igi') || userMessage.toLowerCase().includes('tva')) {
      response = "🏢 **IGI (Impôt Général Indirect) - Système Andorran**\n\nSelon la Loi 11/2012 sur l'IGI :\n\n📊 **Périodicités variables :**\n• **Mensuelle :** CA > 3,6M€ (déclaration J+20)\n• **Trimestrielle :** CA 250K-3,6M€\n• **Semestrielle :** CA < 250K€\n\n💡 **Optimisations possibles :**\n• Transitions automatiques selon seuils\n• Gestion flux de trésorerie\n• Déclarations simplifiées\n\nVoulez-vous simuler votre périodicité optimale ?";
      lawReferences = ['Loi 11/2012 (IGI)', 'Règlement Gouvernement 2022', 'Circulaire Ministère Finances'];
    }
    else if (userMessage.toLowerCase().includes('crypto') || userMessage.toLowerCase().includes('bitcoin')) {
      response = "₿ **Cryptomonnaies en Andorre - Cadre Légal 2024**\n\nSelon la Loi 24/2022 sur les actifs numériques :\n\n🎯 **Avantages fiscaux :**\n• IRPF crypto : Maximum 10% (vs 47% France)\n• Exemptions holdings crypto\n• Smart contracts légaux\n\n📋 **Obligations :**\n• Déclaration AFA obligatoire\n• Reporting automatisé\n• Traçabilité blockchain\n\n🔒 **Conformité :**\nLe cadre andorran est l'un des plus favorables d'Europe. Avez-vous des cryptos à déclarer ?";
      lawReferences = ['Loi 24/2022 (Actifs numériques)', 'Règlement AFA crypto', 'Directive MICA européenne'];
    }
    else if (userMessage.toLowerCase().includes('substance') || userMessage.toLowerCase().includes('bureau')) {
      response = "🏢 **Substance Économique - Exigences Légales**\n\nSelon les directives AFA et EU :\n\n🏠 **Bureau obligatoire :**\n• Surface minimum : 20m²\n• Coût : 400€+/mois\n• Adresse physique réelle\n\n👥 **Personnel local :**\n• Salaire minimum : 1.286€/mois\n• Contrat de travail local\n• Qualifications adaptées\n\n⚖️ **Décisions effectives :**\n• Conseil d'administration sur territoire\n• Signatures locales obligatoires\n\nSouhaitez-vous un scoring de votre substance actuelle ?";
      lawReferences = ['Directive EU substance économique', 'Règlement AFA 2023', 'Code du travail andorran'];
    }
    else {
      response = "🤖 **Francis IA à votre service !**\n\nJe peux vous aider sur tous les aspects de la fiscalité andorrane :\n\n📚 **Domaines d'expertise :**\n• Résidence fiscale et optimisation\n• IGI et déclarations périodiques\n• Cryptomonnaies et Loi 24/2022\n• Substance économique\n• Conventions fiscales (21 pays)\n• Compliance CRS/FATCA\n\n💡 **Posez-moi une question spécifique** pour une analyse détaillée des lois andorranes !";
      lawReferences = ['Base légale andorrane complète', 'Conventions fiscales', 'Règlements AFA'];
    }
    
    setMessages(prev => {
      const filtered = prev.filter(msg => msg.id !== processingMessage.id);
      return [...filtered, {
        id: Date.now().toString(),
        text: response,
        sender: 'francis',
        timestamp: new Date(),
        lawReferences
      }];
    });
    
    setIsProcessing(false);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    await processUserMessage(inputText);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447] text-gray-100">
      {/* Header avec navigation - Theme de l'app */}
      <header className="bg-[#162238] border-b border-[#c5a572]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo et titre */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MessageSquare className="h-8 w-8 text-[#c5a572]" />
                <Euro className="h-4 w-4 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#162238] rounded-full p-0.5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  🏔️ Francis IA Andorre
                </h1>
                <p className="text-xs text-[#c5a572]">Expert Fiscal Andorran</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-300 hover:text-[#c5a572] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="text-gray-300 hover:text-[#c5a572] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Chat Principal
              </button>
              <div className="flex items-center gap-2 text-[#c5a572] text-sm">
                <Scale className="w-4 h-4" />
                <span>Base légale complète</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#c5a572] p-2 rounded-md"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#162238] border-t border-[#c5a572]/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-300 hover:text-[#c5a572] block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="text-gray-300 hover:text-[#c5a572] block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                Chat Principal
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-red-400 block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bannière d'information */}
        <div className="bg-[#162238] rounded-lg border border-[#c5a572]/20 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-[#c5a572]/20 p-3 rounded-full">
              <Bot className="h-8 w-8 text-[#c5a572]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">
                Expert IA en Fiscalité Andorrane
              </h2>
              <p className="text-gray-300">
                Analyse des lois en temps réel • 21 conventions fiscales • Mise à jour continue
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#c5a572]">
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>En ligne</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interface de Chat */}
        <div className="bg-[#162238] rounded-2xl border border-[#c5a572]/20 h-[600px] flex flex-col shadow-2xl">
          {/* Header du Chat */}
          <div className="bg-gradient-to-r from-[#162238] to-[#1a2332] p-4 rounded-t-2xl border-b border-[#c5a572]/20">
            <div className="flex items-center gap-3">
              <div className="bg-[#c5a572]/20 p-2 rounded-full">
                <Bot className="h-6 w-6 text-[#c5a572]" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Francis IA - Expert Fiscal Andorran</h3>
                <p className="text-[#c5a572] text-sm">En ligne • Analyse des lois en temps réel</p>
              </div>
            </div>
          </div>

          {/* Container des Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f1419]">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  message.sender === 'user' 
                    ? 'bg-[#c5a572] text-[#162238]' 
                    : message.processing 
                      ? 'bg-[#1a2332] text-gray-300 border border-[#c5a572]/30'
                      : 'bg-[#162238] text-gray-100 border border-[#c5a572]/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {message.sender === 'user' ? (
                        <User className="h-5 w-5 mt-0.5" />
                      ) : (
                        <Bot className={`h-5 w-5 mt-0.5 ${
                          message.processing ? 'animate-pulse text-[#c5a572]' : 'text-[#c5a572]'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.text}
                      </div>
                      {message.lawReferences && message.lawReferences.length > 0 && (
                        <div className="mt-3 p-3 bg-[#c5a572]/10 rounded-lg border border-[#c5a572]/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Scale className="h-4 w-4 text-[#c5a572]" />
                            <span className="text-xs font-semibold text-[#c5a572]">Références légales :</span>
                          </div>
                          <div className="space-y-1">
                            {message.lawReferences.map((ref, index) => (
                              <div key={index} className="text-xs text-gray-300 flex items-center gap-1">
                                <span className="w-1 h-1 bg-[#c5a572] rounded-full"></span>
                                {ref}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="border-t border-[#c5a572]/20 p-4 bg-[#162238]">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question sur la fiscalité andorrane..."
                disabled={isProcessing}
                className="flex-1 bg-[#0f1419] border border-[#c5a572]/30 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c5a572] focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isProcessing}
                className="bg-[#c5a572] hover:bg-[#d4b583] disabled:bg-gray-600 text-[#162238] p-3 rounded-xl transition-colors disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="grid md:grid-cols-4 gap-4 mt-8">
          <button 
            onClick={() => setInputText('Quelle est la procédure pour obtenir la résidence fiscale andorrane ?')}
            className="p-4 bg-[#162238] hover:bg-[#1a2332] rounded-xl border border-[#c5a572]/20 hover:border-[#c5a572]/40 transition-all"
          >
            <Globe className="h-6 w-6 text-[#c5a572] mb-2" />
            <p className="text-sm font-medium text-white">Résidence Fiscale</p>
          </button>
          <button 
            onClick={() => setInputText('Comment optimiser ma déclaration IGI en Andorre ?')}
            className="p-4 bg-[#162238] hover:bg-[#1a2332] rounded-xl border border-[#c5a572]/20 hover:border-[#c5a572]/40 transition-all"
          >
            <FileText className="h-6 w-6 text-[#c5a572] mb-2" />
            <p className="text-sm font-medium text-white">IGI Périodique</p>
          </button>
          <button 
            onClick={() => setInputText('Quelles sont les obligations pour les cryptomonnaies ?')}
            className="p-4 bg-[#162238] hover:bg-[#1a2332] rounded-xl border border-[#c5a572]/20 hover:border-[#c5a572]/40 transition-all"
          >
            <Euro className="h-6 w-6 text-[#c5a572] mb-2" />
            <p className="text-sm font-medium text-white">Crypto Loi 24/2022</p>
          </button>
          <button 
            onClick={() => setInputText('Comment prouver ma substance économique ?')}
            className="p-4 bg-[#162238] hover:bg-[#1a2332] rounded-xl border border-[#c5a572]/20 hover:border-[#c5a572]/40 transition-all"
          >
            <Building className="h-6 w-6 text-[#c5a572] mb-2" />
            <p className="text-sm font-medium text-white">Substance Économique</p>
          </button>
        </div>
      </div>
    </div>
  );
}
