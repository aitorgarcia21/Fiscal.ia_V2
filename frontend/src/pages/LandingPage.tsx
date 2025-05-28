import { useState } from 'react';
import { Shield, ArrowRight, Users, TrendingUp, Check, Sparkles, CreditCard, ChevronDown, X, MessageSquare, Euro, Calculator } from 'lucide-react';
import { AuthModal } from '../components/auth/AuthModal';
import { DemoModal } from '../components/demo/DemoModal';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStripe } from '../hooks/useStripe';
import { PRICING } from '../config/pricing';
import { StripeError } from '../components/stripe/StripeError';
import { DemoConversation } from '../components/demo/DemoConversation';

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState<false | 'login' | 'signup'>(false);
  const [showDemo, setShowDemo] = useState(false);
  const { handleCheckout, isLoading, error } = useStripe();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#1a2942]/95 backdrop-blur-sm border-b border-[#234876] z-30">
        <div className="h-16 max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="relative inline-flex items-center justify-center group">
            <MessageSquare className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110" />
            <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
          </div>
          <button
            onClick={() => setShowAuthModal('login')}
            className="px-7 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold rounded-full shadow-lg hover:shadow-[#c5a572]/30 hover:scale-105 transition-all duration-200 border-2 border-[#c5a572]/40 focus:outline-none focus:ring-2 focus:ring-[#c5a572] focus:ring-offset-2 ml-auto max-w-xs truncate text-base md:text-lg"
            style={{minWidth: '120px'}}
          >
            Se connecter
          </button>
        </div>
      </header>

      {/* Modale d'authentification */}
      {showAuthModal && (
        <AuthModal mode={showAuthModal} onClose={() => setShowAuthModal(false)} />
      )}

      {/* Modale de démo */}
      {showDemo && (
        <DemoModal
          onClose={() => setShowDemo(false)}
          onStart={() => {
            setShowDemo(false);
            setShowAuthModal('signup');
          }}
        />
      )}

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-40 pb-20 relative overflow-hidden">
        {/* Motif géométrique et effets visuels */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle, #c5a572 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a2942]/95 via-[#223c63]/85 to-[#234876]/75">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#c5a572]/20 via-transparent to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Points lumineux animés */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#c5a572]"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                boxShadow: '0 0 10px #c5a572'
              }}
            />
          ))}
        </div>

        {/* Contenu principal */}
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-16 leading-tight">
                Optimisez votre fiscalité avec{' '}
                <span className="relative inline-block text-[#c5a572]">
                  Francis
                  <motion.span
                    className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  />
                </span>
              </h1>
            </motion.div>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Votre assistant fiscal <span className="text-[#c5a572] font-semibold">propulsé par IA</span> qui vous aide à optimiser vos impôts et à prendre les meilleures décisions financières.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <motion.button
              onClick={() => setShowAuthModal('signup')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all transform flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Créer un compte
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowDemo(true)}
              className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all transform flex items-center justify-center gap-2"
            >
              Voir la démo
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6 opacity-70 mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 flex items-center"
            >
              <Shield className="h-4 w-4 text-[#c5a572] mr-2" />
              <span className="text-sm text-gray-300">100% Sécurisé</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 flex items-center"
            >
              <Users className="h-4 w-4 text-[#c5a572] mr-2" />
              <span className="text-sm text-gray-300">+100 Utilisateurs</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 flex items-center"
            >
              <Sparkles className="h-4 w-4 text-[#c5a572] mr-2" />
              <span className="text-sm text-gray-300">IA de pointe</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section Avantages */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 drop-shadow-lg">
              Pourquoi choisir{' '}
              <span className="relative inline-block text-[#c5a572]">
                Francis
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                />
              </span>
              {' '}?
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl md:text-3xl font-semibold text-white bg-gradient-to-br from-[#c5a572]/90 to-[#e8cfa0]/80 shadow-xl rounded-2xl px-8 py-10 mx-auto max-w-4xl mb-8 border-2 border-[#c5a572]/40 backdrop-blur-sm leading-relaxed tracking-wide drop-shadow-xl animate-pulse-smooth"
              style={{lineHeight: '1.5', letterSpacing: '0.01em'}}
            >
              Chaque année, des millions de Français remplissent leur déclaration sans savoir qu'ils pourraient <span className="text-[#ffe082] font-bold underline decoration-[#c5a572] decoration-2 animate-glow">payer moins</span>, légalement.<br />
              Pas par manque de volonté.<br />
              Mais parce que <span className="text-[#e8cfa0] font-bold">personne</span> ne leur explique.<br />
              <span className="text-[#c5a572] font-bold">Pas les impôts. Pas les banques. Pas les simulateurs incomplets.</span><br /><br />
              Francis est là pour changer ça.<br />
              On a trouvé une <span className="bg-gradient-to-r from-[#ffe082] to-[#c5a572] bg-clip-text text-transparent font-extrabold animate-glow">solution</span>.<br />
              <span className="bg-gradient-to-r from-[#ffe082] via-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent font-extrabold animate-glow">Une intelligence artificielle indépendante</span>, conçue pour vous défendre, vous guider, vous faire économiser.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Section Tarifs */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Une offre unique, des résultats{' '}
              <span className="relative inline-block text-[#c5a572]">
                concrets
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                />
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Accédez à toutes les fonctionnalités pour optimiser votre fiscalité
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] rounded-2xl shadow-2xl overflow-hidden border border-[#c5a572]/30"
            >
              {/* PRIX EN HAUT */}
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 px-8 pt-10">
                {/* Mensuel */}
                <div className="flex-1 bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 p-6 flex flex-col items-center">
                  <p className="text-3xl font-bold text-[#c5a572] mb-1">9,99€</p>
                  <p className="text-gray-300 mb-2">par mois</p>
                  <button
                    onClick={() => setShowAuthModal('signup')}
                    className="w-full px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                  >
                    Créer un compte
                  </button>
                </div>
                {/* Annuel */}
                <div className="flex-1 bg-[#c5a572]/10 rounded-xl border border-[#c5a572]/30 p-6 flex flex-col items-center relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#c5a572]/20">
                    Économisez 17%
                  </div>
                  <p className="text-3xl font-bold text-[#c5a572] mb-1 mt-4">99,99€</p>
                  <p className="text-gray-300 mb-2">par an</p>
                  <p className="text-sm text-gray-400 line-through mb-2">119,88€</p>
                  <button
                    onClick={() => setShowAuthModal('signup')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                  >
                    Créer un compte
                  </button>
                </div>
              </div>
              {/* En-tête */}
              <div className="bg-gradient-to-r from-[#1a2942] to-[#223c63] px-8 py-10 border-b border-[#c5a572]/30 mt-8">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="relative inline-flex items-center justify-center group">
                    <MessageSquare className="h-12 w-12 text-[#c5a572] transition-transform group-hover:scale-110" />
                    <Euro className="h-8 w-8 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Francis</h3>
                    <p className="text-xl text-gray-300">Votre conseiller fiscal propulsé par IA</p>
                  </div>
                </div>
              </div>
              {/* Contenu */}
              <div className="p-8">
                {/* Fonctionnalités incluses */}
                <div className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 p-6 mb-8">
                  <h4 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Sparkles className="w-6 h-6 mr-3 text-[#c5a572]" />
                    Tout est inclus
                  </h4>
                  <ul className="space-y-6">
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-[#c5a572]/20 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <Check className="w-4 h-4 text-[#c5a572]" />
                      </div>
                      <div>
                        <p className="text-[#c5a572] font-medium mb-1">Analyse complète de vos transactions</p>
                        <p className="text-gray-300 text-sm">Récupération sécurisée via connexion bancaire PSD2 pour un audit financier exhaustif.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-[#c5a572]/20 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <Check className="w-4 h-4 text-[#c5a572]" />
                      </div>
                      <div>
                        <p className="text-[#c5a572] font-medium mb-1">Détection automatique des optimisations</p>
                        <p className="text-gray-300 text-sm">Notre IA fiscaliste analyse vos données et identifie instantanément les leviers fiscaux les plus efficaces.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-[#c5a572]/20 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <Check className="w-4 h-4 text-[#c5a572]" />
                      </div>
                      <div>
                        <p className="text-[#c5a572] font-medium mb-1">Recommandations personnalisées</p>
                        <p className="text-gray-300 text-sm">Stratégies sur-mesure (PER, Pinel, dons…) générées selon votre profil et vos objectifs.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-[#c5a572]/20 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <Check className="w-4 h-4 text-[#c5a572]" />
                      </div>
                      <div>
                        <p className="text-[#c5a572] font-medium mb-1">Mises à jour régulières</p>
                        <p className="text-gray-300 text-sm">Dispositifs fiscaux et plafonds automatiquement actualisés dès chaque changement législatif.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                {/* Bouton se connecter */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowAuthModal('signup')}
                    className="px-8 py-4 bg-[#1a2942] text-white font-bold rounded-xl border border-[#c5a572]/30 hover:bg-[#1a2942]/80 transition-all transform hover:scale-105"
                  >
                    Créer un compte
                  </button>
                </div>
                <StripeError message={error || ''} />
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    Sans engagement • Annulation à tout moment • Paiement sécurisé
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-[#1a2942] to-[#234876] rounded-2xl p-12 border border-[#c5a572]/20"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Prêt à{' '}
              <span className="relative inline-block text-[#c5a572]">
                optimiser
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                />
              </span>
              {' '}votre fiscalité ?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Rejoignez plus de 100 utilisateurs qui font confiance à Francis pour leurs finances.
            </p>
            <button
              onClick={() => setShowAuthModal('signup')}
              className="px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all transform hover:scale-105"
            >
              Créer un compte
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 