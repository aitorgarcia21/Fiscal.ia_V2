import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Euro, ArrowRight } from 'lucide-react';

/**
 * Landing page dédiée au produit "Francis Andorre".
 * Ultra-simple : header minimal (logo Francis + Andorre), description courte et CTA vers la page de connexion Andorre.
 */
export const AndorreLandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100">
      {/* Header */}
      <header className="bg-[#162238]/90 backdrop-blur-lg border-b border-[#2A3F6C]/50 shadow-lg">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>          
          <div className="relative inline-flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
            <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
          </div>
          <span className="text-xl font-bold text-white">Francis</span>
          <span className="ml-2 text-sm bg-blue-600/20 text-blue-400 px-2 py-1 rounded-lg">Andorre</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Toute la fiscalité andorrane<br className="hidden md:block" /> expliquée par <span className="text-[#c5a572]">Francis</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-4">
            Optimisez impôts, dividendes, immobilier et plus encore grâce à notre IA experte du droit fiscal andorran.</p>
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500 text-blue-200 px-4 py-2 rounded-lg mb-8 font-semibold">
            49 € / mois / utilisateur • Questions illimitées
          </div>
          <p className="text-lg md:text-xl text-gray-300 mb-4">
          </p>
          <button
            onClick={() => navigate('/andorre/login')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-transform transform hover:-translate-y-0.5"
          >
            Accéder à Francis Andorre <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#162238] border-t border-[#2A3F6C]/50 py-6 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Francis. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default AndorreLandingPage;
