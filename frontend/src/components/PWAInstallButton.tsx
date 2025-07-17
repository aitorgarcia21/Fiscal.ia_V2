import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, X } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  forceShow?: boolean; // Nouvelle prop pour forcer l'affichage
}

export function PWAInstallButton({ className = '', forceShow = false }: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Si pas de prompt disponible, afficher un message d'aide
      alert('Pour installer Francis, utilisez le menu de votre navigateur (⋮) et sélectionnez "Ajouter à l\'écran d\'accueil"');
      return;
    }

    // Afficher le prompt d'installation
    deferredPrompt.prompt();

    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('Francis PWA installé avec succès !');
      setIsInstalled(true);
    } else {
      console.log('Installation PWA annulée par l\'utilisateur');
    }

    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  // Afficher si forcé, si l'app n'est pas installée et si l'installation est disponible ou forcée
  if (isInstalled || (!showInstallButton && !forceShow)) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-br from-[#1E3253]/80 to-[#2A3F6C]/80 backdrop-blur-sm p-4 rounded-xl border border-[#c5a572]/30 shadow-xl hover:shadow-2xl hover:shadow-[#c5a572]/20 transition-all duration-500 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-lg flex items-center justify-center shadow-lg">
            <Download className="h-5 w-5 text-[#162238]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Installer Francis
            </h3>
            <p className="text-gray-300 text-xs">
              Accédez depuis votre écran d'accueil
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            Installer
          </button>
          
          <button
            onClick={() => setShowInstallButton(false)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 