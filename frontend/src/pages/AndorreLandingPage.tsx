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
      <main className="flex-1 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              L'IA qui révolutionne<br className="hidden md:block" /> la <span className="text-[#c5a572]">fiscalité andorrane</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Francis transforme les conseillers en patrimoine et gestionnaires en experts de référence grâce à l'intelligence artificielle appliquée au droit fiscal andorran.
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500 text-blue-200 px-6 py-3 rounded-lg mb-8 font-semibold text-lg">
              49 € / mois / utilisateur • Questions illimitées
            </div>
          </div>

          {/* Mission Section */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="bg-[#1A2B42]/50 backdrop-blur-sm border border-[#2A3F6C]/30 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-[#c5a572]" />
                Notre Mission
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                Préserver et faire évoluer le métier de conseil en patrimoine en intégrant l'IA comme un partenaire stratégique.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-[#c5a572] mt-0.5 flex-shrink-0" />
                  <span><strong>Expertise renforcée</strong> : Maîtrisez instantanément tous les aspects de la fiscalité andorrane</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-[#c5a572] mt-0.5 flex-shrink-0" />
                  <span><strong>Relation client optimisée</strong> : Répondez avec précision à toutes les questions complexes</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-[#c5a572] mt-0.5 flex-shrink-0" />
                  <span><strong>Différenciation concurrentielle</strong> : Proposez un service d'exception à vos clients</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#1A2B42]/50 backdrop-blur-sm border border-[#2A3F6C]/30 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Euro className="h-8 w-8 text-[#c5a572]" />
                Pourquoi Francis Andorre ?
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                L'IA n'est pas là pour remplacer votre expertise, mais pour la démultiplier et vous permettre de vous concentrer sur ce qui compte vraiment : la relation client.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-[#c5a572] mt-0.5 flex-shrink-0" />
                  <span><strong>Calculs instantanés</strong> : IRPF, IS, IGI, optimisations fiscales</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-[#c5a572] mt-0.5 flex-shrink-0" />
                  <span><strong>Jurisprudence à jour</strong> : Accès aux dernières évolutions légales</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-[#c5a572] mt-0.5 flex-shrink-0" />
                  <span><strong>Stratégies personnalisées</strong> : Conseils adaptés à chaque profil client</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Prêt à transformer votre pratique ?</h3>
            <p className="text-gray-300 mb-8 text-lg">Rejoignez les conseillers qui font déjà confiance à Francis pour exceller dans leur métier.</p>
            <button
              onClick={() => navigate('/andorre/login')}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-5 rounded-xl font-semibold shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl text-lg"
            >
              Commencer avec Francis Andorre <ArrowRight className="w-6 h-6" />
            </button>
          </div>
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
