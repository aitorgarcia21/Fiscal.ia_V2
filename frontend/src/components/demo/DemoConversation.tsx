import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MessageSquare, Euro, Users } from 'lucide-react';

const conversation = [
  {
    author: 'francis',
    content: (
      <>
        <p className="text-white text-lg mb-2">Salut Paul ! On optimise ton impôt sur le revenu 2025 ? Dis-moi si j'ai bon :</p>
        <div className="bg-white/10 rounded-lg p-4 space-y-2 border border-[#c5a572]/20">
          <p className="text-[#c5a572] font-medium">• Revenu net imposable 2024 : 50 000 €</p>
          <p className="text-[#c5a572] font-medium">• Tu es marié, avec 1 enfant à charge</p>
          <p className="text-[#c5a572] font-medium">• Tu veux payer moins d'impôt et préparer ta retraite</p>
        </div>
        <p className="text-white text-lg mt-2">C'est bien ça ?</p>
      </>
    )
  },
  {
    author: 'paul',
    content: <p className="text-white text-lg">Oui, c'est ça !</p>
  },
  {
    author: 'francis',
    content: (
      <>
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
      </>
    )
  },
  {
    author: 'paul',
    content: <p className="text-white text-lg">Et si je mets seulement 3 000 € sur le PER ?</p>
  },
  {
    author: 'francis',
    content: (
      <>
        <p className="text-white text-lg mb-2">Alors ton économie tombe à 330 € (3 000 € × 11 %)</p>
        <p>➕ Avec ton don de 1 000 €, ça fait 990 € d'impôt en moins</p>
        <p>➕ Et si tu fais de la location meublée, tu peux carrément ne plus rien payer sur les loyers</p>
      </>
    )
  },
  {
    author: 'paul',
    content: <p className="text-white text-lg">OK c'est clair. On continue ?</p>
  },
  {
    author: 'francis',
    content: <p className="text-white text-lg mb-2">Yes ! Crée ton compte, et je t'analyse tout ça à partir de tes vrais chiffres.<br/>Tu auras un plan fiscal personnalisé, prêt à appliquer.</p>
  }
];

export function DemoConversation() {
  const [visibleCount, setVisibleCount] = useState(0);
  const { ref, inView } = useInView({ 
    triggerOnce: true, 
    rootMargin: '-50px',
    threshold: 0.1
  });

  useEffect(() => {
    if (inView && visibleCount < conversation.length) {
      const timeout = setTimeout(() => {
        setVisibleCount((c) => c + 1);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [inView, visibleCount]);

  return (
    <div ref={ref} className="max-w-3xl mx-auto mb-12">
      <div className="bg-[#1a2942]/80 backdrop-blur-sm rounded-2xl p-8 border border-[#c5a572]/30 shadow-xl">
        <div className="space-y-6">
          {conversation.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.4,
                delay: i * 0.05,
                ease: "easeOut"
              }}
              className="flex gap-4"
            >
              {msg.author === 'francis' ? (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="relative inline-flex items-center justify-center group"
                >
                  <MessageSquare className="h-7 w-7 text-[#c5a572]" />
                  <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2942] rounded-full p-0.5" />
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30"
                >
                  <Users className="w-5 h-5 text-blue-400" />
                </motion.div>
              )}
              <motion.div 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 + 0.1 }}
                className="flex-1"
              >
                {msg.content}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 