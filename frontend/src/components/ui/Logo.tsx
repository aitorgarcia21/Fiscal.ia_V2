import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`relative inline-flex items-center justify-center group ${className}`}>
      <svg 
        className={`${sizeClasses[size]} transition-transform group-hover:scale-110 duration-300`}
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fond avec gradient bleu Francis */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#162238" stopOpacity="1" />
            <stop offset="100%" stopColor="#1E3253" stopOpacity="1" />
          </linearGradient>
        </defs>
        
        {/* Fond bleu */}
        <rect width="48" height="48" fill="url(#bgGradient)"/>
        
        
        {/* Symbole euro simple - Corrigé pour visibilité */}
        <text x="24" y="24" fontFamily="Arial, sans-serif" fontSize="14" fill="#c5a572" textAnchor="middle" dominantBaseline="central">€</text>
      </svg>
    </div>
  );
} 