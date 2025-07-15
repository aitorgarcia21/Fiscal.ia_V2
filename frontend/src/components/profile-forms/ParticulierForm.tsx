import React from 'react';
import { User, Home, Users, DollarSign } from 'lucide-react';

interface ParticulierFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export function ParticulierForm({ formData, handleChange }: ParticulierFormProps) {
  const inputStyles = "block w-full px-3 py-2 bg-[#0A192F]/70 border border-[#3E5F8A]/80 rounded-md shadow-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#88C0D0] focus:border-[#88C0D0] sm:text-sm transition-colors";
  const labelStyles = "block text-sm font-medium text-gray-300 mb-1";
  const sectionStyles = "space-y-6 bg-[#0E2444]/40 p-6 rounded-xl shadow-lg border border-[#2A3F6C]/50";
  const sectionHeaderStyles = "text-xl font-semibold text-white mb-4";

  return (
    <div className="space-y-8">
      {/* Identité */}
      <section className={sectionStyles}>
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-[#c5a572]" />
          <h3 className={sectionHeaderStyles}>Identité</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="civilite_client" className={labelStyles}>Civilité</label>
            <select 
              id="civilite_client" 
              name="civilite_client" 
              value={formData.civilite_client} 
              onChange={handleChange} 
              className={inputStyles}
            >
              <option value="M.">M.</option>
              <option value="Mme">Mme</option>
              <option value="Mlle">Mlle</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="nom_client" className={labelStyles}>Nom *</label>
            <input 
              id="nom_client" 
              type="text" 
              name="nom_client" 
              value={formData.nom_client} 
              onChange={handleChange} 
              required 
              className={inputStyles} 
            />
          </div>
          
          <div>
            <label htmlFor="prenom_client" className={labelStyles}>Prénom *</label>
            <input 
              id="prenom_client" 
              type="text" 
              name="prenom_client" 
              value={formData.prenom_client} 
              onChange={handleChange} 
              required 
              className={inputStyles} 
            />
          </div>
          
          <div>
            <label htmlFor="date_naissance_client" className={labelStyles}>Date de naissance</label>
            <input 
              id="date_naissance_client" 
              type="date" 
              name="date_naissance_client" 
              value={formData.date_naissance_client} 
              onChange={handleChange} 
              className={inputStyles} 
            />
          </div>
        </div>
      </section>

      {/* Coordonnées */}
      <section className={sectionStyles}>
        <div className="flex items-center gap-3 mb-6">
          <Home className="w-6 h-6 text-[#c5a572]" />
          <h3 className={sectionHeaderStyles}>Coordonnées</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email_client" className={labelStyles}>Email</label>
            <input 
              id="email_client" 
              type="email" 
              name="email_client" 
              value={formData.email_client} 
              onChange={handleChange} 
              className={inputStyles} 
            />
          </div>
          
          <div>
            <label htmlFor="telephone_principal_client" className={labelStyles}>Téléphone</label>
            <input 
              id="telephone_principal_client" 
              type="tel" 
              name="telephone_principal_client" 
              value={formData.telephone_principal_client} 
              onChange={handleChange} 
              className={inputStyles} 
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label htmlFor="adresse_postale_client" className={labelStyles}>Adresse</label>
          <input 
            id="adresse_postale_client" 
            type="text" 
            name="adresse_postale_client" 
            value={formData.adresse_postale_client} 
            onChange={handleChange} 
            className={inputStyles} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="code_postal_client" className={labelStyles}>Code postal</label>
            <input 
              id="code_postal_client" 
              type="text" 
              name="code_postal_client" 
              value={formData.code_postal_client} 
              onChange={handleChange} 
              className={inputStyles} 
            />
          </div>
          
          <div>
            <label htmlFor="ville_client" className={labelStyles}>Ville</label>
            <input 
              id="ville_client" 
              type="text" 
              name="ville_client" 
              value={formData.ville_client} 
              onChange={handleChange} 
              className={inputStyles} 
            />
          </div>
        </div>
      </section>

      {/* Situation familiale */}
      <section className={sectionStyles}>
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-[#c5a572]" />
          <h3 className={sectionHeaderStyles}>Situation familiale</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="situation_maritale_client" className={labelStyles}>Situation maritale</label>
            <select 
              id="situation_maritale_client" 
              name="situation_maritale_client" 
              value={formData.situation_maritale_client} 
              onChange={handleChange} 
              className={inputStyles}
            >
              <option value="Célibataire">Célibataire</option>
              <option value="Marié(e)">Marié(e)</option>
              <option value="Pacsé(e)">Pacsé(e)</option>
              <option value="Divorcé(e)">Divorcé(e)</option>
              <option value="Veuf(ve)">Veuf(ve)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="nombre_enfants_a_charge_client" className={labelStyles}>Nombre d'enfants à charge</label>
            <input 
              id="nombre_enfants_a_charge_client" 
              type="number" 
              name="nombre_enfants_a_charge_client" 
              value={formData.nombre_enfants_a_charge_client} 
              onChange={handleChange} 
              min="0" 
              className={inputStyles} 
            />
          </div>
        </div>
      </section>

      {/* Revenus */}
      <section className={sectionStyles}>
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-6 h-6 text-[#c5a572]" />
          <h3 className={sectionHeaderStyles}>Revenus</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profession_client1" className={labelStyles}>Profession</label>
            <input 
              id="profession_client1" 
              type="text" 
              name="profession_client1" 
              value={formData.profession_client1} 
              onChange={handleChange} 
              className={inputStyles} 
            />
          </div>
          
          <div>
            <label htmlFor="revenu_net_annuel_client1" className={labelStyles}>Revenu net annuel</label>
            <input 
              id="revenu_net_annuel_client1" 
              type="text" 
              name="revenu_net_annuel_client1" 
              value={formData.revenu_net_annuel_client1} 
              onChange={handleChange} 
              placeholder="Ex: 50000" 
              className={inputStyles} 
            />
          </div>
        </div>
      </section>
    </div>
  );
} 