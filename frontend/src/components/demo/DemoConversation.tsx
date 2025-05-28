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
      <div className="bg-[#1a2942]/95 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-[#c5a572]/20">
        {/* En-tête démo */}
        <div className="bg-gradient-to-r from-[#1a2942] to-[#223c63] px-6 py-4 border-b border-[#c5a572]/20 flex items-center space-x-4">
          <div className="relative inline-flex items-center justify-center group">
            <MessageSquare className="h-7 w-7 text-[#c5a572] transition-transform group-hover:scale-110" />
            <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1.5 -right-1.5 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Francis</h2>
            <p className="text-sm text-gray-300">Conseiller fiscal propulsé par IA</p>
          </div>
        </div>
        {/* Zone des messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {conversation.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.author === 'paul' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.author === 'paul'
                    ? 'bg-[#c5a572] text-[#1a2942]'
                    : 'bg-white/5 text-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {msg.author === 'francis' && (
                    <div className="w-6 h-6 rounded-full bg-[#c5a572] flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-[#1a2942]" />
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {msg.author === 'paul' ? 'Vous' : 'Francis'}
                  </span>
                </div>
                <div className="prose prose-invert max-w-none">
                  {msg.content}
                </div>
              </div>
              {msg.author === 'paul' && (
                <div className="w-6 h-6 rounded-full bg-[#223c63] flex items-center justify-center ml-2">
                  <span className="text-[#c5a572] font-bold">Vous</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 