import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, MapPin, PiggyBank, FileText, ArrowRight, Info } from 'lucide-react';

interface TaxResult {
  gross_income: number;
  federal_tax: number;
  cantonal_taxes: {
    cantonal_tax: number;
    communal_tax: number;
    total_cantonal_communal: number;
  };
  social_contributions: {
    total: number;
    avs_ai_apg: number;
    ac: number;
    lpp: number;
  };
  total_tax: number;
  net_income: number;
  effective_rate: number;
  canton: string;
}

interface CantonComparison {
  [key: string]: {
    name: string;
    total_tax: number;
    net_income: number;
    effective_rate: number;
  };
}

const SimulateurImpotSuisse: React.FC = () => {
  const [formData, setFormData] = useState({
    gross_income: 80000,
    canton: 'geneva',
    marital_status: 'single',
    children: 0,
    pillar_3a: 0,
    insurance_premiums: 1500,
    employment_type: 'employed'
  });

  const [result, setResult] = useState<TaxResult | null>(null);
  const [comparison, setComparison] = useState<CantonComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const cantons = {
    'geneva': 'Genève',
    'zurich': 'Zurich',
    'vaud': 'Vaud',
    'valais': 'Valais',
    'bern': 'Berne'
  };

  const calculateTax = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calculate-swiss-tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error('Erreur lors du calcul:', error);
    } finally {
      setLoading(false);
    }
  };

  const compareCantons = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compare-swiss-cantons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setComparison(data.comparison);
        setShowComparison(true);
      }
    } catch (error) {
      console.error('Erreur lors de la comparaison:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateTax();
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] text-gray-100">
      {/* Header */}
      <div className="bg-[#162238]/90 backdrop-blur-lg border-b border-[#2A3F6C]/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-[#c5a572]" />
              <h1 className="text-2xl font-bold text-white">Simulateur d'Impôt Suisse</h1>
            </div>
            <div className="flex items-center gap-2 bg-red-600/20 px-3 py-1 rounded-full">
              <div className="w-4 h-3 bg-red-600 rounded-sm"></div>
              <span className="text-sm text-red-200">🇨🇭 Suisse</span>
            </div>
          </div>
          <p className="text-gray-400 mt-2">
            Calculez vos impôts fédéraux, cantonaux et communaux en Suisse
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-1">
            <div className="bg-[#1E3253]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#2A3F6C]/50">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#c5a572]" />
                Vos informations
              </h2>

              <div className="space-y-6">
                {/* Revenu brut */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Revenu brut annuel (CHF)
                  </label>
                  <input
                    type="number"
                    value={formData.gross_income}
                    onChange={(e) => handleInputChange('gross_income', Number(e.target.value))}
                    className="w-full bg-[#162238]/50 border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c5a572]"
                    placeholder="80000"
                  />
                </div>

                {/* Canton */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Canton de résidence
                  </label>
                  <select
                    value={formData.canton}
                    onChange={(e) => handleInputChange('canton', e.target.value)}
                    className="w-full bg-[#162238]/50 border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c5a572]"
                  >
                    {Object.entries(cantons).map(([code, name]) => (
                      <option key={code} value={code} className="text-black">
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Statut matrimonial */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut matrimonial
                  </label>
                  <select
                    value={formData.marital_status}
                    onChange={(e) => handleInputChange('marital_status', e.target.value)}
                    className="w-full bg-[#162238]/50 border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c5a572]"
                  >
                    <option value="single" className="text-black">Célibataire</option>
                    <option value="married" className="text-black">Marié(e)</option>
                  </select>
                </div>

                {/* Enfants */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre d'enfants
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.children}
                    onChange={(e) => handleInputChange('children', Number(e.target.value))}
                    className="w-full bg-[#162238]/50 border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c5a572]"
                  />
                </div>

                {/* Pilier 3A */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <PiggyBank className="inline h-4 w-4 mr-1" />
                    Pilier 3A (CHF)
                  </label>
                  <input
                    type="number"
                    value={formData.pillar_3a}
                    onChange={(e) => handleInputChange('pillar_3a', Number(e.target.value))}
                    className="w-full bg-[#162238]/50 border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c5a572]"
                    placeholder="7056"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Maximum 2025: CHF 7'056 (salarié)
                  </p>
                </div>

                {/* Primes d'assurance */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Primes d'assurance (CHF)
                  </label>
                  <input
                    type="number"
                    value={formData.insurance_premiums}
                    onChange={(e) => handleInputChange('insurance_premiums', Number(e.target.value))}
                    className="w-full bg-[#162238]/50 border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c5a572]"
                    placeholder="1500"
                  />
                </div>

                {/* Type d'emploi */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type d'emploi
                  </label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => handleInputChange('employment_type', e.target.value)}
                    className="w-full bg-[#162238]/50 border border-[#2A3F6C] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c5a572]"
                  >
                    <option value="employed" className="text-black">Salarié</option>
                    <option value="self_employed" className="text-black">Indépendant</option>
                  </select>
                </div>

                {/* Bouton comparaison */}
                <button
                  onClick={compareCantons}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <TrendingUp className="h-5 w-5" />
                  Comparer les cantons
                </button>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="lg:col-span-2">
            {result && (
              <div className="space-y-6">
                {/* Résumé principal */}
                <div className="bg-[#1E3253]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#2A3F6C]/50">
                  <h2 className="text-xl font-semibold text-white mb-6">
                    Résultats pour {result.canton}
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#162238]/50 rounded-xl p-4">
                      <div className="text-sm text-gray-400 mb-1">Revenu brut</div>
                      <div className="text-2xl font-bold text-white">
                        {formatCurrency(result.gross_income)}
                      </div>
                    </div>
                    
                    <div className="bg-[#162238]/50 rounded-xl p-4">
                      <div className="text-sm text-gray-400 mb-1">Revenu net</div>
                      <div className="text-2xl font-bold text-[#c5a572]">
                        {formatCurrency(result.net_income)}
                      </div>
                    </div>
                    
                    <div className="bg-[#162238]/50 rounded-xl p-4">
                      <div className="text-sm text-gray-400 mb-1">Impôts totaux</div>
                      <div className="text-2xl font-bold text-red-400">
                        {formatCurrency(result.total_tax)}
                      </div>
                    </div>
                    
                    <div className="bg-[#162238]/50 rounded-xl p-4">
                      <div className="text-sm text-gray-400 mb-1">Taux effectif</div>
                      <div className="text-2xl font-bold text-orange-400">
                        {result.effective_rate}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Détail des impôts */}
                <div className="bg-[#1E3253]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#2A3F6C]/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Détail des impôts</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-[#2A3F6C]/30">
                      <span className="text-gray-300">Impôt fédéral direct</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(result.federal_tax)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-[#2A3F6C]/30">
                      <span className="text-gray-300">Impôt cantonal</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(result.cantonal_taxes.cantonal_tax)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-[#2A3F6C]/30">
                      <span className="text-gray-300">Impôt communal</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(result.cantonal_taxes.communal_tax)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cotisations sociales */}
                <div className="bg-[#1E3253]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#2A3F6C]/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Cotisations sociales</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-[#2A3F6C]/30">
                      <span className="text-gray-300">AVS/AI/APG</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(result.social_contributions.avs_ai_apg)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-[#2A3F6C]/30">
                      <span className="text-gray-300">Assurance chômage</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(result.social_contributions.ac)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-[#2A3F6C]/30">
                      <span className="text-gray-300">LPP (Pilier 2)</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(result.social_contributions.lpp)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 pt-4 border-t border-[#c5a572]/30">
                      <span className="text-[#c5a572] font-semibold">Total cotisations</span>
                      <span className="font-bold text-[#c5a572]">
                        {formatCurrency(result.social_contributions.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparaison des cantons */}
        {showComparison && comparison && (
          <div className="mt-8 bg-[#1E3253]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#2A3F6C]/50">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#c5a572]" />
              Comparaison des cantons
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(comparison)
                .sort(([,a], [,b]) => a.total_tax - b.total_tax)
                .map(([code, data], index) => (
                <div 
                  key={code} 
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    index === 0 
                      ? 'bg-green-900/20 border-green-500/50' 
                      : 'bg-[#162238]/50 border-[#2A3F6C]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{data.name}</h4>
                    {index === 0 && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                        Optimal
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Impôts totaux</span>
                      <span className="text-white font-medium">
                        {formatCurrency(data.total_tax)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Revenu net</span>
                      <span className="text-[#c5a572] font-medium">
                        {formatCurrency(data.net_income)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Taux effectif</span>
                      <span className="text-orange-400 font-medium">
                        {data.effective_rate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informations légales */}
        <div className="mt-8 bg-blue-900/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Informations importantes</p>
              <p>
                Ces calculs sont basés sur les barèmes fiscaux 2025 et sont donnés à titre indicatif. 
                Les taux peuvent varier selon les communes. Consultez un expert fiscal pour des conseils personnalisés.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulateurImpotSuisse; 