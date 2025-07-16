import React from 'react';

interface MobileOptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const MobileOptimizedButton: React.FC<MobileOptimizedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    font-semibold rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    active:scale-95 /* Feedback tactile */
    min-h-[44px] /* Taille minimale pour le touch */
    flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const variants = {
    primary: 'bg-gradient-to-r from-[#c5a572] to-[#e8cfa0] text-[#1a2942] hover:shadow-lg focus:ring-[#c5a572]',
    secondary: 'bg-[#1a2942] text-white hover:bg-[#223c63] focus:ring-[#1a2942]',
    outline: 'border-2 border-[#c5a572] text-[#c5a572] hover:bg-[#c5a572] hover:text-[#1a2942] focus:ring-[#c5a572]',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
};

// Bouton flottant pour mobile
export const FloatingActionButton: React.FC<MobileOptimizedButtonProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <MobileOptimizedButton
      {...props}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full shadow-lg
        md:hidden /* Caché sur desktop */
        ${className}
      `}
    >
      {children}
    </MobileOptimizedButton>
  );
};

// Bouton de navigation mobile
export const MobileNavButton: React.FC<MobileOptimizedButtonProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <MobileOptimizedButton
      {...props}
      variant="outline"
      className={`
        w-full justify-start
        text-left
        ${className}
      `}
    >
      {children}
    </MobileOptimizedButton>
  );
};