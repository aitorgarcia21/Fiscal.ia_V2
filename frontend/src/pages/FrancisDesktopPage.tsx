import React from 'react';
import { Monitor, Download, Check, Users, Shield, Zap } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

export function FrancisDesktopPage() {
  const downloadOptions = [
    {
      name: 'Développement Local',
      description: 'Cloner le dépôt et lancer Francis Desktop localement',
      icon: '🛠️',
      action: 'local',
      recommended: true
    },
    {
      name: 'Téléchargement Direct', 
      description: 'Contactez votre administrateur pour obtenir le fichier .dmg',
      icon: '📧',
      action: 'contact'
    },
    {
      name: 'Extension Chrome',
      description: 'Alternative web qui fonctionne dans votre navigateur',
      icon: '🌐', 
      action: 'extension'
    }
  ];

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-[#c5a572]" />,
      title: 'Assistant IA Toujours Disponible',
      description: 'Francis reste accessible en popup overlay pour une assistance instantanée'
    },
    {
      icon: <Shield className="h-6 w-6 text-[#c5a572]" />,
      title: 'Connecté à Votre Compte',
      description: 'Synchronisation automatique avec vos données et clients existants'
    },
    {
      icon: <Users className="h-6 w-6 text-[#c5a572]" />,
      title: 'Remplissage Automatique',
      description: 'Auto-complétion des formulaires clients depuis n\'importe quelle application'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#162238] to-[#0A192F]">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <div>
                <h1 className="text-xl font-bold text-white">Francis Desktop</h1>
                <p className="text-sm text-gray-400">Assistant IA pour Mac</p>
              </div>
            </div>
            <a
              href="/"
              className="text-[#c5a572] hover:text-white transition-colors"
            >
              ← Retour au site
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Monitor className="h-24 w-24 text-[#c5a572]" />
              <div className="absolute -top-2 -right-2 bg-[#c5a572] rounded-full p-2">
                <Logo size="sm" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-6">
            Francis Desktop
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            L'assistant IA Francis maintenant disponible directement sur votre Mac. 
            Popup overlay intelligent, connecté à votre compte, avec remplissage automatique.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-[#1a2332] px-4 py-2 rounded-lg">
              <Check className="h-5 w-5 text-[#c5a572]" />
              <span className="text-white">Compatible macOS 10.12+</span>
            </div>
            <div className="flex items-center gap-2 bg-[#1a2332] px-4 py-2 rounded-lg">
              <Check className="h-5 w-5 text-[#c5a572]" />
              <span className="text-white">Installation en 1 clic</span>
            </div>
            <div className="flex items-center gap-2 bg-[#1a2332] px-4 py-2 rounded-lg">
              <Check className="h-5 w-5 text-[#c5a572]" />
              <span className="text-white">Gratuit pour utilisateurs Pro</span>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="bg-[#1a2332] rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Télécharger Francis Desktop
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {downloadOptions.map((option, index) => {
              const handleAction = () => {
                switch (option.action) {
                  case 'local':
                    window.open('https://github.com/aitorgarcia21/Fiscal.ia_V2/tree/main/desktop-app', '_blank');
                    break;
                  case 'contact':
                    window.location.href = 'mailto:contact@fiscal-ia.net?subject=Francis Desktop - Demande de téléchargement';
                    break;
                  case 'extension':
                    // Rediriger vers la page d'extension Chrome
                    window.location.href = '/download';
                    break;
                }
              };
              
              return (
                <div
                  key={index}
                  className={`relative bg-[#0A192F] rounded-xl p-6 border-2 transition-all hover:scale-105 ${
                    option.recommended 
                      ? 'border-[#c5a572] ring-2 ring-[#c5a572]/20' 
                      : 'border-gray-700 hover:border-[#c5a572]/50'
                  }`}
                >
                  {option.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#c5a572] text-[#0A192F] px-3 py-1 rounded-full text-sm font-semibold">
                        Recommandé
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-4xl mb-4">{option.icon}</div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {option.name}
                    </h3>
                    <p className="text-gray-400 mb-6 text-sm">{option.description}</p>
                    
                    <button
                      onClick={handleAction}
                      className="inline-flex items-center gap-2 bg-[#c5a572] text-[#0A192F] px-6 py-3 rounded-lg font-semibold hover:bg-[#d4b584] transition-colors w-full justify-center"
                    >
                      <Download className="h-5 w-5" />
                      {option.action === 'local' ? 'Ouvrir GitHub' : option.action === 'contact' ? 'Contacter' : 'Accéder'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              💡 <strong>Astuce :</strong> Choisissez la version Apple Silicon si vous avez un Mac M1, M2 ou M3.
              Sinon, utilisez la version Intel.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Fonctionnalités Principales
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#1a2332] rounded-xl p-6 text-center hover:bg-[#1e2937] transition-colors"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="bg-[#1a2332] rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Installation
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#c5a572] rounded-full flex items-center justify-center text-[#0A192F] font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Téléchargez le fichier .dmg
                  </h3>
                  <p className="text-gray-400">
                    Cliquez sur le bouton de téléchargement correspondant à votre Mac.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#c5a572] rounded-full flex items-center justify-center text-[#0A192F] font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Ouvrez le fichier téléchargé
                  </h3>
                  <p className="text-gray-400">
                    Double-cliquez sur le fichier .dmg dans votre dossier Téléchargements.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#c5a572] rounded-full flex items-center justify-center text-[#0A192F] font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Glissez Francis dans Applications
                  </h3>
                  <p className="text-gray-400">
                    Faites glisser l'icône Francis vers le dossier Applications.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#c5a572] rounded-full flex items-center justify-center text-[#0A192F] font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Lancez Francis Desktop
                  </h3>
                  <p className="text-gray-400">
                    Trouvez Francis dans vos Applications et lancez-le. Le popup apparaîtra dans le coin supérieur droit !
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
