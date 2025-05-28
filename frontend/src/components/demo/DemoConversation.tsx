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
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [inView, visibleCount]);

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div className="bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] rounded-3xl p-0 border border-[#c5a572]/40 shadow-2xl overflow-hidden">
        {/* En-tête démo */}
        <div className="flex flex-col items-center justify-center py-8 px-4 border-b border-[#c5a572]/20 bg-[#1a2942]/80">
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Démo Francis / Paul</h3>
          <span className="inline-block bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-semibold px-4 py-1 rounded-full text-xs shadow-md border border-[#c5a572]/40">Conversation IA</span>
        </div>
        <div className="p-6 sm:p-10 space-y-6">
          {conversation.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 60,
                damping: 18,
                delay: i * 0.08
              }}
              className={`flex w-full ${msg.author === 'paul' ? 'justify-end' : 'justify-start'}`}
              style={{ willChange: 'opacity, transform' }}
            >
              {msg.author === 'francis' && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 60, damping: 18, delay: i * 0.08 }}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-[#c5a572] flex items-center justify-center shadow-lg mr-3 border-2 border-[#e8cfa0]"
                  style={{boxShadow:'0 0 0 4px #c5a57233, 0 2px 12px #1a2942'}}
                >
                  <MessageSquare className="h-5 w-5 text-[#1a2942]" />
                </motion.div>
              )}
              <motion.div 
                initial={{ x: msg.author === 'paul' ? 18 : -18, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 60, damping: 18, delay: i * 0.08 + 0.1 }}
                className={`rounded-2xl px-5 py-4 max-w-[80%] text-base sm:text-lg font-medium shadow-md backdrop-blur-md border ${msg.author === 'francis' ? 'bg-white/10 border-[#c5a572]/30 text-white' : 'bg-gradient-to-r from-[#c5a572]/90 to-[#e8cfa0]/80 border-[#c5a572]/60 text-[#1a2942]'}`}
                style={{ willChange: 'opacity, transform', wordBreak: 'break-word' }}
              >
                {msg.content}
              </motion.div>
              {msg.author === 'paul' && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 60, damping: 18, delay: i * 0.08 }}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center shadow-lg ml-3 border-2 border-blue-200"
                  style={{boxShadow:'0 0 0 4px #60a5fa33, 0 2px 12px #1a2942'}}
                >
                  <Users className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 