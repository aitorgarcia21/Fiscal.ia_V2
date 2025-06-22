import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye } from 'lucide-react';

const PolitiqueConfidentialite = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100">
      <header className="bg-[#162238]/95 backdrop-blur-lg border-b border-[#2A3F6C]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-[#c5a572] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au site</span>
            </Link>
            <h1 className="text-lg font-semibold text-gray-300">Politique de Confidentialité</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/5 rounded-xl p-8 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-[#c5a572]" />
            <h2 className="text-2xl font-bold text-white">Politique de Confidentialité - Francis IA</h2>
          </div>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h3 className="text-lg font-semibold text-[#c5a572] mb-3">Protection des données d'optimisation fiscale</h3>
              <p>Francis IA, plateforme spécialisée dans l'optimisation fiscale 2025, s'engage à protéger vos données personnelles et fiscales. Nos services d'optimisation fiscale PER, d'optimisation fiscale LMNP et d'optimisation fiscale SCI respectent les plus hauts standards de sécurité.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#c5a572] mb-3">Données collectées pour l'optimisation fiscale</h3>
              <p>Pour vous fournir des conseils d'optimisation fiscale personnalisés, nous collectons :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Informations fiscales nécessaires aux calculs d'optimisation fiscale</li>
                <li>Données de revenus pour l'optimisation fiscale PER</li>
                <li>Informations patrimoniales pour l'optimisation fiscale LMNP</li>
                <li>Données immobilières pour l'optimisation fiscale SCI</li>
                <li>Informations de contact pour le suivi de l'optimisation fiscale</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#c5a572] mb-3">Utilisation des données d'optimisation fiscale</h3>
              <p>Vos données sont utilisées exclusivement pour :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Calculer vos optimisations fiscales personnalisées</li>
                <li>Générer des recommandations d'optimisation fiscale</li>
                <li>Suivre l'efficacité de vos stratégies d'optimisation fiscale</li>
                <li>Améliorer nos algorithmes d'optimisation fiscale</li>
                <li>Vous informer des nouvelles opportunités d'optimisation fiscale</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#c5a572] mb-3">Sécurité des données d'optimisation fiscale</h3>
              <p>Nous mettons en place des mesures de sécurité renforcées pour protéger vos données d'optimisation fiscale :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Chiffrement SSL pour toutes les données d'optimisation fiscale</li>
                <li>Stockage sécurisé des informations fiscales</li>
                <li>Accès restreint aux données d'optimisation fiscale</li>
                <li>Audits réguliers de sécurité pour l'optimisation fiscale</li>
                <li>Conformité RGPD pour la protection des données fiscales</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#c5a572] mb-3">Vos droits concernant l'optimisation fiscale</h3>
              <p>Vous disposez des droits suivants concernant vos données d'optimisation fiscale :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Droit d'accès à vos données d'optimisation fiscale</li>
                <li>Droit de rectification de vos informations fiscales</li>
                <li>Droit de suppression de vos données d'optimisation fiscale</li>
                <li>Droit de portabilité de vos données fiscales</li>
                <li>Droit d'opposition au traitement pour l'optimisation fiscale</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-[#c5a572] mb-3">Contact pour l'optimisation fiscale</h3>
              <p>Pour toute question concernant la protection de vos données d'optimisation fiscale ou nos services d'optimisation fiscale, contactez notre équipe spécialisée dans l'optimisation fiscale.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PolitiqueConfidentialite; 