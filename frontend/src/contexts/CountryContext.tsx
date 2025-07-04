import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Country = 'FR' | 'CH' | 'AD';

interface CountryContextType {
  country: Country;
  setCountry: (country: Country) => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

const STORAGE_KEY = 'jurisdiction';

export const CountryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [country, setCountryState] = useState<Country>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'CH' || stored === 'AD') return stored;
    return 'FR';
  });

  const setCountry = (newCountry: Country) => {
    setCountryState(newCountry);
    localStorage.setItem(STORAGE_KEY, newCountry);
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setCountryState(e.newValue as Country);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <CountryContext.Provider value={{ country, setCountry }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = (): CountryContextType => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
}; 