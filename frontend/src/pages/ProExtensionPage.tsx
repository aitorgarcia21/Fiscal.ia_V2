import React, { useEffect } from 'react';
import { ArrowLeft, Chrome } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProExtensionPage() {
  const navigate = useNavigate();

  // Redirection automatique vers la page d'installation après 2 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      window.open('/francis/install', '_blank');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-[#c5a572] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>

        <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
          <Chrome className="w-7 h-7 text-[#c5a572]" /> Installer l'Extension Chrome Francis
        </h1>
        <p className="text-gray-300 mb-8 text-lg">
          Cliquez sur le bouton ci-dessous pour installer automatiquement l'extension Chrome Francis.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <a
            href="/francis/install"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold px-6 py-3 rounded-lg transition-transform transform hover:-translate-y-1"
          >
            ⚡ Installer Francis Automatiquement
          </a>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-[#c5a572] transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>

        <p className="text-gray-400 mt-8 text-sm text-center max-w-xl mx-auto">
          Une nouvelle page va s'ouvrir et Francis s'installera automatiquement en 30&nbsp;secondes. Aucune action manuelle n'est requise.
        </p>
      </div>
    </div>
  );
} 