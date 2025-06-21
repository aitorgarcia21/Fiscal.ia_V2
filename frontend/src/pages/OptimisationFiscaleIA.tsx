import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Calculator, Bot, TrendingUp, Users, CheckCircle, Award, Building, FileText, Target, Zap, Heart, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

export function OptimisationFiscaleIA() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0F1B2F] to-[#162238]">
      {/* Header */}
      <header className="bg-[#0A1628]/95 backdrop-blur-sm border-b border-[#c5a572]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#162238]" />
            </div>
            <span className="text-white text-xl font-bold">Francis</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/demo" className="text-gray-300 hover:text-white transition-colors">Démo</Link>
            <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">Tarifs</Link>
            <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          </nav>
          
          <Link 
            to="/signup"
            className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Commencer
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c5a572]/20 to-[#e8cfa0]/20 px-4 py-2 rounded-full border border-[#c5a572]/30 mb-8">
              <Bot className="w-4 h-4 text-[#c5a572]" />
              <span className="text-[#c5a572] font-semibold text-sm">Intelligence Artificielle Fiscale</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Optimisation Fiscale par <br />
              <span className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent">
                Intelligence Artificielle
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Francis révolutionne le conseil fiscal grâce à l'IA. Découvrez comment optimiser vos impôts 2025 
              avec des stratégies personnalisées basées sur la législation française officielle.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/demo"
                className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-4 rounded-lg font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Analyser ma situation
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                to="/simulateur-impot"
                className="bg-white/10 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/20"
              >
                <PieChart className="w-5 h-5" />
                Simulateur d'impôt
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, number: "1 847€", label: "Économie fiscale moyenne", sublabel: "Par client et par an" },
              { icon: Users, number: "2 400+", label: "Contribuables accompagnés", sublabel: "Depuis 2024" },
              { icon: Zap, number: "< 30s", label: "Analyse de situation", sublabel: "Temps de traitement IA" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-gradient-to-br from-white/8 to-white/4 rounded-xl p-6 border border-[#c5a572]/20 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-[#162238]" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-[#c5a572] mb-2">{stat.number}</div>
                <h3 className="text-white font-semibold mb-1">{stat.label}</h3>
                <p className="text-gray-400 text-sm">{stat.sublabel}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Francis */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Qu'est-ce que l'optimisation fiscale par IA ?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Francis analyse votre situation fiscale en temps réel et identifie automatiquement 
              les meilleures stratégies d'optimisation selon la législation française en vigueur.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Comment Francis optimise vos impôts
              </h3>
              
              <div className="space-y-6">
                {[
                  {
                    icon: FileText,
                    title: "Analyse complète de votre profil",
                    description: "Francis étudie vos revenus, charges, situation familiale et objectifs pour créer une stratégie personnalisée."
                  },
                  {
                    icon: Calculator,
                    title: "Calculs automatisés précis",
                    description: "L'IA effectue tous les calculs fiscaux complexes en appliquant le Code Général des Impôts et les dernières mesures 2025."
                  },
                  {
                    icon: Target,
                    title: "Recommandations ciblées",
                    description: "Francis propose des solutions concrètes : PER, LMNP, dons, défiscalisation, selon votre profil et vos capacités."
                  },
                  {
                    icon: TrendingUp,
                    title: "Suivi et optimisation continue",
                    description: "Votre stratégie évolue avec vos revenus et la législation pour maximiser vos économies d'impôt."
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 bg-[#c5a572]/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#c5a572]/30">
                      <feature.icon className="w-6 h-6 text-[#c5a572]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#c5a572]/10 to-[#e8cfa0]/10 rounded-2xl p-8 border border-[#c5a572]/20">
              <h4 className="text-xl font-bold text-white mb-6">Exemple d'optimisation Francis</h4>
              
              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Situation initiale</div>
                  <div className="text-white font-semibold">Célibataire, 45k€ de revenus, impôt : 2 847€</div>
                </div>
                
                <div className="text-center text-[#c5a572]">↓ Optimisation Francis</div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">PER (5 000€)</span>
                    <span className="text-green-400">-550€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Don défiscalisé (1 000€)</span>
                    <span className="text-green-400">-660€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">LMNP (appartement 80k€)</span>
                    <span className="text-green-400">0€ impôt loyers</span>
                  </div>
                </div>
                
                <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                  <div className="text-sm text-green-400 mb-1">Nouvel impôt</div>
                  <div className="text-white font-bold text-xl">1 637€ (-1 210€)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategies */}
      <section className="py-20 px-4 bg-[#0A1628]/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Stratégies d'optimisation fiscale 2025
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Francis maîtrise toutes les niches fiscales légales pour réduire votre imposition 
              en respectant la réglementation française.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: PieChart,
                title: "Plan Épargne Retraite (PER)",
                description: "Déduction fiscale immédiate jusqu'à 10% de vos revenus. Économie moyenne : 550€/an.",
                benefits: ["Déduction immédiate", "Retraite optimisée", "Flexibilité de sortie"]
              },
              {
                icon: Building,
                title: "Location Meublée (LMNP)",
                description: "Investissement immobilier avec amortissement. 0€ d'impôt sur les loyers pendant 8-12 ans.",
                benefits: ["Amortissement du bien", "Revenus défiscalisés", "Constitution patrimoine"]
              },
              {
                icon: Heart,
                title: "Dons et mécénat",
                description: "66% de crédit d'impôt sur vos dons. Soutenez des causes tout en optimisant.",
                benefits: ["66% de crédit d'impôt", "Impact social positif", "Plafond 20% revenus"]
              },
              {
                icon: Shield,
                title: "Assurance-vie",
                description: "Fiscalité avantageuse après 8 ans. Abattement de 4 600€/an pour les plus-values.",
                benefits: ["Fiscalité allégée", "Transmission optimisée", "Liquidité préservée"]
              },
              {
                icon: Calculator,
                title: "Frais professionnels",
                description: "Optimisation des frais réels vs abattement forfaitaire. Déduction maximale légale.",
                benefits: ["Frais réels optimisés", "Transport déductible", "Matériel professionnel"]
              },
              {
                icon: TrendingUp,
                title: "Défiscalisation immobilière",
                description: "Loi Pinel, Denormandie, Malraux... Réduction d'impôt selon votre projet.",
                benefits: ["Réduction d'impôt", "Investissement rentable", "Diversification patrimoine"]
              }
            ].map((strategy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white/8 to-white/4 rounded-xl p-6 border border-[#c5a572]/20 hover:border-[#c5a572]/40 transition-all"
              >
                <div className="w-12 h-12 bg-[#c5a572]/20 rounded-lg flex items-center justify-center mb-4 border border-[#c5a572]/30">
                  <strategy.icon className="w-6 h-6 text-[#c5a572]" />
                </div>
                
                <h3 className="text-white font-bold text-lg mb-3">{strategy.title}</h3>
                <p className="text-gray-300 mb-4 text-sm">{strategy.description}</p>
                
                <ul className="space-y-2">
                  {strategy.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SEO */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Questions fréquentes sur l'optimisation fiscale IA
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "L'IA Francis respecte-t-elle les règles fiscales françaises ?",
                answer: "Oui, absolument. Francis est entraîné exclusivement sur la législation fiscale française officielle (Code Général des Impôts, BOFIP, jurisprudence). Toutes les stratégies proposées respectent strictement la loi et sont validées par nos experts fiscalistes."
              },
              {
                question: "Combien puis-je réellement économiser avec Francis ?",
                answer: "Nos clients économisent en moyenne 1 847€ par an. Cette économie varie selon votre situation : revenus, composition familiale, patrimoine existant. Francis analyse votre profil complet pour identifier le potentiel d'optimisation maximal selon la législation en vigueur."
              },
              {
                question: "Francis remplace-t-il mon expert-comptable ?",
                answer: "Non, Francis complète votre expert-comptable. Il identifie automatiquement les optimisations fiscales possibles que vous pouvez ensuite valider et mettre en œuvre avec votre professionnel. Francis accélère le processus de conseil et garantit qu'aucune opportunité légale n'est oubliée."
              },
              {
                question: "Comment Francis reste-t-il à jour avec les évolutions fiscales ?",
                answer: "Francis est mis à jour en temps réel avec chaque évolution de la législation fiscale française. Notre équipe d'experts suit les modifications du CGI, les nouveaux dispositifs de défiscalisation et les jurisprudences pour maintenir Francis toujours conforme et optimal."
              },
              {
                question: "Mes données fiscales sont-elles sécurisées ?",
                answer: "Absolument. Francis utilise un chiffrement de niveau bancaire pour protéger vos données. Aucune information personnelle n'est stockée de manière permanente. Nous respectons strictement le RGPD et la confidentialité fiscale française."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white/8 to-white/4 rounded-xl p-6 border border-[#c5a572]/20"
              >
                <h3 className="text-white font-semibold text-lg mb-3">{faq.question}</h3>
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#c5a572]/10 to-[#e8cfa0]/10 rounded-2xl p-12 border border-[#c5a572]/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Commencez votre optimisation fiscale maintenant
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Rejoignez les 2 400+ contribuables qui économisent déjà 1 847€ par an grâce à Francis.
              Analyse gratuite de votre situation en moins de 30 secondes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/demo"
                className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-4 rounded-lg font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Bot className="w-5 h-5" />
                Tester Francis gratuitement
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                to="/pricing"
                className="bg-white/10 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/20"
              >
                <Award className="w-5 h-5" />
                Voir les tarifs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A192F] border-t border-[#2A3F6C]/30 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400">&copy; 2024. Tous droits réservés. Francis est conforme à la réglementation fiscale française.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 