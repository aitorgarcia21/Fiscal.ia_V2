import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Euro, FileText, Users, Check, BrainCircuit, Clock, BarChart3, Shield, Mic, ChevronRight, Zap, Sparkles, Play, Download, TrendingUp, Timer } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ProDemoSection from '../components/demo/ProDemoSection';


const features = [
  {
    icon: BrainCircuit,
    title: "Analyse fiscale instantanée",
    description: "Francis analyse vos entretiens et identifie automatiquement les optimisations possibles.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10"
  },
  {
    icon: Clock,
    title: "Gain de temps",
    description: "Automatisez la prise de notes et la génération de rapports. Plus de saisie manuelle.",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10"
  },
  {
    icon: Users,
    title: "Suivi client simplifié",
    description: "Tous vos clients et leurs données fiscales centralisés dans un seul outil.",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10"
  },
  {
    icon: Shield,
    title: "Sécurité maximale",
    description: "Vos données sont chiffrées et hébergées en France. Conformité RGPD garantie.",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10"
  }
];

// Étapes du processus améliorées
const processSteps = [
  {
    step: "01",
    title: "Activez Francis",
    subtitle: "Un clic, c'est parti",
    description: "Francis écoute discrètement votre conversation sans vous interrompre. Plus besoin de prendre des notes manuellement !",
    icon: Mic,
    benefit: "Gain de temps immédiat"
  },
  {
    step: "02", 
    title: "Parlez naturellement",
    subtitle: "Comme d'habitude",
    description: "Francis transcrit et analyse en temps réel pendant votre échange. Il identifie automatiquement les opportunités fiscales.",
    icon: Users,
    benefit: "Analyse intelligente en temps réel"
  },
  {
    step: "03",
    title: "Recevez votre synthèse",
    subtitle: "En quelques secondes",
    description: "Profil fiscal complet, opportunités d'optimisation identifiées, todo list générée automatiquement. Tout est prêt pour votre client.",
    icon: Sparkles,
    benefit: "Rapport professionnel instantané"
  },
  {
    step: "04",
    title: "Exportez en 1 clic",
    subtitle: "Format de votre choix",
    description: "PDF pour le client, Excel pour vos calculs, CSV pour votre logiciel. Plus de saisie manuelle !",
    icon: Download,
    benefit: "Export multi-format automatique"
  }
];

const ProLandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isProfessional, isLoadingAuth } = useAuth();
  


  const handleAuth = (mode: 'login' | 'signup') => {
    if (mode === 'login') {
      navigate('/login');
    } else {
      navigate('/pro/signup');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-tr from-[#234876] to-[#162238] text-gray-100">
        {/* Header simple */}
        <header className="bg-[#162238]/90 backdrop-blur-lg border-b border-[#2A3F6C]/50 shadow-lg">
          <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="relative inline-flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
                <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
              </div>
              <span className="text-xl font-bold text-white">Francis</span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleAuth('login')}
                className="text-gray-300 hover:text-[#c5a572] transition-colors font-medium"
              >
                Connexion
              </button>
              <button
                onClick={() => handleAuth('signup')}
                className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl shadow-lg hover:shadow-[#c5a572]/30 hover:scale-105 transition-all duration-300"
              >
                Inscription
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section simplifiée */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:pt-40 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8">
            Francis, le <span className="text-[#c5a572]">copilote</span>
            <span className="block mt-2">des conseillers en gestion de patrimoine et fiscalistes</span>
          </h1>
          <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Francis écoute vos entretiens, prend des notes et génère vos rapports automatiquement. 
            Concentrez-vous sur vos clients, pas sur la paperasse.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button
              onClick={() => handleAuth('signup')}
              className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Commencer maintenant !
            </button>
            <button
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-[#c5a572] text-[#c5a572] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#c5a572]/10 transition-all duration-300"
            >
              Voir la démo
            </button>
          </div>
        </main>

        {/* Comment ça marche - Étapes concrètes */}
        <section className="pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Comment ça marche
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Francis s'intègre naturellement dans votre flux de travail et vous fait gagner <span className="text-[#c5a572] font-semibold">plusieurs heures par semaine</span>
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="relative">
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#c5a572]/20 to-transparent z-0"></div>
                  )}
                  <div className="bg-[#1E3253]/60 backdrop-blur-sm p-6 rounded-xl border border-[#2A3F6C]/30 hover:border-[#c5a572]/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#c5a572]/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-lg flex items-center justify-center text-[#162238] font-semibold text-sm">
                        {step.step}
                      </div>
                      <step.icon className="w-6 h-6 text-[#c5a572]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-[#c5a572] text-sm font-medium mb-2">{step.subtitle}</p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-3">{step.description}</p>
                    <div className="bg-[#c5a572]/10 border border-[#c5a572]/20 rounded-lg p-2">
                      <p className="text-[#c5a572] text-xs font-semibold uppercase tracking-wide">
                        {step.benefit}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 text-gray-300 bg-[#1E3253]/60 backdrop-blur-sm p-4 rounded-xl border border-[#2A3F6C]/30">
                <Timer className="w-5 h-5 text-[#c5a572]" />
                <span>Temps total : <span className="text-[#c5a572] font-semibold">moins de 5 minutes</span> après votre entretien</span>
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm">
                  <span className="text-[#c5a572] font-semibold">Avant Francis :</span> 2-3 heures de saisie et d'analyse manuelle
                </p>
                <p className="text-gray-400 text-sm">
                  <span className="text-[#c5a572] font-semibold">Avec Francis :</span> 5 minutes d'export automatique
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Démo Section */}
        <section id="demo" className="pb-20">
          <ProDemoSection />
        </section>

        {/* Features modernes */}
        <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Un outil simple et efficace
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Francis vous aide à gagner du temps et à mieux servir vos clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/30 hover:border-[#c5a572]/40 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#c5a572]/20"
              >
                {/* Fond coloré au hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Icône avec fond coloré */}
                <div className={`relative mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                {/* Contenu */}
                <div className="relative">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#c5a572] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
                
                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Tarifs simplifiés */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tarifs transparents
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Tarifs transparents et sans surprise
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan Essentiel */}
            <div className="bg-[#1E3253]/60 backdrop-blur-sm rounded-xl p-8 border border-[#2A3F6C]/50">
              <h3 className="text-2xl font-bold text-white mb-2">Essentiel</h3>
              <p className="text-gray-400 mb-6">Pour les indépendants</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">49€</span>
                <span className="text-gray-400">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3" />
                  50 questions Francis / mois
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3" />
                  Analyses fiscales illimitées
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3" />
                  Export PDF/Excel
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3" />
                  Support par email
                </li>
              </ul>
              <button 
                onClick={() => handleAuth('signup')}
                className="w-full border border-[#c5a572] text-[#c5a572] px-6 py-3 rounded-xl font-semibold hover:bg-[#c5a572]/10 transition-all duration-300"
              >
                Commencer
              </button>
            </div>

            {/* Plan Pro */}
            <div className="bg-[#1E3253]/60 backdrop-blur-sm rounded-xl p-8 border-2 border-[#c5a572]">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-gray-400 mb-6">Pour les cabinets</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c5a572]">99€</span>
                <span className="text-gray-400">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3" />
                  100 questions Francis / mois
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3" />
                  Tout du plan Essentiel
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3" />
                  Intégrations API
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3" />
                  Support prioritaire
                </li>
              </ul>
              <button 
                onClick={() => handleAuth('signup')}
                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Commencer
              </button>
            </div>
          </div>
        </section>

        {/* Intégration O2S Harvest */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex flex-col md:flex-row items-center gap-6 bg-[#1E3253]/60 backdrop-blur-sm rounded-xl border border-[#2A3F6C]/30 p-8 shadow-lg">
            <img
              src="/images/logo_harvest.svg"
              alt="Logo Harvest O2S"
              className="h-16 w-auto mb-4 md:mb-0 md:mr-8"
              style={{ background: '#1E3253', borderRadius: '0.75rem', padding: '0.5rem' }}
            />
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-2">Intégration O2S de Harvest</h3>
              <p className="text-gray-300 text-base">
                <span className="text-[#33ee87] font-semibold">Nouveau&nbsp;!</span> Intégration directe avec <span className="font-semibold">O2S</span> de <span className="font-semibold">Harvest</span>.<br />
                <span className="text-[#c5a572] font-semibold">Compatible uniquement avec l'offre Succès de Harvest.</span>
              </p>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8">
              Prêt à transformer votre cabinet ?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Rejoignez dès maintenant les conseillers qui automatisent leur paperasse grâce à Francis.
            </p>
            <button
              onClick={() => handleAuth('signup')}
              className="px-10 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-xl text-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Commencer maintenant !
            </button>
          </div>
        </section>

        {/* Footer simple */}
        <footer className="bg-[#162238] border-t border-[#2A3F6C]/50">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Francis. Tous droits réservés.</p>
            <div className="flex justify-center space-x-6 mt-4">
              <a href="/mentions-legales" className="hover:text-[#c5a572] transition-colors">Mentions Légales</a>
              <a href="/politique-confidentialite" className="hover:text-[#c5a572] transition-colors">Politique de Confidentialité</a>
              <a href="/blog" className="hover:text-[#c5a572] transition-colors">Blog</a>
              <a href="/complete-signup" className="hover:text-[#c5a572] transition-colors font-medium">Déjà inscrit ?</a>
            </div>
          </div>
        </footer>


      </div>
    </>
  );
};

export default ProLandingPage;