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
        {/* Fond circulaire avec gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#162238" stopOpacity="1" />
            <stop offset="100%" stopColor="#1E3253" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c5a572" stopOpacity="1" />
            <stop offset="100%" stopColor="#e8cfa0" stopOpacity="1" />
          </linearGradient>
        </defs>
        
        {/* Cercle de fond */}
        <circle cx="24" cy="24" r="22" fill="url(#bgGradient)" stroke="url(#goldGradient)" strokeWidth="2"/>
        
        {/* Lettre F stylisée */}
        <path d="M16 12H32V14H18V18H30V20H18V26H32V28H16V12Z" fill="url(#goldGradient)"/>
        
        {/* Éléments décoratifs */}
        <circle cx="36" cy="12" r="3" fill="url(#goldGradient)" opacity="0.6"/>
        <circle cx="12" cy="36" r="2" fill="url(#goldGradient)" opacity="0.4"/>
      </svg>
    </div>
  );
} 