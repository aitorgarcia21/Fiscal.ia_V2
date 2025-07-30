import React from 'react';
import { ChevronRight, FileText, Cpu, Shield, Euro, Building, Globe } from 'lucide-react';

export function AnalyseIAFiscaleAndorrane() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full">
              <Cpu className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🏔️ <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              IA Fiscale Andorrane
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Analyse exhaustive des opportunités d'innovation pour créer l'IA fiscale andorrane 
            la plus avancée au monde
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              500+ nouveaux résidents/an
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              18 milliards € d'actifs
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              21 conventions fiscales
            </span>
          </div>
        </div>

        {/* Objectif Stratégique */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            🎯 Objectif Stratégique
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Créer une <strong>plateforme écosystémique</strong> intégrant les spécificités juridiques, 
            les partenariats locaux, et les besoins sophistiqués d'une clientèle internationale fortunée 
            dans un environnement réglementaire unique au monde.
          </p>
        </div>

        {/* Domaines Critiques */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Résidence Fiscale */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">🧭 Résidence Fiscale IA</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Calculateur intelligent intégrant critères physiques (183 jours/an) et économiques 
              avec tracking GPS automatique.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">21 conventions fiscales</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span className="text-gray-700">Validation temps réel &lt; 100ms</span>
              </div>
            </div>
          </div>

          {/* Substance Économique */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">🏢 Substance Économique</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Module IA scoring les critères de substance avec alertes automatiques 
              anti-requalification.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Bureau 20m² minimum</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span className="text-gray-700">Salaire min 1.286€/mois</span>
              </div>
            </div>
          </div>

          {/* IGI Variable */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">📊 IGI Périodicité Variable</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Seul système gérant la complexité unique andorrane des déclarations IGI 
              selon le chiffre d'affaires.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                <span className="text-gray-700">Mensuelle &gt; 3,6M€</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                <span className="text-gray-700">Trimestrielle 250K-3,6M€</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Semestrielle &lt; 250K€</span>
              </div>
            </div>
          </div>

          {/* Cryptomonnaies */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Euro className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">₿ Crypto Compliance</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Module dédié Loi 24/2022 avec traçabilité complète et calcul automatique 
              plus-values IRPF.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Plus-values max 10%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span className="text-gray-700">Exemptions holdings</span>
              </div>
            </div>
          </div>

          {/* Sécurité Bancaire */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">🔒 Sécurité Bancaire</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Architecture Zero-Trust avec chiffrement AES-256 et conformité 
              LQPD andorrane + RGPD.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">SOC2 + ISO27001</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span className="text-gray-700">Standards Bâle III</span>
              </div>
            </div>
          </div>

          {/* Écosystème Bancaire */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Building className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">🏦 Écosystème Bancaire</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              APIs tri-banques (Andbank, Creand, MoraBanc) pour optimisation 
              automatique des investissements.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Andbank 49% PDM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span className="text-gray-700">18 milliards € AUM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Marché Cible & ROI */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Marché Cible */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              📈 Marché Cible
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                <span className="font-medium text-gray-700">Nouveaux résidents HNWI/an</span>
                <span className="text-2xl font-bold text-blue-600">500+</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                <span className="font-medium text-gray-700">Actifs sous gestion</span>
                <span className="text-2xl font-bold text-green-600">18B€</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                <span className="font-medium text-gray-700">Cabinets comptables agréés</span>
                <span className="text-2xl font-bold text-purple-600">50+</span>
              </div>
            </div>
          </div>

          {/* Impact Économique */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 border border-green-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              🎯 Impact Économique
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                <span className="font-medium text-gray-700">ROI prévisionnel 5 ans</span>
                <span className="text-2xl font-bold text-green-600">300-500%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                <span className="font-medium text-gray-700">Avantage concurrentiel</span>
                <span className="text-lg font-bold text-blue-600">Monopole</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                <span className="font-medium text-gray-700">Position marché</span>
                <span className="text-lg font-bold text-purple-600">Leader mondial</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technologies Exclusives */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            🚀 Technologies Exclusives
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl mb-3">⛓️</div>
              <h4 className="font-semibold text-gray-900 mb-2">Blockchain Compliance</h4>
              <p className="text-sm text-gray-600">Smart contracts + Loi 24/2022 crypto</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl mb-3">🔍</div>
              <h4 className="font-semibold text-gray-900 mb-2">IA Explicable</h4>
              <p className="text-sm text-gray-600">Transparence AFA + Reverse engineering</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-3xl mb-3">🌐</div>
              <h4 className="font-semibold text-gray-900 mb-2">Écosystème Hub</h4>
              <p className="text-sm text-gray-600">500 HNWI + 50+ cabinets + 3 banques</p>
            </div>
          </div>
        </div>

        {/* Partenariats Stratégiques */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 mb-8 border border-indigo-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🤝 Partenariats Stratégiques Recommandés
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Alliance Institutionnelle */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🏛️ Alliance Institutionnelle
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-700"><strong>Andorra Business</strong> (agence publique-privée)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-700"><strong>SEED Andorra</strong> (écosystème startups tech)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-gray-700"><strong>Horitçó 23</strong> (12M€ budget innovation)</span>
                </div>
              </div>
            </div>

            {/* Réseau Professionnel */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                💼 Réseau Professionnel Premium
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="text-gray-700"><strong>Fintax Andorra</strong> (expertise IA/blockchain)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-700"><strong>OCPS Group</strong> (leader comptabilité)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-gray-700"><strong>RSM Andorra</strong> (family offices internationaux)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">
            🎆 Francis IA Andorra
          </h2>
          <p className="text-xl mb-4 text-blue-100">
            L'IA fiscale la plus sophistiquée au monde pour la juridiction la plus attractive d'Europe
          </p>
          <p className="text-blue-200 max-w-4xl mx-auto">
            Une plateforme écosystémique révolutionnaire intégrant les spécificités juridiques andorranes, 
            les partenariats locaux exclusifs, et les besoins ultra-sophistiqués d'une clientèle 
            internationale fortunée dans un environnement réglementaire unique au monde.
          </p>
        </div>

        {/* Navigation vers documentation complète */}
        <div className="mt-12 text-center">
          <a 
            href="/IA-Fiscale-Andorrane-Analyse.md" 
            target="_blank"
            className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-gray-300"
          >
            <FileText className="h-5 w-5" />
            Consulter l'analyse technique complète
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
