import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, LogOut, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FrancisAIEngine from '../ai/FrancisAIEngine';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// 🌍 Translations
const translations = {
  fr: {
    placeholder: "Posez votre question sur la fiscalité andorrane...",
    thinking: "Francis analyse...",
    welcome: "Bonjour ! Je suis Francis, votre expert fiscal andorran. Comment puis-je vous aider ?",
    logout: "Déconnexion"
  },
  es: {
    placeholder: "Haga su pregunta sobre la fiscalidad andorrana...",
    thinking: "Francis está analizando...",
    welcome: "¡Hola! Soy Francis, su experto fiscal andorrano. ¿En qué puedo ayudarle?",
    logout: "Cerrar sesión"
  }
};

export function FrancisAndorreChat() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // 🔒 Pro Access Only
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Check if user has pro subscription
    const isPro = user?.user_metadata?.subscription === 'pro' || 
                  user?.user_metadata?.plan === 'pro' ||
                  window.location.pathname.includes('/pro/');
    
    if (!isPro) {
      navigate('/upgrade');
      return;
    }
  }, [user, navigate]);
  
  // 🌍 Language Support
  const [language, setLanguage] = useState<'fr' | 'es'>('fr');
  const t = translations[language];
  
  // 🧠 Francis AI Engine
  const [aiEngine] = useState(() => new FrancisAIEngine());
  const [conversationContext, setConversationContext] = useState({
    previousMessages: [],
    userProfile: { interests: [] },
    sessionState: { language }
  });
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t.welcome,
      sender: 'ai',
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

  useEffect(() => {
    // Update welcome message when language changes
    setMessages(prev => prev.map((msg, index) => 
      index === 0 ? { ...msg, text: t.welcome } : msg
    ));
  }, [language, t.welcome]);

  const processUserMessage = async (userMessage: string) => {
    setIsProcessing(true);
    
    try {
      // Use Francis AI Engine
      const aiResponse = await aiEngine.processQuery(userMessage, conversationContext);
      
      // Update conversation context
      setConversationContext(prevContext => ({
        ...prevContext,
        previousMessages: [
          ...prevContext.previousMessages,
          {
            query: userMessage,
            response: aiResponse.text,
            timestamp: new Date()
          }
        ].slice(-10)
      }));
      
      // Processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: aiResponse.text,
        sender: 'ai',
        timestamp: new Date(),
      }]);
      
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: language === 'fr' 
          ? "Désolé, une erreur s'est produite. Veuillez réessayer." 
          : "Lo siento, se produjo un error. Por favor, inténtelo de nuevo.",
        sender: 'ai',
        timestamp: new Date(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim() && !isProcessing) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      processUserMessage(inputText);
      setInputText('');
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

  return (
    <div className="min-h-screen bg-[#0A192F] flex flex-col">
      {/* 🏷️ Minimal Header - Francis + Andorre only */}
      <header className="bg-[#162238] border-b border-[#c5a572]/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-[#c5a572]" />
              <span className="text-xl font-bold text-white">Francis</span>
              <span className="text-[#c5a572] text-lg">•</span>
              <span className="text-lg text-gray-300">Andorre</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === 'fr' ? 'es' : 'fr')}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-[#c5a572]/10 hover:bg-[#c5a572]/20 transition-colors"
            >
              <Globe className="h-4 w-4 text-[#c5a572]" />
              <span className="text-[#c5a572] text-sm font-medium">{language.toUpperCase()}</span>
            </button>
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="h-4 w-4 text-red-400" />
              <span className="text-red-400 text-sm">{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 💬 Pure Chat Interface */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-2xl ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' 
                    ? 'bg-[#c5a572]' 
                    : 'bg-[#162238] border border-[#c5a572]/30'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="h-4 w-4 text-[#162238]" />
                  ) : (
                    <Bot className="h-4 w-4 text-[#c5a572]" />
                  )}
                </div>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-[#c5a572] text-[#162238]'
                    : 'bg-[#162238] text-gray-100 border border-[#c5a572]/20'
                }`}>
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-2xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#162238] border border-[#c5a572]/30 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-[#c5a572]" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-[#162238] text-gray-100 border border-[#c5a572]/20">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-400">{t.thinking}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#c5a572]/20 p-6 bg-[#162238]">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.placeholder}
              disabled={isProcessing}
              className="flex-1 bg-[#0A192F] border border-[#c5a572]/30 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c5a572] focus:border-transparent disabled:opacity-50"
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
    </div>
  );
}
