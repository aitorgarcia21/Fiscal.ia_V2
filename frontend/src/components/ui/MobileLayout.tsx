import React from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// Layout principal optimisé pour mobile
export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`
      min-h-screen bg-gradient-to-br from-[#1a2942] via-[#223c63] to-[#234876]
      text-gray-100 font-sans
      p-4 sm:p-6
      ${className}
    `}>
      {children}
    </div>
  );
};

// Container avec padding adaptatif
export const MobileContainer: React.FC<MobileLayoutProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`
      max-w-7xl mx-auto
      px-4 sm:px-6 lg:px-8
      ${className}
    `}>
      {children}
    </div>
  );
};

// Header mobile optimisé
export const MobileHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <header className={`
      bg-[#162238]/90 backdrop-blur-lg
      border-b border-[#2A3F6C]/50 shadow-lg
      sticky top-0 z-40
      ${className}
    `}>
      <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {children}
      </div>
    </header>
  );
};

// Navigation mobile en bas d'écran
export const MobileBottomNav: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <nav className={`
      fixed bottom-0 left-0 right-0 z-50
      bg-[#162238]/95 backdrop-blur-lg
      border-t border-[#2A3F6C]/50
      md:hidden /* Caché sur desktop */
      ${className}
    `}>
      <div className="flex items-center justify-around py-2">
        {children}
      </div>
    </nav>
  );
};

// Zone de contenu avec padding pour la navigation mobile
export const MobileContent: React.FC<MobileLayoutProps> = ({
  children,
  className = ''
}) => {
  return (
    <main className={`
      pb-20 /* Espace pour la navigation mobile */
      md:pb-0 /* Pas d'espace sur desktop */
      ${className}
    `}>
      {children}
    </main>
  );
};

// Card optimisée pour mobile
export const MobileCard: React.FC<MobileLayoutProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`
      bg-[#1a2332]/60 backdrop-blur-sm
      border border-[#2A3F6C]/30
      rounded-xl p-4 sm:p-6
      shadow-lg
      ${className}
    `}>
      {children}
    </div>
  );
};

// Grille responsive pour mobile
export const MobileGrid: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  children, 
  cols = 1, 
  gap = 'md',
  className = '' 
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  const gridGaps = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div className={`
      grid ${gridCols[cols]} ${gridGaps[gap]}
      ${className}
    `}>
      {children}
    </div>
  );
};