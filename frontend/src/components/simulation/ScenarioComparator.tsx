import React, { useState, useEffect, useMemo } from 'react';
import WhatIfSimulator from '../../utils/WhatIfSimulator';
import SuccessionOptimizer from '../../utils/SuccessionOptimizer';

interface ScenarioData {
  id: string;
  name: string;
  description: string;
  color: string;
  parameters: any;
  results?: {
    totalTax: number;
    totalSavings: number;
    netIncome: number;
    patrimoineTransmis: number;
    optimizationRate: number;
  };
  loading: boolean;
  error?: string;
}

interface ComparisonMetrics {
  bestScenario: string;
  maxSavings: number;
  efficiencyRating: 'EXCELLENT' | 'BON' | 'MOYEN' | 'FAIBLE';
  riskLevel: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ';
  implementationComplexity: 'SIMPLE' | 'MOYEN' | 'COMPLEXE';
  recommendations: string[];
}

const ScenarioComparator: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioData[]>([
    {
      id: 'base',
      name: 'Situation Actuelle',
      description: 'Situation fiscale sans optimisation',
      color: '#64748b',
      parameters: {},
      loading: false
    },
    {
      id: 'optimized',
      name: 'Optimisé Fiscal',
      description: 'Avec optimisations fiscales courantes',
      color: '#3b82f6',
      parameters: {},
      loading: false
    },
    {
      id: 'aggressive',
      name: 'Stratégie Agressive',
      description: 'Optimisation maximale tous leviers',
      color: '#dc2626',
      parameters: {},
      loading: false
    }
  ]);

  const [comparisonMode, setComparisonMode] = useState<'FISCAL' | 'PATRIMONIAL' | 'SUCCESSION'>('FISCAL');
  const [timeHorizon, setTimeHorizon] = useState<1 | 5 | 10 | 20>(10);
  const [isSimulating, setIsSimulating] = useState(false);
  const [clientProfile, setClientProfile] = useState<any>(null);

  // Métriques de comparaison calculées
  const comparisonMetrics = useMemo<ComparisonMetrics | null>(() => {
    const validScenarios = scenarios.filter(s => s.results && !s.loading && !s.error);
    if (validScenarios.length === 0) return null;

    const bestScenario = validScenarios.reduce((best, current) => 
      (current.results?.totalSavings || 0) > (best.results?.totalSavings || 0) ? current : best
    );

    const maxSavings = Math.max(...validScenarios.map(s => s.results?.totalSavings || 0));
    
    // Calcul rating d'efficacité
    let efficiencyRating: ComparisonMetrics['efficiencyRating'] = 'FAIBLE';
    if (maxSavings > 50000) efficiencyRating = 'EXCELLENT';
    else if (maxSavings > 20000) efficiencyRating = 'BON';
    else if (maxSavings > 5000) efficiencyRating = 'MOYEN';

    // Niveau de risque basé sur le scénario optimal
    let riskLevel: ComparisonMetrics['riskLevel'] = 'FAIBLE';
    if (bestScenario.id === 'aggressive') riskLevel = 'ÉLEVÉ';
    else if (bestScenario.id === 'optimized') riskLevel = 'MOYEN';

    // Complexité d'implémentation
    let implementationComplexity: ComparisonMetrics['implementationComplexity'] = 'SIMPLE';
    if (bestScenario.id === 'aggressive') implementationComplexity = 'COMPLEXE';
    else if (bestScenario.id === 'optimized') implementationComplexity = 'MOYEN';

    const recommendations = [
      `Scénario recommandé: ${bestScenario.name}`,
      `Économie potentielle: ${maxSavings.toLocaleString()}€`,
      efficiencyRating === 'EXCELLENT' ? 'Optimisation très rentable' : 'Potentiel d\'amélioration disponible',
      riskLevel === 'ÉLEVÉ' ? 'Attention aux risques fiscaux' : 'Stratégie sécurisée'
    ];

    return {
      bestScenario: bestScenario.id,
      maxSavings,
      efficiencyRating,
      riskLevel,
      implementationComplexity,
      recommendations
    };
  }, [scenarios]);

  // Chargement du profil client
  useEffect(() => {
    loadClientProfile();
  }, []);

  const loadClientProfile = async () => {
    try {
      // Récupération depuis le localStorage ou API
      const savedProfile = localStorage.getItem('fiscal_client_profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setClientProfile(profile);
        
        // Initialisation des scénarios avec le profil
        await initializeScenarios(profile);
      }
    } catch (error) {
      console.error('Erreur chargement profil client:', error);
    }
  };

  // Initialisation des scénarios
  const initializeScenarios = async (profile: any) => {
    const baseParameters = {
      revenus: {
        salaires: profile.revenus?.salaires || 0,
        bnc: profile.revenus?.bnc || 0,
        bic: profile.revenus?.bic || 0,
        foncier: profile.revenus?.foncier || 0,
        capitauxMobiliers: profile.revenus?.capitauxMobiliers || 0,
        plusValues: profile.revenus?.plusValues || 0
      },
      situation: {
        statut: profile.situation?.statut || 'celibataire',
        nombreParts: profile.situation?.nombreParts || 1,
        enfantsACharge: profile.situation?.enfantsACharge || 0,
        personnesACharge: profile.situation?.personnesACharge || 0
      },
      patrimoine: {
        immobilier: profile.patrimoine?.immobilier || 0,
        mobilier: profile.patrimoine?.mobilier || 0,
        professionnels: profile.patrimoine?.professionnels || 0,
        dettes: profile.patrimoine?.dettes || 0
      },
      optimisations: {
        pinel: { montant: 0, duree: 9, zone: 'B1' },
        malraux: { montant: 0, secteurSauvegarde: false },
        girardin: { montant: 0, type: 'industriel' },
        per: { versements: 0 },
        sofica: { montant: 0 },
        fcpi: { montant: 0 },
        denormandie: { montant: 0, travaux: 0 },
        monumentsHistoriques: { deficits: 0 },
        lmnp: { recettes: 0, amortissements: 0 }
      },
      transmissions: { donations: [] }
    };

    // Scénario optimisé
    const optimizedParameters = {
      ...baseParameters,
      optimisations: {
        ...baseParameters.optimisations,
        per: { versements: Math.min(baseParameters.revenus.salaires * 0.08, 30000) },
        pinel: baseParameters.revenus.salaires > 50000 ? 
          { montant: 200000, duree: 9, zone: 'B1' } : 
          { montant: 0, duree: 9, zone: 'B1' }
      }
    };

    // Scénario agressif
    const aggressiveParameters = {
      ...baseParameters,
      optimisations: {
        ...baseParameters.optimisations,
        per: { versements: Math.min(baseParameters.revenus.salaires * 0.1, 35194) },
        pinel: { montant: 300000, duree: 12, zone: 'A' },
        sofica: { montant: 25000 },
        fcpi: { montant: 24000 },
        girardin: baseParameters.revenus.salaires > 100000 ? 
          { montant: 150000, type: 'industriel' } : 
          { montant: 0, type: 'industriel' }
      }
    };

    setScenarios(prev => prev.map(scenario => ({
      ...scenario,
      parameters: scenario.id === 'base' ? baseParameters :
                 scenario.id === 'optimized' ? optimizedParameters :
                 aggressiveParameters
    })));
  };

  // Simulation de tous les scénarios
  const runAllSimulations = async () => {
    if (!clientProfile) {
      console.error('Profil client requis pour la simulation');
      return;
    }

    setIsSimulating(true);
    
    try {
      // Marquer tous les scénarios en loading
      setScenarios(prev => prev.map(s => ({ ...s, loading: true, error: undefined })));

      // Simulation parallèle de tous les scénarios
      const simulationPromises = scenarios.map(async (scenario) => {
        try {
          let results;
          
          if (comparisonMode === 'FISCAL') {
            // Simulation fiscale avec WhatIfSimulator
            const taxScenarios = [{
              id: scenario.id,
              name: scenario.name,
              description: scenario.description,
              parameters: scenario.parameters
            }];
            
            const simulation = await WhatIfSimulator.runSimulation(taxScenarios);
            const taxResult = simulation.baseScenario.calculations;
            
            results = {
              totalTax: taxResult.ir.impotNet + taxResult.ifi.impotDefinitif + taxResult.prelevements.total,
              totalSavings: taxResult.ir.reductions.total,
              netIncome: taxResult.ir.revenuNet - taxResult.ir.impotNet,
              patrimoineTransmis: scenario.parameters.patrimoine.immobilier + scenario.parameters.patrimoine.mobilier - taxResult.ifi.impotDefinitif,
              optimizationRate: taxResult.ir.reductions.total > 0 ? 
                (taxResult.ir.reductions.total / (taxResult.ir.impotBrut || 1)) * 100 : 0
            };
            
          } else if (comparisonMode === 'SUCCESSION') {
            // Simulation succession avec SuccessionOptimizer
            const successionProfile = {
              client: {
                age: clientProfile.age || 50,
                situationMatrimoniale: scenario.parameters.situation.statut,
                enfants: Array.from({ length: scenario.parameters.situation.enfantsACharge }, (_, i) => ({
                  age: 20 + i * 5,
                  situationFamiliale: 'celibataire',
                  patrimoinePropre: 0,
                  revenus: 0
                })),
                patrimoine: {
                  immobilier: {
                    residencePrincipale: { valeur: scenario.parameters.patrimoine.immobilier * 0.6, dettes: 0 },
                    immobilierLocatif: [{ 
                      valeur: scenario.parameters.patrimoine.immobilier * 0.4, 
                      revenus: scenario.parameters.revenus.foncier, 
                      dettes: 0, 
                      zone: 'B1' 
                    }],
                    immobilierProfessionnel: { valeur: 0, dettes: 0 }
                  },
                  mobilier: {
                    liquidites: scenario.parameters.patrimoine.mobilier * 0.3,
                    assuranceVie: [{ valeur: scenario.parameters.patrimoine.mobilier * 0.4, antecedence: 5, beneficiaires: ['enfants'], clause: 'standard' }],
                    titres: {
                      actions: scenario.parameters.patrimoine.mobilier * 0.2,
                      obligations: scenario.parameters.patrimoine.mobilier * 0.1,
                      fcp: 0,
                      scpi: 0
                    },
                    artEtAntiquite: 0
                  },
                  professionnel: {
                    partsEntreprise: { valeur: scenario.parameters.patrimoine.professionnels, pourcentage: 100 },
                    droitsAuteur: 0,
                    brevets: 0
                  },
                  dettes: {
                    immobilier: scenario.parameters.patrimoine.dettes,
                    consommation: 0,
                    professionnelles: 0
                  }
                },
                revenus: scenario.parameters.revenus,
                charges: {
                  trainVie: scenario.parameters.revenus.salaires * 0.6,
                  fiscalite: 0,
                  interets: 0
                }
              },
              objectifs: {
                preservationPatrimoine: 80,
                egaliteEnfants: true,
                optimisationFiscale: true,
                liquiditeHeritiers: true,
                donationsVivant: true,
                continuiteFamiliale: true
              }
            };
            
            const successionSim = await SuccessionOptimizer.optimizeSuccession(successionProfile);
            
            results = {
              totalTax: successionSim.comparison.situationActuelle.droitsSuccession,
              totalSavings: successionSim.comparison.benefices.economieAbsolue,
              netIncome: 0,
              patrimoineTransmis: successionSim.comparison.avecOptimisation.patrimoineTransmis,
              optimizationRate: successionSim.comparison.benefices.economieRelative
            };
          }

          return { scenarioId: scenario.id, results };
          
        } catch (error) {
          console.error(`Erreur simulation ${scenario.name}:`, error);
          return { scenarioId: scenario.id, error: error instanceof Error ? error.message : 'Erreur inconnue' };
        }
      });

      const simulationResults = await Promise.all(simulationPromises);
      
      // Mise à jour des résultats
      setScenarios(prev => prev.map(scenario => {
        const result = simulationResults.find(r => r.scenarioId === scenario.id);
        return {
          ...scenario,
          loading: false,
          results: result?.results,
          error: result?.error
        };
      }));

    } catch (error) {
      console.error('Erreur simulation globale:', error);
      setScenarios(prev => prev.map(s => ({ 
        ...s, 
        loading: false, 
        error: 'Erreur de simulation' 
      })));
    } finally {
      setIsSimulating(false);
    }
  };

  // Mise à jour des paramètres d'un scénario
  const updateScenarioParameters = (scenarioId: string, newParameters: any) => {
    setScenarios(prev => prev.map(scenario => 
      scenario.id === scenarioId 
        ? { ...scenario, parameters: { ...scenario.parameters, ...newParameters } }
        : scenario
    ));
  };

  // Rendu d'un scénario individuel
  const renderScenario = (scenario: ScenarioData, index: number) => (
    <div 
      key={scenario.id}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
      style={{ borderLeft: `4px solid ${scenario.color}` }}
    >
      {/* En-tête du scénario */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900" style={{ color: scenario.color }}>
            {scenario.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          {scenario.loading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: scenario.color }}></div>
          )}
          {scenario.error && (
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs">
              Erreur
            </div>
          )}
          {scenario.results && !scenario.loading && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
              ✓ Simulé
            </div>
          )}
        </div>
      </div>

      {/* Résultats */}
      {scenario.results && !scenario.loading && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Impôts Total</div>
            <div className="text-xl font-bold text-gray-900">
              {scenario.results.totalTax.toLocaleString()}€
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Économies</div>
            <div className="text-xl font-bold text-green-600">
              +{scenario.results.totalSavings.toLocaleString()}€
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Taux Optimisation</div>
            <div className="text-xl font-bold" style={{ color: scenario.color }}>
              {scenario.results.optimizationRate.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Patrimoine Transmis</div>
            <div className="text-xl font-bold text-gray-900">
              {scenario.results.patrimoineTransmis.toLocaleString()}€
            </div>
          </div>
        </div>
      )}

      {/* Optimisations actives */}
      {scenario.parameters.optimisations && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Optimisations Actives:</h4>
          <div className="flex flex-wrap gap-2">
            {scenario.parameters.optimisations.per?.versements > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                PER: {scenario.parameters.optimisations.per.versements.toLocaleString()}€
              </span>
            )}
            {scenario.parameters.optimisations.pinel?.montant > 0 && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                Pinel: {scenario.parameters.optimisations.pinel.montant.toLocaleString()}€
              </span>
            )}
            {scenario.parameters.optimisations.sofica?.montant > 0 && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                SOFICA: {scenario.parameters.optimisations.sofica.montant.toLocaleString()}€
              </span>
            )}
            {scenario.parameters.optimisations.girardin?.montant > 0 && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                Girardin: {scenario.parameters.optimisations.girardin.montant.toLocaleString()}€
              </span>
            )}
          </div>
        </div>
      )}

      {/* Erreur */}
      {scenario.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="text-red-800 text-sm">
            <strong>Erreur de simulation:</strong> {scenario.error}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎯 Comparateur de Scénarios Fiscaux
        </h1>
        <p className="text-gray-600">
          Analysez et comparez jusqu'à 3 stratégies fiscales différentes en temps réel
        </p>
      </div>

      {/* Contrôles de simulation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de Comparaison
            </label>
            <select
              value={comparisonMode}
              onChange={(e) => setComparisonMode(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="FISCAL">Optimisation Fiscale</option>
              <option value="PATRIMONIAL">Stratégie Patrimoniale</option>
              <option value="SUCCESSION">Transmission Succession</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horizon Temporel
            </label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value) as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>1 an</option>
              <option value={5}>5 ans</option>
              <option value={10}>10 ans</option>
              <option value={20}>20 ans</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={runAllSimulations}
              disabled={isSimulating || !clientProfile}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isSimulating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Simulation en cours...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Lancer les Simulations</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Métriques de comparaison */}
        {comparisonMetrics && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Analyse Comparative</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">Meilleur Scénario</div>
                <div className="text-lg font-bold text-green-800">
                  {scenarios.find(s => s.id === comparisonMetrics.bestScenario)?.name}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Économie Max</div>
                <div className="text-lg font-bold text-blue-800">
                  {comparisonMetrics.maxSavings.toLocaleString()}€
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">Efficacité</div>
                <div className="text-lg font-bold text-purple-800">
                  {comparisonMetrics.efficiencyRating}
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-orange-600 font-medium">Complexité</div>
                <div className="text-lg font-bold text-orange-800">
                  {comparisonMetrics.implementationComplexity}
                </div>
              </div>
            </div>
            
            {/* Recommandations */}
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Recommandations Francis:</h4>
              <ul className="space-y-1">
                {comparisonMetrics.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Grille des scénarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario, index) => renderScenario(scenario, index))}
      </div>

      {/* Graphique de comparaison */}
      {comparisonMetrics && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Comparaison Visuelle</h3>
          <div className="relative h-64 bg-gray-50 rounded-lg p-4">
            {/* Barres de comparaison */}
            <div className="flex items-end justify-around h-full">
              {scenarios.filter(s => s.results).map((scenario, index) => {
                const maxSavings = Math.max(...scenarios.filter(s => s.results).map(s => s.results!.totalSavings));
                const height = maxSavings > 0 ? (scenario.results!.totalSavings / maxSavings) * 100 : 0;
                
                return (
                  <div key={scenario.id} className="flex flex-col items-center">
                    <div 
                      className="w-16 rounded-t-lg transition-all duration-500 flex items-end justify-center text-white text-xs font-medium"
                      style={{ 
                        height: `${Math.max(height, 10)}%`, 
                        backgroundColor: scenario.color,
                        minHeight: '20px'
                      }}
                    >
                      {scenario.results!.totalSavings > 0 && `${(scenario.results!.totalSavings / 1000).toFixed(0)}k€`}
                    </div>
                    <div className="text-xs text-gray-600 mt-2 text-center max-w-16 truncate">
                      {scenario.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioComparator;
