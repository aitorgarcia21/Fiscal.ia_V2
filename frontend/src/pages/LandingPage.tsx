import { useState } from 'react';
import { Shield, ArrowRight, Users, TrendingUp, Check, Sparkles, CreditCard, ChevronDown, X, MessageSquare, Euro, Calculator } from 'lucide-react';
import { AuthModal } from '../components/auth/AuthModal';
import { DemoModal } from '../components/demo/DemoModal';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStripe } from '../hooks/useStripe';
import { PRICING } from '../config/pricing';
import { StripeError } from '../components/stripe/StripeError';

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { handleCheckout, isLoading, error } = useStripe();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#1a2942]/95 backdrop-blur-sm border-b border-[#234876] z-30">
        <div className="h-16 max-w-7xl mx-auto px-4 flex items-center justify-center">
          <div className="relative inline-flex items-center justify-center group">
            <MessageSquare className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110" />
            <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#1a2942] rounded-full p-0.5 transition-transform group-hover:scale-110" />
          </div>
        </div>
      </header>

      {/* Modale d'authentification */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* Modale de démo */}
      {showDemo && (
        <DemoModal
          onClose={() => setShowDemo(false)}
          onStart={() => {
            setShowDemo(false);
            setShowAuthModal(true);
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
              onClick={() => setShowAuthModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all transform flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Se connecter
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
            <h2 className="text-4xl font-bold text-white mb-6">
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
            <p className="text-xl text-gray-300 max-w-3xl mx-auto whitespace-pre-line">
              Chaque année, des millions de Français remplissent leur déclaration sans savoir qu'ils pourraient payer moins, légalement.
              Pas par manque de volonté.
              Mais parce que personne ne leur explique.
              Pas les impôts. Pas les banques. Pas les simulateurs incomplets.
              
              Francis est là pour changer ça.
              On a trouvé une solution.
              Une intelligence artificielle indépendante, conçue pour vous défendre, vous guider, vous faire économiser.
            </p>
          </motion.div>
          {/* Bloc démo Francis/Paul */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-[#1a2942]/80 backdrop-blur-sm rounded-2xl p-8 border border-[#c5a572]/30 shadow-xl">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="relative inline-flex items-center justify-center group">
                    <MessageSquare className="h-7 w-7 text-[#c5a572]" />
                    <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2942] rounded-full p-0.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg mb-2">Salut Paul ! On optimise ton impôt sur le revenu 2025 ? Dis-moi si j'ai bon :</p>
                    <div className="bg-white/10 rounded-lg p-4 space-y-2 border border-[#c5a572]/20">
                      <p className="text-[#c5a572] font-medium">• Revenu net imposable 2024 : 50 000 €</p>
                      <p className="text-[#c5a572] font-medium">• Tu es marié, avec 1 enfant à charge</p>
                      <p className="text-[#c5a572] font-medium">• Tu veux payer moins d'impôt et préparer ta retraite</p>
                    </div>
                    <p className="text-white text-lg mt-2">C'est bien ça ?</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg">Oui, c'est ça !</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="relative inline-flex items-center justify-center group">
                    <MessageSquare className="h-7 w-7 text-[#c5a572]" />
                    <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2942] rounded-full p-0.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg mb-2">Top ! Voici 3 leviers efficaces pour ton profil 👇</p>
                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-lg p-4 border border-[#c5a572]/20">
                        <p className="text-[#c5a572] font-medium mb-1">1. Plan Épargne Retraite (PER)</p>
                        <p>💡 Tu peux verser jusqu'à 5 000 € en 2025 (c'est ton plafond déductible).</p>
                        <p>📉 Ce montant est retiré de ton revenu imposable → il passe de 50 000 € à 45 000 €</p>
                        <p>📊 Résultat : 550 € d'impôt en moins</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4 border border-[#c5a572]/20">
                        <p className="text-[#c5a572] font-medium mb-1">2. Location meublée (LMNP)</p>
                        <p>🏘️ Tu achètes un petit bien à louer meublé</p>
                        <p>🧾 En meublé réel, tu peux amortir le bien + charges</p>
                        <p>✅ Résultat : souvent 0 € d'impôt pendant plusieurs années sur les loyers</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4 border border-[#c5a572]/20">
                        <p className="text-[#c5a572] font-medium mb-1">3. Don à une association</p>
                        <p>❤️ Tu donnes 1 000 € à une ONG</p>
                        <p>💶 Tu récupères 660 € en crédit d'impôt</p>
                        <p className="text-sm text-gray-300">(ou 750 € si c'est une association d'aide aux plus démunis)</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg">Et si je mets seulement 3 000 € sur le PER ?</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="relative inline-flex items-center justify-center group">
                    <MessageSquare className="h-7 w-7 text-[#c5a572]" />
                    <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2942] rounded-full p-0.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg mb-2">Alors ton économie tombe à 330 € (3 000 € × 11 %)</p>
                    <p>➕ Avec ton don de 1 000 €, ça fait 990 € d'impôt en moins</p>
                    <p>➕ Et si tu fais de la location meublée, tu peux carrément ne plus rien payer sur les loyers</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg">OK c'est clair. On continue ?</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="relative inline-flex items-center justify-center group">
                    <MessageSquare className="h-7 w-7 text-[#c5a572]" />
                    <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#1a2942] rounded-full p-0.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg mb-2">Yes ! Crée ton compte, et je t'analyse tout ça à partir de tes vrais chiffres.<br/>Tu auras un plan fiscal personnalisé, prêt à appliquer.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              {/* En-tête */}
              <div className="bg-gradient-to-r from-[#1a2942] to-[#223c63] px-8 py-10 border-b border-[#c5a572]/30">
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

                {/* Options d'abonnement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Option Mensuelle */}
                  <div className="bg-[#1a2942]/40 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 p-6 hover:bg-[#1a2942]/60 transition-all duration-200 transform hover:scale-105">
                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold text-[#c5a572]">9,99€</p>
                      <p className="text-gray-300">par mois</p>
                    </div>
                  </div>

                  {/* Option Annuelle */}
                  <div className="bg-[#c5a572]/10 rounded-xl border border-[#c5a572]/30 p-6 relative hover:bg-[#c5a572]/20 transition-all duration-200 transform hover:scale-105">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#c5a572]/20">
                      Économisez 17%
                    </div>
                    <div className="text-center mb-4 mt-4">
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-3xl font-bold text-[#c5a572]">99,99€</p>
                      </div>
                      <p className="text-gray-300">par an</p>
                      <p className="text-sm text-gray-400 line-through mt-1">119,88€</p>
                    </div>
                  </div>
                </div>

                {/* Boutons de paiement */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <button
                    onClick={() => handleCheckout('MONTHLY')}
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Chargement...' : 'Choisir mensuel'}
                  </button>
                  <button
                    onClick={() => handleCheckout('ANNUAL')}
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Chargement...' : 'Choisir annuel'}
                  </button>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="w-full px-6 py-3 bg-[#1a2942] text-white font-bold rounded-xl border border-[#c5a572]/30 hover:bg-[#1a2942]/80 transition-all transform hover:scale-105"
                  >
                    Se connecter
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
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] font-bold rounded-xl hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all transform hover:scale-105"
            >
              Commencer gratuitement
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 