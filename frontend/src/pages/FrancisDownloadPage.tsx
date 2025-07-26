import React from 'react';
import { Download, Monitor, Smartphone, Globe, Shield, Zap, Users, Star } from 'lucide-react';
import { getDownloadLink } from '../utils/osDetector';

const FrancisDownloadPage: React.FC = () => {
  const handleDownload = (os: string) => {
    if (os === 'francis-setup') {
      // Téléchargement FrancisSetup.exe - Installation universelle en 1 clic
      const link = document.createElement('a');
      link.href = '/downloads/francis-setup';
      link.download = 'FrancisSetup.exe';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Message informatif
      setTimeout(() => {
        alert('🚀 FrancisSetup.exe téléchargé !\n\n⚡ Installation en 1 clic :\n1. Lancez FrancisSetup.exe\n2. Suivez les instructions (automatique)\n3. Francis s\'installera dans votre navigateur\n\n🎯 Francis apparaîtra sur TOUTES vos pages web !\n\n✅ Zéro mode développeur\n✅ Zéro configuration\n✅ Compatible Windows, Mac, Linux\n\n🎉 Assistant CGP universel prêt à l\'emploi !');
      }, 500);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#162238] to-[#0A192F]">
      {/* Header avec logo Francis */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-[#c5a572] p-4 rounded-xl mr-4">
              <Monitor className="h-12 w-12 text-[#162238]" />
            </div>
            <h1 className="text-5xl font-bold text-white">
              Télécharger <span className="text-[#c5a572]">Francis</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            L'assistant IA fiscal le plus puissant au monde, maintenant disponible 
            comme extension universelle pour tous vos navigateurs !
          </p>
        </div>

        {/* Installation Francis - Un seul bouton universel */}
        <div className="flex justify-center mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-[#c5a572]/20 hover:border-[#c5a572]/40 transition-all max-w-2xl">
            <div className="text-center">
              <div className="bg-[#c5a572]/20 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8">
                <Download className="h-16 w-16 text-[#c5a572]" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-6">Installation Universelle</h3>
              <p className="text-xl text-gray-300 mb-8">Compatible Windows • Mac • Linux • Tous navigateurs</p>
              <button 
                onClick={() => handleDownload('francis-setup')}
                className="w-full bg-[#c5a572] hover:bg-[#d4b584] text-[#162238] font-bold py-6 px-12 rounded-xl transition-colors flex items-center justify-center cursor-pointer text-2xl"
              >
                <Download className="h-8 w-8 mr-4" />
                🔽 Installer Francis (1 clic)
              </button>
              <p className="text-lg text-gray-400 mt-4">Version 1.0.0 - Installation automatique - Zéro configuration</p>
              <p className="text-sm text-gray-500 mt-2">✅ Aucun mode développeur • ✅ Aucune configuration • ✅ Fonctionne immédiatement</p>
            </div>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-[#c5a572]/20">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Pourquoi Francis Desktop ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#c5a572]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-[#c5a572]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Performance Native</h3>
              <p className="text-gray-300">
                Plus rapide que les extensions navigateur, optimisé pour votre OS
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#c5a572]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-[#c5a572]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Sécurité Maximale</h3>
              <p className="text-gray-300">
                Isolation complète, chiffrement AES-256, conformité RGPD
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#c5a572]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-[#c5a572]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Toujours Disponible</h3>
              <p className="text-gray-300">
                Accessible depuis votre bureau, barre des tâches, raccourcis
              </p>
            </div>
          </div>
        </div>

        {/* Installation */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-[#c5a572]/20">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Installation Ultra-Simple
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#c5a572] text-[#162238] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Télécharger</h3>
              <p className="text-gray-300">
                Cliquez sur le bouton de votre OS ci-dessus
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#c5a572] text-[#162238] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Installer</h3>
              <p className="text-gray-300">
                Double-clic sur le fichier téléchargé et suivez l'assistant
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#c5a572] text-[#162238] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Utiliser</h3>
              <p className="text-gray-300">
                Francis apparaît sur votre bureau, prêt à révolutionner votre travail !
              </p>
            </div>
          </div>
        </div>

        {/* Témoignages */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-[#c5a572]/20">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Ils utilisent Francis Desktop
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-[#c5a572] mr-3" />
                <div>
                  <h4 className="text-white font-bold">Marie Dubois</h4>
                  <p className="text-gray-400 text-sm">CGP, Paris</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-[#c5a572] fill-current" />
                ))}
              </div>
              <p className="text-gray-300">
                "Francis Desktop a transformé ma pratique ! Plus rapide, plus sûr, 
                toujours accessible. Mes clients sont impressionnés !"
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-[#c5a572] mr-3" />
                <div>
                  <h4 className="text-white font-bold">Pierre Martin</h4>
                  <p className="text-gray-400 text-sm">Expert-Comptable, Lyon</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-[#c5a572] fill-current" />
                ))}
              </div>
              <p className="text-gray-300">
                "Enfin un outil fiscal IA vraiment professionnel ! L'app desktop 
                est un game-changer pour notre cabinet."
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Prêt à révolutionner votre pratique ?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Rejoignez des milliers de professionnels qui font confiance à Francis !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                const userAgent = navigator.userAgent.toLowerCase();
                let os = 'windows'; // défaut
                if (userAgent.includes('mac')) os = 'macos';
                else if (userAgent.includes('linux')) os = 'linux';
                handleDownload(os);
              }}
              className="bg-[#c5a572] hover:bg-[#d4b584] text-[#162238] font-bold py-4 px-8 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
            >
              <Download className="h-5 w-5 mr-2" />
              Télécharger Maintenant
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl transition-colors border border-[#c5a572]/30">
              Voir la Démo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrancisDownloadPage;
