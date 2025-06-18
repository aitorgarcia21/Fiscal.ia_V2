import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Calculator, TrendingUp, FileText, PieChart, BarChart3, Target, Zap, MessageSquare, Clock, CheckCircle, ArrowRight, DollarSign, Building, Users, Shield, Settings, Filter, Search, Plus, Eye, Edit, Download, Calendar, Mail, Phone } from 'lucide-react';

interface Client {
  id: string;
  nom: string;
  statut: 'actif' | 'prospect' | 'inactif';
  revenus: number;
  economie: number;
  dernierContact: string;
  prochainRdv?: string;
}

interface AnalyseAuto {
  type: string;
  client: string;
  resultat: string;
  status: 'completed' | 'processing' | 'pending';
  timestamp: string;
}

export function ProDemoSection() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<AnalyseAuto[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Données de démo pour le dashboard pro
  const demoClients: Client[] = [
    {
      id: '1',
      nom: 'Durand Sophie',
      statut: 'actif',
      revenus: 85000,
      economie: 2847,
      dernierContact: '2024-12-18',
      prochainRdv: '2024-12-20 14:30'
    },
    {
      id: '2', 
      nom: 'Martin Jean-Pierre',
      statut: 'actif',
      revenus: 65000,
      economie: 1950,
      dernierContact: '2024-12-17'
    },
    {
      id: '3',
      nom: 'Leroy Marie',
      statut: 'prospect',
      revenus: 45000,
      economie: 0,
      dernierContact: '2024-12-16'
    },
    {
      id: '4',
      nom: 'Bernard Philippe',
      statut: 'actif',
      revenus: 120000,
      economie: 4250,
      dernierContact: '2024-12-15',
      prochainRdv: '2024-12-19 16:00'
    }
  ];

  const demoAnalyses: AnalyseAuto[] = [
    {
      type: 'Optimisation PER',
      client: 'Durand Sophie',
      resultat: '+847€ économie détectée',
      status: 'completed',
      timestamp: '14:32'
    },
    {
      type: 'Analyse LMNP',
      client: 'Bernard Philippe', 
      resultat: 'Investissement recommandé 180k€',
      status: 'completed',
      timestamp: '14:28'
    },
    {
      type: 'Audit fiscal 2024',
      client: 'Martin Jean-Pierre',
      resultat: 'En cours d\'analyse...',
      status: 'processing',
      timestamp: '14:25'
    },
    {
      type: 'Simulation dons',
      client: 'Leroy Marie',
      resultat: 'En attente données client',
      status: 'pending',
      timestamp: '14:20'
    }
  ];

  // Animation d'initialisation
  useEffect(() => {
    const timer1 = setTimeout(() => setClients(demoClients), 500);
    const timer2 = setTimeout(() => setAnalyses(demoAnalyses), 1000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Mise à jour périodique des analyses
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyses(prev => prev.map(analyse => 
        analyse.status === 'processing' ? 
        { ...analyse, status: 'completed', resultat: '1 950€ économie identifiée' } 
        : analyse
      ));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }: any) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
        isActive 
          ? 'bg-[#c5a572] text-[#162238]' 
          : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      actif: 'bg-green-500/20 text-green-400 border-green-500/30',
      prospect: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      inactif: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      pending: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs border ${colors[status as keyof typeof colors] || colors.inactif}`}>
        {status}
      </span>
    );
  };

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
              <Settings className="w-4 h-4 text-[#c5a572]" />
              <span className="text-[#c5a572] font-semibold text-sm">Démonstration Francis Pro Dashboard</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Démonstration Fiscal.ia Pro
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Interface complète pour gérer vos clients et analyses fiscales.
            </p>
          </motion.div>
        </div>

                 {/* Navigation onglets avec descriptions */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="mb-8"
         >
           <div className="text-center mb-6">
             <p className="text-gray-400">Explorez les fonctionnalités de l'interface pro</p>
           </div>
           
           <div className="flex flex-wrap justify-center gap-4">
             <TabButton id="dashboard" label="Dashboard" icon={BarChart3} isActive={activeTab === 'dashboard'} onClick={setActiveTab} />
             <TabButton id="clients" label="Clients" icon={Users} isActive={activeTab === 'clients'} onClick={setActiveTab} />
             <TabButton id="analyses" label="Analyses" icon={Zap} isActive={activeTab === 'analyses'} onClick={setActiveTab} />
             <TabButton id="rapports" label="Rapports" icon={FileText} isActive={activeTab === 'rapports'} onClick={setActiveTab} />
           </div>
         </motion.div>

        {/* Contenu des onglets */}
        <div className="bg-gradient-to-br from-white/8 to-white/4 rounded-2xl border border-[#c5a572]/20 overflow-hidden">
          
          {/* Header dashboard */}
          <div className="bg-[#c5a572]/10 p-6 border-b border-[#c5a572]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-[#162238]" />
                </div>
                                 <div>
                   <h3 className="text-xl font-bold text-white">Cabinet Fiscal Pro</h3>
                   <p className="text-[#c5a572] text-sm">Interface Fiscal.ia Pro • 47 clients actifs</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-white font-semibold">Dr. Martin Dubois</div>
                  <div className="text-gray-400 text-sm">Expert-comptable</div>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">MD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              
              {/* Dashboard principal */}
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     {[
                       { label: "Clients actifs", value: "47", change: "+3 ce mois", color: "text-green-400" },
                       { label: "Économies générées", value: "147k€", change: "+12% vs mois dernier", color: "text-blue-400" },
                       { label: "Analyses", value: "156", change: "23 cette semaine", color: "text-purple-400" },
                       { label: "Satisfaction", value: "98%", change: "+2 points", color: "text-yellow-400" }
                     ].map((metric, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                      >
                                                 <div className={`text-2xl font-bold ${metric.color} mb-1`}>{metric.value}</div>
                         <div className="text-white text-sm font-semibold mb-1">{metric.label}</div>
                         <div className="text-gray-400 text-xs">{metric.change}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Activité récente */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#c5a572]" />
                        Activité récente
                      </h4>
                      <div className="space-y-3">
                        {[
                          { action: "Analyse PER générée", client: "Durand Sophie", time: "Il y a 5 min", type: "success" },
                          { action: "Nouveau client ajouté", client: "Leroy Marie", time: "Il y a 15 min", type: "info" },
                          { action: "Rapport fiscal envoyé", client: "Martin Jean-Pierre", time: "Il y a 32 min", type: "neutral" },
                          { action: "RDV planifié", client: "Bernard Philippe", time: "Il y a 1h", type: "warning" }
                        ].map((activity, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.type === 'success' ? 'bg-green-400' :
                              activity.type === 'info' ? 'bg-blue-400' :
                              activity.type === 'warning' ? 'bg-yellow-400' : 'bg-gray-400'
                            }`} />
                            <div className="flex-1">
                              <div className="text-white text-sm">{activity.action}</div>
                              <div className="text-gray-400 text-xs">{activity.client} • {activity.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#c5a572]" />
                        Prochains RDV
                      </h4>
                      <div className="space-y-3">
                        {[
                          { client: "Durand Sophie", time: "Aujourd'hui 14:30", sujet: "Optimisation PER 2025", urgent: true },
                          { client: "Bernard Philippe", time: "Demain 16:00", sujet: "Stratégie LMNP", urgent: false },
                          { client: "Rousseau Claire", time: "Vendredi 10:00", sujet: "Bilan fiscal annuel", urgent: false }
                        ].map((rdv, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                            <div className={`w-3 h-3 rounded-full ${rdv.urgent ? 'bg-red-400 animate-pulse' : 'bg-[#c5a572]'}`} />
                            <div className="flex-1">
                              <div className="text-white text-sm font-semibold">{rdv.client}</div>
                              <div className="text-gray-400 text-xs">{rdv.sujet}</div>
                              <div className="text-[#c5a572] text-xs font-semibold">{rdv.time}</div>
                            </div>
                                                         <button className="p-2 bg-[#c5a572]/20 rounded-lg hover:bg-[#c5a572]/30 transition-colors" title="Voir les détails du rendez-vous">
                               <Eye className="w-4 h-4 text-[#c5a572]" />
                             </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Gestion clients */}
              {activeTab === 'clients' && (
                <motion.div
                  key="clients"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Barre d'outils */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          placeholder="Rechercher un client..."
                          className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572]"
                        />
                      </div>
                                             <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors" title="Filtrer les clients">
                         <Filter className="w-4 h-4 text-gray-400" />
                       </button>
                    </div>
                    <button className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Nouveau client
                    </button>
                  </div>

                  {/* Liste des clients */}
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="grid grid-cols-5 gap-4 p-4 bg-white/5 border-b border-white/10 text-gray-400 text-sm font-semibold">
                      <div>Client</div>
                      <div>Statut</div>
                      <div>Revenus</div>
                      <div>Économie</div>
                      <div>Actions</div>
                    </div>
                    
                    {clients.map((client, index) => (
                      <motion.div
                        key={client.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="grid grid-cols-5 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center"
                      >
                        <div>
                          <div className="text-white font-semibold">{client.nom}</div>
                          <div className="text-gray-400 text-xs">Dernier contact: {client.dernierContact}</div>
                        </div>
                        <div>
                          <StatusBadge status={client.statut} />
                        </div>
                        <div className="text-white font-semibold">
                          {client.revenus.toLocaleString()}€
                        </div>
                        <div className={`font-semibold ${client.economie > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                          {client.economie > 0 ? `+${client.economie.toLocaleString()}€` : 'À analyser'}
                        </div>
                                                 <div className="flex items-center gap-2">
                           <button className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors" title="Voir le profil client">
                             <Eye className="w-4 h-4 text-blue-400" />
                           </button>
                           <button className="p-2 bg-yellow-500/20 rounded-lg hover:bg-yellow-500/30 transition-colors" title="Modifier le client">
                             <Edit className="w-4 h-4 text-yellow-400" />
                           </button>
                           <button className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors" title="Contacter le client">
                             <MessageSquare className="w-4 h-4 text-green-400" />
                           </button>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Analyses automatisées */}
              {activeTab === 'analyses' && (
                <motion.div
                  key="analyses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                                     <div className="flex justify-between items-center">
                     <h4 className="text-xl font-bold text-white">Analyses automatisées</h4>
                     <button className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                       <Zap className="w-4 h-4" />
                       Lancer analyse
                     </button>
                   </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {analyses.map((analyse, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 rounded-xl p-6 border border-white/10"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h5 className="text-white font-semibold">{analyse.type}</h5>
                            <p className="text-gray-400 text-sm">{analyse.client}</p>
                          </div>
                          <StatusBadge status={analyse.status} />
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-gray-300 text-sm">{analyse.resultat}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs">{analyse.timestamp}</span>
                                                     {analyse.status === 'completed' && (
                             <div className="flex gap-2">
                               <button className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors" title="Voir l'analyse détaillée">
                                 <Eye className="w-4 h-4 text-blue-400" />
                               </button>
                               <button className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors" title="Télécharger le rapport">
                                 <Download className="w-4 h-4 text-green-400" />
                               </button>
                             </div>
                           )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Rapports */}
              {activeTab === 'rapports' && (
                <motion.div
                  key="rapports"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-xl font-bold text-white">Rapports intelligents</h4>
                    <button className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Générer rapport
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Rapport mensuel Cabinet",
                        description: "Vue d'ensemble des performances du cabinet",
                        type: "PDF • 12 pages",
                        generated: "Il y a 2 jours",
                        downloads: 15
                      },
                      {
                        title: "Analyses clients Q4 2024",
                        description: "Synthèse des optimisations réalisées",
                        type: "Excel • 47 clients",
                        generated: "Il y a 1 semaine",
                        downloads: 8
                      },
                      {
                        title: "Stratégies fiscales 2025",
                        description: "Recommandations pour la nouvelle année",
                        type: "PDF • 28 pages",
                        generated: "Il y a 3 jours",
                        downloads: 23
                      }
                    ].map((rapport, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-[#c5a572]/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-[#c5a572]/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-[#c5a572]" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-white font-semibold text-sm">{rapport.title}</h5>
                            <p className="text-gray-400 text-xs">{rapport.type}</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-4">{rapport.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-gray-400 text-xs">Généré {rapport.generated}</span>
                          <span className="text-[#c5a572] text-xs">{rapport.downloads} téléchargements</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="flex-1 bg-[#c5a572]/20 text-[#c5a572] py-2 px-3 rounded-lg text-sm font-semibold hover:bg-[#c5a572]/30 transition-colors flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" />
                            Télécharger
                          </button>
                                                     <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors" title="Prévisualiser le rapport">
                             <Eye className="w-4 h-4 text-gray-400" />
                           </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-br from-[#c5a572]/10 to-[#e8cfa0]/10 rounded-2xl p-8 border border-[#c5a572]/30 max-w-4xl mx-auto">
                         <h3 className="text-2xl font-bold text-white mb-4">
               Prêt à essayer Fiscal.ia Pro ?
             </h3>
             <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
               Rejoignez les professionnels qui utilisent Fiscal.ia Pro pour gérer leurs clients.
             </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                             <button className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 group">
                 <Building className="w-5 h-5" />
                 Essayer Fiscal.ia Pro
                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </button>
              
              <button className="bg-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/20">
                <Calendar className="w-5 h-5" />
                Planifier une démo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 