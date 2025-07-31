import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MessageSquare, Euro, Users } from 'lucide-react';

const conversation = [
  {
    author: 'francis',
    content: (
      <>
        <p className="text-white text-lg mb-3">Bonsoir Marc. Analysons votre situation fiscale en Andorre.</p>
        <div className="bg-white/10 rounded-lg p-4 space-y-2 border border-[#c5a572]/20">
          <p className="text-[#c5a572] font-medium">• Résident andorran depuis 2019</p>
          <p className="text-[#c5a572] font-medium">• Revenus professionnels : 240 000 €</p>
          <p className="text-[#c5a572] font-medium">• Consultant en technologie</p>
        </div>
      </>
    )
  },
  {
    author: 'marc',
    content: <p className="text-white text-lg">Exactement. Je souhaite optimiser ma structure fiscale.</p>
  },
  {
    author: 'francis',
    content: (
      <>
        <p className="text-white text-lg mb-3">Trois optimisations majeures s'offrent à vous :</p>
        <div className="space-y-3">
          <div className="bg-white/10 rounded-lg p-4 border border-[#c5a572]/20">
            <p className="text-[#c5a572] font-medium mb-2">Structure societale</p>
            <p className="text-gray-200">Société andorrane • IS à 10% max • Économie : 28 000 €/an</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-[#c5a572]/20">
            <p className="text-[#c5a572] font-medium mb-2">Planification patrimoniale</p>
            <p className="text-gray-200">SICAV + Investissements • Exonération plus-values • Économie : 15 000 €/an</p>
          </div>
        </div>
      </>
    )
  },
  {
    author: 'marc',
    content: <p className="text-white text-lg">Intéressant. Et concernant l'IGI ?</p>
  },
  {
    author: 'francis',
    content: (
      <>
        <p className="text-white text-lg mb-3">L'IGI offre des exonérations strategiques :</p>
        <div className="bg-white/10 rounded-lg p-4 border border-[#c5a572]/20">
          <p className="text-[#c5a572] font-medium mb-2">Première résidence</p>
          <p className="text-gray-200">Exonération totale • Économie sur votre prochain achat : 12 000 €</p>
        </div>
      </>
    )
  },
  {
    author: 'marc',
    content: <p className="text-white text-lg">Parfait. Comment procédons-nous ?</p>
  },
  {
    author: 'francis',
    content: (
      <>
        <p className="text-white text-lg mb-3">Mise en place immédiate de votre stratégie optimisée.</p>
        <div className="bg-gradient-to-r from-[#c5a572]/20 to-[#e8cfa0]/20 rounded-lg p-4 border border-[#c5a572]/30">
          <p className="text-[#c5a572] font-semibold mb-2">Économies totales estimées</p>
          <p className="text-white text-xl font-bold">43 000 € par an</p>
        </div>
      </>
    )
  }
];

export function AndorreDemoConversation() {
  const [visibleCount, setVisibleCount] = useState(0);
  const { ref, inView } = useInView({ 
    triggerOnce: true, 
    rootMargin: '-100px',
    threshold: 0.2
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
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [inView]);

  return (
    <div className="max-w-4xl mx-auto mb-20" ref={ref}>
      <div className="bg-gradient-to-br from-[#0A0F1C]/95 via-[#162238]/95 to-[#1E3253]/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#c5a572]/20">
        {/* Header élégant */}
        <div className="bg-gradient-to-r from-[#162238]/90 to-[#1E3253]/90 px-8 py-6 border-b border-[#c5a572]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MessageSquare className="h-8 w-8 text-[#c5a572]" />
                <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#162238] rounded-full p-0.5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">Francis</h4>
                <p className="text-gray-400 text-sm">Expert fiscal Andorre</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full opacity-80"></div>
              <div className="w-3 h-3 bg-gray-500 rounded-full opacity-40"></div>
              <div className="w-3 h-3 bg-gray-500 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="p-8 space-y-8 min-h-[500px]">
          {conversation.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`flex items-end ${msg.author === 'marc' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.author === 'francis' && (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] flex items-center justify-center flex-shrink-0 mr-4 shadow-lg relative">
                  <MessageSquare className="w-6 h-6 text-[#162238]" />
                  <Euro className="w-4 h-4 text-[#162238] absolute -bottom-1 -right-1 bg-[#e8cfa0] rounded-full p-0.5" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl p-6 shadow-lg text-lg leading-relaxed ${
                  msg.author === 'marc'
                    ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-br-sm'
                    : 'bg-white/8 backdrop-blur-sm text-white rounded-bl-sm border border-white/10'
                }`}
              >
                {msg.content}
              </div>
              {msg.author === 'marc' && (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2A3F6C] to-[#1E3253] flex items-center justify-center flex-shrink-0 ml-4 shadow-lg">
                  <Users className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}
          
          {visibleCount < conversation.length && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start items-center pl-16"
            >
              <div className="flex space-x-1">
                <motion.div animate={{scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4]}} transition={{duration: 1.2, repeat: Infinity, delay:0}} className="w-2 h-2 bg-[#c5a572] rounded-full"></motion.div>
                <motion.div animate={{scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4]}} transition={{duration: 1.2, repeat: Infinity, delay:0.3}} className="w-2 h-2 bg-[#c5a572] rounded-full"></motion.div>
                <motion.div animate={{scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4]}} transition={{duration: 1.2, repeat: Infinity, delay:0.6}} className="w-2 h-2 bg-[#c5a572] rounded-full"></motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
