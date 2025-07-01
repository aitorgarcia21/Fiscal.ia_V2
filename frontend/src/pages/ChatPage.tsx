import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, ArrowRight, MessageSquare, Euro, UserCog, Mic, MicOff, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/ui/Logo';
import apiClient from '../services/apiClient';
import { VoiceRecorder } from '../components/VoiceRecorder';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserProfileData {
  tmi: number | null;
  situation_familiale: string | null;
  nombre_enfants: number | null;
  residence_principale: boolean | null;
  residence_secondaire: boolean | null;
  revenus_annuels: number | null;
  charges_deductibles: number | null;
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceInput, setVoiceInput] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [initDone, setInitDone] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const currentInput = input;
    
    // Réponse instantanée - afficher immédiatement le message utilisateur
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setVoiceError(null);

    // Scroll immédiat vers le bas
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    let userProfileContext: UserProfileData | null = null;
    if (isAuthenticated && user && user.id) {
      try {
        const profile = await apiClient<UserProfileData>(`/api/user-profile/${user.id}`);
        if (profile) {
          userProfileContext = profile;
        }
      } catch (profileError: any) {
        console.warn("Avertissement: Impossible de charger le profil utilisateur pour enrichir le contexte IA (profil non trouvé ou erreur API).", profileError.message);
      }
    }

    try {
      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const payload: any = {
        question: currentInput,
        conversation_history: messages.map(msg => ({ role: msg.role, content: msg.content }))
      };

      if (userProfileContext) {
        payload.user_profile_context = userProfileContext;
      }

      const responseData = await apiClient<any>('/api/ask', {
        method: 'POST',
        data: payload,
      });

        const assistantMessage: Message = {
          role: 'assistant',
        content: responseData.answer || 'Je n\'ai pas pu traiter votre demande.'
        };
        setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      const errorMessage: Message = {
        role: 'assistant', 
        content: "Désolé, je rencontre un petit problème technique. Pouvez-vous reformuler votre question ? Je suis là pour vous aider !"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Scroll final après la réponse
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  };

  const handleVoiceUpdate = (text: string) => {
    setVoiceInput(text);
    setInput(text); // Met à jour le champ de texte en temps réel
  };

  const handleVoiceComplete = (text: string) => {
    setVoiceInput(text);
    setInput(text);
    // Optionnel: Envoyer automatiquement le message à la fin de la dictée
    // if (text.trim()) {
    //   handleSubmit(new Event('submit') as any);
    // }
    setShowVoiceRecorder(false);
  };

  const handleVoiceError = (error: string) => {
    setVoiceError(error);
    setTimeout(() => setVoiceError(null), 5000);
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    setShowVoiceRecorder(false);
    setVoiceError(null);
    
    if (!isVoiceMode) {
      setShowVoiceRecorder(true);
    }
  };

  useEffect(() => {
    // Scroll fluide vers le bas quand de nouveaux messages arrivent
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    };
    
    // Petit délai pour laisser le temps au DOM de se mettre à jour
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  useEffect(() => {
    if (!initDone) {
      let firstName = '';
      if (isAuthenticated && user && (user as any).user_metadata && (user as any).user_metadata.full_name) {
        const full = (user as any).user_metadata.full_name as string;
        firstName = full.split(' ')[0];
      }
      const greeting = `Bonjour${firstName ? ' ' + firstName : ''} ! Je suis Francis, votre copilote financier. Pose-moi toutes tes questions et je t'aiderai à trouver la meilleure stratégie.\nComplète ton profil pour des réponses encore plus précises.`;
      setMessages([{ role: 'assistant', content: greeting }]);
      setInitDone(true);
    }
  }, [isAuthenticated, user, initDone]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as any);
    }
  };

  // Optimisation : éviter les re-renders inutiles
  const memoizedMessages = React.useMemo(() => messages, [messages]);

  return (
    <div className="h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] flex flex-col">
      <div className="h-full w-full bg-[#1a2942]/80 backdrop-blur-sm overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-[#162238] border-b border-[#c5a572]/20 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="lg" />
              <div>
                <h1 className="text-xl font-bold text-white">Chat</h1>
                <p className="text-sm text-gray-400">Posez vos questions à Francis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <Link 
                  to="/profil"
                  className="text-sm text-[#c5a572] hover:text-[#e8cfa0] transition-colors flex items-center"
                >
                  <UserCog className="mr-1.5 w-4 h-4" /> Mon Profil
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to="/mes-donnees"
                  className="text-sm text-[#c5a572] hover:text-[#e8cfa0] transition-colors"
                >
                  RGPD
                </Link>
              )}
              <button 
                onClick={() => navigate('/discover')}
                className="text-sm text-[#c5a572] hover:text-[#e8cfa0] transition-colors flex items-center"
                aria-label="Découvrir d'autres utilisateurs"
              >
                Découvrir <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {memoizedMessages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 sm:p-4 rounded-lg shadow-md ${
                  message.role === 'user'
                    ? 'bg-[#c5a572] text-[#1a2942] rounded-br-none'
                    : 'bg-[#223c63]/80 text-white rounded-bl-none'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <Logo size="sm" />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{message.content}</p>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-7 h-7 bg-[#1a2942] rounded-full flex items-center justify-center border-2 border-[#c5a572]">
                      <UserIcon className="w-4 h-4 text-[#c5a572]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start p-4">
                <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                        <Logo size="sm" />
                    </div>
                    <div className="flex items-center space-x-3 bg-[#223c63]/80 p-4 rounded-lg rounded-bl-none shadow-md">
                        <span className="text-gray-300 text-sm">Francis réfléchit...</span>
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-[#c5a572]/20 flex-shrink-0">
          {/* Message d'erreur vocal */}
          {voiceError && (
            <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {voiceError}
            </div>
          )}
          
          {/* Mode vocal activé */}
          {isVoiceMode && (
            <div className="mb-3 p-3 bg-[#c5a572]/20 border border-[#c5a572]/30 rounded-lg text-[#c5a572] text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Mode vocal activé - Francis vous écoute automatiquement
            </div>
          )}
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isVoiceMode ? "Francis écoute votre voix..." : "Posez votre question à Francis..."}
              className="flex-1 px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
              disabled={isLoading}
              onKeyDown={handleKeyPress}
            />
            
            {/* Bouton mode vocal */}
            <button
              type="button"
              onClick={toggleVoiceMode}
              disabled={isLoading}
              className={`p-3 rounded-lg transition-all duration-300 flex items-center justify-center shadow-md border ${
                isVoiceMode 
                  ? 'bg-[#c5a572] text-[#1a2942] border-[#c5a572]' 
                  : 'bg-[#1a2942] text-[#c5a572] border-[#c5a572]/30 hover:bg-[#223c63]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isVoiceMode ? "Désactiver le mode vocal" : "Activer le mode vocal"}
            >
              {isVoiceMode ? <Volume2 className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#c5a572] text-[#1a2942] p-3 rounded-lg hover:bg-[#e8cfa0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
              aria-label="Envoyer le message" 
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* Enregistreur vocal optimisé */}
          {showVoiceRecorder && (
            <div className="mt-4 p-4 bg-[#1a2942]/30 border border-[#c5a572]/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#c5a572] flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  {isVoiceMode ? "Mode vocal Francis" : "Enregistrement vocal"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowVoiceRecorder(false);
                    setIsVoiceMode(false);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <VoiceRecorder
                onTranscriptionUpdate={handleVoiceUpdate}
                onTranscriptionComplete={handleVoiceComplete}
                onError={handleVoiceError}
                disabled={isLoading}
                className="flex justify-center"
              />
              {voiceInput && (
                <p className="mt-2 text-sm text-gray-300">
                  <span className="font-semibold">Texte dicté:</span> {voiceInput}
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
