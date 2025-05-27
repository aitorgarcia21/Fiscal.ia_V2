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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-4xl bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] rounded-2xl p-8 border-2 border-[#c5a572]/30 relative shadow-2xl shadow-[#c5a572]/10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative inline-flex items-center justify-center group">
              <MessageSquare className="h-8 w-8 text-[#c5a572] transition-transform group-hover:scale-110" />
              <Euro className="h-6 w-6 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Francis</h3>
              <p className="text-sm text-[#c5a572]">Assistant fiscal IA</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        <div className="bg-[#1a2942]/80 backdrop-blur-sm rounded-lg p-6 mb-4 max-h-[60vh] overflow-y-auto custom-scrollbar border border-[#c5a572]/20">
          <div className="space-y-6">
            {/* Message de Francis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex gap-4"
            >
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquare className="h-7 w-7 text-[#c5a572] transition-transform group-hover:scale-110" />
                <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg mb-2">Salut Paul ! Pour optimiser ton IR 2025, confirme-moi :</p>
                <div className="bg-white/10 rounded-lg p-4 space-y-2 border border-[#c5a572]/20">
                  <p className="text-[#c5a572] font-medium">• Revenu net imposable 2024 : 50 000 €</p>
                  <p className="text-[#c5a572] font-medium">• Situation : marié, 1 enfant à charge</p>
                  <p className="text-[#c5a572] font-medium">• Horizon : réduire IR maintenant, préparer retraite</p>
                </div>
              </div>
            </motion.div>

            {/* Message de l'utilisateur */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg">C'est ça.</p>
              </div>
            </motion.div>

            {/* Réponse de Francis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="flex gap-4"
            >
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquare className="h-7 w-7 text-[#c5a572] transition-transform group-hover:scale-110" />
                <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg mb-2">Top, voici les 3 leviers les plus efficients pour ton profil :</p>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-all cursor-pointer border border-[#c5a572]/20 hover:border-[#c5a572]/40 hover:shadow-lg hover:shadow-[#c5a572]/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Calculator className="w-6 h-6 text-[#c5a572]" />
                      <h4 className="text-[#c5a572] font-medium text-lg">1. PER – Versement 8 000 €</h4>
                    </div>
                    <div className="pl-8 space-y-1 text-sm text-gray-200">
                      <p>• Déductible de ton revenu imposable → base passe de 50 000 € à 42 000 €</p>
                      <p>• Économie IR nette : 8 000 € × TMI 30 % = 2 400 €</p>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-all cursor-pointer border border-[#c5a572]/20 hover:border-[#c5a572]/40 hover:shadow-lg hover:shadow-[#c5a572]/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Home className="w-6 h-6 text-[#c5a572]" />
                      <h4 className="text-[#c5a572] font-medium text-lg">2. Pinel – Achat d'un T2 180 000 € (zone B1)</h4>
                    </div>
                    <div className="pl-8 space-y-1 text-sm text-gray-200">
                      <p>• Engagement locatif 6 ans → réduction 12 % répartie → 3 600 €/an</p>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-all cursor-pointer border border-[#c5a572]/20 hover:border-[#c5a572]/40 hover:shadow-lg hover:shadow-[#c5a572]/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="w-6 h-6 text-[#c5a572]" />
                      <h4 className="text-[#c5a572] font-medium text-lg">3. Don – 1 000 € à une ONG</h4>
                    </div>
                    <div className="pl-8 space-y-1 text-sm text-gray-200">
                      <p>• Crédit d'impôt 66 % → 660 €</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-[#c5a572]/10 rounded-lg p-4 border border-[#c5a572]/20">
                  <p className="text-[#c5a572] font-medium">Chaque option est cliquable pour voir le détail fiscal et le simulateur de cash-flow.</p>
                </div>
              </div>
            </motion.div>

            {/* Message de l'utilisateur */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg">Je veux tester un PER à 6 000 € seulement.</p>
              </div>
            </motion.div>

            {/* Réponse de Francis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 2 }}
              className="flex gap-4"
            >
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquare className="h-7 w-7 text-[#c5a572] transition-transform group-hover:scale-110" />
                <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg mb-2">D'accord. Avec 6 000 € de PER, ton économie passe à 1 800 € (6 000 × 30 %).</p>
                <p className="text-white text-lg mb-4">Du coup, tes économies totales deviennent 1 800 + 3 600 + 660 = 6 060 €.</p>
                <div className="bg-[#c5a572]/10 rounded-lg p-4 border border-[#c5a572]/20">
                  <p className="text-[#c5a572] font-medium">Veux-tu ajuster la durée Pinel ou le montant du don ?</p>
                </div>
              </div>
            </motion.div>

            {/* Dernier message de Francis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 2.5 }}
              className="flex gap-4"
            >
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquare className="h-7 w-7 text-[#c5a572] transition-transform group-hover:scale-110" />
                <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg mb-2">Voulez-vous que nous continuions avec votre inscription ? Je pourrai alors analyser vos données réelles et vous proposer des optimisations concrètes.</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all transform flex items-center gap-2 text-lg"
          >
            <CreditCard className="w-6 h-6" />
            Commencer gratuitement
            <ArrowRight className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
} 