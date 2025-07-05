import React from 'react';
import { Country, useCountry } from '../contexts/CountryContext';

interface CountrySelectorProps {
  className?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ 
  className 
}) => {
  const { country, setCountry } = useCountry();

  return (
    <select
      value={country}
      onChange={(e) => setCountry(e.target.value as Country)}
      className={`bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c5a572] hover:border-[#c5a572]/50 transition-colors cursor-pointer ${className || ''}`}
      aria-label="Sélection de la juridiction fiscale"
    >
      <option value="FR" className="bg-[#162238] text-white">🇫🇷 République Française</option>
      <option value="CH" className="bg-[#162238] text-white">🇨🇭 Confédération Helvétique</option>
      <option value="AD" className="bg-[#162238] text-white">🇦🇩 Principauté d'Andorre</option>
      <option value="LU" className="bg-[#162238] text-white">🇱🇺 Grand-Duché de Luxembourg</option>
    </select>
  );
}; 