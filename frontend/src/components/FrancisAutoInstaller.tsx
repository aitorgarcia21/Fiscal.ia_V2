import React, { useState } from 'react';
import { Download, CheckCircle, AlertCircle, Chrome, Zap } from 'lucide-react';

interface FrancisAutoInstallerProps {
  className?: string;
}

export const FrancisAutoInstaller: React.FC<FrancisAutoInstallerProps> = ({ className = "" }) => {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');

  const handleDownload = async () => {
    setDownloadStatus('downloading');
    
    try {
      // Détecter l'OS pour télécharger le bon installateur
      const userAgent = navigator.userAgent;
      let downloadUrl = '';
      
      if (userAgent.indexOf('Win') !== -1) {
        downloadUrl = '/downloads/FrancisSetup.exe';
      } else if (userAgent.indexOf('Mac') !== -1) {
        downloadUrl = '/downloads/FrancisSetup-Mac';
      } else {
        downloadUrl = '/downloads/francis-chrome-extension-v1.0.0.zip';
      }
      
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadUrl.split('/').pop() || 'FrancisSetup';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadStatus('success');
      
      // Reset après 3 secondes
      setTimeout(() => setDownloadStatus('idle'), 3000);
      
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      setDownloadStatus('error');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    }
  };

  const getButtonContent = () => {
    switch (downloadStatus) {
      case 'downloading':
        return (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Téléchargement...</span>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="h-5 w-5" />
            <span>Téléchargé !</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="h-5 w-5" />
            <span>Réessayer</span>
          </>
        );
      default:
        return (
          <>
            <Download className="h-5 w-5" />
            <span>Installer Francis (1 clic)</span>
          </>
        );
    }
  };

  return (
    <div className={`bg-gradient-to-br from-[#162238] to-[#0A192F] rounded-xl p-6 border border-[#c5a572]/20 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-[#c5a572]/10 px-3 py-1.5 rounded-lg">
          <Chrome className="h-5 w-5 text-[#c5a572]" />
          <span className="text-[#c5a572] font-medium">Extension Chrome</span>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg">
          <Zap className="h-4 w-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">Installation Auto</span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">
        Francis Assistant Universel
      </h3>
      
      <p className="text-gray-300 mb-4 text-sm leading-relaxed">
        Extension révolutionnaire qui active Francis sur <strong>tous vos sites web</strong> : 
        CRM, plateformes fiscal, Google Forms, Salesforce... 
        <span className="text-[#c5a572]">Installation 100% automatique, aucune manipulation !</span>
      </p>
      
      <div className="bg-[#0A192F]/50 rounded-lg p-4 mb-4 border border-[#c5a572]/10">
        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-400" />
          Fonctionnalités incluses :
        </h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• 🎤 <strong>Reconnaissance vocale temps réel</strong></li>
          <li>• 🧠 <strong>Analyse fiscale instantanée</strong> par IA</li>
          <li>• ✍️ <strong>Remplissage automatique</strong> de tous les champs</li>
          <li>• 🌐 <strong>Compatible tous sites web</strong> (CRM, formulaires...)</li>
          <li>• 🔒 <strong>Données chiffrées</strong> et sécurisées</li>
        </ul>
      </div>
      
      <button
        onClick={handleDownload}
        disabled={downloadStatus === 'downloading'}
        className={`
          w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-bold text-lg
          transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
          ${downloadStatus === 'success' 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : downloadStatus === 'error'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gradient-to-r from-[#c5a572] to-[#e6c890] hover:from-[#e6c890] hover:to-[#c5a572] text-[#162238]'
          }
          disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
          shadow-lg hover:shadow-xl
        `}
      >
        {getButtonContent()}
      </button>
      
      <div className="mt-4 text-center">
        <p className="text-gray-400 text-xs">
          Compatible: Chrome, Brave, Edge, Opera • Windows, Mac, Linux
        </p>
        <p className="text-[#c5a572] text-xs mt-1">
          ⚡ Installation instantanée - Aucune configuration requise
        </p>
      </div>
    </div>
  );
};

export default FrancisAutoInstaller;
