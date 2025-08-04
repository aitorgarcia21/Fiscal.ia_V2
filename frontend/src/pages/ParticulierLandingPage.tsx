import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Home, PiggyBank, Calculator, Shield, Users, MessageSquare, Euro, ChevronDown, Building, Crown } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
// import { SimpleCategorySwitcher } from '../components/ui/SimpleCategorySwitcher';
// import { TestClickButton } from '../components/ui/TestClickButton';

export const ParticulierLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const features = [
    {
      icon: Calculator,
      title: "Optimisation fiscale personnelle",
      description: "Réduisez vos impôts légalement avec nos conseils personnalisés"
    },

    {
      icon: PiggyBank,
      title: "Épargne et placements",
      description: "Optimisez votre épargne avec les meilleurs placements"
    },
    {
      icon: Shield,
      title: "Protection du patrimoine",
      description: "Sécurisez et transmettez votre patrimoine efficacement"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] text-gray-100">
      {/* <TestClickButton /> */}
      {/* Header */}
      <header className="bg-[#162238]/90 backdrop-blur-lg border-b border-[#2A3F6C]/50 shadow-lg">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Logo size="lg" showText={true} />

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/particulier/login')}
              className="text-gray-300 hover:text-[#c5a572] transition-colors font-medium"
            >
              Connexion
            </button>
            <button
              onClick={() => navigate('/particulier/signup')}
              className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl shadow-lg hover:shadow-[#c5a572]/30 hover:scale-105 transition-all duration-300"
            >
              Inscription
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Francis
                <span className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-transparent bg-clip-text ml-3">
                  Particulier
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Votre assistant personnel pour optimiser votre fiscalité et faire grandir votre patrimoine
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
                <button
                  onClick={() => navigate('/particulier/signup')}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-[#c5a572]/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => navigate('/particulier/login')}
                  className="w-full sm:w-auto px-8 py-4 border-2 border-[#c5a572] text-[#c5a572] font-bold text-lg rounded-xl hover:bg-[#c5a572] hover:text-[#162238] transition-all duration-300 text-center"
                >
                  Se connecter
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#0A0F1C]/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tout ce dont vous avez besoin pour
              <span className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-transparent bg-clip-text ml-2">
                optimiser vos finances
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Des outils simples et efficaces pour gérer votre patrimoine personnel
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-gradient-to-br from-[#162238]/80 to-[#1E3253]/80 backdrop-blur-xl p-6 rounded-2xl border border-[#c5a572]/20 hover:border-[#c5a572]/40 transition-all duration-300 group hover:transform hover:-translate-y-2"
              >
                <div className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-[#162238]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#c5a572] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Users className="w-16 h-16 text-[#c5a572] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Rejoignez des milliers de particuliers qui optimisent leurs finances
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Commencez dès aujourd'hui et découvrez tout le potentiel de votre patrimoine
            </p>
            
            <button
              onClick={() => navigate('/particulier/signup')}
              className="px-10 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-bold text-xl rounded-xl hover:shadow-2xl hover:shadow-[#c5a572]/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 mx-auto"
            >
              Créer mon compte gratuit
              <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] border-t border-[#c5a572]/20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 Francis Particulier. Votre assistant personnel en gestion de patrimoine.
          </p>
        </div>
      </footer>
    </div>
  );
};
