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
    if (inView) {
      const interval = setInterval(() => {
        setVisibleCount((c) => {
          if (c < conversation.length) {
            return c + 1;
          }
          clearInterval(interval);
          return c;
        });
      }, 1500); // Délai entre chaque message
      return () => clearInterval(interval);
    }
  }, [inView]);

  return (
    <div className="max-w-2xl mx-auto mb-12" ref={ref}>
      <div className="bg-gradient-to-br from-[#101A2E]/80 via-[#162238]/80 to-[#1E3253]/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border-2 border-[#c5a572]/30">
        {/* En-tête démo */}
        <div className="bg-gradient-to-r from-[#162238] to-[#1E3253] px-6 py-5 border-b border-[#c5a572]/20 flex items-center space-x-4 shadow-inner">
          <div className="relative inline-flex items-center justify-center group p-1.5 bg-gradient-to-br from-[#c5a572]/20 to-transparent rounded-full">
            <MessageSquare className="h-7 w-7 text-[#c5a572]" />
            <Euro className="h-4 w-4 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#162238] rounded-full p-0.5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white drop-shadow-lg">Francis</h2>
            <p className="text-sm text-[#c5a572] font-medium">Votre conseiller fiscal IA</p>
          </div>
        </div>
        {/* Zone des messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[300px] max-h-[50vh]">
          {conversation.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={`flex items-end ${msg.author === 'paul' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.author === 'francis' && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] flex items-center justify-center flex-shrink-0 mr-3 shadow-md border border-[#162238]">
                  <MessageSquare className="w-5 h-5 text-[#162238]" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-xl transition-all duration-300 group hover:scale-[1.015] text-base sm:text-lg leading-relaxed font-medium ${
                  msg.author === 'paul'
                    ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-br-none border-2 border-transparent hover:border-[#162238]/30'
                    : 'bg-white/10 text-white rounded-bl-none border-2 border-transparent hover:border-[#c5a572]/40'
                }`}
              >
                {msg.content}
              </div>
              {msg.author === 'paul' && (
                <div className="w-9 h-9 rounded-full bg-[#2A3F6C]/50 flex items-center justify-center flex-shrink-0 ml-3 shadow-md border border-white/10">
                  <Users className="w-5 h-5 text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}
          {visibleCount < conversation.length && (
            <motion.div 
              initial={{ opacity: 0, y: 10}}
              animate={{ opacity: 1, y: 0}}
              transition={{delay: 0.3}}
              className="flex justify-start items-center pl-12 pt-2"
            >
              <span className="text-gray-400 text-sm italic">Francis est en train d'écrire</span>
              <div className="flex space-x-1 ml-2">
                  <motion.div animate={{scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5]}} transition={{duration: 0.8, repeat: Infinity, delay:0}} className="w-1.5 h-1.5 bg-gray-400 rounded-full"></motion.div>
                  <motion.div animate={{scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5]}} transition={{duration: 0.8, repeat: Infinity, delay:0.2}} className="w-1.5 h-1.5 bg-gray-400 rounded-full"></motion.div>
                  <motion.div animate={{scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5]}} transition={{duration: 0.8, repeat: Infinity, delay:0.4}} className="w-1.5 h-1.5 bg-gray-400 rounded-full"></motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 