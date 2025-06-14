import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, Save, AlertCircle, CheckCircle as CheckCircleIcon, UserCog } from 'lucide-react';

interface UserProfileData {
  auth_user_id?: string; 
  tmi: number | null;
  situation_familiale: string | null;
  nombre_enfants: number | null;
  residence_principale: boolean | null;
  residence_secondaire: boolean | null;
  revenus_annuels: number | null;
  charges_deductibles: number | null;
}

const initialProfileData: Omit<UserProfileData, 'auth_user_id'> = {
  tmi: null,
  situation_familiale: '',
  nombre_enfants: null,
  residence_principale: null,
  residence_secondaire: null,
  revenus_annuels: null,
  charges_deductibles: null,
};

export function UserProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); 
  const [profileData, setProfileData] = useState<Omit<UserProfileData, 'auth_user_id'>>(initialProfileData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const authUserId = user?.id;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/');
      return;
    }

    if (!authUserId) { 
        setError("Attention : Votre identifiant utilisateur n'est pas disponible. Impossible de charger ou sauvegarder le profil.");
        setIsLoading(false);
        return; 
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null); 
      try {
        const response = await apiClient<UserProfileData>(`/api/user-profile/${authUserId}`);
        if (response) {
          setProfileData({
            tmi: response.tmi ?? null,
            situation_familiale: response.situation_familiale ?? '',
            nombre_enfants: response.nombre_enfants ?? null,
            residence_principale: response.residence_principale === undefined ? null : response.residence_principale,
            residence_secondaire: response.residence_secondaire === undefined ? null : response.residence_secondaire,
            revenus_annuels: response.revenus_annuels ?? null,
            charges_deductibles: response.charges_deductibles ?? null,
          });
        }
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setProfileData(initialProfileData);
        } else {
          console.error("Erreur fetchProfile:", err);
          setError("Erreur lors de la récupération de votre profil. " + (err.data?.detail || err.message || 'Erreur inconnue.'));
        }
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, [isAuthenticated, user, navigate, authUserId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean | null = value;

    if (type === 'number') {
      processedValue = value === '' ? null : parseFloat(value);
      if (isNaN(processedValue as number)) processedValue = null;
    } else if (name === 'residence_principale' || name === 'residence_secondaire') {
      if (value === 'true') processedValue = true;
      else if (value === 'false') processedValue = false;
      else processedValue = null;
    }
    setProfileData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authUserId) {
      setError("Sauvegarde impossible : Identifiant utilisateur non disponible.");
      return;
    }
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const payload: UserProfileData = {
      ...profileData,
      auth_user_id: authUserId, 
      tmi: profileData.tmi === null || profileData.tmi === undefined ? null : Number(profileData.tmi),
      nombre_enfants: profileData.nombre_enfants === null || profileData.nombre_enfants === undefined ? null : Number(profileData.nombre_enfants),
      revenus_annuels: profileData.revenus_annuels === null || profileData.revenus_annuels === undefined ? null : Number(profileData.revenus_annuels),
      charges_deductibles: profileData.charges_deductibles === null || profileData.charges_deductibles === undefined ? null : Number(profileData.charges_deductibles),
    };

    try {
      await apiClient<UserProfileData>(`/api/user-profile/${authUserId}`, {
        method: 'PUT',
        data: payload
      });
      setSuccessMessage('Profil mis à jour avec succès !');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur handleSubmit profil:", err);
      setError("Erreur lors de la sauvegarde du profil. " + (err.data?.detail || err.message || 'Erreur inconnue.'));
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2942] to-[#234876] text-white p-4">Chargement de votre profil...</div>;
  }

  const renderSelectBoolean = (name: keyof Omit<UserProfileData, 'auth_user_id'>, label: string) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <select
        id={name}
        name={name}
        value={profileData[name] === null || profileData[name] === undefined ? '' : String(profileData[name])}
        onChange={handleChange}
        className="mt-1 block w-full px-3 py-2 bg-[#1a2942]/70 border border-[#c5a572]/30 rounded-md shadow-sm focus:outline-none focus:ring-[#c5a572] focus:border-[#c5a572] sm:text-sm text-white disabled:opacity-50"
        disabled={!authUserId || isSaving}
      >
        <option value="">Non précisé</option>
        <option value="true">Oui</option>
        <option value="false">Non</option>
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876] text-gray-100 font-sans p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/chat')} 
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 text-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          Retour au Chat
        </button>

        <div className="bg-[#1a2942]/80 backdrop-blur-sm rounded-xl border border-[#c5a572]/30 shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col items-center mb-8">
            <UserCog className="w-16 h-16 text-[#c5a572] mb-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">Mon Profil Fiscal</h1>
            <p className="text-sm text-gray-400 text-center mt-1">Ces informations permettent à Francis de mieux adapter ses conseils.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-800/60 border border-red-700 text-red-200 rounded-md flex items-center text-sm">
              <AlertCircle className="w-5 h-5 mr-2.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-3 bg-green-800/60 border border-green-700 text-green-200 rounded-md flex items-center text-sm">
              <CheckCircleIcon className="w-5 h-5 mr-2.5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="tmi" className="block text-sm font-medium text-gray-300 mb-1">TMI (Tranche Marginale d'Imposition) en %</label>
              <input
                type="number"
                name="tmi"
                id="tmi"
                value={profileData.tmi ?? ''}
                onChange={handleChange}
                placeholder="Ex: 30" 
                min="0" max="100" step="0.01"
                className="mt-1 block w-full px-3 py-2 bg-[#1a2942]/70 border border-[#c5a572]/30 rounded-md shadow-sm focus:outline-none focus:ring-[#c5a572] focus:border-[#c5a572] sm:text-sm text-white disabled:opacity-50"
                disabled={!authUserId || isSaving}
              />
            </div>

            <div>
              <label htmlFor="situation_familiale" className="block text-sm font-medium text-gray-300 mb-1">Situation Familiale</label>
              <select
                name="situation_familiale"
                id="situation_familiale"
                value={profileData.situation_familiale ?? ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-[#1a2942]/70 border border-[#c5a572]/30 rounded-md shadow-sm focus:outline-none focus:ring-[#c5a572] focus:border-[#c5a572] sm:text-sm text-white disabled:opacity-50"
                disabled={!authUserId || isSaving}
              >
                <option value="">Non précisé</option>
                <option value="Célibataire">Célibataire</option>
                <option value="Marié(e)">Marié(e)</option>
                <option value="Pacsé(e)">Pacsé(e)</option>
                <option value="Divorcé(e)">Divorcé(e)</option>
                <option value="Veuf(ve)">Veuf(ve)</option>
              </select>
            </div>

            <div>
              <label htmlFor="nombre_enfants" className="block text-sm font-medium text-gray-300 mb-1">Nombre d'enfants à charge</label>
              <input
                type="number"
                name="nombre_enfants"
                id="nombre_enfants"
                value={profileData.nombre_enfants ?? ''}
                onChange={handleChange}
                placeholder="Ex: 2"
                min="0" step="1"
                className="mt-1 block w-full px-3 py-2 bg-[#1a2942]/70 border border-[#c5a572]/30 rounded-md shadow-sm focus:outline-none focus:ring-[#c5a572] focus:border-[#c5a572] sm:text-sm text-white disabled:opacity-50"
                disabled={!authUserId || isSaving}
              />
            </div>

            {renderSelectBoolean('residence_principale', 'Êtes-vous propriétaire de votre résidence principale ?')}
            {renderSelectBoolean('residence_secondaire', 'Êtes-vous propriétaire d’une résidence secondaire ?')}

            <div>
              <label htmlFor="revenus_annuels" className="block text-sm font-medium text-gray-300 mb-1">Revenus annuels nets (€)</label>
              <input
                type="number"
                name="revenus_annuels"
                id="revenus_annuels"
                value={profileData.revenus_annuels ?? ''}
                onChange={handleChange}
                placeholder="Ex: 50000"
                min="0" step="0.01"
                className="mt-1 block w-full px-3 py-2 bg-[#1a2942]/70 border border-[#c5a572]/30 rounded-md shadow-sm focus:outline-none focus:ring-[#c5a572] focus:border-[#c5a572] sm:text-sm text-white disabled:opacity-50"
                disabled={!authUserId || isSaving}
              />
            </div>

            <div>
              <label htmlFor="charges_deductibles" className="block text-sm font-medium text-gray-300 mb-1">Charges déductibles annuelles (€)</label>
              <input
                type="number"
                name="charges_deductibles"
                id="charges_deductibles"
                value={profileData.charges_deductibles ?? ''}
                onChange={handleChange}
                placeholder="Ex: 5000"
                min="0" step="0.01"
                className="mt-1 block w-full px-3 py-2 bg-[#1a2942]/70 border border-[#c5a572]/30 rounded-md shadow-sm focus:outline-none focus:ring-[#c5a572] focus:border-[#c5a572] sm:text-sm text-white disabled:opacity-50"
                disabled={!authUserId || isSaving}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving || !authUserId}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-base font-semibold text-[#1a2942] bg-[#c5a572] hover:bg-[#e8cfa0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a2942] focus:ring-[#c5a572] transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-transparent border-t-[#1a2942] rounded-full animate-spin mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  <><Save className="w-5 h-5 mr-2" /> Enregistrer mon Profil</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
