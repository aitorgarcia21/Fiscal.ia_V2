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
  Upload
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
  const [activeTab, setActiveTab] = useState('francis');
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
    { id: 'francis', icon: MessageSquare, label: 'Francis Chat' },
    { id: 'settings', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447] text-gray-100">
      {/* Header supprimé */}
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#1a2332]/95 backdrop-blur-lg border-r border-[#c5a572]/20 transition-transform duration-300 ease-in-out overflow-y-auto`}>
          <div className="p-6 space-y-6">
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
          {activeTab === 'francis' && (
            <div className="h-[calc(100vh-80px)] flex flex-col">
              {/* Chat Header */}
              <div className="bg-[#1a2332]/50 border-b border-[#c5a572]/20 p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <MessageSquare className="w-10 h-10 text-[#c5a572]" />
                    <Euro className="w-5 h-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2332] rounded-full p-0.5" />
                  </div>
                </div>
              </div>

              {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                          message.role === 'user'
                          ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2332]'
                          : 'bg-[#1a2332]/80 text-white border border-[#c5a572]/20'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {message.role === 'assistant' && (
                          <div className="w-6 h-6 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center relative">
                            <MessageSquare className="w-3 h-3 text-[#1a2332]" />
                            <Euro className="w-2 h-2 text-[#1a2332] absolute -bottom-1 -right-1 bg-[#e8cfa0] rounded-full p-0.5" />
                          </div>
                        )}
                        <div className="flex-1">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                          {message.attachments && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((file, fileIndex) => (
                                <div key={fileIndex} className="flex items-center space-x-2 text-xs opacity-80">
                                  <FileText className="w-3 h-3" />
                                  <span>{file.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-[#1a2332]/60' : 'text-gray-400'}`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-6 h-6 bg-[#1a2332] rounded-full flex items-center justify-center">
                            <UserIcon className="w-3 h-3 text-[#c5a572]" />
                          </div>
                        )}
                      </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                    <div className="bg-[#1a2332]/80 p-4 rounded-lg border border-[#c5a572]/20">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                
              {/* Selected Files Display */}
              {selectedFiles.length > 0 && (
                <div className="px-4 py-2 bg-[#1a2332]/30 border-t border-[#c5a572]/20">
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-[#c5a572]/20 px-3 py-1 rounded-lg text-sm">
                        <FileText className="w-4 h-4 text-[#c5a572]" />
                        <span className="text-white">{file.name}</span>
                    <button
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-white"
                    >
                          <X className="w-3 h-3" />
                    </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="bg-[#1a2332]/50 border-t border-[#c5a572]/20 p-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#0f1419]/50 border border-[#c5a572]/20 p-3 rounded-lg hover:bg-[#c5a572]/20 transition-all text-gray-400 hover:text-[#c5a572]"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                    <input
                      type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Posez votre question à Francis ou attachez un document..."
                    className="flex-1 px-4 py-3 bg-[#0f1419]/50 border border-[#c5a572]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || (!inputMessage.trim() && selectedFiles.length === 0)}
                    className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2332] p-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Other tabs content */}
          {activeTab !== 'francis' && (
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
