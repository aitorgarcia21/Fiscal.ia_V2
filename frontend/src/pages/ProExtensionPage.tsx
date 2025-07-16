import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Zap, Download, CheckCircle, ArrowRight, Shield, Users, Brain, Clock, Globe2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const installationSteps = [
  {
    step: "01",
    title: "Téléchargez Francis",
    description: "Cliquez sur le bouton d'installation automatique ci-dessous",
    icon: Download,
    color: "from-[#c5a572] to-[#e8cfa0]"
  },
  {
    step: "02", 
    title: "Autorisez l'installation",
    description: "Chrome vous demandera d'autoriser l'extension. Cliquez sur 'Ajouter'",
    icon: Shield,
    color: "from-[#c5a572] to-[#e8cfa0]"
  },
  {
    step: "03",
    title: "Ouvrez Microsoft Teams",
    description: "Francis apparaîtra automatiquement dans vos réunions Teams",
    icon: Users,
    color: "from-[#c5a572] to-[#e8cfa0]"
  },
  {
    step: "04",
    title: "Commencez à utiliser Francis",
    description: "Francis écoute et analyse automatiquement vos conversations",
    icon: Brain,
    color: "from-[#c5a572] to-[#e8cfa0]"
  }
];

const features = [
  {
    icon: Clock,
    title: "Installation en 30 secondes",
    description: "Francis s'installe automatiquement sans configuration complexe"
  },
  {
    icon: Shield,
    title: "100% sécurisé",
    description: "Vos données restent privées et conformes au RGPD"
  },
  {
    icon: Globe2,
    title: "Compatible partout",
    description: "Fonctionne sur Windows, macOS et Linux avec Chrome"
  },
  {
    icon: Brain,
    title: "IA intelligente",
    description: "Francis comprend et analyse vos conversations en temps réel"
  }
];

export function ProExtensionPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isProfessional } = useAuth();

  const handleInstallAutomatic = () => {
    window.open('/chrome_extension/install-super-simple.html', '_blank');
  };

  const handleDownloadManual = () => {
    window.open('/chrome_extension/francis-teams-automatic.zip', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#234876] to-[#162238] text-gray-100">
      {/* Header */}
      <header className="bg-[#162238]/90 backdrop-blur-lg border-b border-[#2A3F6C]/50 shadow-lg">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/pro')}>
            <div className="relative inline-flex items-center justify-center">
              <Monitor className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
            </div>
            <span className="text-xl font-bold text-white">Francis Extension</span>
          </div>
          
          <button
            onClick={() => navigate('/pro')}
            className="text-gray-300 hover:text-[#c5a572] transition-colors font-medium"
          >
            Retour au Dashboard
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Monitor className="h-12 w-12 text-[#162238]" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
            Installez <span className="text-[#c5a572]">Francis</span> sur votre PC
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Francis s'intègre parfaitement à Microsoft Teams et analyse automatiquement vos conversations 
            pour générer des rapports fiscaux professionnels en temps réel.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleInstallAutomatic}
              className="px-8 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-xl text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-3"
            >
              <Zap className="h-5 w-5" />
              ⚡ Installation Automatique
            </button>
            
            <button
              onClick={handleDownloadManual}
              className="px-8 py-4 border-2 border-[#c5a572] text-[#c5a572] rounded-xl text-lg font-semibold hover:bg-[#c5a572]/10 transition-all duration-300 flex items-center gap-3"
            >
              <Download className="h-5 w-5" />
              📦 Téléchargement Manuel
            </button>
          </div>
        </div>

        {/* Étapes d'installation */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Installation en 4 étapes simples
            </h2>
            <p className="text-xl text-gray-300">
              Francis s'installe automatiquement en moins d'une minute
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {installationSteps.map((step, index) => (
              <div key={index} className="group relative">
                <div className="bg-gradient-to-br from-[#1E3253]/80 to-[#2A3F6C]/80 backdrop-blur-sm p-8 rounded-2xl border border-[#2A3F6C]/30 hover:border-[#c5a572]/50 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#c5a572]/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center text-[#162238] font-bold text-lg shadow-lg`}>
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#c5a572] transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-[#c5a572]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fonctionnalités */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pourquoi choisir Francis ?
            </h2>
            <p className="text-xl text-gray-300">
              Une extension intelligente qui révolutionne votre travail
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#1E3253]/60 backdrop-blur-sm p-6 rounded-xl border border-[#2A3F6C]/30 hover:border-[#c5a572]/40 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-[#162238]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Compatibilité */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-[#1E3253]/80 to-[#2A3F6C]/80 backdrop-blur-sm p-8 rounded-2xl border border-[#c5a572]/30">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Compatibilité garantie
              </h3>
              <p className="text-gray-300">
                Francis fonctionne sur tous vos appareils
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💻</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Windows</h4>
                <p className="text-gray-300 text-sm">Windows 10 et 11</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🍎</span>
                </div>
                <h4 className="text-white font-semibold mb-2">macOS</h4>
                <p className="text-gray-300 text-sm">macOS 10.15 et plus</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🐧</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Linux</h4>
                <p className="text-gray-300 text-sm">Ubuntu, Debian, etc.</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-2 bg-[#c5a572]/20 border border-[#c5a572]/30 rounded-full px-6 py-3">
                <CheckCircle className="h-5 w-5 text-[#c5a572]" />
                <span className="text-[#c5a572] font-semibold">Nécessite Google Chrome</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-[#1E3253]/80 to-[#2A3F6C]/80 backdrop-blur-sm p-8 rounded-2xl border border-[#c5a572]/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              Prêt à transformer votre façon de travailler ?
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Rejoignez les professionnels qui automatisent leur analyse fiscale avec Francis.
            </p>
            <button
              onClick={handleInstallAutomatic}
              className="px-10 py-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-xl text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <Zap className="h-5 w-5" />
              Installer Francis Maintenant
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProExtensionPage; 