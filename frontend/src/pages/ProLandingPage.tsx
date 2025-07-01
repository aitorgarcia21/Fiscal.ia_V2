import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Euro, Briefcase, FileText, Zap, ShieldCheck, Users, TrendingUp, Check, BrainCircuit, PiggyBank, Target, Clock, BarChart3, ClipboardList, Heart, User, ArrowRight, Sparkles, ChevronRight, Star, Award, Activity, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProDemoSection } from '../components/demo/ProDemoSection';
import { AuthModal } from '../components/auth/AuthModal';

// Témoignages clients
const testimonials = [
  {
    name: "Marie Dupont",
    role: "Expert-comptable, Cabinet Dupont & Associés",
    content: "Francis a transformé notre approche client. Nous avons gagné 15h par semaine et nos clients adorent la proactivité de nos conseils.",
    rating: 5,
    image: "MD"
  },
  {
    name: "Pierre Martin",
    role: "Conseiller en gestion de patrimoine",
    content: "Grâce à Francis, j'ai identifié en moyenne 30% d'économies supplémentaires par client. Mon CA a augmenté de 40% en 6 mois.",
    rating: 5,
    image: "PM"
  },
  {
    name: "Sophie Lambert",
    role: "Fiscaliste indépendante",
    content: "L'IA de Francis est bluffante. Elle me permet de me concentrer sur le conseil stratégique pendant qu'elle gère toute la technique.",
    rating: 5,
    image: "SL"
  }
];

// Stats impressionnantes
const stats = [
  { value: "+15h", label: "gagnées par semaine" },
  { value: "30%", label: "d'économies fiscales en plus" },
  { value: "x3", label: "clients satisfaits" },
  { value: "10min", label: "pour un rapport complet" }
];

// Features principales avec icônes
const features = [
  {
    icon: BrainCircuit,
    title: "Intelligence Fiscale Avancée",
    description: "Francis analyse instantanément des milliers de points de données pour révéler toutes les opportunités d'optimisation.",
    benefits: ["Analyse 360° instantanée", "Veille législative intégrée", "Recommandations personnalisées"]
  },
  {
    icon: Clock,
    title: "Automatisation Intelligente",
    description: "Divisez par 10 le temps passé sur les tâches répétitives et concentrez-vous sur ce qui compte vraiment.",
    benefits: ["Prise de notes automatique", "Génération de rapports", "Export CSV/Excel/PDF"]
  },
  {
    icon: Target,
    title: "Conseil Proactif & Personnalisé",
    description: "Anticipez les besoins de vos clients et proposez des stratégies sur-mesure avant même qu'ils ne demandent.",
    benefits: ["Alertes opportunités", "Stratégies personnalisées", "Suivi temps réel"]
  },
  {
    icon: Shield,
    title: "Conformité & Sécurité",
    description: "Francis respecte toutes les réglementations fiscales et sécurise vos données selon les plus hauts standards.",
    benefits: ["RGPD compliant", "Données chiffrées", "Mises à jour légales"]
  }
];

// Process steps
const processSteps = [
  {
    step: "1",
    title: "Écoutez votre client",
    description: "Francis transcrit et analyse automatiquement vos conversations",
    icon: Users
  },
  {
    step: "2",
    title: "Laissez Francis analyser",
    description: "L'IA identifie instantanément toutes les opportunités fiscales",
    icon: BrainCircuit
  },
  {
    step: "3",
    title: "Recevez vos recommandations",
    description: "Obtenez un rapport détaillé avec toutes les stratégies optimales",
    icon: FileText
  },
  {
    step: "4",
    title: "Impressionnez vos clients",
    description: "Présentez des solutions personnalisées à forte valeur ajoutée",
    icon: Award
  }
];

const ProLandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isProfessional, isLoadingAuth } = useAuth();
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100">
        {/* Header avec effet glassmorphism amélioré */}
        <header className="bg-[#162238]/90 backdrop-blur-xl border-b border-[#2A3F6C]/50 shadow-2xl fixed w-full z-50">
          <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Logo amélioré */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="relative inline-flex items-center justify-center">
                <MessageSquare className="h-12 w-12 text-[#c5a572] transition-all group-hover:scale-110 group-hover:rotate-3 duration-300" />
                <Euro className="h-8 w-8 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-1 transition-all group-hover:scale-110 group-hover:rotate-12 duration-300 border-2 border-[#c5a572]/30" />
                <div className="absolute -inset-2 bg-[#c5a572]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">Francis</span>
                <span className="text-sm font-medium text-[#c5a572] bg-[#c5a572]/10 px-2 py-1 rounded-full">Pro</span>
              </div>
            </div>

            {/* Navigation améliorée */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-[#c5a572] transition-colors font-medium">Fonctionnalités</a>
              <a href="#demo" className="text-gray-300 hover:text-[#c5a572] transition-colors font-medium">Démo</a>
              <a href="#pricing" className="text-gray-300 hover:text-[#c5a572] transition-colors font-medium">Tarifs</a>
              <a href="#testimonials" className="text-gray-300 hover:text-[#c5a572] transition-colors font-medium">Témoignages</a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => openAuthModal('login')}
                className="text-gray-300 hover:text-[#c5a572] transition-colors font-medium hidden sm:block"
              >
                Connexion
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="group relative px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl shadow-lg hover:shadow-[#c5a572]/40 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Essai Gratuit</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#e8cfa0] to-[#c5a572] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section améliorée avec animation */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          {/* Badge Beta animé */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a572]/20 to-[#e8cfa0]/20 backdrop-blur-sm px-6 py-2 rounded-full border border-[#c5a572]/30">
              <Activity className="w-4 h-4 text-[#c5a572] animate-pulse" />
              <span className="text-sm font-semibold text-[#c5a572]">ACCÈS ANTICIPÉ BETA - Places limitées</span>
              <Activity className="w-4 h-4 text-[#c5a572] animate-pulse" />
            </div>
          </div>

          {/* Titre principal avec effet gradient animé */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="block text-white mb-2">L'IA qui révolutionne</span>
              <span className="block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] animate-gradient">
                  le conseil fiscal
                </span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Francis écoute, analyse et structure vos entretiens clients. 
              <span className="text-[#c5a572] font-semibold"> Gagnez 15h par semaine</span> et 
              <span className="text-[#c5a572] font-semibold"> augmentez vos honoraires de 40%</span>.
            </p>

            {/* CTA principaux avec animations */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <button
                onClick={() => openAuthModal('signup')}
                className="group bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-10 py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-[#c5a572]/30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                Démarrer l'essai gratuit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="group border-2 border-[#c5a572] text-[#c5a572] px-10 py-5 rounded-2xl text-lg font-bold hover:bg-[#c5a572]/10 backdrop-blur-sm transition-all duration-300"
              >
                Voir Francis en action
                <ChevronRight className="inline w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-[#1E3253]/40 backdrop-blur-sm rounded-xl p-4 border border-[#2A3F6C]/30">
                  <div className="text-3xl font-bold text-[#c5a572] mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Section Problème/Solution */}
        <section className="py-20 bg-gradient-to-b from-transparent to-[#162238]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Vous perdez <span className="text-[#c5a572]">60%</span> de votre temps sur des tâches sans valeur ajoutée
                </h2>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Prise de notes manuelle pendant les entretiens</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Recherche fastidieuse dans la documentation fiscale</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Création manuelle de rapports et tableaux</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Calculs répétitifs et vérifications chronophages</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-[#c5a572]/20 to-[#e8cfa0]/10 backdrop-blur-sm rounded-2xl p-8 border border-[#c5a572]/30">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-[#c5a572]" />
                  La solution Francis
                </h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#c5a572] mt-0.5 flex-shrink-0" />
                    <span>Transcription et analyse automatique de vos entretiens</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#c5a572] mt-0.5 flex-shrink-0" />
                    <span>Base de connaissances fiscales toujours à jour</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#c5a572] mt-0.5 flex-shrink-0" />
                    <span>Génération instantanée de rapports personnalisés</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#c5a572] mt-0.5 flex-shrink-0" />
                    <span>Calculs et optimisations en temps réel</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Démo Interactive Section */}
        <section id="demo" className="py-20">
          <ProDemoSection />
        </section>

        {/* Comment ça marche */}
        <section className="py-20 bg-gradient-to-b from-[#162238]/50 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Comment Francis transforme votre quotidien
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Un processus simple et efficace pour multiplier votre valeur ajoutée
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="relative">
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/4 left-full w-full h-0.5 bg-gradient-to-r from-[#c5a572] to-transparent z-0"></div>
                  )}
                  <div className="relative z-10 bg-[#1E3253]/60 backdrop-blur-sm p-6 rounded-xl border border-[#2A3F6C]/50 hover:border-[#c5a572]/50 transition-all duration-300 hover:transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center text-[#162238] font-bold text-xl">
                        {step.step}
                      </div>
                      <step.icon className="w-8 h-8 text-[#c5a572]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features détaillées */}
        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Tout ce dont vous avez besoin pour exceller
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Francis concentre les meilleures technologies pour vous offrir un avantage concurrentiel décisif
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {features.map((feature, index) => (
                <div key={index} className="bg-[#1E3253]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#2A3F6C]/50 hover:border-[#c5a572]/50 transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#c5a572]/20 to-[#e8cfa0]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-8 h-8 text-[#c5a572]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                      <p className="text-gray-300 mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                            <Check className="w-4 h-4 text-[#c5a572]" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section id="testimonials" className="py-20 bg-gradient-to-b from-transparent to-[#162238]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ils ont transformé leur cabinet avec Francis
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Découvrez comment des professionnels comme vous ont multiplié leur impact
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-[#1E3253]/60 backdrop-blur-sm rounded-xl p-8 border border-[#2A3F6C]/50 hover:border-[#c5a572]/50 transition-all duration-300">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#c5a572] fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center text-[#162238] font-bold">
                      {testimonial.image}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Tarifs améliorée */}
        <section id="pricing" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Un investissement qui se rentabilise dès le premier client
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Essayez gratuitement pendant 14 jours. Sans engagement, sans carte bancaire.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter */}
              <div className="bg-[#1E3253]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#2A3F6C]/50 hover:border-[#c5a572]/50 transition-all duration-300">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                  <p className="text-gray-400 mb-6">Pour tester Francis</p>
                  <div className="mb-8">
                    <span className="text-5xl font-bold text-white">29€</span>
                    <span className="text-gray-400">/mois</span>
                  </div>
                  <ul className="space-y-4 mb-8 text-left">
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      Jusqu'à 10 clients
                    </li>
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      Analyses fiscales de base
                    </li>
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      Export PDF
                    </li>
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      Support email
                    </li>
                  </ul>
                  <button 
                    onClick={() => openAuthModal('signup')}
                    className="w-full border-2 border-[#c5a572] text-[#c5a572] px-6 py-3 rounded-xl font-semibold hover:bg-[#c5a572]/10 transition-all duration-300"
                  >
                    Essai gratuit
                  </button>
                </div>
              </div>

              {/* Professional - Plus populaire */}
              <div className="bg-gradient-to-b from-[#c5a572]/10 to-[#1E3253]/60 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#c5a572] transform scale-105 shadow-2xl shadow-[#c5a572]/20 relative">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  PLUS POPULAIRE
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                  <p className="text-gray-400 mb-6">Pour les cabinets ambitieux</p>
                  <div className="mb-8">
                    <span className="text-5xl font-bold text-[#c5a572]">99€</span>
                    <span className="text-gray-400">/mois</span>
                  </div>
                  <ul className="space-y-4 mb-8 text-left">
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      Jusqu'à 50 clients
                    </li>
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      Analyses avancées illimitées
                    </li>
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      Export Excel/CSV/PDF
                    </li>
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      API & intégrations
                    </li>
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      Support prioritaire
                    </li>
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      Formation personnalisée
                    </li>
                  </ul>
                  <button 
                    onClick={() => openAuthModal('signup')}
                    className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Essai gratuit 14 jours
                  </button>
                </div>
              </div>

              {/* Enterprise */}
              <div className="bg-[#1E3253]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#2A3F6C]/50 hover:border-[#c5a572]/50 transition-all duration-300">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                  <p className="text-gray-400 mb-6">Pour les grands cabinets</p>
                  <div className="mb-8">
                    <span className="text-5xl font-bold text-white">Sur devis</span>
                  </div>
                  <ul className="space-y-4 mb-8 text-left">
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      Clients illimités
                    </li>
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      Tout de Professional
                    </li>
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      Déploiement sur site
                    </li>
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      SLA garanti
                    </li>
                    <li className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#c5a572] flex-shrink-0" />
                      Account manager dédié
                    </li>
                  </ul>
                  <button 
                    onClick={() => navigate('/contact-pro')}
                    className="w-full border-2 border-[#c5a572] text-[#c5a572] px-6 py-3 rounded-xl font-semibold hover:bg-[#c5a572]/10 transition-all duration-300"
                  >
                    Nous contacter
                  </button>
                </div>
              </div>
            </div>

            {/* Garantie */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/10 backdrop-blur-sm px-8 py-4 rounded-2xl border border-[#c5a572]/30">
                <Shield className="w-6 h-6 text-[#c5a572]" />
                <p className="text-gray-300">
                  <span className="font-semibold text-[#c5a572]">Garantie satisfait ou remboursé 30 jours</span> - Testez Francis sans risque
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final amélioré */}
        <section className="py-20 bg-gradient-to-t from-[#162238] to-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Rejoignez les conseillers qui ont déjà 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] mt-2">
                transformé leur pratique
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Ne laissez pas vos concurrents prendre de l'avance. Francis est votre avantage compétitif pour les 10 prochaines années.
            </p>
            
            <div className="bg-gradient-to-r from-[#c5a572]/20 to-[#e8cfa0]/20 backdrop-blur-sm rounded-2xl p-8 border border-[#c5a572]/30 max-w-2xl mx-auto mb-8">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#c5a572] mb-2">14 jours</div>
                  <div className="text-sm text-gray-400">d'essai gratuit</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#c5a572] mb-2">0€</div>
                  <div className="text-sm text-gray-400">sans carte bancaire</div>
                </div>
              </div>
              
              <button
                onClick={() => openAuthModal('signup')}
                className="group w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-5 rounded-xl text-lg font-bold hover:shadow-2xl hover:shadow-[#c5a572]/30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
              >
                <Sparkles className="w-6 h-6" />
                Démarrer maintenant
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            <p className="text-sm text-gray-400">
              Pas encore prêt ? 
              <button 
                onClick={() => navigate('/contact-pro')}
                className="text-[#c5a572] hover:text-[#e8cfa0] font-medium ml-2"
              >
                Planifiez une démo personnalisée →
              </button>
            </p>
          </div>
        </section>

        {/* Footer amélioré */}
        <footer className="bg-[#162238] border-t border-[#2A3F6C]/50">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Logo et description */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative inline-flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 text-[#c5a572]" />
                    <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5 border border-[#c5a572]/30" />
                  </div>
                  <span className="text-xl font-bold text-white">Francis Pro</span>
                </div>
                <p className="text-gray-400 text-sm max-w-sm">
                  L'intelligence artificielle qui révolutionne le conseil fiscal. 
                  Gagnez du temps, augmentez vos revenus, impressionnez vos clients.
                </p>
              </div>

              {/* Liens rapides */}
              <div>
                <h4 className="text-white font-semibold mb-4">Produit</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#features" className="text-gray-400 hover:text-[#c5a572] transition-colors">Fonctionnalités</a></li>
                  <li><a href="#pricing" className="text-gray-400 hover:text-[#c5a572] transition-colors">Tarifs</a></li>
                  <li><a href="#demo" className="text-gray-400 hover:text-[#c5a572] transition-colors">Démo</a></li>
                  <li><a href="/blog" className="text-gray-400 hover:text-[#c5a572] transition-colors">Blog</a></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/contact-pro" className="text-gray-400 hover:text-[#c5a572] transition-colors">Contact</a></li>
                  <li><a href="/mentions-legales" className="text-gray-400 hover:text-[#c5a572] transition-colors">Mentions légales</a></li>
                  <li><a href="/politique-confidentialite" className="text-gray-400 hover:text-[#c5a572] transition-colors">Confidentialité</a></li>
                  <li><a href="/mes-donnees" className="text-gray-400 hover:text-[#c5a572] transition-colors">Mes données</a></li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-[#2A3F6C]/50 text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} Francis. Tous droits réservés. Fait avec ❤️ pour les conseillers fiscaux.</p>
            </div>
          </div>
        </footer>

        {/* Auth modal */}
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            initialTab={authMode} 
            defaultAccountType="professionnel" 
          />
        )}
      </div>

      {/* Style pour l'animation du gradient */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
};

export default ProLandingPage;