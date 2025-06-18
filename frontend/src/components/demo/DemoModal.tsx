import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Users, Check, Sparkles, CreditCard, X, MessageSquare, Euro, Calculator, Home, Heart, Bot, ChevronRight, TrendingUp, Target, Zap, Star, Crown, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DemoModalProps {
  onClose: () => void;
  onStart: () => void;
}

export function DemoModal({ onClose, onStart }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showImpact, setShowImpact] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowImpact(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      {/* Particules flottantes en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#c5a572]/30 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: "spring", stiffness: 280, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl bg-gradient-to-br from-[#0A1628] via-[#0F1B2F] to-[#162238] rounded-3xl overflow-hidden border border-[#c5a572]/40 shadow-2xl shadow-[#c5a572]/30 backdrop-blur-lg relative"
      >
        {/* Effets lumineux */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-[#c5a572]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-t from-[#e8cfa0]/15 to-transparent rounded-full blur-2xl" />

        {/* Header spectaculaire */}
        <div className="relative bg-gradient-to-r from-[#0A1628]/95 via-[#162238]/95 to-[#1E3253]/95 backdrop-blur-sm border-b border-[#c5a572]/30 p-6 sm:p-8">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#c5a572]/10 via-transparent to-[#e8cfa0]/10"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                {/* Halo lumineux animé */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-3xl blur-xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Cercle externe rotatif */}
                <motion.div 
                  className="absolute -inset-2 border-2 border-[#c5a572]/50 rounded-3xl"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="relative bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] p-4 rounded-3xl shadow-2xl">
                  <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-[#162238]" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Crown className="h-6 w-6 text-[#FFD700] drop-shadow-lg" />
                  </motion.div>
                </div>
              </div>
              
              <div>
                <motion.h3 
                  className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0%', '100%', '0%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Francis en Action 🚀
                </motion.h3>
                <motion.p 
                  className="text-lg sm:text-xl text-[#c5a572] font-semibold mt-1 flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Optimisation fiscale intelligente
                  <Sparkles className="w-5 h-5 animate-spin" style={{ animationDelay: '1s' }} />
                </motion.p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/20 transition-all duration-300 border border-transparent hover:border-white/30 backdrop-blur-sm"
              aria-label="Fermer la démo"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Zone de conversation révolutionnaire */}
        <div className="relative p-6 sm:p-8">
          <div className="bg-gradient-to-br from-[#0A1628]/90 via-[#0F1B2F]/90 to-[#162238]/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 max-h-[65vh] overflow-y-auto border border-[#c5a572]/20 shadow-2xl relative">
            
            {/* Motif de fond subtil */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, #c5a572 1px, transparent 1px), radial-gradient(circle at 80% 50%, #e8cfa0 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />
            
            <div className="relative z-10 space-y-8 sm:space-y-10">
              
              {/* Message Francis - Introduction spectaculaire */}
              <motion.div 
                initial={{ opacity: 0, x: -50, scale: 0.9 }} 
                animate={{ opacity: 1, x: 0, scale: 1 }} 
                transition={{ duration: 0.8, delay: 0.2, type: "spring" }} 
                className="flex gap-4 items-start"
              >
                <div className="relative flex-shrink-0">
                  {/* Avatar Francis avec effets */}
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-r from-[#c5a572]/30 to-[#e8cfa0]/30 rounded-full blur-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <div className="relative w-14 h-14 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20">
                    <Bot className="w-7 h-7 text-[#162238]" />
                    <motion.div
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-[#0A1628] flex items-center justify-center"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>
                </div>
                
                <div className="flex-1 bg-gradient-to-br from-white/15 via-white/10 to-white/5 p-6 sm:p-8 rounded-3xl rounded-tl-lg border border-white/20 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                  {/* Effet de lueur interne */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0]" />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        👋
                      </motion.div>
                      <h4 className="text-white text-xl sm:text-2xl font-bold">
                        Salut Paul ! Optimisons ton impôt 2025 ?
                      </h4>
                    </div>
                    
                    <p className="text-gray-300 text-lg mb-6">
                      J'ai analysé ton profil fiscal. Regarde ça :
                    </p>
                  </motion.div>
                  
                  {/* Données du profil avec animations séquentielles */}
                  <div className="bg-black/40 rounded-2xl p-5 sm:p-6 space-y-4 border border-[#c5a572]/30 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#c5a572]/5 to-[#e8cfa0]/5" />
                    
                    {[
                      { icon: TrendingUp, text: "Revenu net imposable 2024 : 50 000 €", color: "text-blue-400", delay: 0.8 },
                      { icon: Users, text: "Marié avec 1 enfant à charge", color: "text-green-400", delay: 1.2 },
                      { icon: Target, text: "Objectif : réduire l'impôt + préparer retraite", color: "text-purple-400", delay: 1.6 }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -30, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: item.delay, type: "spring", stiffness: 200 }}
                        className="flex items-center gap-4 relative z-10"
                      >
                        <motion.div
                          className={`w-10 h-10 bg-gradient-to-br from-${item.color.split('-')[1]}-500/20 to-${item.color.split('-')[1]}-600/20 rounded-xl flex items-center justify-center border border-${item.color.split('-')[1]}-500/30`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </motion.div>
                        <p className={`${item.color} font-semibold text-lg`}>{item.text}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.p 
                    className="text-white text-xl font-medium mt-6 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                  >
                    C'est bien ça ? 
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 2.5 }}
                    >
                      🤔
                    </motion.span>
                  </motion.p>
                </div>
              </motion.div>

              {/* Message Paul - Confirmation explosive */}
              <motion.div 
                initial={{ opacity: 0, x: 50, scale: 0.9 }} 
                animate={{ opacity: 1, x: 0, scale: 1 }} 
                transition={{ duration: 0.8, delay: 2.5, type: "spring" }} 
                className="flex gap-4 items-start justify-end"
              >
                <div className="flex-1 max-w-lg bg-gradient-to-br from-[#c5a572] via-[#d4b885] to-[#e8cfa0] p-6 sm:p-8 rounded-3xl rounded-br-lg text-[#162238] shadow-2xl relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                  
                  <div className="relative z-10">
                    <motion.p 
                      className="text-xl sm:text-2xl font-bold flex items-center gap-2"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 3, type: "spring" }}
                    >
                      Oui, c'est parfait ! 
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                      >
                        ✨
                      </motion.span>
                    </motion.p>
                    <p className="text-[#162238]/80 mt-2 text-lg font-medium">
                      Montre-moi la magie Francis !
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <motion.div
                    className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-2xl">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Message Francis - Solutions révolutionnaires */}
              <motion.div 
                initial={{ opacity: 0, x: -50, scale: 0.9 }} 
                animate={{ opacity: 1, x: 0, scale: 1 }} 
                transition={{ duration: 0.8, delay: 3.5, type: "spring" }} 
                className="flex gap-4 items-start"
              >
                <div className="relative flex-shrink-0">
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-r from-[#c5a572]/40 to-[#e8cfa0]/40 rounded-full blur-xl"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  
                  <div className="relative w-14 h-14 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20">
                    <Zap className="w-7 h-7 text-[#162238]" />
                    <motion.div
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-[#0A1628] flex items-center justify-center"
                      animate={{ 
                        scale: [1, 1.4, 1],
                        rotate: [0, 360]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Star className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>
                </div>
                
                <div className="flex-1 bg-gradient-to-br from-white/15 via-white/10 to-white/5 p-6 sm:p-8 rounded-3xl rounded-tl-lg border border-white/20 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#c5a572] via-[#e8cfa0] to-[#c5a572]" />
                  
                  <motion.div
                    className="flex items-center gap-3 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 4 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-6 h-6 text-[#c5a572]" />
                    </motion.div>
                    <h4 className="text-white text-xl sm:text-2xl font-bold">
                      🎯 Stratégie personnalisée détectée !
                    </h4>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      🚀
                    </motion.div>
                  </motion.div>
                  
                  <div className="space-y-6">
                    {/* Solutions avec effets visuels avancés */}
                    {[
                      {
                        number: "1",
                        title: "Plan Épargne Retraite (PER)",
                        icon: Calculator,
                        color: "green",
                        bgFrom: "from-green-500/20",
                        bgTo: "to-emerald-600/20",
                        borderColor: "border-green-500/40",
                        textColor: "text-green-400",
                        details: [
                          { label: "💡 Versement optimal", value: "5 000 €", highlight: true },
                          { label: "📉 Nouveau revenu imposable", value: "45 000 €" },
                          { label: "💰 Économie d'impôt", value: "-550 €", highlight: true }
                        ],
                        delay: 4.5
                      },
                      {
                        number: "2", 
                        title: "Location Meublée (LMNP)",
                        icon: Home,
                        color: "blue",
                        bgFrom: "from-blue-500/20",
                        bgTo: "to-cyan-600/20", 
                        borderColor: "border-blue-500/40",
                        textColor: "text-blue-400",
                        details: [
                          { label: "🏘️ Investissement immobilier", value: "Locatif meublé" },
                          { label: "🧾 Avantage fiscal", value: "Amortissement" },
                          { label: "✅ Résultat", value: "0€ impôt sur loyers", highlight: true }
                        ],
                        delay: 5.2
                      },
                      {
                        number: "3",
                        title: "Don Défiscalisé",
                        icon: Heart,
                        color: "purple", 
                        bgFrom: "from-purple-500/20",
                        bgTo: "to-pink-600/20",
                        borderColor: "border-purple-500/40", 
                        textColor: "text-purple-400",
                        details: [
                          { label: "❤️ Don à une ONG", value: "1 000 €" },
                          { label: "💶 Crédit d'impôt", value: "66%" },
                          { label: "💝 Tu récupères", value: "660 €", highlight: true }
                        ],
                        delay: 5.9
                      }
                    ].map((solution, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: solution.delay, type: "spring", stiffness: 200 }}
                        className={`bg-gradient-to-r ${solution.bgFrom} ${solution.bgTo} rounded-2xl p-5 sm:p-6 border ${solution.borderColor} backdrop-blur-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
                        whileHover={{ y: -5 }}
                      >
                        {/* Effet de brillance au hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                        />
                        
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-4">
                            <motion.div
                              className={`w-12 h-12 bg-gradient-to-br from-${solution.color}-500/30 to-${solution.color}-600/30 rounded-xl flex items-center justify-center border ${solution.borderColor} backdrop-blur-sm`}
                              whileHover={{ rotate: 360, scale: 1.1 }}
                              transition={{ duration: 0.6 }}
                            >
                              <solution.icon className={`w-6 h-6 ${solution.textColor}`} />
                            </motion.div>
                            <div className="flex-1">
                              <h5 className={`${solution.textColor} font-bold text-lg sm:text-xl flex items-center gap-2`}>
                                <span className={`w-6 h-6 rounded-full bg-${solution.color}-500/30 flex items-center justify-center text-sm font-bold`}>
                                  {solution.number}
                                </span>
                                {solution.title}
                              </h5>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {solution.details.map((detail, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: solution.delay + 0.2 + (idx * 0.1) }}
                                className="flex justify-between items-center"
                              >
                                <span className="text-gray-300">{detail.label}</span>
                                <motion.span
                                  className={`font-bold text-lg ${detail.highlight ? solution.textColor : 'text-white'}`}
                                  animate={detail.highlight ? { scale: [1, 1.05, 1] } : {}}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  {detail.value}
                                </motion.span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Impact total spectaculaire */}
              <AnimatePresence>
                {showImpact && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="text-center py-8"
                  >
                    <div className="bg-gradient-to-r from-[#c5a572]/30 via-[#e8cfa0]/30 to-[#c5a572]/30 rounded-3xl p-8 border border-[#c5a572]/50 backdrop-blur-sm relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#c5a572]/10 via-[#e8cfa0]/20 to-[#c5a572]/10"
                        animate={{ x: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      
                      <div className="relative z-10">
                        <motion.div
                          className="flex items-center justify-center gap-3 mb-4"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Award className="w-8 h-8 text-[#FFD700]" />
                          <h3 className="text-2xl sm:text-3xl font-bold text-[#c5a572]">
                            Économie totale potentielle
                          </h3>
                          <Award className="w-8 h-8 text-[#FFD700]" />
                        </motion.div>
                        
                        <motion.div
                          className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-green-400 via-green-500 to-emerald-600 bg-clip-text text-transparent mb-2"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          1 210 €
                        </motion.div>
                        
                        <p className="text-[#c5a572] text-lg font-semibold mb-4">
                          + Patrimoine immobilier + Retraite optimisée
                        </p>
                        
                        <motion.div
                          className="flex items-center justify-center gap-2 text-gray-300"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ChevronRight className="w-5 h-5 animate-bounce" />
                          <span className="font-medium">Et ce n'est que le début...</span>
                          <ChevronRight className="w-5 h-5 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Boutons d'action révolutionnaires */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 7, duration: 0.8 }}
          >
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0px 20px 40px rgba(197, 165, 114, 0.5)",
                y: -5
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="group relative w-full sm:w-auto px-10 py-5 sm:px-12 sm:py-6 bg-gradient-to-r from-[#c5a572] via-[#d4b885] to-[#e8cfa0] text-[#162238] font-bold rounded-3xl shadow-2xl transition-all duration-500 flex items-center justify-center gap-4 text-xl border-2 border-transparent hover:border-[#e8cfa0]/70 relative overflow-hidden"
            >
              {/* Effet de brillance */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.8 }}
              />
              
              {/* Particules flottantes */}
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/60 rounded-full"
                    animate={{
                      x: [0, 20, -20, 0],
                      y: [0, -20, 20, 0],
                    }}
                    transition={{
                      duration: 2 + i * 0.3,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${30 + i * 10}%`,
                    }}
                  />
                ))}
              </motion.div>
              
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-7 h-7" />
              </motion.div>
              
              <span className="relative z-10 font-extrabold">Découvrir Francis maintenant !</span>
              
              <motion.div
                className="group-hover:translate-x-2 transition-transform duration-300"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowRight className="w-7 h-7" />
              </motion.div>
            </motion.button>
            
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                y: -3
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full sm:w-auto px-10 py-5 sm:px-12 sm:py-6 bg-white/10 text-gray-300 font-bold rounded-3xl shadow-xl hover:text-white transition-all duration-500 flex items-center justify-center gap-3 text-xl border-2 border-white/30 hover:border-white/50 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
              Plus tard
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
} 