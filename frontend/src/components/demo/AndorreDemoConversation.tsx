import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MessageSquare, Euro, Users } from 'lucide-react';

const conversation = [
  {
    author: 'marc',
    content: (
      <>
        <p className="text-white text-lg mb-3">Bonjour Francis. J'ai un client français qui souhaite transférer sa résidence fiscale en Andorre avec des plus-values latentes de 2,5 M€. Quelles sont les implications de l'exit tax et les optimisations possibles ?</p>
      </>
    )
  },
  {
    author: 'francis',
    content: (
      <>
        <p className="text-white text-lg mb-3">Excellente question. Analysons l'exit tax français et les stratégies d'optimisation :</p>
        <div className="space-y-3">
          <div className="bg-white/10 rounded-lg p-4 border border-[#c5a572]/20">
            <p className="text-[#c5a572] font-medium mb-2">📋 Exit Tax - Art. 167 bis CGI</p>
            <p className="text-gray-200">• Seuil : détention ≥ 1% ou valeur ≥ 1,3 M€</p>
            <p className="text-gray-200">• Taux : 30% sur plus-values latentes</p>
            <p className="text-gray-200">• Impact estimé : 750 000 € (2,5 M€ × 30%)</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-[#c5a572]/20">
            <p className="text-[#c5a572] font-medium mb-2">⚖️ Convention France-Andorre 2015</p>
            <p className="text-gray-200">• Art. 13 : élimination double imposition</p>
            <p className="text-gray-200">• Crédit d'impôt en Andorre possible</p>
          </div>
        </div>
      </>
    )
  },
  {
    author: 'marc',
    content: <p className="text-white text-lg">Quelles stratégies recommandez-vous pour minimiser l'impact ?</p>
  },
  {
    author: 'francis',
    content: (
      <>
        <p className="text-white text-lg mb-3">Trois stratégies d'optimisation basées sur la jurisprudence :</p>
        <div className="space-y-3">
          <div className="bg-white/10 rounded-lg p-4 border border-[#c5a572]/20">
            <p className="text-[#c5a572] font-medium mb-2">🕐 Étalement du paiement - Art. 167 bis CGI</p>
            <p className="text-gray-200">• Sursis de paiement sur 5 ans si engagement de conservation</p>
            <p className="text-gray-200">• Économie de trésorerie : 750 000 € différés</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-[#c5a572]/20">
            <p className="text-[#c5a572] font-medium mb-2">🏛️ Holding andorrane - Llei 95/2010</p>
            <p className="text-gray-200">• Participation exemption (Art. 4.g)</p>
            <p className="text-gray-200">• IS réduit à 2% sur dividendes reçus</p>
          </div>
        </div>
      </>
    )
  },
  {
    author: 'marc',
    content: <p className="text-white text-lg">Excellent. Quel calendrier recommandez-vous ?</p>
  },
  {
    author: 'francis',
    content: (
      <>
        <p className="text-white text-lg mb-3">Roadmap d'optimisation fiscale :</p>
        <div className="space-y-3">
          <div className="bg-white/10 rounded-lg p-4 border border-[#c5a572]/20">
            <p className="text-[#c5a572] font-medium mb-2">📅 Phase 1 (Mois 1-2)</p>
            <p className="text-gray-200">• Constitution holding andorrane</p>
            <p className="text-gray-200">• Demande sursis exit tax (Art. 167 bis-0 A CGI)</p>
          </div>
          <div className="bg-gradient-to-r from-[#c5a572]/20 to-[#e8cfa0]/20 rounded-lg p-4 border border-[#c5a572]/30">
            <p className="text-[#c5a572] font-semibold mb-2">💰 Optimisation fiscale totale</p>
            <p className="text-white text-xl font-bold">Économie : 525 000 € sur 5 ans</p>
            <p className="text-gray-300 text-sm mt-1">vs. exit tax immédiate de 750 000 €</p>
          </div>
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
