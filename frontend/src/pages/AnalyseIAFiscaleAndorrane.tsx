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

        {/* Fonctionnalités Juridiques Ultra-Spécialisées */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            ⚖️ Fonctionnalités Juridiques Ultra-Spécialisées
          </h2>
          
          {/* Calculateur de Résidence Fiscale */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-600" />
              🧭 Calculateur de Résidence Fiscale Intelligent
            </h3>
            <p className="text-gray-600 mb-4">
              <strong>Architecture IA :</strong> Machine Learning + GPS Tracking + Analytics juridiques
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Critères Physiques :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Seuil :</strong> 183 jours minimum/an</li>
                <li>• <strong>Tracking GPS :</strong> Géolocalisation automatique</li>
                <li>• <strong>Multi-juridiction :</strong> Compteur multi-pays</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Optimisations Spécifiques :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>France :</strong> Critères ≥ 183 jours OU centre économique</li>
                <li>• <strong>Espagne :</strong> Gestion proximité géographique</li>
                <li>• <strong>Alertes préventives :</strong> Risque requalification fiscale</li>
                <li>• <strong>Validation temps réel :</strong> {'<'} 100ms par calcul</li>
              </ul>
            </div>
          </div>

          {/* Substance Économique */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building className="h-6 w-6 text-green-600" />
              🏢 Optimisateur de Substance Économique
            </h3>
            <p className="text-gray-600 mb-4">
              <strong>Module IA :</strong> Scoring multi-critères avec alertes automatiques
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Bureau Minimum :</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Surface : 20m² minimum</li>
                  <li>• Coût : 400€+/mois</li>
                  <li>• Adresse physique obligatoire</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Personnel Local :</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Salaire : 1.286€/mois minimum</li>
                  <li>• Qualifications requises</li>
                  <li>• Contrat local obligatoire</li>
                </ul>
              </div>
            </div>
          </div>

          {/* IGI Simulateur */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-purple-600" />
              📊 Simulateur IGI Périodicité Variable
            </h3>
            <p className="text-gray-600 mb-4">
              <strong>Innovation Unique :</strong> Seul système gérant la complexité andorrane des déclarations IGI
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-gray-700">Mensuelle</span>
                <span className="text-sm text-gray-600">CA {'>'}  3,6M€ → Déclaration J+20</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-gray-700">Trimestrielle</span>
                <span className="text-sm text-gray-600">CA 250K - 3,6M€ → Optimisation trésorerie</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-gray-700">Semestrielle</span>
                <span className="text-sm text-gray-600">CA {'<'} 250K€ → Simplification admin</span>
              </div>
            </div>
          </div>

          {/* Crypto Compliance */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Euro className="h-6 w-6 text-orange-600" />
              ₿ IA Spécialisée Cryptomonnaies (Loi 24/2022)
            </h3>
            <p className="text-gray-600 mb-4">
              <strong>Compliance :</strong> Module dédié au cadre réglementaire andorran crypto
            </p>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Fonctionnalités Avancées :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>IRPF Crypto :</strong> Max 10% (vs 47% France)</li>
                <li>• <strong>Holdings :</strong> Exemptions structures crypto spécifiques</li>
                <li>• <strong>Reporting :</strong> Obligations AFA automatiques</li>
                <li>• <strong>Blockchain :</strong> Smart contracts conformes Loi 24/2022</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bases de Données Exclusives */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            🗄️ Bases de Données Exclusives Andorranes
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">📋 Registre des Entreprises</h4>
                <p className="text-sm text-gray-600">
                  Intégration API temps réel avec le Registre du Commerce andorran pour vérification 
                  instantanée des statuts sociétaires et modifications statutaires.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">🏦 Ecosystem Bancaire</h4>
                <p className="text-sm text-gray-600">
                  APIs directes avec les 3 banques principales pour validation comptes, 
                  mouvements, et conformité CRS/FATCA automatisée.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">🏘️ Registre Cadastral</h4>
                <p className="text-sm text-gray-600">
                  Interface directe pour validation résidences, bureaux, 
                  et critères de substance économique en temps réel.
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">👥 Réseau Professionnel</h4>
                <p className="text-sm text-gray-600">
                  Base des 50+ cabinets agréés avec spécialisations, 
                  tarifications, et disponibilités pour matching automatique.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technologies Révolutionnaires */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            🚀 Technologies Révolutionnaires
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">⛓️ Blockchain Compliance</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Smart contracts obligations fiscales</li>
                <li>• Paiements automatiques</li>
                <li>• Registre distribué traçable</li>
                <li>• Conformité Loi 24/2022</li>
              </ul>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Cpu className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800">🔍 IA Explicable Auditable</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Transparence algorithmes AFA</li>
                <li>• Reverse engineering décisions</li>
                <li>• Audit trails complets</li>
                <li>• Certification conformité</li>
              </ul>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">🌐 Plateforme Écosystème</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Hub 500 HNWI résidents</li>
                <li>• 50+ cabinets agréés</li>
                <li>• 3 banques principales</li>
                <li>• Administrations publiques</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Domaines Critiques d'Innovation */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Résidence Fiscale */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">🧭 Résidence Fiscale IA</h3>
            </div>
            <p className="text-gray-600">Hub central connectant 500 HNWI, 50+ cabinets, 3 banques.</p>
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
                  <span className="text-gray-700"><strong>Horitzó 23</strong> (12M€ budget innovation)</span>
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
