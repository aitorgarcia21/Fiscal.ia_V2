import React, { useState, useEffect } from 'react';
import { Download, Chrome, CheckCircle, Play, Monitor } from 'lucide-react';

const FrancisInstallerPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [userOS, setUserOS] = useState('');

  useEffect(() => {
    // Détecter l'OS
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) setUserOS('Windows');
    else if (platform.includes('mac')) setUserOS('macOS');
    else setUserOS('Linux');
  }, []);

  const handleDownloadAndInstall = async () => {
    setIsDownloading(true);
    setStep(2);

    try {
      // Télécharger l'extension
      const link = document.createElement('a');
      link.href = '/downloads/francis-chrome-extension';
      link.download = 'francis-chrome-extension-v1.1.0.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Simuler le téléchargement
      setTimeout(() => {
        setDownloadComplete(true);
        setStep(3);
        setIsDownloading(false);
      }, 2000);

    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
    }
  };

  const openChromeExtensions = () => {
    // Ouvrir chrome://extensions/ dans un nouvel onglet
    window.open('chrome://extensions/', '_blank');
    setStep(4);
  };

  const completeInstallation = () => {
    setStep(5);
    // Optionnel : ouvrir une page de test
    setTimeout(() => {
      window.open('https://www.google.com', '_blank');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#162238] to-[#0A192F]">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-[#c5a572] p-4 rounded-xl mr-4">
              <Chrome className="h-12 w-12 text-[#162238]" />
            </div>
            <h1 className="text-5xl font-bold text-white">
              Installer <span className="text-[#c5a572]">Francis</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Installation guidée en 3 étapes - Compatible {userOS}
          </p>
        </div>

        {/* Installation Steps */}
        <div className="max-w-4xl mx-auto">
          
          {/* Étape 1: Téléchargement */}
          <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-6 border transition-all ${
            step >= 1 ? 'border-[#c5a572]/40' : 'border-gray-500/20'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                step >= 2 ? 'bg-green-500' : step === 1 ? 'bg-[#c5a572]' : 'bg-gray-500'
              }`}>
                {step >= 2 ? <CheckCircle className="h-5 w-5 text-white" /> : <span className="text-white font-bold">1</span>}
              </div>
              <h3 className="text-2xl font-bold text-white">Télécharger Francis</h3>
            </div>
            
            {step === 1 && (
              <div className="ml-12">
                <p className="text-gray-300 mb-6">Cliquez pour télécharger et démarrer l'installation automatique</p>
                <button
                  onClick={handleDownloadAndInstall}
                  disabled={isDownloading}
                  className="bg-[#c5a572] hover:bg-[#d4b584] text-[#162238] font-bold py-4 px-8 rounded-xl transition-colors flex items-center text-xl"
                >
                  <Download className="h-6 w-6 mr-3" />
                  {isDownloading ? 'Téléchargement...' : '🔽 Installer Francis (1 clic)'}
                </button>
              </div>
            )}
            
            {step >= 2 && (
              <div className="ml-12">
                <p className="text-green-400">✅ Extension téléchargée avec succès !</p>
              </div>
            )}
          </div>

          {/* Étape 2: Ouvrir Chrome Extensions */}
          {step >= 3 && (
            <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-6 border transition-all ${
              step >= 4 ? 'border-[#c5a572]/40' : 'border-gray-500/20'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                  step >= 4 ? 'bg-green-500' : 'bg-[#c5a572]'
                }`}>
                  {step >= 4 ? <CheckCircle className="h-5 w-5 text-white" /> : <span className="text-white font-bold">2</span>}
                </div>
                <h3 className="text-2xl font-bold text-white">Ouvrir les Extensions Chrome</h3>
              </div>
              
              <div className="ml-12">
                <p className="text-gray-300 mb-6">Ouvrez la page des extensions Chrome pour continuer</p>
                <button
                  onClick={openChromeExtensions}
                  className="bg-[#c5a572] hover:bg-[#d4b584] text-[#162238] font-bold py-3 px-6 rounded-xl transition-colors flex items-center"
                >
                  <Chrome className="h-5 w-5 mr-2" />
                  Ouvrir chrome://extensions/
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Installation finale */}
          {step >= 4 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-[#c5a572]/40">
              <div className="flex items-center mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                  step >= 5 ? 'bg-green-500' : 'bg-[#c5a572]'
                }`}>
                  {step >= 5 ? <CheckCircle className="h-5 w-5 text-white" /> : <span className="text-white font-bold">3</span>}
                </div>
                <h3 className="text-2xl font-bold text-white">Installer l'Extension</h3>
              </div>
              
              <div className="ml-12">
                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                  <p className="text-yellow-400 font-bold mb-2">📋 Instructions rapides :</p>
                  <ol className="text-gray-300 space-y-1">
                    <li>1. Activez le "Mode développeur" (en haut à droite)</li>
                    <li>2. Cliquez "Charger l'extension non empaquetée"</li>
                    <li>3. Sélectionnez le dossier décompressé "francis-extension"</li>
                    <li>4. Francis apparaît immédiatement !</li>
                  </ol>
                </div>
                
                <button
                  onClick={completeInstallation}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Installation terminée !
                </button>
              </div>
            </div>
          )}

          {/* Étape 4: Succès */}
          {step >= 5 && (
            <div className="bg-green-600/20 backdrop-blur-sm rounded-2xl p-8 border border-green-500/40 text-center">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">🎉 Francis est installé !</h2>
              <p className="text-gray-300 mb-6">
                Francis apparaît maintenant sur toutes vos pages web. Recherchez le bouton Francis sur vos sites CRM !
              </p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => window.open('https://www.salesforce.com', '_blank')}
                  className="bg-[#c5a572] hover:bg-[#d4b584] text-[#162238] font-bold py-2 px-4 rounded-lg"
                >
                  Tester sur Salesforce
                </button>
                <button 
                  onClick={() => window.open('https://fiscal-ia-v2-production.up.railway.app', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Retour à Fiscal.ia
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default FrancisInstallerPage;
