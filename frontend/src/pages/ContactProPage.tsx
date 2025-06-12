import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

export function ContactProPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100 font-sans antialiased flex flex-col">
      {/* Header simple */}
      <header className="bg-[#162238]/95 backdrop-blur-lg border-b border-[#2A3F6C]/50 z-50 shadow-lg">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l'accueil
          </button>
          <span className="text-xl font-semibold text-[#c5a572]">Francis Pro</span>
        </div>
      </header>

      {/* Contenu de la page */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-2xl">
          <Mail className="w-16 h-16 text-[#c5a572] mx-auto mb-8" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            Offre <span className="text-[#c5a572]">Francis Pro</span> à venir !
          </h1>
          <p className="text-xl text-gray-300 mb-4 leading-relaxed">
            Nous préparons une suite d'outils puissants dédiés aux professionnels de la fiscalité et de la gestion de patrimoine.
          </p>
          <p className="text-lg text-gray-400 mb-8 leading-relaxed">
            Pour être parmi les premiers informés du lancement, obtenir plus de détails sur les fonctionnalités à venir, ou discuter d'un partenariat, n'hésitez pas à nous contacter dès maintenant.
          </p>
          <a
            href="mailto:contact-pro@fiscalia.example.com?subject=Intérêt Offre Francis Pro"
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-xl shadow-lg hover:shadow-[#c5a572]/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#c5a572] focus:ring-offset-2 focus:ring-offset-[#162238] transition-all duration-300 text-lg"
          >
            <Mail className="w-5 h-5 mr-2" />
            Contactez-nous
          </a>
        </div>
      </main>

      {/* Footer minimaliste */}
      <footer className="py-8 text-center border-t border-[#2A3F6C]/50">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Francis. Tous droits réservés.</p>
      </footer>
    </div>
  );
} 