import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, Sparkles, TrendingUp, Send, Bot, Zap, Crown, Star, MessageSquare, Euro, Award, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Transition } from '../components/ui/Transition';
import { DemoConversation } from '../components/demo/DemoConversation';

export function DemoPage() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'assistant', content: string }>>([]);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    const userQuestion = question;
    setQuestion('');
    
    setChatHistory(prev => [...prev, { type: 'user', content: userQuestion }]);
    
    setTimeout(() => {
      const assistantResponse = "Excellent ! D'après votre profil, je détecte plusieurs optimisations possibles. Avec un PER, vous pourriez économiser jusqu'à 1 100€ d'impôt par an. Voulez-vous que je vous détaille une stratégie personnalisée ? 🎯";
      setResponse(assistantResponse);
      setChatHistory(prev => [...prev, { type: 'assistant', content: assistantResponse }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0F1B2F] to-[#162238] overflow-hidden relative">
      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#c5a572]/40 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Effets lumineux */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-[#c5a572]/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-t from-[#e8cfa0]/15 to-transparent rounded-full blur-2xl" />

      {/* Motif géométrique animé */}
      <motion.div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #c5a572 1px, transparent 1px), radial-gradient(circle at 75% 75%, #e8cfa0 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        
        {/* En-tête spectaculaire */}
        <motion.div 
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-16"
        >
          <Link to="/" className="inline-flex items-center text-[#e8cfa0] hover:text-white transition-colors mb-8 group backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <ArrowRight className="h-5 w-5 rotate-180 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>
          
          <div className="flex flex-col items-center mb-8">
            <motion.div
              className="relative mb-6"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full blur-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-bold px-6 py-2 rounded-full text-sm shadow-2xl border-2 border-white/20">
                <Crown className="w-4 h-4" />
                Démo Intelligence Artificielle
                <Sparkles className="w-4 h-4 animate-spin" />
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#c5a572] to-[#e8cfa0] mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Francis en Action
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Découvrez comment l&apos;IA révolutionne l&apos;optimisation fiscale. 
              <br />
              <span className="text-[#c5a572] font-semibold">Testez gratuitement</span> et voyez la puissance de Francis.
            </motion.p>
          </div>
        </motion.div>

        {/* Statistiques impressionnantes */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-full max-w-4xl mb-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    icon: TrendingUp, 
                    number: "1 847€", 
                    label: "Économie moyenne par utilisateur",
                    color: "from-green-500 to-emerald-600",
                    delay: 0.2
                  },
                  { 
                    icon: Award, 
                    number: "97%", 
                    label: "Taux de satisfaction",
                    color: "from-blue-500 to-cyan-600",
                    delay: 0.4
                  },
                  { 
                    icon: Zap, 
                    number: "< 2min", 
                    label: "Temps de réponse moyen",
                    color: "from-purple-500 to-pink-600",
                    delay: 0.6
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: stat.delay, type: "spring" }}
                    className="relative group"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity`} />
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 group-hover:scale-105">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <motion.div
                          className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: stat.delay }}
                        >
                          {stat.number}
                        </motion.div>
                      </div>
                      <p className="text-gray-300 text-sm font-medium">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interface de démo révolutionnaire */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="w-full max-w-5xl mx-auto relative"
        >
          <div className="absolute -inset-8 bg-gradient-to-r from-[#c5a572]/20 via-[#e8cfa0]/20 to-[#c5a572]/20 rounded-3xl blur-2xl" />
          
          <div className="relative bg-gradient-to-br from-[#0A1628]/95 via-[#0F1B2F]/95 to-[#162238]/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-[#c5a572]/40 overflow-hidden">
            <div className="bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/10 p-6 border-b border-[#c5a572]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <motion.div
                      className="absolute -inset-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full blur-md"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="relative w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6 text-[#162238]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold flex items-center gap-2">
                      Francis Assistant IA
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <div className="w-3 h-3 bg-green-400 rounded-full" />
                      </motion.div>
                    </h3>
                    <p className="text-[#c5a572] text-sm">Conseiller fiscal intelligent • En ligne</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <DemoConversation />
              
              <motion.div
                className="mt-8 p-6 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl border border-white/20"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-[#c5a572]" />
                  </motion.div>
                  <h4 className="text-white font-semibold">Posez votre question à Francis</h4>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ex: Comment optimiser mes impôts avec 50k€ de revenus ?"
                      className="w-full px-4 py-4 bg-[#162238]/50 border border-[#c5a572]/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/20 transition-all duration-300"
                    />
                    <motion.button
                      type="submit"
                      disabled={isLoading || !question.trim()}
                      className="absolute right-2 top-2 p-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5"
                        >
                          ⟳
                        </motion.div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </form>

                <AnimatePresence>
                  {response && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-6 p-4 bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/10 rounded-xl border border-[#c5a572]/30"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-[#162238]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white">{response}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Boutons d'action */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <Link
            to="/"
            className="group px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all transform hover:scale-105 flex items-center justify-center gap-3 border border-white/30 hover:border-white/50 backdrop-blur-sm"
          >
            <ArrowRight className="h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Retour à l&apos;accueil
          </Link>
          
          <motion.button
            onClick={() => window.location.href = '/signup'}
            className="group relative px-10 py-4 bg-gradient-to-r from-[#c5a572] via-[#d4b885] to-[#e8cfa0] text-[#162238] font-bold rounded-2xl shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 overflow-hidden"
            whileHover={{ 
              boxShadow: "0px 20px 40px rgba(197, 165, 114, 0.4)" 
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.8 }}
            />
            
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            
            <span className="relative z-10 font-extrabold">Créer mon compte Francis</span>
            
            <motion.div
              className="group-hover:translate-x-1 transition-transform"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Message de confiance */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Shield className="w-4 h-4 text-[#c5a572]" />
            <span>100% sécurisé • Données chiffrées • Conforme RGPD</span>
            <Shield className="w-4 h-4 text-[#c5a572]" />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 