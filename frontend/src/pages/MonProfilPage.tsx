import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  CreditCard,
  Settings,
  Edit3,
  Check,
  X,
  ArrowLeft,
  Crown,
  Shield,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Building,
  Euro,
  TrendingUp,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
}

interface Subscription {
  plan: 'gratuit' | 'premium' | 'pro';
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate?: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
}

interface FiscalProfile {
  situation: 'celibataire' | 'marie' | 'pacs' | 'divorce' | 'veuf';
  children: number;
  profession: string;
  regime: 'salarie' | 'independant' | 'retraite' | 'etudiant' | 'autre';
  revenus: {
    salaires?: number;
    bnc?: number;
    bic?: number;
    foncier?: number;
    financier?: number;
  };
  patrimoine: {
    immobilier?: number;
    financier?: number;
    autres?: number;
  };
  residence: 'france' | 'etranger';
  optimisations: string[];
}

export function MonProfilPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'profil' | 'abonnement' | 'fiscal'>('profil');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [fiscalProfile, setFiscalProfile] = useState<FiscalProfile | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Simulation des données utilisateur
    setUserProfile({
      email: user?.email || 'utilisateur@example.com',
      firstName: (user as any)?.firstName || 'Jean',
      lastName: (user as any)?.lastName || 'Dupont',
      phone: '+33 6 12 34 56 78',
      address: '123 Rue de la République',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    });

    setSubscription({
      plan: 'premium',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2025-01-15',
      price: 29.99,
      billingCycle: 'monthly',
      features: [
        'Accès illimité à Francis',
        'Dashboard GoCardless',
        'Simulateurs fiscaux avancés',
        'Support prioritaire',
        'Export des documents'
      ]
    });

    setFiscalProfile({
      situation: 'marie',
      children: 2,
      profession: 'Ingénieur logiciel',
      regime: 'salarie',
      revenus: {
        salaires: 65000,
        financier: 2500
      },
      patrimoine: {
        immobilier: 450000,
        financier: 85000
      },
      residence: 'france',
      optimisations: [
        'PEA',
        'Assurance vie',
        'PERP',
        'Réduction d\'impôt Pinel'
      ]
    });
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'gratuit':
        return 'text-gray-400 bg-gray-100';
      case 'premium':
        return 'text-purple-800 bg-purple-100';
      case 'pro':
        return 'text-yellow-800 bg-yellow-100';
      default:
        return 'text-gray-400 bg-gray-100';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <Crown className="w-4 h-4" />;
      case 'pro':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getSituationLabel = (situation: string) => {
    const labels = {
      'celibataire': 'Célibataire',
      'marie': 'Marié(e)',
      'pacs': 'Pacsé(e)',
      'divorce': 'Divorcé(e)',
      'veuf': 'Veuf/Veuve'
    };
    return labels[situation as keyof typeof labels] || situation;
  };

  const getRegimeLabel = (regime: string) => {
    const labels = {
      'salarie': 'Salarié',
      'independant': 'Indépendant',
      'retraite': 'Retraité',
      'etudiant': 'Étudiant',
      'autre': 'Autre'
    };
    return labels[regime as keyof typeof labels] || regime;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#1a2332] to-[#2d3748]">
      {/* Header */}
      <div className="bg-[#1a2332] border-b border-[#c5a572]/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-[#c5a572] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour au dashboard</span>
              </button>
              <div className="h-6 w-px bg-[#c5a572]/30"></div>
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-[#c5a572]" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Mon Profil</h1>
                  <p className="text-gray-400">Gérez votre compte et vos préférences</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-[#1a2332] p-1 rounded-lg border border-[#c5a572]/20">
            <button
              onClick={() => setActiveTab('profil')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === 'profil'
                  ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Profil Personnel
            </button>
            <button
              onClick={() => setActiveTab('abonnement')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === 'abonnement'
                  ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Abonnement
            </button>
            <button
              onClick={() => setActiveTab('fiscal')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === 'fiscal'
                  ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Profil Fiscal
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profil' && userProfile && (
          <div className="bg-[#1a2332] rounded-xl border border-[#c5a572]/20 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Informations personnelles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userProfile.firstName}
                    readOnly={!isEditing}
                    className={`flex-1 px-4 py-2 bg-[#0A192F] border border-[#c5a572]/20 rounded-lg text-white ${
                      isEditing
                        ? 'focus:border-[#c5a572] focus:outline-none'
                        : 'cursor-not-allowed opacity-70'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                <input
                  type="text"
                  value={userProfile.lastName}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-2 bg-[#0A192F] border border-[#c5a572]/20 rounded-lg text-white ${
                    isEditing
                      ? 'focus:border-[#c5a572] focus:outline-none'
                      : 'cursor-not-allowed opacity-70'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={userProfile.email}
                    readOnly={!isEditing}
                    className={`flex-1 px-4 py-2 bg-[#0A192F] border border-[#c5a572]/20 rounded-lg text-white ${
                      isEditing
                        ? 'focus:border-[#c5a572] focus:outline-none'
                        : 'cursor-not-allowed opacity-70'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={userProfile.phone || ''}
                    readOnly={!isEditing}
                    className={`flex-1 px-4 py-2 bg-[#0A192F] border border-[#c5a572]/20 rounded-lg text-white ${
                      isEditing
                        ? 'focus:border-[#c5a572] focus:outline-none'
                        : 'cursor-not-allowed opacity-70'
                    }`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={userProfile.address || ''}
                    readOnly={!isEditing}
                    className={`flex-1 px-4 py-2 bg-[#0A192F] border border-[#c5a572]/20 rounded-lg text-white ${
                      isEditing
                        ? 'focus:border-[#c5a572] focus:outline-none'
                        : 'cursor-not-allowed opacity-70'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ville</label>
                <input
                  type="text"
                  value={userProfile.city || ''}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-2 bg-[#0A192F] border border-[#c5a572]/20 rounded-lg text-white ${
                    isEditing
                      ? 'focus:border-[#c5a572] focus:outline-none'
                      : 'cursor-not-allowed opacity-70'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Code postal</label>
                <input
                  type="text"
                  value={userProfile.postalCode || ''}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-2 bg-[#0A192F] border border-[#c5a572]/20 rounded-lg text-white ${
                    isEditing
                      ? 'focus:border-[#c5a572] focus:outline-none'
                      : 'cursor-not-allowed opacity-70'
                  }`}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-6 pt-6 border-t border-[#c5a572]/20">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  <Check className="w-4 h-4" />
                  Sauvegarder
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-[#c5a572]/20 text-[#c5a572] rounded-lg hover:bg-[#c5a572]/10 transition-all"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'abonnement' && subscription && (
          <div className="space-y-6">
            {/* Plan actuel */}
            <div className="bg-[#1a2332] rounded-xl border border-[#c5a572]/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Plan actuel</h2>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(subscription.plan)}`}>
                  {getPlanIcon(subscription.plan)}
                  {subscription.plan.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Euro className="w-5 h-5 text-[#c5a572]" />
                    <span className="text-gray-300">Prix</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatAmount(subscription.price)}
                    <span className="text-sm text-gray-400">/{subscription.billingCycle === 'monthly' ? 'mois' : 'an'}</span>
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-[#c5a572]" />
                    <span className="text-gray-300">Prochaine facturation</span>
                  </div>
                  <p className="text-white font-medium">
                    {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-white font-semibold mb-3">Fonctionnalités incluses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {subscription.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-[#c5a572]/20">
                <button className="px-4 py-2 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] rounded-lg font-medium hover:shadow-lg transition-all">
                  Changer de plan
                </button>
                <button className="px-4 py-2 border border-[#c5a572]/20 text-[#c5a572] rounded-lg hover:bg-[#c5a572]/10 transition-all">
                  Gérer la facturation
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fiscal' && fiscalProfile && (
          <div className="space-y-6">
            {/* Situation personnelle */}
            <div className="bg-[#1a2332] rounded-xl border border-[#c5a572]/20 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Situation personnelle</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Situation familiale</label>
                  <p className="text-white font-medium">{getSituationLabel(fiscalProfile.situation)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre d'enfants</label>
                  <p className="text-white font-medium">{fiscalProfile.children}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Régime</label>
                  <p className="text-white font-medium">{getRegimeLabel(fiscalProfile.regime)}</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Profession</label>
                <p className="text-white font-medium">{fiscalProfile.profession}</p>
              </div>
            </div>

            {/* Revenus */}
            <div className="bg-[#1a2332] rounded-xl border border-[#c5a572]/20 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Revenus annuels</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fiscalProfile.revenus.salaires && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Salaires</label>
                    <p className="text-white font-medium">{formatAmount(fiscalProfile.revenus.salaires)}</p>
                  </div>
                )}
                
                {fiscalProfile.revenus.financier && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Revenus financiers</label>
                    <p className="text-white font-medium">{formatAmount(fiscalProfile.revenus.financier)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Patrimoine */}
            <div className="bg-[#1a2332] rounded-xl border border-[#c5a572]/20 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Patrimoine</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fiscalProfile.patrimoine.immobilier && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Patrimoine immobilier</label>
                    <p className="text-white font-medium">{formatAmount(fiscalProfile.patrimoine.immobilier)}</p>
                  </div>
                )}
                
                {fiscalProfile.patrimoine.financier && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Patrimoine financier</label>
                    <p className="text-white font-medium">{formatAmount(fiscalProfile.patrimoine.financier)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Optimisations */}
            <div className="bg-[#1a2332] rounded-xl border border-[#c5a572]/20 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Stratégies d'optimisation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fiscalProfile.optimisations.map((optim, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">{optim}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-[#0A192F] rounded-lg border border-[#c5a572]/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium mb-1">Conseil Francis</h4>
                    <p className="text-gray-400 text-sm">
                      Avec votre profil fiscal, vous pourriez économiser jusqu'à 3 200€ d'impôts par an 
                      en optimisant votre PEA et en diversifiant vos investissements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
