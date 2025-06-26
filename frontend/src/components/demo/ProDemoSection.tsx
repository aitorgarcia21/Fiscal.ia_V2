import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, User, Brain, Cpu, TrendingUp, CheckCircle, Loader2, Clock, Target, AlertTriangle, Send, Mic, Briefcase, FileText, BarChart2, Activity } from 'lucide-react';

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
  { author: "Vous", content: "Bonjour Francis, j'ai un nouveau client, Mr. Durand. Je te fais un mémo vocal rapide.", isUser: true, delay: 1000 },
  { author: "Francis", content: "Bonjour ! Parfait, je vous écoute. Je prendrai des notes et créerai le profil client automatiquement.", delay: 2500 },
  { author: "Vous", content: "(Audio) 'Mr Durand a 42 ans, marié, 2 enfants. Ingénieur, revenus annuels de 85k€, patrimoine de 320k€ dont un appartement en location.'", isUser: true, delay: 4000 },
  { author: "Francis", content: "C'est noté. Le profil de M. Durand est créé. Je lance l'analyse complète... Un instant.", delay: 5500 },
  { author: "Francis", content: "Analyse terminée. J'ai identifié 3 optimisations majeures. L'économie potentielle est de 2,847€ pour cette année.", delay: 8000 },
  { author: "Francis", content: "Pour finaliser le rapport et valider ces stratégies, j'aurai besoin de son dernier avis d'imposition et des statuts de sa SCI. Les demandes sont ajoutées à sa fiche.", delay: 9500 },
];

const ConversationView = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    });
    return (
        <>
            <div className="p-6 h-[450px] overflow-y-auto" ref={scrollRef}>
                {demoConversation.map((msg, index) => (
                    <DemoMessage key={index} {...msg} />
                ))}
            </div>
            <div className="p-4 bg-[#162238]/80 border-t border-[#2A3F6C]/50 backdrop-blur-sm">
              <div className="relative">
                <input type="text" placeholder="Posez votre question à Francis..." className="w-full bg-[#1E3253] border border-[#2A3F6C] rounded-full py-3 pl-6 pr-24 text-white placeholder-gray-500" disabled />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  <button className="text-gray-400 hover:text-[#c5a572] transition-colors" disabled aria-label="Enregistrer un mémo vocal"><Mic className="w-6 h-6" /></button>
                  <button className="p-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full text-[#162238]" disabled aria-label="Envoyer le message"><Send className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
        </>
    );
}

const ClientView = () => (
    <div className="p-8 h-[542px] overflow-y-auto">
        <h3 className="text-2xl font-bold text-white mb-6">Fiche Client : Durand</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1E3253]/80 p-6 rounded-xl border border-[#2A3F6C]">
                <h4 className="font-semibold text-[#c5a572] mb-3">Informations Clés</h4>
                <p><strong>Âge:</strong> 42 ans</p>
                <p><strong>Situation:</strong> Marié, 2 enfants</p>
                <p><strong>Revenus:</strong> 85,000 € / an</p>
                <p><strong>Patrimoine:</strong> 320,000 €</p>
            </div>
             <div className="bg-[#1E3253]/80 p-6 rounded-xl border border-[#2A3F6C]">
                <h4 className="font-semibold text-[#c5a572] mb-3">Pièces justificatives</h4>
                <div className="space-y-2">
                    <p className="flex justify-between items-center text-sm">Avis d'imposition 2023 <span className="font-semibold text-green-400">Reçu</span></p>
                    <p className="flex justify-between items-center text-sm">Statuts SCI Durand <span className="font-semibold text-yellow-400">En attente</span></p>
                    <p className="flex justify-between items-center text-sm">Relevés de compte <span className="font-semibold text-red-400">Manquant</span></p>
                </div>
            </div>
        </div>
        <div className="mt-6 bg-[#1E3253]/80 p-6 rounded-xl border border-[#2A3F6C]">
            <h4 className="font-semibold text-[#c5a572] mb-4">Optimisations Identifiées</h4>
            <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[#2A3F6C]/50 rounded-lg"><span>Versement PER</span><span className="font-bold text-green-400">+ 1,250 € / an</span></div>
                <div className="flex justify-between items-center p-3 bg-[#2A3F6C]/50 rounded-lg"><span>Passage au réel (Fonciers)</span><span className="font-bold text-green-400">+ 987 € / an</span></div>
                <div className="flex justify-between items-center p-3 bg-[#2A3F6C]/50 rounded-lg"><span>Ajustement TMI (SCPI)</span><span className="font-bold text-green-400">+ 610 € / an</span></div>
            </div>
            <div className="text-right mt-4 text-xl font-bold text-white">Économie totale : <span className="text-[#c5a572]">2,847 € / an</span></div>
        </div>
    </div>
);

const ReportView = () => (
    <div className="p-8 h-[542px] overflow-y-auto">
        <h3 className="text-2xl font-bold text-white mb-6">Rapports & Analyses : Durand</h3>
        <div className="text-center p-6 bg-[#1E3253]/80 rounded-xl border border-[#2A3F6C]">
            <FileText className="mx-auto w-16 h-16 text-[#c5a572] mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">Rapport d'Optimisation Fiscale</h4>
            <p className="text-gray-400 mb-6">Rapport complet de 24 pages généré par Francis.</p>
            <button className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-bold py-2 px-6 rounded-lg">Télécharger le PDF</button>
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
    { id: 'chat', label: 'Conversation IA', icon: Bot, component: ConversationView },
    { id: 'client', label: 'Fiche Client', icon: Briefcase, component: ClientView },
    { id: 'report', label: 'Rapports', icon: BarChart2, component: ReportView },
    { id: 'updates', label: 'Veille Active', icon: Activity, component: UpdatesView }
];

export function ProDemoSection() {
    const [activeTab, setActiveTab] = useState('chat');
    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

    return (
        <div className="bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] py-20 px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-4xl font-extrabold text-white mb-4">Votre cabinet, <span className="text-[#c5a572]">augmenté</span>.</h2>
                <p className="text-lg text-gray-300">Passez de la conversation à la conclusion en un temps record. Tout est centralisé.</p>
            </div>
            <div className="max-w-4xl mx-auto bg-[#0F1E36] rounded-2xl shadow-2xl border border-[#2A3F6C]/50 overflow-hidden">
                <div className="flex border-b border-[#2A3F6C]/50">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-3 p-4 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'text-[#c5a572] bg-[#1E3253]' : 'text-gray-400 hover:bg-[#1E3253]/50'}`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {ActiveComponent && <ActiveComponent />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
} 