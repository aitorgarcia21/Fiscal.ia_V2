import React, { useState } from 'react';
import { ArrowRight, CreditCard, Euro, MessageSquare, Shield, Users, Sparkles, Check, Briefcase, FileText, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants, Transition } from 'framer-motion';
import { AuthModal } from '../components/auth/AuthModal';
import { DemoModal } from '../components/demo/DemoModal';
import { useStripe } from '../hooks/useStripe';
import { PRICING, PricingPlan } from '../config/pricing';
import { StripeError } from '../components/stripe/StripeError';
import { DemoConversation } from '../components/demo/DemoConversation';

// Définir un type plus précis pour les transitions si nécessaire, ou utiliser Transition directement
const cardTransition: Transition = { duration: 0.6 };
const stepTransition = (i: number): Transition => ({ delay: i * 0.15, duration: 0.5 });
const heroTransition: Transition = { duration: 0.8, delay: 0.2 }; // example
const heroTextTransition: Transition = { duration: 0.8, delay: 0.4 };
const heroButtonTransition: Transition = { duration: 0.8, delay: 0.5 };
const heroBadgeTransition: Transition = { duration: 0.8, delay: 0.8 };
const heroH1Transition: Transition = {delay: 0.2, duration: 0.7};
const heroH1SpanTransition: Transition = { duration: 0.7, delay: 0.8};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: cardTransition
  }
};

const stepItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: stepTransition(i)
  })
};

export function LandingPage() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState<false | 'login' | 'signup'>(false);
  const [showDemo, setShowDemo] = useState(false);
  const { handleCheckout, isLoading, error } = useStripe();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100 font-sans antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#162238]/95 backdrop-blur-lg border-b border-[#2A3F6C]/50 z-50 shadow-lg">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="relative inline-flex items-center justify-center group">
            <MessageSquare className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
            <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
          </div>
          <div className="flex items-center gap-x-3 sm:gap-x-5">
            <button
              onClick={() => navigate('/patrimonia')}
              className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Espace</span> Pro
            </button>
            <button
              onClick={() => setShowAuthModal('login')}
              className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl shadow-lg hover:shadow-[#c5a572]/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#c5a572] focus:ring-offset-2 focus:ring-offset-[#162238] transition-all duration-300 text-sm sm:text-base"
            >
              Se connecter
            </button>
          </div>
        </div>
      </header>

      {/* Modale d'authentification */}
      {showAuthModal && ( <AuthModal mode={showAuthModal} onClose={() => setShowAuthModal(false)} /> )}

      {/* Modale de démo */}
      {showDemo && ( <DemoModal onClose={() => setShowDemo(false)} onStart={() => { setShowDemo(false); navigate('/signup'); }} /> )}

      {/* Hero Section - Restauré */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-32 pb-16 sm:pt-40 sm:pb-20 relative overflow-hidden">
        {/* Background pattern amélioré */}
        <div className="absolute inset-0 opacity-5" style={{ 
          backgroundImage: 'radial-gradient(circle at 25% 25%, #c5a572 1px, transparent 1px), radial-gradient(circle at 75% 75%, #e8cfa0 1px, transparent 1px)', 
          backgroundSize: '60px 60px' 
        }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#162238]/30 via-transparent to-[#234876]/20"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={heroTransition} className="mb-12">
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-200 to-white mb-8 leading-tight"
              initial={{ opacity: 0, y:20 }}
              animate={{ opacity:1, y:0 }}
              transition={heroH1Transition}
            >
              Optimisez votre fiscalité avec <span className="relative inline-block text-[#c5a572]">Francis
                <motion.span 
                  className="absolute -bottom-2.5 left-0 w-full h-1.5 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full"
                  initial={{ scaleX: 0 }} 
                  animate={{ scaleX: 1 }} 
                  transition={heroH1SpanTransition}
                />
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={heroTextTransition}
              className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light"
            >
              L'intelligence artificielle qui vous fait économiser des milliers d'euros sur vos impôts, en toute légalité.
            </motion.p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={heroButtonTransition} className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <motion.button
              onClick={() => navigate('/signup')}
              whileHover={{ scale: 1.03, boxShadow: "0px 12px 30px rgba(197, 165, 114, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg border-2 border-transparent hover:border-[#e8cfa0]/50"
            >
              <CreditCard className="w-6 h-6" />
              Commencer maintenant !
              <ArrowRight className="w-6 h-6 ml-1 opacity-80 group-hover:opacity-100 transition-opacity" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: "rgba(255, 255, 255, 0.15)", boxShadow: "0px 8px 20px rgba(255, 255, 255, 0.1)" }}
              onClick={() => navigate('/demo')}
              className="px-10 py-4 bg-white/5 text-gray-100 font-semibold rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg border-2 border-white/20 hover:border-white/40 backdrop-blur-sm group"
            >
              Voir la démo
              <ArrowRight className="w-6 h-6 ml-1 opacity-80 group-hover:opacity-100 transition-opacity group-hover:translate-x-1 duration-200" />
            </motion.button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={heroBadgeTransition} className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 sm:gap-x-12 opacity-70">
            {[ { icon: Shield, text: "100% Sécurisé" }, { icon: Users, text: "+500 Utilisateurs" }, { icon: Sparkles, text: "IA de pointe" } ].map((badge, index) => (
              <motion.div key={index} whileHover={{ scale: 1.05 }} className="flex items-center space-x-3 text-gray-300">
                <badge.icon className="h-5 w-5 text-[#c5a572]" />
                <span className="text-base font-medium">{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>
           {/* Afficher l'erreur Stripe si elle existe (pour le test) */}
           {error && <p className="text-red-400 mt-4">Erreur Stripe: {error}</p>} 
        </div>
      </section>

      {/* Section Comment ça marche - Restauré */}
      <section className="py-16 sm:py-24 px-4 bg-[#1E3253]/30">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-center mb-14 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 sm:mb-6 leading-tight shadow-text">Comment ça marche&nbsp;?</h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">Trois étapes simples pour optimiser votre fiscalité avec l'aide de Francis, votre expert IA.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 items-stretch">
            {[ { icon: Users, title: "Créez votre compte et profil", description: "Inscrivez-vous rapidement et renseignez vos informations pour un accompagnement sur mesure." }, { icon: MessageSquare, title: "Discutez avec Francis", description: "Posez vos questions, obtenez des recommandations personnalisées et des plans d'action clairs." }, { icon: Check, title: "Mettez en place les conseils", description: "Passez à l'action facilement et suivez vos optimisations fiscales en temps réel." } ].map((step, index) => (
              <motion.div key={index} custom={index} variants={stepItemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="bg-gradient-to-br from-[#1A2942]/70 to-[#223C63]/70 rounded-2xl border border-[#2A3F6C]/60 p-8 flex flex-col items-center shadow-xl hover:shadow-2xl hover:border-[#c5a572]/50 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] flex items-center justify-center mb-6 sm:mb-8 shadow-lg border-4 border-[#162238]/50">
                  <step.icon className="w-10 h-10 sm:w-12 sm:h-12 text-[#162238]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 text-center">{step.title}</h3>
                <p className="text-gray-300 text-base sm:text-lg text-center leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Pourquoi choisir Francis - Restauré */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-center mb-14 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 sm:mb-6 leading-tight shadow-text">
              Pourquoi choisir <span className="text-[#c5a572]">Francis</span>&nbsp;?
            </h2>
          </motion.div>
          <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="bg-gradient-to-br from-[#1A2942]/60 to-[#223C63]/60 shadow-xl rounded-2xl px-8 py-10 sm:px-12 sm:py-14 mx-auto max-w-4xl border border-[#2A3F6C]/60">
            <p className="text-lg sm:text-xl text-gray-200 leading-relaxed text-center">
              Chaque année, des millions de Français remplissent leur déclaration sans savoir qu'ils pourraient <strong className="font-semibold text-[#c5a572]">payer moins</strong>, en toute légalité.<br /><br />
              Pas par négligence, mais parce que <strong className="font-semibold text-white">personne ne leur explique</strong>. Ni l'administration. Ni les banques. Ni les simulateurs incomplets.<br /><br />
              <strong className="font-semibold text-[#c5a572]">Francis change la donne.</strong><br />
              Nous avons créé une intelligence artificielle indépendante, conçue pour <strong className="font-semibold text-white">vous défendre, vous guider, et vous faire économiser.</strong>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section Offre - Restauré */} 
      <section className="py-16 sm:py-24 px-4 bg-[#1E3253]/30">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-center mb-14 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 sm:mb-6 leading-tight shadow-text">Une offre unique, des résultats <span className="text-[#c5a572]">concrets</span></h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">Accédez à toutes les fonctionnalités pour optimiser votre fiscalité et prendre le contrôle de vos finances.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 items-stretch mb-12 sm:mb-16">
            {[ { title: "Offre Mensuelle", price: "9,99€", period: "par mois", features: ["Accès illimité 24/7", "Analyse personnalisée", "Recommandations adaptées", "Suivi en temps réel", "Mises à jour quotidiennes", "Sans engagement"], popular: false, originalPrice: null, id: 'MONTHLY' as PricingPlan }, { title: "Offre Annuelle", price: "99,99€", period: "par an", features: ["Tous les avantages mensuels", "Économisez 17%", "Support prioritaire", "Accès anticipé aux nouveautés"], popular: true, originalPrice: "119,88€", id: 'ANNUAL' as PricingPlan } ].map((offer, index) => (
              <motion.div key={index} custom={index} variants={stepItemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className={`bg-gradient-to-br from-[#1A2942]/80 to-[#223C63]/80 rounded-2xl border ${offer.popular ? 'border-[#c5a572]/80 shadow-2xl' : 'border-[#2A3F6C]/60 shadow-xl'} p-8 flex flex-col relative overflow-hidden hover:border-[#c5a572]/70 transition-all duration-300 transform hover:scale-[1.02]`}>
                {offer.popular && <div className="absolute top-0 right-0 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-5 py-1.5 text-sm font-semibold tracking-wider uppercase transform rotate-45 translate-x-1/3 translate-y-1/3 origin-top-right shadow-md">Populaire</div>}
                <h3 className={`text-2xl sm:text-3xl font-bold mb-2 text-center ${offer.popular ? 'text-[#c5a572]' : 'text-white'}`}>{offer.title}</h3>
                <div className="text-center mb-6">
                  <span className={`text-4xl sm:text-5xl font-extrabold ${offer.popular ? 'text-[#c5a572]' : 'text-white'}`}>{offer.price}</span>
                  <span className="text-base text-gray-400 ml-1">{offer.period}</span>
                  {offer.originalPrice && <p className="text-sm text-gray-500 line-through mt-1">{offer.originalPrice}</p>}
                </div>
                <ul className="space-y-3 mb-8 text-gray-300 flex-grow">
                  {offer.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className={`w-5 h-5 text-[#c5a572] mr-3 mt-1 flex-shrink-0 ${offer.popular ? 'text-[#c5a572]' : 'text-gray-400'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  onClick={() => {
                    if (PRICING[offer.id]) {
                        handleCheckout(offer.id);
                    } else {
                        console.error("Plan de tarification non reconnu:", offer.id);
                        navigate('/signup'); // Fallback
                    }
                  }}
                  disabled={isLoading}
                  whileHover={{ scale: 1.03, boxShadow: `0px 8px 20px ${offer.popular ? 'rgba(197, 165, 114, 0.3)' : 'rgba(197, 165, 114, 0.2)'}` }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full mt-auto px-8 py-3.5 font-semibold rounded-lg shadow-md transition-all duration-300 text-base sm:text-lg border-2 ${offer.popular ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] border-transparent hover:border-[#e8cfa0]/50' : 'bg-white/10 text-gray-100 border-transparent hover:bg-white/20 hover:border-white/30'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Chargement...' : 'Choisir cette offre'}
                </motion.button>
              </motion.div>
            ))}
          </div>
          <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-center text-gray-400 text-sm">
             Paiement sécurisé. Annulation facile à tout moment.
          </motion.div>
          {error && <StripeError message={typeof error === 'string' ? error : 'Une erreur de paiement est survenue'} />}
        </div>
      </section>

      {/* Section CTA - Temporarily commented */}
      {/* <section className="py-16 sm:py-24 px-4"> ... </section> */}

      {/* Footer - Minimaliste */}
      <footer className="py-8 text-center">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Francis. Tous droits réservés.</p>
      </footer>

    </div>
  );
} 