import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, Sparkles, TrendingUp, Send, Bot, Zap, Crown, Star, MessageSquare, Euro, Award, ChevronRight, Building, Users, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Transition } from '../components/ui/Transition';
import { ProDemoSection } from '../components/demo/ProDemoSection';

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
      {/* Particules discrètes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#c5a572]/30 rounded-full"
            animate={{
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
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

      {/* Effets lumineux subtils */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-[#c5a572]/15 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-t from-[#e8cfa0]/10 to-transparent rounded-full blur-xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        
        {/* En-tête professionnel */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Link to="/" className="inline-flex items-center text-[#e8cfa0] hover:text-white transition-colors mb-8 group backdrop-blur-sm bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <ArrowRight className="h-5 w-5 rotate-180 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            Retour à l&apos;accueil
          </Link>
          
          <div className="flex flex-col items-center mb-8">
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <span className="relative inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-bold px-6 py-2 rounded-xl text-sm shadow-lg border border-white/20">
                <Building className="w-4 h-4" />
                Intelligence Artificielle Fiscale
                <Shield className="w-4 h-4" />
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Francis Assistant Expert
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-300 max-w-3xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Découvrez comment notre IA révolutionne le conseil fiscal. 
              <br />
              <span className="text-[#c5a572] font-semibold">Testez en temps réel</span> les capacités d&apos;analyse de Francis.
            </motion.p>
          </div>
        </motion.div>

        {/* Statistiques crédibles */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-full max-w-4xl mb-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    icon: TrendingUp, 
                    number: "1 847€", 
                    label: "Économie fiscale moyenne",
                    sublabel: "Par client et par an",
                    color: "from-green-500 to-emerald-600",
                    delay: 0.2
                  },
                  { 
                    icon: Users, 
                    number: "2 400+", 
                    label: "Clients accompagnés",
                    sublabel: "Depuis le lancement",
                    color: "from-blue-500 to-cyan-600",
                    delay: 0.4
                  },
                  { 
                    icon: Calculator, 
                    number: "< 30s", 
                    label: "Analyse de situation",
                    sublabel: "En temps réel",
                    color: "from-purple-500 to-pink-600",
                    delay: 0.6
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: stat.delay, type: "spring" }}
                    className="relative group"
                  >
                    <div className="relative bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-sm rounded-xl p-6 border border-white/15 hover:border-white/25 transition-all duration-300 group-hover:scale-[1.02]">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.number}
                        </div>
                      </div>
                      <h3 className="text-white font-semibold text-base mb-1">{stat.label}</h3>
                      <p className="text-gray-400 text-sm">{stat.sublabel}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interface de démo professionnelle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="w-full max-w-5xl mx-auto relative"
        >
          <div className="relative bg-gradient-to-br from-[#0A1628]/90 via-[#0F1B2F]/90 to-[#162238]/90 backdrop-blur-lg rounded-xl shadow-xl border border-[#c5a572]/25 overflow-hidden">
            {/* Header interface */}
            <div className="bg-gradient-to-r from-[#c5a572]/8 to-[#e8cfa0]/8 p-6 border-b border-[#c5a572]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="relative w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-xl flex items-center justify-center shadow-lg">
                      <Bot className="w-6 h-6 text-[#162238]" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0A1628]" />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">Francis Expert IA</h3>
                    <p className="text-[#c5a572] text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Conseiller fiscal certifié • En ligne
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Shield className="w-4 h-4 text-[#c5a572]" />
                  <span>Sécurisé & Confidentiel</span>
                </div>
              </div>
            </div>

            {/* Zone de conversation */}
            <div className="p-8">
              <ProDemoSection />
              
              {/* Interface d'interaction */}
              <motion.div
                className="mt-8 p-6 bg-gradient-to-br from-white/5 to-white/8 rounded-xl border border-white/15"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Calculator className="w-5 h-5 text-[#c5a572]" />
                  <h4 className="text-white font-semibold">Analysez votre situation fiscale</h4>
                  <div className="ml-auto bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded border border-green-500/30">
                    CALCUL EN TEMPS RÉEL
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ex: J'ai 45k€ de revenus, marié avec 2 enfants, comment optimiser ?"
                      className="w-full px-4 py-4 bg-[#162238]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/30 transition-all duration-300"
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
                          className="w-5 h-5 flex items-center justify-center"
                        >
                          ⟳
                        </motion.div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </form>

                {/* Réponse Francis */}
                <AnimatePresence>
                  {response && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-6 p-4 bg-gradient-to-r from-[#c5a572]/8 to-[#e8cfa0]/8 rounded-xl border border-[#c5a572]/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-[#162238]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[#c5a572] font-medium text-sm">Francis Expert</span>
                            <span className="text-xs text-gray-400">• Réponse instantanée</span>
                          </div>
                          <p className="text-white">{response}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Suggestions */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Analyser ma déclaration 2024",
                    "Optimiser pour 2025",
                    "Stratégie patrimoine",
                    "Investissement LMNP"
                  ].map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.8 + index * 0.1 }}
                      onClick={() => setQuestion(suggestion)}
                      className="text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-[#c5a572]/30 transition-all duration-300 text-sm text-gray-300 hover:text-white"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Call to action professionnel */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.6 }}
        >
          <Link
            to="/"
            className="group px-8 py-4 bg-white/8 text-white font-semibold rounded-xl hover:bg-white/12 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 border border-white/20 hover:border-white/30 backdrop-blur-sm"
          >
            <ArrowRight className="h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Retour à l&apos;accueil
          </Link>
          
          <motion.button
            onClick={() => window.location.href = '/signup'}
            className="group relative px-10 py-4 bg-gradient-to-r from-[#c5a572] via-[#d4b885] to-[#e8cfa0] text-[#162238] font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 overflow-hidden"
            whileHover={{ 
              boxShadow: "0px 15px 35px rgba(197, 165, 114, 0.3)" 
            }}
          >
            <Building className="w-5 h-5" />
            <span className="font-bold">Accéder à Francis Pro</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>

        {/* Badges de confiance */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#c5a572]" />
              <span>Données sécurisées</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#c5a572]" />
              <span>Conforme réglementation</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#c5a572]" />
              <span>Certifié expert</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 