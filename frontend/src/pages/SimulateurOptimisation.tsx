import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Bot, ArrowRight, TrendingUp, Info, CheckCircle, AlertCircle, Shield, Target, Zap, Building2, PiggyBank, Home, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface SimulationData {
  revenuAnnuel: number;
  tmi: number;
  objectifs: string[];
  capaciteInvestissement: number;
}

interface StrategieOptimisation {
  nom: string;
  economie: number;
  investissement: number;
  description: string;
  difficulte: 'facile' | 'moyenne' | 'difficile';
  delai: string;
  icon: any;
  color: string;
}

interface ResultatOptimisation {
  economieTotale: number;
  strategies: StrategieOptimisation[];
  conseils: string[];
  impactConscience: string;
}

export function SimulateurOptimisation() {
  const [simulation, setSimulation] = useState<SimulationData>({
    revenuAnnuel: 60000,
    tmi: 30,
    objectifs: ['retraite'],
    capaciteInvestissement: 5000
  });
  
  const [resultat, setResultat] = useState<ResultatOptimisation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const objectifsDisponibles = [
    { id: 'retraite', label: 'Épargne retraite', icon: PiggyBank },
    { id: 'immobilier', label: 'Investissement immobilier', icon: Home },
    { id: 'transmission', label: 'Transmission patrimoniale', icon: Heart },
    { id: 'entreprise', label: 'Création d\'entreprise', icon: Building2 }
  ];

  const calculerOptimisations = (data: SimulationData): ResultatOptimisation => {
    const { revenuAnnuel, tmi, objectifs, capaciteInvestissement } = data;
    
    const strategies: StrategieOptimisation[] = [];
    let economieTotale = 0;

    // PER - Plan Épargne Retraite
    if (objectifs.includes('retraite')) {
      const versementPER = Math.min(revenuAnnuel * 0.1, 5000);
      const economiePER = Math.round(versementPER * (tmi / 100));
      strategies.push({
        nom: "Plan Épargne Retraite (PER)",
        economie: economiePER,
        investissement: versementPER,
        description: "Déduisez jusqu'à 10% de vos revenus professionnels",
        difficulte: 'facile',
        delai: 'Immédiat',
        icon: PiggyBank,
        color: 'from-blue-500 to-blue-600'
      });
      economieTotale += economiePER;
    }

    // LMNP - Location Meublée Non Professionnelle
    if (objectifs.includes('immobilier') && revenuAnnuel > 40000) {
      const investissementLMNP = Math.min(capaciteInvestissement, 100000);
      const economieLMNP = Math.round(investissementLMNP * 0.15 * (tmi / 100));
      strategies.push({
        nom: "Location Meublée Non Professionnelle (LMNP)",
        economie: economieLMNP,
        investissement: investissementLMNP,
        description: "Défiscalisez via l'immobilier avec amortissement",
        difficulte: 'moyenne',
        delai: '3-6 mois',
        icon: Home,
        color: 'from-green-500 to-green-600'
      });
      economieTotale += economieLMNP;
    }

    // Dons défiscalisés
    if (objectifs.includes('transmission') && revenuAnnuel > 30000) {
      const don = Math.min(revenuAnnuel * 0.05, 3000);
      const economieDon = Math.round(don * 0.66);
      strategies.push({
        nom: "Dons défiscalisés",
        economie: economieDon,
        investissement: don,
        description: "Transmettez votre patrimoine en optimisant les droits",
        difficulte: 'facile',
        delai: 'Immédiat',
        icon: Heart,
        color: 'from-red-500 to-red-600'
      });
      economieTotale += economieDon;
    }

    // Création d'entreprise
    if (objectifs.includes('entreprise') && revenuAnnuel > 50000) {
      const economieEntreprise = Math.round(revenuAnnuel * 0.2 * (tmi / 100));
      strategies.push({
        nom: "Création d'entreprise",
        economie: economieEntreprise,
        investissement: 0,
        description: "Optimisez via la structure juridique",
        difficulte: 'difficile',
        delai: '6-12 mois',
        icon: Building2,
        color: 'from-purple-500 to-purple-600'
      });
      economieTotale += economieEntreprise;
    }

    // Conseils personnalisés
    const conseils = [];
    if (tmi >= 41) {
      conseils.push("Votre TMI élevé justifie des optimisations importantes");
    }
    if (capaciteInvestissement < 10000) {
      conseils.push("Privilégiez les optimisations à faible investissement initial");
    }
    if (objectifs.length === 1) {
      conseils.push("Considérez diversifier vos stratégies d'optimisation");
    }

    // Impact sur la conscience fiscale
    let impactConscience = "Vous reprenez le contrôle de votre fiscalité";
    if (economieTotale > 5000) {
      impactConscience = "Vous devenez maître de votre destinée fiscale";
    } else if (economieTotale > 2000) {
      impactConscience = "Vous vous émancipez de la dépendance fiscale";
    }

    return {
      economieTotale,
      strategies,
      conseils,
      impactConscience
    };
  };

  const handleSimuler = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const result = calculerOptimisations(simulation);
      setResultat(result);
      setIsCalculating(false);
    }, 1500);
  };

  const handleObjectifChange = (objectifId: string) => {
    setSimulation(prev => ({
      ...prev,
      objectifs: prev.objectifs.includes(objectifId)
        ? prev.objectifs.filter(id => id !== objectifId)
        : [...prev.objectifs, objectifId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0F1B2F] to-[#162238] text-white">
      <header className="bg-[#0A1628]/95 backdrop-blur-sm border-b border-[#c5a572]/20 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#162238]" />
            </div>
            <span className="font-bold text-white text-xl">Francis France</span>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1a2332]/60 backdrop-blur-sm border border-[#c5a572]/20 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-[#162238]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Simulateur d'Optimisation Fiscale</h1>
            <p className="text-gray-400 text-lg">
              Découvrez les stratégies d'optimisation adaptées à votre situation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire */}
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Revenu annuel (€)
                </label>
                <input
                  type="number"
                  value={simulation.revenuAnnuel}
                  onChange={(e) => setSimulation({...simulation, revenuAnnuel: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg text-white focus:outline-none focus:border-[#c5a572] text-lg"
                  placeholder="60000"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Taux Marginal d'Imposition (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="49"
                  value={simulation.tmi}
                  onChange={(e) => setSimulation({...simulation, tmi: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Capacité d'investissement (€)
                </label>
                <input
                  type="number"
                  value={simulation.capaciteInvestissement}
                  onChange={(e) => setSimulation({...simulation, capaciteInvestissement: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Objectifs d'optimisation
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {objectifsDisponibles.map((objectif) => {
                    const Icon = objectif.icon;
                    const isSelected = simulation.objectifs.includes(objectif.id);
                    return (
                      <button
                        key={objectif.id}
                        onClick={() => handleObjectifChange(objectif.id)}
                        className={`p-4 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#c5a572]/20 border-[#c5a572] text-white'
                            : 'bg-[#162238]/50 border-[#c5a572]/20 text-gray-300 hover:border-[#c5a572]/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{objectif.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSimuler}
                disabled={isCalculating || simulation.objectifs.length === 0}
                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCalculating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#162238] border-t-transparent rounded-full animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    Analyser mes optimisations
                  </>
                )}
              </button>
            </div>

            {/* Résultats */}
            {resultat && (
              <div className="space-y-6">
                {/* Résumé principal */}
                <div className="bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/10 border border-[#c5a572]/20 rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#c5a572] mb-2">{resultat.economieTotale.toLocaleString('fr-FR')} €</div>
                    <div className="text-white font-medium text-lg">Économies potentielles</div>
                    <div className="text-gray-400 text-sm">par an</div>
                  </div>
                </div>

                {/* Impact sur la conscience */}
                <div className="bg-[#162238]/50 rounded-xl p-6 border border-[#c5a572]/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6 text-[#c5a572]" />
                    <h3 className="text-xl font-bold text-white">Impact sur votre conscience fiscale</h3>
                  </div>
                  <p className="text-gray-300 text-lg">{resultat.impactConscience}</p>
                </div>

                {/* Stratégies recommandées */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Stratégies recommandées</h3>
                  {resultat.strategies.map((strategie, index) => {
                    const Icon = strategie.icon;
                    return (
                      <div key={index} className="bg-[#162238]/50 rounded-xl p-6 border border-[#c5a572]/20">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${strategie.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-white">{strategie.nom}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  strategie.difficulte === 'facile' ? 'bg-green-500/20 text-green-300' :
                                  strategie.difficulte === 'moyenne' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-red-500/20 text-red-300'
                                }`}>
                                  {strategie.difficulte}
                                </span>
                                <span className="text-gray-400 text-sm">{strategie.delai}</span>
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm mb-3">{strategie.description}</p>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-gray-400 text-sm">Économie:</span>
                                <span className="text-[#c5a572] font-semibold ml-2">{strategie.economie.toLocaleString('fr-FR')} €</span>
                              </div>
                              {strategie.investissement > 0 && (
                                <div>
                                  <span className="text-gray-400 text-sm">Investissement:</span>
                                  <span className="text-white font-semibold ml-2">{strategie.investissement.toLocaleString('fr-FR')} €</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Conseils */}
                {resultat.conseils.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white">Conseils personnalisés</h4>
                    {resultat.conseils.map((conseil, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-gray-300 text-sm">{conseil}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-yellow-400 font-semibold text-sm">Simulation indicative</div>
                <div className="text-gray-300 text-sm">
                  Ces optimisations sont basées sur votre situation actuelle. 
                  Consultez un professionnel pour valider les stratégies et leur mise en œuvre.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 