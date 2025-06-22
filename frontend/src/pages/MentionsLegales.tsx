import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100">
      <header className="bg-[#162238]/95 backdrop-blur-lg border-b border-[#2A3F6C]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-[#c5a572] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au site</span>
            </Link>
            <h1 className="text-lg font-semibold text-gray-300">Mentions Légales</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/5 rounded-xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Mentions Légales - Francis IA</h2>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h3 className="text-lg font-semibold text-[#c5a572] mb-3">Éditeur du site</h3>
              <p>Francis IA est une plateforme d'optimisation fiscale et de conseil financier spécialisée dans l'optimisation fiscale 2025, l'optimisation fiscale PER, l'optimisation fiscale LMNP et l'optimisation fiscale SCI.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#c5a572] mb-3">Services d'optimisation fiscale</h3>
              <p>Francis IA propose des services d'optimisation fiscale personnalisés incluant :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Optimisation fiscale PER (Plan Épargne Retraite)</li>
                <li>Optimisation fiscale LMNP (Loueur Meublé Non Professionnel)</li>
                <li>Optimisation fiscale SCI (Société Civile Immobilière)</li>
                <li>Optimisation fiscale assurance-vie</li>
                <li>Calculs d'optimisation fiscale 2025</li>
                <li>Conseils d'optimisation fiscale personnalisés</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#c5a572] mb-3">Expertise en optimisation fiscale</h3>
              <p>Notre équipe d'experts en optimisation fiscale vous accompagne dans la réduction de vos impôts grâce à des stratégies d'optimisation fiscale légales et efficaces. Nous proposons des solutions d'optimisation fiscale adaptées à chaque situation.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#c5a572] mb-3">Contact</h3>
              <p>Pour toute question concernant nos services d'optimisation fiscale, contactez-nous via notre page de contact dédiée à l'optimisation fiscale.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#c5a572] mb-3">Hébergement</h3>
              <p>Ce site d'optimisation fiscale est hébergé par Railway, spécialisé dans l'hébergement de plateformes d'optimisation fiscale et de conseil financier.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentionsLegales; 