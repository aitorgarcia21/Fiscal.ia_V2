import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, User, Brain, Cpu, TrendingUp, CheckCircle, Loader2, Clock, Target, AlertTriangle, Send, Mic } from 'lucide-react';

interface ClientProfile {
  id: string;
  nom: string;
  age: number;
  situation: string;
  revenus: number;
  patrimoine: number;
}

interface AnalyseDetail {
  id: string;
  type: string;
  description: string;
  statut: 'en_cours' | 'terminee';
  resultat?: string;
  economie?: number;
  temps: string;
}

const DemoMessage = ({ author, content, isUser, delay }: { author: string, content: string, isUser?: boolean, delay: number }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex items-start gap-4 my-6 ${isUser ? 'justify-end' : ''}`}
    >
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] flex items-center justify-center flex-shrink-0">
          <Bot className="w-6 h-6 text-[#162238]" />
        </div>
      )}
      <div className={`p-4 rounded-2xl max-w-lg ${isUser ? 'bg-[#c5a572] text-[#162238] rounded-br-none' : 'bg-[#1E3253] text-gray-200 rounded-bl-none'}`}>
        <p className="font-bold text-sm mb-1">{isUser ? 'Vous' : author}</p>
        <p className="text-sm">{content}</p>
      </div>
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-gray-200" />
        </div>
      )}
    </motion.div>
  );
};

const demoConversation = [
  { author: "Vous", content: "Bonjour Francis, j'ai un nouveau client, Mr. Durand. Peux-tu analyser sa situation ?", isUser: true, delay: 1000 },
  { author: "Francis", content: "Bonjour ! Bien sûr. Pouvez-vous me donner les informations de base ? Ou je peux écouter votre mémo vocal si vous préférez.", delay: 2500 },
  { author: "Vous", content: "Il a 42 ans, marié, 2 enfants. Revenus annuels de 85k€, patrimoine de 320k€.", isUser: true, delay: 4000 },
  { author: "Francis", content: "Parfait. Je lance l'analyse complète... Un instant.", delay: 5500 },
  { author: "Francis", content: "Analyse terminée. J'ai identifié 3 optimisations majeures : un versement sur son PER pour saturer le plafond, une révision de sa déclaration de revenus fonciers (passage au réel), et un ajustement de sa tranche marginale d'imposition. L'économie potentielle est de 2,847€ pour cette année. Je vous génère le rapport détaillé.", delay: 8000 },
];

export function ProDemoSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [demoConversation]);

  // Profil client simplifié
  const clientProfile: ClientProfile = {
    id: '1',
    nom: 'Marie Durand',
    age: 42,
    situation: 'Mariée, 2 enfants',
    revenus: 85000,
    patrimoine: 320000
  };

  // Analyses simplifiées
  const analyses: AnalyseDetail[] = [
    {
      id: '1',
      type: 'Analyse fiscale globale',
      description: 'Scan complet du profil fiscal',
      statut: 'terminee',
      resultat: '15 opportunités d\'optimisation identifiées',
      economie: 2847,
      temps: '2.3s'
    },
    {
      id: '2',
      type: 'Optimisation PER',
      description: 'Simulation Plan Épargne Retraite',
      statut: 'terminee',
      resultat: 'Optimisation PER recommandée',
      economie: 847,
      temps: '1.8s'
    },
    {
      id: '3',
      type: 'Analyse LMNP',
      description: 'Évaluation investissement immobilier',
      statut: 'en_cours',
      temps: 'En cours...'
    }
  ];

  // Optimisations simplifiées
  const optimisations = [
    { nom: 'Optimisation PER 2024', economie: 847, difficulte: 'facile' },
    { nom: 'Investissement LMNP', economie: 1200, difficulte: 'complexe' },
    { nom: 'Création SCI familiale', economie: 1200, difficulte: 'moyenne' }
  ];

  return (
    <div className="bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] py-20 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-extrabold text-white mb-4">
          Une conversation. Des résultats.
        </h2>
        <p className="text-lg text-gray-300">
          Voici à quel point il est simple d'obtenir des stratégies fiscales puissantes avec Francis.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-[#0F1E36] rounded-2xl shadow-2xl border border-[#2A3F6C]/50 overflow-hidden">
        <div className="p-6 h-[500px] overflow-y-auto" ref={scrollRef}>
          {demoConversation.map((msg, index) => (
            <DemoMessage key={index} {...msg} />
          ))}
        </div>
        <div className="p-4 bg-[#162238]/80 border-t border-[#2A3F6C]/50 backdrop-blur-sm">
          <div className="relative">
            <input
              type="text"
              placeholder="Posez votre question à Francis..."
              className="w-full bg-[#1E3253] border border-[#2A3F6C] rounded-full py-3 pl-6 pr-24 text-white placeholder-gray-500"
              disabled
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <button className="text-gray-400 hover:text-[#c5a572] transition-colors" disabled aria-label="Enregistrer un mémo vocal">
                <Mic className="w-6 h-6" />
              </button>
              <button className="p-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full text-[#162238]" disabled aria-label="Envoyer le message">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 px-4 bg-gradient-to-br from-[#0A1628] to-[#162238]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#c5a572]/20 px-4 py-2 rounded-full border border-[#c5a572]/30 mb-6">
                <Brain className="w-4 h-4 text-[#c5a572]" />
                <span className="text-[#c5a572] font-semibold text-sm">Francis IA - Analyse Client</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Francis analyse votre client
              </h2>
              
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Découvrez comment Francis identifie les opportunités d'optimisation fiscale en temps réel.
              </p>
            </motion.div>
          </div>

          {/* Interface d'analyse Francis */}
          <div className="bg-gradient-to-br from-white/8 to-white/4 rounded-2xl border border-[#c5a572]/20 overflow-hidden">
            
            {/* Header Francis */}
            <div className="bg-gradient-to-r from-[#c5a572]/20 to-[#e8cfa0]/20 p-6 border-b border-[#c5a572]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-[#162238]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>🤖</span> Francis IA
                    </h3>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-semibold">Client analysé</div>
                  <div className="text-gray-400 text-sm">{clientProfile.nom}</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Profil client */}
                <div className="lg:col-span-1">
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-[#c5a572]" />
                      Profil Client
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="text-white font-semibold text-lg">{clientProfile.nom}</div>
                        <div className="text-gray-400 text-sm">{clientProfile.age} ans • {clientProfile.situation}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-gray-400 text-xs">Revenus</div>
                          <div className="text-white font-semibold">{clientProfile.revenus.toLocaleString()}€</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-gray-400 text-xs">Patrimoine</div>
                          <div className="text-white font-semibold">{clientProfile.patrimoine.toLocaleString()}€</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analyses en cours */}
                <div className="lg:col-span-2">
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#c5a572]" />
                      Analyses Francis
                    </h4>
                    
                    <div className="space-y-4">
                      {analyses.map((analyse, index) => (
                        <motion.div
                          key={analyse.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="bg-white/5 rounded-lg p-4 border border-white/10"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <h5 className="text-white font-semibold">{analyse.type}</h5>
                              </div>
                              <p className="text-gray-400 text-sm">{analyse.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-400 text-xs">{analyse.temps}</div>
                              {analyse.economie && (
                                <div className="text-green-400 font-semibold">+{analyse.economie}€</div>
                              )}
                            </div>
                          </div>
                          
                          {analyse.resultat && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                              <div className="text-green-400 font-semibold text-sm">{analyse.resultat}</div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Optimisations recommandées */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-6"
              >
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#c5a572]" />
                    Optimisations Recommandées
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {optimisations.map((optimisation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        className="bg-white/5 rounded-lg p-4 border border-white/10"
                      >
                        <h5 className="text-white font-semibold mb-2">{optimisation.nom}</h5>
                        <div className="flex items-center justify-between">
                          <div className="text-green-400 font-bold">+{optimisation.economie}€</div>
                          <span className={`px-2 py-1 rounded text-xs border ${
                            optimisation.difficulte === 'facile' ? 'text-green-400 bg-green-400/10 border-green-400/30' :
                            optimisation.difficulte === 'moyenne' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
                            'text-red-400 bg-red-400/10 border-red-400/30'
                          }`}>
                            {optimisation.difficulte}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">Économie totale potentielle</div>
                        <div className="text-gray-400 text-sm">Basée sur l'analyse Francis</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold text-2xl">
                          +{optimisations.reduce((sum, opt) => sum + opt.economie, 0).toLocaleString()}€
                        </div>
                        <div className="text-gray-400 text-sm">par an</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="text-center mt-12"
          >
            <div className="bg-gradient-to-br from-[#c5a572]/10 to-[#e8cfa0]/10 rounded-2xl p-8 border border-[#c5a572]/30 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Francis analyse vos clients avec cette précision
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Chaque analyse Francis identifie en moyenne 15+ opportunités d'optimisation par client.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/pro/signup">
                  <button className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2">
                    <Brain className="w-5 h-5" />
                    Essayer Francis Pro
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 