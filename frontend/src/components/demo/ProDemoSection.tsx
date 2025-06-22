import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, User, Calculator, TrendingUp, FileText, PieChart, BarChart3, Target, Zap, MessageSquare, Clock, CheckCircle, ArrowRight, DollarSign, Building, Users, Shield, Settings, Filter, Search, Plus, Eye, Edit, Download, Calendar, Mail, Phone, Brain, Cpu, Database, BarChart, TrendingDown, AlertTriangle, CheckSquare, XCircle, Loader2 } from 'lucide-react';

interface ClientProfile {
  id: string;
  nom: string;
  age: number;
  situation: string;
  revenus: number;
  patrimoine: number;
  secteur: string;
  objectifs: string[];
  contraintes: string[];
}

interface AnalyseDetail {
  id: string;
  type: string;
  description: string;
  statut: 'en_cours' | 'terminee' | 'erreur';
  resultat?: string;
  economie?: number;
  priorite: 'haute' | 'moyenne' | 'basse';
  temps: string;
  details: string[];
}

interface Optimisation {
  id: string;
  nom: string;
  description: string;
  economie: number;
  difficulte: 'facile' | 'moyenne' | 'complexe';
  delai: string;
  statut: 'disponible' | 'en_cours' | 'terminee';
}

export function ProDemoSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [selectedOptimisation, setSelectedOptimisation] = useState<string | null>(null);

  // Profil client détaillé
  const clientProfile: ClientProfile = {
    id: '1',
    nom: 'Marie Durand',
    age: 42,
    situation: 'Mariée, 2 enfants (8 et 12 ans)',
    revenus: 85000,
    patrimoine: 320000,
    secteur: 'Cadre commercial - Secteur immobilier',
    objectifs: ['Optimiser la fiscalité 2024', 'Préparer la retraite', 'Transmettre le patrimoine'],
    contraintes: ['Liquidités limitées', 'Horizon 15-20 ans', 'Préférence pour l\'immobilier']
  };

  // Analyses détaillées de Francis
  const analyses: AnalyseDetail[] = [
    {
      id: '1',
      type: 'Analyse fiscale globale',
      description: 'Scan complet du profil fiscal et identification des leviers d\'optimisation',
      statut: 'terminee',
      resultat: '15 opportunités d\'optimisation identifiées',
      economie: 2847,
      priorite: 'haute',
      temps: '2.3s',
      details: [
        'Taux marginal d\'imposition: 41%',
        'Revenus imposables: 78 450€',
        'Déductions actuelles: 3 200€',
        'Potentiel d\'optimisation: 2 847€/an'
      ]
    },
    {
      id: '2',
      type: 'Analyse PER (Plan Épargne Retraite)',
      description: 'Simulation des avantages fiscaux du PER selon différents scénarios',
      statut: 'terminee',
      resultat: 'Optimisation PER recommandée',
      economie: 847,
      priorite: 'haute',
      temps: '1.8s',
      details: [
        'Cotisation optimale: 8 500€/an',
        'Économie d\'impôt: 3 485€',
        'Coût net: 2 638€',
        'Gain net: 847€/an'
      ]
    },
    {
      id: '3',
      type: 'Analyse LMNP (Loueur Meublé Non Professionnel)',
      description: 'Évaluation de la pertinence d\'un investissement LMNP',
      statut: 'en_cours',
      priorite: 'moyenne',
      temps: 'En cours...',
      details: [
        'Analyse de la capacité d\'emprunt...',
        'Simulation des rendements...',
        'Calcul des avantages fiscaux...'
      ]
    },
    {
      id: '4',
      type: 'Optimisation ISF/IFI',
      description: 'Stratégies de réduction de l\'IFI sur le patrimoine immobilier',
      statut: 'terminee',
      resultat: 'Stratégie SCI recommandée',
      economie: 1200,
      priorite: 'moyenne',
      temps: '3.1s',
      details: [
        'Patrimoine immobilier: 280 000€',
        'IFI actuel: 1 200€/an',
        'Économie via SCI: 1 200€/an',
        'Coût de mise en place: 2 500€'
      ]
    },
    {
      id: '5',
      type: 'Analyse transmission',
      description: 'Optimisation de la transmission du patrimoine aux enfants',
      statut: 'terminee',
      resultat: 'Donation-partage recommandée',
      economie: 800,
      priorite: 'basse',
      temps: '4.2s',
      details: [
        'Patrimoine à transmettre: 320 000€',
        'Droits de succession actuels: 32 000€',
        'Économie via donation: 8 000€',
        'Horizon optimal: 5-7 ans'
      ]
    }
  ];

  // Optimisations recommandées
  const optimisations: Optimisation[] = [
    {
      id: '1',
      nom: 'Optimisation PER 2024',
      description: 'Cotisation de 8 500€ au PER pour réduire l\'imposition',
      economie: 847,
      difficulte: 'facile',
      delai: 'Immédiat',
      statut: 'disponible'
    },
    {
      id: '2',
      nom: 'Investissement LMNP',
      description: 'Acquisition d\'un studio en LMNP pour optimiser fiscalement',
      economie: 1200,
      difficulte: 'complexe',
      delai: '3-6 mois',
      statut: 'disponible'
    },
    {
      id: '3',
      nom: 'Création SCI familiale',
      description: 'Transfert du patrimoine immobilier en SCI pour optimiser l\'IFI',
      economie: 1200,
      difficulte: 'moyenne',
      delai: '2-3 mois',
      statut: 'disponible'
    },
    {
      id: '4',
      nom: 'Donation-partage anticipée',
      description: 'Transmission partielle du patrimoine aux enfants',
      economie: 800,
      difficulte: 'complexe',
      delai: '6-12 mois',
      statut: 'disponible'
    }
  ];

  // Simulation de l'analyse en temps réel
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'terminee':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'en_cours':
        return <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />;
      case 'erreur':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'haute':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'moyenne':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'basse':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
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
              <Brain className="w-4 h-4 text-[#c5a572]" />
              <span className="text-[#c5a572] font-semibold text-sm">Francis IA - Analyse Client en Temps Réel</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Francis analyse votre client
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Découvrez comment Francis analyse un profil client avec une précision chirurgicale et identifie les opportunités d'optimisation fiscale.
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
                  <p className="text-[#c5a572] text-sm">
                    {isAnalyzing ? 'Analyse en cours...' : 'Analyse terminée'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-white font-semibold">Client analysé</div>
                  <div className="text-gray-400 text-sm">{clientProfile.nom}</div>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">MD</span>
                </div>
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
                    
                    <div>
                      <div className="text-gray-400 text-xs mb-2">Secteur d'activité</div>
                      <div className="text-white text-sm">{clientProfile.secteur}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400 text-xs mb-2">Objectifs</div>
                      <div className="space-y-1">
                        {clientProfile.objectifs.map((objectif, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Target className="w-3 h-3 text-[#c5a572]" />
                            <span className="text-white text-sm">{objectif}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400 text-xs mb-2">Contraintes</div>
                      <div className="space-y-1">
                        {clientProfile.contraintes.map((contrainte, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-yellow-400" />
                            <span className="text-white text-sm">{contrainte}</span>
                          </div>
                        ))}
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
                    Analyses Francis en Temps Réel
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
                              {getStatusIcon(analyse.statut)}
                              <h5 className="text-white font-semibold">{analyse.type}</h5>
                              <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(analyse.priorite)}`}>
                                {analyse.priorite}
                              </span>
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
                          <div className="mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="text-green-400 font-semibold text-sm">{analyse.resultat}</div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          {analyse.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-center gap-2 text-sm">
                              <div className="w-1 h-1 bg-[#c5a572] rounded-full"></div>
                              <span className="text-gray-300">{detail}</span>
                            </div>
                          ))}
                        </div>
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
                  Optimisations Recommandées par Francis
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optimisations.map((optimisation, index) => (
                    <motion.div
                      key={optimisation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className={`bg-white/5 rounded-lg p-4 border border-white/10 cursor-pointer transition-all hover:border-[#c5a572]/50 ${
                        selectedOptimisation === optimisation.id ? 'border-[#c5a572] bg-[#c5a572]/10' : ''
                      }`}
                      onClick={() => setSelectedOptimisation(optimisation.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="text-white font-semibold">{optimisation.nom}</h5>
                          <p className="text-gray-400 text-sm">{optimisation.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-lg">+{optimisation.economie}€</div>
                          <div className="text-gray-400 text-xs">{optimisation.delai}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs border ${
                          optimisation.difficulte === 'facile' ? 'text-green-400 bg-green-400/10 border-green-400/30' :
                          optimisation.difficulte === 'moyenne' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
                          'text-red-400 bg-red-400/10 border-red-400/30'
                        }`}>
                          {optimisation.difficulte}
                        </span>
                        
                        <button className="bg-[#c5a572]/20 text-[#c5a572] px-3 py-1 rounded text-sm font-semibold hover:bg-[#c5a572]/30 transition-colors">
                          Voir détails
                        </button>
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
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-br from-[#c5a572]/10 to-[#e8cfa0]/10 rounded-2xl p-8 border border-[#c5a572]/30 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Francis analyse vos clients avec cette précision
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Chaque analyse Francis identifie en moyenne 15+ opportunités d'optimisation par client. 
              Rejoignez les professionnels qui font confiance à l'IA fiscale la plus avancée.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pro/signup">
                <button className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 group">
                  <Brain className="w-5 h-5" />
                  Essayer Francis Pro
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              <button className="bg-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/20">
                <Calendar className="w-5 h-5" />
                Voir Francis en action
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 