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
            className="px-4 py-2 sm:px-7 sm:py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold rounded-full shadow-lg hover:shadow-[#c5a572]/30 hover:scale-105 transition-all duration-200 border-2 border-[#c5a572]/40 focus:outline-none focus:ring-2 focus:ring-[#c5a572] focus:ring-offset-2 ml-auto max-w-xs truncate text-sm sm:text-base md:text-lg"
            style={{minWidth: '100px'}}
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
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-12 sm:mb-16 leading-tight">
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16"
          >
            <motion.button
              onClick={() => setShowAuthModal('signup')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all transform flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              Créer un compte
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowDemo(true)}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all transform flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Voir la démo
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-6 opacity-70 mb-12 sm:mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 flex items-center"
            >
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-[#c5a572] mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm text-gray-300">100% Sécurisé</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 flex items-center"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-[#c5a572] mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm text-gray-300">+100 Utilisateurs</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 flex items-center"
            >
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-[#c5a572] mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm text-gray-300">IA de pointe</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 sm:mb-8 drop-shadow-lg">
              Comment ça marche&nbsp;?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              3 étapes simples pour optimiser votre fiscalité avec Francis
            </p>
          </motion.div>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
            {/* Étape 1 */}
            <motion.div
              whileHover={{ y: -8, boxShadow: '0 8px 32px #c5a57255' }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="flex-1 bg-gradient-to-br from-[#1a2942]/80 to-[#223c63]/80 rounded-3xl border-2 border-[#c5a572]/40 p-6 sm:p-10 flex flex-col items-center shadow-2xl backdrop-blur-xl relative group transition-all duration-300"
            >
              <span className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-base sm:text-lg shadow-lg border border-[#c5a572]/40 z-10">1</span>
              <motion.div animate={{ scale: [1,1.08,1] }} transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] flex items-center justify-center mb-4 sm:mb-6 shadow-xl border-4 border-[#c5a572]/30">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-[#1a2942]" />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 text-center">Créez votre compte et votre profil</h3>
              <p className="text-gray-200 text-base sm:text-lg text-center">Inscrivez-vous en 2 minutes et renseignez vos infos pour un accompagnement sur-mesure.</p>
            </motion.div>
            {/* Étape 2 */}
            <motion.div
              whileHover={{ y: -8, boxShadow: '0 8px 32px #c5a57255' }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="flex-1 bg-gradient-to-br from-[#1a2942]/80 to-[#223c63]/80 rounded-3xl border-2 border-[#c5a572]/40 p-6 sm:p-10 flex flex-col items-center shadow-2xl backdrop-blur-xl relative group transition-all duration-300"
            >
              <span className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-base sm:text-lg shadow-lg border border-[#c5a572]/40 z-10">2</span>
              <motion.div animate={{ scale: [1,1.08,1] }} transition={{ repeat: Infinity, duration: 2.2, repeatType: 'reverse' }} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] flex items-center justify-center mb-4 sm:mb-6 shadow-xl border-4 border-[#c5a572]/30">
                <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-[#1a2942]" />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 text-center">Discutez avec Francis</h3>
              <p className="text-gray-200 text-base sm:text-lg text-center">Posez vos questions, obtenez des recommandations personnalisées et des plans d'action concrets.</p>
            </motion.div>
            {/* Étape 3 */}
            <motion.div
              whileHover={{ y: -8, boxShadow: '0 8px 32px #c5a57255' }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="flex-1 bg-gradient-to-br from-[#1a2942]/80 to-[#223c63]/80 rounded-3xl border-2 border-[#c5a572]/40 p-6 sm:p-10 flex flex-col items-center shadow-2xl backdrop-blur-xl relative group transition-all duration-300"
            >
              <span className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-base sm:text-lg shadow-lg border border-[#c5a572]/40 z-10">3</span>
              <motion.div animate={{ scale: [1,1.08,1] }} transition={{ repeat: Infinity, duration: 2.4, repeatType: 'reverse' }} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] flex items-center justify-center mb-4 sm:mb-6 shadow-xl border-4 border-[#c5a572]/30">
                <Check className="w-8 h-8 sm:w-10 sm:h-10 text-[#1a2942]" />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 text-center">Mettez en place&nbsp;!</h3>
              <p className="text-gray-200 text-base sm:text-lg text-center">Passez à l'action facilement grâce à nos conseils et suivez vos optimisations en temps réel.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Avantages */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 drop-shadow-lg">
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
              className="text-base sm:text-lg md:text-xl font-semibold text-white bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] shadow-xl rounded-2xl px-4 py-4 sm:px-6 sm:py-6 mx-auto max-w-2xl mb-4 border-2 border-[#c5a572]/40 backdrop-blur-sm leading-relaxed tracking-wide drop-shadow-xl animate-pulse-smooth"
              style={{lineHeight: '1.5', letterSpacing: '0.01em'}}
            >
              Chaque année, des millions de Français remplissent leur déclaration sans savoir qu'ils pourraient <span className="font-bold underline decoration-[#c5a572] decoration-2" style={{color:'#c5a572', textShadow:'0 2px 8px #1a2942,0 0 2px #c5a572'}}>payer moins</span>, légalement.<br />
              Pas par manque de volonté.<br />
              Mais parce que <span className="font-bold" style={{color:'#fff', textShadow:'0 2px 8px #1a2942,0 0 2px #c5a572'}}>personne</span> ne leur explique.<br />
              <span className="font-bold" style={{color:'#c5a572', textShadow:'0 2px 8px #1a2942,0 0 2px #c5a572'}}>Pas les impôts. Pas les banques. Pas les simulateurs incomplets.</span><br /><br />
              Francis est là pour changer ça.<br />
              On a trouvé une <span className="font-extrabold" style={{color:'#c5a572', textShadow:'0 2px 8px #1a2942,0 0 2px #c5a572'}}>solution</span>.<br />
              <span className="font-extrabold" style={{color:'#fff', textShadow:'0 2px 8px #1a2942,0 0 2px #c5a572'}}>Une intelligence artificielle indépendante</span>, conçue pour vous défendre, vous guider, vous faire économiser.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Section Offre + Avantages fusionnées */}
      <section className="py-12 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 sm:mb-4 drop-shadow-lg">
              Une offre unique, des résultats <span className="text-[#c5a572]">concrets</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Accédez à toutes les fonctionnalités pour optimiser votre fiscalité
            </p>
          </motion.div>
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-end mb-8 md:mb-10">
            {/* Offre mensuelle */}
            <div className="flex-1 bg-gradient-to-br from-[#1a2942]/90 to-[#223c63]/90 border-2 border-[#C5A572]/40 rounded-2xl p-6 sm:p-8 flex flex-col items-center shadow-xl min-w-[180px] max-w-xs mx-auto w-full">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#c5a572] mb-1 sm:mb-2">9,99€</div>
              <div className="text-[#c5a572] text-base sm:text-lg mb-2 sm:mb-4">par mois</div>
              <button
                onClick={() => setShowAuthModal('signup')}
                className="w-full px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-[#C5A572] to-[#e8cfa0] text-[#1a2942] font-bold rounded-xl text-base sm:text-lg hover:shadow-lg hover:shadow-[#C5A572]/20 transition-all transform hover:scale-105 mb-1 sm:mb-2 mt-1 sm:mt-2"
              >
                Créer un compte
              </button>
            </div>
            {/* Offre annuelle */}
            <div className="flex-1 bg-gradient-to-br from-[#223c63]/90 to-[#1a2942]/90 border-2 border-[#C5A572]/40 rounded-2xl p-6 sm:p-8 flex flex-col items-center shadow-xl min-w-[180px] max-w-xs mx-auto w-full relative">
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#C5A572] to-[#e8cfa0] text-[#1a2942] px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg border border-[#C5A572]/40">
                Économisez 17%
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#c5a572] mb-1 sm:mb-2 mt-5 sm:mt-6">99,99€</div>
              <div className="text-[#c5a572] text-base sm:text-lg mb-1">par an</div>
              <div className="text-xs sm:text-sm text-white/70 line-through mb-2 sm:mb-4">119,88€</div>
              <button
                onClick={() => setShowAuthModal('signup')}
                className="w-full px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-[#C5A572] to-[#e8cfa0] text-[#1a2942] font-bold rounded-xl text-base sm:text-lg hover:shadow-lg hover:shadow-[#C5A572]/20 transition-all transform hover:scale-105 mb-1 sm:mb-2 mt-1 sm:mt-2"
              >
                Créer un compte
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#1a2942] to-[#223c63] rounded-2xl border-2 border-[#C5A572]/30 p-5 sm:p-8 shadow-lg max-w-2xl mx-auto">
            <div className="text-white text-base sm:text-lg font-medium text-center mb-4 sm:mb-6">
              Tous les outils et services pour optimiser votre fiscalité, inclus dans votre abonnement Francis.
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 justify-center">
              <div className="flex flex-col items-center min-w-[100px]">
                <span className="text-[#c5a572] font-bold text-base sm:text-lg">24/7</span>
                <span className="text-[#e8cfa0] text-xs sm:text-sm">Accès illimité</span>
              </div>
              <div className="flex flex-col items-center min-w-[100px]">
                <span className="text-[#c5a572] font-bold text-base sm:text-lg">Analyse personnalisée</span>
                <span className="text-[#e8cfa0] text-xs sm:text-sm">Pour votre profil</span>
              </div>
              <div className="flex flex-col items-center min-w-[100px]">
                <span className="text-[#c5a572] font-bold text-base sm:text-lg">Suivi en temps réel</span>
                <span className="text-[#e8cfa0] text-xs sm:text-sm">Optimisations instantanées</span>
              </div>
              <div className="flex flex-col items-center min-w-[100px]">
                <span className="text-[#c5a572] font-bold text-base sm:text-lg">Mise à jour quotidienne</span>
                <span className="text-[#e8cfa0] text-xs sm:text-sm">Toujours à jour</span>
              </div>
            </div>
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
            className="bg-gradient-to-br from-[#1a2942] to-[#234876] rounded-2xl p-8 sm:p-12 border border-[#c5a572]/20"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
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
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Rejoignez plus de 100 utilisateurs qui font confiance à Francis pour leurs finances.
            </p>
            <button
              onClick={() => setShowAuthModal('signup')}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all transform hover:scale-105 text-sm sm:text-base"
            >
              Créer un compte
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 