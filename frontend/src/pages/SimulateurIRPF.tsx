import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

interface SimulationData {
  revenuNet: number;
}

interface ResultatSimulation {
  irpf: number;
  tauxMoyen: number;
}

export function SimulateurIRPF() {
  const [data, setData] = useState<SimulationData>({ revenuNet: 30000 });
  const [result, setResult] = useState<ResultatSimulation | null>(null);

  const calculIRPF = (revenuNet: number): ResultatSimulation => {
    let impôt = 0;
    if (revenuNet > 40000) {
      impôt += (revenuNet - 40000) * 0.10;
      revenuNet = 40000;
    }
    if (revenuNet > 24000) {
      impôt += (revenuNet - 24000) * 0.05;
    }
    const tauxMoyen = data.revenuNet > 0 ? (impôt / data.revenuNet) * 100 : 0;
    return { irpf: Math.round(impôt), tauxMoyen: Math.round(tauxMoyen * 100) / 100 };
  };

  const handleSimuler = () => {
    const res = calculIRPF(data.revenuNet);
    setResult(res);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0F1B2F] to-[#162238] text-white">
      <header className="bg-[#0A1628]/95 backdrop-blur-sm border-b border-[#c5a572]/20 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#162238]" />
            </div>
            <span className="font-bold text-white text-xl">Francis Andorre</span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#c5a572]" /> Simulateur IRPF
          </h1>

          <div className="bg-[#ffffff0d] p-6 rounded-lg border border-[#c5a572]/20 mb-6 max-w-md">
            <label htmlFor="revenuNet" className="block text-sm mb-2">Revenu net imposable (€)</label>
            <input
              id="revenuNet"
              type="number"
              value={data.revenuNet}
              onChange={(e) => setData({ revenuNet: Number(e.target.value) })}
              className="w-full p-3 bg-transparent border border-[#c5a572]/30 rounded-lg focus:outline-none"
              placeholder="ex. 30 000"
            />
            <button
              onClick={handleSimuler}
              className="mt-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] px-6 py-2 rounded-lg font-semibold"
            >
              Calculer
            </button>
          </div>

          {result && (
            <div className="bg-[#ffffff0d] p-6 rounded-lg border border-[#c5a572]/20 max-w-md">
              <h2 className="text-2xl font-bold mb-4">Résultat</h2>
              <p className="mb-2">IRPF estimé : <span className="font-semibold">{result.irpf.toLocaleString()} €</span></p>
              <p>Taux moyen : <span className="font-semibold">{result.tauxMoyen}%</span></p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 