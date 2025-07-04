import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Euro, MessageSquare, Save, ArrowLeft, Target, Building2, Home, TrendingUp, Calculator, FileText, Mail, Send, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  auth_user_id: string;
  tmi?: number;
  situation_familiale?: string;
  nombre_enfants?: number;
  residence_principale?: boolean;
  residence_secondaire?: boolean;
  revenus_annuels?: number;
  charges_deductibles?: number;
  activite_principale?: string;
  revenus_complementaires?: string[];
  statuts_juridiques?: string[];
  residence_fiscale?: string;
  patrimoine_situation?: string;
  has_completed_onboarding?: boolean;
  age?: number;
  revenus_salaires?: number;
  revenus_bnc?: number;
  revenus_bic?: number;
  revenus_fonciers?: number;
  plus_values_mobilieres?: number;
  dividendes_recus?: number;
  pensions_retraite?: number;
  patrimoine_immobilier_valeur?: number;
  emprunts_immobiliers?: number;
  epargne_disponible?: number;
  assurance_vie_valeur?: number;
  pea_valeur?: number;
  actions_valeur?: number;
  crypto_valeur?: number;
  dons_realises?: number;
  objectifs_fiscaux?: string[];
  horizon_investissement?: string;
  tolerance_risque?: string;
  situations_specifiques?: string[];
}

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user-profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      
      if (response.ok) {
        const button = document.getElementById('save-button');
        if (button) {
          button.textContent = '✓ Sauvegardé !';
          setTimeout(() => {
            button.textContent = 'Sauvegarder';
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#c5a572] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#243447] text-gray-100">
      {/* Header */}
      <header className="bg-[#1a2332]/95 backdrop-blur-lg border-b border-[#c5a572]/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:block">Retour</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center justify-center group">
                <MessageSquare className="h-10 w-10 text-[#c5a572] transition-transform group-hover:scale-110 duration-300" />
                <Euro className="h-7 w-7 text-[#c5a572] absolute -bottom-2 -right-2 bg-[#162238] rounded-full p-0.5 transition-transform group-hover:scale-110 duration-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] bg-clip-text text-transparent">
                  Mon Profil
                </h1>
                <p className="text-xs text-gray-400">Configuration fiscale</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              id="save-button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            
            <Link
              to="/change-password"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              <Lock className="w-4 h-4" />
              Changer MDP
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Navigation onglets */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#c5a572]/20">
          {[
            { id: 'general', label: 'Général', icon: User },
            { id: 'revenus', label: 'Revenus', icon: TrendingUp },
            { id: 'patrimoine', label: 'Patrimoine', icon: Home },
            { id: 'objectifs', label: 'Objectifs', icon: Target }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a2332]/60'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenu des onglets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Onglet Général */}
          {activeTab === 'general' && (
            <>
              <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#c5a572]" />
                  Informations personnelles
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Âge</label>
                    <input
                      type="number"
                      value={profile?.age || ''}
                      onChange={(e) => updateProfile('age', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="35"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Situation familiale</label>
                    <select
                      value={profile?.situation_familiale || ''}
                      onChange={(e) => updateProfile('situation_familiale', e.target.value)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                    >
                      <option value="">Sélectionner</option>
                      <option value="celibataire">Célibataire</option>
                      <option value="marie">Marié(e)</option>
                      <option value="pacs">Pacsé(e)</option>
                      <option value="concubin">Union libre</option>
                      <option value="divorce">Divorcé(e)</option>
                      <option value="veuf">Veuf/Veuve</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nombre d'enfants</label>
                    <input
                      type="number"
                      value={profile?.nombre_enfants || ''}
                      onChange={(e) => updateProfile('nombre_enfants', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Activité principale</label>
                    <select
                      value={profile?.activite_principale || ''}
                      onChange={(e) => updateProfile('activite_principale', e.target.value)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                    >
                      <option value="">Sélectionner</option>
                      <option value="salarie_cdi">Salarié CDI</option>
                      <option value="salarie_cdd">Salarié CDD</option>
                      <option value="fonctionnaire">Fonctionnaire</option>
                      <option value="dirigeant_sasu">Dirigeant SASU</option>
                      <option value="dirigeant_sarl">Dirigeant SARL</option>
                      <option value="autoentrepreneur">Auto-entrepreneur</option>
                      <option value="profession_liberale">Profession libérale</option>
                      <option value="retraite">Retraité</option>
                      <option value="sans_activite">Sans activité</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Résidence fiscale</label>
                    <select
                      value={profile?.residence_fiscale || ''}
                      onChange={(e) => updateProfile('residence_fiscale', e.target.value)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                    >
                      <option value="">Sélectionner</option>
                      <option value="france">France</option>
                      <option value="portugal">Portugal</option>
                      <option value="belgique">Belgique</option>
                      <option value="suisse">Suisse</option>
                      <option value="luxembourg">Luxembourg</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#c5a572]" />
                  Situation fiscale
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">TMI actuel (%)</label>
                    <select
                      value={profile?.tmi || ''}
                      onChange={(e) => updateProfile('tmi', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                    >
                      <option value="">Sélectionner</option>
                      <option value="0">0% (non imposable)</option>
                      <option value="11">11%</option>
                      <option value="30">30%</option>
                      <option value="41">41%</option>
                      <option value="45">45%</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Charges déductibles (€/an)</label>
                    <input
                      type="number"
                      value={profile?.charges_deductibles || ''}
                      onChange={(e) => updateProfile('charges_deductibles', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="5000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Structures détenues</label>
                    <div className="space-y-2">
                      {['SASU', 'SARL', 'SCI', 'Holding', 'EURL'].map(structure => (
                        <label key={structure} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={profile?.statuts_juridiques?.includes(structure) || false}
                            onChange={(e) => {
                              const current = profile?.statuts_juridiques || [];
                              if (e.target.checked) {
                                updateProfile('statuts_juridiques', [...current, structure]);
                              } else {
                                updateProfile('statuts_juridiques', current.filter(s => s !== structure));
                              }
                            }}
                            className="rounded border-[#c5a572]/30 bg-[#162238] text-[#c5a572]"
                          />
                          <span className="text-gray-300">{structure}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Onglet Revenus */}
          {activeTab === 'revenus' && (
            <>
              <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#c5a572]" />
                  Revenus principaux
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Salaires annuels (€)</label>
                    <input
                      type="number"
                      value={profile?.revenus_salaires || ''}
                      onChange={(e) => updateProfile('revenus_salaires', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="50000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Revenus BNC (€)</label>
                    <input
                      type="number"
                      value={profile?.revenus_bnc || ''}
                      onChange={(e) => updateProfile('revenus_bnc', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Revenus BIC (€)</label>
                    <input
                      type="number"
                      value={profile?.revenus_bic || ''}
                      onChange={(e) => updateProfile('revenus_bic', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Pensions retraite (€)</label>
                    <input
                      type="number"
                      value={profile?.pensions_retraite || ''}
                      onChange={(e) => updateProfile('pensions_retraite', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Euro className="w-5 h-5 text-[#c5a572]" />
                  Revenus du capital
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Revenus fonciers (€)</label>
                    <input
                      type="number"
                      value={profile?.revenus_fonciers || ''}
                      onChange={(e) => updateProfile('revenus_fonciers', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Dividendes (€)</label>
                    <input
                      type="number"
                      value={profile?.dividendes_recus || ''}
                      onChange={(e) => updateProfile('dividendes_recus', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Plus-values (€)</label>
                    <input
                      type="number"
                      value={profile?.plus_values_mobilieres || ''}
                      onChange={(e) => updateProfile('plus_values_mobilieres', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Dons réalisés (€)</label>
                    <input
                      type="number"
                      value={profile?.dons_realises || ''}
                      onChange={(e) => updateProfile('dons_realises', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Onglet Patrimoine */}
          {activeTab === 'patrimoine' && (
            <>
              <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-[#c5a572]" />
                  Patrimoine immobilier
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Valeur immobilier (€)</label>
                    <input
                      type="number"
                      value={profile?.patrimoine_immobilier_valeur || ''}
                      onChange={(e) => updateProfile('patrimoine_immobilier_valeur', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="300000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Emprunts restants (€)</label>
                    <input
                      type="number"
                      value={profile?.emprunts_immobiliers || ''}
                      onChange={(e) => updateProfile('emprunts_immobiliers', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="150000"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#c5a572]" />
                  Patrimoine financier
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Épargne disponible (€)</label>
                    <input
                      type="number"
                      value={profile?.epargne_disponible || ''}
                      onChange={(e) => updateProfile('epargne_disponible', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="50000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Assurance vie (€)</label>
                    <input
                      type="number"
                      value={profile?.assurance_vie_valeur || ''}
                      onChange={(e) => updateProfile('assurance_vie_valeur', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="100000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">PEA (€)</label>
                    <input
                      type="number"
                      value={profile?.pea_valeur || ''}
                      onChange={(e) => updateProfile('pea_valeur', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="75000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Actions/CTO (€)</label>
                    <input
                      type="number"
                      value={profile?.actions_valeur || ''}
                      onChange={(e) => updateProfile('actions_valeur', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="25000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cryptomonnaies (€)</label>
                    <input
                      type="number"
                      value={profile?.crypto_valeur || ''}
                      onChange={(e) => updateProfile('crypto_valeur', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                      placeholder="10000"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Onglet Objectifs */}
          {activeTab === 'objectifs' && (
            <>
              <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#c5a572]" />
                  Objectifs d'optimisation
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Priorités fiscales</label>
                    <div className="space-y-2">
                      {[
                        'Réduire l\'impôt sur le revenu',
                        'Optimiser la retraite',
                        'Préparer une transmission',
                        'Défiscaliser les plus-values',
                        'Réduire l\'IFI',
                        'Optimiser les revenus locatifs',
                        'Développer l\'épargne'
                      ].map(objectif => (
                        <label key={objectif} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={profile?.objectifs_fiscaux?.includes(objectif) || false}
                            onChange={(e) => {
                              const current = profile?.objectifs_fiscaux || [];
                              if (e.target.checked) {
                                updateProfile('objectifs_fiscaux', [...current, objectif]);
                              } else {
                                updateProfile('objectifs_fiscaux', current.filter(o => o !== objectif));
                              }
                            }}
                            className="rounded border-[#c5a572]/30 bg-[#162238] text-[#c5a572]"
                          />
                          <span className="text-gray-300">{objectif}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Horizon d'investissement</label>
                    <select
                      value={profile?.horizon_investissement || ''}
                      onChange={(e) => updateProfile('horizon_investissement', e.target.value)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                    >
                      <option value="">Sélectionner</option>
                      <option value="court_terme">Court terme (1-3 ans)</option>
                      <option value="moyen_terme">Moyen terme (3-7 ans)</option>
                      <option value="long_terme">Long terme (7-15 ans)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tolérance au risque</label>
                    <select
                      value={profile?.tolerance_risque || ''}
                      onChange={(e) => updateProfile('tolerance_risque', e.target.value)}
                      className="w-full px-3 py-2 bg-[#162238] border border-[#c5a572]/30 rounded-lg text-white focus:outline-none focus:border-[#c5a572]"
                    >
                      <option value="">Sélectionner</option>
                      <option value="prudent">Prudent</option>
                      <option value="equilibre">Équilibré</option>
                      <option value="dynamique">Dynamique</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">💡 Conseils personnalisés</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>Plus votre profil est détaillé, plus Francis pourra :</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Calculer vos optimisations précisément</li>
                    <li>• Recommander les meilleurs investissements</li>
                    <li>• Simuler votre fiscalité future</li>
                    <li>• Proposer des stratégies sur-mesure</li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-[#c5a572]/10 rounded-lg border border-[#c5a572]/30">
                    <p className="text-[#c5a572] font-medium">🎯 Recommandation</p>
                    <p className="text-gray-300 text-xs mt-1">
                      Remplissez au minimum "Général" et "Revenus" pour des conseils pertinents.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 