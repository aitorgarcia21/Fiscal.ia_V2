import React, { useState, useEffect, useContext } from 'react';
import { MessageSquare, X, Download, ChevronLeft } from 'lucide-react';
import { detectOS, getDownloadLink } from '../../utils/osDetector';
import { useFrancis } from '../../contexts/FrancisContext';

const FrancisFloatingButton: React.FC = () => {
  // Vérification de sécurité pour éviter le crash
  let francisContext;
  try {
    francisContext = useFrancis();
  } catch (error) {
    // Si FrancisProvider n'est pas disponible, ne pas rendre le composant
    console.warn('FrancisFloatingButton: FrancisProvider not available, skipping render');
    return null;
  }
  
  const { isFrancisVisible, showFrancis, hideFrancis } = francisContext;
  const [isOpen, setIsOpen] = useState(false);
  const [os, setOs] = useState<string | null>(null);

  useEffect(() => {
    // Détecter l'OS au chargement
    setOs(detectOS());
  }, []);

  const handleDownload = () => {
    if (os) {
      window.open(getDownloadLink(os), '_blank');
    }
  };

  if (!isFrancisVisible) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50 transition-all duration-300 ease-in-out">
      {isOpen ? (
        <div className="bg-[#162238] rounded-2xl shadow-2xl border border-[#c5a572]/30 overflow-hidden w-80">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] p-4 flex justify-between items-center">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-[#162238] mr-2" />
              <h3 className="font-bold text-[#162238]">Francis Desktop</h3>
            </div>
            <button 
              onClick={() => {
                setIsOpen(false);
                hideFrancis();
              }}
              className="text-[#162238] hover:bg-black/10 p-1 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Contenu */}
          <div className="p-4">
            <p className="text-white text-sm mb-4">
              Téléchargez Francis Desktop pour une expérience complète et un accès rapide à votre assistant fiscal.
            </p>
            
            <button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] hover:from-[#d4b584] hover:to-[#f0d9a8] text-[#162238] font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-all mb-3"
            >
              <Download className="h-5 w-5 mr-2" />
              Télécharger pour {os || 'votre appareil'}
            </button>
            
            <a 
              href="/telecharger" 
              className="text-[#c5a572] hover:underline text-sm flex items-center justify-center"
            >
              Autres options de téléchargement
              <ChevronLeft className="h-4 w-4 ml-1 transform rotate-180" />
            </a>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setIsOpen(true);
            showFrancis();
          }}
          className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] hover:from-[#d4b584] hover:to-[#f0d9a8] text-[#162238] p-4 rounded-full shadow-xl hover:shadow-2xl transition-all animate-bounce"
          aria-label="Ouvrir Francis Desktop"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default FrancisFloatingButton;
