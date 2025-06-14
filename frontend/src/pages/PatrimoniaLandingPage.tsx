import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Briefcase, CheckCircle, DollarSign, Eye, FileText, MessageSquare, Zap, PlayCircle, Music2, User, Users, TrendingUp, Sliders, ListChecks, ShieldCheck, Sparkles as SparklesIcon, Euro, Home, Gift, Info, Star, Award, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthModal } from '../components/auth/AuthModal'; // Réutiliser si la connexion pro passe par là
import { useAuth } from '../contexts/AuthContext'; // Importer useAuth

// Variantes d'animation (peuvent être partagées ou spécifiques)
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const featureVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.2, duration: 0.5, ease: "easeOut" }
  })
};

// États possibles pour la démo interactive
type DemoStep = 'initial' | 'profileSelection' | 'caseInput' | 'analysis' | 'results' | 'toolTour';

// Données simulées pour le cas client et les résultats
const baseClientData = {
  revenuAnnuel: "120,000€",
  patrimoineImmobilier: "850,000€",
  epargneFinanciere: "250,000€",
  objectifPrincipal: "Optimisation fiscale et préparation transmission"
};

// NOUVEAU: Définition des profils clients pour la démo
interface DemoProfile {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  clientData: {
    revenuAnnuel: string;
    patrimoineImmobilier: string;
    epargneFinanciere: string;
    objectifPrincipal: string;
    detailsSpecifiques?: string; 
  };
}

const demoProfiles: DemoProfile[] = [
  {
    id: 'entrepreneur',
    name: 'Entrepreneur Dynamique',
    icon: Briefcase, // Ou une autre icône pertinente
    description: 'Focus sur la croissance, l\'optimisation des revenus professionnels et la protection du patrimoine.',
    clientData: {
      revenuAnnuel: "180,000€ (BIC/BNC)",
      patrimoineImmobilier: "650,000€ (RP + Bureaux)",
      epargneFinanciere: "150,000€ (Comptes pro & perso)",
      objectifPrincipal: 'Optimisation rémunération/dividendes, préparation cession.',
      detailsSpecifiques: 'Détient 80% de sa société (valorisation 1.2M€).'
    }
  },
  {
    id: 'investisseur',
    name: 'Investisseur Averti',
    icon: TrendingUp,
    description: 'Recherche de diversification, performance des actifs et optimisation fiscale des placements.',
    clientData: {
      revenuAnnuel: "90,000€ (Salaires + Revenus Fonciers)",
      patrimoineImmobilier: "1,200,000€ (Locatifs multiples)",
      epargneFinanciere: "450,000€ (PEA, AV, Compte-titres)",
      objectifPrincipal: 'Réduire l\'IFI, optimiser les revenus locatifs, diversification internationale.',
      detailsSpecifiques: 'Fort appétit pour le risque sur une partie du portefeuille.'
    }
  },
  {
    id: 'famille',
    name: 'Famille Prévoyante',
    icon: Users, // Icône pour famille
    description: 'Sécurisation de l\'avenir familial, préparation de la retraite et transmission aux enfants.',
    clientData: {
      revenuAnnuel: "110,000€ (Deux salaires)",
      patrimoineImmobilier: "700,000€ (Résidence principale)",
      epargneFinanciere: "200,000€ (Livrets, Assurance Vie)",
      objectifPrincipal: 'Préparer la retraite, financer études enfants, anticiper la succession.',
      detailsSpecifiques: 'Deux enfants mineurs (10 et 14 ans).'
    }
  }
];

// NOUVEAU: Résultats simulés spécifiques par profil
const simulatedResultsEntrepreneur = {
  potentielEconomie: "12,300€ / an (Optimisation Rémunération & Fiscale Société)",
  optimisations: [
    { 
      title: "Optimisation Rémunération Dirigeant", 
      details: "Arbitrage salaire/dividendes, mise en place de PEE/PERCOI pour réduire charges et impôts sur les revenus professionnels.", 
      impact: "Baisse de l\'IRPP et des charges sociales, augmentation du net disponible.",
      icon: Briefcase 
    },
    { 
      title: "Structuration IS vs IR pour l\'Activité", 
      details: "Analyse comparative de la pertinence du passage à l\'Impôt sur les Sociétés pour l\'activité professionnelle afin d\'optimiser la fiscalité globale.", 
      impact: "Meilleure gestion des flux financiers et potentielle réduction d\'impôt.",
      icon: Sliders 
    },
    { 
      title: "Pacte Dutreil (Transmission d\'Entreprise)", 
      details: "Anticipation de la transmission de l\'entreprise familiale avec le dispositif Dutreil, permettant une exonération partielle des droits de mutation.",
      impact: "Réduction drastique des droits de succession/donation sur la valeur de l\'entreprise.",
      icon: ShieldCheck 
    },
    {
      title: "Apport-Cession (Art. 150-0 B Ter CGI)",
      details: "Utilisation du mécanisme d\'apport-cession pour reporter l\'imposition des plus-values lors de la cession de titres de la société.",
      impact: "Différé d\'imposition permettant un réinvestissement total du produit de cession.",
      icon: TrendingUp
    }
  ]
};

const simulatedResultsInvestisseur = {
  potentielEconomie: "15,800€ / an (Optimisation IFI & Rendements Actifs)",
  optimisations: [
    { 
      title: "Démembrement de Propriété (Stratégie IFI)", 
      details: "Application du démembrement (séparation usufruit/nue-propriété) sur certains biens immobiliers pour réduire l\'assiette taxable à l\'IFI.", 
      impact: "Sortie de la valeur de la nue-propriété de l\'IFI et préparation de la transmission.",
      icon: Home 
    },
    { 
      title: "Diversification en Actifs Décorrélés", 
      details: "Allocation vers des SCPI Européennes (revenus potentiels peu fiscalisés en France) ou du Private Equity pour optimiser le couple rendement/risque.", 
      impact: "Amélioration du rendement global du patrimoine et possible optimisation fiscale.",
      icon: DollarSign 
    },
    { 
      title: "Utilisation Optimale des Enveloppes de Capitalisation", 
      details: "Maximisation des versements et arbitrages au sein du PEA et des contrats d\'Assurance Vie anciens pour bénéficier de leur fiscalité avantageuse sur les rachats et la transmission.",
      impact: "Réduction de l\'imposition sur les plus-values et les intérêts, transmission optimisée.",
      icon: ListChecks 
    },
    {
      title: "Gestion Active des Déficits Fonciers",
      details: "Stratégies d\'investissement et de déclaration pour optimiser l\'imputation des déficits fonciers sur le revenu global ou les revenus fonciers futurs.",
      impact: "Diminution de l\'impôt sur le revenu via la déduction des déficits.",
      icon: FileText
    }
  ]
};

const simulatedResultsFamille = {
  potentielEconomie: "7,200€ / an (Préparation Avenir & Optimisation Fiscale Familiale)",
  optimisations: [
    { 
      title: "Versements Stratégiques sur PER", 
      details: "Optimisation des versements sur le Plan d\'Épargne Retraite pour chaque conjoint afin de maximiser la déduction fiscale sur l\'IRPP et préparer les revenus futurs.", 
      impact: "Réduction de l\'impôt sur le revenu actuel et constitution d\'un capital pour la retraite.",
      icon: TrendingUp 
    },
    { 
      title: "Assurance-Vie et Clause Bénéficiaire Sur-Mesure", 
      details: "Utilisation de l\'assurance-vie comme outil de transmission privilégié avec une rédaction attentive de la clause bénéficiaire pour protéger les proches et optimiser la fiscalité successorale.", 
      impact: "Transmission hors succession (en partie) et fiscalité réduite pour les bénéficiaires.",
      icon: ShieldCheck 
    },
    { 
      title: "Donations aux Enfants (Manuelles / Notariées)", 
      details: "Exploitation des abattements fiscaux pour donations (tous les 15 ans) afin de transmettre du patrimoine (liquidités, titres, biens) de manière anticipée et fiscalement optimisée.",
      impact: "Réduction des futurs droits de succession et aide directe aux enfants.",
      icon: Gift 
    },
    {
      title: "Optimisation du Quotient Familial & Crédits d\'Impôt",
      details: "Vérification exhaustive et optimisation de toutes les charges déductibles (pensions versées) et crédits/réductions d\'impôt liés à la famille (garde d\'enfants, études, dons).",
      impact: "Maximisation des avantages fiscaux liés à la situation familiale.",
      icon: Users
    }
  ]
};

// AMÉLIORATION: Fonctionnalités de l'outil plus détaillées
const toolFeatures = [
  { 
    icon: Briefcase, 
    title: "Suivi Client Intégré 360°", 
    description: "Centralisez toutes les informations clients : état civil, patrimoine mobilier et immobilier, fiscalité, objectifs. Une vision globale pour un conseil sur-mesure." 
  }, 
  { 
    icon: FileText, 
    title: "Analyses & Stratégies d\'Investissement", 
    description: "Module d\'analyse de portefeuille, aide à l\'allocation d\'actifs, simulations de rendement net de fiscalité et comparaison de scénarios d\'investissement." 
  }, 
  { 
    icon: Zap, 
    title: "Optimisation Fiscale & Transmission Avancée", 
    description: "Simulateurs IRPP, IFI, droits de succession. Modélisation de stratégies de transmission (démembrement, donation) et optimisation des dispositifs fiscaux (PER, Girardin, etc.)." 
  },
  {
    icon: SparklesIcon, 
    title: "Génération de Rapports Personnalisés",
    description: "Créez des bilans patrimoniaux et des recommandations stratégiques clairs, professionnels et conformes, prêts à être présentés à vos clients."
  }
];

// AMÉLIORATION: Messages pour l'étape d'analyse
const analysisMessages = [
  "Analyse de la structure patrimoniale...",
  "Identification des leviers fiscaux et sociaux...",
  "Prise en compte des objectifs clients...",
  "Simulation des scénarios d\'optimisation...",
  "Croisement avec la législation en vigueur...",
  "Finalisation des recommandations..."
];

export function PatrimoniaLandingPage() { // RENOMMÉ ICI
  const navigate = useNavigate();
  const { user, isAuthenticated, isProfessional, isLoadingAuth } = useAuth(); // Utiliser le hook Auth
  const [showAuthModal, setShowAuthModal] = useState<false | 'login' | 'signup'>(false);
  const [demoStep, setDemoStep] = useState<DemoStep>('initial');
  const [currentAnalysisMessageIndex, setCurrentAnalysisMessageIndex] = useState(0); // Pour l'étape d'analyse
  const [selectedProfile, setSelectedProfile] = useState<DemoProfile | null>(null); // NOUVEAU: État pour le profil sélectionné
  // const audioRef = useRef<HTMLAudioElement>(null); // Commenté temporairement

  // const playMusic = () => { // Commenté temporairement
  //   audioRef.current?.play();
  // };

  // AMÉLIORATION: Logique pour l'étape d'analyse
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (demoStep === 'analysis') {
      setCurrentAnalysisMessageIndex(0); // Reset au début de l'étape
      interval = setInterval(() => {
        setCurrentAnalysisMessageIndex(prevIndex => {
          if (prevIndex < analysisMessages.length - 1) {
            return prevIndex + 1;
          }
          clearInterval(interval); // Arrêter l'intervalle
          // Passer à l'étape suivante après le dernier message
          setTimeout(() => setDemoStep('results'), 1500); // Délai avant de passer aux résultats
          return prevIndex;
        });
      }, 2000); // Changer de message toutes les 2 secondes
    }
    return () => clearInterval(interval); // Nettoyage
  }, [demoStep]);

  const handleEspaceProClick = () => {
    if (isAuthenticated && isProfessional) {
      navigate('/pro/dashboard');
    } else {
      setShowAuthModal('login');
    }
  };

  const renderDemoContent = () => {
    let currentResults: any = simulatedResultsFamille; // Default
    if (selectedProfile) {
      if (selectedProfile.id === 'entrepreneur') currentResults = simulatedResultsEntrepreneur;
      else if (selectedProfile.id === 'investisseur') currentResults = simulatedResultsInvestisseur;
      else if (selectedProfile.id === 'famille') currentResults = simulatedResultsFamille;
    }

    switch (demoStep) {
      case 'profileSelection':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">
              Choisissez un <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#88C0D0] to-[#B48EAD]">Profil Client</span> pour la Démo
            </h3>
            <p className="text-center text-gray-400 mb-8 text-sm sm:text-base flex items-center justify-center">
              <Info className="w-4 h-4 mr-2 text-gray-500" />Cliquez sur un profil pour voir comment Patrimonia s'adapte.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {demoProfiles.map((profile) => (
                <motion.div
                  key={profile.id}
                  variants={featureVariants} 
                  initial="hidden"
                  animate="visible"
                  whileHover={{ 
                    scale: 1.07, 
                    boxShadow: "0px 15px 30px rgba(0,0,0,0.3)",
                    borderColor: '#A3BE8C'
                  }}
                  onClick={() => {
                    setSelectedProfile(profile);
                    setDemoStep('caseInput');
                  }}
                  className="bg-gradient-to-br from-[#0E2444]/90 to-[#15305D]/90 p-6 rounded-xl shadow-xl border-2 border-[#3E5F8A]/70 hover:border-[#A3BE8C] cursor-pointer transition-all duration-300 flex flex-col items-center text-center h-full transform hover:-translate-y-1"
                >
                  <profile.icon className="w-12 h-12 text-[#88C0D0] mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">{profile.name}</h4>
                  <p className="text-sm text-gray-400 flex-grow">{profile.description}</p>
                </motion.div>
              ))}
            </div>
             <button 
                onClick={() => setDemoStep('initial')} 
                className="mt-10 mx-auto block px-6 py-2 text-sm text-[#BF616A] hover:text-white border border-[#BF616A] hover:bg-[#BF616A]/80 rounded-lg transition-colors duration-300"
              >
                Retour à l'Accueil Démo
              </button>
          </motion.div>
        );
      case 'caseInput':
        if (!selectedProfile) return <p>Veuillez sélectionner un profil.</p>; 
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full bg-[#0E2444]/60 p-6 sm:p-8 rounded-lg shadow-xl border border-[#3E5F8A]/70">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#88C0D0] mb-6 text-center">
              Cas Client : <span className="text-white">{selectedProfile.name}</span>
            </h3>
            <div className="space-y-3 sm:space-y-4 text-left">
              {Object.entries(selectedProfile.clientData).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-[#0A192F]/80 rounded-md shadow-sm">
                  <span className="text-sm text-gray-300 capitalize flex-shrink-0 mb-1 sm:mb-0">
                    {key.replace(/([A-Z])/g, ' $1').replace(/details Specifiques/i, 'Détails Spécifiques').trim()}:
                  </span>
                  <span className="text-sm sm:text-base text-white font-medium sm:text-right break-words">{String(value)}</span>
                </div>
              ))}
            </div>
            <motion.button 
              onClick={() => setDemoStep('analysis')} 
              className="mt-8 w-full px-8 py-3 bg-gradient-to-r from-[#B48EAD] to-[#A3BE8C] text-[#0A192F] font-semibold rounded-lg shadow-xl hover:shadow-[#B48EAD]/50 hover:scale-105 transition-all duration-300 text-base sm:text-lg"
              whileHover={{ boxShadow: "0px 0px 18px rgba(179, 142, 173, 0.7)" }}
            >
              Lancer l'Analyse pour {selectedProfile.name}
            </motion.button>
            <button 
                onClick={() => setDemoStep('profileSelection')} 
                className="mt-5 mx-auto block text-sm text-gray-400 hover:text-[#88C0D0] underline transition-colors duration-300"
              >
                Changer de Profil
            </button>
          </motion.div>
        );
      case 'analysis':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full text-center p-8 flex flex-col items-center justify-center min-h-[300px]">
            <motion.div 
              animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 mx-auto mb-8 border-4 border-dashed border-[#88C0D0] rounded-full flex items-center justify-center"
            >
              <SparklesIcon className="w-10 h-10 text-[#88C0D0] animate-pulse" />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentAnalysisMessageIndex} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-xl font-semibold text-gray-300 min-h-[3rem] flex items-center justify-center"
              >
                {analysisMessages[currentAnalysisMessageIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        );
      case 'results':
        if (!selectedProfile) return <p>Veuillez d\'abord sélectionner un profil et lancer l\'analyse.</p>;
        return (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{duration: 0.7, ease: "easeOut"}} exit={{ opacity: 0 }} className="w-full bg-[#0E2444]/80 p-6 sm:p-8 rounded-xl shadow-2xl border border-[#2A3F6C]/80">
            <h3 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A3BE8C] to-[#B48EAD]">🚀 Résultats d'Optimisation pour {selectedProfile.name}</span> 
              <CheckCircle className="inline w-7 h-7 sm:w-8 sm:h-8 ml-2 text-[#A3BE8C]"/>
            </h3>
            <div className="bg-gradient-to-br from-[#0A192F]/95 to-[#10284D]/95 p-6 rounded-lg mb-8 text-center shadow-inner border border-[#3E5F8A]/70">
              <p className="text-base sm:text-lg text-gray-300 mb-1">Potentiel d'économie fiscale & successorale estimé :</p>
              <p className="text-4xl sm:text-5xl font-extrabold text-[#A3BE8C] my-2 tracking-tight">{currentResults.potentielEconomie}</p>
            </div>
            <div className="space-y-5">
              {currentResults.optimisations.map((opt: any, index: number) => (
                <motion.div 
                  key={index} 
                  custom={index} 
                  variants={featureVariants} 
                  initial="hidden" 
                  animate="visible" 
                  className="bg-gradient-to-br from-[#0D203D]/70 to-[#132B4F]/70 p-5 rounded-xl shadow-xl border border-[#3E5F8A]/60 hover:border-[#88C0D0]/70 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-2xl"
                >
                  <div className="flex items-start gap-4">
                    <opt.icon className="w-8 h-8 sm:w-10 sm:h-10 text-[#88C0D0] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-md sm:text-lg font-semibold text-white mb-1.5">{opt.title}</h4>
                      <p className="text-sm text-gray-300 leading-relaxed mb-2">{opt.details}</p>
                      <p className="text-sm text-gray-200"><strong className="font-semibold text-[#82c99f]">Impact Attendu :</strong> <span className="font-medium text-green-300">{opt.impact}</span></p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.button 
              onClick={() => setDemoStep('toolTour')} 
              className="mt-10 w-full px-8 py-3.5 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] font-semibold rounded-xl shadow-xl hover:shadow-[#88C0D0]/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#88C0D0] focus:ring-offset-2 focus:ring-offset-[#0A192F] transition-all duration-300 flex items-center justify-center gap-2 text-base sm:text-lg"
              whileHover={{ boxShadow: "0px 0px 20px rgba(136, 192, 208, 0.7)" }}
            >
              Découvrir les Outils Patrimonia <ArrowRight className="w-5 h-5"/>
            </motion.button>
          </motion.div>
        );
      case 'toolTour':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8 sm:mb-10 text-center">
              Explorez les <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#88C0D0] to-[#B48EAD]">Fonctionnalités Clés</span> de Patrimonia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {toolFeatures.map((feature, index) => (
                <motion.div 
                  key={index} 
                  custom={index} 
                  variants={featureVariants} 
                  initial="hidden" 
                  animate="visible" 
                  className="bg-gradient-to-br from-[#0E2444]/80 to-[#15305D]/80 p-6 rounded-xl shadow-xl border border-[#3E5F8A]/70 hover:border-[#88C0D0]/80 transition-all duration-300 flex flex-col items-start text-left h-full transform hover:scale-105 hover:shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <feature.icon className="w-10 h-10 sm:w-12 sm:h-12 text-[#88C0D0] flex-shrink-0" />
                    <h4 className="text-lg sm:text-xl font-semibold text-white">{feature.title}</h4>
                  </div>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed flex-grow">{feature.description}</p>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-10 sm:mt-12">
              <motion.button 
                onClick={() => setDemoStep('initial')} 
                className="w-full sm:w-auto px-8 py-3 text-sm sm:text-base text-gray-300 hover:text-white border-2 border-gray-600 hover:border-[#88C0D0] rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:bg-gray-700/50"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Recommencer la Démo
              </motion.button>
              <motion.button 
                onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })} 
                className="w-full sm:w-auto px-8 py-3 text-sm sm:text-base bg-gradient-to-r from-[#A3BE8C] to-[#B48EAD] text-[#0A192F] font-semibold rounded-xl shadow-xl hover:shadow-[#A3BE8C]/50 hover:scale-105 transition-all duration-300"
                whileHover={{ scale: 1.03, boxShadow: "0px 0px 18px rgba(163, 190, 140, 0.6)" }}
                whileTap={{ scale: 0.98 }}
              >
                Demander une Démo Personnalisée
              </motion.button>
            </div>
          </motion.div>
        );
      default: // 'initial' ou inconnu
        return (
          <motion.div className="text-center py-8">
            <motion.h4 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-300 mb-8"
            >
              Prêt à voir la puissance de Patrimonia en action ?
            </motion.h4>
            <motion.button
              onClick={() => setDemoStep('profileSelection')}
              className="px-10 py-4 sm:px-12 sm:py-5 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] font-bold rounded-xl shadow-xl hover:scale-105 transition-transform duration-300 text-lg sm:text-xl flex items-center gap-3 mx-auto"
              whileHover={{ boxShadow: "0px 0px 25px rgba(136, 192, 208, 0.6)" }}
            >
              <PlayCircle className="w-7 h-7 sm:w-8 sm:h-8" /> Lancer la Démo Interactive
            </motion.button>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-sm text-gray-500 mt-6 max-w-md mx-auto"
            >
              Suivez quelques étapes simples pour découvrir comment nous transformons l'analyse de cas client en stratégies patrimoniales claires et efficaces.
            </motion.p>
          </motion.div>
        );
    }
  };

  const pricingTiers = [
    {
      icon: Star,
      name: "Essentiel",
      price: "49 € HT", 
      frequency: "/ mois par utilisateur",
      description: "Idéal pour les consultants indépendants et petites structures souhaitant une solution clé en main pour digitaliser leur conseil.",
      features: [
        "Gestion jusqu'à 50 dossiers clients",
        "Analyses fiscales standards (IRPP, IFI)",
        "Simulations patrimoniales de base",
        "Support communautaire et email",
      ],
      cta: "Choisir Essentiel",
      delay: 0.2,
    },
    {
      icon: Award,
      name: "Performance",
      price: "99 € HT", 
      frequency: "/ mois par utilisateur",
      description: "Conçu pour les cabinets établis visant l'excellence opérationnelle et des analyses approfondies pour leurs clients.",
      features: [
        "Gestion de dossiers clients illimitée",
        "Analyses fiscales avancées et personnalisables",
        "Simulations multi-scénarios complexes",
        "Modules d'optimisation de transmission avancés",
        "Reporting client personnalisable et professionnel",
        "Support prioritaire dédié et documentation avancée",
      ],
      cta: "Opter pour Performance",
      highlight: true, 
      delay: 0.4,
    },
    {
      icon: Building,
      name: "Entreprise",
      price: "Sur Devis",
      frequency: "Tarification personnalisée",
      description: "Une solution sur mesure, pensée pour les grandes organisations, réseaux et institutions financières.",
      features: [
        "Toutes les fonctionnalités de l'offre Performance",
        "Intégrations personnalisées avec vos outils (CRM, etc.)",
        "Développements spécifiques pour besoins avancés (optionnel, sur étude)",
        "Option marque blanche complète",
        "Accompagnement stratégique et SLA dédié",
        "Tableau de bord administrateur avancé",
      ],
      cta: "Nous Contacter",
      delay: 0.6,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0B1A31] to-[#0D1F3A] text-gray-100 font-sans antialiased">
      {/* Header Pro MODIFIÉ */}
      <header className="fixed top-0 left-0 right-0 bg-[#0A192F]/95 backdrop-blur-lg border-b border-[#2A3F6C]/30 z-50 shadow-lg">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Patrimonia (MessageSquare + Euro) */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/patrimonia')}>
            <div className="relative inline-flex items-center justify-center group">
              <MessageSquare className="h-10 w-10 text-[#88C0D0] transition-transform group-hover:scale-110 duration-300" />
              <Euro className="h-7 w-7 text-[#88C0D0] absolute -bottom-2 -right-2 bg-[#0A192F] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
            </div>
            <span className="text-2xl font-bold text-[#88C0D0]">Patrimonia</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="px-5 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              Francis (Particuliers)
            </button>
            <button
              onClick={handleEspaceProClick} // MODIFIÉ ICI pour utiliser la nouvelle logique
              disabled={isLoadingAuth} // Optionnel: désactiver pendant que l'état d'auth charge
              className="px-6 py-2.5 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] font-semibold rounded-xl shadow-lg hover:shadow-[#88C0D0]/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#88C0D0] focus:ring-offset-2 focus:ring-offset-[#0A192F] transition-all duration-300 text-sm sm:text-base disabled:opacity-70"
            >
              {isLoadingAuth ? 'Vérification...' : (isAuthenticated && isProfessional ? 'Tableau de Bord Pro' : 'Connexion Pro')}
            </button>
          </div>
        </div>
      </header>

      {showAuthModal && (
        <AuthModal mode={showAuthModal} onClose={() => setShowAuthModal(false)} />
      )}

      {/* Hero Section Pro */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-32 pb-16 sm:pt-40 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ 
          backgroundImage: 'radial-gradient(circle at 25% 25%, #88C0D0 1px, transparent 1px), radial-gradient(circle at 75% 75%, #81A1C1 1px, transparent 1px)', 
          backgroundSize: '70px 70px' 
        }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A192F]/30 via-transparent to-[#0D1F3A]/20"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="mb-12">
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-200 to-white mb-8 leading-tight"
              initial={{ opacity: 0, y:20 }}
              animate={{ opacity:1, y:0 }}
              transition={{delay: 0.2, duration: 0.7}}
            >
              Patrimonia : L'excellence pour les <span className="relative inline-block text-[#88C0D0]">Experts du Patrimoine
                <motion.span 
                  className="absolute -bottom-2.5 left-0 w-full h-1.5 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] rounded-full"
                  initial={{ scaleX: 0 }} 
                  animate={{ scaleX: 1 }} 
                  transition={{ duration: 0.7, delay: 0.8, ease: "circOut" }}
                />
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light"
            >
              Optimisez votre conseil en fiscalité et gestion de patrimoine avec Patrimonia. Analyses pointues, gain de temps et valeur ajoutée pour vos clients.
            </motion.p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }} className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <motion.button
              onClick={() => document.getElementById('demo-interactive-section')?.scrollIntoView({ behavior: 'smooth' })} 
              whileHover={{ scale: 1.03, boxShadow: "0px 12px 30px rgba(136, 192, 208, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] font-semibold rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg border-2 border-transparent hover:border-[#8FBCBB]/50"
            >
              Voir la Démo Interactive
              <PlayCircle className="w-6 h-6 ml-1 opacity-80 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* NOUVELLE SECTION: Démo Interactive Patrimonia - Mise à jour */}
      <section id="demo-interactive-section" className="py-16 sm:py-24 px-4 bg-[#0D1F3A]">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Découvrez <span className="text-[#88C0D0]">Patrimonia</span> en Action
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Suivez notre démonstration interactive pour visualiser la puissance et la simplicité de Patrimonia.
            </p>
          </motion.div>

          <div className="bg-[#0A192F]/80 p-4 sm:p-8 rounded-2xl shadow-2xl border border-[#2A3F6C]/60 min-h-[400px] flex flex-col justify-center items-center overflow-hidden">
            <AnimatePresence mode="wait">
              {renderDemoContent()}
            </AnimatePresence>
          </div>
          
          {/* Audio (toujours commenté pour l'instant) 
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } }} 
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col items-center text-center mt-10"
          >
            <div className="flex items-center gap-3 mb-4">
                <Music2 className="w-8 h-8 text-[#88C0D0]"/>
                <h3 className="text-2xl font-semibold text-white">Musique d'Ambiance</h3>
            </div>
            <audio ref={audioRef} controls className="w-full max-w-md rounded-lg shadow-md">
              <source src="/audio/musique-demo-patrimonia.mp3" type="audio/mpeg" />
              Votre navigateur ne supporte pas l'élément audio.
            </audio>
            <p className="text-sm text-gray-500 mt-3">Utilisez les contrôles pour lancer la musique.</p>
          </motion.div>
          */}
        </div>
      </section>

      {/* Section Fonctionnalités Pro */}
      <section className="py-16 sm:py-24 px-4 bg-[#0B1A31]/50">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-center mb-14 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 sm:mb-6 leading-tight">Conçu pour votre Performance Patrimoniale</h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">Des outils puissants pour transformer votre conseil en gestion de patrimoine.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 items-stretch">
            {[ 
              { icon: Briefcase, title: "Suivi Client Intégré", description: "Dossiers clients 360°, agrégation patrimoniale et vision consolidée pour un suivi optimal." }, 
              { icon: FileText, title: "Stratégies d'Investissement Personnalisées", description: "Analyse de portefeuille, allocation d'actifs, simulations de rendement et aide à la décision d'investissement." }, 
              { icon: Zap, title: "Optimisation Fiscale & Transmission", description: "Simulation IRPP/IFI, stratégies de transmission de patrimoine, et optimisation des dispositifs (PER, Assurance Vie, etc.)." },
              { icon: DollarSign, title: "Reporting Client Professionnel", description: "Génération de rapports patrimoniaux clairs, personnalisés et conformes pour valoriser votre conseil." },
              { icon: CheckCircle, title: "Conformité & Veille Facilitées", description: "Accès à une base documentaire juridique à jour et outils de veille réglementaire (LCB-FT, etc.)." },
              { icon: Eye, title: "Efficacité Quotidienne Maximisée", description: "Interface intuitive, centralisation des données et automatisation des tâches pour un gain de temps significatif." }
            ].map((feature, index) => (
              <motion.div key={index} custom={index} variants={featureVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="bg-gradient-to-br from-[#0E2444]/70 to-[#15305D]/70 rounded-2xl border border-[#3E5F8A]/60 p-8 flex flex-col items-start shadow-xl hover:shadow-2xl hover:border-[#88C0D0]/50 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#88C0D0] to-[#81A1C1] flex items-center justify-center mb-6 shadow-lg border-2 border-[#0A192F]/50">
                  <feature.icon className="w-8 h-8 text-[#0A192F]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NOUVELLE SECTION: Tarifs */}
      <section id="tarifs-patrimonia" className="py-16 sm:py-24 px-4 bg-[#0A192F]"> {/* Couleur de fond légèrement différente pour la distinguer */}
        <div className="max-w-6xl mx-auto">
          <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-center mb-14 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 sm:mb-6 leading-tight">
              Des Offres <span className="text-[#88C0D0]">Adaptées à Vos Ambitions</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Choisissez la solution Patrimonia qui correspond à la taille et aux besoins de votre activité de conseil.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {pricingTiers.map((tier) => (
              <motion.div
                key={tier.name}
                custom={tier.delay}
                variants={featureVariants} // Réutiliser les featureVariants pour l'entrée en scène
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className={`flex flex-col rounded-2xl shadow-2xl p-8 h-full 
                  ${tier.highlight ? 'bg-gradient-to-br from-[#15305D] to-[#0E2444] border-2 border-[#88C0D0]' : 'bg-[#0E2444]/70 border border-[#3E5F8A]/60'}
                  transition-all duration-300 hover:shadow-[#88C0D0]/30 transform hover:scale-[1.02]`} 
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-5">
                    <tier.icon className={`w-10 h-10 ${tier.highlight ? 'text-[#88C0D0]' : 'text-gray-400'}`} />
                    <h3 className={`text-2xl font-bold ${tier.highlight ? 'text-white': 'text-gray-200'}`}>{tier.name}</h3>
                  </div>
                  <p className={`text-4xl font-extrabold ${tier.highlight ? 'text-[#A3BE8C]' : 'text-white'} mb-1`}>{tier.price}</p>
                  {tier.frequency && <p className="text-sm text-gray-400 mb-6 h-5">{tier.frequency}</p>}
                  {!tier.frequency && <div className="mb-6 h-5"></div>} {/* Placeholder pour alignement vertical */}
                  <p className="text-gray-300 mb-8 leading-relaxed text-sm min-h-[60px]">{tier.description}</p>
                  
                  <ul className="space-y-3 mb-10">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <motion.button
                  onClick={() => tier.name === 'Entreprise' ? document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' }) : navigate('/contact-pro?offre=' + tier.name.toLowerCase())}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full mt-auto px-6 py-3 font-semibold rounded-lg shadow-md transition-colors duration-300 
                    ${tier.highlight ? 'bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] hover:shadow-[#88C0D0]/40' : 'bg-[#2A3F6C] text-gray-200 hover:bg-[#3E5F8A]'}
                  `}
                >
                  {tier.cta}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section CTA Pro */}
      <section id="contact-section" className="py-16 sm:py-24 px-4"> {/* AJOUT DE L'ID ICI */}
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="bg-gradient-to-br from-[#88C0D0]/90 to-[#81A1C1]/90 rounded-2xl p-10 sm:p-16 shadow-2xl border border-[#8FBCBB]/50">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0A192F] mb-6 sm:mb-8 leading-tight shadow-text-dark-nord">
              Élevez votre conseil en patrimoine avec Patrimonia.
            </h2>
            <p className="text-lg sm:text-xl text-[#0D1F3A]/80 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Contactez-nous pour une présentation et découvrez comment Patrimonia peut transformer votre pratique quotidienne.
            </p>
            <motion.button
              onClick={() => navigate('/contact-pro')}
              whileHover={{ scale: 1.03, boxShadow: "0px 10px 25px rgba(10, 25, 47, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 sm:px-12 sm:py-5 bg-[#0A192F] text-white font-semibold rounded-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-base sm:text-lg mx-auto border-2 border-transparent hover:border-white/30"
            >
              Nous Contacter
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 opacity-80 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer Pro */}
      <footer className="py-8 text-center border-t border-[#2A3F6C]/30">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Patrimonia. Tous droits réservés.</p>
        <p className="text-xs text-gray-600 mt-1">Une solution Fiscal.ia</p>
      </footer>
    </div>
  );
} 