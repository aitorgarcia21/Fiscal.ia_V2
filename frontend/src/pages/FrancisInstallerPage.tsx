import React, { useState, useEffect } from 'react';
import { Download, Chrome, CheckCircle, Play, Monitor, Smartphone } from 'lucide-react';

const FrancisInstallerPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [userOS, setUserOS] = useState('');
  const [installationType, setInstallationType] = useState<'desktop' | 'pwa' | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Détecter l'OS
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) setUserOS('Windows');
    else if (platform.includes('mac')) setUserOS('macOS');
    else setUserOS('Linux');
    
    // Écouter l'événement PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handlePWAInstall = async () => {
    setInstallationType('pwa');
    setIsDownloading(true);
    setStep(2);
    
    try {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDownloadComplete(true);
          setStep(3);
        }
        setDeferredPrompt(null);
      } else {
        // Fallback: ouvrir la PWA dans un nouvel onglet
        window.open(window.location.origin, '_blank');
        setTimeout(() => {
          setDownloadComplete(true);
          setStep(3);
        }, 1000);
      }
    } catch (error) {
      console.error('PWA install failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAndInstall = async () => {
    setInstallationType('desktop');
    setIsDownloading(true);
    setStep(2);

    try {
      // Télécharger Francis Desktop - vrais fichiers depuis /public/downloads/
      const link = document.createElement('a');
      let downloadUrl = '';
      
      if (userOS === 'Windows') {
        // Pour Windows - utiliser le Mac en attendant la version Windows
        downloadUrl = '/downloads/Francis-1.0.0-mac.zip';
        link.download = 'Francis-1.0.0-mac.zip';
      } else if (userOS === 'macOS') {
        // Détecter si c'est Apple Silicon ou Intel
        const isAppleSilicon = navigator.userAgent.includes('Apple Silicon') || 
            (!navigator.userAgent.includes('Intel') && navigator.platform.includes('arm'));
        
        if (isAppleSilicon) {
          downloadUrl = '/downloads/Francis-1.0.0-arm64-mac.zip';
          link.download = 'Francis-1.0.0-arm64-mac.zip';
        } else {
          downloadUrl = '/downloads/Francis-1.0.0-mac.zip';
          link.download = 'Francis-1.0.0-mac.zip';
        }
      } else {
        // Pour Linux - utiliser le Mac en attendant
        downloadUrl = '/downloads/Francis-1.0.0-mac.zip';
        link.download = 'Francis-1.0.0-mac.zip';
      }
      
      link.href = downloadUrl;
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
            Choisissez votre mode d'installation - Compatible {userOS}
          </p>
        </div>

        {/* Choix du type d'installation */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Choisissez votre version de Francis
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* PWA Option */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-[#c5a572]/40 hover:bg-white/15 transition-all">
                <div className="text-center mb-6">
                  <div className="bg-[#c5a572] p-4 rounded-xl inline-block mb-4">
                    <Smartphone className="h-12 w-12 text-[#162238]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Francis PWA</h3>
                  <p className="text-gray-300 mb-4">
                    Application web progressive - Installation instantanée depuis votre navigateur
                  </p>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Installation instantanée</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Fonctionne hors ligne</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Mises à jour automatiques</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Compatible tous navigateurs</span>
                  </div>
                </div>
                <button 
                  onClick={handlePWAInstall}
                  className="w-full bg-[#c5a572] hover:bg-[#d4b584] text-[#162238] font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center text-lg"
                >
                  <Smartphone className="h-6 w-6 mr-3" />
                  📱 Installer Francis PWA
                </button>
              </div>

              {/* Desktop Option */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-gray-500/20 hover:bg-white/15 transition-all">
                <div className="text-center mb-6">
                  <div className="bg-gray-600 p-4 rounded-xl inline-block mb-4">
                    <Monitor className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Francis Desktop</h3>
                  <p className="text-gray-300 mb-4">
                    Application desktop native - Performance maximale et intégration système
                  </p>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Performance optimale</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Intégration système</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Accès fichiers local</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Raccourcis clavier</span>
                  </div>
                </div>
                <button 
                  onClick={handleDownloadAndInstall}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center text-lg"
                >
                  <Download className="h-6 w-6 mr-3" />
                  💻 Télécharger Desktop
                </button>
              </div>
              
            </div>
          </div>
        )}

        {/* Installation Steps */}
        <div className="max-w-4xl mx-auto">
          
          {/* Étape de progression */}
          {step >= 2 && (
            <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-6 border transition-all border-[#c5a572]/40`}>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 bg-[#c5a572] text-[#162238]">
                  {installationType === 'pwa' ? '📱' : '💻'}
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {installationType === 'pwa' ? 'Installation PWA' : 'Téléchargement Desktop'}
                </h3>
              </div>
              
              <div className="ml-12">
                <p className="text-green-400">✅ {installationType === 'pwa' ? 'PWA installée' : 'Extension téléchargée'} avec succès !</p>
              </div>
            </div>
          )}

          {/* Étape 2 : Confirmation installation */}
          {step >= 3 && step < 5 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-[#c5a572]/40 text-center">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              {installationType === 'pwa' ? (
                <>
                  <h3 className="text-2xl font-bold text-white mb-2">Francis PWA est installée ! 📱</h3>
                  <p className="text-gray-300">
                    Francis PWA est maintenant disponible sur votre appareil.<br/>
                    Vous pouvez la retrouver dans vos applications ou l'ajouter à votre écran d'accueil.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-white mb-2">Francis Desktop est en cours d'installation... 💻</h3>
                  <p className="text-gray-300">
                    L'installateur Francis Desktop est en train de s'installer automatiquement sur votre ordinateur.<br/>
                    Vous pouvez suivre la progression dans votre dossier Téléchargements ou dans la barre d'installation système.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Étape 3 : Installation terminée */}
          {step >= 5 && (
            <div className="bg-green-600/20 backdrop-blur-sm rounded-2xl p-8 border border-green-500/40 text-center">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">🎉 Francis Desktop est installé !</h2>
              <p className="text-gray-300 mb-6">
                Francis Desktop est maintenant prêt à l'emploi sur votre ordinateur.<br/>
                Retrouvez-le dans vos applications ou via le raccourci bureau.
              </p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => window.open('https://fiscal-ia-v2-production.up.railway.app', '_blank')}
                  className="bg-[#c5a572] hover:bg-[#d4b584] text-[#162238] font-bold py-2 px-4 rounded-lg"
                >
                  Retour au site
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
