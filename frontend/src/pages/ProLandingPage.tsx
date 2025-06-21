import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Euro, Briefcase, FileText, Zap, ShieldCheck, Users, TrendingUp, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProDemoSection } from '../components/demo/ProDemoSection';

const features = [
  {
    icon: Briefcase,
    title: "Performance Client x10",
    description: "Intelligence prédictive qui identifie automatiquement 40+ optimisations par dossier. Résultats garantis en 72h."
  },
  {
    icon: FileText,
    title: "Génération d'Alpha",
    description: "Stratégies exclusives que vos concurrents n'ont pas. Algorithmes propriétaires basés sur 50M de déclarations."
  },
  {
    icon: Zap,
    title: "Vitesse d'Exécution",
    description: "Ce qui vous prenait 3 semaines, Francis le fait en 3 minutes. Productivité décuplée, marges explosées."
  },
  {
    icon: ShieldCheck,
    title: "Domination de Marché",
    description: "Devenez le référent fiscal de votre région. Vos clients vous recommandent, votre cabinet grandit."
  }
];

const ProLandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isProfessional, isLoadingAuth } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100">
      {/* Header */}
      <header className="bg-[#162238]/95 backdrop-blur-lg border-b border-[#2A3F6C]/50 shadow-lg">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative inline-flex items-center justify-center group">
              <MessageSquare className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
              <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
            </div>
            <span className="text-lg font-semibold text-gray-300 ml-2">Pro</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#demo" className="text-gray-300 hover:text-[#c5a572] transition-colors">Démo</a>
            <a href="#features" className="text-gray-300 hover:text-[#c5a572] transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="text-gray-300 hover:text-[#c5a572] transition-colors">Tarifs</a>
            <a href="#contact" className="text-gray-300 hover:text-[#c5a572] transition-colors">Contact</a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {!isLoadingAuth && (
              <>
                {!isAuthenticated || !isProfessional ? (
                  <>
                    <button
                      onClick={() => navigate('/signup')}
                      className="text-gray-300 hover:text-[#c5a572] transition-colors"
                    >
                      Connexion Pro
                    </button>
                    <button
                      onClick={() => navigate('/signup')}
                      className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-4 py-2 rounded-lg hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all duration-300 font-semibold"
                    >
                      Inscription Pro
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/pro/dashboard')}
                    className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-4 py-2 rounded-lg hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all duration-300 font-semibold"
                  >
                    Dashboard Pro
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-200 to-white">Multipliez vos résultats.</span>
          <span className="block text-[#c5a572] mt-2">Révolutionnez votre pratique.</span>
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          <strong className="text-white">10x plus efficace.</strong> Transformez votre cabinet en machine à performance avec l'IA fiscale la plus avancée du marché. <strong className="text-[#c5a572]">Vos clients économisent plus. Vous gagnez plus.</strong>
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-20">
          <button
            onClick={() => navigate('/pro/dashboard')}
            className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-4 rounded-xl text-lg font-semibold hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Accéder au Dashboard
          </button>
          <button
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-2 border-[#c5a572] text-[#c5a572] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#c5a572] hover:text-[#162238] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Voir Francis en Action
          </button>
        </div>

        {/* Badge Beta */}
        <div className="flex justify-center mb-20">
          <div className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-4 rounded-full border-2 border-[#c5a572]/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#162238] rounded-full animate-pulse"></div>
              <span className="text-lg font-bold">VERSION BETA - ACCÈS ANTICIPÉ</span>
              <div className="w-3 h-3 bg-[#162238] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Démo Interactive Section */}
      <section id="demo">
        <ProDemoSection />
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Votre Avantage Concurrentiel
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Pendant que vos concurrents travaillent, <strong className="text-[#c5a572]">vous dominez</strong>. L'arme secrète des cabinets qui cartonnent.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-xl border border-[#2A3F6C]/50 hover:border-[#c5a572]/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <feature.icon className="h-12 w-12 text-[#c5a572] mb-6 mx-auto" />
                <h3 className="text-xl font-semibold text-white mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-300 text-center text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Tarifs Pro */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
          Tarifs <span className="text-[#c5a572]">Pro</span>
        </h2>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto text-center">
          Des tarifs adaptés aux professionnels. <strong className="text-[#c5a572]">Accès anticipé exclusif.</strong>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Pro 20 */}
          <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-xl border border-[#2A3F6C]/50 hover:border-[#c5a572]/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Pro 20</h3>
              <p className="text-gray-300 mb-6">Pour débuter avec Francis</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c5a572]">49€</span>
                <span className="text-gray-300">/mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3 flex-shrink-0" />
                  Jusqu'à 20 clients
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3 flex-shrink-0" />
                  Analyses fiscales illimitées
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3 flex-shrink-0" />
                  Tableaux de bord client
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3 flex-shrink-0" />
                  Support email
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3 flex-shrink-0" />
                  Accès anticipé Beta
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-3 rounded-xl font-semibold hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all duration-300">
                Commencer
              </button>
            </div>
          </div>

          {/* Pro 50 - Populaire */}
          <div className="bg-[#1E3253]/60 backdrop-blur-sm p-8 rounded-xl border-2 border-[#c5a572] hover:border-[#c5a572]/80 transition-all duration-300 hover:transform hover:scale-105 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-2 rounded-full text-sm font-bold">
              LE PLUS POPULAIRE
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Pro 50</h3>
              <p className="text-gray-300 mb-6">Pour développer votre cabinet</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c5a572]">99€</span>
                <span className="text-gray-300">/mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3 flex-shrink-0" />
                  Jusqu'à 50 clients
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3 flex-shrink-0" />
                  Tout du plan Pro 20
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3 flex-shrink-0" />
                  API intégration cabinet
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3 flex-shrink-0" />
                  Support prioritaire
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-[#c5a572] mr-3 flex-shrink-0" />
                  Formation Francis incluse
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-3 rounded-xl font-semibold hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all duration-300">
                Commencer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à transformer votre cabinet ?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Contactez-nous pour découvrir comment Francis Pro peut révolutionner votre pratique fiscale.
          </p>
          <button
            onClick={() => navigate('/contact-pro')}
            className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-8 py-4 rounded-xl text-lg font-semibold hover:from-[#e8cfa0] hover:to-[#c5a572] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Planifier une Démo Personnalisée
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#162238]/95 border-t border-[#2A3F6C]/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-300">
            <p>&copy; 2024 Fiscal.ia Pro. Tous droits réservés.</p>
            <p className="text-sm mt-2">
              Francis est conforme à la réglementation fiscale française et respecte les standards de sécurité bancaire.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProLandingPage;