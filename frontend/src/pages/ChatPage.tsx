import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, ArrowRight, MessageSquare, Euro, UserCog } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';

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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis Francis, votre assistant financier IA. Posez-moi vos questions sur les impôts, la fiscalité ou l'optimisation de vos finances personnelles. Pour des conseils encore plus précis, n'hésitez pas à compléter votre profil !"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

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
        conversation_history: messages.map(msg => ({ role: msg.role, content: msg.content })).concat([userMessage])
      };

      if (userProfileContext) {
        payload.user_profile_context = userProfileContext;
      }

      const response = await fetch('/api/ask', { 
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.answer || 'Je n\'ai pas pu traiter votre demande.'
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorData = await response.json().catch(() => ({ detail: "Erreur de communication avec Francis"}));
        throw new Error(errorData.detail || 'Erreur de communication avec Francis');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error.message || "Désolé, une erreur s'est produite. Veuillez réessayer." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] p-4 flex flex-col">
      <div className="max-w-4xl w-full mx-auto bg-[#1a2942]/80 backdrop-blur-sm rounded-xl border border-[#c5a572]/20 overflow-hidden flex flex-col shadow-2xl flex-grow">
        {/* Header */}
        <div className="bg-[#162238] border-b border-[#c5a572]/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#162238]" />
              </div>
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
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
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
                    <div className="flex-shrink-0 w-7 h-7 bg-[#c5a572] rounded-full flex items-center justify-center relative border-2 border-[#1a2942]">
                      <MessageSquare className="w-4 h-4 text-[#1a2942]" />
                      <Euro className="w-3 h-3 text-[#1a2942] absolute -bottom-1.5 -right-1.5 bg-[#c5a572] rounded-full p-0.5 border border-[#1a2942]" />
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
                    <div className="flex-shrink-0 w-7 h-7 bg-[#c5a572] rounded-full flex items-center justify-center relative border-2 border-[#1a2942]">
                        <MessageSquare className="w-4 h-4 text-[#1a2942]" />
                        <Euro className="w-3 h-3 text-[#1a2942] absolute -bottom-1.5 -right-1.5 bg-[#c5a572] rounded-full p-0.5 border border-[#1a2942]" />
                    </div>
                    <div className="flex items-center space-x-1.5 bg-[#223c63]/80 p-3 rounded-lg rounded-bl-none shadow-md">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-[#c5a572]/20">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question à Francis..."
              className="flex-1 px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572] transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#c5a572] text-[#1a2942] p-3 rounded-lg hover:bg-[#e8cfa0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
              aria-label="Envoyer le message" 
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
