import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Bot, ArrowRight, TrendingUp, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SimulationData {
  montantHT: number;
  typeTVA: 'normal' | 'reduit' | 'superreduit' | 'particulier';
}

interface ResultatSimulation {
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  tauxTVA: number;
  conseils: string[];
}

export function SimulateurTvaLuxembourg() {
  const [simulation, setSimulation] = useState<SimulationData>({
    montantHT: 1000,
    typeTVA: 'normal'
  });
  
  const [resultat, setResultat] = useState<ResultatSimulation | null>(null);

  const calculerTVA = (data: SimulationData): ResultatSimulation => {
    const { montantHT, typeTVA } = data;
    
    let tauxTVA = 0;
    switch (typeTVA) {
      case 'normal':
        tauxTVA = 17;
        break;
      case 'reduit':
        tauxTVA = 14;
        break;
      case 'superreduit':
        tauxTVA = 8;
        break;
      case 'particulier':
        tauxTVA = 3;
        break;
    }

    const montantTVA = montantHT * (tauxTVA / 100);
    const montantTTC = montantHT + montantTVA;

    const conseils = [];
    if (montantHT > 10000) {
      conseils.push("Pour des montants élevés, vérifiez l'éligibilité aux taux réduits");
    }
    if (typeTVA === 'normal') {
      conseils.push("Taux normal applicable à la plupart des biens et services");
    }
    if (typeTVA === 'reduit') {
      conseils.push("Taux réduit pour les biens de première nécessité");
    }
    if (typeTVA === 'superreduit') {
      conseils.push("Taux super-réduit pour les produits de base");
    }
    if (typeTVA === 'particulier') {
      conseils.push("Taux particulier pour certains services spécifiques");
    }

    return {
      montantHT,
      montantTVA: Math.round(montantTVA * 100) / 100,
      montantTTC: Math.round(montantTTC * 100) / 100,
      tauxTVA,
      conseils
    };
  };

  const handleSimuler = () => {
    const result = calculerTVA(simulation);
    setResultat(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0F1B2F] to-[#162238] text-white">
      <header className="bg-[#0A1628]/95 backdrop-blur-sm border-b border-[#c5a572]/20 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#162238]" />
            </div>
            <span className="font-bold text-white text-xl">Francis Luxembourg</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1a2332]/60 backdrop-blur-sm border border-[#c5a572]/20 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-full flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-10 h-10 text-[#162238]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Calculateur TVA Luxembourg</h1>
            <p className="text-gray-400 text-lg">
              Calculez la TVA luxembourgeoise (17%, 14%, 8%, 3%)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire */}
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Montant HT (€)
                </label>
                <input
                  type="number"
                  value={simulation.montantHT}
                  onChange={(e) => setSimulation({...simulation, montantHT: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg text-white focus:outline-none focus:border-[#c5a572] text-lg"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Type de TVA
                </label>
                <select
                  value={simulation.typeTVA}
                  onChange={(e) => setSimulation({...simulation, typeTVA: e.target.value as any})}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                  aria-label="Type de TVA"
                >
                  <option value="normal">TVA normale (17%)</option>
                  <option value="reduit">TVA réduite (14%)</option>
                  <option value="superreduit">TVA super-réduite (8%)</option>
                  <option value="particulier">TVA particulière (3%)</option>
                </select>
              </div>

              <button
                onClick={handleSimuler}
                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Calculer la TVA
              </button>
            </div>

            {/* Résultats */}
            {resultat && (
              <div className="space-y-6">
                <div className="bg-[#162238]/50 rounded-xl p-6 border border-[#c5a572]/20">
                  <h3 className="text-xl font-bold text-white mb-4">Résultats du calcul</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Montant HT:</span>
                      <span className="text-white font-semibold">{resultat.montantHT.toLocaleString('fr-FR')} €</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Taux TVA:</span>
                      <span className="text-[#c5a572] font-semibold">{resultat.tauxTVA}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Montant TVA:</span>
                      <span className="text-white font-semibold">{resultat.montantTVA.toLocaleString('fr-FR')} €</span>
                    </div>
                    
                    <div className="border-t border-[#c5a572]/20 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold text-lg">Total TTC:</span>
                        <span className="text-[#c5a572] font-bold text-xl">{resultat.montantTTC.toLocaleString('fr-FR')} €</span>
                      </div>
                    </div>
                  </div>
                </div>

                {resultat.conseils.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white">Conseils</h4>
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
                <div className="text-yellow-400 font-semibold text-sm">Calcul indicatif</div>
                <div className="text-gray-300 text-sm">
                  Ce calculateur utilise les taux de TVA luxembourgeois. 
                  Certains produits peuvent bénéficier d'exemptions spécifiques. 
                  Consultez un professionnel pour des cas complexes.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 