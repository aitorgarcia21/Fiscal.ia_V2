import { motion } from 'framer-motion';
import { Shield, ArrowRight, Users, Check, Sparkles, CreditCard, X, MessageSquare, Euro, Calculator, Home, Heart, Bot, ChevronRight } from 'lucide-react';

interface DemoModalProps {
  onClose: () => void;
  onStart: () => void;
}

export function DemoModal({ onClose, onStart }: DemoModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: "spring", stiffness: 280, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-gradient-to-br from-[#0A192F] via-[#162238] to-[#1E3253] rounded-3xl overflow-hidden border border-[#c5a572]/30 shadow-2xl shadow-[#c5a572]/20 backdrop-blur-lg"
      >
        {/* Header modernisé */}
        <div className="bg-gradient-to-r from-[#162238]/95 to-[#1E3253]/95 backdrop-blur-sm border-b border-[#c5a572]/20 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-2xl blur-md opacity-60"
                />
                <div className="relative bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] p-3 rounded-2xl">
                  <Bot className="h-8 w-8 sm:h-10 sm:w-10 text-[#162238]" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Démo Interactive Francis
                </h3>
                <p className="text-sm sm:text-base text-[#c5a572] font-medium mt-1">
                  Découvrez la puissance de l'IA fiscale
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20"
              aria-label="Fermer la démo"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Zone de conversation modernisée */}
        <div className="p-6 sm:p-8">
          <div className="bg-gradient-to-br from-[#0A192F]/80 to-[#162238]/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 max-h-[60vh] overflow-y-auto border border-[#c5a572]/10 shadow-inner">
            <div className="space-y-6 sm:space-y-8">
              
              {/* Message Francis - Introduction */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.6, delay: 0.2 }} 
                className="flex gap-4 items-start"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-[#162238]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0A192F] animate-pulse" />
                </div>
                <div className="flex-1 bg-gradient-to-br from-white/10 to-white/5 p-5 sm:p-6 rounded-2xl rounded-tl-md border border-white/10 shadow-lg backdrop-blur-sm">
                  <p className="text-white text-lg sm:text-xl font-medium mb-4">
                    Salut Paul ! 👋 On optimise ton impôt sur le revenu 2025 ? 
                  </p>
                  <p className="text-gray-300 mb-4">Dis-moi si j'ai bon :</p>
                  
                  <div className="bg-black/30 rounded-xl p-4 sm:p-5 space-y-3 border border-[#c5a572]/20 backdrop-blur-sm">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-pulse" />
                      <p className="text-[#c5a572] font-semibold">Revenu net imposable 2024 : 50 000 €</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-pulse" />
                      <p className="text-[#c5a572] font-semibold">Tu es marié, avec 1 enfant à charge</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-pulse" />
                      <p className="text-[#c5a572] font-semibold">Tu veux payer moins d'impôt et préparer ta retraite</p>
                    </motion.div>
                  </div>
                  
                  <p className="text-white text-lg mt-4 font-medium">C'est bien ça ? 🤔</p>
                </div>
              </motion.div>

              {/* Message Paul - Confirmation */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.6, delay: 1.2 }} 
                className="flex gap-4 items-start justify-end"
              >
                <div className="flex-1 max-w-md bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] p-5 sm:p-6 rounded-2xl rounded-br-md text-[#162238] shadow-lg">
                  <p className="text-lg sm:text-xl font-bold">Oui, c'est parfait ! ✅</p>
                  <p className="text-[#162238]/80 mt-1">Montre-moi ce que tu peux faire</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              {/* Message Francis - Solutions */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.6, delay: 1.8 }} 
                className="flex gap-4 items-start"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-[#162238]" />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0A192F]"
                  />
                </div>
                <div className="flex-1 bg-gradient-to-br from-white/10 to-white/5 p-5 sm:p-6 rounded-2xl rounded-tl-md border border-white/10 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-[#c5a572]" />
                    <p className="text-white text-lg sm:text-xl font-bold">
                      Top ! Voici 3 leviers efficaces pour ton profil 🚀
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Levier 1 - PER */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.2 }}
                      className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-4 sm:p-5 border border-green-500/30 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                          <span className="text-green-400 font-bold">1</span>
                        </div>
                        <h4 className="text-green-400 font-bold text-lg">Plan Épargne Retraite (PER)</h4>
                      </div>
                      <div className="space-y-2 text-sm sm:text-base">
                        <p className="text-gray-300">💡 Tu peux verser jusqu'à <span className="text-green-400 font-semibold">5 000 €</span> en 2025</p>
                        <p className="text-gray-300">📉 Revenu imposable : 50 000 € → <span className="text-green-400 font-semibold">45 000 €</span></p>
                        <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30">
                          <p className="text-green-400 font-bold text-lg">📊 Résultat : -550 € d'impôt !</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Levier 2 - LMNP */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.6 }}
                      className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-4 sm:p-5 border border-blue-500/30 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                          <span className="text-blue-400 font-bold">2</span>
                        </div>
                        <h4 className="text-blue-400 font-bold text-lg">Location meublée (LMNP)</h4>
                      </div>
                      <div className="space-y-2 text-sm sm:text-base">
                        <p className="text-gray-300">🏘️ Achat d'un bien à louer meublé</p>
                        <p className="text-gray-300">🧾 Amortissement du bien + charges déductibles</p>
                        <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
                          <p className="text-blue-400 font-bold text-lg">✅ Résultat : 0 € d'impôt sur les loyers pendant plusieurs années</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Levier 3 - Don */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 3.0 }}
                      className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-4 sm:p-5 border border-purple-500/30 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                          <span className="text-purple-400 font-bold">3</span>
                        </div>
                        <h4 className="text-purple-400 font-bold text-lg">Don à une association</h4>
                      </div>
                      <div className="space-y-2 text-sm sm:text-base">
                        <p className="text-gray-300">❤️ Don de <span className="text-purple-400 font-semibold">1 000 €</span> à une ONG</p>
                        <p className="text-gray-300">💶 Crédit d'impôt de <span className="text-purple-400 font-semibold">66%</span></p>
                        <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
                          <p className="text-purple-400 font-bold text-lg">💝 Tu récupères 660 € (ou 750 € pour aide aux démunis)</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Indication de suite */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 3.4 }} 
                className="text-center py-6"
              >
                <div className="bg-gradient-to-r from-[#c5a572]/20 to-[#e8cfa0]/20 rounded-xl p-4 border border-[#c5a572]/30 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ChevronRight className="w-5 h-5 text-[#c5a572] animate-bounce" />
                    <p className="text-[#c5a572] font-semibold">Et la conversation continue...</p>
                    <ChevronRight className="w-5 h-5 text-[#c5a572] animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <p className="text-gray-400 text-sm">Francis affine votre stratégie en temps réel</p>
                </div>
              </motion.div>

            </div>
          </div>

          {/* Boutons d'action modernisés */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-8">
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0px 20px 40px rgba(197, 165, 114, 0.4)",
                y: -2
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="group w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-[#c5a572] via-[#d4b885] to-[#e8cfa0] text-[#162238] font-bold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 text-lg border-2 border-transparent hover:border-[#e8cfa0]/50 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <Calculator className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">Commencer maintenant !</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
            
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                y: -2
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-white/10 text-gray-300 font-semibold rounded-2xl shadow-lg hover:text-white transition-all duration-300 flex items-center justify-center gap-3 text-lg border-2 border-white/20 hover:border-white/40 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
              Retour
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 