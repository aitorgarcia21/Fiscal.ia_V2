import React from 'react';
import { User, Briefcase, Building2, TrendingUp, Users, Home, DollarSign, Target } from 'lucide-react';

export type ClientProfile = 'particulier' | 'professionnel' | 'investisseur' | 'entrepreneur';

interface ProfileOption {
  id: ClientProfile;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  features: string[];
}

const profileOptions: ProfileOption[] = [
  {
    id: 'particulier',
    title: 'Particulier',
    description: 'Salarié, retraité, célibataire ou famille',
    icon: User,
    color: 'from-[#0E2444] to-[#162238]',
    features: ['Identité et coordonnées', 'Revenus salariaux', 'Patrimoine basique', 'Situation familiale']
  },
  {
    id: 'professionnel',
    title: 'Professionnel',
    description: 'Artisan, commerçant, profession libérale',
    icon: Briefcase,
    color: 'from-[#c5a572] to-[#e8cfa0]',
    features: ['Activité professionnelle', 'BIC/BNC', 'Optimisations fiscales', 'Entreprise']
  },
  {
    id: 'investisseur',
    title: 'Investisseur',
    description: 'Immobilier locatif, placements financiers',
    icon: TrendingUp,
    color: 'from-[#88C0D0] to-[#81A1C1]',
    features: ['Patrimoine immobilier', 'Placements financiers', 'Fiscalité avancée', 'Optimisations']
  },
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    description: 'Dirigeant, associé, créateur d\'entreprise',
    icon: Building2,
    color: 'from-[#3E5F8A] to-[#2A3F6C]',
    features: ['Société et parts', 'Comptes associés', 'Patrimoine professionnel', 'Transmission']
  }
];

interface ProfileSelectorProps {
  selectedProfile: ClientProfile | null;
  onProfileSelect: (profile: ClientProfile) => void;
}

export function ProfileSelector({ selectedProfile, onProfileSelect }: ProfileSelectorProps) {
  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Quel type de client souhaitez-vous créer ?
        </h2>
        <p className="text-gray-300">
          Francis adaptera automatiquement les champs selon le profil
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {profileOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => onProfileSelect(option.id)}
            className={`group cursor-pointer relative bg-gradient-to-br from-[#1E3253]/80 to-[#2A3F6C]/80 backdrop-blur-sm p-6 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
              selectedProfile === option.id
                ? 'border-[#c5a572] shadow-[#c5a572]/20'
                : 'border-[#2A3F6C]/30 hover:border-[#c5a572]/50'
            }`}
          >
            {/* Fond coloré au hover */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            {/* Header avec icône */}
            <div className="relative flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                <option.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white group-hover:text-[#c5a572] transition-colors duration-300">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  {option.description}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="relative space-y-2">
              {option.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c5a572]"></div>
                  <span className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Badge de sélection */}
            {selectedProfile === option.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-[#c5a572] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#162238] rounded-full"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 