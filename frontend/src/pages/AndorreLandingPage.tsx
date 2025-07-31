import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { AndorreDemoConversation } from '../components/demo/AndorreDemoConversation';

/**
 * Landing page révolutionnaire pour Francis Andorre - Design ultra-stylé avec démo interactive
 */
export const AndorreLandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#162238] to-[#1E3253] text-gray-100 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-40">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5a572' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-[#c5a572]/5 via-transparent to-[#e8cfa0]/5 pointer-events-none"></div>

      {/* Header Premium */}
      <header className="relative z-20 bg-[#162238]/80 backdrop-blur-xl border-b border-[#c5a572]/20 shadow-2xl">
        <div className="h-24 max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 cursor-pointer group" 
            onClick={() => navigate('/')}
          >          
            <Logo size="lg" className="group" />
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">Francis</span>
              <div className="flex items-center gap-2">
                <span className="text-sm bg-gradient-to-r from-blue-600/80 to-indigo-600/80 text-blue-100 px-3 py-1 rounded-full font-medium backdrop-blur-sm border border-blue-400/30">Andorre</span>

              </div>
            </div>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => navigate('/andorre/login')}
            className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-3 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Accéder à Francis
          </motion.button>
        </div>
      </header>

      {/* Hero Section Ultra-Premium */}
      <main className="relative z-10">
        <section className="pt-20 pb-32 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >

              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-none">
                L'Excellence
                <br />
                <span className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent">Fiscale Andorrane</span>
                <br />
                <span className="text-4xl md:text-5xl lg:text-6xl text-gray-300">Réinventée</span>
              </h1>
              
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-12 max-w-5xl mx-auto leading-relaxed font-light">
                Francis révolutionne la gestion patrimoniale en Andorre grâce à une IA de pointe.
                <br className="hidden md:block" />
                Transformez votre expertise en avantage concurrentiel décisif.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                <div className="bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/10 backdrop-blur-sm border border-[#c5a572]/30 text-white px-8 py-4 rounded-2xl font-bold text-xl">
                  49€/mois • Questions illimitées
                </div>

              </div>
            </motion.div>
          </div>
        </section>

        {/* Démo Interactive */}
        <section className="py-20 px-6 bg-gradient-to-r from-[#162238]/50 to-[#1E3253]/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Découvrez Francis
                <span className="block text-[#c5a572]">en Action</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Observez comment Francis analyse une situation fiscale complexe et propose des optimisations sur mesure en quelques secondes.
              </p>
            </motion.div>
            
            <AndorreDemoConversation />
          </div>
        </section>

        {/* Avantages Premium */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
            >
              Pourquoi les Experts
              <span className="block text-[#c5a572]">Choisissent Francis</span>
            </motion.h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Expertise Instantanée",
                  description: "Maîtrisez tous les aspects de la fiscalité andorrane : IRPF, IS, IGI, optimisations patrimoniales. Réponses expertes en temps réel.",
                  highlight: "Gain de temps : 85%"
                },
                {
                  icon: TrendingUp,
                  title: "Optimisation Avancée",
                  description: "Stratégies fiscales personnalisées, structures societales optimisées, planification patrimoniale sur mesure pour chaque profil client.",
                  highlight: "Économies moyennes : 43k€/an"
                },
                {
                  icon: Shield,
                  title: "Conformité Garantie",
                  description: "Jurisprudence actualisée en permanence, veille réglementaire automatique, conseils conformes aux dernières évolutions légales.",
                  highlight: "100% conforme"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                  className="group bg-gradient-to-br from-[#162238]/60 via-[#1E3253]/60 to-[#2A3F6C]/60 backdrop-blur-xl border border-[#c5a572]/20 rounded-3xl p-8 hover:border-[#c5a572]/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="bg-gradient-to-br from-[#c5a572] to-[#e8cfa0] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-[#162238]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed mb-4">{feature.description}</p>
                  <div className="inline-block bg-[#c5a572]/20 text-[#c5a572] px-4 py-2 rounded-lg font-semibold text-sm">
                    {feature.highlight}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final Premium */}
        <section className="py-20 px-6 bg-gradient-to-r from-[#162238]/80 to-[#1E3253]/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Prêt pour l'Excellence ?
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
                Rejoignez l'élite des conseillers patrimoniaux qui révolutionnent leur pratique avec Francis.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/andorre/login')}
                className="group bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-12 py-6 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-4"
              >
                Commencer avec Francis Andorre
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
              
              <p className="text-sm text-gray-400 mt-6">
                Démarrage immédiat • Support expert inclus • Satisfait ou remboursé
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer Premium */}
      <footer className="relative z-20 bg-[#0A0F1C]/90 backdrop-blur-xl border-t border-[#c5a572]/20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <MessageSquare className="h-8 w-8 text-[#c5a572]" />
              <Euro className="h-5 w-5 text-[#c5a572] absolute -bottom-1 -right-1 bg-[#0A0F1C] rounded-full p-0.5" />
            </div>
            <span className="text-xl font-bold text-white">Francis Andorre</span>
          </div>
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Francis. Excellence fiscale garantie.</p>
        </div>
      </footer>
    </div>
  );
};

export default AndorreLandingPage;
