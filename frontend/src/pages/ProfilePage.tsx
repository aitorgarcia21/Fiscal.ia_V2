import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Euro, MessageSquare, Save, ArrowLeft, Target, Building2, Home, TrendingUp, Calculator, FileText, Mail, Send, Lock, Check, X, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ProfileForm from '../components/ProfileForm';

interface QuotaInfo {
  questions_used: number;
  questions_remaining: number;
  quota_limit: number;
  unlimited: boolean;
}

interface UserProfile {
  auth_user_id: string;
  taper?: 'particulier' | 'professionnel';
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
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchProfile(),
        fetchQuotaInfo()
      ]);
    };
    fetchData();
  }, []);

  const fetchQuotaInfo = async () => {
    try {
      const response = await fetch('/api/questions/quota');
      if (response.ok) {
        const data = await response.json();
        setQuotaInfo(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du quota:', error);
    }
  };

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
          <div className="w-8 h-8 border-2 border-[#c5a572] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                <p className="text-xs text-gray-400">Configuration personnelle</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche - Informations de compte */}
          <div className="space-y-6">
            {/* Carte Compte */}
            <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#c5a572]" />
                Mon Compte
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-medium">{user?.email || 'Non défini'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Type de compte</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-[#c5a572]/20 text-[#c5a572] text-xs rounded-full">
                      {profile?.taper === 'professionnel' ? 'Professionnel' : 'Particulier'}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#c5a572]/20">
                  <Link
                    to="/change-password"
                    className="inline-flex items-center gap-2 text-sm text-[#c5a572] hover:text-[#e8cfa0] transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Changer mon mot de passe
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Carte Abonnement */}
            <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#c5a572]" />
                Mon Abonnement
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Statut</p>
                  <div className="flex items-center gap-2">
                    {profile?.taper === 'professionnel' ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium">Actif - Pro</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400 font-medium">Gratuit - {quotaInfo?.questions_remaining || 0} questions restantes</span>
                      </>
                    )}
                  </div>
                </div>
                
                {quotaInfo && !quotaInfo.unlimited && (
                  <div className="pt-2">
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Votre quota mensuel</span>
                      <span>{quotaInfo.questions_used} / {quotaInfo.quota_limit} questions</span>
                    </div>
                    <div className="w-full bg-[#1a2332] rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (quotaInfo.questions_used / quotaInfo.quota_limit) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <button className="w-full py-2 px-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-medium rounded-lg hover:opacity-90 transition-opacity">
                    {profile?.taper === 'professionnel' ? 'Gérer mon abonnement' : 'Passer à la version Pro'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Colonne de droite - Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Modifier mon profil</h2>
              
              <ProfileForm 
                profile={profile} 
                onUpdate={updateProfile} 
                onSave={handleSave} 
                isSaving={isSaving} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec onglets */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Navigation des onglets */}
        <div className="flex space-x-4 mb-6 border-b border-[#c5a572]/20 pb-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'general' ? 'text-[#c5a572] border-b-2 border-[#c5a572]' : 'text-gray-400 hover:text-white'}`}
          >
            Général
          </button>
          <button
            onClick={() => setActiveTab('revenus')}
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'revenus' ? 'text-[#c5a572] border-b-2 border-[#c5a572]' : 'text-gray-400 hover:text-white'}`}
          >
            Revenus
          </button>
          <button
            onClick={() => setActiveTab('patrimoine')}
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'patrimoine' ? 'text-[#c5a572] border-b-2 border-[#c5a572]' : 'text-gray-400 hover:text-white'}`}
          >
            Patrimoine
          </button>
          <button
            onClick={() => setActiveTab('objectifs')}
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'objectifs' ? 'text-[#c5a572] border-b-2 border-[#c5a572]' : 'text-gray-400 hover:text-white'}`}
          >
            Objectifs
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche - Informations de compte (toujours visible) */}
          <div className="space-y-6">
            {/* Carte Compte */}
            <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#c5a572]" />
                Mon Compte
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-medium">{user?.email || 'Non défini'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Type de compte</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-[#c5a572]/20 text-[#c5a572] text-xs rounded-full">
                      {profile?.taper === 'professionnel' ? 'Professionnel' : 'Particulier'}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#c5a572]/20">
                  <Link
                    to="/change-password"
                    className="inline-flex items-center gap-2 text-sm text-[#c5a572] hover:text-[#e8cfa0] transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Changer mon mot de passe
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Carte Abonnement */}
            <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#c5a572]" />
                Mon Abonnement
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Statut</p>
                  <div className="flex items-center gap-2">
                    {profile?.taper === 'professionnel' ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium">Actif - Pro</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400 font-medium">Gratuit - {quotaInfo?.questions_remaining || 0} questions restantes</span>
                      </>
                    )}
                  </div>
                </div>
                
                {quotaInfo && !quotaInfo.unlimited && (
                  <div className="pt-2">
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Votre quota mensuel</span>
                      <span>{quotaInfo.questions_used} / {quotaInfo.quota_limit} questions</span>
                    </div>
                    <div className="w-full bg-[#1a2332] rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (quotaInfo.questions_used / quotaInfo.quota_limit) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <button className="w-full py-2 px-4 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-medium rounded-lg hover:opacity-90 transition-opacity">
                    {profile?.taper === 'professionnel' ? 'Gérer mon abonnement' : 'Passer à la version Pro'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu de l'onglet actif */}
          <div className="lg:col-span-2">
            {/* Onglet Général */}
            {activeTab === 'general' && (
              <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Modifier mon profil</h2>
                
                <ProfileForm 
                  profile={profile} 
                  onUpdate={updateProfile} 
                  onSave={handleSave} 
                  isSaving={isSaving} 
                />
              </div>
            )}

            {/* Onglet Revenus */}
            {activeTab === 'revenus' && (
              <div className="space-y-6">
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

                <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6 mt-6">
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
              </div>
            )}

            {/* Onglet Patrimoine */}
            {activeTab === 'patrimoine' && (
              <div className="space-y-6">
                <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#c5a572]" />
                    Revenus principaux
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
              </div>
            )}

            {/* Onglet Objectifs */}
            {activeTab === 'objectifs' && (
              <div className="bg-[#1a2332]/60 rounded-xl border border-[#c5a572]/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#c5a572]" />
                  Objectifs et conseils
                </h3>
                
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Pour des conseils personnalisés, veuillez d'abord remplir les sections Général et Revenus.
                  </p>
                  
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Optimisation fiscale
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Stratégies d'investissement
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Planification successorale
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;