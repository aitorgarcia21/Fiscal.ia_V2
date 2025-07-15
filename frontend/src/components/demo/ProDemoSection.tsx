import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Bot, User, Brain, Cpu, TrendingUp, CheckCircle, Loader2, Clock, Target, 
  AlertTriangle, Send, Mic, Briefcase, FileText, BarChart2, Activity, 
  Download, Euro, AlertCircle, Play, Pause, Volume2, MessageSquare, 
  UserCheck, BarChart, Zap, Sparkles, Eye, Ear, FileDown, Lightbulb,
  Calculator, PieChart, ArrowRight, Timer, Shield, Star
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  duration: number;
  status: 'pending' | 'active' | 'completed';
  data?: any;
}

const ProDemoSection = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [leadsGenerated, setLeadsGenerated] = useState(false);

  const steps: DemoStep[] = [
    {
      id: 'listen',
      title: 'Écoute en temps réel',
      description: 'Francis écoute discrètement votre entretien',
      icon: Ear,
      duration: 3000,
      status: 'pending'
    },
    {
      id: 'transcribe',
      title: 'Transcription instantanée',
      description: 'Conversion audio → texte en temps réel',
      icon: FileText,
      duration: 2500,
      status: 'pending'
    },
    {
      id: 'analyze',
      title: 'Analyse IA avancée',
      description: 'Identification des opportunités fiscales',
      icon: Brain,
      duration: 4000,
      status: 'pending'
    },
    {
      id: 'generate',
      title: 'Génération automatique',
      description: 'PDF + Leads d\'optimisation',
      icon: FileDown,
      duration: 2000,
      status: 'pending'
    }
  ];

  const demoAudio = [
    "Bonjour Monsieur Martin, je suis ravi de vous rencontrer aujourd'hui.",
    "J'ai 45 ans, je suis marié avec 2 enfants. Je travaille comme directeur commercial.",
    "Mon salaire net est de 95 000€ par an, ma femme gagne 42 000€.",
    "Nous avons notre résidence principale à 450 000€ et un appartement en location.",
    "Je souhaite optimiser ma fiscalité et préparer ma retraite."
  ];

  const analysisResults = {
    optimizations: [
      {
        title: "PER (Plan d'Épargne Retraite)",
        saving: "8 500€",
        description: "Réduction d'impôt immédiate + épargne retraite",
        priority: "Haute",
        details: "Versement de 8 500€ = réduction d'impôt immédiate de 2 550€ + épargne retraite"
      },
      {
        title: "Investissement Pinel Toulouse",
        saving: "12 000€",
        description: "Programme neuf avec 12% de réduction d'impôt",
        priority: "Haute",
        details: "Appartement 2 pièces 250 000€ = 30 000€ de réduction sur 9 ans"
      },
      {
        title: "Assurance-vie transmission",
        saving: "3 200€",
        description: "Optimisation de la transmission successorale",
        priority: "Moyenne",
        details: "Contrat en faveur des enfants avec abattement de 152 500€"
      },
      {
        title: "Donation-partage anticipée",
        saving: "15 000€",
        description: "Transmission avec abattements renouvelables",
        priority: "Moyenne",
        details: "Donation de 100 000€ par enfant avec abattement de 100 000€"
      }
    ],
    totalSaving: "38 700€",
    timeToImplement: "2-3 mois",
    riskLevel: "Faible"
  };

  const leadsData = [
    {
      title: "PER BNP Paribas - Taux optimal",
      description: "Taux de réduction d'impôt de 30% + fonds en euros 3.5%",
      contact: "Marie Dubois - Conseillère patrimoniale",
      phone: "01 42 34 56 78",
      email: "m.dubois@bnpparibas.fr",
      priority: "Urgent",
      opportunity: "Ouverture possible sous 48h avec versement immédiat"
    },
    {
      title: "Programme Pinel Toulouse - Quartier Compans",
      description: "Appartement neuf 2 pièces 250 000€ avec 12% de réduction",
      contact: "Pierre Martin - Promoteur immobilier",
      phone: "05 61 23 45 67",
      email: "p.martin@promoteur-toulouse.fr",
      priority: "Haute",
      opportunity: "Livraison 2025, réduction d'impôt étalée sur 9 ans"
    },
    {
      title: "Assurance-vie AXA - Fonds euros + UC",
      description: "Fonds en euros 3.2% + unités de compte performantes",
      contact: "Sophie Bernard - Conseillère en investissement",
      phone: "01 45 67 89 12",
      email: "s.bernard@axa.fr",
      priority: "Normale",
      opportunity: "Contrat optimisé pour la transmission aux enfants"
    }
  ];

  useEffect(() => {
    if (isPlaying) {
      startDemo();
    }
  }, [isPlaying]);

  const startDemo = async () => {
    // Étape 1: Écoute
    setCurrentStep(0);
    steps[0].status = 'active';
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulation de l'écoute avec audio en temps réel
    for (let i = 0; i < demoAudio.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setTranscription(prev => prev + (prev ? '\n' : '') + demoAudio[i]);
    }

    // Étape 2: Transcription
    setCurrentStep(1);
    steps[0].status = 'completed';
    steps[1].status = 'active';
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Étape 3: Analyse
    setCurrentStep(2);
    steps[1].status = 'completed';
    steps[2].status = 'active';
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnalysis(analysisResults);

    // Étape 4: Génération
    setCurrentStep(3);
    steps[2].status = 'completed';
    steps[3].status = 'active';
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPdfGenerated(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setLeadsGenerated(true);
    
    steps[3].status = 'completed';
    setShowResults(true);
    setIsPlaying(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Découvrez Francis en <span className="text-[#c5a572]">action</span>
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Une démo spectaculaire du processus complet : de l'écoute à la génération de leads
        </p>
      </div>

      {/* Contrôles */}
      <div className="flex justify-center mb-12">
        <button
          onClick={() => {
            setIsPlaying(true);
            setTranscription('');
            setAnalysis(null);
            setPdfGenerated(false);
            setLeadsGenerated(false);
            setShowResults(false);
            steps.forEach(step => step.status = 'pending');
          }}
          disabled={isPlaying}
          className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
            isPlaying 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] hover:shadow-lg hover:scale-105'
          }`}
        >
          {isPlaying ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Démo en cours...
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              Lancer la démo
            </>
          )}
        </button>
      </div>

      {/* Étapes du processus */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-xl border-2 transition-all duration-500 ${
              step.status === 'active'
                ? 'border-[#c5a572] bg-[#c5a572]/10 shadow-lg shadow-[#c5a572]/20'
                : step.status === 'completed'
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-600 bg-[#1E3253]/60'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                step.status === 'active'
                  ? 'bg-[#c5a572] text-[#162238] animate-pulse'
                  : step.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-600 text-gray-400'
              }`}>
                {step.status === 'completed' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <step.icon className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            </div>
            
            {step.status === 'active' && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: step.duration / 1000, ease: 'linear' }}
                className="h-1 bg-[#c5a572] rounded-full"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Zone de démonstration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transcription en temps réel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#1E3253]/60 rounded-xl p-6 border border-[#2A3F6C]/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mic className="w-6 h-6 text-[#c5a572]" />
            <h3 className="text-xl font-semibold text-white">Transcription en temps réel</h3>
          </div>
          
          <div className="bg-[#162238] rounded-lg p-4 h-64 overflow-y-auto">
            <AnimatePresence>
              {transcription && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-300 text-sm leading-relaxed"
                >
                  {transcription.split('\n').map((line, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="mb-2"
                    >
                      {line}
                    </motion.p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Analyse IA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#1E3253]/60 rounded-xl p-6 border border-[#2A3F6C]/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-[#c5a572]" />
            <h3 className="text-xl font-semibold text-white">Analyse IA Francis</h3>
          </div>
          
          <AnimatePresence>
            {analysis && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="bg-[#162238] rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400">Économie totale estimée</span>
                    <span className="text-2xl font-bold text-[#c5a572]">{analysis.totalSaving}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Temps d'implémentation</span>
                      <p className="text-white font-semibold">{analysis.timeToImplement}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Niveau de risque</span>
                      <p className="text-green-400 font-semibold">{analysis.riskLevel}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {analysis.optimizations.map((opt: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-[#162238] rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-white text-sm">{opt.title}</h4>
                        <span className="text-green-400 font-bold text-sm">{opt.saving}</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{opt.description}</p>
                      <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                        <p className="text-xs text-green-400 font-medium">📊 Détails</p>
                        <p className="text-xs text-gray-300">{opt.details}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Résultats finaux */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">
                🎉 Résultats générés automatiquement !
              </h3>
              <p className="text-gray-300">
                Francis a créé votre rapport complet et identifié les meilleurs leads
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* PDF Généré */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1E3253]/60 rounded-xl p-6 border border-[#2A3F6C]/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FileDown className="w-6 h-6 text-[#c5a572]" />
                  <h3 className="text-xl font-semibold text-white">Rapport PDF généré</h3>
                </div>
                
                <div className="bg-[#162238] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold">Analyse_Fiscal_Martin.pdf</span>
                    <span className="text-green-400 text-sm">✓ Généré</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Pages</span>
                      <span>12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taille</span>
                      <span>2.4 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Optimisations identifiées</span>
                      <span>4</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Économie potentielle</span>
                      <span className="text-[#c5a572] font-bold">38 700€</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Leads générés */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-[#1E3253]/60 rounded-xl p-6 border border-[#2A3F6C]/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="w-6 h-6 text-[#c5a572]" />
                  <h3 className="text-xl font-semibold text-white">Leads d'optimisation</h3>
                </div>
                
                <div className="space-y-3">
                  {leadsData.map((lead, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-[#162238] rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white text-sm">{lead.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          lead.priority === 'Urgent' ? 'bg-red-500/20 text-red-400' :
                          lead.priority === 'Haute' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {lead.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{lead.description}</p>
                      <p className="text-xs text-[#c5a572] mb-1">{lead.contact}</p>
                      <p className="text-xs text-gray-400 mb-2">{lead.phone} • {lead.email}</p>
                      <div className="bg-[#c5a572]/10 border border-[#c5a572]/20 rounded p-2">
                        <p className="text-xs text-[#c5a572] font-medium">💡 Opportunité</p>
                        <p className="text-xs text-gray-300">{lead.opportunity}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* CTA Final */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <div className="bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/10 border border-[#c5a572]/20 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Prêt à transformer votre pratique ?
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Rejoignez les conseillers qui automatisent leur paperasse et génèrent plus de leads grâce à Francis.
                </p>
                <Link
                  to="/pro/signup"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  <Zap className="w-5 h-5" />
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProDemoSection; 