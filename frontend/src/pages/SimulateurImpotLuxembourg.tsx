import React, { useState } from 'react';
import { Calculator, Euro, TrendingUp, AlertCircle, Info } from 'lucide-react';

interface LuxembourgTaxData {
  revenu_net: number;
  situation_familiale: string;
  nombre_enfants: number;
  residence_principale: boolean;
  residence_secondaire: boolean;
}

interface LuxembourgTaxResult {
  revenu_net: number;
  impot_luxembourg: number;
  taux_moyen: number;
  tranches_applicables: Array<{
    tranche: string;
    taux: string;
    base_imposable: string;
    impot_tranche: string;
  }>;
  conseils_optimisation: string[];
}

const SimulateurImpotLuxembourg: React.FC = () => {
  const [formData, setFormData] = useState<LuxembourgTaxData>({
    revenu_net: 0,
    situation_familiale: 'celibataire',
    nombre_enfants: 0,
    residence_principale: false,
    residence_secondaire: false,
  });

  const [result, setResult] = useState<LuxembourgTaxResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const calculateTax = async () => {
    if (formData.revenu_net <= 0) {
      alert('Veuillez saisir un revenu net valide');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/tools/calc-luxembourg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          revenu_net: formData.revenu_net,
          situation_familiale: formData.situation_familiale,
          nombre_enfants: formData.nombre_enfants,
          residence_principale: formData.residence_principale,
          residence_secondaire: formData.residence_secondaire,
        }),
      });

      if (response.ok) {
        const taxResult = await response.json();
        setResult(taxResult);
      } else {
        alert('Erreur lors du calcul');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calculator className="h-12 w-12 text-[#c5a572]" />
              <h1 className="text-3xl font-bold">Simulateur d'Impôt Luxembourg</h1>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-sm text-red-200">🇱🇺 Luxembourg</span>
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Calculez vos impôts sur le revenu au Luxembourg selon le barème 2025
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulaire */}
            <div className="bg-[#1a2942]/50 backdrop-blur-sm rounded-2xl p-8 border border-[#c5a572]/20">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Euro className="h-6 w-6 text-[#c5a572]" />
                Informations fiscales
              </h2>

              <div className="space-y-6">
                {/* Revenu net */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Revenu net annuel (€)
                  </label>
                  <input
                    type="number"
                    name="revenu_net"
                    value={formData.revenu_net}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                    placeholder="50000"
                    min="0"
                  />
                </div>

                {/* Situation familiale */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Situation familiale
                  </label>
                  <select
                    name="situation_familiale"
                    value={formData.situation_familiale}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                  >
                    <option value="celibataire">Célibataire</option>
                    <option value="marie">Marié(e)</option>
                    <option value="pacs">PACS</option>
                  </select>
                </div>

                {/* Nombre d'enfants */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre d'enfants à charge
                  </label>
                  <input
                    type="number"
                    name="nombre_enfants"
                    value={formData.nombre_enfants}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1a2942]/50 border border-[#c5a572]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-[#c5a572]"
                    min="0"
                    max="10"
                  />
                </div>

                {/* Résidences */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="residence_principale"
                      checked={formData.residence_principale}
                      onChange={handleInputChange}
                      className="mr-3 w-4 h-4 text-[#c5a572] bg-[#1a2942] border-[#c5a572] rounded focus:ring-[#c5a572] focus:ring-2"
                    />
                    <label className="text-sm">Propriétaire résidence principale</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="residence_secondaire"
                      checked={formData.residence_secondaire}
                      onChange={handleInputChange}
                      className="mr-3 w-4 h-4 text-[#c5a572] bg-[#1a2942] border-[#c5a572] rounded focus:ring-[#c5a572] focus:ring-2"
                    />
                    <label className="text-sm">Résidence secondaire</label>
                  </div>
                </div>

                {/* Bouton calcul */}
                <button
                  onClick={calculateTax}
                  disabled={isLoading || formData.revenu_net <= 0}
                  className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-[#c5a572]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Calcul en cours...' : 'Calculer mon impôt'}
                </button>
              </div>
            </div>

            {/* Résultats */}
            <div className="bg-[#1a2942]/50 backdrop-blur-sm rounded-2xl p-8 border border-[#c5a572]/20">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-[#c5a572]" />
                Résultats du calcul
              </h2>

              {result ? (
                <div className="space-y-6">
                  {/* Résumé principal */}
                  <div className="bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/10 border border-[#c5a572]/20 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-[#c5a572] mb-2">
                      {result.impot_luxembourg.toLocaleString('fr-FR')}€
                    </div>
                    <div className="text-white font-medium">Impôt sur le revenu</div>
                    <div className="text-gray-400 text-sm">Taux moyen: {result.taux_moyen.toFixed(1)}%</div>
                  </div>

                  {/* Détails des tranches */}
                  {result.tranches_applicables.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Détail des tranches</h3>
                      <div className="space-y-2">
                        {result.tranches_applicables.map((tranche, index) => (
                          <div key={index} className="flex justify-between items-center bg-[#162238] rounded-lg p-3">
                            <div>
                              <div className="text-white font-medium">{tranche.tranche}</div>
                              <div className="text-gray-400 text-sm">Base: {tranche.base_imposable}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[#c5a572] font-bold">{tranche.taux}</div>
                              <div className="text-gray-400 text-sm">{tranche.impot_tranche}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conseils d'optimisation */}
                  {result.conseils_optimisation.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4 text-[#c5a572]" />
                        Conseils d'optimisation
                      </h3>
                      <div className="space-y-2">
                        {result.conseils_optimisation.map((conseil, index) => (
                          <div key={index} className="flex items-start gap-3 bg-[#162238] rounded-lg p-3">
                            <div className="text-[#c5a572] text-lg">💡</div>
                            <div className="text-gray-300 text-sm">{conseil}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>Remplissez le formulaire et cliquez sur "Calculer"</p>
                </div>
              )}
            </div>
          </div>

          {/* Informations légales */}
          <div className="mt-8 bg-[#1a2942]/30 rounded-xl p-6 border border-[#c5a572]/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#c5a572] mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Informations importantes</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Ce simulateur utilise le barème fiscal luxembourgeois 2025</li>
                  <li>• Les résultats sont donnés à titre indicatif</li>
                  <li>• Consultez un professionnel pour une analyse personnalisée</li>
                  <li>• Les déductions et crédits d'impôt ne sont pas inclus</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulateurImpotLuxembourg; 