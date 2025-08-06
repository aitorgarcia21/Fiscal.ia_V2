import React, { useState, useEffect } from 'react';
import { User, Settings, CreditCard, BarChart3, LogOut, Bell, Shield, Globe, Calendar, Euro, FileText, Download } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  subscription: string;
  subscriptionExpiry: Date;
  totalQuestions: number;
  monthlyQuestions: number;
  monthlyLimit: number;
  createdAt: Date;
  lastLogin: Date;
  language: 'fr' | 'es';
  notifications: boolean;
}

// 🌍 Translations
const translations = {
  fr: {
    title: "Gestion de compte Francis Andorre",
    profile: "Profil utilisateur",
    subscription: "Abonnement",
    usage: "Utilisation",
    billing: "Facturation",
    settings: "Paramètres",
    logout: "Déconnexion",
    name: "Nom complet",
    email: "Email",
    memberSince: "Membre depuis",
    lastLogin: "Dernière connexion",
    currentPlan: "Plan actuel",
    expiresOn: "Expire le",
    questionsThisMonth: "Questions ce mois",
    totalQuestions: "Total questions posées",
    monthlyLimit: "Limite mensuelle",
    unlimited: "Illimitées",
    language: "Langue",
    notifications: "Notifications",
    downloadInvoices: "Télécharger factures",
    changePassword: "Changer mot de passe",
    deleteAccount: "Supprimer compte",
    save: "Sauvegarder",
    cancel: "Annuler",
    active: "Actif",
    expired: "Expiré",
    renewSubscription: "Renouveler l'abonnement",
    upgradeAccount: "Améliorer le compte"
  },
  es: {
    title: "Gestión de cuenta Francis Andorra",
    profile: "Perfil de usuario",
    subscription: "Suscripción",
    usage: "Uso",
    billing: "Facturación",
    settings: "Configuración",
    logout: "Cerrar sesión",
    name: "Nombre completo",
    email: "Email",
    memberSince: "Miembro desde",
    lastLogin: "Último acceso",
    currentPlan: "Plan actual",
    expiresOn: "Expira el",
    questionsThisMonth: "Preguntas este mes",
    totalQuestions: "Total preguntas realizadas",
    monthlyLimit: "Límite mensual",
    unlimited: "Ilimitadas",
    language: "Idioma",
    notifications: "Notificaciones",
    downloadInvoices: "Descargar facturas",
    changePassword: "Cambiar contraseña",
    deleteAccount: "Eliminar cuenta",
    save: "Guardar",
    cancel: "Cancelar",
    active: "Activo",
    expired: "Expirado",
    renewSubscription: "Renovar suscripción",
    upgradeAccount: "Mejorar cuenta"
  }
};

export function FrancisAndorreAccountPage() {
  const { user, logout } = useSupabaseAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [language, setLanguage] = useState<'fr' | 'es'>('fr');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 🔒 Authentication check
  useEffect(() => {
    if (!user) {
      navigate('/andorre/login');
      return;
    }
  }, [user, navigate]);

  // 📊 User profile state
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id || '',
    email: user?.email || '',
    name: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
    subscription: 'Francis Andorre Pro',
    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    totalQuestions: 247,
    monthlyQuestions: 23,
    monthlyLimit: -1, // -1 for unlimited
    createdAt: new Date(user?.created_at || Date.now()),
    lastLogin: new Date(),
    language: 'fr',
    notifications: true
  });

  const t = translations[language];

  useEffect(() => {
    // Simulate loading profile data
    const loadProfile = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    // Show success message
    alert(language === 'fr' ? 'Profil sauvegardé avec succès!' : '¡Perfil guardado exitosamente!');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/andorre/login');
  };

  const isSubscriptionActive = profile.subscriptionExpiry > new Date();

  const tabs = [
    { id: 'profile', label: t.profile, icon: User },
    { id: 'subscription', label: t.subscription, icon: CreditCard },
    { id: 'usage', label: t.usage, icon: BarChart3 }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#162238] to-[#0A192F] flex items-center justify-center">
        <div className="flex items-center space-x-4 text-[#c5a572]">
          <div className="animate-spin w-8 h-8 border-2 border-[#c5a572] border-t-transparent rounded-full"></div>
          <span className="text-lg">Chargement de votre compte...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#162238] to-[#0A192F]">
      {/* Header */}
      <div className="bg-[#162238] border-b border-[#c5a572]/20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="md" />
              <div>
                <h1 className="text-xl font-bold text-[#c5a572]">{t.title}</h1>
                <p className="text-sm text-gray-400">{profile.email}</p>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLanguage(language === 'fr' ? 'es' : 'fr')}
                className="flex items-center space-x-2 bg-[#0A192F] hover:bg-[#1a2332] border border-[#c5a572]/30 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>{language === 'fr' ? 'Español' : 'Français'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-[#162238] border border-[#c5a572]/20 rounded-xl overflow-hidden">
              <nav className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#c5a572] text-[#162238] font-semibold'
                          : 'text-gray-300 hover:bg-[#0A192F] hover:text-[#c5a572]'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-[#162238] border border-[#c5a572]/20 rounded-xl p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#c5a572] flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>{t.profile}</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t.name}
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full bg-[#0A192F] border border-[#c5a572]/30 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#c5a572]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t.email}
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t.memberSince}
                      </label>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar className="h-4 w-4" />
                        <span>{profile.createdAt.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'es-ES')}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t.lastLogin}
                      </label>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar className="h-4 w-4" />
                        <span>{profile.lastLogin.toLocaleString(language === 'fr' ? 'fr-FR' : 'es-ES')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Settings Section merged into Profile */}
                  <div className="mt-8 pt-6 border-t border-[#c5a572]/20">
                    <h3 className="text-lg font-semibold text-[#c5a572] mb-6 flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Paramètres</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#0A192F] border border-[#c5a572]/30 rounded-lg p-4">
                        <h4 className="font-medium text-gray-300 mb-3 flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>{t.language}</span>
                        </h4>
                        <select 
                          value={profile.language}
                          onChange={(e) => setProfile({...profile, language: e.target.value as 'fr' | 'es'})}
                          className="w-full bg-[#162238] border border-[#c5a572]/30 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#c5a572]"
                        >
                          <option value="fr">Français</option>
                          <option value="es">Español</option>
                        </select>
                      </div>

                      <div className="bg-[#0A192F] border border-[#c5a572]/30 rounded-lg p-4">
                        <h4 className="font-medium text-gray-300 mb-3 flex items-center space-x-2">
                          <Bell className="h-4 w-4" />
                          <span>{t.notifications}</span>
                        </h4>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={profile.notifications}
                            onChange={(e) => setProfile({...profile, notifications: e.target.checked})}
                            className="w-4 h-4 text-[#c5a572] bg-[#162238] border-[#c5a572]/30 rounded focus:ring-[#c5a572] focus:ring-2"
                          />
                          <span className="text-sm text-gray-300">Recevoir des notifications par email</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-[#0A192F] border border-[#c5a572]/30 rounded-lg p-4 mt-6">
                      <h4 className="font-medium text-gray-300 mb-3 flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Sécurité</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button className="w-full text-left bg-[#162238] hover:bg-[#1a2332] border border-[#c5a572]/30 rounded-lg p-3 text-sm text-gray-300 hover:text-[#c5a572] transition-colors">
                          {t.changePassword}
                        </button>
                        <button className="w-full text-left bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 hover:text-red-300 transition-colors">
                          {t.deleteAccount}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#c5a572] flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>{t.subscription}</span>
                  </h2>

                  <div className="bg-[#0A192F] border border-[#c5a572]/30 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#c5a572]">{profile.subscription}</h3>
                        <p className="text-gray-400">49€/mois</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isSubscriptionActive 
                          ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                          : 'bg-red-600/20 text-red-400 border border-red-500/30'
                      }`}>
                        {isSubscriptionActive ? t.active : t.expired}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{t.expiresOn}</span>
                        <span className="text-[#c5a572] font-medium">
                          {profile.subscriptionExpiry.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'es-ES')}
                        </span>
                      </div>

                      <div className="pt-4 border-t border-[#c5a572]/20">
                        <button className="w-full bg-[#c5a572] hover:bg-[#d4b583] text-[#162238] font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                          <Euro className="h-4 w-4" />
                          <span>{isSubscriptionActive ? t.renewSubscription : t.upgradeAccount}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0A192F] border border-[#c5a572]/30 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-300 mb-4 flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>{t.downloadInvoices}</span>
                    </h4>
                    <button className="flex items-center space-x-2 text-[#c5a572] hover:text-[#d4b583] transition-colors">
                      <Download className="h-4 w-4" />
                      <span>Télécharger toutes les factures</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Usage Tab */}
              {activeTab === 'usage' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#c5a572] flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>{t.usage}</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#0A192F] border border-[#c5a572]/30 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-[#c5a572] mb-2">{profile.monthlyQuestions}</div>
                      <div className="text-sm text-gray-400">{t.questionsThisMonth}</div>
                    </div>

                    <div className="bg-[#0A192F] border border-[#c5a572]/30 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-[#c5a572] mb-2">{profile.totalQuestions}</div>
                      <div className="text-sm text-gray-400">{t.totalQuestions}</div>
                    </div>

                    <div className="bg-[#0A192F] border border-[#c5a572]/30 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">∞</div>
                      <div className="text-sm text-gray-400">{t.unlimited}</div>
                    </div>
                  </div>

                  <div className="bg-[#0A192F] border border-[#c5a572]/30 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-300 mb-4">Utilisation mensuelle</h4>
                    <div className="space-y-3">
                      {/* Mock usage chart */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Janvier 2024</span>
                        <span className="text-[#c5a572]">45 questions</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Décembre 2023</span>
                        <span className="text-[#c5a572]">38 questions</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Novembre 2023</span>
                        <span className="text-[#c5a572]">62 questions</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {activeTab === 'profile' && (
                <div className="mt-8 pt-6 border-t border-[#c5a572]/20">
                  <div className="flex space-x-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-[#c5a572] hover:bg-[#d4b583] disabled:bg-gray-600 text-[#162238] font-semibold px-6 py-3 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSaving && <div className="animate-spin w-4 h-4 border-2 border-[#162238] border-t-transparent rounded-full"></div>}
                      <span>{t.save}</span>
                    </button>
                    <button 
                      onClick={() => navigate('/andorre/chat')}
                      className="bg-[#162238] hover:bg-[#1a2332] border border-[#c5a572]/30 text-gray-300 hover:text-[#c5a572] px-6 py-3 rounded-lg transition-colors"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
