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
  description?: string;
  sector?: string;
  team_size?: string;
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
    years_experience: 0,
    description: '',
    sector: '',
    team_size: ''
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
        years_experience: user?.user_metadata?.years_experience || 0,
        description: user?.user_metadata?.description || '',
        sector: user?.user_metadata?.sector || '',
        team_size: user?.user_metadata?.team_size || ''
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
              {/* Informations d'entreprise */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-300 mb-2">Nom de l'entreprise *</label>
                  <input
                    type="text"
                    id="company_name"
                    value={profile.company_name || ''}
                    onChange={(e) => updateField('company_name', e.target.value)}
                    placeholder="Ex: Conseil & Associés SARL"
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                  />
                </div>

                <div>
                  <label htmlFor="siret" className="block text-sm font-medium text-gray-300 mb-2">SIRET</label>
                  <input
                    type="text"
                    id="siret"
                    value={profile.siret || ''}
                    onChange={(e) => updateField('siret', e.target.value)}
                    placeholder="Ex: 12345678901234"
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">Adresse de l'entreprise</label>
                <input
                  type="text"
                  id="address"
                  value={profile.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Ex: 123 Avenue des Champs-Élysées, 75008 Paris"
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="Ex: +33 1 23 45 67 89"
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">Site web</label>
                  <input
                    type="url"
                    id="website"
                    value={profile.website || ''}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="Ex: https://www.monentreprise.fr"
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="sector" className="block text-sm font-medium text-gray-300 mb-2">Secteur d'activité</label>
                  <select
                    id="sector"
                    value={profile.sector || ''}
                    onChange={(e) => updateField('sector', e.target.value)}
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                  >
                    <option value="">Sélectionner un secteur</option>
                    <option value="conseil">Conseil & Expertise</option>
                    <option value="finance">Finance & Banque</option>
                    <option value="immobilier">Immobilier</option>
                    <option value="tech">Technologie & IT</option>
                    <option value="sante">Santé & Médical</option>
                    <option value="juridique">Juridique & Droit</option>
                    <option value="commerce">Commerce & Retail</option>
                    <option value="industrie">Industrie & Manufacturing</option>
                    <option value="education">Éducation & Formation</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="team_size" className="block text-sm font-medium text-gray-300 mb-2">Taille de l'équipe</label>
                  <select
                    id="team_size"
                    value={profile.team_size || ''}
                    onChange={(e) => updateField('team_size', e.target.value)}
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                  >
                    <option value="">Sélectionner la taille</option>
                    <option value="1">1 personne (Solo)</option>
                    <option value="2-5">2-5 collaborateurs</option>
                    <option value="6-10">6-10 collaborateurs</option>
                    <option value="11-50">11-50 collaborateurs</option>
                    <option value="51-200">51-200 collaborateurs</option>
                    <option value="200+">Plus de 200 collaborateurs</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-300 mb-2">Spécialisation</label>
                  <input
                    type="text"
                    id="specialization"
                    value={profile.specialization || ''}
                    onChange={(e) => updateField('specialization', e.target.value)}
                    placeholder="Ex: Fiscalité internationale, Gestion de patrimoine"
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                  />
                </div>

                <div>
                  <label htmlFor="years_experience" className="block text-sm font-medium text-gray-300 mb-2">Années d'expérience</label>
                  <input
                    type="number"
                    id="years_experience"
                    value={profile.years_experience || ''}
                    onChange={(e) => updateField('years_experience', parseInt(e.target.value) || 0)}
                    placeholder="Ex: 10"
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description de l'activité</label>
                <textarea
                  id="description"
                  value={profile.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Décrivez brièvement votre activité et vos services..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572] resize-none"
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