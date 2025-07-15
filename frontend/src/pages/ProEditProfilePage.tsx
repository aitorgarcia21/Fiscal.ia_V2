import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, Building, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProProfile {
  tmi?: number;
  situation_familiale?: string;
  nombre_enfants?: number;
  residence_principale?: boolean;
  residence_secondaire?: boolean;
  revenus_annuels?: number;
  charges_deductibles?: number;
  company_name?: string;
  siret?: string;
  address?: string;
  phone?: string;
  website?: string;
  specialization?: string;
  years_experience?: number;
}

export function ProEditProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<ProProfile>({
    tmi: null,
    situation_familiale: '',
    nombre_enfants: null,
    residence_principale: null,
    residence_secondaire: null,
    revenus_annuels: null,
    charges_deductibles: null,
    company_name: '',
    siret: '',
    address: '',
    phone: '',
    website: '',
    specialization: '',
    years_experience: 0
  });

  useEffect(() => {
    // Charger les données du profil existant
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      // Ici vous pouvez charger les données depuis votre API
      // Pour l'instant, on utilise les données de l'utilisateur
      setProfile({
        company_name: user?.user_metadata?.company_name || '',
        siret: user?.user_metadata?.siret || '',
        address: user?.user_metadata?.address || '',
        phone: user?.user_metadata?.phone || '',
        website: user?.user_metadata?.website || '',
        specialization: user?.user_metadata?.specialization || '',
        years_experience: user?.user_metadata?.years_experience || 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setErrorMessage('Erreur lors du chargement du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Ici vous pouvez sauvegarder les données vers votre API
      // Pour l'instant, on simule une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Profil mis à jour avec succès !');
      setTimeout(() => {
        navigate('/pro/settings');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrorMessage('Erreur lors de la sauvegarde du profil');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof ProProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#c5a572] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] px-4 py-8 flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 w-full">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/pro/settings')}
            className="mr-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            aria-label="Retour aux paramètres"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-white">Modifier le profil</h1>
        </div>

        {/* Messages de succès/erreur */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-[#1A2942]/60 rounded-2xl border border-[#c5a572]/20 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Modifier mon profil</h2>
            
            <div className="space-y-6">
              {/* Informations fiscales */}
              <div>
                <label htmlFor="tmi" className="block text-sm font-medium text-gray-300 mb-2">TMI (Tranche Marginale d'Imposition) en %</label>
                <input
                  type="number"
                  id="tmi"
                  value={profile.tmi ?? ''}
                  onChange={(e) => updateField('tmi', e.target.value === '' ? null : parseFloat(e.target.value))}
                  placeholder="Ex: 30" 
                  min="0" max="100" step="0.01"
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                />
              </div>

              <div>
                <label htmlFor="situation_familiale" className="block text-sm font-medium text-gray-300 mb-2">Situation Familiale</label>
                <select
                  id="situation_familiale"
                  value={profile.situation_familiale ?? ''}
                  onChange={(e) => updateField('situation_familiale', e.target.value)}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
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
                <label htmlFor="nombre_enfants" className="block text-sm font-medium text-gray-300 mb-2">Nombre d'enfants</label>
                <input
                  type="number"
                  id="nombre_enfants"
                  value={profile.nombre_enfants ?? ''}
                  onChange={(e) => updateField('nombre_enfants', e.target.value === '' ? null : parseInt(e.target.value))}
                  placeholder="Ex: 2"
                  min="0"
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                />
              </div>

              <div>
                <label htmlFor="residence_principale" className="block text-sm font-medium text-gray-300 mb-2">Résidence principale</label>
                <select
                  id="residence_principale"
                  value={profile.residence_principale === null ? '' : profile.residence_principale ? 'true' : 'false'}
                  onChange={(e) => updateField('residence_principale', e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                >
                  <option value="">Non précisé</option>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>

              <div>
                <label htmlFor="residence_secondaire" className="block text-sm font-medium text-gray-300 mb-2">Résidence secondaire</label>
                <select
                  id="residence_secondaire"
                  value={profile.residence_secondaire === null ? '' : profile.residence_secondaire ? 'true' : 'false'}
                  onChange={(e) => updateField('residence_secondaire', e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                >
                  <option value="">Non précisé</option>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>

              <div>
                <label htmlFor="revenus_annuels" className="block text-sm font-medium text-gray-300 mb-2">Revenus annuels (€)</label>
                <input
                  type="number"
                  id="revenus_annuels"
                  value={profile.revenus_annuels ?? ''}
                  onChange={(e) => updateField('revenus_annuels', e.target.value === '' ? null : parseFloat(e.target.value))}
                  placeholder="Ex: 50000"
                  min="0" step="0.01"
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                />
              </div>

              <div>
                <label htmlFor="charges_deductibles" className="block text-sm font-medium text-gray-300 mb-2">Charges déductibles annuelles (€)</label>
                <input
                  type="number"
                  id="charges_deductibles"
                  value={profile.charges_deductibles ?? ''}
                  onChange={(e) => updateField('charges_deductibles', e.target.value === '' ? null : parseFloat(e.target.value))}
                  placeholder="Ex: 5000"
                  min="0" step="0.01"
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-[#c5a572]/20">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/pro/settings')}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#c5a572] text-[#162238] font-semibold rounded-lg hover:bg-[#e8cfa0] transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 