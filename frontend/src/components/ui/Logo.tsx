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
        
        {/* Bulle de chat simple */}
        <path 
          d="M8 12C8 9.79086 9.79086 8 12 8H28C30.2091 8 32 9.79086 32 12V24C32 26.2091 30.2091 28 28 28H20L16 32L12 28H8C5.79086 28 4 26.2091 4 24V12C4 9.79086 5.79086 8 8 8Z" 
          fill="none" 
          stroke="#c5a572" 
          strokeWidth="2"
        />
        
        {/* Symbole euro simple */}
        <text x="20" y="22" fontFamily="Arial, sans-serif" fontSize="12" fill="#c5a572" textAnchor="middle">€</text>
      </svg>
    </div>
  );
} 