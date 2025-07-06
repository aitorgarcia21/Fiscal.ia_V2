import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, Building, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProProfile {
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
            <h2 className="text-2xl font-semibold text-white mb-6">Informations professionnelles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={profile.company_name}
                    onChange={(e) => updateField('company_name', e.target.value)}
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                    placeholder="Nom de votre cabinet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Numéro SIRET</label>
                  <input
                    type="text"
                    value={profile.siret}
                    onChange={(e) => updateField('siret', e.target.value)}
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                    placeholder="12345678901234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Adresse
                  </label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                    rows={3}
                    placeholder="Adresse complète de votre cabinet"
                  />
                </div>
              </div>

              {/* Informations de contact */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                    placeholder="01 23 45 67 89"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Site web</label>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                    placeholder="https://www.votre-cabinet.fr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Spécialisation</label>
                  <input
                    type="text"
                    value={profile.specialization}
                    onChange={(e) => updateField('specialization', e.target.value)}
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                    placeholder="Fiscalité des entreprises, ISF, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Années d'expérience</label>
                  <input
                    type="number"
                    value={profile.years_experience}
                    onChange={(e) => updateField('years_experience', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                    min="0"
                    max="50"
                    aria-label="Années d'expérience"
                  />
                </div>
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