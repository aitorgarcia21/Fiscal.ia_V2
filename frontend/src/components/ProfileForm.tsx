import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Home, Briefcase, Users, Calendar, MapPin, Globe, FileText, Building, UserCheck, CreditCard, PieChart, Target, Clock } from 'lucide-react';

interface ProfileFormProps {
  profile: any;
  onUpdate: (field: string, value: any) => void;
  onSave: () => void;
  isSaving: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onUpdate, onSave, isSaving }) => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Général', icon: User },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'professional', label: 'Professionnel', icon: Briefcase },
    { id: 'financial', label: 'Financier', icon: CreditCard },
    { id: 'goals', label: 'Objectifs', icon: Target },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    onUpdate(name, type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Navigation onglets */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[#2a3f6c]/30 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a2332]/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Formulaire principal */}
      <div className="space-y-6">
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Civilité</label>
                <select
                  name="civilite"
                  value={profile.civilite || ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
                >
                  <option value="M.">M.</option>
                  <option value="Mme">Mme</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  value={profile.prenom || ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={profile.nom || ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date de naissance</label>
                <input
                  type="date"
                  name="date_naissance"
                  value={profile.date_naissance || ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Situation familiale</label>
                <select
                  name="situation_familiale"
                  value={profile.situation_familiale || ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  <option value="celibataire">Célibataire</option>
                  <option value="marie">Marié(e)</option>
                  <option value="pacs">PACS</option>
                  <option value="divorce">Divorcé(e)</option>
                  <option value="veuf">Veuf/Veuve</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre d'enfants</label>
                <input
                  type="number"
                  name="nombre_enfants"
                  value={profile.nombre_enfants || ''}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email || ''}
                onChange={handleInputChange}
                className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Téléphone</label>
              <input
                type="tel"
                name="telephone"
                value={profile.telephone || ''}
                onChange={handleInputChange}
                className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Adresse</label>
              <input
                type="text"
                name="adresse"
                value={profile.adresse || ''}
                onChange={handleInputChange}
                className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Code postal</label>
              <input
                type="text"
                name="code_postal"
                value={profile.code_postal || ''}
                onChange={handleInputChange}
                className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ville</label>
              <input
                type="text"
                name="ville"
                value={profile.ville || ''}
                onChange={handleInputChange}
                className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
              />
            </div>
          </div>
        )}
        
        {activeTab === 'professional' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Profession</label>
              <input
                type="text"
                name="profession"
                value={profile.profession || ''}
                onChange={handleInputChange}
                className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Entreprise</label>
              <input
                type="text"
                name="entreprise"
                value={profile.entreprise || ''}
                onChange={handleInputChange}
                className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Secteur d'activité</label>
              <input
                type="text"
                name="secteur_activite"
                value={profile.secteur_activite || ''}
                onChange={handleInputChange}
                className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
              />
            </div>
          </div>
        )}
        
        {activeTab === 'financial' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Revenu annuel (€)</label>
              <input
                type="number"
                name="revenu_annuel"
                value={profile.revenu_annuel || ''}
                onChange={handleInputChange}
                min="0"
                step="1000"
                className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Situation fiscale</label>
              <select
                name="situation_fiscale"
                value={profile.situation_fiscale || ''}
                onChange={handleInputChange}
                className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
              >
                <option value="">Sélectionner...</option>
                <option value="célibataire">Célibataire</option>
                <option value="marié">Marié(e)</option>
                <option value="pacsé">PACSé(e)</option>
                <option value="veuf">Veuf/Veuve</option>
              </select>
            </div>
          </div>
        )}
        
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Objectifs financiers</label>
              <textarea
                name="objectifs_financiers"
                value={profile.objectifs_financiers || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
                placeholder="Décrivez vos objectifs financiers..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Horizon d'investissement</label>
              <select
                name="horizon_investissement"
                value={profile.horizon_investissement || ''}
                onChange={handleInputChange}
                className="w-full bg-[#1a2332] border border-[#2a3f6c] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
              >
                <option value="">Sélectionner...</option>
                <option value="court_terme">Court terme (moins de 3 ans)</option>
                <option value="moyen_terme">Moyen terme (3 à 7 ans)</option>
                <option value="long_terme">Long terme (plus de 7 ans)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tolérance au risque</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="risque_faible"
                    name="tolerance_risque"
                    value="faible"
                    checked={profile.tolerance_risque === 'faible'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#c5a572] focus:ring-[#c5a572] border-[#2a3f6c]"
                  />
                  <label htmlFor="risque_faible" className="ml-2 block text-sm text-gray-300">
                    Faible - Sécurité du capital
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="risque_moyen"
                    name="tolerance_risque"
                    value="moyen"
                    checked={profile.tolerance_risque === 'moyen'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#c5a572] focus:ring-[#c5a572] border-[#2a3f6c]"
                  />
                  <label htmlFor="risque_moyen" className="ml-2 block text-sm text-gray-300">
                    Moyen - Équilibre entre sécurité et rendement
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="risque_eleve"
                    name="tolerance_risque"
                    value="eleve"
                    checked={profile.tolerance_risque === 'eleve'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#c5a572] focus:ring-[#c5a572] border-[#2a3f6c]"
                  />
                  <label htmlFor="risque_eleve" className="ml-2 block text-sm text-gray-300">
                    Élevé - Recherche de rendement maximum
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bouton de sauvegarde */}
      <div className="pt-6 border-t border-[#2a3f6c]/30">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#162238] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#162238]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sauvegarde en cours...
            </>
          ) : (
            'Enregistrer les modifications'
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileForm;
