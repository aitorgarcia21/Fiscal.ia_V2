import React, { useState } from 'react';
import { CreditCard, User, Settings, ExternalLink, ArrowLeft, Check, Lock, Mail, User as UserIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useStripe } from '../hooks/useStripe';
import { useAuth } from '../contexts/AuthContext';

export function ProSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { redirectToPortal, isLoading, error } = useStripe();
  const [activeTab, setActiveTab] = useState<'profile' | 'billing'>('profile');

  const handleManageBilling = () => {
    redirectToPortal({
      returnUrl: `${window.location.origin}/pro/settings`
    });
  };

  // Récupérer les informations de l'utilisateur
  const userEmail = user?.email || 'Non renseigné';
  const userFirstName = user?.user_metadata?.first_name || user?.user_metadata?.prenom || 'Non renseigné';
  const userLastName = user?.user_metadata?.last_name || user?.user_metadata?.nom || 'Non renseigné';
  const userFullName = `${userFirstName} ${userLastName}`.trim() || 'Non renseigné';
  const userCreatedAt = 'Non renseigné'; // La date de création n'est pas disponible dans l'interface AuthUser

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162238] via-[#1E3253] to-[#234876] px-4 py-8 flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 w-full">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/pro/dashboard')}
            className="mr-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            aria-label="Retour au tableau de bord"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-white">Paramètres du compte</h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-[#1A2942]/50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-[#c5a572] text-[#162238]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Profil
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'billing'
                ? 'bg-[#c5a572] text-[#162238]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Facturation
          </button>
        </div>

        {/* Content */}
        <div className="bg-[#1A2942]/60 rounded-2xl border border-[#c5a572]/20 overflow-hidden">
          {activeTab === 'profile' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Informations du profil</h2>
              
              {/* Statut de l'abonnement */}
              <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Abonnement actif</h3>
                    <p className="text-green-300">Votre accès à Francis Pro est pleinement fonctionnel</p>
                  </div>
                </div>
              </div>

              {/* Informations utilisateur */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <div className="bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg px-4 py-3 text-gray-300">
                      {userEmail}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Nom complet
                    </label>
                    <div className="bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg px-4 py-3 text-gray-300">
                      {userFullName}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
                    <div className="bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg px-4 py-3 text-gray-300">
                      {userFirstName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                    <div className="bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg px-4 py-3 text-gray-300">
                      {userLastName}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date d'inscription</label>
                  <div className="bg-[#162238]/50 border border-[#c5a572]/20 rounded-lg px-4 py-3 text-gray-300">
                    {userCreatedAt}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-6 border-t border-[#c5a572]/20">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/change-password"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Changer le mot de passe
                  </Link>
                  <button className="px-6 py-3 bg-[#c5a572] text-[#162238] font-semibold rounded-lg hover:bg-[#e8cfa0] transition-colors">
                    Modifier le profil
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Gestion de la facturation</h2>
              <div className="bg-[#162238]/50 rounded-xl p-6 mb-6 border border-[#c5a572]/20">
                <h3 className="text-lg font-semibold text-white mb-4">Abonnement actuel</h3>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-white font-medium">Plan Francis Pro</p>
                    <p className="text-gray-400">29,99€ / mois</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Actif</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Prochain renouvellement : {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {/* Portal Stripe */}
              <div className="bg-gradient-to-r from-[#c5a572]/10 to-[#e8cfa0]/10 border border-[#c5a572]/20 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Gérer votre abonnement</h3>
                    <p className="text-gray-300 mb-4">
                      Accédez au portail sécurisé pour modifier votre moyen de paiement, 
                      télécharger vos factures, ou annuler votre abonnement.
                    </p>

                    {error && (
                      <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                        {error}
                      </div>
                    )}

                    <ul className="text-sm text-gray-400 mb-6 space-y-1">
                      <li>• Mettre à jour votre carte bancaire</li>
                      <li>• Télécharger vos factures</li>
                      <li>• Changer de plan</li>
                      <li>• Annuler votre abonnement</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={handleManageBilling}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#c5a572] text-[#162238] font-semibold rounded-lg hover:bg-[#e8cfa0] transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  {isLoading ? 'Ouverture...' : 'Ouvrir le portail de gestion'}
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 