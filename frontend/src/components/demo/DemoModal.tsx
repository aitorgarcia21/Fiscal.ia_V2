import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Users, Check, Sparkles, CreditCard, X, MessageSquare, Euro, Calculator, Home, Heart, Bot, ChevronRight, TrendingUp, Target, Zap, Star, Crown, Award, Building, PieChart, FileText, Users2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DemoModalProps {
  onClose: () => void;
  onStart: () => void;
}

export function DemoModal({ onClose, onStart }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showImpact, setShowImpact] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowImpact(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      {/* Particules discrètes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#c5a572]/20 rounded-full"
            animate={{
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
              opacity: [0.2, 0.5, 0.2],
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

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: "spring", stiffness: 280, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl bg-gradient-to-br from-[#0A1628] via-[#0F1B2F] to-[#162238] rounded-2xl overflow-hidden border border-[#c5a572]/30 shadow-2xl backdrop-blur-lg relative"
      >
        {/* Lueur subtile en haut */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-32 bg-gradient-to-b from-[#c5a572]/10 to-transparent rounded-full blur-xl" />

        {/* Header professionnel */}
        <div className="relative bg-gradient-to-r from-[#0A1628]/95 via-[#162238]/95 to-[#1E3253]/95 backdrop-blur-sm border-b border-[#c5a572]/20 p-6 sm:p-8">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                {/* Badge professionnel */}
                <div className="relative bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] p-3 rounded-xl shadow-lg">
                  <Building className="h-8 w-8 sm:h-10 sm:w-10 text-[#162238]" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <div>
                <motion.h3 
                  className="text-2xl sm:text-3xl font-bold text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Démonstration Francis Pro
                </motion.h3>
                <motion.p 
                  className="text-sm sm:text-base text-[#c5a572] font-medium mt-1 flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Shield className="w-4 h-4" />
                  Conseil fiscal expert par Intelligence Artificielle
                </motion.p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20"
              aria-label="Fermer la démo"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Zone de conversation professionnelle */}
        <div className="relative p-6 sm:p-8">
          <div className="bg-gradient-to-br from-[#0A1628]/90 via-[#0F1B2F]/90 to-[#162238]/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 max-h-[65vh] overflow-y-auto border border-[#c5a572]/15 shadow-xl relative">
            
            <div className="relative z-10 space-y-8 sm:space-y-10">
              
              {/* Message Francis - Approche professionnelle */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.6, delay: 0.2 }} 
                className="flex gap-4 items-start"
              >
                <div className="relative flex-shrink-0">
                  <div className="relative w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                    <div className="relative inline-flex items-center justify-center group">
                      <MessageSquare className="w-6 h-6 text-[#162238] transition-transform group-hover:scale-110 duration-300" />
                      <Euro className="w-4 h-4 text-[#162238] absolute -bottom-1 -right-1 bg-[#c5a572] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0A1628]" />
                  </div>
                </div>
                
                <div className="flex-1 bg-gradient-to-br from-white/10 to-white/5 p-5 sm:p-6 rounded-xl rounded-tl-md border border-white/15 shadow-lg backdrop-blur-sm relative overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-pulse" />
                        <span className="text-[#c5a572] text-sm font-medium">Francis Assistant Expert</span>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">14:32</span>
                    </div>
                    
                    <h4 className="text-white text-lg sm:text-xl font-semibold mb-4">
                      Bonjour Paul ! Analysons votre situation fiscale 2025
                    </h4>
                    
                    <p className="text-gray-300 text-base mb-5">
                      D'après les informations transmises, j'ai effectué une pré-analyse de votre profil :
                    </p>
                  </motion.div>
                  
                  {/* Profil fiscal professionnel */}
                  <div className="bg-black/30 rounded-xl p-4 sm:p-5 space-y-3 border border-[#c5a572]/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-[#c5a572]" />
                      <span className="text-[#c5a572] font-semibold text-sm">ANALYSE FISCALE PRÉLIMINAIRE</span>
                    </div>
                    
                    {[
                      { icon: TrendingUp, text: "Revenus nets imposables", value: "50 000 €", color: "text-blue-400", delay: 0.8 },
                      { icon: Users2, text: "Situation familiale", value: "Marié, 1 enfant", color: "text-green-400", delay: 1.0 },
                      { icon: Target, text: "Objectif déclaré", value: "Optimisation fiscale + retraite", color: "text-purple-400", delay: 1.2 },
                      { icon: PieChart, text: "Taux marginal d'imposition", value: "11% (tranche)", color: "text-orange-400", delay: 1.4 }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: item.delay }}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          <span className="text-gray-300 text-sm">{item.text}</span>
                        </div>
                        <span className={`${item.color} font-semibold text-sm`}>{item.value}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.p 
                    className="text-white text-base mt-4 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                  >
                    Cette analyse vous semble-t-elle correcte ?
                  </motion.p>
                </div>
              </motion.div>

              {/* Message Paul - Confirmation */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.6, delay: 2.2 }} 
                className="flex gap-4 items-start justify-end"
              >
                <div className="flex-1 max-w-md bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] p-5 sm:p-6 rounded-xl rounded-br-md text-[#162238] shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium opacity-80">Paul Martin</span>
                    <span className="text-xs opacity-60 ml-auto">14:33</span>
                  </div>
                  <p className="text-lg font-bold">Parfaitement exact ! ✓</p>
                  <p className="text-[#162238]/80 mt-1">Quelles sont mes options d'optimisation ?</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-sm">PM</span>
                </div>
              </motion.div>

              {/* Message Francis - Solutions professionnelles */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.6, delay: 2.8 }} 
                className="flex gap-4 items-start"
              >
                <div className="relative flex-shrink-0">
                  <div className="relative w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                    <Calculator className="w-6 h-6 text-[#162238]" />
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0A1628] flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Check className="w-2 h-2 text-white" />
                    </motion.div>
                  </div>
                </div>
                
                <div className="flex-1 bg-gradient-to-br from-white/10 to-white/5 p-5 sm:p-6 rounded-xl rounded-tl-md border border-white/15 shadow-lg backdrop-blur-sm relative overflow-hidden">
                  <motion.div
                    className="flex items-center gap-3 mb-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3.2 }}
                  >
                    <Calculator className="w-5 h-5 text-[#c5a572]" />
                    <h4 className="text-white text-lg sm:text-xl font-bold">
                      Recommandations d'optimisation fiscale
                    </h4>
                    <div className="ml-auto bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded border border-green-500/30">
                      CALCULÉ EN TEMPS RÉEL
                    </div>
                  </motion.div>
                  
                  <div className="space-y-5">
                    {/* Solutions avec calculs précis */}
                    {[
                      {
                        number: "1",
                        title: "Plan d'Épargne Retraite (PER)",
                        icon: PieChart,
                        color: "green",
                        details: [
                          { label: "Versement annuel optimal", value: "5 000 €" },
                          { label: "Réduction base imposable", value: "50 000 € → 45 000 €" },
                          { label: "Économie d'impôt immédiate", value: "550 €", highlight: true }
                        ],
                        delay: 3.8
                      },
                      {
                        number: "2", 
                        title: "Investissement LMNP",
                        icon: Building,
                        color: "blue",
                        details: [
                          { label: "Type d'investissement", value: "Location meublée non professionnelle" },
                          { label: "Avantage principal", value: "Amortissement du bien" },
                          { label: "Fiscalité sur loyers", value: "0 € pendant 8-12 ans", highlight: true }
                        ],
                        delay: 4.4
                      },
                      {
                        number: "3",
                        title: "Dons aux œuvres",
                        icon: Heart,
                        color: "purple", 
                        details: [
                          { label: "Don annuel recommandé", value: "1 000 €" },
                          { label: "Taux de réduction d'impôt", value: "66%" },
                          { label: "Coût réel après crédit d'impôt", value: "340 €", highlight: true }
                        ],
                        delay: 5.0
                      }
                    ].map((solution, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: solution.delay }}
                        className={`bg-gradient-to-r from-${solution.color}-500/15 to-${solution.color}-600/15 rounded-xl p-4 sm:p-5 border border-${solution.color}-500/30 backdrop-blur-sm relative overflow-hidden`}
                      >
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 bg-${solution.color}-500/30 rounded-lg flex items-center justify-center border border-${solution.color}-500/50`}>
                              <solution.icon className={`w-4 h-4 text-${solution.color}-400`} />
                            </div>
                            <div className="flex-1">
                              <h5 className={`text-${solution.color}-400 font-bold text-base flex items-center gap-2`}>
                                <span className={`w-5 h-5 rounded-full bg-${solution.color}-500/30 flex items-center justify-center text-xs font-bold`}>
                                  {solution.number}
                                </span>
                                {solution.title}
                              </h5>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {solution.details.map((detail, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-gray-300">{detail.label}</span>
                                <span className={`font-semibold ${detail.highlight ? solution.color === 'green' ? 'text-green-400' : solution.color === 'blue' ? 'text-blue-400' : 'text-purple-400' : 'text-white'}`}>
                                  {detail.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Résultats financiers */}
              <AnimatePresence>
                {showImpact && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-center py-6"
                  >
                    <div className="bg-gradient-to-r from-[#c5a572]/20 via-[#e8cfa0]/20 to-[#c5a572]/20 rounded-xl p-6 border border-[#c5a572]/30 backdrop-blur-sm relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-4">
                          <TrendingUp className="w-6 h-6 text-[#c5a572]" />
                          <h3 className="text-xl font-bold text-white">
                            Bilan d'optimisation fiscale
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div className="bg-black/20 rounded-lg p-3 border border-green-500/30">
                            <div className="text-2xl font-bold text-green-400">550 €</div>
                            <div className="text-sm text-gray-300">Économie PER</div>
                          </div>
                          <div className="bg-black/20 rounded-lg p-3 border border-blue-500/30">
                            <div className="text-2xl font-bold text-blue-400">660 €</div>
                            <div className="text-sm text-gray-300">Crédit d'impôt don</div>
                          </div>
                          <div className="bg-black/20 rounded-lg p-3 border border-purple-500/30">
                            <div className="text-2xl font-bold text-purple-400">∞</div>
                            <div className="text-sm text-gray-300">Exonération LMNP</div>
                          </div>
                        </div>
                        
                        <motion.div
                          className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Total : 1 210 € d'économie immédiate
                        </motion.div>
                        
                        <p className="text-[#c5a572] text-sm mt-2">
                          + Constitution d'un patrimoine immobilier défiscalisé
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Boutons d'action professionnels */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 6, duration: 0.8 }}
          >
            <motion.button
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0px 10px 30px rgba(197, 165, 114, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="group w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-[#c5a572] via-[#d4b885] to-[#e8cfa0] text-[#162238] font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 text-lg border border-transparent hover:border-[#e8cfa0]/50 relative overflow-hidden"
            >
              <Calculator className="w-5 h-5" />
              <span>Accéder à Francis Pro</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
            
            <motion.button
              whileHover={{ 
                scale: 1.02,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-white/10 text-gray-300 font-semibold rounded-xl shadow-lg hover:text-white transition-all duration-300 flex items-center justify-center gap-3 text-lg border border-white/20 hover:border-white/40 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
              Fermer
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
} 