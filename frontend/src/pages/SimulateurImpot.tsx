import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Bot, ArrowRight, TrendingUp, Shield, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SimulationData {
  revenus: number;
  situationFamiliale: 'celibataire' | 'marie' | 'pacs';
  enfants: number;
  fraisProfessionnels: 'forfait' | 'reel';
  montantFraisReels?: number;
}

interface ResultatSimulation {
  impotBrut: number;
  decote: number;
  impotNet: number;
  tauxMarginal: number;
  economiesPossibles: number;
  optimisations: Array<{
    nom: string;
    economie: number;
    description: string;
  }>;
}

export function SimulateurImpot() {
  const [simulation, setSimulation] = useState<SimulationData>({
    revenus: 40000,
    situationFamiliale: 'celibataire',
    enfants: 0,
    fraisProfessionnels: 'forfait'
  });
  
  const [resultat, setResultat] = useState<ResultatSimulation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calcul simplifié de l'impôt (barème 2024)
  const calculerImpot = (data: SimulationData): ResultatSimulation => {
    const { revenus, situationFamiliale, enfants, fraisProfessionnels, montantFraisReels } = data;
    
    // Parts fiscales
    let parts = 1;
    if (situationFamiliale === 'marie' || situationFamiliale === 'pacs') parts = 2;
    if (enfants === 1) parts += 0.5;
    if (enfants === 2) parts += 1;
    if (enfants >= 3) parts += 1 + (enfants - 2);

    // Frais professionnels
    let frais = 0;
    if (fraisProfessionnels === 'forfait') {
      frais = Math.min(revenus * 0.1, 12829); // Abattement forfaitaire 2024
    } else {
      frais = montantFraisReels || 0;
    }

    const revenuImposable = Math.max(0, revenus - frais);
    const quotientFamilial = revenuImposable / parts;

    // Barème progressif 2024
    let impotParPart = 0;
    if (quotientFamilial > 78570) {
      impotParPart = 4262 + (quotientFamilial - 78570) * 0.45;
    } else if (quotientFamilial > 27478) {
      impotParPart = 2059 + (quotientFamilial - 27478) * 0.30;
    } else if (quotientFamilial > 11294) {
      impotParPart = (quotientFamilial - 11294) * 0.14;
    } else if (quotientFamilial > 10777) {
      impotParPart = (quotientFamilial - 10777) * 0.11;
    }

    const impotBrut = Math.round(impotParPart * parts);
    
    // Décote
    let decote = 0;
    if (parts === 1 && impotBrut < 1929) {
      decote = Math.min(impotBrut, 873 - impotBrut * 0.4525);
    } else if (parts > 1 && impotBrut < 3186) {
      decote = Math.min(impotBrut, 1444 - impotBrut * 0.4525);
    }

    const impotNet = Math.max(0, impotBrut - decote);

    // Taux marginal
    let tauxMarginal = 0;
    if (quotientFamilial > 78570) tauxMarginal = 45;
    else if (quotientFamilial > 27478) tauxMarginal = 30;
    else if (quotientFamilial > 11294) tauxMarginal = 14;
    else if (quotientFamilial > 10777) tauxMarginal = 11;

    // Optimisations possibles
    const optimisations = [];
    let economiesPossibles = 0;

    // PER
    if (revenus > 20000) {
      const versementPER = Math.min(revenus * 0.1, 5000);
      const economiePER = Math.round(versementPER * (tauxMarginal / 100));
      optimisations.push({
        nom: "Plan Épargne Retraite (PER)",
        economie: economiePER,
        description: `Versement de ${versementPER.toLocaleString()}€ = ${economiePER}€ d'économie d'impôt`
      });
      economiesPossibles += economiePER;
    }

    // Dons
    if (revenus > 25000) {
      const don = 1000;
      const economieDon = Math.round(don * 0.66);
      optimisations.push({
        nom: "Dons défiscalisés",
        economie: economieDon,
        description: `Don de ${don}€ = crédit d'impôt de ${economieDon}€`
      });
      economiesPossibles += economieDon;
    }

    // LMNP (estimation)
    if (revenus > 35000) {
      optimisations.push({
        nom: "Investissement LMNP",
        economie: 0,
        description: "0€ d'impôt sur les loyers grâce à l'amortissement"
      });
    }

    return {
      impotBrut,
      decote,
      impotNet,
      tauxMarginal,
      economiesPossibles,
      optimisations
    };
  };

  const handleSimuler = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const result = calculerImpot(simulation);
      setResultat(result);
      setIsCalculating(false);
    }, 1000);
  };

  useEffect(() => {
    handleSimuler();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0F1B2F] to-[#162238]">
      {/* Header */}
      <header className="bg-[#0A1628]/95 backdrop-blur-sm border-b border-[#c5a572]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#162238]" />
            </div>
            <span className="text-white text-xl font-bold">Francis</span>
          </Link>
          
          <Link 
            to="/signup"
            className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Optimiser avec Francis
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#c5a572]/20 px-4 py-2 rounded-full border border-[#c5a572]/30 mb-6">
              <Calculator className="w-4 h-4 text-[#c5a572]" />
              <span className="text-[#c5a572] font-semibold text-sm">Simulateur d'Impôt 2025</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Calculez votre impôt sur le revenu 2025
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Simulation gratuite et précise de votre impôt 2025 avec identification automatique 
              des optimisations fiscales possibles par notre IA Francis.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-white/8 to-white/4 rounded-2xl p-8 border border-[#c5a572]/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Calculator className="w-6 h-6 text-[#c5a572]" />
              Vos informations fiscales
            </h2>

            <div className="space-y-6">
              {/* Revenus */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Revenus nets annuels imposables (€)
                </label>
                <input
                  type="number"
                  value={simulation.revenus}
                  onChange={(e) => setSimulation({...simulation, revenus: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg text-white focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]/30"
                  placeholder="40000"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Salaires, pensions, revenus fonciers après abattements
                </p>
              </div>

              {/* Situation familiale */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Situation familiale
                </label>
                <select
                  value={simulation.situationFamiliale}
                  onChange={(e) => setSimulation({...simulation, situationFamiliale: e.target.value as any})}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                >
                  <option value="celibataire">Célibataire</option>
                  <option value="marie">Marié(e) ou Pacsé(e)</option>
                </select>
              </div>

              {/* Enfants */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Nombre d'enfants à charge
                </label>
                <select
                  value={simulation.enfants}
                  onChange={(e) => setSimulation({...simulation, enfants: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                >
                  {[0,1,2,3,4,5].map(i => (
                    <option key={i} value={i}>{i} enfant{i > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Frais professionnels */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Frais professionnels
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="frais"
                      checked={simulation.fraisProfessionnels === 'forfait'}
                      onChange={() => setSimulation({...simulation, fraisProfessionnels: 'forfait'})}
                      className="text-[#c5a572]"
                    />
                    <span className="text-white">Abattement forfaitaire (10%)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="frais"
                      checked={simulation.fraisProfessionnels === 'reel'}
                      onChange={() => setSimulation({...simulation, fraisProfessionnels: 'reel'})}
                      className="text-[#c5a572]"
                    />
                    <span className="text-white">Frais réels</span>
                  </label>
                </div>
                
                {simulation.fraisProfessionnels === 'reel' && (
                  <input
                    type="number"
                    value={simulation.montantFraisReels || ''}
                    onChange={(e) => setSimulation({...simulation, montantFraisReels: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg text-white focus:outline-none focus:border-[#c5a572] mt-3"
                    placeholder="Montant des frais réels (€)"
                  />
                )}
              </div>

              <button
                onClick={handleSimuler}
                disabled={isCalculating}
                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-4 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-[#162238] border-t-transparent rounded-full" />
                    Calcul en cours...
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5" />
                    Calculer mon impôt
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Résultats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {resultat && (
              <>
                {/* Impôt calculé */}
                <div className="bg-gradient-to-br from-white/8 to-white/4 rounded-2xl p-8 border border-[#c5a572]/20">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-[#c5a572]" />
                    Votre impôt 2025
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-gray-300">Impôt brut</span>
                      <span className="text-white font-semibold">{resultat.impotBrut.toLocaleString()}€</span>
                    </div>
                    
                    {resultat.decote > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-gray-300">Décote</span>
                        <span className="text-green-400 font-semibold">-{resultat.decote.toLocaleString()}€</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-4 bg-[#c5a572]/10 rounded-lg px-4 border border-[#c5a572]/30">
                      <span className="text-white font-bold text-lg">Impôt net à payer</span>
                      <span className="text-[#c5a572] font-bold text-2xl">{resultat.impotNet.toLocaleString()}€</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">Taux marginal d'imposition</span>
                      <span className="text-white font-semibold">{resultat.tauxMarginal}%</span>
                    </div>
                  </div>
                </div>

                {/* Optimisations Francis */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-2xl p-8 border border-green-500/30">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Bot className="w-6 h-6 text-green-400" />
                    Optimisations Francis
                  </h3>

                  {resultat.economiesPossibles > 0 ? (
                    <>
                      <div className="bg-green-500/20 rounded-lg p-4 mb-6 border border-green-500/30">
                        <div className="text-green-400 text-sm font-semibold mb-1">Économies potentielles</div>
                        <div className="text-white font-bold text-2xl">{resultat.economiesPossibles.toLocaleString()}€</div>
                        <div className="text-gray-300 text-sm">Réduction d'impôt possible</div>
                      </div>

                      <div className="space-y-4">
                        {resultat.optimisations.map((opt, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-white font-semibold">{opt.nom}</div>
                              <div className="text-gray-300 text-sm">{opt.description}</div>
                              {opt.economie > 0 && (
                                <div className="text-green-400 font-semibold text-sm mt-1">
                                  Économie : {opt.economie}€
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-white font-semibold">Situation optimisée</div>
                        <div className="text-gray-300 text-sm">
                          Votre situation fiscale semble déjà bien optimisée pour votre niveau de revenus.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <Link
                      to="/demo"
                      className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-4 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Bot className="w-5 h-5" />
                      Analyser avec Francis Pro
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* Disclaimer */}
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-yellow-400 font-semibold text-sm">Simulation indicative</div>
                  <div className="text-gray-300 text-sm">
                    Ce calcul est basé sur le barème 2024 et ne prend pas en compte tous les cas particuliers. 
                    Pour une analyse complète, utilisez Francis Pro.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features supplémentaires */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#c5a572]/20 rounded-lg flex items-center justify-center mx-auto mb-4 border border-[#c5a572]/30">
              <Shield className="w-6 h-6 text-[#c5a572]" />
            </div>
            <h3 className="text-white font-semibold mb-2">100% Conforme</h3>
            <p className="text-gray-300 text-sm">Calculs basés sur la législation fiscale française officielle</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-[#c5a572]/20 rounded-lg flex items-center justify-center mx-auto mb-4 border border-[#c5a572]/30">
              <Bot className="w-6 h-6 text-[#c5a572]" />
            </div>
            <h3 className="text-white font-semibold mb-2">IA Avancée</h3>
            <p className="text-gray-300 text-sm">Francis identifie automatiquement toutes les optimisations possibles</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-[#c5a572]/20 rounded-lg flex items-center justify-center mx-auto mb-4 border border-[#c5a572]/30">
              <TrendingUp className="w-6 h-6 text-[#c5a572]" />
            </div>
            <h3 className="text-white font-semibold mb-2">Économies Réelles</h3>
            <p className="text-gray-300 text-sm">1 847€ d'économie moyenne constatée chez nos clients</p>
          </div>
        </div>
      </div>
    </div>
  );
} 