import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, User, Brain, Cpu, TrendingUp, CheckCircle, Loader2, Clock, Target, AlertTriangle, Send, Mic, Briefcase, FileText, BarChart2, Activity, Download, Euro, AlertCircle, Play, Pause, Volume2 } from 'lucide-react';

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

const DemoMessage = ({ message, visible }: { message: any, visible: boolean }) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      {/* Message système */}
      {message.type === 'system' && (
        <div className="text-center text-gray-400 text-sm flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          {message.content}
        </div>
      )}

      {/* Audio utilisateur */}
      {message.type === 'user_audio' && (
        <div className="flex items-start gap-3 justify-end">
          <div className="bg-[#c5a572] text-[#162238] rounded-2xl rounded-br-none p-4 max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <Volume2 className="w-5 h-5" />
              <span className="font-semibold">Entretien client</span>
              <span className="text-sm opacity-75">{message.duration}</span>
            </div>
            <p className="text-sm italic">"{message.content}"</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>
      )}

      {/* Message Francis */}
      {message.type === 'francis' && (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] flex items-center justify-center">
            <Bot className="w-6 h-6 text-[#162238]" />
          </div>
          <div className="bg-[#1E3253] text-gray-200 rounded-2xl rounded-bl-none p-4 max-w-md">
            <p className="font-semibold text-[#c5a572] mb-1">Francis</p>
            <p className="text-sm">{message.content}</p>
          </div>
        </div>
      )}

      {/* Analyse Francis */}
      {message.type === 'francis_analysis' && (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] flex items-center justify-center">
            <Bot className="w-6 h-6 text-[#162238]" />
          </div>
          <div className="bg-[#1E3253] text-gray-200 rounded-2xl rounded-bl-none p-4 max-w-md">
            <p className="text-sm mb-3">{message.content}</p>
            <div className="space-y-2">
              {message.items.map((item: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (item.delay - message.delay) / 1000 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Résultat Francis */}
      {message.type === 'francis_result' && (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] flex items-center justify-center">
            <Bot className="w-6 h-6 text-[#162238]" />
          </div>
          <div className="bg-[#1E3253] text-gray-200 rounded-2xl rounded-bl-none p-4 max-w-lg">
            <p className="font-semibold text-[#c5a572] mb-3">{message.content}</p>
            <div className="space-y-3">
              {message.optimizations.map((opt: any, index: number) => (
                <div key={index} className="bg-[#162238]/50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-white">{opt.title}</h4>
                    <span className="text-green-400 font-bold">{opt.saving}</span>
                  </div>
                  <p className="text-xs text-gray-400">{opt.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm">Économie totale estimée :</span>
                <span className="text-xl font-bold text-[#c5a572]">{message.totalSaving}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const demoConversation = [
  { 
    type: 'system',
    content: "Enregistrement en cours...",
    delay: 500
  },
  {
    type: 'user_audio',
    content: "Donc Monsieur Durand, vous avez 42 ans, vous êtes marié avec 2 enfants. Vos revenus annuels sont de 85 000€ en tant qu'ingénieur. Vous avez un patrimoine de 320 000€ incluant votre résidence principale et un appartement en location qui génère 800€ par mois...",
    duration: "0:47",
    delay: 1000
  },
  {
    type: 'francis',
    content: "J'ai bien enregistré les informations de M. Durand. Je détecte plusieurs opportunités d'optimisation fiscale.",
    delay: 3000
  },
  {
    type: 'francis_analysis',
    content: "Analyse en cours...",
    items: [
      { text: "Analyse des revenus fonciers", status: 'done', delay: 3500 },
      { text: "Calcul du TMI actuel", status: 'done', delay: 4000 },
      { text: "Recherche d'optimisations", status: 'done', delay: 4500 },
      { text: "Génération du rapport", status: 'done', delay: 5000 }
    ],
    delay: 3200
  },
  {
    type: 'francis_result',
    content: "✅ Analyse terminée ! J'ai identifié 3 optimisations principales :",
    optimizations: [
      { 
        title: "Déficit foncier", 
        description: "Passage au régime réel pour l'appartement locatif",
        saving: "1 250€/an"
      },
      {
        title: "PER déductible",
        description: "Versement optimal calculé selon votre TMI",
        saving: "987€/an"
      },
      {
        title: "Frais réels",
        description: "Option plus avantageuse que les 10%",
        saving: "610€/an"
      }
    ],
    totalSaving: "2 847€/an",
    delay: 5500
  }
];

const ConversationView = () => {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    demoConversation.forEach((msg, index) => {
      const timer = setTimeout(() => {
        setVisibleMessages(prev => [...prev, index]);
        if (msg.type === 'system') {
          setIsRecording(true);
        } else if (msg.type === 'user_audio') {
          setTimeout(() => setIsRecording(false), 1500);
        }
      }, msg.delay);
      timers.push(timer);
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleMessages]);

  return (
    <>
      <div className="p-6 h-[450px] overflow-y-auto" ref={scrollRef}>
        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm">Démonstration d'un entretien client avec Francis</p>
        </div>
        {demoConversation.map((msg, index) => (
          <DemoMessage 
            key={index} 
            message={msg} 
            visible={visibleMessages.includes(index)}
          />
        ))}
      </div>
      <div className="p-4 bg-[#162238]/80 border-t border-[#2A3F6C]/50">
        <div className="flex items-center justify-center gap-4">
          <button 
            className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-[#c5a572] text-[#162238] hover:bg-[#e8cfa0]'
            }`}
          >
            <Mic className="w-5 h-5" />
            {isRecording ? 'Enregistrement...' : 'Démarrer l\'enregistrement'}
          </button>
          <span className="text-gray-400 text-sm">ou</span>
          <button className="text-[#c5a572] hover:text-[#e8cfa0] text-sm underline">
            Importer un audio
          </button>
        </div>
      </div>
    </>
  );
};

const ClientView = () => (
  <div className="p-8 h-[542px] overflow-y-auto">
    <h3 className="text-2xl font-bold text-white mb-6">Profil Client Généré</h3>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Informations personnelles */}
      <div className="bg-[#1E3253]/80 p-6 rounded-xl border border-[#2A3F6C]">
        <h4 className="font-semibold text-[#c5a572] mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          M. Durand Jean-Pierre
        </h4>
        <div className="space-y-2 text-sm">
          <p><span className="text-gray-400">Âge:</span> 42 ans</p>
          <p><span className="text-gray-400">Situation familiale:</span> Marié, 2 enfants</p>
          <p><span className="text-gray-400">Profession:</span> Ingénieur</p>
          <p><span className="text-gray-400">Revenus annuels:</span> 85 000 €</p>
        </div>
      </div>

      {/* Patrimoine */}
      <div className="bg-[#1E3253]/80 p-6 rounded-xl border border-[#2A3F6C]">
        <h4 className="font-semibold text-[#c5a572] mb-4 flex items-center gap-2">
          <Euro className="w-5 h-5" />
          Patrimoine
        </h4>
        <div className="space-y-2 text-sm">
          <p><span className="text-gray-400">Total:</span> 320 000 €</p>
          <p><span className="text-gray-400">Résidence principale:</span> 220 000 €</p>
          <p><span className="text-gray-400">Appartement locatif:</span> 100 000 €</p>
          <p><span className="text-gray-400">Revenus locatifs:</span> 800 €/mois</p>
        </div>
      </div>
    </div>

    {/* Points d'attention */}
    <div className="mt-6 bg-[#1E3253]/80 p-6 rounded-xl border border-[#2A3F6C]">
      <h4 className="font-semibold text-[#c5a572] mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        Points d'attention identifiés
      </h4>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
          <div>
            <p className="font-medium">TMI élevé (30%)</p>
            <p className="text-sm text-gray-400">Opportunités de défiscalisation importantes</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
          <div>
            <p className="font-medium">Revenus fonciers non optimisés</p>
            <p className="text-sm text-gray-400">Micro-foncier moins avantageux que le réel</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
          <div>
            <p className="font-medium">Absence de PER</p>
            <p className="text-sm text-gray-400">Potentiel de déduction important non exploité</p>
          </div>
        </div>
      </div>
    </div>

    {/* Actions suivantes */}
    <div className="mt-6 bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/10 p-4 rounded-xl border border-[#c5a572]/30">
      <p className="text-sm text-gray-300">
        <strong className="text-[#c5a572]">Prochaines étapes :</strong> Demander l'avis d'imposition et les charges de l'appartement locatif pour affiner les calculs.
      </p>
    </div>
  </div>
);

const ReportView = () => (
  <div className="p-8 h-[542px] overflow-y-auto">
    <h3 className="text-2xl font-bold text-white mb-6">Documents Générés</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Rapport PDF */}
      <div className="bg-[#1E3253]/80 p-6 rounded-xl border border-[#2A3F6C] hover:border-[#c5a572] transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <FileText className="w-12 h-12 text-[#c5a572]" />
          <span className="text-xs text-gray-400">Généré il y a 2 min</span>
        </div>
        <h4 className="font-semibold text-white mb-2">Rapport d'Optimisation Fiscale</h4>
        <p className="text-sm text-gray-400 mb-4">Document PDF complet avec toutes les stratégies détaillées</p>
        <button className="flex items-center gap-2 text-[#c5a572] hover:text-[#e8cfa0] text-sm font-medium">
          <Download className="w-4 h-4" />
          Télécharger PDF
        </button>
      </div>

      {/* Export Excel */}
      <div className="bg-[#1E3253]/80 p-6 rounded-xl border border-[#2A3F6C] hover:border-[#c5a572] transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <FileText className="w-12 h-12 text-green-400" />
          <span className="text-xs text-gray-400">Généré il y a 2 min</span>
        </div>
        <h4 className="font-semibold text-white mb-2">Tableaux de Calcul</h4>
        <p className="text-sm text-gray-400 mb-4">Fichier Excel avec tous les calculs détaillés et simulations</p>
        <button className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium">
          <Download className="w-4 h-4" />
          Télécharger Excel
        </button>
      </div>
    </div>

    {/* Synthèse email */}
    <div className="mt-6 bg-[#1E3253]/80 p-6 rounded-xl border border-[#2A3F6C]">
      <h4 className="font-semibold text-[#c5a572] mb-4">Email de Synthèse</h4>
      <div className="bg-[#162238]/50 rounded-lg p-4 text-sm">
        <p className="text-gray-400 mb-2">Objet: Optimisation fiscale - Économie potentielle de 2 847€/an</p>
        <p className="text-gray-300">
          Bonjour M. Durand,<br/><br/>
          Suite à notre entretien, j'ai le plaisir de vous présenter les optimisations fiscales identifiées...
        </p>
      </div>
      <button className="mt-4 text-[#c5a572] hover:text-[#e8cfa0] text-sm font-medium">
        Envoyer l'email au client →
      </button>
    </div>
  </div>
);

const updates = [
    { title: "Réforme de la plus-value immobilière", description: "Nouvelles règles de calcul pour les résidences secondaires.", impactedClients: ["Martin", "Bernard"] },
    { title: "Plafond PER 2024 augmenté", description: "Le plafond de déduction a été réévalué de 2%.", impactedClients: ["Durand", "Petit"] },
    { title: "Fin du dispositif Pinel", description: "Analyse d'impact et alternatives pour les investissements locatifs.", impactedClients: ["Leroy"] },
];

const UpdatesView = () => (
    <div className="p-8 h-[542px] overflow-y-auto">
        <h3 className="text-2xl font-bold text-white mb-6">Veille Législative & Mises à Jour</h3>
        <div className="space-y-4">
            {updates.map((update, index) => (
                <div key={index} className="bg-[#1E3253]/80 p-4 rounded-xl border border-[#2A3F6C] hover:border-[#c5a572] transition-colors">
                    <h4 className="font-semibold text-white mb-2">{update.title}</h4>
                    <p className="text-gray-400 text-sm mb-3">{update.description}</p>
                    <div className="text-xs">
                        <span className="text-gray-500">Clients impactés : </span>
                        {update.impactedClients.map(client => <span key={client} className="inline-block bg-[#c5a572]/20 text-[#c5a572] rounded-full px-2 py-0.5 mr-1">{client}</span>)}
                  </div>
                </div>
            ))}
                          </div>
                        </div>
);

const tabs = [
    { id: 'chat', label: 'Entretien Client', icon: Mic, component: ConversationView },
    { id: 'client', label: 'Profil Généré', icon: User, component: ClientView },
    { id: 'report', label: 'Documents', icon: FileText, component: ReportView }
];

export function ProDemoSection() {
  const [activeTab, setActiveTab] = useState('chat');
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="py-20 px-4">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Voyez Francis en action
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          De l'entretien client au rapport complet en quelques minutes. 
          Découvrez comment Francis transforme votre pratique.
        </p>
      </div>

      <div className="max-w-5xl mx-auto bg-[#0F1E36] rounded-2xl shadow-2xl border border-[#2A3F6C]/50 overflow-hidden">
        {/* Onglets */}
        <div className="flex border-b border-[#2A3F6C]/50 bg-[#162238]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'text-[#c5a572] bg-[#1E3253] border-b-2 border-[#c5a572]' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-[#1E3253]/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {ActiveComponent && <ActiveComponent />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <p className="text-gray-300 mb-4">
          Prêt à transformer votre cabinet ?
        </p>
        <button className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
          Démarrer votre essai gratuit
        </button>
      </div>
    </div>
  );
} 