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
            {/* Francis : intro */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex gap-4">
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquare className="h-7 w-7 text-[#c5a572] transition-transform group-hover:scale-110" />
                <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg mb-2">Salut Paul ! On optimise ton impôt sur le revenu 2025 ? Dis-moi si j'ai bon :</p>
                <div className="bg-white/10 rounded-lg p-4 space-y-2 border border-[#c5a572]/20">
                  <p className="text-[#c5a572] font-medium">• Revenu net imposable 2024 : 50 000 €</p>
                  <p className="text-[#c5a572] font-medium">• Tu es marié, avec 1 enfant à charge</p>
                  <p className="text-[#c5a572] font-medium">• Tu veux payer moins d'impôt et préparer ta retraite</p>
                </div>
                <p className="text-white text-lg mt-2">C'est bien ça ?</p>
              </div>
            </motion.div>
            {/* Paul : Oui */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg">Oui, c'est ça !</p>
              </div>
            </motion.div>
            {/* Francis : 3 leviers */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1 }} className="flex gap-4">
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquare className="h-7 w-7 text-[#c5a572] transition-transform group-hover:scale-110" />
                <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg mb-2">Top ! Voici 3 leviers efficaces pour ton profil 👇</p>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4 border border-[#c5a572]/20">
                    <p className="text-[#c5a572] font-medium mb-1">1. Plan Épargne Retraite (PER)</p>
                    <p>💡 Tu peux verser jusqu'à 5 000 € en 2025 (c'est ton plafond déductible).</p>
                    <p>📉 Ce montant est retiré de ton revenu imposable → il passe de 50 000 € à 45 000 €</p>
                    <p>📊 Résultat : 550 € d'impôt en moins</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 border border-[#c5a572]/20">
                    <p className="text-[#c5a572] font-medium mb-1">2. Location meublée (LMNP)</p>
                    <p>🏘️ Tu achètes un petit bien à louer meublé</p>
                    <p>🧾 En meublé réel, tu peux amortir le bien + charges</p>
                    <p>✅ Résultat : souvent 0 € d'impôt pendant plusieurs années sur les loyers</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 border border-[#c5a572]/20">
                    <p className="text-[#c5a572] font-medium mb-1">3. Don à une association</p>
                    <p>❤️ Tu donnes 1 000 € à une ONG</p>
                    <p>💶 Tu récupères 660 € en crédit d'impôt</p>
                    <p className="text-sm text-gray-300">(ou 750 € si c'est une association d'aide aux plus démunis)</p>
                  </div>
                </div>
              </div>
            </motion.div>
            {/* Paul : Et si je mets seulement 3 000 € sur le PER ? */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.5 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg">Et si je mets seulement 3 000 € sur le PER ?</p>
              </div>
            </motion.div>
            {/* Francis : calcul avec 3 000 € */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 2 }} className="flex gap-4">
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquare className="h-7 w-7 text-[#c5a572] transition-transform group-hover:scale-110" />
                <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg mb-2">Alors ton économie tombe à 330 € (3 000 € × 11 %)</p>
                <p>➕ Avec ton don de 1 000 €, ça fait 990 € d'impôt en moins</p>
                <p>➕ Et si tu fais de la location meublée, tu peux carrément ne plus rien payer sur les loyers</p>
              </div>
            </motion.div>
            {/* Paul : OK c'est clair. On continue ? */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 2.5 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg">OK c'est clair. On continue ?</p>
              </div>
            </motion.div>
            {/* Francis : conclusion */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 3 }} className="flex gap-4">
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquare className="h-7 w-7 text-[#c5a572] transition-transform group-hover:scale-110" />
                <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg mb-2">Yes ! Crée ton compte, et je t'analyse tout ça à partir de tes vrais chiffres.<br/>Tu auras un plan fiscal personnalisé, prêt à appliquer.</p>
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