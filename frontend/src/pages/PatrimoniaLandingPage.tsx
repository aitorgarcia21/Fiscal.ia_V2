import React, { useState, useRef } from 'react';
import { ArrowRight, Briefcase, CheckCircle, DollarSign, Eye, FileText, MessageSquare, Zap, PlayCircle, Music2, User, TrendingUp, Sliders, ListChecks, ShieldCheck, Sparkles as SparklesIcon, Euro } from 'lucide-react';
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
type DemoStep = 'initial' | 'caseInput' | 'analysis' | 'results' | 'toolTour';

// Données simulées pour le cas client et les résultats
const simulatedClientData = {
  revenuAnnuel: "120,000€",
  patrimoineImmobilier: "850,000€",
  epargneFinanciere: "250,000€",
  objectifPrincipal: "Optimisation fiscale et préparation transmission"
};

const simulatedResults = {
  potentielEconomie: "8,500€ / an",
  optimisations: [
    { title: "Réallocation d\'actifs financiers", details: "Vers des supports à fiscalité optimisée (PEA, Assurance Vie ancienne).", icon: TrendingUp },
    { title: "Optimisation IFI", details: "Utilisation des leviers de décote et donations temporaires d\'usufruit.", icon: ShieldCheck },
    { title: "Stratégie de transmission", details: "Mise en place de donations-partages et optimisation des abattements.", icon: Sliders }
  ]
};

const toolFeatures = [
  { icon: Briefcase, title: "Suivi Client Intégré", description: "Dossiers clients 360°, agrégation patrimoniale et vision consolidée pour un suivi optimal." }, 
  { icon: FileText, title: "Stratégies d'Investissement", description: "Analyse de portefeuille, allocation d'actifs, simulations de rendement et aide à la décision." }, 
  { icon: Zap, title: "Optimisation Fiscale & Transmission", description: "Simulation IRPP/IFI, stratégies de transmission, et optimisation des dispositifs." }
];

export function PatrimoniaLandingPage() { // RENOMMÉ ICI
  const navigate = useNavigate();
  const { user, isAuthenticated, isProfessional, isLoadingAuth } = useAuth(); // Utiliser le hook Auth
  const [showAuthModal, setShowAuthModal] = useState<false | 'login' | 'signup'>(false);
  const [demoStep, setDemoStep] = useState<DemoStep>('initial');
  // const audioRef = useRef<HTMLAudioElement>(null); // Commenté temporairement

  // const playMusic = () => { // Commenté temporairement
  //   audioRef.current?.play();
  // };

  const handleEspaceProClick = () => {
    if (isAuthenticated && isProfessional) {
      navigate('/pro/dashboard');
    } else {
      setShowAuthModal('login');
    }
  };

  const renderDemoContent = () => {
    switch (demoStep) {
      case 'caseInput':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full bg-[#0E2444]/50 p-8 rounded-lg shadow-xl border border-[#3E5F8A]/60">
            <h3 className="text-2xl font-semibold text-[#88C0D0] mb-6 text-center">Étape 1: Entrée du Cas Client (Exemple)</h3>
            <div className="space-y-4 text-left">
              {Object.entries(simulatedClientData).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-[#0A192F]/70 rounded-md">
                  <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
            <motion.button 
              onClick={() => setDemoStep('analysis')} 
              className="mt-8 w-full px-8 py-3 bg-gradient-to-r from-[#B48EAD] to-[#A3BE8C] text-[#0A192F] font-semibold rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
              whileHover={{ boxShadow: "0px 0px 15px rgba(179, 142, 173, 0.7)" }}
            >
              Lancer l'Analyse Patrimonia
            </motion.button>
          </motion.div>
        );
      case 'analysis':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full text-center p-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-6 border-4 border-dashed border-[#88C0D0] rounded-full"
            />
            <h3 className="text-2xl font-semibold text-white mb-3">Analyse en cours...</h3>
            <p className="text-gray-400">Patrimonia explore les meilleures stratégies pour ce profil.</p>
            {/* Simuler la fin de l'analyse après un délai */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} onAnimationComplete={() => setDemoStep('results')}>
               {/* Cet élément vide déclenche la transition vers les résultats */}
            </motion.div>
          </motion.div>
        );
      case 'results':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full bg-[#0E2444]/50 p-8 rounded-lg shadow-xl border border-[#3E5F8A]/60">
            <h3 className="text-3xl font-semibold text-[#A3BE8C] mb-6 text-center">Résultats d'Optimisation <CheckCircle className="inline w-8 h-8 ml-2"/></h3>
            <div className="bg-[#0A192F]/70 p-6 rounded-md mb-6 text-center">
              <p className="text-lg text-gray-300">Potentiel d'économie fiscale et successorale estimé :</p>
              <p className="text-4xl font-bold text-[#A3BE8C] my-2">{simulatedResults.potentielEconomie}</p>
            </div>
            <div className="space-y-4">
              {simulatedResults.optimisations.map((opt, index) => (
                <motion.div key={index} custom={index} variants={featureVariants} initial="hidden" animate="visible" className="p-4 bg-[#0A192F]/70 rounded-md flex items-start gap-4">
                  <opt.icon className="w-8 h-8 text-[#88C0D0] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-white">{opt.title}</h4>
                    <p className="text-sm text-gray-400">{opt.details}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.button 
              onClick={() => setDemoStep('toolTour')} 
              className="mt-8 w-full px-8 py-3 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] font-semibold rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
              whileHover={{ boxShadow: "0px 0px 15px rgba(136, 192, 208, 0.7)" }}
            >
              Découvrir les outils Patrimonia
            </motion.button>
          </motion.div>
        );
      case 'toolTour':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
            <h3 className="text-3xl font-semibold text-white mb-8 text-center">Tour des Fonctionnalités Clés de Patrimonia</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {toolFeatures.map((feature, index) => (
                <motion.div key={index} custom={index} variants={featureVariants} initial="hidden" animate="visible" className="bg-[#0E2444]/70 p-6 rounded-lg shadow-lg border border-[#3E5F8A]/60 flex flex-col items-center text-center">
                  <feature.icon className="w-12 h-12 text-[#88C0D0] mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-400 flex-grow">{feature.description}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <motion.button 
                onClick={() => setDemoStep('initial')} 
                className="px-6 py-2 text-sm text-[#BF616A] hover:text-[#D08770] border border-[#BF616A] rounded-lg hover:border-[#D08770] transition-colors"
              >
                Fermer la Démo
              </motion.button>
            </div>
          </motion.div>
        );
      default: // 'initial' ou inconnu
        return (
          <motion.div className="text-center">
            <motion.button
              onClick={() => setDemoStep('caseInput')}
              className="px-12 py-5 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] text-[#0A192F] font-bold rounded-xl shadow-xl hover:scale-105 transition-transform duration-300 text-xl flex items-center gap-3 mx-auto"
              whileHover={{ boxShadow: "0px 0px 20px rgba(136, 192, 208, 0.5)" }}
            >
              <PlayCircle className="w-8 h-8" /> Lancer la Démo Interactive Patrimonia
            </motion.button>
          </motion.div>
        );
    }
  };

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
              Suivez notre démonstration interactive pour visualiser la puissance de Patrimonia.
            </p>
          </motion.div>

          <div className="bg-[#0A192F]/70 p-6 sm:p-10 rounded-xl shadow-2xl border border-[#2A3F6C]/50 min-h-[400px] flex flex-col justify-center items-center">
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

      {/* Section CTA Pro */}
      <section className="py-16 sm:py-24 px-4">
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