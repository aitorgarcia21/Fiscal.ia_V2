import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type FrancisContextType = {
  isFrancisVisible: boolean;
  showFrancis: () => void;
  hideFrancis: () => void;
  toggleFrancis: () => void;
};

const FrancisContext = createContext<FrancisContextType | undefined>(undefined);

export const FrancisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isFrancisVisible, setIsFrancisVisible] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Au premier chargement, on vérifie si l'utilisateur a déjà masqué le bouton
  useEffect(() => {
    const hidden = localStorage.getItem('francisHidden') === 'true';
    setIsFrancisVisible(!hidden);
    setIsInitialized(true);
  }, []);

  const showFrancis = () => {
    setIsFrancisVisible(true);
    localStorage.setItem('francisHidden', 'false');
  };

  const hideFrancis = () => {
    setIsFrancisVisible(false);
    localStorage.setItem('francisHidden', 'true');
  };

  const toggleFrancis = () => {
    setIsFrancisVisible(prev => {
      const newValue = !prev;
      localStorage.setItem('francisHidden', String(!newValue));
      return newValue;
    });
  };

  if (!isInitialized) return <>{children}</>;

  return (
    <FrancisContext.Provider value={{ isFrancisVisible, showFrancis, hideFrancis, toggleFrancis }}>
      {children}
    </FrancisContext.Provider>
  );
};

export const useFrancis = (): FrancisContextType => {
  const context = useContext(FrancisContext);
  if (context === undefined) {
    throw new Error('useFrancis must be used within a FrancisProvider');
  }
  return context;
};
