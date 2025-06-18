import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Calculator, TrendingUp, FileText, PieChart, BarChart3, Target, Zap, MessageSquare, Clock, CheckCircle, ArrowRight, DollarSign, Building, Users, Shield } from 'lucide-react';

interface Message {
  type: 'francis' | 'user' | 'client';
  content: string;
  timestamp: string;
  data?: any;
  isSystem?: boolean;
}

interface ClientProfile {
  nom: string;
  revenus: number;
  situationFamiliale: string;
  enfants: number;
  patrimoine: number;
  objectifs: string[];
}

export function ProDemoSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);

  // Simulation d'un client réel
  const demoClient: ClientProfile = {
    nom: "Mme Sophie Durand",
    revenus: 85000,
    situationFamiliale: "Mariée, 2 enfants",
    enfants: 2,
    patrimoine: 320000,
    objectifs: ["Optimiser l'impôt 2025", "Préparer la retraite", "Investir dans l'immobilier"]
  };

  // Messages de conversation réaliste
  const conversationSteps = [
    {
      type: 'system' as const,
      content: "Nouveau client connecté : Mme Sophie Durand",
      timestamp: "14:32",
      isSystem: true
    },
    {
      type: 'client' as const,
      content: "Bonjour, je souhaiterais optimiser ma situation fiscale pour 2025. Mon comptable m'a dit que je pourrais économiser pas mal avec ma situation...",
      timestamp: "14:32"
    },
    {
      type: 'francis' as const,
      content: "Bonjour Mme Durand ! 👋 Francis ici, votre assistant fiscal intelligent. J'ai analysé votre profil en temps réel. Avec vos 85k€ de revenus et votre situation familiale, je détecte immédiatement plusieurs optimisations majeures !",
      timestamp: "14:32"
    },
    {
      type: 'francis' as const,
      content: "🎯 **ANALYSE INSTANTANÉE TERMINÉE**\n\n• Potentiel d'économie : **2 847€/an**\n• 6 optimisations détectées\n• Temps d'analyse : 0.8 secondes\n\nVoulez-vous voir le détail de ma stratégie personnalisée ?",
      timestamp: "14:33",
      data: {
        economie: 2847,
        optimisations: 6,
        tempsAnalyse: "0.8s"
      }
    },
    {
      type: 'client' as const,
      content: "Impressionnant ! Oui, montrez-moi tout ça, je suis curieuse de voir ce que vous avez trouvé 😊",
      timestamp: "14:33"
    },
    {
      type: 'francis' as const,
      content: "**🚀 STRATÉGIE D'OPTIMISATION PERSONNALISÉE**\n\n**1. PER - Plan Épargne Retraite**\n• Versement optimal : 8 500€\n• Économie immédiate : 1 105€\n• Réduction TMI de 13% à 11%\n\n**2. Investissement LMNP** \n• Appartement 150k€ avec amortissement\n• 0€ d'impôt sur 18k€ de loyers/an\n• ROI fiscal : 100%\n\n**3. Dons stratégiques**\n• Don de 1 500€ = 990€ de crédit d'impôt\n• Coût réel : 510€ pour 1 500€ de don",
      timestamp: "14:34",
      data: {
        strategies: [
          { nom: "PER", versement: 8500, economie: 1105 },
          { nom: "LMNP", investissement: 150000, loyers: 18000 },
          { nom: "Dons", don: 1500, credit: 990 }
        ]
      }
    },
    {
      type: 'client' as const,
      content: "Waouh ! Et tout ça est légal j'espère ? 😅 Comment être sûre que c'est conforme ?",
      timestamp: "14:35"
    },
    {
      type: 'francis' as const,
      content: "**🛡️ CONFORMITÉ GARANTIE**\n\nAbsolument ! Toutes mes recommandations sont :\n\n✅ **Basées sur le CGI officiel** (Code Général des Impôts)\n✅ **Validées par la jurisprudence** récente\n✅ **Conformes BOFIP** 2024-2025\n✅ **Approuvées par 12 experts-comptables** partenaires\n\n📋 Je génère automatiquement tous les documents justificatifs pour votre dossier.",
      timestamp: "14:35"
    },
    {
      type: 'francis' as const,
      content: "**📊 SIMULATION COMPLÈTE GÉNÉRÉE**\n\n**Situation actuelle :**\n• Impôt 2025 : 11 247€\n\n**Après optimisation Francis :**\n• Nouvel impôt : 8 400€\n• **Économie totale : 2 847€**\n• Gain de pouvoir d'achat : +24%\n\n*Voulez-vous que je contacte votre expert-comptable pour valider cette stratégie ?*",
      timestamp: "14:36",
      data: {
        impotActuel: 11247,
        impotOptimise: 8400,
        economie: 2847,
        gainPouvoirAchat: 24
      }
    }
  ];

  // Animation des messages
  useEffect(() => {
    if (currentStep < conversationSteps.length) {
      const timer = setTimeout(() => {
        setIsTyping(true);
        
        setTimeout(() => {
          const newMessage = conversationSteps[currentStep];
          setMessages(prev => [...prev, newMessage]);
          setIsTyping(false);
          
          // Mise à jour des données si présentes
          if (newMessage.data) {
            if (newMessage.data.economie) {
              setCurrentAnalysis(newMessage.data);
            }
          }
          
          setCurrentStep(prev => prev + 1);
        }, 1500);
      }, currentStep === 0 ? 500 : 2000);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Initialisation du profil client
  useEffect(() => {
    const timer = setTimeout(() => {
      setClientProfile(demoClient);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="py-20 px-4 bg-gradient-to-br from-[#0A1628] to-[#162238]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#c5a572]/20 px-4 py-2 rounded-full border border-[#c5a572]/30 mb-6">
              <Zap className="w-4 h-4 text-[#c5a572]" />
              <span className="text-[#c5a572] font-semibold text-sm">Démo Interactive Francis Pro</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Voyez Francis en action
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Découvrez comment Francis révolutionne le conseil fiscal avec une vraie conversation client. 
              <span className="text-[#c5a572] font-semibold"> Analyse en temps réel, recommandations précises, conformité garantie.</span>
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profil Client */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-white/8 to-white/4 rounded-2xl p-6 border border-[#c5a572]/20 h-fit"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-[#c5a572]" />
              Profil Client
            </h3>
            
            {clientProfile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-[#c5a572]/10 rounded-lg border border-[#c5a572]/20">
                  <User className="w-8 h-8 text-[#c5a572]" />
                  <div>
                    <div className="text-white font-semibold">{clientProfile.nom}</div>
                    <div className="text-gray-400 text-sm">Cliente Premium</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Revenus annuels</span>
                    <span className="text-white font-semibold">{clientProfile.revenus.toLocaleString()}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Situation</span>
                    <span className="text-white font-semibold">{clientProfile.situationFamiliale}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Patrimoine</span>
                    <span className="text-white font-semibold">{clientProfile.patrimoine.toLocaleString()}€</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-300 text-sm mb-2">Objectifs</div>
                  <div className="space-y-1">
                    {clientProfile.objectifs.map((obj, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Target className="w-3 h-3 text-[#c5a572]" />
                        <span className="text-gray-300">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-[#c5a572] border-t-transparent rounded-full"></div>
              </div>
            )}
          </motion.div>

          {/* Conversation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white/8 to-white/4 rounded-2xl border border-[#c5a572]/20 overflow-hidden"
          >
            {/* Header Chat */}
            <div className="bg-[#c5a572]/10 p-4 border-b border-[#c5a572]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-[#162238]" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Francis Pro</div>
                    <div className="text-[#c5a572] text-sm flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Analyse en cours...
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded">
                  Session Pro Active
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`flex ${message.type === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.isSystem ? (
                      <div className="w-full text-center">
                        <div className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30 inline-block">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div className={`max-w-[80%] ${
                        message.type === 'client' 
                          ? 'bg-[#c5a572] text-[#162238]' 
                          : 'bg-white/10 text-white'
                      } rounded-xl p-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          {message.type === 'francis' ? (
                            <Bot className="w-4 h-4 text-[#c5a572]" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                          <span className="text-xs opacity-70">{message.timestamp}</span>
                        </div>
                        <div className="whitespace-pre-line text-sm leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 rounded-xl p-3 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#c5a572]" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#c5a572] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Analytics Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            {/* Métriques temps réel */}
            <div className="bg-gradient-to-br from-white/8 to-white/4 rounded-2xl p-6 border border-[#c5a572]/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#c5a572]" />
                Métriques Temps Réel
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Temps d'analyse</span>
                  <span className="text-green-400 font-bold">0.8s</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Optimisations détectées</span>
                  <span className="text-[#c5a572] font-bold">6</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Conformité légale</span>
                  <span className="text-green-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    100%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Satisfaction client</span>
                  <span className="text-yellow-400 font-bold">⭐ 4.9/5</span>
                </div>
              </div>
            </div>

            {/* Résultats financiers */}
            {currentAnalysis && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-2xl p-6 border border-green-500/30"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Impact Financier
                </h3>
                
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {currentAnalysis.economie?.toLocaleString()}€
                  </div>
                  <div className="text-gray-300 text-sm">Économie annuelle</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-lg font-bold text-white">24%</div>
                    <div className="text-xs text-gray-400">Gain pouvoir d'achat</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-lg font-bold text-white">100%</div>
                    <div className="text-xs text-gray-400">Légal & sécurisé</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="bg-gradient-to-br from-[#c5a572]/10 to-[#e8cfa0]/10 rounded-2xl p-6 border border-[#c5a572]/30">
              <h3 className="text-lg font-bold text-white mb-4">Actions Disponibles</h3>
              
              <div className="space-y-3">
                <button className="w-full bg-[#c5a572]/20 hover:bg-[#c5a572]/30 text-white p-3 rounded-lg border border-[#c5a572]/30 hover:border-[#c5a572]/50 transition-all flex items-center justify-between group">
                  <span className="text-sm">Générer rapport client</span>
                  <FileText className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-white p-3 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all flex items-center justify-between group">
                  <span className="text-sm">Planifier RDV client</span>
                  <Clock className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-white p-3 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all flex items-center justify-between group">
                  <span className="text-sm">Contacter expert-comptable</span>
                  <MessageSquare className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-br from-[#c5a572]/10 to-[#e8cfa0]/10 rounded-2xl p-8 border border-[#c5a572]/30 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Prêt à révolutionner votre cabinet ?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Rejoignez les 150+ professionnels qui utilisent déjà Francis Pro pour multiplier 
              leurs résultats et satisfaire leurs clients.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 group">
                <Building className="w-5 h-5" />
                Démarrer l'essai Pro
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="bg-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/20">
                <MessageSquare className="w-5 h-5" />
                Planifier une démo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 