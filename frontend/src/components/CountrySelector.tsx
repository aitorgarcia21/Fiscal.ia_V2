import React from 'react';
import { Country, useCountry } from '../contexts/CountryContext';

interface CountrySelectorProps {
  className?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ className }) => {
  const { country, setCountry } = useCountry();

  return (
    <select
      value={country}
      onChange={(e) => setCountry(e.target.value as Country)}
      className={className || 'bg-transparent border border-[#c5a572] rounded px-2 py-1 text-sm'}
      aria-label="Sélection du pays"
    >
      <option value="FR">France 🇫🇷</option>
      <option value="CH">Suisse 🇨🇭</option>
      <option value="AD">Andorre 🇦🇩</option>
    </select>
  );
}; 