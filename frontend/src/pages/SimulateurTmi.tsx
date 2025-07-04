import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Bot, ArrowRight, TrendingUp, Info, CheckCircle, AlertCircle, BarChart3, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface SimulationData {
  revenuAnnuel: number;
  situationFamiliale: 'celibataire' | 'marie' | 'pacs';
  nombreEnfants: number;
  chargesDeductibles: number;
}

interface ResultatSimulation {
  revenuImposable: number;
  quotientFamilial: number;
  tmi: number;
  impotEstime: number;
  tranchesApplicables: Array<{
    tranche: string;
    montant: number;
    taux: number;
    impot: number;
  }>;
  conseils: string[];
  optimisations: Array<{
    nom: string;
    economie: number;
    description: string;
  }>;
}

export function SimulateurTmi() {
  const [simulation, setSimulation] = useState<SimulationData>({
    revenuAnnuel: 50000,
    situationFamiliale: 'celibataire',
    nombreEnfants: 0,
    chargesDeductibles: 0
  });
  
  const [resultat, setResultat] = useState<ResultatSimulation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculerTMI = (data: SimulationData): ResultatSimulation => {
    const { revenuAnnuel, situationFamiliale, nombreEnfants, chargesDeductibles } = data;
    
    // Calcul du revenu imposable
    const revenuImposable = Math.max(0, revenuAnnuel - chargesDeductibles);
    
    // Calcul des parts fiscales
    let parts = 1;
    if (situationFamiliale === 'marie' || situationFamiliale === 'pacs') parts = 2;
    parts += nombreEnfants * 0.5;
    
    const quotientFamilial = revenuImposable / parts;
    
    // Barème 2025
    const bareme = [
      { limite: 0, taux: 0, nom: "Tranche 0%" },
      { limite: 11294, taux: 11, nom: "Tranche 11%" },
      { limite: 28797, taux: 30, nom: "Tranche 30%" },
      { limite: 82341, taux: 41, nom: "Tranche 41%" },
      { limite: 177106, taux: 45, nom: "Tranche 45%" },
      { limite: Infinity, taux: 49, nom: "Tranche 49%" }
    ];
    
    // Calcul de l'impôt par tranche
    let impotTotal = 0;
    let tmi = 0;
    const tranchesApplicables = [];
    
    for (let i = 1; i < bareme.length; i++) {
      const tranchePrecedente = bareme[i - 1];
      const trancheActuelle = bareme[i];
      
      if (quotientFamilial > tranchePrecedente.limite) {
        const montantTranche = Math.min(quotientFamilial - tranchePrecedente.limite, 
                                       trancheActuelle.limite - tranchePrecedente.limite);
        const impotTranche = montantTranche * (trancheActuelle.taux / 100);
        
        if (montantTranche > 0) {
          tranchesApplicables.push({
            tranche: trancheActuelle.nom,
            montant: montantTranche,
            taux: trancheActuelle.taux,
            impot: impotTranche
          });
          
          impotTotal += impotTranche;
          tmi = Math.max(tmi, trancheActuelle.taux);
        }
      }
    }
    
    const impotFinal = Math.round(impotTotal * parts);
    
    // Conseils et optimisations
    const conseils = [];
    const optimisations = [];
    
    if (tmi >= 41) {
      conseils.push("Votre TMI est élevé. Considérez les optimisations fiscales.");
      optimisations.push({
        nom: "Plan Épargne Retraite (PER)",
        economie: Math.round(revenuAnnuel * 0.1 * (tmi / 100)),
        description: `Versement de ${Math.round(revenuAnnuel * 0.1).toLocaleString()}€ = économie d'impôt`
      });
    }
    
    if (nombreEnfants === 0 && revenuAnnuel > 40000) {
      conseils.push("Considérez l'investissement immobilier pour optimiser votre fiscalité.");
    }
    
    if (chargesDeductibles === 0 && revenuAnnuel > 30000) {
      conseils.push("Vérifiez vos charges déductibles (frais professionnels, dons, etc.).");
    }
    
    return {
      revenuImposable,
      quotientFamilial,
      tmi,
      impotEstime: impotFinal,
      tranchesApplicables,
      conseils,
      optimisations
    };
  };

  const handleSimuler = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const result = calculerTMI(simulation);
      setResultat(result);
      setIsCalculating(false);
    }, 1000);
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
              <Target className="w-10 h-10 text-[#162238]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Calculateur TMI 2025</h1>
            <p className="text-gray-400 text-lg">
              Calculez votre Taux Marginal d'Imposition avec précision
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
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Situation familiale
                </label>
                <select
                  value={simulation.situationFamiliale}
                  onChange={(e) => setSimulation({...simulation, situationFamiliale: e.target.value as any})}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                  aria-label="Situation familiale"
                >
                  <option value="celibataire">Célibataire</option>
                  <option value="marie">Marié(e)</option>
                  <option value="pacs">PACS</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Nombre d'enfants à charge
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={simulation.nombreEnfants}
                  onChange={(e) => setSimulation({...simulation, nombreEnfants: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Charges déductibles (€)
                </label>
                <input
                  type="number"
                  value={simulation.chargesDeductibles}
                  onChange={(e) => setSimulation({...simulation, chargesDeductibles: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                  placeholder="0"
                />
              </div>

              <button
                onClick={handleSimuler}
                disabled={isCalculating}
                className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCalculating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#162238] border-t-transparent rounded-full animate-spin" />
                    Calcul en cours...
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5" />
                    Calculer mon TMI
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
                    <div className="text-4xl font-bold text-[#c5a572] mb-2">{resultat.tmi}%</div>
                    <div className="text-white font-medium text-lg">Taux Marginal d'Imposition</div>
                    <div className="text-gray-400 text-sm">Barème 2025</div>
                  </div>
                </div>

                {/* Détails du calcul */}
                <div className="bg-[#162238]/50 rounded-xl p-6 border border-[#c5a572]/20">
                  <h3 className="text-xl font-bold text-white mb-4">Détails du calcul</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Revenu imposable:</span>
                      <span className="text-white font-semibold">{resultat.revenuImposable.toLocaleString('fr-FR')} €</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Quotient familial:</span>
                      <span className="text-white font-semibold">{resultat.quotientFamilial.toLocaleString('fr-FR')} €</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Impôt estimé:</span>
                      <span className="text-[#c5a572] font-bold text-lg">{resultat.impotEstime.toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>
                </div>

                {/* Tranches applicables */}
                {resultat.tranchesApplicables.length > 0 && (
                  <div className="bg-[#162238]/50 rounded-xl p-6 border border-[#c5a572]/20">
                    <h3 className="text-xl font-bold text-white mb-4">Tranches applicables</h3>
                    <div className="space-y-3">
                      {resultat.tranchesApplicables.map((tranche, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-[#1a2332]/50 rounded-lg">
                          <div>
                            <div className="text-white font-medium">{tranche.tranche}</div>
                            <div className="text-gray-400 text-sm">{tranche.montant.toLocaleString('fr-FR')} €</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#c5a572] font-semibold">{tranche.taux}%</div>
                            <div className="text-white text-sm">{tranche.impot.toLocaleString('fr-FR')} €</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optimisations */}
                {resultat.optimisations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white">Optimisations possibles</h4>
                    {resultat.optimisations.map((opti, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                        <Zap className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-white font-semibold">{opti.nom}</div>
                          <div className="text-gray-300 text-sm">{opti.description}</div>
                          <div className="text-green-400 font-medium">Économie: {opti.economie.toLocaleString('fr-FR')} €</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Conseils */}
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
                  Ce calculateur utilise le barème 2025. Le calcul final peut varier selon votre situation spécifique. 
                  Consultez un professionnel pour une analyse complète.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 