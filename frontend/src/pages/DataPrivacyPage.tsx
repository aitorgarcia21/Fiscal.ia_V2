import React, { useEffect, useState } from 'react';
import { Download, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

interface UserDataExport {
  profile: any | null;
  questions: any[];
}

export default function DataPrivacyPage() {
  const [data, setData] = useState<UserDataExport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletionMsg, setDeletionMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await apiClient<UserDataExport>('/api/my-data');
        setData(result);
      } catch (e: any) {
        setError(e.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownload = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mes_donnees_fiscalia.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRequestDeletion = async () => {
    try {
      const resp = await apiClient<any>('/api/request-delete', { method: 'POST' });
      setDeletionMsg(resp.message || 'Demande prise en compte');
    } catch (e: any) {
      setDeletionMsg(e.message || 'Erreur lors de la demande');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447] text-gray-100 p-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-[#c5a572] hover:text-[#e8cfa0] mb-6">
        <ArrowLeft className="w-5 h-5 mr-1" /> Retour
      </button>
      <h1 className="text-3xl font-bold text-white mb-4">Mes données & RGPD</h1>
      <p className="text-gray-400 mb-8 max-w-xl">Téléchargez l'ensemble des données que Fiscal.ia a enregistrées à votre sujet ou demandez leur suppression définitive, conformément au RGPD.</p>

      {loading && <p>Chargement…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {data && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-[#1a2332] border border-[#c5a572]/20 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-2">Aperçu</h2>
            <p className="text-sm text-gray-400">Profil : {data.profile ? '✅' : '❌'} | Questions enregistrées : {data.questions.length}</p>
          </div>

          <div className="flex gap-4">
            <button onClick={handleDownload} className="flex items-center gap-2 bg-[#c5a572] text-[#162238] px-6 py-3 rounded-lg font-semibold hover:bg-[#e8cfa0] transition-colors">
              <Download className="w-4 h-4" /> Télécharger mes données
            </button>
            <button onClick={handleRequestDeletion} className="flex items-center gap-2 bg-red-600/80 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
              <Trash2 className="w-4 h-4" /> Demander la suppression
            </button>
          </div>

          {deletionMsg && <p className="text-green-400 mt-4">{deletionMsg}</p>}
        </div>
      )}
    </div>
  );
} 