import React from 'react';
import { Country, useCountry } from '../contexts/CountryContext';
import { Globe2 } from 'lucide-react';

interface CountrySelectorProps {
  className?: string;
  showIcon?: boolean;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ 
  className, 
  showIcon = true 
}) => {
  const { country, setCountry } = useCountry();

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {showIcon && (
        <Globe2 className="w-4 h-4 text-[#c5a572]" />
      )}
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value as Country)}
        className="bg-[#162238]/50 border border-[#c5a572]/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c5a572] hover:border-[#c5a572]/50 transition-colors cursor-pointer"
        aria-label="Sélection du pays"
      >
        <option value="FR" className="bg-[#162238] text-white">🇫🇷 France</option>
        <option value="CH" className="bg-[#162238] text-white">🇨🇭 Suisse</option>
        <option value="AD" className="bg-[#162238] text-white">🇦🇩 Andorre</option>
        <option value="LU" className="bg-[#162238] text-white">🇱🇺 Luxembourg</option>
      </select>
    </div>
  );
}; 