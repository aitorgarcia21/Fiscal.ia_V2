import { motion } from 'framer-motion';
import { Shield, ArrowRight, Users, Check, Sparkles, CreditCard, X, MessageSquare, Euro, Calculator, Home, Heart } from 'lucide-react';

interface DemoModalProps {
  onClose: () => void;
  onStart: () => void;
}

export function DemoModal({ onClose, onStart }: DemoModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-gradient-to-br from-[#1E3253] via-[#162238] to-[#101A2E] rounded-2xl p-1 sm:p-2 border-2 border-[#c5a572]/40 shadow-2xl shadow-[#c5a572]/20 overflow-hidden"
      >
        <div className="bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] rounded-xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative inline-flex items-center justify-center group p-2 bg-gradient-to-br from-[#c5a572]/20 to-transparent rounded-full">
                <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-[#c5a572] transition-transform group-hover:scale-110" />
                <Euro className="h-5 w-5 sm:h-6 sm:w-6 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">Démo Interactive</h3>
                <p className="text-sm sm:text-base text-[#c5a572]">Voyez Francis en action</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Fermer la démo"
            >
              <X className="w-6 h-6 sm:w-7 sm:w-7" />
            </motion.button>
          </div>

          <div className="bg-[#101A2E]/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto custom-scrollbar border border-[#c5a572]/20 shadow-inner">
            <div className="space-y-5 sm:space-y-6">
              {/* Francis : intro */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex gap-3 sm:gap-4 items-start">
                <div className="relative inline-flex items-center justify-center group flex-shrink-0 mt-1">
                  <MessageSquare className="h-7 w-7 text-[#c5a572]" />
                  <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#101A2E] rounded-full p-0.5" />
                </div>
                <div className="flex-1 bg-white/5 p-3 sm:p-4 rounded-xl rounded-tl-none border border-white/10 shadow-md">
                  <p className="text-white text-base sm:text-lg mb-2">Salut Paul ! On optimise ton impôt sur le revenu 2025 ? Dis-moi si j'ai bon :</p>
                  <div className="bg-black/20 rounded-lg p-3 sm:p-4 space-y-1.5 border border-white/10 text-sm sm:text-base">
                    <p className="text-[#c5a572] font-medium">• Revenu net imposable 2024 : 50 000 €</p>
                    <p className="text-[#c5a572] font-medium">• Tu es marié, avec 1 enfant à charge</p>
                    <p className="text-[#c5a572] font-medium">• Tu veux payer moins d'impôt et préparer ta retraite</p>
                  </div>
                  <p className="text-white text-base sm:text-lg mt-2">C'est bien ça ?</p>
                </div>
              </motion.div>
              {/* Paul : Oui */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="flex gap-3 sm:gap-4 items-start justify-end">
                <div className="flex-1 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] p-3 sm:p-4 rounded-xl rounded-br-none text-[#162238] shadow-lg">
                  <p className="text-base sm:text-lg font-semibold">Oui, c'est ça !</p>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:w-9 rounded-full bg-[#c5a572]/20 flex items-center justify-center flex-shrink-0 border border-[#c5a572]/30 mt-1">
                  <Users className="w-4 h-4 sm:w-5 sm:w-5 text-[#e8cfa0]" />
                </div>
              </motion.div>
              {/* Francis : 3 leviers */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 1.2 }} className="flex gap-3 sm:gap-4 items-start">
                <div className="relative inline-flex items-center justify-center group flex-shrink-0 mt-1">
                  <MessageSquare className="h-7 w-7 text-[#c5a572]" />
                  <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#101A2E] rounded-full p-0.5" />
                </div>
                <div className="flex-1 bg-white/5 p-3 sm:p-4 rounded-xl rounded-tl-none border border-white/10 shadow-md">
                  <p className="text-white text-base sm:text-lg mb-2">Top ! Voici 3 leviers efficaces pour ton profil 👇</p>
                  <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                    <div className="bg-black/20 rounded-lg p-3 sm:p-4 border border-white/10">
                      <p className="text-[#c5a572] font-semibold mb-1">1. Plan Épargne Retraite (PER)</p>
                      <p className="text-gray-300">💡 Tu peux verser jusqu'à 5 000 € en 2025 (c'est ton plafond déductible).</p>
                      <p className="text-gray-300">📉 Ce montant est retiré de ton revenu imposable → il passe de 50 000 € à 45 000 €</p>
                      <p className="text-gray-200 font-medium">📊 Résultat : 550 € d'impôt en moins</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 sm:p-4 border border-white/10">
                      <p className="text-[#c5a572] font-semibold mb-1">2. Location meublée (LMNP)</p>
                      <p className="text-gray-300">🏘️ Tu achètes un petit bien à louer meublé</p>
                      <p className="text-gray-300">🧾 En meublé réel, tu peux amortir le bien + charges</p>
                      <p className="text-gray-200 font-medium">✅ Résultat : souvent 0 € d'impôt pendant plusieurs années sur les loyers</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 sm:p-4 border border-white/10">
                      <p className="text-[#c5a572] font-semibold mb-1">3. Don à une association</p>
                      <p className="text-gray-300">❤️ Tu donnes 1 000 € à une ONG</p>
                      <p className="text-gray-300">💶 Tu récupères 660 € en crédit d'impôt</p>
                      <p className="text-gray-200 text-sm">(ou 750 € si c'est une association d'aide aux plus démunis)</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.8 }} className="text-center pt-4">
                <p className="text-gray-400 text-sm sm:text-base italic">Et la conversation continue pour affiner votre stratégie...</p>
              </motion.div>

            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0px 10px 25px rgba(197, 165, 114, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-3.5 sm:px-10 sm:py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl shadow-lg hover:shadow-[#c5a572]/40 transition-all duration-300 flex items-center justify-center gap-2.5 text-base sm:text-lg border-2 border-transparent hover:border-[#e8cfa0]/50"
            >
              <CreditCard className="w-5 h-5 sm:w-6 sm:w-6" />
              Commencer maintenant !
              <ArrowRight className="w-5 h-5 sm:w-6 sm:w-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 sm:px-10 sm:py-4 bg-white/5 text-gray-300 font-medium rounded-xl shadow-md hover:text-white transition-all duration-300 flex items-center justify-center gap-2.5 text-base sm:text-lg border-2 border-white/10 hover:border-white/20 backdrop-blur-sm"
            >
              Retour
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 