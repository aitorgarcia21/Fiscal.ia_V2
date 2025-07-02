import React from 'react';
import { ArrowLeft, Chrome } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProExtensionPage() {
  const navigate = useNavigate();

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
          <Chrome className="w-7 h-7 text-[#c5a572]" /> Extension Chrome « Remplir avec Francis »
        </h1>
        <p className="text-gray-300 mb-8 text-lg">
          Cette extension détecte automatiquement les formulaires en ligne et les remplit grâce à votre IA Francis.
        </p>

        <ol className="list-decimal list-inside space-y-4 text-gray-300 text-base">
          <li>
            Téléchargez le fichier zip de l’extension&nbsp;:
            <a
              href="https://github.com/aitorgarcia21/Fiscal.ia_V2/archive/refs/heads/main.zip"
              className="text-[#c5a572] hover:underline ml-1"
              target="_blank" rel="noopener noreferrer"
            >
              Télécharger
            </a>
          </li>
          <li>Décompressez-le dans un dossier de votre choix.</li>
          <li>
            Ouvrez Chrome et rendez-vous sur <code className="bg-black/30 px-1 py-0.5 rounded">chrome://extensions</code>.
            Activez le mode développeur.
          </li>
          <li>Cliquez « Charger l’extension non empaquetée » et sélectionnez le dossier.</li>
          <li>Dans la barre d’outils Chrome, cliquez sur l’icône Francis et collez votre token d’API.</li>
          <li>Visitez une page contenant un formulaire et utilisez le bouton « Remplir avec Francis ».</li>
        </ol>

        <p className="text-gray-400 mt-8 text-sm">
          🚀 Astuce : Épinglez l’icône Francis pour un accès rapide.
        </p>
      </div>
    </div>
  );
} 